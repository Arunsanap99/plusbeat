import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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
const db = getFirestore(app);

async function main() {
  console.log('Fetching songs from Firestore...');
  const snapshot = await getDocs(collection(db, 'songs'));
  console.log(`Found ${snapshot.docs.length} songs.`);
  
  const urls = new Set();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const url = data.audioUrl || data.audio_url || '';
    if (url) urls.add(url);
  });
  
  console.log('Distinct Audio URLs in Firestore (first 10):');
  Array.from(urls).slice(0, 10).forEach(u => console.log(` - ${u}`));
}

main().catch(console.error);
