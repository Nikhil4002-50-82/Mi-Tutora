"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { motion } from 'motion/react';
import { Home, Search, BookOpen, Clock, Settings, LogOut, ChevronRight, Star, Calendar, MapPin, Users, Video, CreditCard, ChevronDown, CheckCircle2, XCircle, FileText, ArrowRight, Activity, Bell, Filter, Edit2, PlayCircle, Plus, Info, Zap, Shield, Lock, Trash2, X, CalendarDays, LayoutDashboard, ShieldCheck, User, Gift, MessageCircle, Menu, Globe, Banknote, Handshake, AlertCircle, FileImage, Phone, Mail, GraduationCap } from 'lucide-react';

import GroupManager from '@/components/GroupManager';
import DemoForm from '@/components/DemoForm';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ActionModal from '@/components/ActionModal';
import MessageModal from '@/components/MessageModal';
import { generateReferralCode } from '@/utils/referral';
import { toast } from 'sonner';
const logo = '/imports/logo.png';

import useSWR from 'swr';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [hasDismissedReminder, setHasDismissedReminder] = useState(false);
  const [selectedViewUser, setSelectedViewUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [negotiationOffer, setNegotiationOffer] = useState<{ [key: string]: string }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const [activeRequestViewId, setActiveRequestViewId] = useState<string | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [payingClass, setPayingClass] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState<string>('');
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [editingStudentId, setEditingStudentId] = useState<string>('');
  const [tuitionSubTab, setTuitionSubTab] = useState<'all'|'recommendation'>('recommendation');
  const [subTab, setSubTab] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'price' as 'price'|'timing', title: '', description: '', placeholder: '', initialValue: '', min: undefined as number | undefined, max: undefined as number | undefined, onSubmit: (val: string, date?: string, time?: string) => {} });
  const [messageModalConfig, setMessageModalConfig] = useState({ isOpen: false, title: '', message: '' });
  const [isEditingParentProfile, setIsEditingParentProfile] = useState(false);
  const [parentFormData, setParentFormData] = useState({ name: '', email: '', phone: '', whatsapp: '', address: '' });
  const [parentSameAsPhone, setParentSameAsPhone] = useState(false);
  const [parentSaveLoading, setParentSaveLoading] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<any>(null);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const router = useRouter();

  const fetcher = async () => {
    const { auth, db } = await import('@/utils/firebase/client');
    const { doc, getDoc, collection, query, where, getDocs, setDoc } = await import('firebase/firestore');
    
    await new Promise(resolve => auth.onAuthStateChanged(resolve));
    const user = auth.currentUser;
    
    if (!user) {
      router.push('/login');
      throw new Error('Unauthenticated');
    }

    let userDocRef = doc(db, 'users', user.uid);
    let userDocSnap = await getDoc(userDocRef);
    let userData = userDocSnap.exists() ? userDocSnap.data() : null;
    
    if (userData && userData.role !== 'student') {
      window.location.href = '/dashboard/teacher';
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
    const myStudent = students.length > 0 ? students[0] : null;

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
       const { documentId } = await import('firebase/firestore');
       
       for (let i = 0; i < tutorIds.length; i += 10) {
         const chunk = tutorIds.slice(i, i + 10);
         const tutorsQuery = query(collection(db, 'tutors'), where(documentId(), 'in', chunk));
         const tSnap = await getDocs(tutorsQuery);
         tutorsInfo = [...tutorsInfo, ...tSnap.docs.map(d => ({ id: d.id, ...d.data() }))];
       }
    }

    const applicationsWithSubjects = applications.map((app: any) => {
      const tutor = tutorsInfo.find(t => t.id === app.tutorId);
      return { 
        ...app, 
        tutorDetails: tutor,
        subjects: tutor?.subjects || [],
        technologies: tutor?.technologies || [],
        languagesTaught: tutor?.languagesTaught || []
      };
    }) || [];

    const allNegotiations = applicationsWithSubjects.filter((app: any) => ['negotiating', 'demo_pending_payment'].includes(app.status));
    const allNotifications = applicationsWithSubjects
      .filter((app: any) => ['negotiating', 'demo_pending_payment', 'declined', 'tuition_started'].includes(app.status))
      .sort((a: any, b: any) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
    const recommendedNegotiations = allNegotiations.filter(app => matchedTutors.some((t:any) => t.id === app.tutorId));

    return {
      user,
      userData,
      profile: parentData,
      myStudent,
      students: students,
      allStudents: students,
      myRequest,
      applications: applicationsWithSubjects,
      availableTeachers: matchedTutors,
      allTutors: availableTutors,
      recommendedTutors: matchedTutors,
      referrals,
      negotiations: allNegotiations,
      allNegotiations,
      allNotifications,
      recommendedNegotiations,
      upcomingClasses: applicationsWithSubjects.filter((app: any) => ['tuition_started', 'demo_booked', 'demo_pending_payment'].includes(app.status)).map((app: any) => ({
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

  const { data, error: swrError, isLoading: loading, mutate } = useSWR('studentDashboardData', fetcher);


  const allStudents = data?.students || (data?.myStudent ? [data.myStudent] : []);
  
  const studentGroups = useMemo(() => {
    const acc: any = {};
    allStudents.forEach((student: any) => {
      const gId = student.groupId || `indv_${student.id}`;
      if (!acc[gId]) acc[gId] = { id: gId, students: [], totalBudget: 0, categories: [] };
      acc[gId].students.push(student);
      acc[gId].totalBudget += (parseInt(student.budget) || 0);
      acc[gId].categories.push(student.category);
    });
    return Object.values(acc).map((g: any) => ({
      ...g,
      name: g.students.length === 1 ? g.students[0].name : `Group: ${g.students.map((s:any)=>s.name).join(', ')}`,
      category: g.categories[0]
    }));
  }, [allStudents]);

  const activeGroup = studentGroups.find(g => g.id === activeGroupId) || studentGroups[0] || null;
  const activeStudent = allStudents.find((s:any) => s.id === activeStudentId) || data?.myStudent || allStudents[0] || null;
  
  const computedRecommendedTutors = (data?.allTutors?.filter((tutor: any) => {
      if (!activeStudent) return true;
      const tutorCategories = tutor.category ? tutor.category.split(',').map((c: string) => c.trim()) : [];
      if (!tutorCategories.includes(activeStudent.category)) return false;
      
      if (activeStudent.category === 'school') {
        const boardMatch = !tutor.boards || tutor.boards.length === 0 || tutor.boards.includes(activeStudent.board);
        const classMatch = !tutor.classes || tutor.classes.length === 0 || tutor.classes.includes(activeStudent.classLevel);
        const studentSubjects = activeStudent.subjects || [];
        const tutorSubjects = tutor.subjects || [];
        const subjectMatch = studentSubjects.length === 0 || tutorSubjects.length === 0 || 
                             studentSubjects.some((s: string) => tutorSubjects.some((ts: string) => ts.toLowerCase() === s.toLowerCase()));
        return (boardMatch || classMatch) && subjectMatch;
      }
      if (activeStudent.category === 'programming') {
         const studentTechs = activeStudent.technologies || [];
         const tutorTechs = tutor.technologies || [];
         return studentTechs.length === 0 || tutorTechs.length === 0 || studentTechs.some((t: string) => tutorTechs.includes(t));
      }
      if (activeStudent.category === 'languages') {
         const studentLangs = activeStudent.languages || [];
         const tutorLangs = tutor.languagesTaught || [];
         return studentLangs.length === 0 || tutorLangs.length === 0 || studentLangs.some((l: string) => tutorLangs.includes(l));
      }
      return true;
  }) || []).sort((a: any, b: any) => {
      const getStatus = (tutorId: string) => data?.allNegotiations?.find((app: any) => app.tutorId === tutorId && (app.studentId === activeStudent?.id || app.groupId === activeGroup?.id))?.status || '';
      const getScore = (status: string) => {
          if (status === 'locked' || status === 'declined') return -1;
          if (['pending', 'negotiating', 'reviewing', 'offer_sent', 'demo_pending_payment'].includes(status)) return 1;
          return 0;
      };
      return getScore(getStatus(b.id)) - getScore(getStatus(a.id));
  });

  const computedRecommendedNegotiations = data?.allNegotiations?.filter((app:any) => computedRecommendedTutors.some((t:any) => t.id === app.tutorId)) || [];

  const hasProfile = data?.userData?.hasProfile || allStudents.length > 0 || false;

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
          const baseName = data?.myStudent?.name || data?.user?.displayName || 'USER';
          const newCode = generateReferralCode(baseName, data.user.uid);
          
          mutate({ ...data, userData: { ...data.userData, referralCode: newCode, referralcode: newCode } }, false);

          const userDocRef = doc(db, 'users', data.user.uid);
          await updateDoc(userDocRef, { referralCode: newCode });
          
          toast.success("Generated referral code: " + newCode);
          mutate();
        } catch (e: any) {
          toast.error("Failed to generate referral code: " + e.message);
        }
      };
      generateCode();
    }
  }, [data?.userData?.referralCode, data?.userData?.referralcode, data?.user, data?.myStudent?.name, mutate, data, isGeneratingRef]);

  useEffect(() => {
    const processSilentSubmission = async () => {
      const savedDemoData = localStorage.getItem('demoFormData');
      if (savedDemoData && data?.user) {
        try {
          const { db } = await import('@/utils/firebase/client');
          const { doc, getDoc, updateDoc, setDoc, addDoc, collection } = await import('firebase/firestore');
          const formData = JSON.parse(savedDemoData);
          const user = data.user;
          
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          const existingCode = userDocSnap.exists() && userDocSnap.data().referralCode;
          const fallbackName = formData.students?.[0]?.fullName || formData.students?.[0]?.name || 'Unknown Parent';
          const newCode = existingCode || generateReferralCode(formData.parentName || fallbackName, user.uid);
          await setDoc(userDocRef, { hasProfile: true, referralCode: newCode }, { merge: true });

          const parentDocRef = doc(db, 'parents', user.uid);
          const parentDocSnap = await getDoc(parentDocRef);
          if (!parentDocSnap.exists()) {
            await setDoc(parentDocRef, { id: user.uid, name: formData.parentName || fallbackName });
          }

          const isOnline = formData.demoMode?.toLowerCase() === 'online';
          const combinedAddress = isOnline ? '' : [formData.addressFlat, formData.addressStreet, formData.addressPincode].filter(Boolean).join(', ');

          const numStudents = formData.numberOfStudents || 1;
          for (let i = 0; i < numStudents; i++) {
            const s = formData.students && formData.students[i] ? formData.students[i] : formData;
            const newStudentRef = doc(collection(db, 'students'));
            
            await setDoc(newStudentRef, {
              id: newStudentRef.id,
              guardianName: formData.parentName || '',
              dob: '',
              parentId: user.uid,
              category: formData.category || '',
              name: s.fullName || s.name || '',
              gender: s.gender || '',
              phoneNumber: formData.phone || '',
              whatsappNumber: formData.whatsapp || '',
              email: formData.email || '',
              address: combinedAddress,
              studentType: s.studentType || '',
              classLevel: s.classGrade || s.classLevel || '',
              board: s.board || '',
              subjects: Array.isArray(s.subjects) ? s.subjects : (s.subjects ? s.subjects.split(',').map((subj: string) => subj.trim()) : []),
              technologies: s.technologies || [],
              languages: s.languages || [],
              budget: parseInt(s.budget) || 0,
              preferredMode: formData.demoMode || '',
              learningGoal: formData.goal || '',
              specialRequirements: formData.requirements || '',
              hoursPerDay: formData.hours || '',
              daysPerWeek: formData.days || '',
              specificDays: formData.specificDays || [],
              groupId: s.groupId?.startsWith('indv_temp') ? `indv_${newStudentRef.id}` : (s.groupId || `indv_${newStudentRef.id}`),
              createdAt: Date.now()
            });

            const newRequestRef = doc(collection(db, 'tuition_requests'));
            await setDoc(newRequestRef, {
              id: newRequestRef.id,
              city: '',
              latitude: 0.0,
              longitude: 0.0,
              acceptedTutorId: '',
              parentId: user.uid,
              studentId: newStudentRef.id,
              category: formData.category || '',
              studentName: s.fullName || s.name || '',
              classLevel: s.classGrade || s.classLevel || '',
              board: s.board || '',
              subjects: Array.isArray(s.subjects) ? s.subjects : (s.subjects ? s.subjects.split(',').map((subj: string) => subj.trim()) : []),
              technologies: s.technologies || [],
              languages: s.languages || [],
              mode: formData.demoMode || '',
              preferredTimeRange: formData.hours || '',
              area: combinedAddress,
              budget: parseInt(s.budget) || 0,
              status: 'open',
              createdAt: Date.now()
            });
          }

          localStorage.removeItem('demoFormData');
          mutate();
        } catch (e) {
          console.error("Failed to silently submit demo request", e);
        }
      }
    };
    processSilentSubmission();
  }, [data?.user, mutate]);

  useEffect(() => {
    if (!data?.user) return;
    let unsubscribe: any;
    const setupRealtime = async () => {
      const { db } = await import('@/utils/firebase/client');
      const { collection, query, where, onSnapshot } = await import('firebase/firestore');
      
      const q = query(collection(db, 'applications'), where('parentId', '==', data.user.uid));
      unsubscribe = onSnapshot(q, () => {
        mutate();
      });
    };
    setupRealtime();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [data?.user, mutate]);

  const handleLogout = async () => {
    const { auth } = await import('@/utils/firebase/client');
    await auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out successfully!");
    window.location.href = '/login';
  };

  const getTutorBasePrice = (tutor: any) => {
    if (tutor.price && tutor.price > 0) return tutor.price;
    if (tutor.feeRange) {
      const match = String(tutor.feeRange).match(/\d+/);
      if (match) return parseInt(match[0]);
    }
    return 0;
  };

  const handleRequestTutor = async (tutor: any) => {
    if (requestLoading) return;
    const offerPrice = parseInt(negotiationOffer[tutor.id]);
    if (!offerPrice || offerPrice <= 0) return toast.error("Please enter a valid budget offer.");
    
    const tutorPrice = getTutorBasePrice(tutor);
    if (tutorPrice > 0 && offerPrice > tutorPrice) {
      setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `Since you cannot increase the price, the maximum you can offer is Rs. ${tutorPrice}. Please adjust your offer.` });
      return;
    }
    if (tutorPrice > 0 && offerPrice < tutorPrice * 0.6) {
      setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `Since it is a 40% rule, you can only decrease the price to Rs. ${Math.ceil(tutorPrice * 0.6)}. Please adjust your offer.` });
      return;
    }
    
    // Redirect logic if profile is incomplete
    if (!hasProfile) {
      toast.error("Please complete your profile to request a tutor.");
      setActiveTab('profile');
      return;
    }

    try {
      setRequestLoading(true);
      const { db, auth } = await import('@/utils/firebase/client');
      const { collection, addDoc } = await import('firebase/firestore');
      const user = auth.currentUser;
      
      const groupToUse = activeGroup;
      if (!groupToUse) {
        toast.error("Please add a student profile first.");
        setRequestLoading(false);
        return;
      }

      await addDoc(collection(db, 'applications'), {
        tutorId: tutor.id,
        tutorName: tutor.name,
        parentId: user?.uid,
        groupId: groupToUse.id,
        studentIds: groupToUse.students.map((s: any) => s.id),
        studentName: groupToUse.name,
        currentOffer: offerPrice,
        initialBudget: groupToUse.totalBudget || offerPrice,
        absoluteMax: tutorPrice > 0 ? Math.floor(tutorPrice * 1.2) : Math.floor(offerPrice * 1.2),
        absoluteMin: tutorPrice > 0 ? Math.ceil(tutorPrice * 0.6) : Math.ceil(offerPrice * 0.6),
        lastUpdatedBy: 'student',
        status: 'negotiating',
        source: 'direct',
        category: tutor.category || groupToUse.category || '',
        mode: tutor.mode,
        demoHours: data?.myRequest?.preferredTimeRange || 'Flexible',
        createdAt: Date.now()
      });

      toast.success("Tutor request & offer sent successfully!");
      mutate();
    } catch (e: any) {
      toast.error("Error sending request: " + e.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleNegotiationAction = async (appId: string, action: string, newOffer?: number, neg?: any) => {
    if (action === 'counter_price' && newOffer && neg) {
      const maxAllowed = neg.currentOffer;
      const minAllowed = neg.absoluteMin || Math.ceil((neg.initialBudget || neg.currentOffer) * 0.6);
      if (newOffer > maxAllowed) {
        setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `Since you cannot increase the price, the maximum offer allowed is Rs. ${maxAllowed}. Please adjust your offer.` });
        return;
      }
      if (newOffer < minAllowed) {
        setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The absolute minimum you can offer is Rs. ${minAllowed}. Please adjust your offer.` });
        return;
      }
    }
    
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const updateData: any = {};
      if (action === 'accept_price') {
        updateData.status = 'demo_pending_payment';
        updateData.finalPrice = newOffer;
      } else if (action === 'counter_price') {
        updateData.currentOffer = newOffer;
        updateData.lastUpdatedBy = 'student';
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

  const handleAppointTutor = async (appId: string) => {
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'applications', appId), { status: 'tuition_started', startDate: new Date().toLocaleDateString('en-GB') });
      toast.success("Tutor appointed successfully! Tuition has started.");
      mutate();
    } catch (e: any) {
      toast.error("Error appointing tutor");
    }
  };

  const handlePaymentSubmit = async () => {
    setPaymentLoading(true);
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc, collection, query, where, getDocs, getDoc } = await import('firebase/firestore');
      
      const coursePrice = payingClass.finalPrice || 4000;
      const walletBalance = data?.userData?.walletBalance || 0;
      
      // Deduct wallet if used
      if (useWallet && walletBalance > 0) {
        const usedAmount = Math.min(coursePrice, walletBalance);
        await updateDoc(doc(db, 'users', data?.user?.uid as string), { walletBalance: walletBalance - usedAmount });
      }

      // Update application directly to tuition_started
      await updateDoc(doc(db, 'applications', payingClass.id), { 
        status: 'tuition_started', 
        demoPaymentPaid: true,
        startDate: new Date().toLocaleDateString('en-GB'),
        updatedAt: Date.now()
      });

      toast.success("Payment completed successfully!");
      setPayingClass(null);
      setUseWallet(false);
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

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
    { id: 'my_teachers', label: 'My Teachers', icon: BookOpen },
    { id: 'referrals', label: 'Referrals', icon: Gift },
  ];

  if (loading && !data) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-gradient-to-r from-[#063831] to-[#04241f] text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-emerald-400" />
          <span className="font-black text-xl tracking-tight">Student</span>
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
              <GraduationCap className="w-8 h-8 text-emerald-400" />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight leading-none">MiTutora</span>
                <span className="text-[#00a992] text-[10px] font-bold uppercase tracking-widest mt-1">Student</span>
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
            {(data?.profile?.name || data?.user?.displayName || 'S').charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-sm truncate">{data?.profile?.name || data?.user?.displayName || 'Student'}</p>
            <p className="text-xs text-emerald-400 font-medium">Student Account</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      {showCategoryPopup && !hasProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-lg w-full text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4">What are you looking for?</h2>
            <p className="text-slate-500 mb-8">Select a category to discover the best matches for your needs.</p>
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
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
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
            <div className="relative group cursor-pointer" onClick={() => setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen)}>
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
                      const studentForApp = allStudents.find((s:any) => s.id === neg.studentId) || { name: neg.studentName || 'Student' };
                      return (
                        <div key={idx} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { setActiveRequestViewId(neg.id); setActiveTab('requests'); setIsNotificationsDropdownOpen(false); }}>
                          <p className="text-sm text-gray-800 font-medium line-clamp-2">
                            {neg.status === 'declined' ? (
                              <span>Request declined for <span className="font-bold">{studentForApp.name}</span> with tutor <span className="font-bold">{neg.tutorName}</span></span>
                            ) : neg.status === 'tuition_started' ? (
                              <span>Fees paid for <span className="font-bold">{studentForApp.name}</span> with tutor <span className="font-bold">{neg.tutorName}</span></span>
                            ) : (
                              <span>New update on request with <span className="font-bold">{neg.tutorName}</span> for <span className="font-bold">{studentForApp.name}</span></span>
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
            
            <div className="relative group cursor-pointer" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#063831] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-transparent group-hover:ring-emerald-500 transition-all">
                  {(data?.profile?.name || data?.user?.displayName || 'S').charAt(0)}
                </div>
              </div>
              
              <div 
                className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-200 z-50 overflow-hidden transform origin-top-right ${isProfileDropdownOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'} md:group-hover:opacity-100 md:group-hover:visible md:group-hover:scale-100`}
                onClick={(e) => e.stopPropagation()}
              >
                 <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                   <p className="font-bold text-sm text-gray-900 truncate">{data?.profile?.name || data?.user?.displayName || 'Student'}</p>
                   <p className="text-xs text-gray-500 truncate mt-0.5">{data?.user?.email}</p>
                 </div>
                 <div className="p-2">
                   <button onClick={() => { setActiveTab('profile'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <User className="w-4 h-4" /> Profile Settings
                   </button>
                   <button onClick={() => { setActiveTab('my_teachers'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <BookOpen className="w-4 h-4" /> My Teachers
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
                  activeStudent?.name,
                  activeStudent?.gender,
                  activeStudent?.phoneNumber || activeStudent?.whatsappNumber,
                  data?.profile?.name,
                  activeStudent?.preferredMode === 'Online' ? true : activeStudent?.address,
                  activeStudent?.classLevel || activeStudent?.technologies?.length > 0 || activeStudent?.languages?.length > 0 ? true : false,
                  activeStudent?.category === 'programming' || activeStudent?.category === 'languages' ? true : activeStudent?.board,
                  activeStudent?.category,
                  activeStudent?.budget,
                  activeStudent?.category === 'programming' || activeStudent?.category === 'languages' ? true : (activeStudent?.subjects?.length > 0 ? true : false),
                  activeStudent?.learningGoal
                ];
                const filled = fields.filter(f => f && String(f).trim() !== '' && f !== false).length;
                return Math.max(10, Math.round((filled / fields.length) * 100));
              })();
              
              const myActiveTeachers = data?.upcomingClasses || [];

              return (
                <div className="flex flex-col gap-8 h-full pb-10">
                  {/* Hero Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 mb-2">
                        Hello {activeStudent?.name?.split(' ')[0] || data?.user?.displayName?.split(' ')[0] || 'Student'}! <span className="text-4xl animate-bounce origin-bottom-right">👋</span>
                      </h1>
                      <p className="text-gray-500 text-lg">Nice to have you back, what an exciting day! Get ready to continue your learning journey.</p>
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
                  <div className="grid lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left: My Teachers */}
                    <div className="lg:col-span-2 space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">My Teachers</h2>
                      
                      {myActiveTeachers.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-emerald-500" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No teachers chosen yet</h3>
                          <p className="text-gray-500 max-w-sm mb-8">Explore our catalog of verified tutors and find the perfect match to start your learning journey.</p>
                          <button 
                            onClick={() => setActiveTab('new_tuition')}
                            className="bg-[#00a992] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#008f7b] transition-all shadow-lg shadow-[#00a992]/20 flex items-center gap-2"
                          >
                            <Globe className="w-5 h-5" /> Explore Teachers
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {myActiveTeachers.slice(0, 3).map((cls: any) => (
                            <div key={cls.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">
                                  {cls.teacher?.charAt(0) || 'T'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{cls.teacher}</h4>
                                  <p className="text-sm text-gray-500">{cls.subject}</p>
                                </div>
                              </div>
                              <button onClick={() => { if(cls.tutorDetails) setSelectedViewUser(cls.tutorDetails); else setActiveTab('my_teachers'); }} className="text-gray-700 font-bold text-sm bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
                                View
                              </button>
                            </div>
                          ))}
                          {myActiveTeachers.length > 3 && (
                            <button onClick={() => setActiveTab('my_teachers')} className="text-sm font-bold text-gray-500 hover:text-[#00a992] py-2 text-center w-full">
                              View all {myActiveTeachers.length} teachers →
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Recommended Teachers */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">Recommended Teachers</h2>
                      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                        {computedRecommendedTutors.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-gray-500 text-sm">No recommendations yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {computedRecommendedTutors.slice(0, 4).map((tutor: any, index: number) => {
                              const lockedApp = data?.allNegotiations?.find((app: any) => app.tutorId === tutor.id && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                              const offerApp = data?.allNegotiations?.find((app: any) => app.tutorId === tutor.id && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_pending_payment', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                              
                              const isLocked = !!lockedApp || !!offerApp;
                              const isRed = !!lockedApp;
                              const labelText = isRed ? 'Locked' : 'Offer Sent';

                              return (
                                <div key={tutor.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3 relative">
                                  {isLocked && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-end pr-2 rounded-lg">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isRed ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {labelText}
                                        </span>
                                    </div>
                                  )}
                                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 text-xs flex-shrink-0">
                                    #{index + 1}
                                  </div>
                                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0">
                                    {tutor.name?.charAt(0) || 'T'}
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{tutor.name || 'Tutor'}</h4>
                                    <p className="text-xs text-gray-500 truncate">{tutor.subjects ? tutor.subjects.join(', ') : tutor.category}</p>
                                  </div>
                                  <button onClick={() => setSelectedViewUser(tutor)} className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 flex-shrink-0">
                                    View
                                  </button>
                                </div>
                              );
                            })}
                            {computedRecommendedTutors.length > 4 && (
                              <div className="pt-4 mt-2 border-t border-gray-100">
                                <button onClick={() => setActiveTab('new_tuition')} className="w-full text-center text-xs font-bold text-gray-500 hover:text-[#00a992]">
                                  View all {computedRecommendedTutors.length} recommendations →
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
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                      {tuitionSubTab === 'all' ? 'All Tutors' : 'Recommended Tutors'}
                    </h2>
                    {tuitionSubTab === 'recommendation' && studentGroups.length > 0 && (
                      <div className="mt-4 flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-600">Shopping for:</label>
                        <select 
                          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-[#00a992] focus:outline-none focus:ring-2 focus:ring-[#00a992]/50"
                          value={activeGroupId || activeGroup?.id || ''}
                          onChange={(e) => setActiveGroupId(e.target.value)}
                        >
                          {studentGroups.map((g:any) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(tuitionSubTab === 'all' ? data?.allTutors : computedRecommendedTutors)?.filter((t: any) => !selectedCategory || (t.category && t.category.includes(selectedCategory))).map((teacher: any) => {
                      const lockedApp = data?.applications?.find((app: any) => app.tutorId === teacher.id && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                      const offerApp = data?.applications?.find((app: any) => app.tutorId === teacher.id && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_pending_payment', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                      
                      const isPending = data?.applications?.some((app: any) => app.tutorId === teacher.id && ['demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
                      const isHired = data?.applications?.some((app: any) => app.tutorId === teacher.id && ['tuition_started'].includes(app.status));
                      
                      const isLocked = !!lockedApp || !!offerApp;
                      const isRed = !!lockedApp;
                      const labelText = isRed ? 'Locked' : 'Offer Sent';
                      const subText = isRed ? (lockedApp?.declinedAt ? `Available in ${Math.ceil((lockedApp.declinedAt + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))} days` : 'Currently unavailable') : 'Waiting for response...';
                      
                      return (
                        <div key={teacher.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#00a992]/30 transition-all flex flex-col h-full relative overflow-hidden">
                          {isLocked && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isRed ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                <Lock className={`w-6 h-6 ${isRed ? 'text-red-600' : 'text-emerald-600'}`} />
                              </div>
                              <h4 className="font-bold text-gray-900 mb-1">{labelText}</h4>
                              <p className="text-sm text-gray-600 font-medium">
                                {subText}
                              </p>
                            </div>
                          )}
                          <div className="bg-[#00a992] p-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">{teacher.name}</h3>
                            <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full border border-white/30">
                              {teacher.mode || 'Online'}
                            </span>
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            {teacher.teachingApproach && (
                              <p className="text-sm text-gray-600 mb-4 overflow-hidden leading-relaxed">{teacher.teachingApproach}</p>
                            )}
                          <div className="space-y-2 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex-grow">
                            {teacher.category === 'programming' && (teacher.technologies?.length ?? 0) > 0 && <p><strong className="text-gray-700">Technologies:</strong> {teacher.technologies.join(', ')}</p>}
                            {teacher.category === 'languages' && (teacher.languagesTaught?.length ?? 0) > 0 && <p><strong className="text-gray-700">Languages:</strong> {teacher.languagesTaught.join(', ')}</p>}
                            {(!teacher.category || teacher.category === 'school') && (teacher.subjects?.length ?? 0) > 0 && <p><strong className="text-gray-700">Subjects:</strong> {teacher.subjects.join(', ')}</p>}
                            {teacher.experience && <p><strong className="text-gray-700">Experience:</strong> {teacher.experience}</p>}
                            {teacher.mode !== 'Online' && teacher.locations && (
                              <p><strong className="text-gray-700">📍 Location:</strong> {teacher.locations} {teacher.travelKm ? `(Travels up to ${teacher.travelKm}km)` : ''}</p>
                            )}
                            <p><strong className="text-gray-700">Fee Range:</strong> <span className="text-emerald-600 font-bold">{teacher.feeRange || 'Negotiable'}</span></p>
                          </div>
                          
                          <div className="flex flex-col gap-3 mt-auto">
                            {!hasProfile ? (
                              <button 
                                onClick={() => setActiveTab('profile')}
                                className="w-full bg-[#00a992] text-white hover:bg-emerald-600 font-bold py-3 rounded-xl transition-colors shadow-md shadow-[#00a992]/20 flex items-center justify-center gap-2 text-sm"
                              >
                                <User className="w-4 h-4" /> View Teacher
                              </button>
                            ) : (
                              <>
                                <div className="mb-4">
                                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Offer (₹/mo)</label>
                                  <input 
                                    type="number"
                                    min={getTutorBasePrice(teacher) ? Math.ceil(getTutorBasePrice(teacher) * 0.6) : 0}
                                    max={getTutorBasePrice(teacher) || undefined}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50"
                                    placeholder={getTutorBasePrice(teacher) ? `e.g. ${getTutorBasePrice(teacher)}` : "e.g. 500"}
                                    value={negotiationOffer[teacher.id] || ''}
                                    onChange={(e) => setNegotiationOffer({...negotiationOffer, [teacher.id]: e.target.value})}
                                  />
                                </div>
                                {isHired ? (
                                  <button disabled className="w-full bg-emerald-100 text-emerald-800 font-bold py-3 rounded-xl shadow-none text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                                    <CheckCircle2 className="w-4 h-4" /> Already Hired
                                  </button>
                                ) : isPending ? (
                                  <button disabled className="w-full bg-orange-100 text-orange-800 font-bold py-3 rounded-xl shadow-none text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                                    Pending
                                  </button>
                                ) : (
                                  <div className="flex gap-2 mt-auto">
                                    <button 
                                      onClick={() => setSelectedViewUser(teacher)}
                                      className="w-1/3 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center"
                                    >
                                      View
                                    </button>
                                    <button 
                                      onClick={() => handleRequestTutor(teacher)}
                                      disabled={requestLoading}
                                      className="w-2/3 bg-[#00a992] text-white hover:bg-[#008f7b] font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {requestLoading ? 'Requesting...' : 'Request & Offer'}
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
                    {(!((tuitionSubTab === 'all' ? data?.allTutors : computedRecommendedTutors)?.filter((t: any) => !selectedCategory || (t.category && t.category.includes(selectedCategory)))) || ((tuitionSubTab === 'all' ? data?.allTutors : computedRecommendedTutors)?.filter((t: any) => !selectedCategory || (t.category && t.category.includes(selectedCategory))).length === 0)) && (
                      <div className="col-span-full p-10 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                        <Users className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">No tutors found</h3>
                        <p className="text-gray-500 max-w-sm mt-2">We couldn't find tutors matching your exact requirements right now.</p>
                      </div>
                    )}
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
                      const studentForApp = allStudents.find((s:any) => s.id === neg.studentId) || { name: neg.studentName || 'Student' };
                      return (
                        <div key={neg.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center" onClick={() => { setActiveRequestViewId(neg.id); setActiveTab('requests'); }}>
                          <div>
                            <p className="text-gray-900 font-medium">
                              {neg.status === 'declined' ? (
                                <span>Request declined for <span className="font-bold">{studentForApp.name}</span> with tutor <span className="font-bold">{neg.tutorName}</span></span>
                              ) : neg.status === 'tuition_started' ? (
                                <span>Fees paid for <span className="font-bold">{studentForApp.name}</span> with tutor <span className="font-bold">{neg.tutorName}</span></span>
                              ) : (
                                <span>New update on request with <span className="font-bold">{neg.tutorName}</span> for <span className="font-bold">{studentForApp.name}</span></span>
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
                    {displayRequests?.map((neg: any) => {
                      const studentForApp = allStudents.find((s:any) => s.id === neg.studentId) || { name: neg.studentName || 'Student' };
                      return (
                      <div key={neg.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-lg text-gray-900">Tutor: {neg.tutorName}</h4>
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md border border-blue-100">For: {studentForApp.name}</span>
                              </div>
                              <p className="text-sm text-gray-500 mb-1">{neg.category}</p>
                              {neg.category === 'programming' && neg.technologies && neg.technologies.length > 0 && <p className="text-sm font-medium text-emerald-600">Technologies: {neg.technologies.join(', ')}</p>}
                              {neg.category === 'languages' && neg.languagesTaught && neg.languagesTaught.length > 0 && <p className="text-sm font-medium text-emerald-600">Languages: {neg.languagesTaught.join(', ')}</p>}
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
                                neg.lastUpdatedBy === 'tutor' ? (
                                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'accept_price', neg.currentOffer)}
                                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
                                    >
                                      Accept Price
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setModalConfig({
                                          isOpen: true,
                                          type: 'price',
                                          title: 'Counter Offer',
                                          description: 'Propose a new monthly fee for this tutor.',
                                          placeholder: 'e.g. 500',
                                          initialValue: neg.currentOffer?.toString() || '',
                                          min: neg.absoluteMin || Math.ceil((neg.initialBudget || neg.currentOffer) * 0.6),
                                          max: neg.currentOffer,
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
                                      <p className="text-sm font-semibold text-gray-600">Waiting for tutor response...</p>
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

                              {/* Direct Payment */}
                              {neg.status === 'demo_pending_payment' && (
                                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                                  <button 
                                    onClick={() => setPayingClass(neg)}
                                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg transform hover:scale-105 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                  >
                                    <Lock className="w-4 h-4" /> Pay Fee
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          );
                        })}
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

            {/* TAB: MY TEACHERS */}
            {activeTab === 'my_teachers' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">My Teachers & Classes</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data?.upcomingClasses?.map((cls: any) => (
                      <li 
                        key={cls.id} 
                        className="relative bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 group overflow-hidden flex flex-col"
                      >
                        
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-emerald-100/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                        
                        <div className="flex flex-col h-full gap-5">
                          {/* Header section */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00a992] to-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
                                {cls.teacher?.charAt(0) || 'T'}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight truncate max-w-[150px] sm:max-w-[200px]">{cls.teacher}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100/50 uppercase tracking-wider">{cls.subject}</span>
                                  <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 truncate max-w-[120px]">For {allStudents.find((s:any) => s.id === cls.studentId)?.name?.split(' ')[0] || cls.studentName?.split(' ')[0] || 'Student'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm whitespace-nowrap ${
                              cls.status === 'confirmed' || cls.status === 'tuition_started'
                                ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200/50' 
                                : 'bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-700 border-orange-200/50'
                            }`}>
                              {cls.status === 'tuition_started' ? 'Active' : cls.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-1" />

                          {/* Details section */}
                          {cls.status === 'tuition_started' && cls.tutorDetails ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-3 text-sm flex-grow">
                              {cls.tutorDetails.phone && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Phone className="w-4 h-4" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                                    <p className="font-semibold text-gray-700 truncate">{cls.tutorDetails.phone}</p>
                                  </div>
                                </div>
                              )}
                              {cls.tutorDetails.email && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Mail className="w-4 h-4" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                                    <p className="font-semibold text-gray-700 truncate">{cls.tutorDetails.email}</p>
                                  </div>
                                </div>
                              )}
                              {cls.tutorDetails.qualification && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><GraduationCap className="w-4 h-4" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Degree</p>
                                    <p className="font-semibold text-gray-700 truncate">{cls.tutorDetails.qualification}</p>
                                  </div>
                                </div>
                              )}
                              {cls.tutorDetails.experience && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Star className="w-4 h-4" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Experience</p>
                                    <p className="font-semibold text-gray-700 truncate">{cls.tutorDetails.experience}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex-grow flex items-center justify-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed">
                              <p className="text-sm font-medium text-gray-500 text-center">Contact details will be revealed once the tuition is active.</p>
                            </div>
                          )}

                          {/* Action Button */}
                          {cls.status === 'demo_pending_payment' && (
                            <button onClick={(e) => { e.stopPropagation(); setPayingClass(cls); }} className="mt-auto w-full bg-[#00a992] text-white hover:bg-[#008f7b] py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2">
                              Complete Payment
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                    {(!data?.upcomingClasses || data?.upcomingClasses?.length === 0) && (
                      <li className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No active classes</h3>
                        <p className="text-gray-500 max-w-sm">You haven't hired any teachers yet. Explore our recommended tutors to get started!</p>
                      </li>
                    )}
                  </ul>
              </div>
            )}

            {/* TAB: REFERRALS */}
            {activeTab === 'referrals' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Refer & Earn</h2>
                <div className="bg-gradient-to-br from-[#063831] to-[#04241f] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-8">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Gift className="w-48 h-48" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-md">
                      <h3 className="text-2xl font-black mb-4">Invite Friends & Earn</h3>
                      <p className="text-emerald-100 mb-8 text-lg font-medium">Share your unique referral code. Earn 25% of the initial company margin (approx. 10% of total course value) when your friend books their first class!</p>
                      
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
                      <h4 className="text-4xl font-black text-[#002B20] mb-6">₹{data?.userData?.walletBalance || data?.userData?.walletbalance || 0}</h4>
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
                {hasProfile && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-2xl font-black text-gray-900">Parent / Guardian Profile</h2>
                      {!isEditingParentProfile && (
                        <button 
                          onClick={() => setIsEditingParentProfile(true)}
                          className="bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
                        >
                          View Profile
                        </button>
                      )}
                    </div>
                    
                    {isEditingParentProfile ? (
                      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative mb-8">
                        <div className="bg-emerald-50 border-b border-emerald-100 p-4 text-emerald-800 flex justify-between items-center font-medium text-sm">
                          <span>Editing Parent / Guardian Profile</span>
                          <button onClick={() => setIsEditingParentProfile(false)} className="font-bold underline">Cancel</button>
                        </div>
                        <div className="p-8">
                          <DemoForm 
                            isDashboard={true} 
                            hasProfile={true} 
                            parentOnly={true}
                            initialData={{
                              guardianName: data?.profile?.name || data?.user?.displayName || '',
                              email: data?.profile?.email || data?.user?.email || '',
                              phoneNumber: data?.profile?.phone || '',
                              whatsappNumber: data?.profile?.whatsapp || '',
                              address: data?.profile?.address || '',
                              preferredMode: data?.profile?.preferredMode || '',
                            }} 
                            onSuccess={() => {
                              mutate();
                              setIsEditingParentProfile(false);
                            }} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden mb-8">
                        <div className="bg-[#00a992] p-6 flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-black text-white">{data?.profile?.name || data?.user?.displayName || 'Parent Profile'}</h3>
                            <p className="text-sm font-medium text-emerald-100">{data?.profile?.email || data?.user?.email || 'No email provided'}</p>
                          </div>
                        </div>
                        <div className="p-6 bg-gray-50/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                              <p className="text-lg font-bold text-gray-900">{data?.profile?.phone || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{data?.profile?.preferredMode?.toLowerCase() === 'online' ? 'Preferred Mode' : 'Address'}</p>
                              <p className="text-lg font-bold text-gray-900">{data?.profile?.preferredMode?.toLowerCase() === 'online' ? 'Online' : (data?.profile?.address || '-')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-gray-900">Registered Students</h2>
                  {hasProfile && (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setActiveStudentId('new');
                        }}
                        className="bg-[#00a992] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-600 transition-colors"
                      >
                        + Add Student
                      </button>
                    </div>
                  )}
                </div>

                {!hasProfile || activeStudentId === 'new' || editingStudentId ? (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                    {!hasProfile && (
                      <div className="bg-orange-50 border-b border-orange-100 p-4 text-orange-800 flex items-center justify-center gap-2 font-medium text-sm text-center">
                        <Lock className="w-4 h-4" /> Please submit a demo request profile to unlock the rest of your dashboard!
                      </div>
                    )}
                    {(activeStudentId === 'new' || editingStudentId) && hasProfile && (
                      <div className="bg-emerald-50 border-b border-emerald-100 p-4 text-emerald-800 flex justify-between items-center font-medium text-sm">
                        <span>{editingStudentId ? 'Editing student profile' : 'Adding a new student profile'}</span>
                        <button onClick={() => { setActiveStudentId(''); setEditingStudentId(''); }} className="font-bold underline">Cancel</button>
                      </div>
                    )}
                    <DemoForm 
                      key={(editingStudentId || activeStudentId) || 'default'}
                      isDashboard={true} 
                      hasProfile={hasProfile} 
                      category={selectedCategory} 
                      activeStudentId={editingStudentId || activeStudentId} 
                      initialData={(() => {
                        const activeId = editingStudentId || activeStudentId;
                        if (activeId !== 'new' && activeId !== '') {
                          return allStudents.find((s:any) => s.id === activeId);
                        } else if (activeId === 'new') {
                          const base = allStudents[0] || {};
                          return { ...base, name: '', gender: '', classLevel: '', board: '', subjects: [], technologies: [], languages: [], studentType: '', budget: 4000 };
                        } else {
                          return allStudents[0];
                        }
                      })()}
                      onSuccess={() => {
                        if(activeStudentId === 'new') setActiveStudentId('');
                        if(editingStudentId) setEditingStudentId('');
                        mutate();
                      }} 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allStudents.map((s:any) => {
                      const groupIndex = studentGroups.findIndex((g: any) => g.id === (s.groupId || `indv_${s.id}`));
                      const groupLabel = groupIndex >= 0 ? `Group ${groupIndex + 1}` : '';
                      const isGrouped = s.groupId && !s.groupId.startsWith('indv_');
                      
                      return (
                        <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col overflow-hidden">
                          <div className="bg-[#00a992] p-6 flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-white">{s.name}</h3>
                              <p className="text-sm font-medium text-emerald-100 capitalize">
                                {s.category} {isGrouped ? `• ${groupLabel}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            <div className="space-y-2 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex-grow">
                            {s.classLevel && <p><strong className="text-gray-700">Class:</strong> {s.classLevel}</p>}
                            {s.board && <p><strong className="text-gray-700">Board:</strong> {s.board}</p>}
                            {s.subjects && s.subjects.length > 0 && <p><strong className="text-gray-700">Subjects:</strong> {s.subjects.join(', ')}</p>}
                            {s.technologies && s.technologies.length > 0 && <p><strong className="text-gray-700">Technologies:</strong> {s.technologies.join(', ')}</p>}
                            {s.languages && s.languages.length > 0 && <p><strong className="text-gray-700">Languages:</strong> {s.languages.join(', ')}</p>}
                            <p><strong className="text-gray-700">Budget:</strong> ₹{s.budget}/mo</p>
                          </div>
                          <div className="flex gap-3 mt-auto pt-2">
                            <button 
                              onClick={() => setEditingStudentId(s.id)}
                              className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center"
                            >
                              View Profile
                            </button>
                            <button 
                              onClick={() => setStudentToRemove(s)}
                              className="w-[20%] bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center"
                              title="Remove Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {allStudents.length > 1 && !editingStudentId && activeStudentId !== 'new' && (
                  <div className="mt-12">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] border border-gray-100">
                      <GroupManager 
                        students={allStudents}
                        title="Manage Groups"
                        subtitle="Drag and drop students to change their group assignments. Click save when you are done."
                        onSave={async (groupedStudents) => {
                          try {
                            const { db } = await import('@/utils/firebase/client');
                            const { doc, updateDoc } = await import('firebase/firestore');
                            
                            for (const student of groupedStudents) {
                              await updateDoc(doc(db, 'students', student.id), {
                                groupId: student.groupId
                              });
                            }
                            
                            toast.success("Groups updated successfully!");
                            mutate(); // Refresh data
                          } catch (e: any) {
                            toast.error("Failed to update groups: " + e.message);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

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

            {/* PAYMENT MODAL */}
            {payingClass && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00a992]/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                  <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">Complete Payment</h3>
                  <p className="text-gray-500 mb-6 font-medium relative z-10">You are about to start tuition with <span className="font-bold text-gray-900">{payingClass.teacher}</span>.</p>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 relative z-10">
                    <div className="flex justify-between items-center mb-4 text-sm font-bold text-gray-500">
                      <span>Course Fee</span>
                      <span className="text-gray-900">₹{payingClass.finalPrice || 4000}</span>
                    </div>
                    
                    {(data?.userData?.walletBalance || 0) > 0 && (
                      <div className="flex items-start gap-3 mb-4 pt-4 border-t border-gray-200">
                        <input
                          type="checkbox"
                          id="useWallet"
                          checked={useWallet}
                          onChange={(e) => setUseWallet(e.target.checked)}
                          className="mt-1 w-4 h-4 text-[#00a992] rounded border-gray-300 focus:ring-[#00a992]"
                        />
                        <div className="flex-1">
                          <label htmlFor="useWallet" className="text-sm font-bold text-gray-900 cursor-pointer block">
                            Apply Wallet Balance
                          </label>
                          <p className="text-xs text-gray-500 font-medium">Available: ₹{data?.userData?.walletBalance}</p>
                        </div>
                        <span className="text-emerald-600 font-bold text-sm">
                          -₹{useWallet ? Math.min(payingClass.finalPrice || 4000, data?.userData?.walletBalance) : 0}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-lg font-black text-gray-900">
                      <span>Total to Pay</span>
                      <span className="text-[#00a992]">
                        ₹{useWallet ? Math.max(0, (payingClass.finalPrice || 4000) - (data?.userData?.walletBalance || 0)) : (payingClass.finalPrice || 4000)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 relative z-10">
                    <button
                      onClick={() => { setPayingClass(null); setUseWallet(false); }}
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

      {/* Modals and Overlays */}
      {/* View Teacher Profile Modal */}
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
                  {selectedViewUser.name?.charAt(0) || 'T'}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">{selectedViewUser.name}</h3>
                  <p className="text-emerald-100 font-bold capitalize mt-1 text-lg flex items-center gap-2">
                    <User className="w-4 h-4" /> {selectedViewUser.category || 'Tutor'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-10 overflow-y-auto">
              <div className="space-y-8">
                
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Professional Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Experience</p>
                      <p className="font-bold text-gray-800">{selectedViewUser.experience || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Highest Qualification</p>
                      <p className="font-bold text-gray-800">{selectedViewUser.qualification || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Teaching Expertise
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedViewUser.category === 'programming' && (selectedViewUser.technologies?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Technologies</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedViewUser.technologies.map((t: string) => (
                            <span key={t} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedViewUser.category === 'languages' && (selectedViewUser.languagesTaught?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Languages</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedViewUser.languagesTaught.map((l: string) => (
                            <span key={l} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{l}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(!selectedViewUser.category || selectedViewUser.category === 'school') && (selectedViewUser.subjects?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subjects</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedViewUser.subjects.map((s: string) => (
                            <span key={s} className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded-md border border-gray-200 shadow-sm">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Teaching Approach</p>
                      <p className="font-bold text-gray-800">{selectedViewUser.teachingApproach || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Budget</p>
                    <p className="text-3xl font-black text-emerald-700">₹{selectedViewUser.feeRange || 'Negotiable'}<span className="text-base font-bold text-emerald-600/70">/mo</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Mode & Location</p>
                    <p className="font-bold text-emerald-800 capitalize">{selectedViewUser.mode || 'Online'}</p>
                    {selectedViewUser.mode?.toLowerCase() !== 'online' && selectedViewUser.locations && (
                      <p className="text-sm font-medium text-emerald-700 mt-1 max-w-[200px] truncate" title={selectedViewUser.locations}>
                        {selectedViewUser.locations || 'Location hidden'}
                      </p>
                    )}
                  </div>
                </div>
                
                {selectedViewUser.mode?.toLowerCase() !== 'online' && selectedViewUser.address && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Residential Address
                    </h4>
                    <p className="font-bold text-gray-800">{selectedViewUser.address}</p>
                  </div>
                )}
              </div>

            {/* Actions */}
            {(() => {
              const hasNegotiation = data?.applications?.some((app: any) => app.tutorId === selectedViewUser.id && ['negotiating'].includes(app.status));
              const isPending = data?.applications?.some((app: any) => app.tutorId === selectedViewUser.id && ['demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
              const isHired = data?.applications?.some((app: any) => app.tutorId === selectedViewUser.id && ['tuition_started'].includes(app.status));
              const cooldownApp = data?.applications?.find((app: any) => app.tutorId === selectedViewUser.id && app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000));
              
              if (isHired || isPending || hasNegotiation || cooldownApp) return null;
              
              return (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Offer (₹/mo)</label>
                      <input 
                        type="number"
                        min={getTutorBasePrice(selectedViewUser) ? Math.ceil(getTutorBasePrice(selectedViewUser) * 0.6) : 0}
                        max={getTutorBasePrice(selectedViewUser) || undefined}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50"
                        placeholder={getTutorBasePrice(selectedViewUser) ? `e.g. ${getTutorBasePrice(selectedViewUser)}` : "e.g. 500"}
                        value={negotiationOffer[selectedViewUser.id] || ''}
                        onChange={(e) => setNegotiationOffer({...negotiationOffer, [selectedViewUser.id]: e.target.value})}
                      />
                    </div>
                    <button 
                      onClick={() => { handleRequestTutor(selectedViewUser); setSelectedViewUser(null); }}
                      className="w-full bg-[#00a992] text-white hover:bg-[#008f7b] font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Send Request
                    </button>
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        </div>
      )}

      {/* Remove Student Confirmation Modal */}
      {studentToRemove && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Remove Student?</h3>
            <p className="text-gray-500 font-medium mb-6">Are you sure you want to remove <strong className="text-gray-900">{studentToRemove.name}</strong>? All their tuition requests will also be deleted. This cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setStudentToRemove(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={isRemovingStudent}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  setIsRemovingStudent(true);
                  try {
                    const { db } = await import('@/utils/firebase/client');
                    const { doc, deleteDoc, query, collection, where, getDocs } = await import('firebase/firestore');
                    
                    // Delete student
                    await deleteDoc(doc(db, 'students', studentToRemove.id));
                    
                    // Delete tuition requests
                    const reqQ = query(collection(db, 'tuition_requests'), where('studentId', '==', studentToRemove.id));
                    const reqSnap = await getDocs(reqQ);
                    for (const reqDoc of reqSnap.docs) {
                      await deleteDoc(doc(db, 'tuition_requests', reqDoc.id));
                    }
                    
                    // Delete applications
                    const appQ = query(collection(db, 'applications'), where('studentId', '==', studentToRemove.id));
                    const appSnap = await getDocs(appQ);
                    for (const appDoc of appSnap.docs) {
                      await deleteDoc(doc(db, 'applications', appDoc.id));
                    }
                    
                    toast.success('Student removed successfully');
                    mutate();
                    setStudentToRemove(null);
                  } catch (err: any) {
                    toast.error(err.message);
                  } finally {
                    setIsRemovingStudent(false);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all flex items-center justify-center"
                disabled={isRemovingStudent}
              >
                {isRemovingStudent ? 'Removing...' : 'Yes, Remove'}
              </button>
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
              This will permanently delete your account, parents profile, all registered students, and all history.
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
                    
                    // Delete parent doc
                    await deleteDoc(doc(db, 'parents', uid));
                    
                    // Delete user doc
                    await deleteDoc(doc(db, 'users', uid));
                    
                    // Delete all students
                    const stuQ = query(collection(db, 'students'), where('parentId', '==', uid));
                    const stuSnap = await getDocs(stuQ);
                    for (const d of stuSnap.docs) await deleteDoc(doc(db, 'students', d.id));
                    
                    // Delete all requests
                    const reqQ = query(collection(db, 'tuition_requests'), where('parentId', '==', uid));
                    const reqSnap = await getDocs(reqQ);
                    for (const d of reqSnap.docs) await deleteDoc(doc(db, 'tuition_requests', d.id));
                    
                    // Delete all applications
                    const appQ = query(collection(db, 'applications'), where('parentId', '==', uid));
                    const appSnap = await getDocs(appQ);
                    for (const d of appSnap.docs) await deleteDoc(doc(db, 'applications', d.id));
                    
                    // Delete tutor requests
                    const tutorReqQ = query(collection(db, 'tutor_requests'), where('parentId', '==', uid));
                    const tutorReqSnap = await getDocs(tutorReqQ);
                    for (const d of tutorReqSnap.docs) await deleteDoc(doc(db, 'tutor_requests', d.id));

                    // Delete direct requests
                    const directReqQ = query(collection(db, 'direct_requests'), where('parentId', '==', uid));
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

      </main>
    </div>
  );
}
