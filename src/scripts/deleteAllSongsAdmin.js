/**
 * deleteAllSongsAdmin.js
 * Deletes ALL documents from the Firestore 'songs' collection using Admin SDK.
 * Uses batch deletes of 500 for speed.
 *
 * Usage:  node src/scripts/deleteAllSongsAdmin.js
 * Needs:  serviceAccountKey.json in project root  (OR falls back to .env creds)
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

// ─── Load credentials ─────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.resolve('serviceAccountKey.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  // Fall back: init with application default or env-based approach won't work
  // without a key — tell the user.
  console.error('❌ serviceAccountKey.json not found.');
  console.error('   Get it from Firebase Console → Project Settings → Service Accounts → Generate new private key');
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// ─── Delete in batches of 500 ─────────────────────────────────────────────────
async function deleteCollection(collectionName) {
  let totalDeleted = 0;

  while (true) {
    const snap = await db.collection(collectionName).limit(500).get();
    if (snap.empty) break;

    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();

    totalDeleted += snap.docs.length;
    console.log(`  🗑  Deleted ${totalDeleted} so far…`);
  }

  return totalDeleted;
}

async function main() {
  console.log('\n🔥 Connecting to Firestore…');
  console.log('📊 Counting songs…');

  const countSnap = await db.collection('songs').count().get();
  const total = countSnap.data().count;
  console.log(`   Found ${total} songs in Firestore.\n`);

  if (total === 0) {
    console.log('✅ Collection is already empty. Nothing to delete.');
    process.exit(0);
  }

  console.log('🗑  Deleting all songs in batches of 500…');
  const deleted = await deleteCollection('songs');

  console.log(`\n✅ Done! Deleted ${deleted} songs from Firestore.\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Error:', err.message);
  process.exit(1);
});
