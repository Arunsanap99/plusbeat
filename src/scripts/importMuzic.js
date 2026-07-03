/**
 * importMuzic.js  (Admin SDK version)
 * ─────────────────────────────────────────────────────────────────────────────
 * Imports all MP3 files from C:\Users\HP\Downloads\muzic into:
 *   • Firebase Storage  – uploads the audio file
 *   • Firestore         – stores song metadata
 *
 * PREREQUISITE: You need a Firebase Service Account key JSON.
 *   1. Go to Firebase Console → Project Settings → Service Accounts
 *   2. Click "Generate new private key"
 *   3. Save it as  d:\plusebeat\serviceAccountKey.json
 *
 * Usage (from project root):
 *   node src/scripts/importMuzic.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

// ─── 1. Load Service Account ──────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.resolve('serviceAccountKey.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ Missing serviceAccountKey.json!');
  console.error('');
  console.error('   Steps to get it:');
  console.error('   1. Open Firebase Console → https://console.firebase.google.com');
  console.error('   2. Go to Project Settings → Service Accounts');
  console.error('   3. Click "Generate new private key"');
  console.error(`   4. Save the downloaded file as: ${SERVICE_ACCOUNT_PATH}`);
  console.error('');
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

// ─── 2. Firebase Admin init ───────────────────────────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'plusbeat.firebasestorage.app',
});

const db      = admin.firestore();
const bucket  = admin.storage().bucket();

// ─── 3. Source folder ─────────────────────────────────────────────────────────
const MUZIC_DIR = 'C:\\Users\\HP\\Downloads\\muzic';

// ─── 4. Parse filename → { title, album, artist } ────────────────────────────
function parseFilename(filename) {
  let name = filename.replace(/\.mp3$/i, '');

  // Remove " - Copy" suffixes
  name = name.replace(/(\s*-\s*Copy)+$/i, '').trim();
  // Remove " (1)", " (2)" duplicate suffixes
  name = name.replace(/\s*\(\d+\)$/, '').trim();
  // Remove quality tag: " (128 kbps)"
  name = name.replace(/\s*\(\d+\s*kbps\)/i, '').trim();
  // Decode HTML entities
  name = name.replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

  const dashIdx = name.indexOf(' - ');
  let title  = name;
  let album  = 'Unknown Album';
  let artist = 'Unknown Artist';

  if (dashIdx !== -1) {
    title = name.slice(0, dashIdx).trim();
    album = name.slice(dashIdx + 3).trim();
  }

  // Extract feat. artist from title
  const featMatch = title.match(/\(feat\.\s*([^)]+)\)/i);
  if (featMatch) {
    artist = featMatch[1].trim();
    title  = title.replace(featMatch[0], '').trim();
  }

  return { title, album, artist };
}

// ─── 5. Canonical duplicate key ───────────────────────────────────────────────
function canonicalKey(title, album) {
  return `${title.toLowerCase().trim()}|||${album.toLowerCase().trim()}`;
}

// ─── 6. Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('📂 Reading music folder…');
  const files = fs.readdirSync(MUZIC_DIR).filter((f) => f.toLowerCase().endsWith('.mp3'));
  console.log(`   Found ${files.length} MP3 files.\n`);

  console.log('🔍 Loading existing songs from Firestore to detect duplicates…');
  const existingSnap = await db.collection('songs').get();
  const existingKeys = new Set();
  existingSnap.forEach((docSnap) => {
    const d = docSnap.data();
    if (d.title && d.album) existingKeys.add(canonicalKey(d.title, d.album));
  });
  console.log(`   ${existingKeys.size} songs already in Firestore.\n`);

  let uploaded = 0;
  let skipped  = 0;
  let failed   = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const { title, album, artist } = parseFilename(filename);
    const key = canonicalKey(title, album);

    const label = `[${String(i + 1).padStart(3)}/${files.length}] ${filename.slice(0, 55).padEnd(55)}`;
    process.stdout.write(label + ' ');

    if (existingKeys.has(key)) {
      console.log('⏭  SKIP');
      skipped++;
      continue;
    }

    try {
      // ── Upload to Firebase Storage (Admin SDK) ─────────────────────────────
      const filePath    = path.join(MUZIC_DIR, filename);
      const storageDest = `songs/${filename}`;

      await bucket.upload(filePath, {
        destination: storageDest,
        metadata: { contentType: 'audio/mpeg' },
      });

      // Make publicly accessible and get download URL
      const file = bucket.file(storageDest);
      await file.makePublic();
      const downloadURL = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(storageDest)}`;

      // ── Write to Firestore ─────────────────────────────────────────────────
      await db.collection('songs').add({
        title,
        album,
        artist,
        url:         downloadURL,
        storagePath: storageDest,
        filename,
        duration:    null,
        plays:       0,
        likes:       0,
        createdAt:   admin.firestore.FieldValue.serverTimestamp(),
        importedAt:  new Date().toISOString(),
      });

      existingKeys.add(key);
      console.log('✅ OK');
      uploaded++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  console.log('\n──────────────────────────────────────────');
  console.log('🎉 Import complete!');
  console.log(`   ✅ Uploaded : ${uploaded}`);
  console.log(`   ⏭  Skipped  : ${skipped}`);
  console.log(`   ❌ Failed   : ${failed}`);
  console.log('──────────────────────────────────────────');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
