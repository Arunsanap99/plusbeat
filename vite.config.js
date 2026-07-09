import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const virtualModuleId = 'virtual:local-songs'
const resolvedVirtualModuleId = '\0' + virtualModuleId

let isBuild = false

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'copy-songs-to-dist',
      closeBundle() {
        const srcDir = path.resolve(__dirname, 'src/songs');
        const destDir = path.resolve(__dirname, 'dist/src/songs');
        if (fs.existsSync(srcDir)) {
          fs.mkdirSync(destDir, { recursive: true });
          const files = fs.readdirSync(srcDir);
          for (const file of files) {
            fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
          }
          console.log(`Copied ${files.length} songs to dist/src/songs`);
        }
      }
    },
    // Virtual module plugin to conditionally enable/disable local songs scan
    {
      name: 'virtual-local-songs',
      configResolved(config) {
        isBuild = config.command === 'build';
      },
      resolveId(id) {
        if (id === virtualModuleId) {
          return resolvedVirtualModuleId;
        }
        return null;
      },
      load(id) {
        if (id === resolvedVirtualModuleId) {
          if (isBuild) {
            // In production build, do not scan songs directory at all
            return 'export const modules = {};';
          } else {
            // In development mode, scan and eagerly import asset URLs
            return `export const modules = import.meta.glob('/src/songs/*.mp3', { query: '?url', import: 'default', eager: true });`;
          }
        }
        return null;
      }
    },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/i\.scdn\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'spotify-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 }
            }
          },
          {
            urlPattern: /^https:\/\/picsum\.photos\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'placeholder-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }
            }
          }
        ]
      },
      manifest: {
        name: 'PulseBeat - Premium Music Streaming',
        short_name: 'PulseBeat',
        description: 'Premium music streaming platform with synced rooms, AI recommendations, and offline playback',
        theme_color: '#0d0d12',
        background_color: '#0d0d12',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/howler')) {
            return 'vendor-audio';
          }
          if (id.includes('node_modules/swiper') || id.includes('node_modules/react-icons')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/@tanstack') || id.includes('node_modules/zustand')) {
            return 'vendor-query';
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500,
  }
})
