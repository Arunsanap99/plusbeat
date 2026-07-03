import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// ─── 1. Load Environment Variables ───────────────────────────────────────────
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const firebaseConfig = {
  apiKey:             env.VITE_FIREBASE_API_KEY,
  authDomain:         env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:          env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:      env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:              env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = 'temp_deletor@pulsebeat.app';
const password = 'deletor123';

const SONGS_DIR = './src/songs';

// ─── 2. Parse filename → { title, album, artist } ────────────────────────────
function parseFilename(filename) {
  let name = filename.replace(/\.mp3$/i, '');
  name = name.replace(/(\s*-\s*Copy)+$/i, '').trim();
  name = name.replace(/\s*\(\d+\)$/, '').trim();
  name = name.replace(/\s*\(\d+\s*kbps\)/i, '').trim();
  name = name.replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

  const dashIdx = name.indexOf(' - ');
  let title  = name;
  let album  = 'Unknown Album';
  let artist = 'Unknown Artist';

  if (dashIdx !== -1) {
    title = name.slice(0, dashIdx).trim();
    album = name.slice(dashIdx + 3).trim();
  }

  const featMatch = title.match(/\(feat\.\s*([^)]+)\)/i);
  if (featMatch) {
    artist = featMatch[1].trim();
    title  = title.replace(featMatch[0], '').trim();
  }

  return { title: title.trim(), album: album.trim(), artist: artist.trim() };
}

// ─── 3. Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('📂 Scanning local songs directory...');
  if (!fs.existsSync(SONGS_DIR)) {
    console.error(`❌ Dir ${SONGS_DIR} does not exist!`);
    process.exit(1);
  }

  const files = fs.readdirSync(SONGS_DIR).filter(f => f.toLowerCase().endsWith('.mp3'));
  console.log(`   Found ${files.length} local MP3 files.`);

  console.log(`🚀 Authenticating with Firebase Auth as ${email}...`);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log(`✅ Authenticated successfully: ${cred.user.uid}`);

  const songsCol = collection(db, 'songs');

  console.log('🔍 Fetching existing songs from Firestore database to detect duplicates...');
  const snapshot = await getDocs(songsCol);
  const existingTitles = new Set();
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.title) {
      existingTitles.add(data.title.toLowerCase().trim());
    }
  });
  console.log(`   Found ${existingTitles.size} songs already in the database.`);

  // Parse and deduplicate by title, and filter out already-existing titles
  const songsMap = new Map();
  files.forEach(file => {
    const { title, album, artist } = parseFilename(file);
    const key = title.toLowerCase().trim();
    
    if (existingTitles.has(key)) {
      // Already uploaded
      return;
    }

    if (!songsMap.has(key)) {
      songsMap.set(key, {
        title,
        album,
        artist,
        audioUrl: `/src/songs/${file}`,
        duration: 0,
        coverImage: ''
      });
    }
  });

  const songsToUpload = Array.from(songsMap.values());
  console.log(`   Identified ${songsToUpload.length} new songs to add.`);

  if (songsToUpload.length === 0) {
    console.log('🎉 Database is already up to date! No new songs to upload.');
    process.exit(0);
  }

  console.log(`Writing ${songsToUpload.length} new songs to Firestore collection...`);

  let batch = writeBatch(db);
  let operationCount = 0;

  for (let i = 0; i < songsToUpload.length; i++) {
    const song = songsToUpload[i];
    const newDocRef = doc(songsCol); // auto-generate ID
    batch.set(newDocRef, song);
    operationCount++;

    if (operationCount % 500 === 0 || i === songsToUpload.length - 1) {
      console.log(`   Committing batch: ${operationCount}/${songsToUpload.length}...`);
      await batch.commit();
      batch = writeBatch(db);
    }
  }

  console.log(`🎉 Success! Synchronized database. Added ${operationCount} new songs.`);
}

main().catch(console.error);
