import { auth, db } from '@/utils/firebase/client';
import { doc, getDoc, collection, query, where, getDocs, setDoc, documentId, updateDoc, arrayRemove, orderBy, limit } from 'firebase/firestore';

export const fetchStudentDashboardData = async () => {
  await new Promise(resolve => auth.onAuthStateChanged(resolve));
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('Unauthenticated');
  }

  let userDocRef = doc(db, 'users', user.uid);
  let userDocSnap = await getDoc(userDocRef);
  let userData = userDocSnap.exists() ? userDocSnap.data() : null;
  
  const roles = userData?.roles || (userData?.role ? [userData.role] : []);
  if (userData) {
    userData.roles = roles;
    userData.id = user.uid;
  }
  if (userData && !roles.includes('student')) {
    throw new Error('Unauthorized');
  }

  if (!userData) {
    userData = {
      id: user.uid,
      email: user.email,
      name: user.displayName || 'Student',
      roles: ['student'],
      hasProfile: false,
      walletBalance: 0
    };
    await setDoc(userDocRef, userData);
  }
  
  const parentDocSnap = await getDoc(doc(db, 'parents', user.uid));
  const parentData = parentDocSnap.exists() ? parentDocSnap.data() : null;
  const parentId = user.uid;
  const [
    applicationsSnap,
    studentsSnap,
    groupsSnap,
    requestsSnap,
    tutorsSnapResult,
    referralsSnap,
    pricingSnap
  ] = await Promise.all([
    getDocs(query(collection(db, 'applications'), where('parentDocId', '==', parentId))),
    getDocs(query(collection(db, 'students'), where('parentDocId', '==', parentId))),
    getDocs(query(collection(db, 'groups'), where('parentDocId', '==', parentId))),
    getDocs(query(collection(db, 'tuition_requests'), where('parentDocId', '==', parentId), limit(50))),
    getDocs(query(collection(db, 'tutors'), where('hasProfile', '==', true), limit(100))).catch(e => {
      console.warn("Failed to fetch tutors", e);
      return { docs: [] };
    }),
    getDocs(query(collection(db, 'referrals'), where('referrerId', '==', user.uid), limit(50))),
    getDocs(collection(db, 'marketplace_pricing'))
  ]);

  const parseTimestamp = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (val.toMillis) return val.toMillis();
    if (val.seconds) return val.seconds * 1000;
    if (val._seconds) return val._seconds * 1000;
    return 0;
  };

  const applications = applicationsSnap.docs.map(d => {
    const data = d.data() as any;
    return { 
      id: d.id, 
      ...data,
      createdAt: parseTimestamp(data.createdAt),
      updatedAt: parseTimestamp(data.updatedAt),
      declinedAt: parseTimestamp(data.declinedAt),
      startDate: parseTimestamp(data.startDate)
    };
  });
  
  const students = studentsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  students.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
  const myStudent = students.length > 0 ? students[0] : null;

  const groups = groupsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  
  const requests = requestsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  const myRequest = requests.length > 0 ? requests[0] : null;

  const availableTutors = tutorsSnapResult.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
  
  const referrals = referralsSnap.docs.map(d => {
    const data = d.data() as any;
    return {
      id: d.id,
      ...data,
      createdAt: parseTimestamp(data.createdAt),
      qualifiedAt: parseTimestamp(data.qualifiedAt)
    };
  });
  const marketplacePricing = pricingSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const tutorIds = applications.map((app: any) => app.tutorDocId).filter(Boolean);
  let tutorsInfo: any[] = [];
  if (tutorIds.length > 0) {
     const uniqueTutorIds = Array.from(new Set(tutorIds));
     const chunkPromises = [];
     for (let i = 0; i < uniqueTutorIds.length; i += 10) {
       const chunk = uniqueTutorIds.slice(i, i + 10);
       chunkPromises.push(getDocs(query(collection(db, 'tutors'), where(documentId(), 'in', chunk))));
     }
     const chunkSnaps = await Promise.all(chunkPromises);
     chunkSnaps.forEach(tSnap => {
       tutorsInfo = [...tutorsInfo, ...tSnap.docs.map(d => ({ id: d.id, ...d.data() }))];
     });
  }

  const baseData = {
    user,
    userData,
    marketplacePricing,
    parentData,
    students,
    myStudent,
    requests,
    myRequest,
    groups,
    applications,
    availableTutors,
    referrals,
    tutorsInfo
  };

  return deriveStudentDashboardState(baseData);
};

export const deriveStudentDashboardState = (baseData: any) => {
  const { user, userData, marketplacePricing, parentData, students, myStudent, requests, myRequest, groups, applications, availableTutors, referrals, tutorsInfo } = baseData;
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  const matchedTutors = availableTutors.filter((tutor: any) => {
    if (!myStudent) return true;
    const tutorCategories = tutor.category ? tutor.category.split(',').map((c: string) => c.trim()) : [];
    if (!tutorCategories.includes(myStudent.category)) return false;
    return true;
  }) || [];

  const applicationsWithSubjects = applications.map((app: any) => {
    const tutor = tutorsInfo.find((t: any) => t.id === app.tutorDocId);

    let currentStatus = app.status;
    // Auto-expire if teacher hasn't paid demo fee within 7 days
    if (currentStatus === 'demo_pending_payment' && (now - (app.updatedAt || app.createdAt || now)) > SEVEN_DAYS) {
      currentStatus = 'declined';
    }
    // Auto-expire if student hasn't made a decision 48 hours after demo was finished
    if (currentStatus === 'waiting_for_parent_decision' && (now - (app.updatedAt || app.createdAt || now)) > 48 * 60 * 60 * 1000) {
      currentStatus = 'declined';
    }

    return { 
      ...app, 
      status: currentStatus,
      tutorDetails: tutor,
      subjects: tutor?.subjects || [],
      technologies: tutor?.technologies || [],
      languagesTaught: tutor?.languagesTaught || []
    };
  }) || [];

  const dismissedNotifs = userData?.dismissedNotifications || [];
  const allNegotiations = applicationsWithSubjects.filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(app.status));
  const allNotifications = [
    ...applicationsWithSubjects
    .filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'declined', 'tuition_started'].includes(app.status))
    .filter((app: any) => !dismissedNotifs.includes(app.id))
    .sort((a: any, b: any) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
  ];
  const recommendedNegotiations = allNegotiations.filter((app: any) => matchedTutors.some((t:any) => t.id === app.tutorDocId));

  return {
    user,
    userData,
    marketplacePricing,
    profile: parentData,
    myStudent,
    students: students,
    allStudents: students,
    myRequest,
    groups,
    tuitionRequests: requests,
    applications: applicationsWithSubjects,
    availableTeachers: matchedTutors,
    allTutors: availableTutors,
    recommendedTutors: matchedTutors,
    referrals,
    negotiations: allNegotiations,
    allNegotiations,
    allNotifications,
    recommendedNegotiations,
    demoClasses: applicationsWithSubjects.filter((app: any) => ['demo_booking_phase', 'demo_scheduled'].includes(app.status)).map((app: any) => ({
      id: app.id,
      app: app,
      subject: app.category || 'General',
      teacher: app.tutorName || 'Assigned Tutor',
      studentDocId: app.studentDocId,
      studentName: app.studentName,
      date: app.demoDate || 'TBD',
      status: app.status,
      finalPrice: app.finalPrice || app.currentOffer || 4000,
      tutorDetails: app.tutorDetails
    })),
    upcomingClasses: applicationsWithSubjects.filter((app: any) => ['tuition_started'].includes(app.status)).map((app: any) => ({
      id: app.id,
      app: app,
      subject: app.category || 'General',
      teacher: app.tutorName || 'Assigned Tutor',
      studentDocId: app.studentDocId,
      studentName: app.studentName,
      date: app.nextPaymentDate || app.startDate || new Date().toISOString(),
      status: app.status,
      finalPrice: app.finalPrice || app.currentOffer || 4000,
      tutorDetails: app.tutorDetails
    })),
    _baseData: baseData
  };
};

export const fetchTeacherDashboardData = async () => {
  await new Promise(resolve => auth.onAuthStateChanged(resolve));
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('Unauthenticated');
  }

  let userDocRef = doc(db, 'users', user.uid);
  let userDocSnap = await getDoc(userDocRef);
  let userData = userDocSnap.exists() ? userDocSnap.data() : null;
  
  const roles = userData?.roles || (userData?.role ? [userData.role] : []);
  if (userData) {
    userData.roles = roles;
  }
  if (userData && !roles.includes('teacher')) {
    throw new Error('Unauthorized');
  }

  if (!userData) {
    userData = {
      id: user.uid,
      email: user.email,
      name: user.displayName || 'Teacher',
      roles: ['teacher'],
      hasProfile: false,
      walletBalance: 0
    };
    await setDoc(userDocRef, userData);
  }

  const tutorQuery = query(collection(db, 'tutors'), where('authUid', '==', user.uid));
  const tutorSnap = await getDocs(tutorQuery);
  const tutorData = !tutorSnap.empty ? tutorSnap.docs[0].data() : null;
  const tutorId = !tutorSnap.empty ? tutorSnap.docs[0].id : user.uid;
  
  const [
    applicationsSnap,
    studentsSnapResult,
    referralsSnap,
    pricingSnap,
    lockedAppsSnap
  ] = await Promise.all([
    getDocs(query(collection(db, 'applications'), where('tutorDocId', '==', tutorId))),
    getDocs(query(collection(db, 'students'), where('isAvailable', '==', true), limit(100))).catch(e => {
      console.warn("Failed to fetch students", e);
      return { docs: [] };
    }),
    getDocs(query(collection(db, 'referrals'), where('referrerId', '==', user.uid), limit(50))),
    getDocs(collection(db, 'marketplace_pricing')),
    getDocs(query(collection(db, 'applications'), where('status', 'in', ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'])))
  ]);

  const parseTimestamp = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (val.toMillis) return val.toMillis();
    if (val.seconds) return val.seconds * 1000;
    if (val._seconds) return val._seconds * 1000;
    return 0;
  };

  const applications = applicationsSnap.docs.map(d => {
    const data = d.data() as any;
    return {
      id: d.id,
      ...data,
      createdAt: parseTimestamp(data.createdAt),
      updatedAt: parseTimestamp(data.updatedAt),
      declinedAt: parseTimestamp(data.declinedAt),
      startDate: parseTimestamp(data.startDate)
    };
  });
  
  const referrals = referralsSnap.docs.map((d: any) => {
    const data = d.data() as any;
    return {
      id: d.id,
      ...data,
      createdAt: parseTimestamp(data.createdAt),
      qualifiedAt: parseTimestamp(data.qualifiedAt)
    };
  });
  const marketplacePricing = pricingSnap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));

  const availableStudentsRaw = studentsSnapResult.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
  availableStudentsRaw.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
  const availableStudents = availableStudentsRaw;

  // Phase 1: API Stitching - Fetch related groups for students to get teacherGenderPreference
  const uniqueGroupIds = Array.from(new Set(availableStudentsRaw.map((s: any) => s.groupDocId).filter(Boolean))) as string[];
  let fetchedGroups: any[] = [];
  if (uniqueGroupIds.length > 0) {
    const chunkPromises = [];
    for (let i = 0; i < uniqueGroupIds.length; i += 10) {
      const chunk = uniqueGroupIds.slice(i, i + 10);
      chunkPromises.push(getDocs(query(collection(db, 'groups'), where(documentId(), 'in', chunk))));
    }
    const chunkSnaps = await Promise.all(chunkPromises);
    chunkSnaps.forEach(gSnap => {
      fetchedGroups = [...fetchedGroups, ...gSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))];
    });
  }

  const globalLocks: Record<string, { unlockDate: number, tutorDocId: string }> = {};
  lockedAppsSnap.docs.forEach(d => {
    const data = d.data();
    const gId = data.groupDocId || data.studentDocId;
    if (gId) {
      let unlockDate = Date.now() + 14 * 24 * 60 * 60 * 1000;
      if (data.status === 'demo_scheduled' || data.status === 'waiting_for_parent_decision') {
        if (data.demoDate) {
          const demoDateObj = new Date(data.demoDate);
          const timeParts = data.demoTime ? data.demoTime.split('||')[0].split(':') : [0, 0];
          if (timeParts.length >= 2) {
            demoDateObj.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
          }
          unlockDate = demoDateObj.getTime() + 48 * 60 * 60 * 1000;
        }
      } else {
         const paidDate = parseTimestamp(data.updatedAt) || parseTimestamp(data.createdAt) || Date.now();
         unlockDate = paidDate + 14 * 24 * 60 * 60 * 1000;
      }
      if (!globalLocks[gId] || unlockDate > globalLocks[gId].unlockDate) {
         globalLocks[gId] = { unlockDate, tutorDocId: data.tutorDocId };
      }
    }
  });

  const teacherCategories = tutorData?.category ? tutorData.category.split(',').map((c:string) => c.trim()) : [];
  

  

  const studentIds = applications.flatMap((app: any) => app.studentDocIds || [app.studentDocId]).filter(Boolean);

  let studentsInfo: any[] = [];
  if (studentIds.length > 0) {
    const uniqueStudentIds = Array.from(new Set(studentIds));
    const chunkPromises = [];
    for (let i = 0; i < uniqueStudentIds.length; i += 10) {
      const chunk = uniqueStudentIds.slice(i, i + 10);
      chunkPromises.push(getDocs(query(collection(db, 'students'), where(documentId(), 'in', chunk))));
    }
    const chunkSnaps = await Promise.all(chunkPromises);
    chunkSnaps.forEach(sSnap => {
      studentsInfo = [...studentsInfo, ...sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))];
    });
  }

  // Phase 1: Securely Fetch Parent Phone Numbers for Authorized Applications
  const authorizedAppStatuses = ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'tuition_started'];
  const authorizedParentIds = applications
    .filter((app: any) => authorizedAppStatuses.includes(app.status))
    .map((app: any) => app.parentDocId || (app.studentDetails?.parentDocId))
    .filter(Boolean);

  let parentsInfo: Record<string, any> = {};
  if (authorizedParentIds.length > 0) {
    const uniqueParentIds = Array.from(new Set(authorizedParentIds));
    const parentPromises = [];
    for (let i = 0; i < uniqueParentIds.length; i += 10) {
      const chunk = uniqueParentIds.slice(i, i + 10);
      parentPromises.push(getDocs(query(collection(db, 'users'), where(documentId(), 'in', chunk))));
    }
    const parentSnaps = await Promise.all(parentPromises);
    parentSnaps.forEach(pSnap => {
      pSnap.docs.forEach(d => {
        parentsInfo[d.id] = { id: d.id, ...d.data() as any };
      });
    });
  }

  const stitchedApplications = applications.map((app: any) => {
    const parentId = app.parentDocId;
    if (parentId && parentsInfo[parentId]) {
      return { ...app, parentDetails: parentsInfo[parentId] };
    }
    return app;
  });

  const baseData = {
    user,
    userData,
    tutorId,
    tutorData,
    teacherCategories,
    globalLocks,
    applications: stitchedApplications,
    referrals,
    marketplacePricing,
    availableStudentsRaw,
    availableStudents,
    studentsInfo,
    fetchedGroups
  };

  return deriveTeacherDashboardState(baseData);
};

export const deriveTeacherDashboardState = (baseData: any) => {
  const { 
    user, userData, tutorId, tutorData, teacherCategories, globalLocks, 
    applications, referrals, marketplacePricing, 
    availableStudentsRaw, availableStudents, studentsInfo, fetchedGroups 
  } = baseData;

  // Group students first
  const groupedStudentsMap = availableStudentsRaw.reduce((acc: any, student: any) => {
    const gId = student.groupDocId || `indv_${student.id}`;
    if (!acc[gId]) {
      acc[gId] = { 
        id: gId, 
        students: [], 
        totalBudget: 0,
        parentDocId: student.parentDocId || student.parentId,
        categories: [],
        requestDoc: (fetchedGroups || []).find((g: any) => g.id === gId) || null
      };
    }
    acc[gId].students.push(student);
    acc[gId].totalBudget += (parseInt(student.budget) || 0);
    if (student.category) acc[gId].categories.push(student.category);
    return acc;
  }, {});

  const availableGroupsRaw = Object.values(groupedStudentsMap).map((g: any) => ({
    ...g,
    name: g.students.length === 1 ? g.students[0].name : `Group: ${g.students.map((s:any) => s.name).join(', ')}`,
    category: g.categories[0] || 'school',
    budget: g.totalBudget
  }));

  const matchedGroups = availableGroupsRaw.filter((group: any) => {
    if (!tutorData) return true;
    
    // A group matches if any student inside it matches the teacher's profile
    return group.students.some((student: any) => {
      const studentCat = (student.category || '').toLowerCase().trim();
      const teacherCats = teacherCategories.map((c:string) => c.toLowerCase().trim());
      
      if (!teacherCats.includes(studentCat)) return false;
      
      return true;
    });
  });

  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  const applicationsWithSubjects = applications.map((app: any) => {
    const student = studentsInfo.find((s: any) => s.id === app.studentDocId);
    const appStudentsList = studentsInfo.filter((s: any) => (app.studentDocIds || []).includes(s.id) || s.id === app.studentDocId);
    
    let currentStatus = app.status;
    // Auto-expire if teacher hasn't paid demo fee within 7 days
    if (currentStatus === 'demo_pending_payment' && (now - (app.updatedAt || app.createdAt || now)) > SEVEN_DAYS) {
      currentStatus = 'declined';
    }
    // Auto-expire if student hasn't made a decision 48 hours after demo was finished
    if (currentStatus === 'waiting_for_parent_decision' && (now - (app.updatedAt || app.createdAt || now)) > 48 * 60 * 60 * 1000) {
      currentStatus = 'declined';
    }

    const stitchedStudent = student ? { ...student, parentDetails: app.parentDetails } : null;
    const stitchedAppStudentsList = appStudentsList.map((s: any) => ({ ...s, parentDetails: app.parentDetails }));

    return { 
      ...app, 
      status: currentStatus,
      studentDetails: stitchedStudent,
      studentsList: stitchedAppStudentsList,
      subjects: student?.subjects || [],
      technologies: student?.technologies || [],
      languages: student?.languages || []
    };
  }) || [];

  const dismissedNotifs = userData?.dismissedNotifications || [];
  const allNegotiations = applicationsWithSubjects.filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(app.status));
  const allNotifications = applicationsWithSubjects
    .filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'declined', 'tuition_started'].includes(app.status))
    .filter((app: any) => !dismissedNotifs.includes(app.id))
    .sort((a: any, b: any) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  const recommendedNegotiations = allNegotiations.filter((app: any) => matchedGroups.some((g:any) => g.id === (app.groupDocId || app.studentDocId)));

  let totalRevenue = 0;
  let demoFeesPaid = 0;
  let activeMRR = 0;
  const ledgerEntries: any[] = [];

  applicationsWithSubjects.forEach((app: any) => {
    // Track Demo Fee (Teacher Outflow)
    const hasPassedDemoPhase = ['demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status);
    if (hasPassedDemoPhase) {
      const dFee = 100; // Estimated fallback demo fee
      demoFeesPaid += dFee;
      ledgerEntries.push({
        id: `${app.id}_demo`,
        date: app.createdAt || Date.now(), // Approximate date
        studentName: app.studentName || 'Student',
        subject: app.category || 'General',
        amount: dFee,
        type: 'demo_fee_paid',
        isOutflow: true
      });
    }

    // Track First Month Fee (Teacher Inflow)
    if (app.status === 'tuition_started') {
      const fFee = app.finalPrice || 0;
      totalRevenue += fFee;
      activeMRR += fFee;
      ledgerEntries.push({
        id: `${app.id}_first_month`,
        date: app.updatedAt || Date.now(), // Approximate start date
        studentName: app.studentName || 'Student',
        subject: app.category || 'General',
        amount: fFee,
        type: 'first_month_received',
        isOutflow: false
      });
    }

    // Track Subsequent Manual Payments
    if (app.subsequentPayments && Array.isArray(app.subsequentPayments)) {
      app.subsequentPayments.forEach((pmt: any, index: number) => {
        totalRevenue += pmt.amount;
        ledgerEntries.push({
          id: `${app.id}_manual_${index}`,
          date: pmt.date || Date.now(),
          studentName: app.studentName || 'Student',
          subject: app.category || 'General',
          amount: pmt.amount,
          type: 'manual_payment',
          isOutflow: false
        });
      });
    }
  });

  ledgerEntries.sort((a, b) => b.date - a.date);

  const earningsData = {
    totalRevenue,
    demoFeesPaid,
    netRevenue: totalRevenue - demoFeesPaid,
    activeMRR,
    ledgerEntries
  };

  return {
    user,
    userData,
    tutorDocId: tutorId,
    globalLocks,
    profile: tutorData,
    teacherCategories,
    availableStudents: matchedGroups,
    allStudents: availableGroupsRaw,
    recommendedStudents: matchedGroups,
    applications: applicationsWithSubjects,
    marketplacePricing,
    notifications: allNotifications,
    referrals,
    negotiations: allNegotiations,
    allNegotiations,
    allNotifications,
    recommendedNegotiations,
    earningsData,
    demoClasses: applicationsWithSubjects.filter((app: any) => ['demo_booking_phase', 'demo_scheduled'].includes(app.status)).map((app: any) => ({
      id: app.id,
      app: app,
      student: app.studentName || (app.studentDocIds?.length > 1 ? 'Group' : 'Student'),
      subject: app.category || 'General',
      date: app.demoDate || 'TBD',
      status: app.status,
      studentDetails: app.studentDetails
    })),
    upcomingClasses: applicationsWithSubjects.filter((app: any) => ['tuition_started'].includes(app.status)).map((app: any) => ({
      id: app.id,
      app: app,
      student: app.studentName || 'Assigned Student',
      subject: app.category || 'General',
      date: app.nextPaymentDate || app.startDate || new Date().toISOString(),
      status: app.status === 'tuition_started' ? 'confirmed' : 'pending',
      studentDetails: app.studentDetails
    })),
    _baseData: baseData
  };
};
