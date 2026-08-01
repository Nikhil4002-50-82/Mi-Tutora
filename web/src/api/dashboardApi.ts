import { auth, db } from '@/utils/firebase/client';
import { doc, getDoc, collection, query, where, getDocs, setDoc, documentId, updateDoc, arrayRemove } from 'firebase/firestore';

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
      role: 'student',
      hasProfile: false,
      walletBalance: 0
    };
    await setDoc(userDocRef, userData);
  }
  
  const parentDocSnap = await getDoc(doc(db, 'parents', user.uid));
  const parentData = parentDocSnap.exists() ? parentDocSnap.data() : null;
  
  const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('parentId', '==', user.uid)));
  const applications = applicationsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const studentsSnap = await getDocs(query(collection(db, 'students'), where('parentId', '==', user.uid)));
  const students = studentsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  students.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
  const myStudent = students.length > 0 ? students[0] : null;

  const groupsSnap = await getDocs(query(collection(db, 'groups'), where('parentId', '==', user.uid)));
  const groups = groupsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const requestsSnap = await getDocs(query(collection(db, 'tuition_requests'), where('parentId', '==', user.uid)));
  const requests = requestsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  const myRequest = requests.length > 0 ? requests[0] : null;

  let availableTutorsRaw: any[] = [];
  try {
    const tutorsSnap = await getDocs(query(collection(db, 'tutors'), where('hasProfile', '==', true)));
    availableTutorsRaw = tutorsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  } catch(e) {
    console.warn("Failed to fetch tutors", e);
  }
  const availableTutors = availableTutorsRaw;

  const referralsSnap = await getDocs(query(collection(db, 'referrals'), where('referrerId', '==', user.uid)));
  const referrals = referralsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const pricingSnap = await getDocs(collection(db, 'marketplace_pricing'));
  const marketplacePricing = pricingSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const matchedTutors = availableTutors.filter((tutor: any) => {
    if (!myStudent) return true;
    const tutorCategories = tutor.category ? tutor.category.split(',').map((c: string) => c.trim()) : [];
    if (!tutorCategories.includes(myStudent.category)) return false;
    
    if (myStudent.category === 'school') {
      const boardMatch = !tutor.boards || tutor.boards.length === 0 || tutor.boards.includes(myStudent.board);
      const classMatch = !tutor.classes || tutor.classes.length === 0 || tutor.classes.includes(myStudent.classLevel);
      const studentSubjects = myStudent.subjects || [];
      const tutorSubjects = tutor.subjects || [];
      const subjectMatch = studentSubjects.length === 0 || tutorSubjects.length === 0 || 
                           studentSubjects.some((s: string) => tutorSubjects.some((ts: string) => ts.toLowerCase() === s.toLowerCase()));
      return (boardMatch || classMatch) && subjectMatch;
    }
    if (myStudent.category === 'programming') {
       const studentTechs = myStudent.technologies || [];
       const tutorTechs = tutor.technologies || [];
       return studentTechs.length === 0 || tutorTechs.length === 0 || studentTechs.some((t: string) => tutorTechs.includes(t));
    }
    if (myStudent.category === 'languages') {
       const studentLangs = myStudent.languages || [];
       const tutorLangs = tutor.languagesTaught || [];
       return studentLangs.length === 0 || tutorLangs.length === 0 || studentLangs.some((l: string) => tutorLangs.includes(l));
    }
    return true;
  }) || [];

  const tutorIds = applications.map((app: any) => app.tutorId).filter(Boolean);
  let tutorsInfo: any[] = [];
  if (tutorIds.length > 0) {
     for (let i = 0; i < tutorIds.length; i += 10) {
       const chunk = tutorIds.slice(i, i + 10);
       const tutorsQuery = query(collection(db, 'tutors'), where(documentId(), 'in', chunk));
       const tSnap = await getDocs(tutorsQuery);
       tutorsInfo = [...tutorsInfo, ...tSnap.docs.map(d => ({ id: d.id, ...d.data() }))];
     }
  }

  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  const applicationsWithSubjects = await Promise.all(applications.map(async (app: any) => {
    const tutor = tutorsInfo.find(t => t.id === app.tutorId);

    let currentStatus = app.status;
    // Auto-expire if teacher hasn't paid demo fee within 7 days
    if (currentStatus === 'demo_pending_payment' && (now - (app.updatedAt || app.createdAt || now)) > SEVEN_DAYS) {
      currentStatus = 'declined';
      try {
        await updateDoc(doc(db, 'applications', app.id), {
          status: 'declined',
          declinedAt: now,
          updatedAt: now,
          reason: 'auto_expired_demo_fee'
        });
        if (app.tutorId) await updateDoc(doc(db, 'tutors', app.tutorId), { pendingRequests: arrayRemove(app.id) });
        if (app.studentIds) {
          for (const sid of app.studentIds) {
            await updateDoc(doc(db, 'students', sid), { pendingRequests: arrayRemove(app.id) });
          }
        }
      } catch (e) {
        console.error('Failed to auto-expire application:', e);
      }
    }
    // Auto-expire if demo finished and 48 hours passed
    if (['demo_scheduled', 'waiting_for_parent_decision'].includes(currentStatus) && app.demoDate && app.demoTime) {
      const demoDateObj = new Date(app.demoDate);
      const timeParts = app.demoTime.split('||')[0].split(':');
      if (timeParts.length >= 2) {
        demoDateObj.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
        const demoEndTime = demoDateObj.getTime(); // triggers immediately at start time
        if (now > demoEndTime + 48 * 60 * 60 * 1000) {
          currentStatus = 'declined';
          try {
            await updateDoc(doc(db, 'applications', app.id), {
              status: 'declined',
              declinedAt: now,
              updatedAt: now,
              reason: 'auto_expired_demo_decision'
            });
            if (app.tutorId) await updateDoc(doc(db, 'tutors', app.tutorId), { pendingRequests: arrayRemove(app.id) });
            if (app.studentIds) {
              for (const sid of app.studentIds) {
                await updateDoc(doc(db, 'students', sid), { pendingRequests: arrayRemove(app.id) });
              }
            }
          } catch (e) {
            console.error('Failed to auto-expire application:', e);
          }
        } else if (now > demoEndTime && currentStatus === 'demo_scheduled') {
          currentStatus = 'waiting_for_parent_decision';
          try {
            await updateDoc(doc(db, 'applications', app.id), { status: 'waiting_for_parent_decision', updatedAt: now });
          } catch (e) { }
        }
      }
    }

    return { 
      ...app, 
      status: currentStatus,
      tutorDetails: tutor,
      subjects: tutor?.subjects || [],
      technologies: tutor?.technologies || [],
      languagesTaught: tutor?.languagesTaught || []
    };
  })) || [];

  const allNegotiations = applicationsWithSubjects.filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(app.status));
  const allNotifications = [
    ...applicationsWithSubjects
    .filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'declined', 'tuition_started'].includes(app.status))
    .sort((a: any, b: any) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
  ];
  const recommendedNegotiations = allNegotiations.filter(app => matchedTutors.some((t:any) => t.id === app.tutorId));

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
      studentId: app.studentId,
      studentName: app.studentName,
      date: app.demoDate || 'TBD',
      status: app.status,
      finalPrice: app.finalPrice || app.currentOffer || 4000,
      tutorDetails: app.tutorDetails
    })),
    upcomingClasses: applicationsWithSubjects.filter((app: any) => ['tuition_started'].includes(app.status)).map((app: any) => ({
      id: app.id,
      subject: app.category || 'General',
      teacher: app.tutorName || 'Assigned Tutor',
      studentId: app.studentId,
      studentName: app.studentName,
      date: app.nextPaymentDate || app.startDate || new Date().toISOString(),
      status: app.status,
      finalPrice: app.finalPrice || app.currentOffer || 4000,
      tutorDetails: app.tutorDetails
    }))
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
      role: 'teacher',
      hasProfile: false,
      walletBalance: 0
    };
    await setDoc(userDocRef, userData);
  }

  const tutorDocSnap = await getDoc(doc(db, 'tutors', user.uid));
  const tutorData = tutorDocSnap.exists() ? tutorDocSnap.data() : null;
  
  const applicationsSnap = await getDocs(query(collection(db, 'applications'), where('tutorId', '==', user.uid)));
  const applications = applicationsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const hiredAppsSnap = await getDocs(query(collection(db, 'applications'), where('status', '==', 'tuition_started')));
  const globallyHiredGroupIds = new Set();
  const globallyHiredStudentIds = new Set();
  hiredAppsSnap.docs.forEach(d => {
    const data = d.data();
    if (data.groupId) globallyHiredGroupIds.add(data.groupId);
    if (data.studentId) globallyHiredStudentIds.add(data.studentId);
    if (data.studentIds) data.studentIds.forEach((sid: string) => globallyHiredStudentIds.add(sid));
  });

  let availableStudentsRaw: any[] = [];
  try {
    const requestsSnap = await getDocs(collection(db, 'students'));
    availableStudentsRaw = requestsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    availableStudentsRaw.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch(e) {
    console.warn("Failed to fetch students", e);
  }

  const availableStudents = availableStudentsRaw;

  const teacherCategories = tutorData?.category ? tutorData.category.split(',').map((c:string) => c.trim()) : [];
  
  // Group students first
  const groupedStudentsMap = availableStudentsRaw.reduce((acc: any, student: any) => {
    const gId = student.groupId || `indv_${student.id}`;
    if (!acc[gId]) {
      acc[gId] = { 
        id: gId, 
        students: [], 
        totalBudget: 0,
        parentId: student.parentId,
        categories: []
      };
    }
    acc[gId].students.push(student);
    acc[gId].totalBudget += (parseInt(student.budget) || 0);
    if (student.category) acc[gId].categories.push(student.category);
    return acc;
  }, {});

  const availableGroupsRaw = Object.values(groupedStudentsMap).filter((g: any) => {
    if (globallyHiredGroupIds.has(g.id)) return false;
    if (g.students.some((s: any) => globallyHiredStudentIds.has(s.id))) return false;
    return true;
  }).map((g: any) => ({
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
      
      if (studentCat === 'school') {
        const studentBoard = (student.board || '').toLowerCase().trim();
        const teacherBoards = (tutorData.boards || []).map((b:string) => b.toLowerCase().trim());
        const boardMatch = !studentBoard || teacherBoards.includes(studentBoard);
        
        const studentClass = (student.classLevel || '').toLowerCase().trim();
        const teacherClasses = (tutorData.classes || []).map((c:string) => c.toLowerCase().trim());
        const classMatch = !studentClass || teacherClasses.includes(studentClass);
        
        const teacherSubjects = tutorData.subjects || [];
        const studentSubjects = student.subjects || [];
        let subjectMatch = false;
        if (studentSubjects.length > 0 && teacherSubjects.length > 0) {
          subjectMatch = studentSubjects.some((sub: string) => {
            const normalizedSub = sub.toLowerCase().replace(/[^a-z0-9]/g, '');
            return teacherSubjects.some((ts: string) => {
              const normalizedTs = ts.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (!normalizedSub || !normalizedTs) return false;
              return normalizedSub.includes(normalizedTs) || normalizedTs.includes(normalizedSub);
            });
          });
        } else {
          subjectMatch = studentSubjects.length === 0 || teacherSubjects.length === 0; 
        }
        
        return boardMatch || classMatch || subjectMatch;
      }

      if (studentCat === 'programming') {
        const teacherTech = tutorData.technologies || [];
        const studentTech = student.technologies || [];
        let techMatch = false;
        if (studentTech.length > 0 && teacherTech.length > 0) {
          techMatch = studentTech.some((tech: string) => teacherTech.includes(tech));
        } else {
          techMatch = studentTech.length === 0;
        }
        return techMatch;
      }

      if (studentCat === 'languages') {
        const teacherLang = tutorData.languagesTaught || tutorData.languages || [];
        const studentLang = student.languages || [];
        let langMatch = false;
        if (studentLang.length > 0 && teacherLang.length > 0) {
          langMatch = studentLang.some((lang: string) => teacherLang.includes(lang));
        } else {
          langMatch = studentLang.length === 0;
        }
        return langMatch;
      }
      
      return true;
    });
  });

  const referralsSnap = await getDocs(query(collection(db, 'referrals'), where('referrerId', '==', user.uid)));
  const referrals = referralsSnap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));

  const pricingSnap = await getDocs(collection(db, 'marketplace_pricing'));
  const marketplacePricing = pricingSnap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));

  const groupIds = applications.map((app: any) => app.groupId || app.studentId).filter(Boolean);
  const studentIds = applications.flatMap((app: any) => app.studentIds || [app.studentId]).filter(Boolean);

  let studentsInfo: any[] = [];
  if (studentIds.length > 0) {
    const uniqueStudentIds = Array.from(new Set(studentIds));
    for (let i = 0; i < uniqueStudentIds.length; i += 10) {
      const chunk = uniqueStudentIds.slice(i, i + 10);
      const studentsQuery = query(collection(db, 'students'), where(documentId(), 'in', chunk));
      const sSnap = await getDocs(studentsQuery);
      studentsInfo = [...studentsInfo, ...sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))];
    }
  }

  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  const applicationsWithSubjects = await Promise.all(applications.map(async (app: any) => {
    const student = studentsInfo.find(s => s.id === app.studentId);
    const appStudentsList = studentsInfo.filter(s => (app.studentIds || []).includes(s.id) || s.id === app.studentId);
    
    let currentStatus = app.status;
    // Auto-expire if teacher hasn't paid demo fee within 7 days
    if (currentStatus === 'demo_pending_payment' && (now - (app.updatedAt || app.createdAt || now)) > SEVEN_DAYS) {
      currentStatus = 'declined';
      try {
        await updateDoc(doc(db, 'applications', app.id), {
          status: 'declined',
          declinedAt: now,
          updatedAt: now,
          reason: 'auto_expired_demo_fee'
        });
        if (app.tutorId) await updateDoc(doc(db, 'tutors', app.tutorId), { pendingRequests: arrayRemove(app.id) });
        if (app.studentIds) {
          for (const sid of app.studentIds) {
            await updateDoc(doc(db, 'students', sid), { pendingRequests: arrayRemove(app.id) });
          }
        }
      } catch (e) {
        console.error('Failed to auto-expire application:', e);
      }
    }
    // Auto-expire if demo finished and 48 hours passed
    if (['demo_scheduled', 'waiting_for_parent_decision'].includes(currentStatus) && app.demoDate && app.demoTime) {
      const demoDateObj = new Date(app.demoDate);
      const timeParts = app.demoTime.split('||')[0].split(':');
      if (timeParts.length >= 2) {
        demoDateObj.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
        const demoEndTime = demoDateObj.getTime(); // triggers immediately at start time
        if (now > demoEndTime + 48 * 60 * 60 * 1000) {
          currentStatus = 'declined';
          try {
            await updateDoc(doc(db, 'applications', app.id), {
              status: 'declined',
              declinedAt: now,
              updatedAt: now,
              reason: 'auto_expired_demo_decision'
            });
            if (app.tutorId) await updateDoc(doc(db, 'tutors', app.tutorId), { pendingRequests: arrayRemove(app.id) });
            if (app.studentIds) {
              for (const sid of app.studentIds) {
                await updateDoc(doc(db, 'students', sid), { pendingRequests: arrayRemove(app.id) });
              }
            }
          } catch (e) {
            console.error('Failed to auto-expire application:', e);
          }
        } else if (now > demoEndTime && currentStatus === 'demo_scheduled') {
          currentStatus = 'waiting_for_parent_decision';
          try {
            await updateDoc(doc(db, 'applications', app.id), { status: 'waiting_for_parent_decision', updatedAt: now });
          } catch (e) { }
        }
      }
    }

    return { 
      ...app, 
      status: currentStatus,
      studentDetails: student,
      studentsList: appStudentsList,
      subjects: student?.subjects || [],
      technologies: student?.technologies || [],
      languages: student?.languages || []
    };
  })) || [];

  const allNegotiations = applicationsWithSubjects.filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(app.status));
  const allNotifications = applicationsWithSubjects
    .filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'declined', 'tuition_started'].includes(app.status))
    .sort((a: any, b: any) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  const recommendedNegotiations = allNegotiations.filter(app => matchedGroups.some((g:any) => g.id === (app.groupId || app.studentId)));

  let totalRevenue = 0;
  let demoFeesPaid = 0;
  let activeMRR = 0;
  const ledgerEntries: any[] = [];

  applicationsWithSubjects.forEach((app: any) => {
    // Track Demo Fee (Teacher Outflow)
    // If the application reached demo_scheduled or beyond, the teacher paid the demo fee.
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

  // Sort ledger by date descending
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
      student: app.studentName || (app.studentIds?.length > 1 ? 'Group' : 'Student'),
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
    }))
  };
};
