import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

function getAcademicDetail(studentGroup, field) {
  if (studentGroup[field]) return studentGroup[field];
  if (studentGroup.students && studentGroup.students.length > 0 && studentGroup.students[0][field]) return studentGroup.students[0][field];
  if (studentGroup.studentsDetails && studentGroup.studentsDetails.length > 0 && studentGroup.studentsDetails[0][field]) return studentGroup.studentsDetails[0][field];
  if (studentGroup.requestDoc && studentGroup.requestDoc[field]) return studentGroup.requestDoc[field];
  return undefined;
}

function calculateSuitabilityScore(studentGroup, teacher) {
  if (!studentGroup || !teacher) return 0;
  
  let score = 0;
  
  const studentCat = (getAcademicDetail(studentGroup, 'category') || '').toLowerCase().trim();
  const teacherCats = teacher.category ? teacher.category.toLowerCase().split(',').map((c) => c.trim()) : [];
  
  if (studentCat && !teacherCats.includes(studentCat)) {
    return 0; 
  }

  if (studentCat === 'school') {
    const studentBoard = (getAcademicDetail(studentGroup, 'board') || '').toLowerCase().trim();
    const teacherBoards = (teacher.boards || []).map((b) => b.toLowerCase().trim());
    if (studentBoard && teacherBoards.includes(studentBoard)) {
      score += 20;
    }

    const studentClass = (getAcademicDetail(studentGroup, 'classLevel') || getAcademicDetail(studentGroup, 'classGrade') || '').toLowerCase().trim();
    const teacherClasses = (teacher.classes || []).map((c) => c.toLowerCase().trim());
    if (studentClass && teacherClasses.includes(studentClass)) {
      score += 30;
    }
  }

  let studentNeeds = [];
  let teacherOffers = [];

  if (studentCat === 'school') {
    studentNeeds = getAcademicDetail(studentGroup, 'subjects') || getAcademicDetail(studentGroup, 'combinedSubjects') || [];
    teacherOffers = teacher.subjects || [];
  } else if (studentCat === 'programming') {
    studentNeeds = getAcademicDetail(studentGroup, 'technologies') || getAcademicDetail(studentGroup, 'combinedTechnologies') || [];
    teacherOffers = teacher.technologies || [];
  } else if (studentCat === 'languages') {
    studentNeeds = getAcademicDetail(studentGroup, 'languages') || getAcademicDetail(studentGroup, 'combinedLanguages') || [];
    teacherOffers = teacher.languagesTaught || teacher.languages || [];
  }

  if (studentNeeds.length > 0 && teacherOffers.length > 0) {
    const normalizedNeeds = studentNeeds.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const normalizedOffers = teacherOffers.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    normalizedNeeds.forEach(need => {
      if (normalizedOffers.some(offer => offer.includes(need) || need.includes(offer))) {
        score += 50;
      }
    });
  }

  return score;
}

async function testMatching() {
  console.log('Fetching students...');
  const studentsSnap = await db.collection('students').limit(5).get();
  const students = studentsSnap.docs.map(d => ({id: d.id, ...d.data()}));

  console.log('Fetching tutors...');
  const tutorsSnap = await db.collection('tutors').limit(5).get();
  const tutors = tutorsSnap.docs.map(d => ({id: d.id, ...d.data()}));

  for (const student of students) {
    console.log(`\n--- Evaluating Student ${student.name || student.id} (Category: ${student.category}) ---`);
    console.log(`Board: ${student.board}, Class: ${student.classLevel || student.classGrade}, Subjects: ${student.subjects}`);
    for (const tutor of tutors) {
      console.log(`  - Tutor ${tutor.name || tutor.id} (Categories: ${tutor.category})`);
      console.log(`    Boards: ${tutor.boards}, Classes: ${tutor.classes}, Subjects: ${tutor.subjects}`);
      const score = calculateSuitabilityScore(student, tutor);
      console.log(`    => Score: ${score}`);
      
      const getDetail = (obj, field) => obj[field] || (obj.students && obj.students[0] ? obj.students[0][field] : '') || '';
      
      const studentCat = getDetail(student, 'category').toLowerCase().trim();
      const teacherCats = tutor.category ? tutor.category.toLowerCase().split(',').map((c) => c.trim()) : [];
      let filtered = false;
      if (studentCat && !teacherCats.includes(studentCat)) {
         filtered = true;
         console.log('    => Filtered by category');
      }

      if (!filtered && studentCat === 'school') {
          const studentBoard = getDetail(student, 'board').toLowerCase().trim();
          const teacherBoards = (tutor.boards || []).map((b) => b.toLowerCase().trim());
          if (studentBoard && !teacherBoards.includes(studentBoard)) {
             filtered = true;
             console.log(`    => Filtered by board (student: ${studentBoard}, teacher: ${teacherBoards.join(',')})`);
          }

          const studentClass = (getDetail(student, 'classLevel') || getDetail(student, 'classGrade')).toLowerCase().trim();
          const teacherClasses = (tutor.classes || []).map((c) => c.toLowerCase().trim());
          if (studentClass && !teacherClasses.includes(studentClass)) {
             filtered = true;
             console.log(`    => Filtered by class (student: ${studentClass}, teacher: ${teacherClasses.join(',')})`);
          }
      }

    }
  }
}

testMatching().catch(console.error);
