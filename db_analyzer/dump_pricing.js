import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = './tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function dumpPricing() {
  const snapshot = await db.collection('marketplace_pricing').get();
  const pricing = [];
  snapshot.forEach(doc => {
    pricing.push({ id: doc.id, ...doc.data() });
  });
  fs.writeFileSync('./pricing_dump.json', JSON.stringify(pricing, null, 2));
  console.log('Done dumping pricing');
}

dumpPricing();
