import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
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
  console.log('Fetching all songs from Firestore to delete...');
  const snapshot = await getDocs(collection(db, 'songs'));
  console.log(`Found ${snapshot.docs.length} songs. Starting deletion...`);

  const docs = snapshot.docs;
  let batch = writeBatch(db);
  let count = 0;

  for (let i = 0; i < docs.length; i++) {
    batch.delete(doc(db, 'songs', docs[i].id));
    count++;

    // Commit batch of 500
    if (count % 500 === 0 || i === docs.length - 1) {
      console.log(`Committing batch deletion: ${count}/${docs.length}...`);
      await batch.commit();
      batch = writeBatch(db);
    }
  }

  console.log(`🎉 Successfully deleted all ${count} songs from the Firestore database!`);
}

main().catch(console.error);
