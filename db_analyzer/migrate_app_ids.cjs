const admin = require('firebase-admin');
const serviceAccount = require('./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

async function migrate() {
    console.log('Starting Migration...');
    let totalUpdated = 0;

    // 1. Update applications
    const appsSnap = await db.collection('applications').get();
    for (const doc of appsSnap.docs) {
        if (!doc.data().applicationDocId) {
            await doc.ref.update({ applicationDocId: doc.id });
            totalUpdated++;
        }
    }
    console.log('Applications migrated.');

    // 2. Update reviews
    const reviewsSnap = await db.collection('reviews').get();
    for (const doc of reviewsSnap.docs) {
        const data = doc.data();
        if (data.applicationId && !data.applicationDocId) {
            await doc.ref.update({
                applicationDocId: data.applicationId,
                applicationId: admin.firestore.FieldValue.delete()
            });
            totalUpdated++;
        }
    }
    console.log('Reviews migrated.');

    // 3. Update payments
    const paymentsSnap = await db.collection('payments').get();
    for (const doc of paymentsSnap.docs) {
        const data = doc.data();
        if (data.applicationId && !data.applicationDocId) {
            await doc.ref.update({
                applicationDocId: data.applicationId,
                applicationId: admin.firestore.FieldValue.delete()
            });
            totalUpdated++;
        }
    }
    console.log('Payments migrated.');

    console.log('Migration complete. Total documents updated:', totalUpdated);
}

migrate().catch(console.error);

