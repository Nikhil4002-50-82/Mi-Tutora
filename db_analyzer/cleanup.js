import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = './tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`ERROR: Service account key not found at ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function cleanup() {
  console.log('Starting cleanup...');

  // 1. Students
  console.log('Cleaning up students...');
  const studentsSnap = await db.collection('students').get();
  let studentCount = 0;
  for (const doc of studentsSnap.docs) {
    const updateObj = {};
    const data = doc.data();
    if (data.address !== undefined) updateObj.address = FieldValue.delete();
    if (data.preferredMode !== undefined) updateObj.preferredMode = FieldValue.delete();
    if (data.daysPerWeek !== undefined) updateObj.daysPerWeek = FieldValue.delete();
    if (data.hoursPerDay !== undefined) updateObj.hoursPerDay = FieldValue.delete();
    if (data.specificDays !== undefined) updateObj.specificDays = FieldValue.delete();
    
    if (Object.keys(updateObj).length > 0) {
      await doc.ref.update(updateObj);
      studentCount++;
    }
  }
  console.log(`Updated ${studentCount} students.`);

  // 2. Parents
  console.log('Cleaning up parents...');
  const parentsSnap = await db.collection('parents').get();
  let parentCount = 0;
  for (const doc of parentsSnap.docs) {
    const updateObj = {};
    const data = doc.data();
    if (data.address !== undefined) updateObj.address = FieldValue.delete();
    if (data.preferredMode !== undefined) updateObj.preferredMode = FieldValue.delete();
    
    if (Object.keys(updateObj).length > 0) {
      await doc.ref.update(updateObj);
      parentCount++;
    }
  }
  console.log(`Updated ${parentCount} parents.`);

  // 3. Applications
  console.log('Cleaning up applications...');
  const appsSnap = await db.collection('applications').get();
  let appCount = 0;
  for (const doc of appsSnap.docs) {
    const updateObj = {};
    const data = doc.data();
    if (data.mode !== undefined) updateObj.mode = FieldValue.delete();
    
    if (Object.keys(updateObj).length > 0) {
      await doc.ref.update(updateObj);
      appCount++;
    }
  }
  console.log(`Updated ${appCount} applications.`);

  console.log('Cleanup complete!');
}

cleanup().catch(console.error);
