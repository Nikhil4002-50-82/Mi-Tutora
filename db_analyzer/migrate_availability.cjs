const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrate() {
  console.log('Fetching applications...');
  const appsSnap = await db.collection('applications').get();
  const lockedStudentIds = new Set();

  appsSnap.forEach(d => {
    const data = d.data();
    if (['tuition_started', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(data.status)) {
      if (data.studentDocId) lockedStudentIds.add(data.studentDocId);
      if (data.studentDocIds) {
        data.studentDocIds.forEach((sid) => lockedStudentIds.add(sid));
      }
    }
  });

  console.log(`Found ${lockedStudentIds.size} locked students. Fetching all students...`);
  const studentsSnap = await db.collection('students').get();
  
  let updatedCount = 0;
  
  // Batch updates for performance
  let batch = db.batch();
  let batchCount = 0;
  
  for (const d of studentsSnap.docs) {
    const isAvailable = !lockedStudentIds.has(d.id);
    batch.update(d.ref, { isAvailable });
    
    updatedCount++;
    batchCount++;
    
    if (batchCount === 500) {
      await batch.commit();
      console.log(`Updated ${updatedCount} students...`);
      batch = db.batch();
      batchCount = 0;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`Migration complete! Updated ${updatedCount} students successfully.`);
}

migrate().catch(console.error);
