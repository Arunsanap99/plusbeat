<p align="center">
  <img src="./public/logo.png" alt="PulseBeat Logo" width="140" />
</p>

<h1 align="center">PulseBeat</h1>

<p align="center">
  <b>A premium, dark-themed music streaming web app</b><br/>
  Built with React 19, Firebase, Howler.js and Vite 8
</p>

<p align="center">
  <a href="https://github.com/Arunsanap99/plusbeat/stargazers"><img src="https://img.shields.io/github/stars/Arunsanap99/plusbeat?style=for-the-badge&color=FFD700&labelColor=0d0d12&logo=github" alt="Stars"/></a>
  <a href="https://github.com/Arunsanap99/plusbeat/issues"><img src="https://img.shields.io/github/issues/Arunsanap99/plusbeat?style=for-the-badge&color=FF6B6B&labelColor=0d0d12&logo=github" alt="Issues"/></a>
  <a href="https://github.com/Arunsanap99/plusbeat/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge&labelColor=0d0d12" alt="License"/></a>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0d0d12" alt="React"/>
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=white&labelColor=0d0d12" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=0d0d12" alt="Vite"/>
  <img src="https://img.shields.io/badge/Howler.js-Audio-1DB954?style=for-the-badge&labelColor=0d0d12" alt="Howler"/>
  <img src="https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white&labelColor=0d0d12" alt="Netlify"/>
</p>

<br/>

> **PulseBeat** is a full-featured, Spotify-inspired music streaming web application with dark aesthetics, fuzzy search, playlist management, Firebase authentication, and a smooth bottom audio player — deployable on both Firebase Hosting and Netlify.

---

## Features

| | Feature | Description |
|---|---|---|
| Audio | **Full Audio Player** | Play, pause, skip, seek, volume, playback speed 0.5x to 2x |
| Search | **Fuzzy Search** | Fuse.js powered search with real-time character match highlighting |
| Library | **Song Library** | Thousands of songs streamed from Firebase Firestore |
| Playlists | **Playlist Manager** | Create, rename, delete playlists — saved to localStorage |
| Auth | **Authentication** | Google OAuth one-click login + Phone OTP (Firebase Auth) |
| UI | **Fully Responsive** | Mobile-first with animated drawer sidebar on small screens |
| Performance | **Blazing Fast** | Vite 8 + React 19, code-splitting, lazy chunk loading |
| Filter | **Sort and Filter** | Sort by title, artist, album — filter songs by artist pills |
| PWA | **Offline Ready** | Progressive Web App with service worker caching |
| Deploy | **Multi-platform** | Firebase Hosting + Netlify with auto-deploy from Git |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Framer Motion |
| State | Zustand |
| Audio Engine | Howler.js (HTML5, CORS-safe, stream-optimized) |
| Search | Fuse.js (fuzzy, weighted, highlighted) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google OAuth + Phone OTP + reCAPTCHA) |
| Styling | Vanilla CSS with CSS Variables — dark theme |
| Build | Vite 8 |
| PWA | vite-plugin-pwa (Workbox service worker + Web Manifest) |
| Icons | react-icons (Feather, Lucide sets) |
| Deployment | Firebase Hosting, Netlify |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Firebase project with **Firestore** and **Authentication** enabled

### 1 — Clone the repo

```bash
git clone https://github.com/Arunsanap99/plusbeat.git
cd plusbeat
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Set up environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

> The `.env` file is already in `.gitignore` — never commit it.

### 4 — Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Seeding Your Music Library to Firestore

To sync your local MP3 collection to Firebase Firestore, run:

```bash
node src/scripts/insertAllSongs.js
```

The script will:
- Scan all `.mp3` files in `src/songs/`
- Auto-parse filenames into `title`, `album`, and `artist`
- Deduplicate by title (no double entries)
- Write only new songs to the `songs` Firestore collection in batches of 500

---

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy
```

Make sure `.firebaserc` sets `plusbeat` as the default project (already configured).

### Netlify (Auto-deploy via Git — Recommended)

1. Connect your GitHub repo to Netlify
2. Netlify reads `netlify.toml` — build command and publish directory are already set
3. Add the `VITE_FIREBASE_*` variables in **Netlify > Site Settings > Environment Variables**
4. Push to `main` — Netlify builds and deploys automatically

### Netlify CLI (manual)

```bash
npm run build
npx netlify-cli deploy --prod
```

---

## Project Structure

```
plusbeat/
├── public/
│   ├── logo.png              # App logo
│   └── favicon.svg           # Browser favicon
├── src/
│   ├── components/
│   │   ├── AudioPlayer.jsx   # Fixed bottom player bar (play/pause/seek/speed/volume)
│   │   └── AuthModal.jsx     # Sign-in modal (Google OAuth + Phone OTP)
│   ├── pages/
│   │   ├── Home.jsx          # Library view: search, sort, filter, playlist add
│   │   └── Search.jsx        # Full-page search experience
│   ├── store/
│   │   ├── playerStore.js    # Audio engine state (Howler.js + Zustand)
│   │   ├── songsStore.js     # Firestore songs fetching + caching
│   │   ├── playlistStore.js  # Playlist CRUD (localStorage + Zustand)
│   │   └── authStore.js      # Firebase auth state management
│   ├── firebase/
│   │   └── config.js         # Firebase app initialization
│   ├── utils/
│   │   └── localSongs.js     # Vite glob-based local MP3 scanner
│   ├── scripts/              # Node.js admin scripts (seed, delete Firestore)
│   ├── songs/                # Local MP3 files (excluded from Git)
│   └── styles/
│       └── index.css         # Global CSS variables, dark theme, animations
├── .firebaserc               # Firebase active project alias
├── firebase.json             # Firebase Hosting + Firestore rules config
├── netlify.toml              # Netlify build command + SPA redirect rules
├── vite.config.js            # Vite, PWA, virtual songs module, chunk splitting
└── package.json
```

---

## Audio Player Features

- Play and Pause with smooth button transition
- Skip Forward and Backward through the current queue
- Seek Bar with live progress, current time and total duration
- Volume Slider with mute toggle (mute/low/high icon states)
- Playback Speed control: 0.5x, 0.75x, Normal, 1.25x, 1.5x, 2x
- Auto-advance to next song when the current track ends
- Error display when a stream fails to load

---

## Authentication

PulseBeat supports two login methods via **Firebase Authentication**:

| Method | Flow |
|---|---|
| Google Sign-In | One-click OAuth popup — instant account linkage |
| Phone OTP | Enter number → receive SMS → confirm 6-digit code |

User session is persisted automatically and restored on reload.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server at localhost:5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint the codebase with oxlint |
| `firebase deploy` | Deploy to Firebase Hosting |
| `node src/scripts/insertAllSongs.js` | Seed local MP3s to Firestore |

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes and commit: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feat/your-feature`
5. Open a Pull Request against `main`

Please open an issue first for any major changes so we can discuss before implementation.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with love by <a href="https://github.com/Arunsanap99"><b>Arunsanap99</b></a>
  <br/>
  <sub>PulseBeat — Where every beat matters.</sub>
</p>