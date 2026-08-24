const admin = require('firebase-admin');
const serviceAccount = require('./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function truncateCollection(collectionName) {
    const colRef = db.collection(collectionName);
    const snapshot = await colRef.get();
    
    if (snapshot.empty) {
        console.log(`Collection ${collectionName} is already empty.`);
        return;
    }
    
    let batch = db.batch();
    let count = 0;
    
    for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        count++;
        // Commit batches of 500
        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }
    
    // Commit the remainder
    if (count % 500 !== 0) {
        await batch.commit();
    }
    
    console.log(`Deleted ${count} documents from ${collectionName}.`);
}

async function truncateAuth() {
    console.log("Starting Firebase Authentication truncation...");
    try {
        let nextPageToken;
        let count = 0;
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
            const uids = listUsersResult.users.map(userRecord => userRecord.uid);
            if (uids.length > 0) {
                const deleteResult = await admin.auth().deleteUsers(uids);
                count += deleteResult.successCount;
                if (deleteResult.failureCount > 0) {
                    console.log(`Failed to delete ${deleteResult.failureCount} auth users.`);
                }
            }
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);
        console.log(`Deleted ${count} users from Firebase Authentication.`);
    } catch (error) {
        console.error("Error deleting auth users:", error);
    }
}

async function runTruncation() {
    console.log("Starting full database truncation...");
    const collections = [
        'users',
        'tutors',
        'parents',
        'students',
        'tuition_requests',
        'applications',
        'groups',
        'referrals',
        'notifications'
    ];
    
    for (const col of collections) {
        await truncateCollection(col);
    }
    
    await truncateAuth();
    
    console.log("Truncation complete! All specified collections and auth users are now completely empty.");
}

runTruncation().catch(console.error);
