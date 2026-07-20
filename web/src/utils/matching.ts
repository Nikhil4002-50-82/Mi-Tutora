export function calculateSuitabilityScore(student: any, teacher: any): number {
  if (!student || !teacher) return 0;
  
  let score = 0;
  
  const studentCat = (student.category || '').toLowerCase().trim();
  const teacherCats = teacher.category ? teacher.category.toLowerCase().split(',').map((c: string) => c.trim()) : [];
  
  // 1. Category Match (Base Requirement: 40 points)
  if (studentCat && teacherCats.includes(studentCat)) {
    score += 40;
  } else {
    // If category doesn't even match, they are not suitable at all.
    return 0; 
  }

  // 2. Board & Class Match (20 points)
  if (studentCat === 'school') {
    const studentBoard = (student.board || '').toLowerCase().trim();
    const teacherBoards = (teacher.boards || []).map((b: string) => b.toLowerCase().trim());
    if (studentBoard && teacherBoards.includes(studentBoard)) {
      score += 10;
    } else if (!studentBoard || teacherBoards.length === 0) {
      score += 5; // Partial points if one didn't specify
    }

    const studentClass = (student.classLevel || '').toLowerCase().trim();
    const teacherClasses = (teacher.classes || []).map((c: string) => c.toLowerCase().trim());
    if (studentClass && teacherClasses.includes(studentClass)) {
      score += 10;
    } else if (!studentClass || teacherClasses.length === 0) {
      score += 5; // Partial points if one didn't specify
    }
  }

  // 3. Subject/Technology/Language Overlap (30 points)
  let studentNeeds: string[] = [];
  let teacherOffers: string[] = [];

  if (studentCat === 'school') {
    studentNeeds = student.subjects || [];
    teacherOffers = teacher.subjects || [];
  } else if (studentCat === 'programming') {
    studentNeeds = student.technologies || [];
    teacherOffers = teacher.technologies || [];
  } else if (studentCat === 'languages') {
    studentNeeds = student.languages || [];
    teacherOffers = teacher.languagesTaught || teacher.languages || [];
  }

  if (studentNeeds.length > 0 && teacherOffers.length > 0) {
    const normalizedNeeds = studentNeeds.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const normalizedOffers = teacherOffers.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    let matchCount = 0;
    normalizedNeeds.forEach(need => {
      if (normalizedOffers.some(offer => offer.includes(need) || need.includes(offer))) {
        matchCount++;
      }
    });

    const matchPercentage = matchCount / normalizedNeeds.length;
    score += Math.round(matchPercentage * 30);
  } else if (studentNeeds.length === 0) {
    score += 15; // If student didn't specify subjects, assume some average overlap
  }

  // 4. Budget Match (10 points)
  const studentBudget = parseFloat(student.budget || student.totalBudget || student.expectedBudget || 0);
  const teacherMin = parseFloat(teacher.minFee || teacher.feeRange?.min || 0);
  const teacherMax = parseFloat(teacher.maxFee || teacher.feeRange?.max || Infinity);

  if (studentBudget > 0 && teacherMin > 0) {
    if (studentBudget >= teacherMin && studentBudget <= teacherMax) {
      score += 10;
    } else if (studentBudget >= teacherMin * 0.8) {
      // Within 20% of minimum
      score += 5;
    }
  } else {
    score += 5; // If budget not specified, partial points
  }

  // Cap at 100
  return Math.min(100, Math.max(0, score));
}
