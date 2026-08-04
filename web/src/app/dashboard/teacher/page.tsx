"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import axios from 'axios';
import { motion } from 'motion/react';
import { Calendar, CalendarDays, LayoutDashboard, LogOut, ShieldCheck, User, Users, Gift, Lock, CheckCircle2, MessageCircle, BookOpen, Menu, X, Globe, Star, Bell, Phone, Mail, MapPin, Target, Handshake, ChevronRight, ArrowRight, CreditCard, IndianRupee, TrendingUp, TrendingDown, Copy, Wallet, Clock, GraduationCap } from 'lucide-react';
import TeacherForm from '@/components/TeacherForm';
import ActionModal from '@/components/ActionModal';
import MessageModal from '@/components/MessageModal';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { generateReferralCode } from '@/utils/referral';
import { calculateSuitabilityScore, doesClassMatch } from '@/utils/matching';
import { toast } from 'sonner';
const logo = '/imports/logo.png';

import useSWR from 'swr';
import { fetchTeacherDashboardData } from '@/api/dashboardApi';
import { WhatsAppButton } from '@/components/WhatsAppButton';

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
  const [activeTab, setActiveTabState] = useState('dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTabState(tab);
      }
    }
  }, []);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url);
    }
  };

  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [hasDismissedReminder, setHasDismissedReminder] = useState(false);
  const [selectedViewUser, setSelectedViewUser] = useState<any>(null);
  const [selectedViewApp, setSelectedViewApp] = useState<any>(null);
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
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'price'|'timing'|'demo_booking', title: string, description: string, placeholder: string, initialValue: string, initialDate?: string, initialTime?: string, min?: number, max?: number, isOnline?: boolean, onSubmit: (val: string, date?: string, time?: string) => void }>({ isOpen: false, type: 'price', title: '', description: '', placeholder: '', initialValue: '', onSubmit: () => {} });
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
  const [postPaymentPopup, setPostPaymentPopup] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const { data, error: swrError, isLoading: loading, mutate } = useSWR(
    'teacherDashboardData', 
    fetchTeacherDashboardData,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60000 
    }
  );

  useEffect(() => {
    if (swrError) {
      if (swrError.message === 'Unauthenticated') {
        router.push('/login');
      } else if (swrError.message === 'Unauthorized') {
        router.push('/dashboard/student');
      }
    }
  }, [swrError, router]);


  const hasProfile = !!data?.profile?.phone || !!data?.profile?.category || !!data?.profile?.subjects;

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

          const isOnlineOnlyCategory = parsedData.category === 'programming' || parsedData.category === 'languages';
          const actualMode = isOnlineOnlyCategory ? 'Online' : parsedData.mode;
          const combinedAddress = (actualMode?.toLowerCase() === 'online') ? '' : [parsedData.street, parsedData.city, parsedData.pincode].filter(Boolean).join(', ');

          await updateDoc(doc(db, 'tutors', user.uid), {
            category: parsedData.category || '',
            name: parsedData.fullName,
            gender: parsedData.gender,
            phone: parsedData.phone,
            whatsapp: parsedData.whatsapp,
            address: combinedAddress,
            area: (actualMode?.toLowerCase() === 'online') ? '' : (parsedData.street || ''),
            city: (actualMode?.toLowerCase() === 'online') ? '' : (parsedData.city || ''),
            qualification: parsedData.qualification,
            experience: parsedData.experience,
            occupation: parsedData.occupation,
            subjects: parsedData.subjects || [],
            classes: parsedData.classes || [],
            boards: parsedData.boards || [],
            technologies: parsedData.technologies || [],
            languagesTaught: parsedData.languages || [],
            mode: actualMode,
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
      const { doc, updateDoc, arrayRemove, getDoc } = await import('firebase/firestore');
      
      // Update application directly to demo_booking_phase
      if (payingClass?.id && payingClass.id !== 'mock-id') {
        await updateDoc(doc(db, 'applications', payingClass.id), { 
          status: 'demo_booking_phase', 
          demoPaymentPaid: true,
          updatedAt: Date.now()
        });
        await updateDoc(doc(db, 'tutors', data?.user?.uid as string), { pendingRequests: arrayRemove(payingClass.id) });
        if (payingClass.studentsList) {
          for (const student of payingClass.studentsList) {
            if (student.id) {
              await updateDoc(doc(db, 'students', student.id), { pendingRequests: arrayRemove(payingClass.id) });
            }
          }
        }
      }
      
      let finalPayingClass = { ...payingClass };
      const studentData = finalPayingClass?.studentsList?.[0] || finalPayingClass?.studentDetails || {};
      
      if (studentData?.parentId && !studentData?.parentDetails?.phone) {
        const parentDoc = await getDoc(doc(db, 'parents', studentData.parentId));
        if (parentDoc.exists()) {
           if (finalPayingClass.studentsList) {
             finalPayingClass.studentsList[0].parentDetails = parentDoc.data();
           } else if (finalPayingClass.studentDetails) {
             finalPayingClass.studentDetails.parentDetails = parentDoc.data();
           }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Payment completed successfully!");
      setPostPaymentPopup(finalPayingClass);
      setPayingClass(null);
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleMarkAsPaid = async (app: any) => {
    setActionLoading(app.id);
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      
      await updateDoc(doc(db, 'applications', app.id), {
        subsequentPayments: arrayUnion({
          amount: app.finalPrice || 0,
          date: Date.now()
        }),
        updatedAt: Date.now()
      });
      
      toast.success("Payment marked as received!");
      mutate();
    } catch (e: any) {
      toast.error(e.message || "Failed to mark payment as received");
    } finally {
      setActionLoading(null);
    }
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dailyRequestsCount = data?.applications?.filter((app: any) => app.initiator === 'teacher' && app.createdAt >= todayStart.getTime()).length || 0;

  const handleSendOffer = async (student: any) => {
    if (dailyRequestsCount >= 5) {
      toast.error("You have reached your daily limit of 5 requests.");
      return;
    }
    const teacherLimit = data?.profile?.isSubscribed ? 15 : 5;
    const teacherPendingCount = data?.profile?.pendingRequests?.length || 0;
    if (teacherPendingCount >= teacherLimit) {
      toast.error(`You already have ${teacherLimit} pending requests in your queue. Please accept or decline some before sending more.`);
      return;
    }
    const studentPendingCount = student.pendingRequests?.length || 0;
    if (studentPendingCount >= 5) {
      toast.error("This student already has the maximum number of pending offers.");
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
      const { collection, addDoc, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const user = auth.currentUser;

      const appRef = await addDoc(collection(db, 'applications'), {
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
        category: student.category || 'general',
        demoHours: (student.students ? student.students[0]?.hoursPerDay : (student.hoursPerDay || student.preferredTimeRange)) || 'Flexible',
        createdAt: Date.now()
      });

      // Update the teacher's pending request queue
      await updateDoc(doc(db, 'tutors', user?.uid as string), {
        pendingRequests: arrayUnion(appRef.id)
      });
      // Update the students' pending request queue
      const studentIdsToUpdate = student.students ? student.students.map((s:any)=>s.id) : [student.id];
      for (const sid of studentIdsToUpdate) {
        await updateDoc(doc(db, 'students', sid), {
          pendingRequests: arrayUnion(appRef.id)
        });
      }

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
      toast.error("You have reached your daily limit of 5 requests.");
      return;
    }
    const teacherLimit = data?.profile?.isSubscribed ? 15 : 5;
    const teacherPendingCount = data?.profile?.pendingRequests?.length || 0;
    if (teacherPendingCount >= teacherLimit) {
      toast.error(`You already have ${teacherLimit} pending requests in your queue. Please accept or decline some before sending more.`);
      return;
    }
    const studentPendingCount = student.pendingRequests?.length || 0;
    if (studentPendingCount >= 5) {
      toast.error("This student already has the maximum number of pending offers.");
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
      const { collection, addDoc, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const user = auth.currentUser;

      const offerPrice = student.budget || 500;

      const appRef = await addDoc(collection(db, 'applications'), {
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
        category: student.category || 'general',
        demoHours: (student.students ? student.students[0]?.hoursPerDay : (student.hoursPerDay || student.preferredTimeRange)) || 'Flexible',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Update the teacher's pending request queue
      await updateDoc(doc(db, 'tutors', user?.uid as string), {
        pendingRequests: arrayUnion(appRef.id)
      });
      // Update the students' pending request queue
      const studentIdsToUpdate = student.students ? student.students.map((s:any)=>s.id) : [student.id];
      for (const sid of studentIdsToUpdate) {
        await updateDoc(doc(db, 'students', sid), {
          pendingRequests: arrayUnion(appRef.id)
        });
      }

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
      const { doc, updateDoc, arrayRemove } = await import('firebase/firestore');
      
      const updateData: any = {};
      let isFinalState = false;
      if (action === 'accept_price' || action === 'request_demo') {
        updateData.status = 'demo_requested_by_teacher';
        if (newOffer) updateData.finalPrice = newOffer;
        updateData.lastUpdatedBy = 'tutor';
      } else if (action === 'propose_demo_date') {
        updateData.proposedDate = neg?.proposedDate;
        updateData.proposedTime = neg?.proposedTime;
        updateData.lastUpdatedBy = 'teacher';
      } else if (action === 'accept_demo_date') {
        updateData.status = 'demo_scheduled';
        updateData.demoDate = neg?.proposedDate || data?.applications?.find((a:any)=>a.id===appId)?.proposedDate;
        updateData.demoTime = neg?.proposedTime || data?.applications?.find((a:any)=>a.id===appId)?.proposedTime;
        updateData.lastUpdatedBy = 'teacher';
      } else if (action === 'counter_price') {
        updateData.currentOffer = newOffer;
        updateData.lastUpdatedBy = 'tutor';
      } else if (action === 'decline') {
        updateData.status = 'declined';
        updateData.declinedAt = Date.now();
        isFinalState = true;
      }
      updateData.updatedAt = Date.now();

      await updateDoc(doc(db, 'applications', appId), updateData);
      
      if (isFinalState) {
        const app = data?.applications?.find((a: any) => a.id === appId);
        if (app) {
          if (app.tutorId) await updateDoc(doc(db, 'tutors', app.tutorId), { pendingRequests: arrayRemove(appId) });
          if (app.studentIds) {
            for (const sid of app.studentIds) {
              await updateDoc(doc(db, 'students', sid), { pendingRequests: arrayRemove(appId) });
            }
          }
        }
      }
      
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
    { id: 'earnings', label: 'Earnings', icon: IndianRupee },
    { id: 'referrals', label: 'Referrals', icon: Gift },
  ];

  const activeTeacher = (data?.profile || data?.user || null) as any;
  const allStudentsWithScores = (data?.allStudents || []).filter((group: any) => group.parentId !== data?.userData?.id).map((studentGroup: any) => {
    const getDetail = (obj: any, field: string) => obj[field] || (obj.students && obj.students[0] ? obj.students[0][field] : '') || '';
    const studentBudget = parseFloat(studentGroup.budget || studentGroup.totalBudget || studentGroup.combinedBudget || getDetail(studentGroup, 'budget') || 0);
    const teacherFee = parseFloat((activeTeacher as any)?.feeRange || (activeTeacher as any)?.minFee || 0);
    return {
      ...studentGroup,
      suitabilityScore: calculateSuitabilityScore(studentGroup, activeTeacher),
      budgetDifference: Math.abs(studentBudget - teacherFee)
    };
  }).sort((a: any, b: any) => {
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
      
      if (b.suitabilityScore !== a.suitabilityScore) {
          return b.suitabilityScore - a.suitabilityScore;
      }
      
      return a.budgetDifference - b.budgetDifference;
  }).map((student: any, index: number) => ({
      ...student,
      rank: index + 1
  }));

  const computedRecommendedStudents = allStudentsWithScores.filter((studentGroup: any) => {
      if (studentGroup.suitabilityScore <= 0) return false;
      
      const getDetail = (obj: any, field: string) => obj[field] || (obj.students && obj.students[0] ? obj.students[0][field] : '') || '';

      const studentCat = getDetail(studentGroup, 'category').toLowerCase().trim();
      const teacherCats = activeTeacher?.category ? activeTeacher.category.toLowerCase().split(',').map((c: string) => c.trim()) : [];
      if (studentCat && !teacherCats.includes(studentCat)) return false;

      if (studentCat === 'school') {
          const studentBoard = getDetail(studentGroup, 'board').toLowerCase().trim();
          const teacherBoards = (activeTeacher?.boards || []).map((b: string) => b.toLowerCase().trim());
          if (studentBoard && !teacherBoards.includes(studentBoard)) return false;

          const studentClass = (getDetail(studentGroup, 'classLevel') || getDetail(studentGroup, 'classGrade')).toLowerCase().trim();
          const teacherClasses = (activeTeacher?.classes || []).map((c: string) => c.toLowerCase().trim());
          if (!doesClassMatch(studentClass, teacherClasses)) return false;
      }

      const genderPref = studentGroup.requestDoc?.teacherGenderPreference || studentGroup.teacherGenderPreference;
      if (genderPref && genderPref !== 'No Preference') {
          if (activeTeacher?.gender !== genderPref) return false;
      }

      let studentNeeds: string[] = [];
      let teacherOffers: string[] = [];
      
      if (studentCat === 'school') {
        studentNeeds = getDetail(studentGroup, 'subjects') || getDetail(studentGroup, 'combinedSubjects') || [];
        teacherOffers = activeTeacher?.subjects || [];
      } else if (studentCat === 'programming') {
        studentNeeds = getDetail(studentGroup, 'technologies') || getDetail(studentGroup, 'combinedTechnologies') || [];
        teacherOffers = activeTeacher?.technologies || [];
      } else if (studentCat === 'languages') {
        studentNeeds = getDetail(studentGroup, 'languages') || getDetail(studentGroup, 'combinedLanguages') || [];
        teacherOffers = activeTeacher?.languagesTaught || activeTeacher?.languages || [];
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
  });

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
        <div className="h-[88px] px-6 border-b border-white/10 flex flex-col justify-center items-start">
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

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
        <header className="h-[88px] bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
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
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    <div className="md:col-span-5 flex flex-col justify-center">
                      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 mb-2">
                        Hello {data?.profile?.name?.split(' ')[0] || data?.user?.displayName?.split(' ')[0] || 'Teacher'}! <span className="text-4xl animate-bounce origin-bottom-right">👋</span>
                      </h1>
                      <p className="text-slate-500 text-lg leading-relaxed">Nice to have you back! Get ready to continue your teaching journey.</p>
                    </div>

                    <div className="md:col-span-7 flex flex-col sm:flex-row gap-4 justify-end">
                      {/* Earnings Mini Widget */}
                      <div 
                        onClick={() => setActiveTab('earnings')}
                        className="flex-1 bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-100/60 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <IndianRupee className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">View All</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Net Revenue</p>
                          <h3 className="text-2xl font-black text-gray-900">₹{data?.earningsData?.netRevenue?.toLocaleString() || '0'}</h3>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">₹{data?.earningsData?.activeMRR?.toLocaleString() || '0'} Active MRR</p>
                        </div>
                      </div>

                      {/* Profile Completeness Card */}
                      <div 
                        onClick={() => setActiveTab('profile')}
                        className="flex-1 bg-gradient-to-br from-white to-slate-50 border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm text-slate-600 flex items-center justify-center border border-gray-100 mb-4">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1 flex flex-col justify-end">
                          <p className="font-bold text-gray-900 text-sm tracking-tight mb-1">Strengthen Profile</p>
                          <p className="text-xs text-slate-500 mb-3 font-medium">You're {profileCompleteness}% there!</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-slate-400 rounded-full" style={{ width: `${profileCompleteness}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-600">{profileCompleteness}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Split Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left: My Students */}
                    <div className="lg:col-span-2 space-y-4">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">My Students</h2>
                      
                      {myActiveStudents.length === 0 ? (
                        <div className="bg-gradient-to-b from-white to-slate-50 border border-gray-100 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
                            <Users className="w-10 h-10 text-emerald-500" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">No students chosen yet</h3>
                          <p className="text-slate-500 max-w-sm mb-8 font-medium">Explore our catalog of students and find the perfect match to start your teaching journey.</p>
                          <button 
                            onClick={() => setActiveTab('new_tuition')}
                            className="bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Globe className="w-5 h-5" /> Explore Students
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {myActiveStudents.slice(0, 3).map((cls: any) => (
                            <div key={cls.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0 border border-emerald-100/50 shadow-sm">
                                  {cls.student?.charAt(0) || 'S'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 truncate tracking-tight">{cls.student}</h4>
                                  <p className="text-sm text-slate-500 truncate font-medium">{cls.subject}</p>
                                </div>
                              </div>
                              <button onClick={() => { if(cls.studentDetails) setSelectedViewUser(cls.studentDetails); else setActiveTab('my_students'); }} className="text-slate-700 font-bold text-sm bg-slate-100 px-5 py-2.5 rounded-xl hover:bg-slate-200 hover:text-slate-900 flex-shrink-0 transition-colors">
                                View
                              </button>
                            </div>
                          ))}
                          {myActiveStudents.length > 3 && (
                            <button onClick={() => setActiveTab('my_students')} className="text-sm font-bold text-slate-500 hover:text-[#00a992] py-2 text-center w-full transition-colors">
                              View all {myActiveStudents.length} students →
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Recommended Students */}
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recommended Students</h2>
                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        {computedRecommendedStudents.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-slate-500 text-sm font-medium">No recommendations yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50/50">
                            {computedRecommendedStudents.filter((student: any) => {
                              const lockedApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === student.id && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                              return !lockedApp;
                            }).slice(0, 4).map((student: any, index: number) => {
                              const offerApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === student.id && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                              
                              const isLocked = !!offerApp;
                              const isRed = false; 
                              const isDemoPhase = offerApp && ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(offerApp.status);
                              const labelText = isDemoPhase ? 'Demo Phase' : (offerApp?.lastUpdatedBy === 'tutor' ? 'Offer Sent' : 'Offer Received');

                              return (
                                <div key={student.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3 relative hover:bg-slate-50 px-2 -mx-2 rounded-2xl transition-colors">
                                  {isLocked && (
                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-end pr-4 rounded-2xl pointer-events-none">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${isRed ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {labelText}
                                        </span>
                                    </div>
                                  )}
                                  <div className="w-8 h-8 rounded-full bg-orange-50/80 border border-orange-100 flex items-center justify-center font-bold text-orange-600 text-xs flex-shrink-0 shadow-sm">
                                    #{student.rank}
                                  </div>
                                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0 shadow-sm">
                                    {student.name?.charAt(0) || 'S'}
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <h4 className="font-bold text-gray-900 text-sm truncate tracking-tight">{student.name || 'Student'}</h4>
                                    <p className="text-xs text-slate-500 truncate font-medium">{student.subjects ? student.subjects.join(', ') : student.category}</p>
                                  </div>
                                  <button onClick={() => setSelectedViewUser(student)} className="text-slate-700 font-bold text-xs bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 hover:text-slate-900 z-0 flex-shrink-0 transition-colors">
                                    View
                                  </button>
                                </div>
                              );
                            })}
                            {computedRecommendedStudents.length > 4 && (
                              <div className="pt-4 mt-2">
                                <button onClick={() => setActiveTab('new_tuition')} className="w-full text-center text-xs font-bold text-slate-500 hover:text-[#00a992] transition-colors">
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
                          const offerApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === group.id && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                          
                          const isPending = data?.applications?.some((app: any) => (app.groupId || app.studentId) === group.id && ['demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
                          const isHired = data?.applications?.some((app: any) => (app.groupId || app.studentId) === group.id && ['tuition_started'].includes(app.status));
                          
                          const isLocked = false;
                          const isRed = !!lockedApp;
                          const isDemoPhase = offerApp && ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(offerApp.status);
                          const labelText = isRed ? 'Locked' : (isDemoPhase ? 'Demo Phase' : (offerApp?.lastUpdatedBy === 'tutor' ? 'Offer Sent' : (offerApp ? 'Offer Received' : '')));

                          return (
                            <div key={group.id} className="bg-white rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden relative group">
                              <div className="bg-gradient-to-br from-[#00a992] to-teal-600 p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                                  {group.rank && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md flex-shrink-0 ${group.rank === 1 ? 'bg-yellow-400 text-yellow-900' : group.rank === 2 ? 'bg-gray-300 text-gray-800' : group.rank === 3 ? 'bg-amber-600 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                                      #{group.rank}
                                    </div>
                                  )}
                                  <h3 className="text-lg font-bold text-white tracking-tight truncate">{parentName}</h3>
                                </div>
                                {labelText ? (
                                  <span className={`px-2 py-1 text-[9px] font-black rounded border shadow-sm uppercase tracking-wider whitespace-nowrap flex-shrink-0 ${isRed ? 'bg-white/95 text-red-600 border-red-100' : 'bg-white/95 text-teal-700 border-teal-100'}`}>
                                    {labelText}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded border border-white/30 uppercase tracking-wider flex-shrink-0 shadow-sm">
                                    {group.category || 'Student'}
                                  </span>
                                )}
                              </div>
                              
                              <div className="p-6 flex flex-col flex-grow">
                                <div className="mb-6">
                                  <h4 className="font-bold text-gray-900 text-lg mb-3">{group.name || 'Group'}</h4>
                                  <div className="text-sm text-slate-600 mt-2 grid grid-cols-1 gap-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100/60 shadow-inner">
                                    {firstStudent.classLevel && <span><strong className="text-slate-900">Class:</strong> {firstStudent.classLevel}</span>}
                                    {(!group.category || group.category === 'school') && (firstStudent.subjects?.length ?? 0) > 0 && <span><strong className="text-slate-900">Sub:</strong> {firstStudent.subjects[0]}{firstStudent.subjects.length > 1 ? '...' : ''}</span>}
                                    {group.category === 'programming' && (firstStudent.technologies?.length ?? 0) > 0 && <span><strong className="text-slate-900">Tech:</strong> {firstStudent.technologies[0]}{firstStudent.technologies.length > 1 ? '...' : ''}</span>}
                                    {group.category === 'languages' && (firstStudent.languages?.length ?? 0) > 0 && <span><strong className="text-slate-900">Lang:</strong> {firstStudent.languages[0]}{firstStudent.languages.length > 1 ? '...' : ''}</span>}
                                    <span className="mt-2 pt-3 border-t border-slate-200/60"><strong className="text-slate-900">Budget:</strong> <span className="text-emerald-600 font-bold text-lg">₹{group.budget}<span className="text-sm">/mo</span></span></span>
                                  </div>
                                </div>

                                <div className="mt-auto space-y-3">
                                  {!hasProfile ? (
                                    <button 
                                      onClick={() => setActiveTab('profile')}
                                      className="w-full bg-gradient-to-r from-[#063831] to-[#04241f] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm"
                                    >
                                      Unlock to View
                                    </button>
                                  ) : (
                                    <>
                                      <div className="mb-4">
                                        <p className="text-[10px] text-gray-500 leading-tight mb-2">Type a value below to negotiate, or leave empty to request a demo at the original price.</p>
                                        <input 
                                          type="number"
                                          min={group.budget || 0}
                                          max={group.budget ? Math.floor(group.budget * 1.4) : undefined}
                                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50 text-sm"
                                          placeholder={group.budget ? `e.g. ${group.budget}` : "Your Offer (₹/mo)"}
                                          value={negotiationOffer[group.id] || ''}
                                          onChange={(e) => setNegotiationOffer({...negotiationOffer, [group.id]: e.target.value})}
                                        />
                                        {group.budget && negotiationOffer[group.id] && parseInt(negotiationOffer[group.id]) >= group.budget * 1.3 && parseInt(negotiationOffer[group.id]) <= group.budget * 1.4 && (
                                          <p className="text-xs text-yellow-600 font-medium mt-1">Note: Your offer is quite high compared to the student's budget. They might reject it.</p>
                                        )}
                                      </div>
                                      {isHired ? (
                                        <button disabled className="w-full bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl shadow-none text-sm cursor-not-allowed border border-emerald-200">
                                          Active Student
                                        </button>
                                      ) : (
                                        <div className="flex flex-col gap-2">
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => setSelectedViewUser(group)}
                                              className="w-1/3 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold py-3.5 rounded-xl transition-all text-sm active:scale-[0.98]"
                                            >
                                              View
                                            </button>
                                            {negotiationOffer[group.id] ? (
                                              <button 
                                                onClick={() => {
                                                  if (!!offerApp) {
                                                    toast.error("You already have an active request or offer sent to this group.");
                                                    return;
                                                  }
                                                  handleSendOffer(group);
                                                }}
                                                disabled={offerLoading && !offerApp}
                                                className={`flex-1 font-bold py-3.5 rounded-xl transition-all text-sm ${!!offerApp ? 'bg-gray-200 text-gray-500 shadow-none' : (dailyRequestsCount >= 5 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white shadow-emerald-500/25 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]')}`}
                                              >
                                                {offerLoading && !offerApp ? 'Sending...' : 'Make Offer'}
                                              </button>
                                            ) : (
                                              <button
                                                onClick={() => {
                                                  if (!!offerApp) {
                                                    toast.error("You already have an active request or offer sent to this group.");
                                                    return;
                                                  }
                                                  handleDirectRequestDemo(group);
                                                }}
                                                className={`flex-1 font-bold py-3.5 rounded-xl transition-all text-sm ${!!offerApp ? 'bg-gray-200 text-gray-500 shadow-none' : (dailyRequestsCount >= 5 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white shadow-emerald-500/25 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]')}`}
                                              >
                                                Request Demo
                                              </button>
                                            )}
                                          </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayRequests?.map((neg: any) => (
                      <div key={neg.id} className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-3xl border border-gray-100 shadow-lg shadow-slate-200/50 flex flex-col h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
                            
                            {/* Card Header */}
                            <div className="mb-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">{neg.studentName}</h4>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100/50 uppercase tracking-wider flex-shrink-0">Request</span>
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{neg.category}</p>
                              <div className="space-y-1">
                                {neg.category === 'programming' && neg.technologies && neg.technologies.length > 0 && <p className="text-sm font-semibold text-slate-600"><span className="text-slate-400 font-medium">Tech:</span> {neg.technologies.join(', ')}</p>}
                                {neg.category === 'languages' && neg.languages && neg.languages.length > 0 && <p className="text-sm font-semibold text-slate-600"><span className="text-slate-400 font-medium">Lang:</span> {neg.languages.join(', ')}</p>}
                                {(!neg.category || neg.category === 'school') && neg.subjects && neg.subjects.length > 0 && <p className="text-sm font-semibold text-slate-600"><span className="text-slate-400 font-medium">Subj:</span> {neg.subjects.join(', ')}</p>}
                              </div>
                            </div>

                            <div className="h-px w-full bg-slate-100 my-4"></div>

                            {/* Status Section */}
                            <div className="flex-1 flex flex-col mb-5">
                                {['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(neg.status) && (neg.proposedDate || neg.demoDate) ? (
                                  <div className="w-full bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/50 mb-auto">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Proposed Schedule</p>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Calendar className="w-4 h-4 text-emerald-600" />
                                      <span className="text-sm font-bold text-slate-800">{new Date(neg.demoDate || neg.proposedDate).toLocaleDateString()} at {(neg.demoTime || neg.proposedTime)?.split('||')[0] || (neg.demoTime || neg.proposedTime)}</span>
                                    </div>
                                    {neg.mode === 'online' && (neg.demoTime || neg.proposedTime)?.includes('||') && (
                                      <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-200/50">
                                        <div className="flex items-center gap-1.5 text-xs">
                                          <span className="font-bold text-slate-500">Platform:</span>
                                          <span className="text-slate-800 font-medium">{(neg.demoTime || neg.proposedTime).split('||')[1]}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                          <span className="font-bold text-slate-500">Link:</span>
                                          <a href={(neg.demoTime || neg.proposedTime).split('||')[2]} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline truncate max-w-full">{(neg.demoTime || neg.proposedTime).split('||')[2]}</a>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-auto">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{neg.status === 'demo_pending_payment' ? 'Agreed Price' : 'Current Offer'}</p>
                                    <p className="text-2xl font-black text-emerald-600 tracking-tight">₹{neg.finalPrice || neg.currentOffer}</p>
                                  </div>
                                )}                  
                            </div>
                              
                              {/* Request Specific Status UI (Buttons/Labels) */}
                              <div className="mt-auto space-y-2">
                                {(() => {
                                  const leadId = neg.groupId || neg.studentId;
                                  const lockInfo = data?.globalLocks?.[leadId];
                                  const isLockedByOther = lockInfo && lockInfo.unlockDate > Date.now() && lockInfo.tutorId !== data?.user?.uid;
                                  
                                  if (neg.status !== 'declined' && neg.status !== 'tuition_started' && isLockedByOther) {
                                    const formattedDate = new Date(lockInfo.unlockDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                                    return (
                                      <button 
                                        disabled
                                        className="w-full bg-gray-200 text-gray-500 px-5 py-3.5 rounded-xl font-bold text-sm cursor-not-allowed flex flex-col items-center justify-center gap-1"
                                      >
                                        <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Waitlisted</span>
                                        <span className="text-[10px] font-normal leading-tight px-2 text-center">Another teacher has paid demo fees.<br/>Locked until {formattedDate}</span>
                                      </button>
                                    );
                                  }

                                  return (
                                    <>
                                      {neg.status === 'declined' ? (
                                    <div className="w-full bg-red-50/50 px-4 py-3 rounded-2xl border border-red-100 text-center">
                                      <p className="text-sm font-black text-red-600 uppercase tracking-widest">Declined</p>
                                    </div>
                                ) : neg.status === 'tuition_started' ? (
                                    <div className="w-full bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100 text-center shadow-sm">
                                      <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">Fees Paid</p>
                                    </div>
                                ) : neg.status === 'negotiating' && (
                                  neg.lastUpdatedBy === 'student' ? (
                                    <>
                                       <button 
                                         onClick={() => handleNegotiationAction(neg.id, 'request_demo', neg.currentOffer)}
                                         className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
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
                                        className="w-full bg-white border-2 border-slate-200 hover:border-[#00a992] hover:bg-emerald-50/50 text-slate-700 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                      >
                                        Counter Offer
                                      </button>
                                      <button 
                                        onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                        className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                      >
                                        Decline
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-center mb-2">
                                        <p className="text-sm font-semibold text-slate-500">Waiting for student response...</p>
                                      </div>
                                      <button 
                                        onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                        className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                      >
                                        Withdraw Offer
                                      </button>
                                    </>
                                  )
                                )}

                                {/* Demo Workflow States */}
                                {neg.status === 'demo_requested_by_teacher' && (
                                  <>
                                    <div className="w-full bg-blue-50/50 px-4 py-3 rounded-2xl border border-blue-100 text-center mb-2">
                                      <p className="text-sm font-semibold text-blue-600">Waiting for student to accept...</p>
                                    </div>
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                      className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                      Withdraw Offer
                                    </button>
                                  </>
                                )}
                                {neg.status === 'demo_requested_by_student' && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        const displayNames = neg.studentName || (neg.studentIds?.length > 1 ? 'Group' : 'Student');
                                        setPayingClass({ id: neg.id, studentName: displayNames, finalPrice: 500, studentsList: neg.studentsList || (neg.studentDetails ? [neg.studentDetails] : []) });
                                      }}
                                      className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-black text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" /> Accept & Book Demo
                                    </button>
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                      className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                                {neg.status === 'demo_pending_payment' && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        const displayNames = neg.studentName || (neg.studentIds?.length > 1 ? 'Group' : 'Student');
                                        setPayingClass({ id: neg.id, studentName: displayNames, finalPrice: 500, studentsList: neg.studentsList || (neg.studentDetails ? [neg.studentDetails] : []) });
                                      }}
                                      className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-black text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                      <Lock className="w-4 h-4" /> Pay Fee
                                    </button>
                                  </>
                                )}
                                {neg.status === 'demo_booking_phase' && (
                                  <>
                                    {!neg.proposedDate || neg.lastUpdatedBy === 'student' ? (
                                      <>
                                        {neg.proposedDate && (
                                          <button 
                                            onClick={() => handleNegotiationAction(neg.id, 'accept_demo_date')}
                                            className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                          >
                                            <CheckCircle2 className="w-4 h-4" /> Accept Proposed Date
                                          </button>
                                        )}
                                        <button 
                                          onClick={() => {
                                            setModalConfig({
                                              isOpen: true,
                                              type: 'demo_booking',
                                              title: neg.proposedDate ? 'Counter-Offer Date' : 'Propose Demo Schedule',
                                              description: 'Suggest a date and time for the demo class.',
                                              placeholder: '',
                                              initialValue: '',
                                              initialDate: neg.proposedDate || '',
                                              initialTime: neg.proposedTime?.split('||')[0] || '',
                                              isOnline: neg.mode === 'online',
                                              onSubmit: (val: string, date?: string, time?: string) => {
                                                setModalConfig(prev => ({ ...prev, isOpen: false }));
                                                handleNegotiationAction(neg.id, 'propose_demo_date', 0, { ...neg, proposedDate: date, proposedTime: time });
                                              }
                                            });
                                          }}
                                          className={`w-full px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${neg.proposedDate ? 'bg-white border-2 border-slate-200 hover:border-[#00a992] hover:bg-emerald-50/50 text-slate-700' : 'bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white shadow-md shadow-emerald-500/25 transform hover:scale-[1.02]'}`}
                                        >
                                          <Calendar className="w-4 h-4" /> {neg.proposedDate ? 'Change requested Date/Time' : 'Propose Date & Time'}
                                        </button>
                                      </>
                                    ) : (
                                      <div className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-center mb-2">
                                        <p className="text-sm font-semibold text-slate-500">Waiting for parent to review date...</p>
                                      </div>
                                    )}
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                      className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                      Cancel Demo
                                    </button>
                                  </>
                                )}
                                {neg.status === 'demo_scheduled' && (
                                  <>
                                    <div className="w-full bg-blue-50/50 px-4 py-3 rounded-2xl border border-blue-100 text-center">
                                      <p className="text-sm font-semibold text-blue-600">Demo Scheduled! Prepare for the class.</p>
                                    </div>
                                  </>
                                )}
                                {neg.status === 'waiting_for_parent_decision' && (
                                  <>
                                    <div className="w-full bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 text-center shadow-sm">
                                      <p className="text-sm font-semibold text-orange-600">Waiting for parent to hire...</p>
                                    </div>
                                  </>
                                )}
                                    </>
                                  );
                                })()}
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
              <div className="space-y-12">
                {/* Demo Classes Section */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">Demo Classes</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.demoClasses?.map((cls: any) => {
                      const phone = cls.studentDetails?.phoneNumber || cls.studentDetails?.whatsappNumber || cls.studentDetails?.parentDetails?.phone || cls.studentDetails?.parentDetails?.whatsapp;
                      const email = cls.studentDetails?.email || cls.studentDetails?.parentDetails?.email;
                      return (
                      <li 
                        key={cls.id} 
                        className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-gray-100 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                        
                        <div className="flex flex-col h-full gap-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30 flex-shrink-0">
                                {cls.student?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[150px]">{cls.student}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md border border-blue-100/50 uppercase tracking-wider">Demo Phase</span>
                                </div>
                              </div>
                            </div>
                            
                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm whitespace-nowrap bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border-blue-200/50">
                              {cls.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent my-1" />

                          <div className="grid grid-cols-1 gap-y-4 text-sm flex-grow">
                            {cls.demoDate && cls.demoTime && (
                              <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Demo Schedule</p>
                                  <p className="font-bold text-slate-800">{new Date(cls.demoDate).toLocaleDateString()} at {cls.demoTime}</p>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                            {(() => {
                              const primaryStudent = cls.studentDetails || cls.app?.studentsList?.[0];
                              return primaryStudent ? (
                                <>
                                  {(primaryStudent.phoneNumber || primaryStudent.whatsappNumber || primaryStudent.parentDetails?.phone || primaryStudent.parentDetails?.whatsapp) && (
                                    <a href={`tel:${primaryStudent.phoneNumber || primaryStudent.whatsappNumber || primaryStudent.parentDetails?.phone || primaryStudent.parentDetails?.whatsapp}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"><Phone className="w-3.5 h-3.5" /></div>
                                      <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                        <p className="font-semibold text-slate-700 text-xs truncate">{primaryStudent.phoneNumber || primaryStudent.whatsappNumber || primaryStudent.parentDetails?.phone || primaryStudent.parentDetails?.whatsapp}</p>
                                      </div>
                                    </a>
                                  )}
                                  {(primaryStudent.email || primaryStudent.parentDetails?.email) && (
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"><Mail className="w-3.5 h-3.5" /></div>
                                      <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                        <p className="font-semibold text-slate-700 text-xs truncate" title={primaryStudent.email || primaryStudent.parentDetails?.email}>{primaryStudent.email || primaryStudent.parentDetails?.email}</p>
                                      </div>
                                    </div>
                                  )}
                                  {(primaryStudent.address || primaryStudent.area) && (
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"><MapPin className="w-3.5 h-3.5" /></div>
                                      <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                                        <p className="font-semibold text-slate-700 text-xs truncate">{primaryStudent.address || primaryStudent.area}</p>
                                      </div>
                                    </div>
                                  )}
                                  {primaryStudent.classLevel && (
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"><Target className="w-3.5 h-3.5" /></div>
                                      <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</p>
                                        <p className="font-semibold text-slate-700 text-xs truncate">{primaryStudent.classLevel} {primaryStudent.board && `(${primaryStudent.board})`}</p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : null;
                            })()}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const viewUser = cls.studentDetails || { 
                                    id: cls.id, 
                                    name: cls.student || 'Group', 
                                    students: cls.app?.studentsList || [], 
                                    budget: cls.app?.finalPrice || cls.app?.currentOffer || 0,
                                    preferredMode: cls.app?.preferredMode || 'Online'
                                  };
                                  setSelectedViewUser(viewUser);
                                  setSelectedViewApp(cls);
                                }}
                                className="w-full bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 px-4 py-3 rounded-xl font-bold text-sm transition-all"
                            >
                                View Details
                            </button>
                          </div>
                        </div>
                      </li>
                    );})}
                    {(!data?.demoClasses || data?.demoClasses?.length === 0) && (
                      <li className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active demos</h3>
                        <p className="text-slate-500 text-sm max-w-sm">Pay demo fees in the Requests section to schedule here.</p>
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* Active Students Section */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">Active Students</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.upcomingClasses?.map((cls: any) => (
                      <li 
                        key={cls.id} 
                        onClick={() => {
                          if (cls.studentDetails) {
                            setSelectedViewUser(cls.studentDetails);
                            setSelectedViewApp(cls);
                          } else if (cls.groupDetails) {
                            setSelectedViewUser(cls.groupDetails);
                            setSelectedViewApp(cls);
                          }
                        }}
                        className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-gray-100 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer"
                      >
                        
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                        
                        <div className="flex flex-col h-full gap-5">
                          {/* Header section */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00a992] to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
                                {cls.student?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[150px]">{cls.student}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100/50 uppercase tracking-wider">{cls.subject}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm whitespace-nowrap ${
                              cls.status === 'confirmed' || cls.status === 'tuition_started'
                                ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200/50' 
                                : 'bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-700 border-orange-200/50'
                            }`}>
                              {cls.status === 'confirmed' || cls.status === 'tuition_started' ? 'Active' : cls.status === 'demo_pending_payment' ? 'Payment Pending' : cls.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent my-1" />

                          {/* Details section */}
                          {(() => {
                            const primaryStudent = cls.studentDetails || cls.app?.studentsList?.[0];
                            return ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'confirmed', 'tuition_started', 'accepted'].includes(cls.status) && primaryStudent ? (
                              <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm flex-grow">
                                {(primaryStudent.phoneNumber || primaryStudent.whatsappNumber || primaryStudent.parentDetails?.phone) && (
                                  <a href={`tel:${primaryStudent.phoneNumber || primaryStudent.whatsappNumber || primaryStudent.parentDetails?.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Phone className="w-3.5 h-3.5" /></div>
                                    <div className="overflow-hidden">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                      <p className="font-semibold text-slate-700 text-xs truncate">{primaryStudent.phoneNumber || primaryStudent.whatsappNumber || primaryStudent.parentDetails?.phone}</p>
                                    </div>
                                  </a>
                                )}
                                {(primaryStudent.email || primaryStudent.parentDetails?.email) && (
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Mail className="w-3.5 h-3.5" /></div>
                                    <div className="overflow-hidden">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                      <p className="font-semibold text-slate-700 text-xs truncate" title={primaryStudent.email || primaryStudent.parentDetails?.email}>{primaryStudent.email || primaryStudent.parentDetails?.email}</p>
                                    </div>
                                  </div>
                                )}
                                {(primaryStudent.address || primaryStudent.area) && (
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><MapPin className="w-3.5 h-3.5" /></div>
                                    <div className="overflow-hidden">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                                      <p className="font-semibold text-slate-700 text-xs truncate">{primaryStudent.address || primaryStudent.area}</p>
                                    </div>
                                  </div>
                                )}
                                {primaryStudent.classLevel && (
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Target className="w-3.5 h-3.5" /></div>
                                    <div className="overflow-hidden">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</p>
                                      <p className="font-semibold text-slate-700 text-xs truncate">{primaryStudent.classLevel} {primaryStudent.board && `(${primaryStudent.board})`}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex-grow flex items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-200 border-dashed">
                                <p className="text-sm font-medium text-slate-500 text-center">Contact details will be revealed once the tuition is active.</p>
                              </div>
                            );
                          })()}

                          <div className="mt-4 flex gap-2">
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const viewUser = cls.studentDetails || { 
                                    id: cls.id, 
                                    name: cls.student || 'Group', 
                                    students: cls.app?.studentsList || [], 
                                    budget: cls.app?.finalPrice || cls.app?.currentOffer || 0,
                                    preferredMode: cls.app?.preferredMode || 'Online'
                                  };
                                  setSelectedViewUser(viewUser);
                                  setSelectedViewApp(cls);
                                }}
                                className="w-full bg-white border-2 border-slate-200 hover:border-[#00a992] hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-700 px-4 py-3 rounded-xl font-bold text-sm transition-all"
                            >
                                View Details
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                    {(!data?.upcomingClasses || data?.upcomingClasses?.length === 0) && (
                      <li className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active classes</h3>
                        <p className="text-slate-500 max-w-sm">No students have hired you yet. Send proposals to requests to get started!</p>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: SUBSCRIPTIONS */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-8 pb-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscriptions</h1>
                    <p className="text-slate-500 font-medium mt-1">Upgrade your plan to send more requests and grow your business.</p>
                  </div>
                </div>

                {/* Current Plan Widget */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Current Plan</p>
                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                      Free <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md">Active</span>
                    </h3>
                  </div>
                  <div className="text-right max-w-xs w-full">
                    <p className="text-sm font-bold text-gray-900 mb-2">{dailyRequestsCount || 0} / 5 Requests Used This Week</p>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00a992] rounded-full" style={{ width: `${Math.min(((dailyRequestsCount || 0) / 5) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto mt-8">
                  {/* Free Plan */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Basic</h3>
                    <p className="text-slate-500 font-medium mb-6">Perfect for getting started.</p>
                    <div className="text-4xl font-black text-gray-900 mb-8">
                      Free <span className="text-lg text-slate-400 font-medium tracking-normal">/forever</span>
                    </div>
                    
                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">Up to 5 requests per week</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">Standard profile visibility</span>
                      </li>
                    </ul>
                    
                    <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50" disabled>
                      Current Plan
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-gradient-to-br from-[#063831] to-[#04241f] rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col h-full transform scale-105 border border-emerald-900/50">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Star className="w-32 h-32 text-emerald-300" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-2xl font-black text-white">Pro</h3>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>
                      </div>
                      <p className="text-emerald-100/80 font-medium mb-6">For serious tutors looking to scale.</p>
                      <div className="text-4xl font-black text-white mb-8">
                        ₹499 <span className="text-lg text-emerald-200/50 font-medium tracking-normal">/month</span>
                      </div>
                      
                      <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <span className="text-white font-medium text-lg">Up to 15 requests per week</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <span className="text-white font-medium text-lg">Priority matching algorithm</span>
                        </li>
                      </ul>
                      
                      <button onClick={() => toast("Payments coming soon!", { icon: '🚧' })} className="w-full bg-gradient-to-r from-emerald-400 to-[#00a992] hover:from-emerald-300 hover:to-emerald-400 text-[#04241f] font-black py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 active:scale-95">
                        Upgrade to Pro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REFERRALS */}
            {activeTab === 'referrals' && (
              <div>
                <div className="flex flex-col mb-10">
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Refer & Earn</h2>
                  <p className="text-slate-500 font-medium mt-2">Invite your friends and earn rewards when they join.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                  {/* Glassmorphic Hero Card */}
                  <div className="lg:col-span-2 bg-gradient-to-br from-[#063831] via-[#0a4d44] to-[#04241f] rounded-3xl p-8 sm:p-10 text-white shadow-2xl shadow-teal-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                      <Gift className="w-64 h-64 -rotate-12 translate-x-12 -translate-y-12" />
                    </div>
                    {/* Glowing Orbs */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/30 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 right-10 w-48 h-48 bg-teal-400/20 rounded-full blur-[60px]" />
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="max-w-md mb-8">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-100 text-xs font-bold px-3 py-1.5 rounded-full mb-6 border border-emerald-400/20 backdrop-blur-md">
                          <Gift className="w-3.5 h-3.5" /> REWARD PROGRAM
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight leading-tight">Invite friends.<br/><span className="text-emerald-300">Earn together.</span></h3>
                        <p className="text-emerald-50/80 text-base sm:text-lg font-medium leading-relaxed">
                          Share your unique referral code. Earn 25% of the initial company margin when they book their first class!
                        </p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl inline-flex flex-col sm:flex-row sm:items-center gap-6 justify-between transform transition-all hover:bg-white/15">
                        <div>
                          <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-2">Your Unique Code</p>
                          <span className="text-3xl sm:text-4xl font-black tracking-widest text-white drop-shadow-md">{data?.userData?.referralCode || data?.userData?.referralcode || 'GENERATING...'}</span>
                        </div>
                        <button onClick={() => {
                          navigator.clipboard.writeText(data?.userData?.referralCode || data?.userData?.referralcode || '');
                          toast.success("Code copied to clipboard!");
                        }} className="w-full sm:w-auto bg-white text-[#063831] px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
                          <Copy className="w-4 h-4" /> Copy Code
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-300">
                    <div>
                      <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Wallet Balance</p>
                      <h4 className="text-5xl font-black text-gray-900 mb-4 tracking-tight flex items-baseline gap-1">
                        <span className="text-2xl text-slate-400">₹</span>{data?.userData?.walletBalance || data?.userData?.walletbalance || 0}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                        Use balance to get discounts on your courses, or withdraw directly to your bank account.
                      </p>
                    </div>
                    <button 
                      onClick={() => setWithdrawModal(true)}
                      disabled={(data?.userData?.walletBalance || data?.userData?.walletbalance || 0) < 1000}
                      className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 shadow-lg shadow-gray-900/20 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" /> Withdraw Funds (Min ₹1000)
                    </button>
                  </div>
                </div>

                {/* Referrals List */}
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" /> Your Referrals
                  </h3>
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    {(data?.referrals?.length ?? 0) > 0 ? (
                      <ul className="divide-y divide-slate-100">
                        {data?.referrals?.map((ref: any) => (
                          <li key={ref.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-lg shadow-inner">
                                {(ref.referredUserName?.[0] || '?').toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">{ref.referredUserName || 'Unknown User'}</p>
                                <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 capitalize">
                                  {ref.referralType === 'teacher' ? <GraduationCap className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                  {ref.referralType}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                                ref.status === 'rewarded' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {ref.status === 'rewarded' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {ref.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                {ref.status}
                              </span>
                              {ref.estimatedReward > 0 && <p className="text-base font-black text-gray-900">₹{ref.estimatedReward} <span className="text-xs font-bold text-slate-400">Reward</span></p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">No referrals yet</h4>
                        <p className="text-slate-500 font-medium max-w-sm">Share your code above with friends to start earning rewards when they join.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EARNINGS */}
            {activeTab === 'earnings' && (
              <div className="space-y-8 pb-10">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Earnings & Ledger</h1>
                    <p className="text-slate-500 font-medium mt-1">Track your income, demo fees, and payment history.</p>
                  </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Net Revenue */}
                  <div className="bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-4">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Net Revenue</p>
                    <h3 className="text-3xl font-black text-gray-900">₹{data?.earningsData?.netRevenue?.toLocaleString() || '0'}</h3>
                  </div>

                  {/* First Month Gross */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-gray-100 mb-4">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Gross Inflow</p>
                    <h3 className="text-3xl font-black text-gray-900">₹{data?.earningsData?.totalRevenue?.toLocaleString() || '0'}</h3>
                  </div>

                  {/* Demo Fees Paid */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center border border-gray-100 mb-4">
                      <TrendingDown className="w-6 h-6 text-orange-500" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Demo Fees Paid</p>
                    <h3 className="text-3xl font-black text-gray-900">₹{data?.earningsData?.demoFeesPaid?.toLocaleString() || '0'}</h3>
                  </div>

                  {/* Active MRR */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-50/50 text-blue-600 flex items-center justify-center border border-blue-100 mb-4">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Active Monthly (MRR)</p>
                    <h3 className="text-3xl font-black text-gray-900">₹{data?.earningsData?.activeMRR?.toLocaleString() || '0'}</h3>
                  </div>
                </div>

                {/* Ledger & Active Tuitions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Ledger */}
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        Transaction Ledger
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {data?.earningsData?.ledgerEntries?.length > 0 ? (
                        data.earningsData.ledgerEntries.map((entry: any) => (
                          <div key={entry.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${entry.isOutflow ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {entry.isOutflow ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{entry.studentName}</p>
                                <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">{entry.type.replace(/_/g, ' ')} • {new Date(entry.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${entry.isOutflow ? 'text-orange-600' : 'text-emerald-600'}`}>
                                {entry.isOutflow ? '-' : '+'}₹{entry.amount?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500 font-medium text-sm">No transactions found.</div>
                      )}
                    </div>
                  </div>

                  {/* Active Tuitions */}
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 text-lg">Active Tuitions</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {data?.upcomingClasses?.length > 0 ? (
                        data.upcomingClasses.map((cls: any) => (
                          <div key={cls.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{cls.student}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{cls.subject} • ₹{cls.app.finalPrice}/mo</p>
                            </div>
                            <button
                              onClick={() => handleMarkAsPaid(cls.app)}
                              disabled={actionLoading === cls.id}
                              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === cls.id ? 'Marking...' : 'Mark Paid (Manual)'}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500 font-medium text-sm">No active tuitions yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  {!hasProfile && (
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-6 text-orange-800 flex items-center justify-center gap-2 font-medium text-sm text-center">
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
                {data?.userData?.roles?.includes('student') && (
                  <div className="mt-12 pt-8 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-[#00a992] to-teal-600 rounded-3xl p-8 sm:p-10 shadow-xl shadow-teal-900/10 border border-[#00a992]/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Student Portal</h3>
                        <p className="text-emerald-50 font-medium mb-6 max-w-lg">
                          You have a verified Student Profile. Switch to your Student dashboard to find tutors and manage tuition requests.
                        </p>
                        <button
                          onClick={() => {
                            let userString = localStorage.getItem('user');
                            if (userString) {
                              let userObj = JSON.parse(userString);
                              userObj.role = 'student';
                              localStorage.setItem('user', JSON.stringify(userObj));
                            }
                            router.push('/dashboard/student');
                          }}
                          className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:shadow-xl hover:bg-emerald-50 hover:-translate-y-1 active:scale-95 transition-all inline-flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Switch to Student Portal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100 shadow-lg shadow-indigo-900/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div>
                        <h3 className="text-xl font-bold text-indigo-900 mb-2 tracking-tight flex items-center gap-2">
                          <CreditCard className="w-5 h-5" /> Subscription Plan
                        </h3>
                        <p className="text-sm text-indigo-700/80 font-medium max-w-md">
                          You are currently on the <strong className="text-indigo-900">Free</strong> plan. Upgrade to Pro to send up to 15 requests per week and grow your business faster.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('subscriptions');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all whitespace-nowrap"
                      >
                        View Subscriptions
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-red-50">
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-8 border border-red-100 shadow-lg shadow-red-900/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-red-100/50 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-red-700 mb-2 tracking-tight flex items-center gap-2"><Lock className="w-5 h-5" /> Danger Zone</h3>
                      <p className="text-sm text-red-600/80 font-medium mb-6 max-w-lg">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button 
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md shadow-red-600/20 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 text-center pb-8 flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Legal & Policies</p>
                  <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 bg-slate-50/80 backdrop-blur-sm px-8 py-4 rounded-full border border-slate-200/60 shadow-sm w-max max-w-full">
                    <Link href="/legal/privacy-policy" target="_blank" className="text-sm font-bold text-slate-600 hover:text-[#00a992] transition-colors">Privacy Policy</Link>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
                    <Link href="/legal/terms-and-conditions" target="_blank" className="text-sm font-bold text-slate-600 hover:text-[#00a992] transition-colors">Terms & Conditions</Link>
                    <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300"></span>
                    <Link href="/legal/refund-policy" target="_blank" className="text-sm font-bold text-slate-600 hover:text-[#00a992] transition-colors">Refund Policy</Link>
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
              onClick={() => { setSelectedViewUser(null); setSelectedViewApp(null); }}
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
                {/* Contact Information Block */}
                {(!selectedViewApp || !['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted'].includes(selectedViewApp.status)) ? (
                  <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex items-center justify-center">
                    <p className="text-sm font-bold text-orange-600 text-center">Contact details will be revealed once the demo is booked or tuition is active.</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(() => {
                        const contactSource = selectedViewUser.phoneNumber ? selectedViewUser : (selectedViewUser.students?.[0] || selectedViewUser);
                        const phone = contactSource.phoneNumber || contactSource.whatsappNumber || contactSource.parentDetails?.phone || contactSource.parentDetails?.whatsapp || contactSource.phone || contactSource.whatsapp;
                        const email = contactSource.email || contactSource.parentDetails?.email;
                        return (
                          <>
                            {phone && (
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                                <p className="font-bold text-gray-800">{phone}</p>
                              </div>
                            )}
                            {email && (
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                <p className="font-bold text-gray-800 break-all">{email}</p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

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
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                      {selectedViewApp ? (selectedViewApp.status === 'tuition_started' ? 'Amount Received' : 'Amount to be Received') : 'Total Budget'}
                    </p>
                    <p className="text-3xl font-black text-emerald-700">₹{selectedViewApp?.finalPrice || selectedViewApp?.currentOffer || selectedViewUser.budget || 'Negotiable'}<span className="text-base font-bold text-emerald-600/70">/mo</span></p>
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
              const hasNegotiation = data?.applications?.some((app: any) => (app.groupId || app.studentId) === selectedViewUser.id && ['negotiating'].includes(app.status));
              const isPending = data?.applications?.some((app: any) => (app.groupId || app.studentId) === selectedViewUser.id && ['demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
              const isHired = data?.applications?.some((app: any) => (app.groupId || app.studentId) === selectedViewUser.id && ['tuition_started'].includes(app.status));
              const cooldownApp = data?.applications?.find((app: any) => (app.groupId || app.studentId) === selectedViewUser.id && app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000));
              
              if (isHired || isPending || hasNegotiation || cooldownApp || selectedViewApp) {
                let message = 'Currently unavailable for new requests.';
                if (isHired) message = 'This student has already been hired.';
                else if (cooldownApp) message = `Available in ${Math.ceil((cooldownApp.declinedAt + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))} days.`;
                else if (hasNegotiation || isPending || selectedViewApp) message = 'You already have an active request or demo with this student.';
                
                return (
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
                    {message}
                  </div>
                );
              }
              
              return (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500 leading-tight mb-2">Type a value below to negotiate, or leave empty to request a demo at the original price.</p>
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
                      {negotiationOffer[selectedViewUser.id] ? (
                        <button 
                          onClick={() => { handleSendOffer(selectedViewUser); setSelectedViewUser(null); }}
                          disabled={offerLoading}
                          className={`flex-1 font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50 ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 hover:bg-gray-300' : 'bg-[#00a992] hover:bg-[#008f7b] text-white'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> {offerLoading ? 'Sending...' : 'Negotiate'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => { handleDirectRequestDemo(selectedViewUser); setSelectedViewUser(null); }}
                          className={`flex-1 py-3 px-6 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 hover:bg-gray-300 shadow-none' : 'bg-[#00a992] hover:bg-[#008f7b] text-white shadow-[#00a992]/20'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Request Demo
                        </button>
                      )}
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
                  <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <div className="flex flex-col">
                      <span className="text-gray-900">Demo Fee</span>
                      <span className="text-xs font-medium">Consolidated fee for the group</span>
                    </div>
                    <span className="text-gray-900">₹{coursePrice}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                    <div className="flex flex-col">
                      <span className="text-gray-900">GST (18%)</span>
                    </div>
                    <span className="text-gray-900">₹{Math.round(coursePrice * 0.18)}</span>
                  </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-lg font-black text-gray-900">
                <span>Total to Pay</span>
                <span className="text-[#00a992]">
                  ₹{coursePrice + Math.round(coursePrice * 0.18)}
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

      {/* POST PAYMENT POPUP */}
      {postPaymentPopup && (() => {
        const student = postPaymentPopup.studentsList?.[0] || postPaymentPopup.studentDetails || {};
        const isOffline = postPaymentPopup.mode === 'offline';
        const phone = student.phoneNumber || student.whatsappNumber || student.parentDetails?.phone || student.parentDetails?.whatsapp || 'Not provided';
        const address = student.address || student.area || student.city || 'Not provided';
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">Payment Successful!</h3>
              <p className="text-gray-500 mb-8 font-medium relative z-10">You have secured your demo slot. Here are the contact details for <span className="font-bold text-gray-900">{postPaymentPopup.studentName || student.name || 'the student'}</span>.</p>
              
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 relative z-10 text-left space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Parent Phone</p>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" /> {phone}
                  </p>
                </div>
                {isOffline && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Student Location</p>
                    <p className="text-md font-semibold text-gray-900 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" /> {address}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3 relative z-10">
                <button
                  onClick={() => {
                    const neg = data?.allNegotiations?.find((n: any) => n.id === postPaymentPopup.id) || postPaymentPopup;
                    setModalConfig({
                      isOpen: true,
                      type: 'demo_booking',
                      title: 'Propose Demo Schedule',
                      description: 'Suggest a date and time for the demo class.',
                      placeholder: '',
                      initialValue: '',
                      isOnline: neg.mode === 'online',
                      onSubmit: (val: string, date?: string, time?: string) => {
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                        handleNegotiationAction(neg.id, 'propose_demo_date', 0, { ...neg, proposedDate: date, proposedTime: time });
                      }
                    });
                    setActiveRequestViewId(postPaymentPopup.id);
                    setActiveTab('requests');
                    setPostPaymentPopup(null);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" /> Propose Demo Date & Time
                </button>
                <button
                  onClick={() => setPostPaymentPopup(null)}
                  className="w-full py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      </main>
      <WhatsAppButton />
    </div>
  );
}
