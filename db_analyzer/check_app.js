import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkApp() {
  const appsSnap = await db.collection('applications').limit(5).get();
  console.log('Total applications:', appsSnap.size);
  appsSnap.docs.forEach(d => {
    console.log(d.id, d.data().createdAt, typeof d.data().createdAt);
  });
  process.exit(0);
}
checkApp().catch(console.error);
