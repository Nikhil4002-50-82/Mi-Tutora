"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { motion } from 'motion/react';
import { CalendarDays, LayoutDashboard, LogOut, ShieldCheck, User, Users, Gift, Lock, CheckCircle2, MessageCircle, BookOpen, Menu, X, Globe, Star, Bell, Phone, Mail, MapPin, Target, Handshake, ChevronRight, ArrowRight, CreditCard } from 'lucide-react';
import TeacherForm from '@/components/TeacherForm';
import ActionModal from '@/components/ActionModal';
import MessageModal from '@/components/MessageModal';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { generateReferralCode } from '@/utils/referral';
import { calculateSuitabilityScore } from '@/utils/matching';
import { toast } from 'sonner';
const logo = '/imports/logo.png';

import useSWR from 'swr';

export const getStudentDemoFee = (student: any, pricingData: any[]) => {
  if (!student || !pricingData) return { price: 100, name: 'General Tuition' };
  
  let targetId = 'general';
  const cat = student.category || '';
  
  if (cat === 'school') {
    const cl = (student.classLevel || '').toLowerCase();
    if (cl.includes('lkg')) targetId = 'school_lkg';
    else if (cl.includes('ukg')) targetId = 'school_ukg';
    else {
      const match = cl.match(/\d+/);
      if (match) targetId = `school_class_${match[0]}`;
    }
  } else if (cat === 'competitive') {
    const goal = (student.learningGoal || student.board || '').toLowerCase();
    if (goal.includes('neet')) targetId = 'competitive_neet';
    else if (goal.includes('jee')) targetId = 'competitive_jee';
    else if (goal.includes('ssc')) targetId = 'competitive_ssc';
    else if (goal.includes('upsc')) targetId = 'competitive_upsc';
    else if (goal.includes('cat')) targetId = 'competitive_cat';
    else if (goal.includes('gate')) targetId = 'competitive_gate';
    else if (goal.includes('bank')) targetId = 'competitive_banking';
  } else if (cat === 'programming') {
    targetId = 'programming_intermediate';
  } else if (cat === 'languages') {
    targetId = 'languages_general';
  }

  const found = pricingData.find(p => p.id === targetId);
  if (found) {
    let name = found.displayName;
    name = name.replace(/School Tuition/i, 'demo fee').replace(/Preparation/i, 'demo fee').replace(/Tuition/i, 'demo fee');
    return { price: found.price, name };
  }
  return { price: 100, name: 'General demo fee' };
};

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [hasDismissedReminder, setHasDismissedReminder] = useState(false);
  const [selectedViewUser, setSelectedViewUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tuitionSubTab, setTuitionSubTab] = useState<'all'|'recommendation'>('recommendation');
  const [subTab, setSubTab] = useState<string>('');
  const [negotiationOffer, setNegotiationOffer] = useState<{ [key: string]: string }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [activeRequestViewId, setActiveRequestViewId] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'price' as 'price'|'timing', title: '', description: '', placeholder: '', initialValue: '', min: undefined as number | undefined, max: undefined as number | undefined, onSubmit: (val: string, date?: string, time?: string) => {} });
  const [messageModalConfig, setMessageModalConfig] = useState({ isOpen: false, title: '', message: '' });
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [payingClass, setPayingClass] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const router = useRouter();

  const fetcher = async () => {
    const { auth, db } = await import('@/utils/firebase/client');
    const { doc, getDoc, collection, query, where, getDocs, setDoc, orderBy } = await import('firebase/firestore');
    
    await new Promise(resolve => auth.onAuthStateChanged(resolve));
    const user = auth.currentUser;
    
    if (!user) {
      router.push('/login');
      throw new Error('Unauthenticated');
    }

    let userDocRef = doc(db, 'users', user.uid);
    let userDocSnap = await getDoc(userDocRef);
    let userData = userDocSnap.exists() ? userDocSnap.data() : null;
    
    if (userData && userData.role !== 'teacher') {
      window.location.href = '/dashboard/student';
      throw new Error('Unauthorized');
    }

    if (!userData) {
      console.log("userData not found! Attempting insert.");
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

    let availableStudentsRaw: any[] = [];
    try {
      const requestsSnap = await getDocs(collection(db, 'students'));
      availableStudentsRaw = requestsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      availableStudentsRaw.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
      const { documentId } = await import('firebase/firestore');
      const uniqueStudentIds = Array.from(new Set(studentIds));
      for (let i = 0; i < uniqueStudentIds.length; i += 10) {
        const chunk = uniqueStudentIds.slice(i, i + 10);
        const studentsQuery = query(collection(db, 'students'), where(documentId(), 'in', chunk));
        const sSnap = await getDocs(studentsQuery);
        studentsInfo = [...studentsInfo, ...sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))];
      }
    }

    const applicationsWithSubjects = applications.map((app: any) => {
      const student = studentsInfo.find(s => s.id === app.studentId);
      const appStudentsList = studentsInfo.filter(s => (app.studentIds || []).includes(s.id) || s.id === app.studentId);
      return { 
        ...app, 
        studentDetails: student,
        studentsList: appStudentsList,
        subjects: student?.subjects || [],
        technologies: student?.technologies || [],
        languages: student?.languages || []
      };
    }) || [];

    const allNegotiations = applicationsWithSubjects.filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment'].includes(app.status));
    const allNotifications = applicationsWithSubjects
      .filter((app: any) => ['negotiating', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'declined', 'tuition_started'].includes(app.status))
      .sort((a: any, b: any) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
    const recommendedNegotiations = allNegotiations.filter(app => matchedGroups.some((g:any) => g.id === (app.groupId || app.studentId)));

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
      upcomingClasses: applicationsWithSubjects.filter((app: any) => ['tuition_started', 'demo_booked'].includes(app.status)).map((app: any) => ({
        id: app.id,
        student: app.studentName || 'Assigned Student',
        subject: app.category || 'General',
        date: app.nextPaymentDate || app.startDate || new Date().toISOString(),
        status: app.status === 'tuition_started' ? 'confirmed' : 'pending',
        studentDetails: app.studentDetails
      }))
    };
  };

  const { data, error: swrError, isLoading: loading, mutate } = useSWR('teacherDashboardData', fetcher);


  const hasProfile = data?.userData?.hasProfile || !!data?.profile?.phone || false;

  const initialRedirectDone = useRef(false);

  useEffect(() => {
    if (data && !hasProfile && !initialRedirectDone.current) {
      initialRedirectDone.current = true;
      setActiveTab('new_tuition');
      const storedCat = localStorage.getItem('selectedCategory');
      if (!storedCat) {
        setShowCategoryPopup(true);
      } else {
        setSelectedCategory(storedCat);
      }
    }
  }, [data, hasProfile]);

  const handleCategorySelect = (cat: string) => {
    localStorage.setItem('selectedCategory', cat);
    setSelectedCategory(cat);
    setShowCategoryPopup(false);
  };

  const [isGeneratingRef, setIsGeneratingRef] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (data && !hasProfile && !showCategoryPopup && !hasDismissedReminder && activeTab === 'new_tuition') {
      const timer = setTimeout(() => {
        setShowProfileReminder(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [data, hasProfile, showCategoryPopup, hasDismissedReminder, activeTab]);

  useEffect(() => {
    const existingCode = data?.userData?.referralCode || data?.userData?.referralcode;
    if (data && !existingCode && !isGeneratingRef && data.user) {
      const generateCode = async () => {
        setIsGeneratingRef(true);
        try {
          const { db } = await import('@/utils/firebase/client');
          const { doc, updateDoc } = await import('firebase/firestore');
          const baseName = data?.profile?.name || data?.user?.displayName || 'USER';
          const newCode = generateReferralCode(baseName, data.user.uid);
          
          mutate({ ...data, userData: { ...data.userData, referralCode: newCode, referralcode: newCode } }, false);
          
          await updateDoc(doc(db, 'users', data.user.uid), { referralCode: newCode });
          
          toast.success("Generated referral code: " + newCode);
          mutate();
        } catch (e: any) {
          toast.error("Failed to generate referral code: " + e.message);
        }
      };
      generateCode();
    }
  }, [data?.userData?.referralCode, data?.userData?.referralcode, data?.user, data?.profile?.name, mutate, data, isGeneratingRef]);

  useEffect(() => {
    if ((data?.teacherCategories?.length ?? 0) > 0 && !subTab) {
      setSubTab(data?.teacherCategories?.[0] || '');
    }
  }, [data?.teacherCategories, subTab]);

  useEffect(() => {
    const processSilentSubmission = async () => {
      const savedTeacherData = localStorage.getItem('teacherFormData');
      if (savedTeacherData && data?.user) {
        try {
          const { db } = await import('@/utils/firebase/client');
          const { doc, getDoc, updateDoc, setDoc } = await import('firebase/firestore');
          const parsedData = JSON.parse(savedTeacherData);
          const user = data.user;
          
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          const existingCode = userDocSnap.exists() && userDocSnap.data().referralCode;
          const newCode = existingCode || generateReferralCode(parsedData.fullName, user.uid);
          await setDoc(userDocRef, { hasProfile: true, referralCode: newCode }, { merge: true });

          await updateDoc(doc(db, 'tutors', user.uid), {
            category: parsedData.category || '',
            name: parsedData.fullName,
            gender: parsedData.gender,
            phone: parsedData.phone,
            whatsapp: parsedData.whatsapp,
            address: parsedData.address,
            qualification: parsedData.qualification,
            experience: parsedData.experience,
            occupation: parsedData.occupation,
            subjects: parsedData.subjects || [],
            classes: parsedData.classes || [],
            boards: parsedData.boards || [],
            technologies: parsedData.technologies || [],
            languagesTaught: parsedData.languages || [],
            mode: parsedData.mode,
            teachingApproach: parsedData.description,
            studentCount: parsedData.studentsCount,
            schoolNames: parsedData.schoolNames,
            preferredLocations: parsedData.locations,
            travelDistance: parsedData.travelKm,
            feeRange: parsedData.feeRange,
            hasProfile: true
          });
          localStorage.removeItem('teacherFormData');
          mutate();
        } catch (e) {
          console.error("Failed to silently submit profile data", e);
        }
      }
    };
    processSilentSubmission();
  }, [data?.user?.uid, mutate]);

  useEffect(() => {
    if (!data?.user) return;
    let unsubscribe: any;
    const setupRealtime = async () => {
      const { db } = await import('@/utils/firebase/client');
      const { collection, query, where, onSnapshot } = await import('firebase/firestore');
      
      const q = query(collection(db, 'applications'), where('tutorId', '==', data.user.uid));
      unsubscribe = onSnapshot(q, () => {
        mutate();
      });
    };
    setupRealtime();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [data?.user?.uid, mutate]);

  const handleLogout = async () => {
    const { auth } = await import('@/utils/firebase/client');
    await auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out successfully!");
    window.location.href = '/login';
  };

  const handlePaymentSubmit = async () => {
    setPaymentLoading(true);
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      // Update application directly to tuition_started
      if (payingClass?.id && payingClass.id !== 'mock-id') {
        await updateDoc(doc(db, 'applications', payingClass.id), { 
          status: 'tuition_started', 
          demoPaymentPaid: true,
          startDate: new Date().toLocaleDateString('en-GB'),
          updatedAt: Date.now()
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Payment completed successfully! Demo Booked.");
      setPayingClass(null);
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dailyRequestsCount = data?.applications?.filter((app: any) => app.initiator === 'teacher' && app.createdAt >= todayStart.getTime()).length || 0;

  const handleSendOffer = async (student: any) => {
    if (dailyRequestsCount >= 5) {
      toast.error("You have reached your daily limit of 5 requests. Upgrade to a subscription to send more!");
      setActiveTab('subscriptions');
      return;
    }
    if (offerLoading) return;
    const offerPrice = parseInt(negotiationOffer[student.id]);
    if (!offerPrice || offerPrice <= 0) return toast.error("Please enter a valid offer price.");

    if (student.budget && offerPrice < student.budget) {
      setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `Since you cannot decrease the price, the minimum you can offer is Rs. ${student.budget}. Please adjust your offer.` });
      return;
    }
    if (student.budget && offerPrice > student.budget * 1.4) {
      setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The maximum you can offer is Rs. ${Math.floor(student.budget * 1.4)} (140% of the student's budget). Please adjust your offer.` });
      return;
    }

    if (!hasProfile) {
      toast.error("Please complete your profile first.");
      setActiveTab('profile');
      return;
    }

    try {
      setOfferLoading(true);
      const { db, auth } = await import('@/utils/firebase/client');
      const { collection, addDoc } = await import('firebase/firestore');
      const user = auth.currentUser;

      await addDoc(collection(db, 'applications'), {
        tutorId: user?.uid,
        tutorName: data?.profile?.name,
        requestId: '',
        parentId: student.parentId,
        studentId: student.id,
        groupId: student.id,
        studentIds: student.students ? student.students.map((s:any)=>s.id) : [student.id],
        studentName: student.name,
        currentOffer: offerPrice,
        initialBudget: student.budget || offerPrice,
        absoluteMin: student.budget || offerPrice,
        absoluteMax: student.budget ? Math.floor(student.budget * 1.4) : Math.floor(offerPrice * 1.4),
        initiator: 'teacher',
        lastUpdatedBy: 'tutor',
        status: 'negotiating',
        source: 'direct',
        category: student.category,
        mode: student.students ? student.students[0].preferredMode : (student.preferredMode || 'flexible'),
        demoHours: student.students ? student.students[0].hoursPerDay : (student.hoursPerDay || student.preferredTimeRange || 'Flexible'),
        createdAt: Date.now()
      });

      toast.success("Offer sent successfully!");
      mutate();
    } catch (e: any) {
      toast.error("Error sending offer: " + e.message);
    } finally {
      setOfferLoading(false);
    }
  };

  const handleDirectRequestDemo = async (student: any) => {
    if (dailyRequestsCount >= 5) {
      toast.error("You have reached your daily limit of 5 requests. Upgrade to a subscription to send more!");
      setActiveTab('subscriptions');
      return;
    }
    if (offerLoading) return;
    if (!hasProfile) {
      toast.error("Please complete your profile first.");
      setActiveTab('profile');
      return;
    }

    try {
      setOfferLoading(true);
      const { db, auth } = await import('@/utils/firebase/client');
      const { collection, addDoc } = await import('firebase/firestore');
      const user = auth.currentUser;

      const offerPrice = student.budget || 500;

      await addDoc(collection(db, 'applications'), {
        tutorId: user?.uid,
        tutorName: data?.profile?.name,
        requestId: '',
        parentId: student.parentId,
        studentId: student.id,
        groupId: student.id,
        studentIds: student.students ? student.students.map((s:any)=>s.id) : [student.id],
        studentName: student.name,
        currentOffer: offerPrice,
        finalPrice: offerPrice,
        initialBudget: student.budget,
        absoluteMin: Math.ceil(offerPrice * 0.6),
        absoluteMax: student.budget ? Math.floor(student.budget * 1.2) : Math.floor(offerPrice * 1.2),
        lastUpdatedBy: 'tutor',
        status: 'demo_requested_by_teacher',
        source: 'direct',
        category: student.category,
        mode: student.students ? student.students[0].preferredMode : (student.preferredMode || 'flexible'),
        demoHours: student.students ? student.students[0].hoursPerDay : (student.hoursPerDay || student.preferredTimeRange || 'Flexible'),
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      toast.success("Demo requested successfully!");
      mutate();
    } catch (e: any) {
      toast.error("Error requesting demo: " + e.message);
    } finally {
      setOfferLoading(false);
    }
  };
  const handleNegotiationAction = async (appId: string, action: string, newOffer?: number, neg?: any, date?: string, time?: string) => {
    if (action === 'counter_price' && newOffer && neg) {
      const minAllowed = neg.absoluteMin || (neg.initialBudget || 0);
      const maxAllowed = neg.absoluteMax || Math.floor((neg.initialBudget || 0) * 1.4);
      if (newOffer < minAllowed) {
        setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The absolute minimum you can offer is Rs. ${minAllowed}. Please adjust your offer.` });
        return;
      }
      if (newOffer > maxAllowed) {
        setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The absolute maximum you can offer is Rs. ${maxAllowed}. Please adjust your offer.` });
        return;
      }
    }
    
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const updateData: any = {};
      if (action === 'accept_price' || action === 'request_demo') {
        updateData.status = 'demo_requested_by_teacher';
        if (newOffer) updateData.finalPrice = newOffer;
        updateData.lastUpdatedBy = 'tutor';
      } else if (action === 'counter_price') {
        updateData.currentOffer = newOffer;
        updateData.lastUpdatedBy = 'tutor';
      } else if (action === 'decline') {
        updateData.status = 'declined';
        updateData.declinedAt = Date.now();
      }
      updateData.updatedAt = Date.now();

      await updateDoc(doc(db, 'applications', appId), updateData);
      toast.success(action === 'decline' ? 'Offer declined.' : `Successfully ${action === 'accept_price' ? 'accepted deal' : 'sent counter offer'}!`);
      mutate();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  if (!data && swrError) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">Error loading dashboard: {swrError.message}</div>;
  if (!data) return <LoadingScreen />;

  const handleWithdrawSubmit = async () => {
    if (!upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    setWithdrawLoading(true);
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, addDoc, collection, updateDoc } = await import('firebase/firestore');
      const currentBalance = data?.userData?.walletBalance || 0;
      
      if (currentBalance < 1000) {
        throw new Error('Minimum withdrawal amount is ₹1000');
      }
      
      await addDoc(collection(db, 'withdrawals'), {
        userId: data?.user?.uid,
        amount: currentBalance,
        upiId: upiId,
        status: 'pending',
        createdAt: Date.now()
      });
      
      await updateDoc(doc(db, 'users', data?.user?.uid as string), { walletBalance: 0 });
      
      toast.success('Withdrawal request submitted successfully!');
      setWithdrawModal(false);
      setUpiId('');
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_tuition', label: 'New Tuition', icon: Globe },
    { id: 'requests', label: 'Requests & Offers', icon: Handshake },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'my_students', label: 'My Students', icon: BookOpen },
    { id: 'referrals', label: 'Referrals', icon: Gift },
  ];

  const activeTeacher = data?.profile || data?.user || null;
  const allStudentsWithScores = (data?.allStudents || []).map((student: any) => ({
    ...student,
    suitabilityScore: calculateSuitabilityScore(student, activeTeacher)
  })).sort((a: any, b: any) => {
      const getStatus = (studentId: string) => {
          const app = data?.applications?.find((app: any) => app.studentId === studentId || app.groupId === studentId);
          if (!app) return '';
          if (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))) {
              return 'locked';
          }
          return app.status;
      };
      const getScore = (status: string) => {
          if (status === 'locked' || status === 'declined') return -1000;
          if (['pending', 'negotiating', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment'].includes(status)) return 1000;
          return 0;
      };
      const statusDiff = getScore(getStatus(b.id)) - getScore(getStatus(a.id));
      if (statusDiff !== 0) return statusDiff;
      
      return b.suitabilityScore - a.suitabilityScore;
  }).map((student: any, index: number) => ({
      ...student,
      rank: index + 1
  }));

  const computedRecommendedStudents = allStudentsWithScores.filter((student: any) => student.suitabilityScore >= 40);

  if (loading && !data) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-gradient-to-r from-[#063831] to-[#04241f] text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-emerald-400" />
          <span className="font-black text-xl tracking-tight">Teacher</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-white hover:bg-white/10 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR (Desktop & Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 bg-gradient-to-b from-[#063831] to-[#04241f] text-white flex flex-col border-r border-white/5 shadow-2xl md:shadow-xl z-50`}>
        <div className="p-6 border-b border-white/10 flex flex-col items-start gap-4">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-emerald-400" />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight leading-none">MiTutora</span>
                <span className="text-[#00a992] text-[10px] font-bold uppercase tracking-widest mt-1">Teacher</span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-white/70 hover:text-white bg-white/5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = !hasProfile && item.id !== 'profile';
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLocked) {
                    toast.error("Please complete your profile first!");
                    return;
                  }
                  setActiveTab(item.id);
                  setActiveRequestViewId(null);
                  setIsMobileMenuOpen(false);
                }}
                disabled={isLocked}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isLocked ? "opacity-50 cursor-not-allowed text-gray-400" :
                  isActive 
                    ? "bg-[#00a992] text-white shadow-lg shadow-[#00a992]/20" 
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-400"}`} />
                {item.label}
                {isLocked && <Lock className="w-4 h-4 ml-auto opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-white/10 flex items-center gap-3 bg-white/5">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-lg shadow-inner">
            {(data?.profile?.name || data?.user?.displayName || 'T').charAt(0)}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="font-bold text-sm truncate">{data?.profile?.name || data?.user?.displayName || 'Teacher'}</p>
            <p className="text-xs text-emerald-400 font-medium">Teacher Account</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      {showCategoryPopup && !hasProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 md:p-10 shadow-2xl max-w-lg w-full text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4">What do you teach?</h2>
            <p className="text-slate-500 mb-8">Select a category to discover students looking for your expertise.</p>
            <div className="space-y-4">
              <button onClick={() => handleCategorySelect('school')} className="w-full py-4 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-lg transition-colors border border-emerald-200">School / Academics</button>
              <button onClick={() => handleCategorySelect('programming')} className="w-full py-4 px-6 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-lg transition-colors border border-purple-200">Programming / IT</button>
              <button onClick={() => handleCategorySelect('languages')} className="w-full py-4 px-6 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-lg transition-colors border border-blue-200">Languages</button>
            </div>
          </div>
        </div>
      )}
      {/* Profile Completion Reminder Modal */}
      {showProfileReminder && !hasProfile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-5 md:p-10 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-32 bg-[#00a992] -z-10"></div>
            <button 
              onClick={() => { setShowProfileReminder(false); setHasDismissedReminder(true); }}
              className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors z-10"
            >
              ✕
            </button>
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg mt-4 ring-4 ring-[#00a992]/20">
              <User className="w-10 h-10 text-[#00a992]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Complete Your Profile</h2>
            <p className="text-gray-500 mb-8 font-medium">To unlock the ability to send requests and fully explore our platform, please complete your profile settings first.</p>
            <button 
              onClick={() => {
                setShowProfileReminder(false);
                setHasDismissedReminder(true);
                setActiveTab('profile');
              }}
              className="w-full bg-[#00a992] text-white hover:bg-[#008f7b] font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              Go to Profile Settings
            </button>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col relative">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer" ref={notificationsRef} onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 768) setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen) }}>
              <button className="text-gray-400 hover:text-emerald-600 transition-colors relative mt-1">
                <Bell className="w-5 h-5" />
                {((data?.allNotifications)?.length ?? 0) > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>
              
              <div 
                className={`absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-200 z-50 overflow-hidden transform origin-top-right ${isNotificationsDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'} md:group-hover:opacity-100 md:group-hover:visible md:group-hover:scale-100`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">{data?.allNotifications?.length || 0} New</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {((data?.allNotifications)?.length ?? 0) > 0 ? (
                    data?.allNotifications?.slice(0, 3).map((neg: any, idx: number) => {
                      return (
                        <div key={idx} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setActiveRequestViewId(neg.id); setActiveTab('requests'); setIsNotificationsDropdownOpen(false); }}>
                          <p className="text-sm text-gray-800 font-medium line-clamp-2">
                            {neg.status === 'declined' ? (
                              <span>Request declined with <span className="font-bold">{neg.studentName || 'Student'}</span></span>
                            ) : neg.status === 'tuition_started' ? (
                              <span>Fees paid by <span className="font-bold">{neg.studentName || 'Student'}</span></span>
                            ) : (
                              <span>New update on request with <span className="font-bold">{neg.studentName || 'Student'}</span></span>
                            )}
                          </p>
                          <p className="text-xs text-emerald-600 font-bold mt-1">Price: ₹{neg.finalPrice || neg.currentOffer}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No new notifications
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                  <button 
                    onClick={() => { setActiveTab('notifications'); setIsNotificationsDropdownOpen(false); }}
                    className="w-full text-center px-4 py-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    Show all notifications
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative group cursor-pointer" ref={profileRef} onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 768) setIsProfileDropdownOpen(!isProfileDropdownOpen) }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#063831] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-transparent group-hover:ring-emerald-500 transition-all">
                  {(data?.profile?.name || data?.user?.displayName || 'T').charAt(0)}
                </div>
              </div>
              
              <div 
                className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-200 z-50 overflow-hidden transform origin-top-right ${isProfileDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'} md:group-hover:opacity-100 md:group-hover:visible md:group-hover:scale-100`}
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                   <p className="font-bold text-sm text-gray-900 truncate">{data?.profile?.name || data?.user?.displayName || 'Teacher'}</p>
                   <p className="text-xs text-gray-500 truncate mt-0.5">{data?.user?.email}</p>
                 </div>
                 <div className="p-2">
                   <button onClick={() => { setActiveTab('profile'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <User className="w-4 h-4" /> Profile Settings
                   </button>
                   <button onClick={() => { setActiveTab('my_students'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <BookOpen className="w-4 h-4" /> My Students
                   </button>
                   <button onClick={() => { setActiveTab('subscriptions'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <CreditCard className="w-4 h-4" /> Subscriptions
                   </button>
                   <div className="h-px bg-gray-100 my-1 mx-2"></div>
                   <button onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors">
                     <LogOut className="w-4 h-4" /> Logout
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </header>

        <ActionModal {...modalConfig} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
        <MessageModal {...messageModalConfig} onClose={() => setMessageModalConfig(prev => ({ ...prev, isOpen: false }))} />
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 w-full flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (() => {
              const profileCompleteness = (() => {
                if (!hasProfile) return 10;
                const fields = [
                  data?.profile?.name,
                  data?.profile?.gender,
                  data?.profile?.phone || data?.profile?.whatsapp,
                  data?.profile?.email,
                  data?.profile?.qualification,
                  data?.profile?.experience,
                  data?.profile?.category,
                  data?.profile?.mode,
                  data?.profile?.subjects?.length > 0 || data?.profile?.technologies?.length > 0 || data?.profile?.languagesTaught?.length > 0 || data?.profile?.languages?.length > 0 ? true : false,
                  data?.profile?.occupation
                ];
                const filled = fields.filter(f => f && String(f).trim() !== '' && f !== false).length;
                return Math.max(10, Math.round((filled / fields.length) * 100));
              })();
              
              const myActiveStudents = data?.upcomingClasses || [];

              return (
                <div className="flex flex-col gap-8 h-full pb-10">
                  {/* Hero Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 mb-2">
                        Hello {data?.profile?.name?.split(' ')[0] || data?.user?.displayName?.split(' ')[0] || 'Teacher'}! <span className="text-4xl animate-bounce origin-bottom-right">👋</span>
                      </h1>
                      <p className="text-gray-500 text-lg">Nice to have you back, what an exciting day! Get ready to continue your teaching journey.</p>
                    </div>

                    {/* Profile Completeness Card */}
                    <div 
                      onClick={() => setActiveTab('profile')}
                      className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm md:w-80 flex-shrink-0 flex items-start gap-4 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-gray-900 text-sm">Strengthen your profile</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 leading-snug">You're {profileCompleteness}% there! Add missing details to stand out.</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00a992] rounded-full transition-all duration-1000 ease-out" style={{ width: `${profileCompleteness}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-[#00a992]">{profileCompleteness}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Split Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left: My Students */}
                    <div className="lg:col-span-2 space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">My Students</h2>
                      
                      {myActiveStudents.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-10 h-10 text-emerald-500" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No students chosen yet</h3>
                          <p className="text-gray-500 max-w-sm mb-8">Explore our catalog of students and find the perfect match to start your teaching journey.</p>
                          <button 
                            onClick={() => setActiveTab('new_tuition')}
                            className="bg-[#00a992] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#008f7b] transition-all shadow-lg shadow-[#00a992]/20 flex items-center gap-2"
                          >
                            <Globe className="w-5 h-5" /> Explore Students
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {myActiveStudents.slice(0, 3).map((cls: any) => (
                            <div key={cls.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0">
                                  {cls.student?.charAt(0) || 'S'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 truncate">{cls.student}</h4>
                                  <p className="text-sm text-gray-500 truncate">{cls.subject}</p>
                                </div>
                              </div>
                              <button onClick={() => { if(cls.studentDetails) setSelectedViewUser(cls.studentDetails); else setActiveTab('my_students'); }} className="text-gray-700 font-bold text-sm bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 flex-shrink-0">
                                View
                              </button>
                            </div>
                          ))}
                          {myActiveStudents.length > 3 && (
                            <button onClick={() => setActiveTab('my_students')} className="text-sm font-bold text-gray-500 hover:text-[#00a992] py-2 text-center w-full">
                              View all {myActiveStudents.length} students →
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Recommended Students */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">Recommended Students</h2>
                      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                        {computedRecommendedStudents.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-gray-500 text-sm">No recommendations yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {computedRecommendedStudents.filter((student: any) => {
                              const lockedApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === student.id && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                              return !lockedApp;
                            }).slice(0, 4).map((student: any, index: number) => {
                              const offerApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === student.id && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                              
                              const isLocked = !!offerApp;
                              const isRed = false; 
                              const labelText = offerApp?.lastUpdatedBy === 'tutor' ? 'Offer Sent' : 'Offer Received';

                              return (
                                <div key={student.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3 relative">
                                  {isLocked && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-end pr-2 rounded-lg">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isRed ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {labelText}
                                        </span>
                                    </div>
                                  )}
                                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 text-xs flex-shrink-0">
                                    #{student.rank}
                                  </div>
                                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0">
                                    {student.name?.charAt(0) || 'S'}
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{student.name || 'Student'}</h4>
                                    <p className="text-xs text-gray-500 truncate">{student.subjects ? student.subjects.join(', ') : student.category}</p>
                                  </div>
                                  <button onClick={() => setSelectedViewUser(student)} className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 flex-shrink-0">
                                    View
                                  </button>
                                </div>
                              );
                            })}
                            {computedRecommendedStudents.length > 4 && (
                              <div className="pt-4 mt-2">
                                <button onClick={() => setActiveTab('new_tuition')} className="w-full text-center text-xs font-bold text-gray-500 hover:text-[#00a992]">
                                  See more recommendations
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* TAB: NEW TUITION */}
            {activeTab === 'new_tuition' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    {tuitionSubTab === 'all' ? 'All Students' : 'Recommended Students'}
                  </h2>
                  <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner w-full sm:w-auto overflow-x-auto">
                    <button 
                      onClick={() => setTuitionSubTab('all')} 
                      className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tuitionSubTab === 'all' ? 'bg-white text-[#00a992] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setTuitionSubTab('recommendation')} 
                      className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tuitionSubTab === 'recommendation' ? 'bg-white text-[#00a992] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Recommendation
                    </button>
                  </div>
                </div>

                <div>
                  {data?.teacherCategories?.length > 1 && (
                      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-1">
                        {data?.teacherCategories?.map((cat: string) => (
                          <button
                            key={cat}
                            onClick={() => setSubTab(cat)}
                            className={`px-4 py-2 text-sm font-bold rounded-t-lg capitalize ${
                              subTab === cat 
                                ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500" 
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {((tuitionSubTab === 'all' ? allStudentsWithScores : computedRecommendedStudents)?.filter((s:any) => {
                          if (!hasProfile && selectedCategory) return s.category === selectedCategory;
                          return data?.teacherCategories?.length > 1 ? s.category === subTab : true;
                        }) || []).sort((a: any, b: any) => {
                          const getStatus = (groupId: string) => {
                              const app = data?.applications?.find((app: any) => (app.groupId || app.studentId) === groupId);
                              if (!app) return '';
                              if (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))) {
                                  return 'locked';
                              }
                              return app.status;
                          };
                          const getScore = (status: string) => {
                              if (status === 'locked' || status === 'declined') return -1;
                              if (['pending', 'negotiating', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment'].includes(status)) return 1;
                              return 0;
                          };
                          return getScore(getStatus(b.id)) - getScore(getStatus(a.id));
                        }).map((group: any) => {
                          const firstStudent = group.students?.[0] || {};
                          const parentName = firstStudent.guardianName || firstStudent.parentName || 'Parent';
                          const address = firstStudent.preferredMode?.toLowerCase() === 'online' 
                                ? 'Online' 
                                : `Offline • ${firstStudent.area || firstStudent.address || 'Location Hidden'}`;
                          const numStudents = group.students?.length || 1;

                          const lockedApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === group.id && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                          const offerApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === group.id && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                          
                          const isPending = data?.applications?.some((app: any) => (app.groupId || app.studentId) === group.id && ['demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
                          const isHired = data?.applications?.some((app: any) => (app.groupId || app.studentId) === group.id && ['tuition_started'].includes(app.status));
                          
                          const isLocked = !!lockedApp || !!offerApp;
                          const isRed = !!lockedApp;
                          const labelText = isRed ? 'Locked' : (offerApp?.lastUpdatedBy === 'tutor' ? 'Offer Sent' : 'Offer Received');
                          const subText = isRed ? (lockedApp?.declinedAt ? `Available in ${Math.ceil((lockedApp.declinedAt + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))} days` : 'Currently unavailable') : (offerApp?.lastUpdatedBy === 'tutor' ? 'Waiting for response...' : 'Waiting to analyze...');

                          return (
                            <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden relative">
                              {isLocked && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isRed ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                    <Lock className={`w-5 h-5 ${isRed ? 'text-red-600' : 'text-emerald-600'}`} />
                                  </div>
                                  <h4 className="font-bold text-gray-900 text-sm mb-1">{labelText}</h4>
                                  <p className="text-xs text-gray-600 font-medium">
                                    {subText}
                                  </p>
                                </div>
                              )}
                              
                              <div className="bg-[#00a992] p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {group.rank && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md flex-shrink-0 ${group.rank === 1 ? 'bg-yellow-400 text-yellow-900' : group.rank === 2 ? 'bg-gray-300 text-gray-800' : group.rank === 3 ? 'bg-amber-600 text-white' : 'bg-white/20 text-white'}`}>
                                      #{group.rank}
                                    </div>
                                  )}
                                  <h3 className="text-lg font-bold text-white truncate">{parentName}</h3>
                                </div>
                                <span className="px-2 py-1 bg-white/20 text-white text-[10px] font-bold rounded border border-white/30 uppercase tracking-wider flex-shrink-0">
                                  {group.category || 'Student'}
                                </span>
                              </div>
                              
                              <div className="p-6 flex flex-col flex-grow">
                                <div className="mb-6">
                                  <h4 className="font-bold text-gray-900 text-lg">{group.name || 'Group'}</h4>
                                  <div className="text-sm text-gray-600 mt-2 grid grid-cols-1 gap-y-1">
                                    {firstStudent.classLevel && <span><strong className="text-gray-400">Class:</strong> {firstStudent.classLevel}</span>}
                                    {(!group.category || group.category === 'school') && (firstStudent.subjects?.length ?? 0) > 0 && <span><strong className="text-gray-400">Sub:</strong> {firstStudent.subjects[0]}{firstStudent.subjects.length > 1 ? '...' : ''}</span>}
                                    {group.category === 'programming' && (firstStudent.technologies?.length ?? 0) > 0 && <span><strong className="text-gray-400">Tech:</strong> {firstStudent.technologies[0]}{firstStudent.technologies.length > 1 ? '...' : ''}</span>}
                                    {group.category === 'languages' && (firstStudent.languages?.length ?? 0) > 0 && <span><strong className="text-gray-400">Lang:</strong> {firstStudent.languages[0]}{firstStudent.languages.length > 1 ? '...' : ''}</span>}
                                    <span className="mt-1 pt-2 border-t border-gray-100"><strong className="text-gray-400">Budget:</strong> <span className="text-emerald-600 font-bold text-lg">₹{group.budget}<span className="text-sm">/mo</span></span></span>
                                  </div>
                                </div>

                                <div className="mt-auto space-y-3">
                                  {!hasProfile ? (
                                    <button 
                                      onClick={() => setActiveTab('profile')}
                                      className="w-full bg-[#063831] hover:bg-[#04241f] text-white font-bold py-2 rounded-lg transition-colors shadow-sm text-sm"
                                    >
                                      Unlock to View
                                    </button>
                                  ) : (
                                    <>
                                      <div className="mb-3">
                                        <input 
                                          type="number"
                                          min={group.budget || 0}
                                          max={group.budget ? Math.floor(group.budget * 1.4) : undefined}
                                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50 text-sm"
                                          placeholder={group.budget ? `e.g. ${group.budget}` : "Your Offer (₹/mo)"}
                                          value={negotiationOffer[group.id] || ''}
                                          onChange={(e) => setNegotiationOffer({...negotiationOffer, [group.id]: e.target.value})}
                                        />
                                        {group.budget && negotiationOffer[group.id] && parseInt(negotiationOffer[group.id]) >= group.budget * 1.3 && parseInt(negotiationOffer[group.id]) <= group.budget * 1.4 && (
                                          <p className="text-xs text-yellow-600 font-medium mt-1">Note: Your offer is quite high compared to the student's budget. They might reject it.</p>
                                        )}
                                      </div>
                                      {isHired ? (
                                        <button disabled className="w-full bg-emerald-100 text-emerald-800 font-bold py-2 rounded-lg shadow-none text-sm cursor-not-allowed">
                                          Active Student
                                        </button>
                                      ) : isPending ? (
                                        <button disabled className="w-full bg-orange-100 text-orange-800 font-bold py-2 rounded-lg shadow-none text-sm cursor-not-allowed">
                                          Pending
                                        </button>
                                      ) : (
                                        <div className="flex flex-col gap-2">
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => setSelectedViewUser(group)}
                                              className="w-1/3 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-2 rounded-lg transition-colors text-sm"
                                            >
                                              View
                                            </button>
                                            <button 
                                              onClick={() => handleSendOffer(group)}
                                              disabled={offerLoading}
                                              className={`flex-1 font-bold py-2 rounded-lg transition-colors shadow-sm text-sm disabled:opacity-50 ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 hover:bg-gray-300' : 'bg-[#00a992] hover:bg-[#008f7b] text-white disabled:cursor-not-allowed'}`}
                                            >
                                              {offerLoading ? 'Sending...' : 'Send Offer'}
                                            </button>
                                          </div>
                                          <button
                                            onClick={() => {
                                              handleDirectRequestDemo(group);
                                            }}
                                            className={`w-full py-2 px-3 rounded-lg text-sm font-bold transition-colors ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 hover:bg-gray-300' : 'bg-[#00a992] hover:bg-[#008f7b] text-white'}`}
                                          >
                                            Accept & Request Demo
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {(!((tuitionSubTab === 'all' ? allStudentsWithScores : computedRecommendedStudents)?.filter((s:any) => {
                        if (!hasProfile && selectedCategory) return s.category === selectedCategory;
                        return data?.teacherCategories?.length > 1 ? s.category === subTab : true;
                      })) || ((tuitionSubTab === 'all' ? allStudentsWithScores : computedRecommendedStudents)?.filter((s:any) => {
                        if (!hasProfile && selectedCategory) return s.category === selectedCategory;
                        return data?.teacherCategories?.length > 1 ? s.category === subTab : true;
                      }).length === 0)) && (
                        <div className="col-span-full p-10 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                          <Users className="w-12 h-12 text-gray-300 mb-3" />
                          <h3 className="text-lg font-bold text-gray-900">No students found</h3>
                          <p className="text-gray-500 max-w-sm mt-2">There are no students currently available in this category.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">All Notifications</h2>
                {((data?.allNotifications)?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {data?.allNotifications?.map((neg: any) => {
                      return (
                        <div key={neg.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center" onClick={() => { setActiveRequestViewId(neg.id); setActiveTab('requests'); }}>
                          <div>
                            <p className="text-gray-900 font-medium">
                              {neg.status === 'declined' ? (
                                <span>Request declined with <span className="font-bold">{neg.studentName || 'Student'}</span></span>
                              ) : neg.status === 'tuition_started' ? (
                                <span>Fees paid by <span className="font-bold">{neg.studentName || 'Student'}</span></span>
                              ) : (
                                <span>New update on request with <span className="font-bold">{neg.studentName || 'Student'}</span></span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(neg.updatedAt || neg.createdAt || Date.now()).toLocaleString()}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-10 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                    <Bell className="w-12 h-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-gray-900">No notifications</h3>
                    <p className="text-gray-500 mt-2">You don't have any notifications right now.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: REQUESTS */}
            {activeTab === 'requests' && (() => {
              const displayRequests = activeRequestViewId 
                ? data?.allNotifications?.filter((n: any) => n.id === activeRequestViewId) 
                : data?.allNegotiations;

              return (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  {activeRequestViewId && (
                    <button 
                      onClick={() => { setActiveRequestViewId(null); setActiveTab('notifications'); }}
                      className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-full shadow-sm border border-gray-200 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                  )}
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Requests & Offers</h2>
                </div>
                {(displayRequests?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {displayRequests?.map((neg: any) => (
                          <div key={neg.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900">{neg.studentName} <span className="text-sm font-normal text-gray-500 capitalize">({neg.category})</span></h4>
                              <p className="text-sm text-gray-500 mb-1">{neg.category}</p>
                              {neg.category === 'programming' && neg.technologies && neg.technologies.length > 0 && <p className="text-sm font-medium text-emerald-600">Technologies: {neg.technologies.join(', ')}</p>}
                              {neg.category === 'languages' && neg.languages && neg.languages.length > 0 && <p className="text-sm font-medium text-emerald-600">Languages: {neg.languages.join(', ')}</p>}
                              {(!neg.category || neg.category === 'school') && neg.subjects && neg.subjects.length > 0 && <p className="text-sm font-medium text-emerald-600">Subjects: {neg.subjects.join(', ')}</p>}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mt-4 sm:mt-0 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                              <div className="text-center w-full sm:w-auto">
                                <p className="text-xs font-bold text-gray-400 uppercase">{neg.status === 'demo_pending_payment' ? 'Agreed Price' : 'Current Offer'}</p>
                                <p className="text-2xl font-black text-emerald-600">₹{neg.finalPrice || neg.currentOffer}</p>
                              </div>
                              
                              {/* Request Specific Status UI */}
                              {neg.status === 'declined' ? (
                                <div className="flex gap-3 items-center w-full sm:w-auto">
                                  <div className="w-full sm:w-auto bg-red-50 px-5 py-3 rounded-xl border border-red-100 text-center">
                                    <p className="text-sm font-black text-red-600 uppercase tracking-wide">Declined</p>
                                  </div>
                                </div>
                              ) : neg.status === 'tuition_started' ? (
                                <div className="flex gap-3 items-center w-full sm:w-auto">
                                  <div className="w-full sm:w-auto bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-100 text-center">
                                    <p className="text-sm font-black text-emerald-600 uppercase tracking-wide">Fees Paid</p>
                                  </div>
                                </div>
                              ) : neg.status === 'negotiating' && (
                                neg.lastUpdatedBy === 'student' ? (
                                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                     <button 
                                       onClick={() => handleNegotiationAction(neg.id, 'request_demo', neg.currentOffer)}
                                       className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
                                     >
                                       Accept & Request Demo
                                     </button>
                                    <button 
                                      onClick={() => {
                                        setModalConfig({
                                          isOpen: true,
                                          type: 'price',
                                          title: 'Counter Offer',
                                          description: 'Propose a new monthly fee for this student.',
                                          placeholder: 'e.g. 500',
                                          initialValue: neg.currentOffer?.toString() || '',
                                          min: neg.absoluteMin || (neg.initialBudget || 0),
                                          max: neg.absoluteMax || Math.floor((neg.initialBudget || 0) * 1.4),
                                          onSubmit: (val: string) => {
                                            setModalConfig(prev => ({ ...prev, isOpen: false }));
                                            handleNegotiationAction(neg.id, 'counter_price', parseInt(val), neg);
                                          }
                                        });
                                      }}
                                      className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                                    >
                                      Counter Offer
                                    </button>
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                      className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex gap-3 items-center w-full sm:w-auto">
                                    <div className="w-full sm:w-auto bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">
                                      <p className="text-sm font-semibold text-gray-600">Waiting for student response...</p>
                                    </div>
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                      className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )
                              )}

                              {/* Demo Workflow States */}
                              {neg.status === 'demo_requested_by_teacher' && (
                                <div className="w-full sm:w-auto bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 text-center">
                                  <p className="text-sm font-semibold text-blue-600">Waiting for student to accept...</p>
                                </div>
                              )}
                              {neg.status === 'demo_requested_by_student' && (
                                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                                  <button 
                                    onClick={() => {
                                      const displayNames = neg.studentName || (neg.studentIds?.length > 1 ? 'Group' : 'Student');
                                      setPayingClass({ id: neg.id, studentName: displayNames, finalPrice: 500, studentsList: neg.studentsList || (neg.studentDetails ? [neg.studentDetails] : []) });
                                    }}
                                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg transform hover:scale-105 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Accept & Book Demo
                                  </button>
                                </div>
                              )}
                              {neg.status === 'demo_pending_payment' && (
                                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                                  <button 
                                    onClick={() => {
                                      const displayNames = neg.studentName || (neg.studentIds?.length > 1 ? 'Group' : 'Student');
                                      setPayingClass({ id: neg.id, studentName: displayNames, finalPrice: 500, studentsList: neg.studentsList || (neg.studentDetails ? [neg.studentDetails] : []) });
                                    }}
                                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg transform hover:scale-105 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                  >
                                    <Lock className="w-4 h-4" /> Pay Fee
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center mt-4">
                        <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">No active negotiations</h3>
                        <p className="text-gray-500 max-w-sm mt-2">You don't have any ongoing proposals or requests here.</p>
                      </div>
                    )}
                  </div>
              );
            })()}
{/* TAB: MY STUDENTS */}
            {activeTab === 'my_students' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">My Students & Classes</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.upcomingClasses?.map((cls: any) => (
                      <li 
                        key={cls.id} 
                        onClick={() => { if(cls.studentDetails) setSelectedViewUser(cls.studentDetails); else setActiveTab('my_students'); }}
                        className="relative bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,169,146,0.1)] hover:border-emerald-200 transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer"
                      >
                        
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-emerald-100/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                        
                        <div className="flex flex-col h-full gap-5">
                          {/* Header section */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00a992] to-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
                                {cls.student?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight truncate max-w-[150px] sm:max-w-[200px]">{cls.student}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100/50 uppercase tracking-wider">{cls.subject}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm whitespace-nowrap ${
                              cls.status === 'confirmed' || cls.status === 'tuition_started'
                                ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200/50' 
                                : 'bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-700 border-orange-200/50'
                            }`}>
                              {cls.status === 'confirmed' || cls.status === 'tuition_started' ? 'Active' : cls.status === 'demo_pending_payment' ? 'Payment Pending' : cls.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-1" />

                          {/* Details section */}
                          {cls.status === 'confirmed' && cls.studentDetails ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-3 text-sm flex-grow">
                              {cls.studentDetails.phoneNumber && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Phone className="w-4 h-4" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                                    <p className="font-semibold text-gray-700 truncate">{cls.studentDetails.phoneNumber}</p>
                                  </div>
                                </div>
                              )}
                              {cls.studentDetails.email && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Mail className="w-4 h-4" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="font-semibold text-gray-700 truncate">{cls.studentDetails.email}</p>
                                  </div>
                                </div>
                              )}
                              {cls.studentDetails.address && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><MapPin className="w-4 h-4" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                    <p className="font-semibold text-gray-700 truncate">{cls.studentDetails.address}</p>
                                  </div>
                                </div>
                              )}
                              {cls.studentDetails.classLevel && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Target className="w-4 h-4" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Class</p>
                                    <p className="font-semibold text-gray-700 truncate">{cls.studentDetails.classLevel} {cls.studentDetails.board && `(${cls.studentDetails.board})`}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex-grow flex items-center justify-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                              <p className="text-sm font-medium text-gray-500 text-center">Contact details will be revealed once the tuition is confirmed.</p>
                            </div>
                          )}

                        </div>
                      </li>
                    ))}
                    {(!data?.upcomingClasses || data?.upcomingClasses?.length === 0) && (
                      <li className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No active students</h3>
                        <p className="text-gray-500 max-w-sm">You haven't been assigned any students yet. Keep your profile updated to get noticed!</p>
                      </li>
                    )}
                  </ul>
              </div>
            )}

            {/* TAB: SUBSCRIPTIONS */}
            {activeTab === 'subscriptions' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Subscriptions</h2>
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">Increase your daily request limit from 5 to 15, and unlock premium features to grow your teaching business faster.</p>
                  <button className="bg-[#00a992] hover:bg-[#008f7b] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-[#00a992]/20">
                    View Pricing (Coming Soon)
                  </button>
                </div>
              </div>
            )}

            {/* TAB: REFERRALS */}
            {activeTab === 'referrals' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Refer & Earn</h2>
                <div className="bg-gradient-to-br from-[#063831] to-[#04241f] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Gift className="w-4 h-48" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-md">
                      <h3 className="text-2xl font-black mb-4">Invite Friends & Earn</h3>
                      <p className="text-emerald-100 mb-8 text-lg font-medium">Share your unique referral code. Earn 25% of the initial company margin when they book their first class!</p>
                      
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl inline-block mb-4">
                        <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-2">Your Referral Code</p>
                        <div className="flex items-center gap-4">
                          <span className="text-3xl font-black tracking-widest text-white">{data?.userData?.referralCode || data?.userData?.referralcode || 'GENERATING...'}</span>
                          <button onClick={() => {
                            navigator.clipboard.writeText(data?.userData?.referralCode || data?.userData?.referralcode || '');
                            toast.success("Code copied!");
                          }} className="bg-white text-[#063831] px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-2xl text-gray-900 w-full md:w-72 flex-shrink-0">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Wallet Balance</p>
                      <h2 className="text-4xl font-black text-[#002B20]">₹{data?.userData?.walletBalance || data?.userData?.walletbalance || 0}</h2>
                      <p className="text-xs text-gray-500 mb-4 font-medium leading-relaxed">
                        Use balance to get discounts on your courses, or withdraw to bank (Min ₹1000).
                      </p>
                      <button 
                        onClick={() => setWithdrawModal(true)}
                        disabled={(data?.userData?.walletBalance || data?.userData?.walletbalance || 0) < 1000}
                        className="w-full py-3 px-4 rounded-xl font-bold text-white bg-[#063831] hover:bg-[#04241f] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        Withdraw Funds
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Referrals</h3>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  {(data?.referrals?.length ?? 0) > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {data?.referrals?.map((ref: any) => (
                        <li key={ref.id} className="p-5 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-gray-900">{ref.referredUserName || 'Unknown User'}</p>
                            <p className="text-sm text-gray-500 capitalize">{ref.referralType}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              ref.status === 'rewarded' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                            }`}>
                              {ref.status}
                            </span>
                            {ref.estimatedReward > 0 && <p className="text-sm font-bold text-gray-900 mt-1">₹{ref.estimatedReward}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center text-gray-500 font-medium">You haven't referred anyone yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                  {!hasProfile && (
                    <div className="bg-orange-50 border-b border-orange-100 p-4 text-orange-800 flex items-center justify-center gap-2 font-medium text-sm text-center">
                      <Lock className="w-4 h-4" /> Please complete your profile to unlock the dashboard and start finding students!
                    </div>
                  )}
                  <TeacherForm 
                    isDashboard={true} 
                    hasProfile={hasProfile} 
                    category={selectedCategory} 
                    initialData={data?.profile || { name: data?.user?.displayName || '', email: data?.user?.email || '' }} 
                    onSuccess={() => mutate()} 
                  />
                </div>
                
                <div className="mt-12 pt-8 border-t border-red-100">
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <h3 className="text-xl font-black text-red-700 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600/80 font-medium mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button 
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WITHDRAW MODAL */}
            {withdrawModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">Withdraw Funds</h3>
                  <p className="text-gray-500 mb-6 font-medium relative z-10">You are withdrawing ₹{data?.userData?.walletBalance || 0} to your bank account.</p>
                  
                  <div className="mb-6 relative z-10">
                    <label className="text-sm font-bold text-gray-700 block mb-2">UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. 9876543210@ybl"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#00a992]/10 focus:border-[#00a992] transition-colors"
                    />
                  </div>
                  
                  <div className="flex gap-4 relative z-10">
                    <button
                      onClick={() => { setWithdrawModal(false); setUpiId(''); }}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      disabled={withdrawLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleWithdrawSubmit}
                      disabled={withdrawLoading}
                      className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#063831] hover:bg-[#04241f] shadow-lg shadow-[#063831]/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {withdrawLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Submit Request'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

      
      {/* View Student Profile Modal */}
      {selectedViewUser && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative my-8 overflow-hidden">
            <button 
              onClick={() => setSelectedViewUser(null)}
              className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="bg-[#00a992] p-8 sm:p-10 text-white flex-shrink-0 relative overflow-hidden">
              <div className="relative z-10 flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-black backdrop-blur-md shadow-inner border border-white/30">
                  {((selectedViewUser.students?.[0]?.guardianName || selectedViewUser.students?.[0]?.parentName || selectedViewUser.guardianName || selectedViewUser.parentName || selectedViewUser.name)?.charAt(0) || 'S')}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">{selectedViewUser.students?.[0]?.guardianName || selectedViewUser.students?.[0]?.parentName || selectedViewUser.parentName || selectedViewUser.guardianName || 'Parent'}</h3>
                  <p className="text-emerald-100 font-bold capitalize mt-1 text-lg flex items-center gap-2">
                    <Users className="w-4 h-4" /> {selectedViewUser.students?.length || 1} Student(s)
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 overflow-y-auto">
              <div className="space-y-8">
                {(selectedViewUser.students && selectedViewUser.students.length > 0 ? selectedViewUser.students : [selectedViewUser]).map((studentDetail: any, index: number) => (
                  <div key={studentDetail.id || index} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {studentDetail.name || 'Student'} <span className="text-sm font-medium text-gray-500">({studentDetail.category})</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {studentDetail.classLevel && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Class</p>
                          <p className="font-bold text-gray-800">{studentDetail.classLevel} {studentDetail.board && `(${studentDetail.board})`}</p>
                        </div>
                      )}
                      
                      {studentDetail.category === 'programming' && (studentDetail.technologies?.length ?? 0) > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Technologies</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {studentDetail.technologies.map((t: string) => (
                              <span key={t} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {studentDetail.category === 'languages' && (studentDetail.languages?.length ?? 0) > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Languages</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {studentDetail.languages.map((l: string) => (
                              <span key={l} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{l}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(!studentDetail.category || studentDetail.category === 'school') && (studentDetail.subjects?.length ?? 0) > 0 && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subjects</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {studentDetail.subjects.map((s: string) => (
                              <span key={s} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Preferred Days</p>
                        <p className="font-bold text-gray-800">
                          {studentDetail.daysPerWeek || 'Flexible'}
                          {studentDetail.specificDays?.length > 0 && ` (${studentDetail.specificDays.join(', ')})`}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Daily Duration</p>
                        <p className="font-bold text-gray-800">{studentDetail.hoursPerDay || 'Flexible'}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Budget</p>
                    <p className="text-3xl font-black text-emerald-700">₹{selectedViewUser.budget || 'Negotiable'}<span className="text-base font-bold text-emerald-600/70">/mo</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Mode & Location</p>
                    <p className="font-bold text-emerald-800 capitalize">{selectedViewUser.students?.[0]?.preferredMode || selectedViewUser.preferredMode || 'Online'}</p>
                    {(selectedViewUser.students?.[0]?.preferredMode || selectedViewUser.preferredMode)?.toLowerCase() !== 'online' && (
                      <p className="text-sm font-medium text-emerald-700 mt-1 max-w-[200px] truncate" title={selectedViewUser.students?.[0]?.area || selectedViewUser.address}>
                        {selectedViewUser.students?.[0]?.area || selectedViewUser.address || 'Address hidden'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            
            {/* Actions */}
            {(() => {
              const isPending = data?.applications?.some((app: any) => (app.groupId || app.studentId) === selectedViewUser.id && ['demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
              const isHired = data?.applications?.some((app: any) => (app.groupId || app.studentId) === selectedViewUser.id && ['tuition_started'].includes(app.status));
              const cooldownApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === selectedViewUser.id && app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000));
              
              if (isHired || isPending || cooldownApp) return null;
              
              return (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Offer (₹/mo)</label>
                      <input 
                        type="number"
                        min={selectedViewUser.budget || 0}
                        max={selectedViewUser.budget ? Math.floor(selectedViewUser.budget * 1.4) : undefined}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50"
                        placeholder={selectedViewUser.budget ? `e.g. ${selectedViewUser.budget}` : "e.g. 500"}
                        value={negotiationOffer[selectedViewUser.id] || ''}
                        onChange={(e) => setNegotiationOffer({...negotiationOffer, [selectedViewUser.id]: e.target.value})}
                      />
                      {selectedViewUser.budget && negotiationOffer[selectedViewUser.id] && parseInt(negotiationOffer[selectedViewUser.id]) >= selectedViewUser.budget * 1.3 && parseInt(negotiationOffer[selectedViewUser.id]) <= selectedViewUser.budget * 1.4 && (
                        <p className="text-xs text-yellow-600 font-medium mt-1">Note: Your offer is quite high compared to the student's budget. They might reject it.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { handleSendOffer(selectedViewUser); setSelectedViewUser(null); }}
                        disabled={offerLoading}
                        className={`flex-1 font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 hover:bg-gray-300' : 'bg-[#00a992] hover:bg-[#008f7b] text-white'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> {offerLoading ? 'Sending...' : 'Send Offer'}
                      </button>
                      <button 
                        onClick={() => { handleDirectRequestDemo(selectedViewUser); setSelectedViewUser(null); }}
                        className={`flex-1 py-3 px-6 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 hover:bg-gray-300 shadow-none' : 'bg-[#00a992] hover:bg-[#008f7b] text-white shadow-[#00a992]/20'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept & Request Demo
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        </div>
      )}
      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8">
            <h3 className="text-2xl font-black text-red-600 mb-2">Delete Account</h3>
            <p className="text-gray-600 font-medium mb-4">
              This will permanently delete your account, teacher profile, and all tuition history.
            </p>
            <div className="bg-red-50 p-4 rounded-xl mb-6 border border-red-100">
              <label className="text-sm font-bold text-red-800 block mb-2">Type "DELETE" to confirm</label>
              <input 
                type="text"
                value={deleteAccountConfirm}
                onChange={e => setDeleteAccountConfirm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-red-200 focus:ring-2 focus:ring-red-500 font-bold"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => { setShowDeleteAccountModal(false); setDeleteAccountConfirm(''); }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={isDeletingAccount}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if(deleteAccountConfirm !== 'DELETE') {
                    toast.error('Please type DELETE to confirm');
                    return;
                  }
                  setIsDeletingAccount(true);
                  try {
                    const { db, auth } = await import('@/utils/firebase/client');
                    const { doc, deleteDoc, query, collection, where, getDocs } = await import('firebase/firestore');
                    const { deleteUser } = await import('firebase/auth');
                    
                    if(!auth.currentUser) throw new Error('Not logged in');
                    
                    const uid = auth.currentUser.uid;
                    
                    // Delete tutor doc
                    await deleteDoc(doc(db, 'tutors', uid));
                    
                    // Delete user doc
                    await deleteDoc(doc(db, 'users', uid));
                    
                    // Delete all applications for this tutor
                    const appQ = query(collection(db, 'applications'), where('tutorId', '==', uid));
                    const appSnap = await getDocs(appQ);
                    for (const d of appSnap.docs) await deleteDoc(doc(db, 'applications', d.id));
                    
                    // Delete tutor requests
                    const tutorReqQ = query(collection(db, 'tutor_requests'), where('tutorId', '==', uid));
                    const tutorReqSnap = await getDocs(tutorReqQ);
                    for (const d of tutorReqSnap.docs) await deleteDoc(doc(db, 'tutor_requests', d.id));

                    // Delete direct requests
                    const directReqQ = query(collection(db, 'direct_requests'), where('tutorId', '==', uid));
                    const directReqSnap = await getDocs(directReqQ);
                    for (const d of directReqSnap.docs) await deleteDoc(doc(db, 'direct_requests', d.id));

                    try {
                      await deleteUser(auth.currentUser);
                      localStorage.clear();
                      toast.success('Account deleted successfully');
                      window.location.href = '/';
                    } catch (e: any) {
                      if(e.code === 'auth/requires-recent-login') {
                        localStorage.clear();
                        toast.success('Account deleted successfully');
                        await auth.signOut();
                        window.location.href = '/login';
                      } else {
                        throw e;
                      }
                    }
                  } catch (err: any) {
                    toast.error(err.message);
                    setIsDeletingAccount(false);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all flex items-center justify-center disabled:opacity-50"
                disabled={isDeletingAccount || deleteAccountConfirm !== 'DELETE'}
              >
                {isDeletingAccount ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {payingClass && (() => {
        const payingStudents = payingClass.studentsList || (payingClass.studentDetails ? [payingClass.studentDetails] : []);
        const demoFees = payingStudents.map((s:any) => ({ student: s, feeData: getStudentDemoFee(s, data?.marketplacePricing || []) }));
        const totalDemoFee = demoFees.reduce((sum: number, curr: any) => sum + curr.feeData.price, 0) || 100;
        const coursePrice = totalDemoFee;
        
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00a992]/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
            <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">Complete Payment</h3>
            <p className="text-gray-500 mb-6 font-medium relative z-10">You are about to book a demo with <span className="font-bold text-gray-900">{payingClass.studentName || 'Student'}</span>.</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 relative z-10">
              <div className="space-y-3 mb-4">
                {demoFees.map((fee: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <div className="flex flex-col">
                      <span className="text-gray-900">{fee.feeData.name}</span>
                      <span className="text-xs font-medium">For {fee.student?.name || 'Student'}</span>
                    </div>
                    <span className="text-gray-900">₹{fee.feeData.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-lg font-black text-gray-900">
                <span>Total to Pay</span>
                <span className="text-[#00a992]">
                  ₹{coursePrice}
                </span>
              </div>
            </div>
            
            <div className="flex gap-4 relative z-10">
              <button
                onClick={() => { setPayingClass(null); }}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={paymentLoading}
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={paymentLoading}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-[#063831] hover:bg-[#04241f] shadow-lg shadow-[#063831]/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Pay Securely'
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      </main>
    </div>
  );
}
