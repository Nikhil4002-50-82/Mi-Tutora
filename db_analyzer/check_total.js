import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkOldDocs() {
  const appsSnap = await db.collection('applications').get();
  console.log('Total applications:', appsSnap.size);
  process.exit(0);
}
checkOldDocs().catch(console.error);
