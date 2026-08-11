import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, 'tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: Service account key not found at', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const isExecuteMode = process.argv.includes('--execute');

async function runMigration() {
  console.log(`--- STARTING PHASE ${isExecuteMode ? '2: EXECUTION' : '1: DATABASE AUDIT (DRY RUN)'} ---\n`);
  const usersSnapshot = await db.collection('users').get();
  
  const emailMap = new Map();
  let totalUsers = 0;

  usersSnapshot.forEach(doc => {
    totalUsers++;
    const data = doc.data();
    const email = data.email;
    
    if (email) {
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email).push({ id: doc.id, data, ref: doc.ref });
    }
  });

  console.log(`Total user documents scanned: ${totalUsers}\n`);

  let duplicateDeleteCount = 0;
  let missingRolesCount = 0;
  let manualReviewRequired = false;

  console.log('--- PROCESSING DUPLICATES ---');
  for (const [email, docs] of emailMap.entries()) {
    if (docs.length > 1) {
      console.log(`\nEmail: ${email} (Has ${docs.length} documents)`);
      
      let docsToKeep = [];
      let docsToDelete = [];

      docs.forEach((doc, index) => {
        const hasProfile = doc.data.hasProfile;
        console.log(`  [Doc ${index + 1}] ID: ${doc.id} | hasProfile: ${hasProfile} | Role: ${doc.data.role} | Roles Array: ${JSON.stringify(doc.data.roles || 'MISSING')}`);
        
        if (hasProfile === false) {
          docsToDelete.push(doc);
        } else {
          docsToKeep.push(doc);
        }
      });

      if (docsToKeep.length === 1 && docsToDelete.length > 0) {
        console.log(`  => ACTION: Safe to delete ${docsToDelete.length} orphaned documents where hasProfile is false.`);
        if (isExecuteMode) {
          for (const doc of docsToDelete) {
            await doc.ref.delete();
            console.log(`     [DELETED] Document ${doc.id}`);
            duplicateDeleteCount++;
          }
        }
        // Update the map so the next step (roles array) only sees the kept document
        emailMap.set(email, docsToKeep);
      } else {
        console.log(`  => ACTION REQUIRED: Unable to safely resolve automatically. (Kept: ${docsToKeep.length}, ToDelete: ${docsToDelete.length})`);
        manualReviewRequired = true;
      }
    }
  }

  if (duplicateDeleteCount === 0 && !manualReviewRequired) {
    console.log('No actionable duplicates found.');
  }

  console.log('\n--- PROCESSING LEGACY SCHEMA (MISSING ROLES ARRAY) ---');
  for (const [email, docs] of emailMap.entries()) {
    if (docs.length === 1) {
      const doc = docs[0];
      if (!doc.data.roles) {
        missingRolesCount++;
        const roleStr = doc.data.role || 'student';
        if (isExecuteMode) {
          await doc.ref.update({
            roles: [roleStr]
          });
          console.log(`  [UPDATED] Added roles: ["${roleStr}"] to ID: ${doc.id} (${email})`);
        } else {
          console.log(`  [WILL UPDATE] Add roles: ["${roleStr}"] to ID: ${doc.id} (${email})`);
        }
      }
    }
  }
  
  if (missingRolesCount === 0) {
    console.log('All valid documents already have the roles array!');
  }

  console.log('\n--- SUMMARY ---');
  if (isExecuteMode) {
    console.log(`Documents successfully deleted: ${duplicateDeleteCount}`);
    console.log(`Documents successfully migrated with roles array: ${missingRolesCount}`);
    if (manualReviewRequired) {
      console.log('WARNING: Some duplicates could not be safely resolved and require manual intervention.');
    }
    console.log('EXECUTION COMPLETE.');
  } else {
    console.log(`Documents ready for automated deletion: ${duplicateDeleteCount}`);
    console.log(`Documents ready for roles array migration: ${missingRolesCount}`);
    if (manualReviewRequired) {
      console.log('WARNING: Some duplicates require manual intervention because both have hasProfile=true or neither do.');
    }
    console.log('Run the script with --execute to perform these changes.');
  }
}

runMigration().catch(console.error);
