function getAcademicDetail(studentGroup: any, field: string): any {
  if (studentGroup[field]) return studentGroup[field];
  if (studentGroup.students && studentGroup.students.length > 0 && studentGroup.students[0][field]) return studentGroup.students[0][field];
  if (studentGroup.studentsDetails && studentGroup.studentsDetails.length > 0 && studentGroup.studentsDetails[0][field]) return studentGroup.studentsDetails[0][field];
  if (studentGroup.requestDoc && studentGroup.requestDoc[field]) return studentGroup.requestDoc[field];
  return undefined;
}

export function doesClassMatch(studentClass: string, teacherClasses: string[]): boolean {
    if (!studentClass || teacherClasses.length === 0) return false;
    
    studentClass = studentClass.toLowerCase().trim();
    teacherClasses = teacherClasses.map(c => c.toLowerCase().trim());
    
    if (teacherClasses.includes(studentClass)) return true;

    const stdMatch = studentClass.match(/(\d+)[a-z]*\s+standard/);
    if (stdMatch) {
        const grade = parseInt(stdMatch[1]);
        if (grade >= 1 && grade <= 5 && teacherClasses.includes('1st - 5th')) return true;
        if (grade >= 6 && grade <= 8 && teacherClasses.includes('6th - 8th')) return true;
        if (grade >= 9 && grade <= 10 && teacherClasses.includes('9th - 10th')) return true;
        if (grade === 11 && (teacherClasses.includes('1st pu') || teacherClasses.includes('11th'))) return true;
        if (grade === 12 && (teacherClasses.includes('2nd pu') || teacherClasses.includes('12th'))) return true;
    }

    return false;
}

export function calculateSuitabilityScore(studentGroup: any, teacher: any): number {
  if (!studentGroup || !teacher) return 0;
  
  let score = 0;
  
  const studentCat = (getAcademicDetail(studentGroup, 'category') || '').toLowerCase().trim();
  const teacherCats = teacher.category ? teacher.category.toLowerCase().split(',').map((c: string) => c.trim()) : [];
  
  // Base requirement: Category must match, else score is 0
  if (studentCat && !teacherCats.includes(studentCat)) {
    return 0; 
  }

  // Board Match (20 points)
  if (studentCat === 'school') {
    const studentBoard = (getAcademicDetail(studentGroup, 'board') || '').toLowerCase().trim();
    const teacherBoards = (teacher.boards || []).map((b: string) => b.toLowerCase().trim());
    if (studentBoard && teacherBoards.includes(studentBoard)) {
      score += 20;
    }

    // Class Match (30 points)
    const studentClass = (getAcademicDetail(studentGroup, 'classLevel') || getAcademicDetail(studentGroup, 'classGrade') || '').toLowerCase().trim();
    const teacherClasses = (teacher.classes || []).map((c: string) => c.toLowerCase().trim());
    if (doesClassMatch(studentClass, teacherClasses)) {
      score += 30;
    }
  }

  // Subject/Technology/Language Match (+50 points PER MATCH)
  let studentNeeds: string[] = [];
  let teacherOffers: string[] = [];

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
    const normalizedNeeds = studentNeeds.map((s:string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const normalizedOffers = teacherOffers.map((s:string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    normalizedNeeds.forEach((need:string) => {
      if (normalizedOffers.some((offer:string) => offer.includes(need) || need.includes(offer))) {
        score += 50;
      }
    });
  }

  // Budget Proximity Match (Sliding Scale: +0 to +30 points)
  const studentBudget = parseFloat(studentGroup.budget || studentGroup.totalBudget || studentGroup.combinedBudget || getAcademicDetail(studentGroup, 'budget') || 0);
  const teacherFee = parseFloat(teacher.feeRange || teacher.minFee || 0);

  if (studentBudget > 0 && teacherFee > 0) {
    const diffRatio = Math.abs(studentBudget - teacherFee) / teacherFee;
    const budgetPoints = Math.round(Math.max(0, 30 - (diffRatio * 30)));
    score += budgetPoints;
  }

  // Aadhar Verification Boost (Trust & Safety)
  if (teacher.aadharVerified === true) {
    score += 20;
  }

  // Premium Subscription Boost
  const isSubscribedFlags = teacher.subscriptionPlan === 'pro' || teacher.isSubscribed;
  const hasValidExpiry = teacher.subscriptionExpiry ? teacher.subscriptionExpiry > Date.now() : false;
  
  if (isSubscribedFlags && hasValidExpiry) {
      score += 20;
  }

  return score;
}

export function isStrictMatch(studentGroup: any, teacher: any): boolean {
  if (!studentGroup || !teacher) return false;

  const studentCat = (getAcademicDetail(studentGroup, 'category') || '').toLowerCase().trim();
  const teacherCats = teacher.category ? teacher.category.toLowerCase().split(',').map((c: string) => c.trim()) : [];
  if (studentCat && !teacherCats.includes(studentCat)) return false;

  if (studentCat === 'school') {
      const studentBoard = (getAcademicDetail(studentGroup, 'board') || '').toLowerCase().trim();
      const teacherBoards = (teacher.boards || []).map((b: string) => b.toLowerCase().trim());
      if (studentBoard && !teacherBoards.includes(studentBoard)) return false;

      const studentClass = (getAcademicDetail(studentGroup, 'classLevel') || getAcademicDetail(studentGroup, 'classGrade') || '').toLowerCase().trim();
      const teacherClasses = (teacher.classes || []).map((c: string) => c.toLowerCase().trim());
      if (!doesClassMatch(studentClass, teacherClasses)) return false;
  }

  const genderPref = getAcademicDetail(studentGroup, 'teacherGenderPreference');
  if (genderPref && genderPref !== 'No Preference') {
      if (teacher.gender !== genderPref) return false;
  }

  let studentNeeds: string[] = [];
  let teacherOffers: string[] = [];
  
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
  
  if (studentNeeds.length > 0) {
    if (teacherOffers.length === 0) return false;
    const normalizedOffers = teacherOffers.map((s:string) => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const allSubjectsMatched = studentNeeds.every((need:string) => {
      const normalizedNeed = need.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalizedOffers.some((offer:string) => offer.includes(normalizedNeed) || normalizedNeed.includes(offer));
    });
    if (!allSubjectsMatched) return false;
  }

  return true;
}
