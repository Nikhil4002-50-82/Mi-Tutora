const admin = require('firebase-admin');
const fs = require('fs');
const crypto = require('crypto');

const serviceAccountPath = './tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json';
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Custom ID Generator (Matching the new frontend logic)
const generateCustomId = (prefix, providedId) => {
  if (providedId) {
    return `${prefix}-${providedId}`;
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(20);
  let id = prefix + '-';
  for (let i = 0; i < 20; i++) {
      id += chars[bytes[i] % chars.length];
  }
  return id;
};

// Maps to keep track of old IDs to new custom IDs
const idMappings = {
  parents: {},
  tutors: {},
  students: {},
  groups: {},
  requests: {},
  apps: {}
};

async function migrateCollection(collectionName, prefix, mappingDict, useAuthUid = false) {
  console.log(`\n📦 Migrating ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const oldId = doc.id;
    
    // Skip if it already has a hyphen (means it was already migrated to V2)
    if (oldId.includes('-')) {
      console.log(`  - Skipping ${oldId} (Already migrated to V2)`);
      mappingDict[oldId] = oldId;
      continue;
    }

    const data = doc.data();
    let newId;
    if (useAuthUid && data.authUid) {
      newId = generateCustomId(prefix, data.authUid);
    } else {
      newId = generateCustomId(prefix);
    }
    mappingDict[oldId] = newId;

    const newData = {
      ...data,
      id: newId
    };

    // Write new document
    await db.collection(collectionName).doc(newId).set(newData);
    // Delete old document
    await db.collection(collectionName).doc(oldId).delete();
    
    console.log(`  + Migrated ${oldId} -> ${newId}`);
    count++;
  }
  console.log(`✅ Completed ${collectionName}. Migrated ${count} documents.`);
}

async function runMigration() {
  try {
    console.log("🚀 Starting Database ID Migration V2...");

    // 1. Migrate primary collections and generate new IDs
    await migrateCollection('parents', 'MTP', idMappings.parents, true);
    await migrateCollection('tutors', 'MTT', idMappings.tutors, true);
    await migrateCollection('students', 'MTS', idMappings.students, false);
    await migrateCollection('groups', 'MTG', idMappings.groups, false);
    await migrateCollection('tuition_requests', 'REQ', idMappings.requests, false);

    // 2. Migrate Applications (APP) and remap foreign keys
    console.log(`\n📦 Migrating applications...`);
    const appSnap = await db.collection('applications').get();
    let appCount = 0;
    
    for (const doc of appSnap.docs) {
      const oldId = doc.id;
      if (oldId.includes('-')) {
        idMappings.apps[oldId] = oldId;
        continue;
      }
      
      const data = doc.data();
      const newId = generateCustomId('APP');
      idMappings.apps[oldId] = newId;

      const newData = {
        ...data,
        id: newId,
        // Remap foreign keys using the dictionaries we populated
        tutorId: idMappings.tutors[data.tutorId] || data.tutorId,
        parentId: idMappings.parents[data.parentId] || data.parentId,
        groupId: idMappings.groups[data.groupId] || data.groupId,
        studentId: idMappings.students[data.studentId] || data.studentId,
        studentIds: Array.isArray(data.studentIds) ? data.studentIds.map(sid => idMappings.students[sid] || sid) : data.studentIds
      };

      await db.collection('applications').doc(newId).set(newData);
      await db.collection('applications').doc(oldId).delete();
      console.log(`  + Migrated ${oldId} -> ${newId}`);
      appCount++;
    }
    console.log(`✅ Completed applications. Migrated ${appCount} documents.`);

    // 3. Remap remaining foreign keys in Groups, Students, and Requests
    console.log(`\n🔗 Remapping foreign keys in other collections...`);
    
    // Remap Groups -> ParentID & StudentIDs
    const groupsSnap = await db.collection('groups').get();
    for (const doc of groupsSnap.docs) {
      if (!doc.id.includes('-')) continue;
      const data = doc.data();
      let updated = false;
      const updates = {};
      
      if (data.parentId && idMappings.parents[data.parentId] && data.parentId !== idMappings.parents[data.parentId]) {
        updates.parentId = idMappings.parents[data.parentId];
        updated = true;
      }
      
      if (Array.isArray(data.studentIds)) {
        const mapped = data.studentIds.map(sid => idMappings.students[sid] || sid);
        if (JSON.stringify(mapped) !== JSON.stringify(data.studentIds)) {
           updates.studentIds = mapped;
           updated = true;
        }
      }
      
      if (updated) {
        await doc.ref.update(updates);
      }
    }

    // Remap Students -> ParentID & GroupID
    const studentsSnap = await db.collection('students').get();
    for (const doc of studentsSnap.docs) {
      if (!doc.id.includes('-')) continue;
      const data = doc.data();
      let updated = false;
      const updates = {};
      
      if (data.parentId && idMappings.parents[data.parentId] && data.parentId !== idMappings.parents[data.parentId]) {
        updates.parentId = idMappings.parents[data.parentId];
        updated = true;
      }
      if (data.groupId && idMappings.groups[data.groupId] && data.groupId !== idMappings.groups[data.groupId]) {
        updates.groupId = idMappings.groups[data.groupId];
        updated = true;
      }
      
      if (updated) {
        await doc.ref.update(updates);
      }
    }

    // Remap Requests -> ParentID & GroupID
    const reqSnap = await db.collection('tuition_requests').get();
    for (const doc of reqSnap.docs) {
      if (!doc.id.includes('-')) continue;
      const data = doc.data();
      let updated = false;
      const updates = {};
      
      if (data.parentId && idMappings.parents[data.parentId] && data.parentId !== idMappings.parents[data.parentId]) {
        updates.parentId = idMappings.parents[data.parentId];
        updated = true;
      }
      if (data.groupId && idMappings.groups[data.groupId] && data.groupId !== idMappings.groups[data.groupId]) {
        updates.groupId = idMappings.groups[data.groupId];
        updated = true;
      }
      
      if (updated) {
        await doc.ref.update(updates);
      }
    }

    // Remap pendingRequests arrays in tutors and students
    console.log(`\n🔗 Remapping arrays in tutors and students...`);
    const tutorsSnap2 = await db.collection('tutors').get();
    for (const doc of tutorsSnap2.docs) {
       const data = doc.data();
       if (data.pendingRequests && Array.isArray(data.pendingRequests)) {
          const mapped = data.pendingRequests.map(pid => idMappings.apps[pid] || pid);
          if (JSON.stringify(mapped) !== JSON.stringify(data.pendingRequests)) {
             await doc.ref.update({ pendingRequests: mapped });
          }
       }
    }
    
    const studentsSnap2 = await db.collection('students').get();
    for (const doc of studentsSnap2.docs) {
       const data = doc.data();
       if (data.pendingRequests && Array.isArray(data.pendingRequests)) {
          const mapped = data.pendingRequests.map(pid => idMappings.apps[pid] || pid);
          if (JSON.stringify(mapped) !== JSON.stringify(data.pendingRequests)) {
             await doc.ref.update({ pendingRequests: mapped });
          }
       }
    }

    console.log("\n🎉 Migration V2 completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
