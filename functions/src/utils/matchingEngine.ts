/**
 * Server-Side Matchmaking & Ranking Engine.
 * Implements the mathematical formulas and strict filtering logic defined in docs/Ranking_System_Architecture.md.
 */

export function getAcademicDetail(studentGroup: any, field: string): any {
  if (!studentGroup) return undefined;
  if (studentGroup[field]) return studentGroup[field];
  if (studentGroup.students && studentGroup.students.length > 0 && studentGroup.students[0][field]) {
    return studentGroup.students[0][field];
  }
  if (studentGroup.studentsDetails && studentGroup.studentsDetails.length > 0 && studentGroup.studentsDetails[0][field]) {
    return studentGroup.studentsDetails[0][field];
  }
  if (studentGroup.requestDoc && studentGroup.requestDoc[field]) {
    return studentGroup.requestDoc[field];
  }
  return undefined;
}

export function doesClassMatch(studentClass: string, teacherClasses: string[]): boolean {
  if (!studentClass || !teacherClasses || teacherClasses.length === 0) return false;

  studentClass = studentClass.toLowerCase().trim();
  const normalizedClasses = teacherClasses.map((c) => c.toLowerCase().trim());

  if (normalizedClasses.includes(studentClass)) return true;

  const stdMatch = studentClass.match(/(\d+)[a-z]*\s+standard/);
  if (stdMatch) {
    const grade = parseInt(stdMatch[1], 10);
    if (grade >= 1 && grade <= 5 && normalizedClasses.includes("1st - 5th")) return true;
    if (grade >= 6 && grade <= 8 && normalizedClasses.includes("6th - 8th")) return true;
    if (grade >= 9 && grade <= 10 && normalizedClasses.includes("9th - 10th")) return true;
    if (grade === 11 && (normalizedClasses.includes("1st pu") || normalizedClasses.includes("11th"))) return true;
    if (grade === 12 && (normalizedClasses.includes("2nd pu") || normalizedClasses.includes("12th"))) return true;
  }

  return false;
}

export function calculateSuitabilityScore(studentGroup: any, teacher: any): number {
  if (!studentGroup || !teacher) return 0;

  let score = 0;

  const studentCat = (getAcademicDetail(studentGroup, "category") || "").toLowerCase().trim();
  const teacherCats = teacher.category ? teacher.category.toLowerCase().split(",").map((c: string) => c.trim()) : [];

  // Base requirement: Category must match, else score is 0
  if (studentCat && !teacherCats.includes(studentCat)) {
    return 0;
  }

  // Board Match (20 points)
  if (studentCat === "school") {
    const studentBoard = (getAcademicDetail(studentGroup, "board") || "").toLowerCase().trim();
    const teacherBoards = (teacher.boards || []).map((b: string) => b.toLowerCase().trim());
    if (studentBoard && teacherBoards.includes(studentBoard)) {
      score += 20;
    }

    // Class Match (30 points)
    const studentClass = (
      getAcademicDetail(studentGroup, "classLevel") ||
      getAcademicDetail(studentGroup, "classGrade") ||
      ""
    )
      .toLowerCase()
      .trim();
    const teacherClasses = (teacher.classes || []).map((c: string) => c.toLowerCase().trim());
    if (doesClassMatch(studentClass, teacherClasses)) {
      score += 30;
    }
  }

  // Subject/Technology/Language Match (+50 points PER MATCH)
  let studentNeeds: string[] = [];
  let teacherOffers: string[] = [];

  if (studentCat === "school") {
    studentNeeds =
      getAcademicDetail(studentGroup, "subjects") ||
      getAcademicDetail(studentGroup, "combinedSubjects") ||
      [];
    teacherOffers = teacher.subjects || [];
  } else if (studentCat === "programming") {
    studentNeeds =
      getAcademicDetail(studentGroup, "technologies") ||
      getAcademicDetail(studentGroup, "combinedTechnologies") ||
      [];
    teacherOffers = teacher.technologies || [];
  } else if (studentCat === "languages") {
    studentNeeds =
      getAcademicDetail(studentGroup, "languages") ||
      getAcademicDetail(studentGroup, "combinedLanguages") ||
      [];
    teacherOffers = teacher.languagesTaught || teacher.languages || [];
  }

  if (studentNeeds.length > 0 && teacherOffers.length > 0) {
    const normalizedNeeds = studentNeeds.map((s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const normalizedOffers = teacherOffers.map((s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ""));

    normalizedNeeds.forEach((need: string) => {
      if (normalizedOffers.some((offer: string) => offer.includes(need) || need.includes(offer))) {
        score += 50;
      }
    });
  }

  // Budget Proximity Match (Sliding Scale: +0 to +30 points)
  const studentBudget = parseFloat(
    studentGroup.budget ||
      studentGroup.totalBudget ||
      studentGroup.combinedBudget ||
      getAcademicDetail(studentGroup, "budget") ||
      0
  );
  const teacherFee = parseFloat(teacher.feeRange || teacher.minFee || 0);

  if (studentBudget > 0 && teacherFee > 0) {
    const diffRatio = Math.abs(studentBudget - teacherFee) / teacherFee;
    const budgetPoints = Math.round(Math.max(0, 30 - diffRatio * 30));
    score += budgetPoints;
  }

  // Aadhar Verification Boost (Trust & Safety)
  if (teacher.aadharVerified === true) {
    score += 20;
  }

  // Premium Subscription Boost
  const isSubscribedFlags = teacher.subscriptionPlan === "pro" || teacher.isSubscribed;
  const hasValidExpiry = teacher.subscriptionExpiry ? teacher.subscriptionExpiry > Date.now() : false;

  if (isSubscribedFlags && hasValidExpiry) {
    score += 20;
  }

  return score;
}

export function isStrictMatch(studentGroup: any, teacher: any): boolean {
  if (!studentGroup || !teacher) return false;

  const studentCat = (getAcademicDetail(studentGroup, "category") || "").toLowerCase().trim();
  const teacherCats = teacher.category ? teacher.category.toLowerCase().split(",").map((c: string) => c.trim()) : [];
  if (studentCat && !teacherCats.includes(studentCat)) return false;

  if (studentCat === "school") {
    const studentBoard = (getAcademicDetail(studentGroup, "board") || "").toLowerCase().trim();
    const teacherBoards = (teacher.boards || []).map((b: string) => b.toLowerCase().trim());
    if (studentBoard && !teacherBoards.includes(studentBoard)) return false;

    const studentClass = (
      getAcademicDetail(studentGroup, "classLevel") ||
      getAcademicDetail(studentGroup, "classGrade") ||
      ""
    )
      .toLowerCase()
      .trim();
    const teacherClasses = (teacher.classes || []).map((c: string) => c.toLowerCase().trim());
    if (!doesClassMatch(studentClass, teacherClasses)) return false;
  }

  const genderPref = getAcademicDetail(studentGroup, "teacherGenderPreference");
  if (genderPref && genderPref !== "No Preference") {
    if (teacher.gender !== genderPref) return false;
  }

  let studentNeeds: string[] = [];
  let teacherOffers: string[] = [];

  if (studentCat === "school") {
    studentNeeds =
      getAcademicDetail(studentGroup, "subjects") ||
      getAcademicDetail(studentGroup, "combinedSubjects") ||
      [];
    teacherOffers = teacher.subjects || [];
  } else if (studentCat === "programming") {
    studentNeeds =
      getAcademicDetail(studentGroup, "technologies") ||
      getAcademicDetail(studentGroup, "combinedTechnologies") ||
      [];
    teacherOffers = teacher.technologies || [];
  } else if (studentCat === "languages") {
    studentNeeds =
      getAcademicDetail(studentGroup, "languages") ||
      getAcademicDetail(studentGroup, "combinedLanguages") ||
      [];
    teacherOffers = teacher.languagesTaught || teacher.languages || [];
  }

  if (studentNeeds.length > 0) {
    if (teacherOffers.length === 0) return false;
    const normalizedOffers = teacherOffers.map((s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const allSubjectsMatched = studentNeeds.every((need: string) => {
      const normalizedNeed = need.toLowerCase().replace(/[^a-z0-9]/g, "");
      return normalizedOffers.some((offer: string) => offer.includes(normalizedNeed) || normalizedNeed.includes(offer));
    });
    if (!allSubjectsMatched) return false;
  }

  return true;
}

export function getApplicationPriorityScore(status: string): number {
  if (status === "locked" || status === "declined") return -1000;
  if (
    [
      "pending",
      "negotiating",
      "reviewing",
      "offer_sent",
      "demo_requested_by_student",
      "demo_requested_by_teacher",
      "demo_pending_payment",
    ].includes(status)
  ) {
    return 1000;
  }
  return 0;
}

export interface RankTutorsOptions {
  tab: "recommended" | "all";
  page: number;
  limit: number;
  category?: string;
  studentUserId?: string;
  studentUserEmail?: string;
  activeGroupId?: string;
}

export interface RankedTutorResult {
  tutors: any[];
  totalMatches: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Executes server-side global scoring, sorting, and pagination for candidate tutors.
 * Guarantees that Rank #1 is always index 0 of Page 1.
 */
export function rankAndPaginateTutors(
  scoringContext: any,
  rawTutors: any[],
  applications: any[],
  options: RankTutorsOptions
): RankedTutorResult {
  const {
    tab = "recommended",
    page = 1,
    limit = 20,
    category,
    studentUserId,
    studentUserEmail,
    activeGroupId,
  } = options;

  const studentBudget = parseFloat(
    scoringContext?.budget ||
      scoringContext?.totalBudget ||
      scoringContext?.combinedBudget ||
      getAcademicDetail(scoringContext, "budget") ||
      0
  );

  // 1. Filter out self and active tuitions
  const filteredTutors = rawTutors.filter((tutor) => {
    if (studentUserId && tutor.id === studentUserId) return false;
    if (studentUserEmail && tutor.email && tutor.email === studentUserEmail) return false;

    const matchGroup = (app: any) => {
      return (
        (activeGroupId && (app.groupDocId === activeGroupId || app.studentDocId === activeGroupId)) ||
        (!activeGroupId && (app.parentDocId === studentUserId))
      );
    };

    const app = applications.find((a: any) => a.tutorDocId === tutor.id && matchGroup(a));
    if (app && app.status === "tuition_started") return false;
    return true;
  });

  // 2. Score all candidate profiles globally
  const scoredTutors = filteredTutors.map((tutor) => {
    const teacherFee = parseFloat(tutor.feeRange || tutor.minFee || 0);
    const strictMatch = isStrictMatch(scoringContext, tutor);
    const suitabilityScore = strictMatch ? calculateSuitabilityScore(scoringContext, tutor) : 0;
    const budgetDifference = Math.abs(studentBudget - teacherFee);

    return {
      ...tutor,
      strictMatch,
      suitabilityScore,
      budgetDifference,
    };
  });

  // 3. Filter by tab ('recommended' requires strictMatch and suitabilityScore > 0)
  let eligibleTutors = scoredTutors;
  if (tab === "recommended") {
    eligibleTutors = scoredTutors.filter((t) => t.strictMatch && t.suitabilityScore > 0);
  }

  // 4. Filter by category if specified
  if (category) {
    const normCat = category.toLowerCase().trim();
    eligibleTutors = eligibleTutors.filter(
      (t) => t.category && t.category.toLowerCase().includes(normCat)
    );
  }

  // 5. Global Sort: Active Negotiation VIP (+1000) -> Suitability Score -> Budget Proximity
  eligibleTutors.sort((a, b) => {
    const getStatus = (tutorId: string) => {
      const matchGroup = (app: any) => {
        return (
          (activeGroupId && (app.groupDocId === activeGroupId || app.studentDocId === activeGroupId)) ||
          (!activeGroupId && (app.parentDocId === studentUserId))
        );
      };
      const app = applications.find((app: any) => app.tutorDocId === tutorId && matchGroup(app));
      if (!app) return "";
      if (
        app.status === "locked" ||
        (app.status === "declined" &&
          app.declinedAt &&
          Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000)
      ) {
        return "locked";
      }
      return app.status;
    };

    const statusDiff = getApplicationPriorityScore(getStatus(b.id)) - getApplicationPriorityScore(getStatus(a.id));
    if (statusDiff !== 0) return statusDiff;

    if (b.suitabilityScore !== a.suitabilityScore) {
      return b.suitabilityScore - a.suitabilityScore;
    }

    return a.budgetDifference - b.budgetDifference;
  });

  // Assign global ranks 1 to N
  const rankedTutors = eligibleTutors.map((tutor, idx) => ({
    ...tutor,
    rank: idx + 1,
  }));

  const totalMatches = rankedTutors.length;
  const startIndex = Math.max(0, (page - 1) * limit);
  const endIndex = startIndex + limit;
  const paginatedSlice = rankedTutors.slice(startIndex, endIndex);
  const hasMore = endIndex < totalMatches;

  return {
    tutors: paginatedSlice,
    totalMatches,
    page,
    limit,
    hasMore,
  };
}

export interface RankStudentsOptions {
  tab: "recommended" | "all";
  page: number;
  limit: number;
  category?: string;
  teacherUserId?: string;
}

export interface RankedStudentResult {
  students: any[];
  totalMatches: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Executes server-side global scoring, sorting, and pagination for candidate student groups.
 * Guarantees that Rank #1 is always index 0 of Page 1.
 */
export function rankAndPaginateStudents(
  activeTeacher: any,
  rawStudentGroups: any[],
  applications: any[],
  options: RankStudentsOptions
): RankedStudentResult {
  const {
    tab = "recommended",
    page = 1,
    limit = 20,
    category,
    teacherUserId,
  } = options;

  const teacherFee = parseFloat(activeTeacher?.feeRange || activeTeacher?.minFee || 0);

  // 1. Filter out self-requests
  const filteredGroups = rawStudentGroups.filter((group) => {
    if (teacherUserId && (group.parentDocId === teacherUserId || group.id === teacherUserId)) {
      return false;
    }
    return true;
  });

  // 2. Score all candidate student groups globally
  const scoredGroups = filteredGroups.map((studentGroup) => {
    const studentBudget = parseFloat(
      studentGroup.budget ||
        studentGroup.totalBudget ||
        studentGroup.combinedBudget ||
        getAcademicDetail(studentGroup, "budget") ||
        0
    );
    const strictMatch = isStrictMatch(studentGroup, activeTeacher);
    const suitabilityScore = strictMatch ? calculateSuitabilityScore(studentGroup, activeTeacher) : 0;
    const budgetDifference = Math.abs(studentBudget - teacherFee);

    return {
      ...studentGroup,
      strictMatch,
      suitabilityScore,
      budgetDifference,
    };
  });

  // 3. Filter by tab
  let eligibleGroups = scoredGroups;
  if (tab === "recommended") {
    eligibleGroups = scoredGroups.filter((g) => g.strictMatch && g.suitabilityScore > 0);
  }

  // 4. Filter by category if specified
  if (category) {
    const normCat = category.toLowerCase().trim();
    eligibleGroups = eligibleGroups.filter((g) => {
      const gCat = (getAcademicDetail(g, "category") || "").toLowerCase().trim();
      return gCat.includes(normCat);
    });
  }

  // 5. Global Sort: Active Negotiation VIP (+1000) -> Suitability Score -> Budget Proximity
  eligibleGroups.sort((a, b) => {
    const getStatus = (studentId: string) => {
      const app = applications.find(
        (app: any) => app.studentDocId === studentId || app.groupDocId === studentId
      );
      if (!app) return "";
      if (
        app.status === "locked" ||
        (app.status === "declined" &&
          app.declinedAt &&
          Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000)
      ) {
        return "locked";
      }
      return app.status;
    };

    const statusDiff = getApplicationPriorityScore(getStatus(b.id)) - getApplicationPriorityScore(getStatus(a.id));
    if (statusDiff !== 0) return statusDiff;

    if (b.suitabilityScore !== a.suitabilityScore) {
      return b.suitabilityScore - a.suitabilityScore;
    }

    return a.budgetDifference - b.budgetDifference;
  });

  // Assign global ranks 1 to N
  const rankedStudents = eligibleGroups.map((group, idx) => ({
    ...group,
    rank: idx + 1,
  }));

  const totalMatches = rankedStudents.length;
  const startIndex = Math.max(0, (page - 1) * limit);
  const endIndex = startIndex + limit;
  const paginatedSlice = rankedStudents.slice(startIndex, endIndex);
  const hasMore = endIndex < totalMatches;

  return {
    students: paginatedSlice,
    totalMatches,
    page,
    limit,
    hasMore,
  };
}
