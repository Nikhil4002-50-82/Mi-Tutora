import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkOldDocs() {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  console.log('Checking for applications older than 24 hours...');
  const appsSnap = await db.collection('applications').where('createdAt', '<', dayAgo).limit(10).get();
  console.log('Applications older than 24h:', appsSnap.size);
  if (appsSnap.size > 0) {
    console.log('First old app:', appsSnap.docs[0].data());
  }

  const studentsSnap = await db.collection('students').where('createdAt', '<', dayAgo).limit(10).get();
  console.log('Students older than 24h:', studentsSnap.size);

  const studentsSnap2 = await db.collection('students').get();
  console.log('Total students:', studentsSnap2.size);
  
  process.exit(0);
}
checkOldDocs().catch(console.error);
