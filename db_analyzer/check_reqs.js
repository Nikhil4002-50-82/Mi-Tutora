import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkReqs() {
  const reqsSnap = await db.collection('tuition_requests').get();
  console.log('Total tuition_requests:', reqsSnap.size);
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const oldReqs = await db.collection('tuition_requests').where('createdAt', '<', dayAgo).get();
  console.log('Old tuition_requests (>24h):', oldReqs.size);
  process.exit(0);
}
checkReqs().catch(console.error);
