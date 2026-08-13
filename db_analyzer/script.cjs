const admin = require('firebase-admin');
const serviceAccount = require('./tutor-app-1e394-firebase-adminsdk-fbsvc-229cb7c69a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function findDuplicates() {
    console.log("Analyzing database for duplicates...\n");

    // 1. Check Users
    const usersSnap = await db.collection('users').get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const usersByPhone = {};
    const usersByEmail = {};
    let duplicateUsers = [];

    users.forEach(u => {
        if (u.phoneNumber) {
            if (usersByPhone[u.phoneNumber]) {
                duplicateUsers.push(`Duplicate Phone: ${u.phoneNumber} (IDs: ${usersByPhone[u.phoneNumber].id}, ${u.id})`);
            } else {
                usersByPhone[u.phoneNumber] = u;
            }
        }
        if (u.email) {
            if (usersByEmail[u.email]) {
                duplicateUsers.push(`Duplicate Email: ${u.email} (IDs: ${usersByEmail[u.email].id}, ${u.id})`);
            } else {
                usersByEmail[u.email] = u;
            }
        }
    });

    console.log(`--- USERS (${users.length} total) ---`);
    if (duplicateUsers.length === 0) console.log("No duplicate users found.");
    else duplicateUsers.forEach(d => console.log(d));
    console.log("");

    // 2. Check Tutors
    const tutorsSnap = await db.collection('tutors').get();
    const tutors = tutorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const tutorsByPhone = {};
    const tutorsByEmail = {};
    let duplicateTutors = [];

    tutors.forEach(t => {
        if (t.phone) {
            if (tutorsByPhone[t.phone]) {
                duplicateTutors.push(`Duplicate Phone: ${t.phone} (IDs: ${tutorsByPhone[t.phone].id}, ${t.id})`);
            } else {
                tutorsByPhone[t.phone] = t;
            }
        }
        if (t.email) {
            if (tutorsByEmail[t.email]) {
                duplicateTutors.push(`Duplicate Email: ${t.email} (IDs: ${tutorsByEmail[t.email].id}, ${t.id})`);
            } else {
                tutorsByEmail[t.email] = t;
            }
        }
    });

    console.log(`--- TUTORS (${tutors.length} total) ---`);
    if (duplicateTutors.length === 0) console.log("No duplicate tutors found.");
    else duplicateTutors.forEach(d => console.log(d));
    console.log("");

    // 3. Check Students
    const studentsSnap = await db.collection('students').get();
    const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const studentsByKey = {};
    let duplicateStudents = [];

    students.forEach(s => {
        const key = `${s.name?.toLowerCase()?.trim()}-${s.phoneNumber}`;
        if (s.name && s.phoneNumber) {
            if (studentsByKey[key]) {
                duplicateStudents.push(`Duplicate Student (Name+Phone): ${s.name} / ${s.phoneNumber} (IDs: ${studentsByKey[key].id}, ${s.id}) | Parents: ${studentsByKey[key].parentDocId || studentsByKey[key].parentId}, ${s.parentDocId || s.parentId}`);
            } else {
                studentsByKey[key] = s;
            }
        }
    });

    console.log(`--- STUDENTS (${students.length} total) ---`);
    if (duplicateStudents.length === 0) console.log("No duplicate students found based on Name + Phone.");
    else duplicateStudents.forEach(d => console.log(d));
    console.log("");
    
    // 4. Find orphaned students (parent doc does not exist)
    const parentsSnap = await db.collection('parents').get();
    const parentIds = new Set(parentsSnap.docs.map(doc => doc.id));
    
    let orphanedStudents = [];
    students.forEach(s => {
        const parentId = s.parentDocId || s.parentId;
        if (!parentIds.has(parentId)) {
            orphanedStudents.push(`Orphaned Student: ${s.name} (ID: ${s.id}) - Parent ID ${parentId} does not exist!`);
        }
    });
    
    console.log(`--- ORPHANED STUDENTS ---`);
    if (orphanedStudents.length === 0) console.log("No orphaned students found.");
    else orphanedStudents.forEach(d => console.log(d));

}

findDuplicates().catch(console.error);
