import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

// Parse .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = 'temp_deletor@pulsebeat.app';
const password = 'deletor123';

const twoSongs = [
  {
    title: 'Neon Horizon (SoundHelix 1)',
    artist: 'Syntax Error',
    album: 'Cybernetic Echoes',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverImage: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=60',
    duration: 372
  },
  {
    title: 'Midnight Drive (SoundHelix 5)',
    artist: 'Retrowave Project',
    album: 'Sunset Boulevard',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
    duration: 312
  }
];

async function main() {
  console.log(`🚀 Authenticating with Firebase Auth as ${email}...`);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  console.log(`✅ Authenticated successfully: ${cred.user.uid}`);

  const songsCol = collection(db, 'songs');
  console.log('Inserting exactly 2 test songs...');

  for (const song of twoSongs) {
    const docRef = await addDoc(songsCol, song);
    console.log(` - Inserted "${song.title}" with ID: ${docRef.id}`);
  }

  console.log('🎉 Done! Exactly 2 songs exist in the database now.');
}

main().catch(console.error);
