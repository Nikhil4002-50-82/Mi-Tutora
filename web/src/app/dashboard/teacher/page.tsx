"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import Image from 'next/image';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { ReferralsList } from '@/components/dashboard/ReferralsList';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DeleteAccountModal } from '@/components/dashboard/DeleteAccountModal';
import { TransactionConfirmModal } from '@/components/dashboard/TransactionConfirmModal';
import { ProfileCompletenessCard } from '@/components/dashboard/ProfileCompletenessCard';
import { EarningsWidget } from '@/components/dashboard/EarningsWidget';
import { StudentViewModal } from '@/components/dashboard/StudentViewModal';
import Link from 'next/link';


import { motion } from 'motion/react';
import { Calendar, CalendarDays, LayoutDashboard, LogOut, User, Users, Gift, Lock, CheckCircle2, AlertTriangle, AlertCircle, MessageCircle, BookOpen, Menu, X, Globe, Star, Bell, Phone, Mail, MapPin, Target, Handshake, ChevronRight, ArrowRight, CreditCard, IndianRupee, TrendingUp, TrendingDown, Copy, Wallet, GraduationCap, Bookmark, Lightbulb, Loader2, FileText, ShieldCheck } from 'lucide-react';
import TeacherForm from '@/components/TeacherForm';
import ActionModal from '@/components/ActionModal';
import MessageModal from '@/components/MessageModal';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { generateReferralCode } from '@/utils/referral';
import { calculateSuitabilityScore, doesClassMatch, isStrictMatch } from '@/utils/matching';
import { toast } from 'sonner';


import { executeDeclineOffer } from '@/hooks/useDashboardActions';
import { useTeacherData } from '@/hooks/useDashboardData';
import { WhatsAppButton } from '@/components/WhatsAppButton';

import { getStudentDemoFee } from '@/utils/pricing';

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
  const [tuitionSubTab, setTuitionSubTab] = useState<'all'|'recommendation'>('all');
  const [isSwitchingTab, setIsSwitchingTab] = useState(false);
  const [subTab, setSubTab] = useState<string>('');
  const [negotiationOffer, setNegotiationOffer] = useState<{ [key: string]: string }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const [activeRequestViewId, setActiveRequestViewId] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'price'|'timing'|'demo_booking', title: string, description: string, placeholder: string, initialValue: string, initialDate?: string, initialTime?: string, min?: number, max?: number, isOnline?: boolean, onSubmit: (val: string, date?: string, time?: string) => void }>({ isOpen: false, type: 'price', title: '', description: '', placeholder: '', initialValue: '', onSubmit: () => {} });
  const [messageModalConfig, setMessageModalConfig] = useState({ isOpen: false, title: '', message: '' });
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [payingClass, setPayingClass] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [postPaymentPopup, setPostPaymentPopup] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionLoadingAppId, setActionLoadingAppId] = useState<string | null>(null);
  const [actionConfirmModal, setActionConfirmModal] = useState<{isOpen: boolean, type: 'accept_demo'|'reject', appId: string, studentName: string, payload?: any} | null>(null);
  const [selectedPaymentHistoryApp, setSelectedPaymentHistoryApp] = useState<any>(null);
  const [gmeetLinks, setGmeetLinks] = useState<{ [key: string]: string }>({});
  const [savingGmeetAppId, setSavingGmeetAppId] = useState<string | null>(null);
  const [hasFetchedLinks, setHasFetchedLinks] = useState(false);
  const [meetingPlatforms, setMeetingPlatforms] = useState<{ [key: string]: 'gmeet' | 'zoom' | 'teams' }>({});
  
  // KYC State
  const [kycStep, setKycStep] = useState<'input' | 'otp' | 'verified'>('input');
  const [aadharInput, setAadharInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [kycRefId, setKycRefId] = useState('');
  const [mockAadhar, setMockAadhar] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  const router = useRouter();

  const { data, error: swrError, isLoading: loading, mutate } = useTeacherData();


  const hasProfile = !!data?.profile?.phone || !!data?.profile?.category || !!data?.profile?.subjects;

  const initialTuitionTabSet = useRef(false);
  useEffect(() => {
    if (data && !loading && !initialTuitionTabSet.current) {
      const profileCompleted = !!data?.profile?.phone || !!data?.profile?.category || !!data?.profile?.subjects;
      setTuitionSubTab(profileCompleted ? 'recommendation' : 'all');
      initialTuitionTabSet.current = true;
    }
  }, [data, loading]);

  useEffect(() => {
    if (data?.applications && data?.profile && !hasFetchedLinks) {
      const fetchLinks = async () => {
        const scheduledOnlineApps = data.applications.filter(
          (app: any) => app.status === 'demo_scheduled' && (app.mode || 'Online').toLowerCase() === 'online'
        );
        
        for (const app of scheduledOnlineApps) {
          try {
            const res = await fetch('/api/get-demo-link-teacher', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                applicationId: app.id,
                tutorDocId: data.profile.id || data.user?.uid
              })
            });
            const resData = await res.json();
            if (res.ok) {
              if (resData.link) setGmeetLinks(prev => ({ ...prev, [app.id]: resData.link }));
              if (resData.platform) setMeetingPlatforms(prev => ({ ...prev, [app.id]: resData.platform }));
            }
          } catch (err) {
            console.error('Failed to fetch link for app:', app.id, err);
          }
        }
        setHasFetchedLinks(true);
      };
      
      fetchLinks();
    }
  }, [data?.applications, data?.profile, hasFetchedLinks]);

  useEffect(() => {
    if (data?.profile?.aadharVerified) {
      setKycStep('verified');
    }
  }, [data?.profile?.aadharVerified]);

  const handleGenerateOTP = async () => {
    if (!aadharInput || aadharInput.replace(/\s+/g, '').length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return;
    }
    setKycLoading(true);
    try {
      const res = await fetch('/api/kyc/generate-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadharNumber: aadharInput })
      });
      const resData = await res.json();
      if (res.ok) {
        setKycRefId(resData.reference_id);
        setMockAadhar(resData._mockAadhar || '');
        setKycStep('otp');
        toast.success(resData.message || 'OTP sent successfully');
      } else {
        toast.error(resData.error || 'Failed to generate OTP');
      }
    } catch (error: any) {
      toast.error('Network error. Try again.');
    } finally {
      setKycLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpInput || otpInput.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }
    setKycLoading(true);
    try {
      const res = await fetch('/api/kyc/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reference_id: kycRefId, 
          otp: otpInput, 
          tutorDocId: data?.profile?.id || data?.user?.uid || '', 
          _mockAadhar: mockAadhar 
        })
      });
      const resData = await res.json();
      if (res.ok) {
        setKycStep('verified');
        toast.success(resData.message || 'Aadhar Verified successfully! +20 Points Boost added.');
        await mutate(); // Refresh dashboard data to reflect points/badge
      } else {
        toast.error(resData.error || 'Invalid OTP');
      }
    } catch (error: any) {
      toast.error('Network error. Try again.');
    } finally {
      setKycLoading(false);
    }
  };

  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const docId = data?.tutorDocId || data?.profile?.id || data?.user?.uid;
    if (activeTab === 'my_reviews' && docId) {
      setReviewsLoading(true);
      fetch(`/api/reviews?tutorDocId=${docId}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.success) setMyReviews(resData.reviews || []);
        })
        .catch(err => console.error('Error fetching reviews:', err))
        .finally(() => setReviewsLoading(false));
    }
  }, [activeTab, data?.tutorDocId, data?.profile?.id, data?.user?.uid]);

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
    if (data && hasProfile && !existingCode && !isGeneratingRef && data.user) {
      const generateCode = async () => {
        setIsGeneratingRef(true);
        try {
          const { db } = await import('@/utils/firebase/client');
          const { doc, updateDoc, collection, query, where, getDocs } = await import('firebase/firestore');
          const baseName = data?.profile?.name || data?.user?.displayName || 'USER';
          
          let uniqueCode = '';
          let isUnique = false;
          let attempts = 0;
          
          while (!isUnique && attempts < 5) {
            const entropy = attempts === 0 ? '' : Math.random().toString(36).substring(2, 5);
            const tempCode = generateReferralCode(baseName, data.user.uid + entropy);
            const q = query(collection(db, 'users'), where('referralCode', '==', tempCode));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
              uniqueCode = tempCode;
              isUnique = true;
            }
            attempts++;
          }
          
          if (!uniqueCode) throw new Error("Could not generate a unique referral code");
          
          mutate({ ...data, userData: { ...data.userData, referralCode: uniqueCode, referralcode: uniqueCode } }, false);
          
          await updateDoc(doc(db, 'users', data.user.uid), { referralCode: uniqueCode });
          
          toast.success("Generated referral code: " + uniqueCode);
          mutate();
        } catch (e: any) {
          toast.error("Failed to generate referral code: " + e.message);
        } finally {
          setIsGeneratingRef(false);
        }
      };
      generateCode();
    }
  }, [data?.userData?.referralCode, data?.userData?.referralcode, data?.user, data?.profile?.name, mutate, data, isGeneratingRef, hasProfile]);

  useEffect(() => {
    if ((data?.teacherCategories?.length ?? 0) > 0 && !subTab) {
      setSubTab(data?.teacherCategories?.[0] || '');
    }
  }, [data?.teacherCategories, subTab]);



  // Removed snapshot listeners, now handled in useTeacherData

  const handleLogout = async () => {
    const { auth } = await import('@/utils/firebase/client');
    await auth.signOut();
    localStorage.removeItem('user');
    sessionStorage.clear();
    toast.success("Logged out successfully!");
    window.location.href = '/login';
  };

  const handleRedeemToken = async () => {
    try {
      const { db, auth } = await import('@/utils/firebase/client');
      const { doc, updateDoc, increment } = await import('firebase/firestore');
      const user = auth.currentUser;
      if (!user) return;
      const tutorRef = doc(db, 'tutors', user.uid);
      await updateDoc(tutorRef, {
        bankedTokens: increment(-1),
        'weeklyQuota.tokensUsed': increment(-1)
      });
      toast.success("Token redeemed! You have 1 extra request this week.");
      mutate();
    } catch(err) {
      toast.error('Failed to redeem token.');
    }
  };

  const handleDismissNotification = async (notifId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      if (data?.user?.uid) {
        await updateDoc(doc(db, 'users', data.user.uid), {
          dismissedNotifications: arrayUnion(notifId)
        });
        mutate();
      }
    } catch (err: any) {
      toast.error('Failed to dismiss notification');
    }
  };
  
  const handleClearAllNotifications = async () => {
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      if (data?.allNotifications?.length && data?.user?.uid) {
        const ids = data.allNotifications.map((n:any) => n.id);
        await updateDoc(doc(db, 'users', data.user.uid), {
          dismissedNotifications: arrayUnion(...ids)
        });
        mutate();
        toast.success('All notifications cleared');
      }
    } catch (err: any) {
      toast.error('Failed to clear notifications');
    }
  };

  const handlePaymentSubmit = async () => {
    setPaymentLoading(true);
    try {
      if (!payingClass?.id || payingClass.id === 'mock-id') {
         toast.success("Payment completed successfully! (Mock)");
         setPostPaymentPopup(payingClass);
         setPayingClass(null);
         setPaymentLoading(false);
         return;
      }

      // 1. Fetch Order from our secure backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: payingClass.id,
          role: 'teacher'
        })
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || 'Failed to create order');

      // 2. Load Razorpay SDK
      const loadRazorpay = () => new Promise(resolve => {
         if ((window as any).Razorpay) return resolve(true);
         const script = document.createElement('script');
         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
         script.onload = () => resolve(true);
         script.onerror = () => resolve(false);
         document.body.appendChild(script);
      });
      
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      // 3. Setup Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock_key',
        amount: order.amount,
        currency: order.currency,
        name: 'MiTutora',
        description: 'Platform/Demo Fee',
        order_id: order.id,
        handler: async function (response: any) {
           // 4. Verify Payment securely on the backend
           const verifyRes = await fetch('/api/verify-payment', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               razorpay_order_id: response.razorpay_order_id || order.id,
               razorpay_payment_id: response.razorpay_payment_id || 'mock_payment_id',
               razorpay_signature: response.razorpay_signature || 'mock_signature',
               applicationId: payingClass.id,
               role: 'teacher'
             })
           });
           
           const verifyData = await verifyRes.json();
           if (!verifyRes.ok) {
              toast.error(verifyData.error || 'Payment verification failed');
           } else {
              // 5. Success! Fetch parent details and show popup
              const { db } = await import('@/utils/firebase/client');
              const { getDoc, doc } = await import('firebase/firestore');
              
              const finalPayingClass = { ...payingClass };
              const studentData = finalPayingClass?.studentsList?.[0] || finalPayingClass?.studentDetails || {};
              
              if (studentData?.parentDocId && !studentData?.parentDetails?.phone) {
                const parentDoc = await getDoc(doc(db, 'parents', studentData.parentDocId));
                if (parentDoc.exists()) {
                   if (finalPayingClass.studentsList) {
                     finalPayingClass.studentsList[0].parentDetails = parentDoc.data();
                   } else if (finalPayingClass.studentDetails) {
                     finalPayingClass.studentDetails.parentDetails = parentDoc.data();
                   }
                }
              }
              
              const appDataSync = payingClass;
              if (appDataSync) {
                const { syncStudentAvailability } = await import('@/utils/studentAvailability');
                await syncStudentAvailability(db, appDataSync.studentDocIds || [appDataSync.studentDocId]).catch(console.error);
              }
              
              toast.success("Payment completed successfully!");
              setPostPaymentPopup(finalPayingClass);
              setPayingClass(null);
              mutate();
           }
        },
        prefill: {
           name: data?.userData?.name || '',
           email: data?.userData?.email || '',
           contact: data?.userData?.phone || ''
        },
        theme: {
           color: '#4F46E5'
        }
      };



      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
         toast.error(response.error.description || 'Payment Failed');
      });
      rzp.open();

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

  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  const currentWeekStart = d.toISOString().split('T')[0];

  const isSubscribedFlags = data?.profile?.subscriptionPlan === 'pro' || data?.profile?.isSubscribed;
  const hasValidExpiry = data?.profile?.subscriptionExpiry ? data?.profile?.subscriptionExpiry > Date.now() : false;
  const isProPlan = isSubscribedFlags && hasValidExpiry;
  const quotaLimit = isProPlan ? 15 : 5;
  const isCurrentWeek = data?.profile?.weeklyQuota?.weekStartDate === currentWeekStart;
  const tokensUsed = isCurrentWeek ? (data?.profile?.weeklyQuota?.tokensUsed || 0) : 0;
  const tokensRemaining = Math.max(0, quotaLimit - tokensUsed);
  const ALL_ACTIVE_STATUSES = ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'];
  const activePendingOffers = data?.applications?.filter((app: any) => app.tutorDocId === data?.userData?.id && ALL_ACTIVE_STATUSES.includes(app.status)).length || 0;

  const buildStudentViewUser = (app: any, fallback: any = {}) => {
    const sourceApp = app?.app || app || {};
    const matchedGroup = data?.allStudents?.find((student: any) => student.id === (sourceApp.groupDocId || sourceApp.studentDocId));
    const students = sourceApp.studentsList?.length
      ? sourceApp.studentsList
      : sourceApp.studentDetails
        ? [sourceApp.studentDetails]
        : matchedGroup?.students || fallback.students || [];
    const primaryStudent = sourceApp.studentDetails || students[0] || matchedGroup || fallback;
    const parentContact = sourceApp.parentDetails || sourceApp.parentContact || primaryStudent.parentDetails || {};

    return {
      ...(matchedGroup || {}),
      ...fallback,
      id: sourceApp.groupDocId || sourceApp.studentDocId || matchedGroup?.id || fallback.id || sourceApp.id,
      name: sourceApp.studentName || matchedGroup?.name || fallback.name || primaryStudent.name || 'Student',
      category: sourceApp.category || matchedGroup?.category || fallback.category || primaryStudent.category,
      students,
      phoneNumber: primaryStudent.phoneNumber || primaryStudent.whatsappNumber || parentContact.phone || parentContact.whatsapp || fallback.phoneNumber || '',
      email: primaryStudent.email || parentContact.email || fallback.email || '',
      parentDetails: parentContact,
      budget: sourceApp.finalPrice || sourceApp.currentOffer || matchedGroup?.budget || fallback.budget || 0,
      preferredMode: primaryStudent.preferredMode || sourceApp.preferredMode || sourceApp.mode || matchedGroup?.preferredMode || fallback.preferredMode || 'Online',
      address: primaryStudent.address || parentContact.address || matchedGroup?.address || fallback.address,
      area: primaryStudent.area || parentContact.area || matchedGroup?.area || fallback.area,
    };
  };

  const handleSendOffer = async (student: any) => {
    const activeStatuses = ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'];
    const studentPendingCount = data?.applications?.filter((app: any) => app.groupDocId === student.id && activeStatuses.includes(app.status)).length || 0;
    if (studentPendingCount >= 5) {
      toast.error("This student already has the maximum number of pending offers.");
      return;
    }
    if (isSubmittingRef.current) return false;
    isSubmittingRef.current = true;
    if (offerLoading) { isSubmittingRef.current = false; return false; }
    const offerPrice = parseInt(negotiationOffer[student.id]);
    if (!offerPrice || offerPrice <= 0) return toast.error("Please enter a valid offer price.");

    if (student.budget && offerPrice < student.budget) {
      setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `Since you cannot decrease the price, the minimum you can offer is Rs. ${student.budget}. Please adjust your offer.` });
      isSubmittingRef.current = false;
      return false;
    }
    if (student.budget && offerPrice > student.budget * 1.4) {
      setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The maximum you can offer is Rs. ${Math.floor(student.budget * 1.4)} (140% of the student's budget). Please adjust your offer.` });
      isSubmittingRef.current = false;
      return false;
    }

    if (!hasProfile) {
      toast.error("Please complete your profile first.");
      setActiveTab('profile');
      return;
    }

    try {
      setOfferLoading(true);
      const { db, auth } = await import('@/utils/firebase/client');
      const { collection, doc, arrayUnion, arrayRemove, runTransaction, serverTimestamp } = await import('firebase/firestore');
      const { generateCustomId } = await import('@/utils/idGenerator');
      
      const response = await fetch('/api/transactions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'teacher',
          userId: data?.user?.uid,
          teacherName: data?.profile?.name,
          studentData: student,
          offerPrice,
          actionType: 'make_offer'
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to make offer");
      }

      const syncIds = student.students ? student.students.map((s:any)=>s.id) : [student.id];
      const { syncStudentAvailability } = await import('@/utils/studentAvailability');
      await syncStudentAvailability(db, syncIds).catch(console.error);
      toast.success("Offer sent successfully!");
      mutate();
      return true;
    } catch (e: any) {
      if (e.message === "WEEKLY_QUOTA_EXCEEDED") {
         toast.error("You have reached your weekly token quota. Upgrade to Pro for more tokens!");
      } else {
         toast.error("Error sending offer: " + e.message);
      }
    } finally {
      isSubmittingRef.current = false;
      setOfferLoading(false);
    }
  };

  const handleDirectRequestDemo = async (student: any) => {
    const activeStatuses = ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'];
    const studentPendingCount = data?.applications?.filter((app: any) => app.groupDocId === student.id && activeStatuses.includes(app.status)).length || 0;
    if (studentPendingCount >= 5) {
      toast.error("This student already has the maximum number of pending offers.");
      return;
    }
    if (isSubmittingRef.current) return false;
    isSubmittingRef.current = true;
    if (offerLoading) { isSubmittingRef.current = false; return false; }
    if (!hasProfile) {
      toast.error("Please complete your profile first.");
      setActiveTab('profile');
      isSubmittingRef.current = false;
      return false;
    }

    try {
      setOfferLoading(true);
      const { db, auth } = await import('@/utils/firebase/client');
      const { collection, doc, arrayUnion, arrayRemove, runTransaction, serverTimestamp } = await import('firebase/firestore');
      const { generateCustomId } = await import('@/utils/idGenerator');
      const user = auth.currentUser;

      const offerPrice = student.budget || 500;

      const response = await fetch('/api/transactions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'teacher',
          userId: data?.user?.uid,
          teacherName: data?.profile?.name,
          studentData: student,
          offerPrice
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to make offer");
      }

      const syncIds = student.students ? student.students.map((s:any)=>s.id) : [student.id];
      const { syncStudentAvailability } = await import('@/utils/studentAvailability');
      await syncStudentAvailability(db, syncIds).catch(console.error);
      toast.success("Demo requested successfully!");
      mutate();
      return true;
    } catch (e: any) {
      if (e.message === "WEEKLY_QUOTA_EXCEEDED") {
         toast.error("You have reached your weekly token quota. Upgrade to Pro for more tokens!");
      } else {
         toast.error("Error requesting demo: " + e.message);
      }
    } finally {
      isSubmittingRef.current = false;
      setOfferLoading(false);
    }
  };
  const handleNegotiationAction = async (appId: string, action: string, newOffer?: number, neg?: any, date?: string, time?: string) => {
    if (isSubmittingRef.current) return false;
    isSubmittingRef.current = true;
    setActionLoadingAppId(appId);
    
    if (action === 'decline') {
      try {
        await executeDeclineOffer(appId, 'teacher', data);
        toast.success("Offer declined.");
        mutate();
        return true;
      } catch (err: any) {
        toast.error("Failed to decline: " + err.message);
        return false;
      } finally {
        isSubmittingRef.current = false;
        setActionLoadingAppId(null);
      }
    }
    if (action === 'counter_price' && newOffer && neg) {
      const minAllowed = neg.absoluteMin || (neg.initialBudget || 0);
      const maxAllowed = neg.absoluteMax || Math.floor((neg.initialBudget || 0) * 1.4);
      if (newOffer < minAllowed) {
        setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The absolute minimum you can offer is Rs. ${minAllowed}. Please adjust your offer.` });
        isSubmittingRef.current = false;
        setActionLoadingAppId(null);
        return false;
      }
      if (newOffer > maxAllowed) {
        setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The absolute maximum you can offer is Rs. ${maxAllowed}. Please adjust your offer.` });
        isSubmittingRef.current = false;
        setActionLoadingAppId(null);
        return false;
      }
    }
    
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, arrayRemove, runTransaction, serverTimestamp } = await import('firebase/firestore');
      
      await runTransaction(db, async (transaction) => {
        const appRef = doc(db, 'applications', appId);
        const appSnap = await transaction.get(appRef);
        
        if (!appSnap.exists()) {
          throw new Error("Application not found.");
        }
        
        const appData = appSnap.data();
        
        if (appData.status === 'declined') {
          throw new Error("This request has already been declined or canceled by the other party.");
        }
        if (action === 'accept_price' && appData.lastUpdatedBy === 'tutor') {
           throw new Error("This offer has already been accepted or modified.");
        }
        
        const updateData: any = {};
        let isFinalState = false;
        
        if (action === 'accept_price' || action === 'request_demo') {
          updateData.status = 'demo_requested_by_teacher';
          if (newOffer) updateData.finalPrice = newOffer;
          updateData.lastUpdatedBy = 'teacher';
        } else if (action === 'accept_demo') {
          updateData.status = 'demo_pending_payment';
          updateData.lastUpdatedBy = 'teacher';
        } else if (action === 'propose_demo_date') {
          updateData.proposedDate = neg?.proposedDate;
          updateData.proposedTime = neg?.proposedTime;
          updateData.lastUpdatedBy = 'teacher';
        } else if (action === 'accept_demo_date') {
          updateData.status = 'demo_scheduled';
          updateData.demoDate = neg?.proposedDate || appData.proposedDate;
          updateData.demoTime = neg?.proposedTime || appData.proposedTime;
          updateData.lastUpdatedBy = 'teacher';
        } else if (action === 'demo_finished') {
          updateData.status = 'waiting_for_parent_decision';
          updateData.lastUpdatedBy = 'teacher';
        } else if (action === 'counter_price') {
          updateData.currentOffer = newOffer;
          updateData.lastUpdatedBy = 'teacher';
        }
        updateData.updatedAt = serverTimestamp();
        
        transaction.update(appRef, updateData);
        
        // Removed legacy arrayRemove for pendingRequests
      });
      
      const appDataSync = data?.applications?.find((a: any) => a.id === appId);
      if (appDataSync) {
        const { syncStudentAvailability } = await import('@/utils/studentAvailability');
        await syncStudentAvailability(db, appDataSync.studentDocIds || [appDataSync.studentDocId]).catch(console.error);
      }
      let successMessage = "Action completed successfully!";
      if (action === 'decline') successMessage = "Offer declined.";
      else if (action === 'request_demo' || action === 'accept_price') successMessage = "Deal accepted successfully!";
      else if (action === 'accept_demo') successMessage = "Demo accepted successfully!";
      else if (action === 'counter_price') successMessage = "Counter offer sent successfully!";
      else if (action === 'propose_demo_date') successMessage = "Demo date proposed successfully!";
      else if (action === 'accept_demo_date') successMessage = "Demo date accepted successfully!";
      toast.success(successMessage);
      mutate();
    } catch (e: any) {
      toast.error("Error: " + e.message);
      return false;
    } finally {
      isSubmittingRef.current = false;
      setActionLoadingAppId(null);
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

  const handleUpgradeToPro = async () => {
    setUpgradeModalOpen(false);
    const loadingToast = toast.loading("Initiating secure checkout...");
    try {
      // 1. Create Subscription Order
      const res = await fetch('/api/create-subscription-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data?.user?.uid })
      });
      
      const order = await res.json();
      
      if (!res.ok) {
        throw new Error(order.error || 'Failed to create order');
      }

      toast.dismiss(loadingToast);

      // 2. Load Razorpay SDK
      const loadRazorpay = () => new Promise(resolve => {
         if ((window as any).Razorpay) return resolve(true);
         const script = document.createElement('script');
         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
         script.onload = () => resolve(true);
         script.onerror = () => resolve(false);
         document.body.appendChild(script);
      });
      
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      // 3. Setup options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'mock_key',
        amount: order.amount,
        currency: order.currency,
        name: 'Mushi Education',
        description: 'Pro Subscription Upgrade (1 Month)',
        order_id: order.id,
        handler: async function (response: any) {
           const verifyToast = toast.loading("Verifying payment...");
           try {
               const verifyRes = await fetch('/api/verify-subscription-payment', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({
                       razorpay_order_id: response.razorpay_order_id || order.id,
                       razorpay_payment_id: response.razorpay_payment_id || 'mock_payment_id',
                       razorpay_signature: response.razorpay_signature || 'mock_signature',
                       userId: data?.user?.uid
                   })
               });
               
               const verifyData = await verifyRes.json();
               if (verifyData.success) {
                   toast.success("Successfully upgraded to Pro! You now have 15 tokens per week.");
                   mutate();
               } else {
                   throw new Error(verifyData.error || 'Verification failed');
               }
           } catch (err: any) {
               toast.error("Payment verification failed: " + err.message);
           } finally {
               toast.dismiss(verifyToast);
           }
        },
        prefill: {
            name: data?.user?.displayName || 'Teacher',
            email: data?.user?.email || '',
        },
        theme: {
            color: '#00a992'
        }
      };



      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
          toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (e: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to upgrade: " + e.message);
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
  const allStudentsWithScores = (data?.allStudents || []).filter((group: any) => group.parentDocId !== data?.userData?.id).map((studentGroup: any) => {
    const getDetail = (obj: any, field: string) => obj[field] || (obj.students && obj.students[0] ? obj.students[0][field] : '') || '';
    const studentBudget = parseFloat(studentGroup.budget || studentGroup.totalBudget || studentGroup.combinedBudget || getDetail(studentGroup, 'budget') || 0);
    const teacherFee = parseFloat((activeTeacher as any)?.feeRange || (activeTeacher as any)?.minFee || 0);
    const strictMatch = isStrictMatch(studentGroup, activeTeacher);
    return {
      ...studentGroup,
      strictMatch,
      suitabilityScore: strictMatch ? calculateSuitabilityScore(studentGroup, activeTeacher) : 0,
      budgetDifference: Math.abs(studentBudget - teacherFee)
    };
  }).sort((a: any, b: any) => {
      const getStatus = (studentId: string) => {
          const app = data?.applications?.find((app: any) => app.studentDocId === studentId || app.groupDocId === studentId);
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
      if (studentGroup.suitabilityScore <= 0 || !studentGroup.strictMatch) return false;
      return true;
  });

  const handleSaveMeetingLink = async (appId: string) => {
    const link = gmeetLinks[appId];
    const platform = meetingPlatforms[appId] || 'gmeet';
    
    if (!link) {
      toast.error('Please enter a meeting link.');
      return;
    }

    setSavingGmeetAppId(appId);
    try {
      const res = await fetch('/api/save-demo-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          tutorDocId: data?.profile?.id || data?.user?.uid,
          gmeetLink: link,
          platform
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save link');
      
      toast.success('Meeting link saved securely!');
      // Do not clear the input! We want the teacher to see the link they just saved.
    } catch (err: any) {
      toast.error(err.message || 'Failed to save link');
    } finally {
      setSavingGmeetAppId(null);
    }
  };



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

      <DashboardSidebar 
        role="teacher"
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setActiveRequestViewId={setActiveRequestViewId}
        hasProfile={hasProfile}
        navItems={navItems}
        userName={data?.profile?.name || data?.user?.displayName || ''}
      />

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
        <DashboardHeader 
          role="teacher"
          data={data}
          setActiveTab={setActiveTab}
          setActiveRequestViewId={setActiveRequestViewId}
          handleLogout={handleLogout}
          handleDismissNotification={handleDismissNotification}
          notificationsRef={notificationsRef}
          profileRef={profileRef}
          isNotificationsDropdownOpen={isNotificationsDropdownOpen}
          setIsNotificationsDropdownOpen={setIsNotificationsDropdownOpen}
          isProfileDropdownOpen={isProfileDropdownOpen}
          setIsProfileDropdownOpen={setIsProfileDropdownOpen}
        />

        <ActionModal {...modalConfig} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
        <MessageModal {...messageModalConfig} onClose={() => setMessageModalConfig(prev => ({ ...prev, isOpen: false }))} />
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-10 md:px-8 md:pt-6 lg:px-12 lg:pt-8 w-full flex-1">
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
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center gap-3 mb-2 flex-wrap">
                        Hello {data?.profile?.name?.split(' ')[0] || data?.user?.displayName?.split(' ')[0] || 'Teacher'}! 
                        {data?.profile?.aadharVerified && (
                          <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-emerald-500 drop-shadow-sm flex-shrink-0" />
                        )}
                        <span className="text-4xl md:text-5xl animate-bounce origin-bottom-right">👋</span>
                      </h1>
                      <p className="text-slate-500 text-lg md:text-xl leading-relaxed">Nice to have you back! Get ready to continue your teaching journey.</p>
                    </div>

                    <div className="lg:col-span-6 xl:col-span-5 flex flex-col sm:flex-row gap-4 justify-end">
                      {/* Earnings Mini Widget */}
                      <EarningsWidget 
                        netRevenue={data?.earningsData?.netRevenue || 0}
                        activeMRR={data?.earningsData?.activeMRR || 0}
                        onClick={() => setActiveTab('earnings')}
                      />

                      <div
                        onClick={() => setActiveTab('subscriptions')}
                        className="flex-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-gray-900 tracking-tight">Weekly Tokens</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm tracking-tight mb-2">Used: {tokensUsed} / {quotaLimit}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-emerald-50 rounded-full overflow-hidden">
                              <div className="h-full bg-[#00a992] rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((tokensUsed / quotaLimit) * 100, 100)}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-900">{tokensRemaining} left</span>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-slate-500">{isProPlan ? 'Pro Plan' : 'Basic Plan'}</span>
                            {!isProPlan && <span className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700">Upgrade</span>}
                          </div>
                        </div>
                      </div>

                      {/* Profile Completeness Card */}
                      <ProfileCompletenessCard 
                        completeness={profileCompleteness}
                        onClick={() => setActiveTab('profile')}
                      />
                    </div>
                  </div>

                  {/* Split Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
                      {/* My Students */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-end px-2">
                          <h2 className="text-xl font-bold text-gray-900 tracking-tight">My Students</h2>
                          <button onClick={() => setActiveTab('my_students')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">View All</button>
                        </div>
                        
                        {myActiveStudents.length === 0 ? (
                          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[250px]">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
                              <Users className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">No students chosen yet</h3>
                            <p className="text-slate-500 max-w-sm mb-6 font-medium text-sm">Explore our catalog of students and find the perfect match to start your teaching journey.</p>
                            <button 
                              onClick={() => setActiveTab('new_tuition')}
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 px-6 py-2.5 rounded-full font-bold transition-all text-sm"
                            >
                              Explore Students
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                            {myActiveStudents.slice(0, 3).map((cls: any, idx: number) => (
                              <div key={cls.id}>
                                <div className="flex items-center justify-between group py-2">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                                      <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-gray-900 text-base">{cls.student}</h4>
                                      <p className="text-sm text-slate-500">{cls.subject}</p>
                                    </div>
                                  </div>
                                  <button onClick={() => { if(cls.studentDetails) setSelectedViewUser(cls.studentDetails); else setActiveTab('my_students'); }} className="text-emerald-700 font-bold text-sm bg-emerald-50/50 border border-emerald-100 px-6 py-2 rounded-full hover:bg-emerald-100 transition-colors">
                                    View
                                  </button>
                                </div>
                                {idx < Math.min(myActiveStudents.length, 3) - 1 && <div className="h-px bg-gray-50 my-2"></div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight px-2">Quick Actions</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { id: 'new_tuition', icon: GraduationCap, title: 'Add New Tuition', desc: 'Create a new tuition session', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { id: 'requests', icon: FileText, title: 'View Requests', desc: 'Check new requests', color: 'text-blue-500', bg: 'bg-blue-50' },
                            { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'View all recent updates', color: 'text-orange-500', bg: 'bg-orange-50' },
                            { id: 'earnings', icon: TrendingUp, title: 'My Earnings', desc: 'Track your earnings', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                          ].map(action => {
                             const Icon = action.icon;
                             return (
                               <div key={action.id} onClick={() => setActiveTab(action.id)} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-6 group">
                                  <div className={`w-10 h-10 ${action.bg} ${action.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{action.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">{action.desc}</p>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                               </div>
                             );
                          })}
                        </div>
                      </div>

                      {/* Motivation Banner */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/60 rounded-3xl p-6 flex items-center justify-between shadow-sm">
                         <div className="flex items-center gap-6">
                           <div className="w-16 h-16 relative flex-shrink-0 hidden sm:block">
                             <div className="absolute inset-0 bg-emerald-200 rounded-full animate-pulse blur-xl opacity-50"></div>
                             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-sm relative z-10 text-2xl">
                               🏆
                             </div>
                           </div>
                           <div>
                             <h3 className="text-lg font-black text-emerald-900 mb-1">Great work, {data?.profile?.name?.split(' ')[0] || data?.user?.displayName?.split(' ')[0] || 'Teacher'}! 🎉</h3>
                             <p className="text-sm font-medium text-emerald-700 max-w-md">You're doing amazing! Keep up the excellent teaching and inspiring your students.</p>
                           </div>
                         </div>
                         <div className="hidden md:flex w-12 h-12 bg-emerald-600 rounded-full text-white items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer flex-shrink-0" onClick={() => setActiveTab('my_students')}>
                           <Star className="w-6 h-6" />
                         </div>
                      </div>
                    </div>

                    {/* Right Column: Recommended Students */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                      <div className="flex justify-between items-end px-2">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recommended Students</h2>
                        <button onClick={() => { setActiveTab('new_tuition'); setTuitionSubTab('recommendation'); }} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">View All</button>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        {computedRecommendedStudents.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-slate-500 text-sm font-medium">No recommendations yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {computedRecommendedStudents.filter((student: any) => {
                              const lockedApp = data?.applications?.find((app: any) => (app.groupDocId || app.studentDocId) === student.id && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                              return !lockedApp;
                            }).slice(0, 4).map((student: any, index: number) => {
                              const offerApp = data?.applications?.find((app: any) => (app.groupDocId || app.studentDocId) === student.id && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                              
                              const isLocked = !!offerApp;
                              const isRed = false; 
                              const isDemoPhase = offerApp && ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(offerApp.status);
                              const labelText = isDemoPhase ? 'Demo Phase' : (['tutor', 'teacher'].includes(offerApp?.lastUpdatedBy) ? 'Offer Sent' : 'Offer Received');

                              return (
                                <div key={student.id} className="flex items-center gap-4 relative group">
                                  {isLocked && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex items-center justify-end pr-4 rounded-xl pointer-events-none">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${isRed ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {labelText}
                                        </span>
                                    </div>
                                  )}
                                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center font-bold text-orange-500 text-xs flex-shrink-0">
                                    #{index + 1}
                                  </div>
                                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-emerald-600 text-sm flex-shrink-0">
                                    {student.name?.charAt(0) || 'S'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate tracking-tight">{student.name || 'Student'}</h4>
                                    <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">{student.subjects ? student.subjects.join(', ') : student.category}</p>
                                  </div>
                                  <button onClick={() => setSelectedViewUser(student)} className="text-emerald-700 font-bold text-xs bg-emerald-50/50 border border-emerald-100 px-4 py-2 rounded-full hover:bg-emerald-100 z-0 flex-shrink-0 transition-colors">
                                    View
                                  </button>
                                </div>
                              );
                            })}
                            <div className="pt-4 mt-2 border-t border-gray-50 flex justify-between items-center">
                              <span className="text-xs text-slate-500 font-medium">Find more great students</span>
                              <button onClick={() => { setActiveTab('new_tuition'); setTuitionSubTab('recommendation'); }} className="text-slate-400 hover:text-emerald-600 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
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
                    <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
                      {tuitionSubTab === 'all' ? 'All Students' : 'Recommended Students'}
                    </h2>
                    <p className="text-slate-500 mt-1">Find great students who are ready to learn with you.</p>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-full shadow-inner w-full sm:w-auto overflow-x-auto border border-gray-200">
                    <button 
                      onClick={() => {
                        if (tuitionSubTab === 'all') return;
                        setIsSwitchingTab(true);
                        setTuitionSubTab('all');
                        setTimeout(() => setIsSwitchingTab(false), 1200);
                      }} 
                      className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-full transition-all whitespace-nowrap ${tuitionSubTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => {
                        if (tuitionSubTab === 'recommendation') return;
                        setIsSwitchingTab(true);
                        setTuitionSubTab('recommendation');
                        setTimeout(() => setIsSwitchingTab(false), 1200);
                      }} 
                      className={`flex-1 sm:flex-none px-6 py-2 text-sm font-bold rounded-full transition-all whitespace-nowrap ${tuitionSubTab === 'recommendation' ? 'bg-white text-[#00a992] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Recommendation
                    </button>
                  </div>
                </div>

                {isSwitchingTab ? (
                  <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-300">
                    <Loader2 className="w-12 h-12 text-[#00a992] animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Finding the perfect match...</h3>
                    <p className="text-sm text-gray-500 mt-1">Loading {tuitionSubTab === 'all' ? 'all' : 'recommended'} students for you.</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500">
                {tuitionSubTab === 'recommendation' ? (
                  <div className="mb-8 bg-emerald-50 rounded-2xl p-3 sm:p-4 flex items-center justify-between relative overflow-hidden border border-emerald-100 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-4 z-10">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#00a992] shadow-sm flex-shrink-0">
                         <Lightbulb className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">Smart Recommendations</h4>
                        <p className="text-xs text-gray-600 mt-0.5">These students match your teaching preferences and subject expertise.</p>
                      </div>
                    </div>
                    <div className="hidden sm:block z-10 mr-6">
                       <Image src="/book.png" alt="Books" width={256} height={256} className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-500 drop-shadow-md" />
                    </div>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-[#00a992] rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="mb-8 bg-blue-50 rounded-2xl p-3 sm:p-4 flex items-center justify-between relative overflow-hidden border border-blue-100 shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-4 z-10">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                         <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">Explore All Students</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Browse through our complete list of students looking for a tutor.</p>
                      </div>
                    </div>
                    <div className="hidden sm:block z-10 mr-6">
                       <Image src="/book.png" alt="Books" width={256} height={256} className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-500 drop-shadow-md" />
                    </div>
                    <div className="absolute right-0 top-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                  </div>
                )}

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
                              const app = data?.applications?.find((app: any) => (app.groupDocId || app.studentDocId) === groupId);
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

                          const lockedApp = data?.applications?.find((app: any) => (app.groupDocId || app.studentDocId) === group.id && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                          const offerApp = data?.applications?.find((app: any) => (app.groupDocId || app.studentDocId) === group.id && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                          
                          const isPending = data?.applications?.some((app: any) => (app.groupDocId || app.studentDocId) === group.id && ['demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
                          const isHired = data?.applications?.some((app: any) => (app.groupDocId || app.studentDocId) === group.id && ['tuition_started'].includes(app.status));
                          
                          const lockInfo = data?.globalLocks?.[group.id];
                          const isGloballyLocked = lockInfo && lockInfo.unlockDate > Date.now() && lockInfo.tutorDocId !== data?.user?.uid;
                          const isDemoPhase = offerApp && ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(offerApp.status);
                          
                          const isLocked = !!lockedApp || isGloballyLocked;
                          
                          let labelText = '';
                          let isRed = false;
                          
                          if (isGloballyLocked) {
                            isRed = true;
                            labelText = 'Busy with another demo';
                          } else if (lockedApp) {
                            isRed = true;
                            labelText = lockedApp.declinedAt ? `LOCKED (${Math.max(1, Math.ceil((lockedApp.declinedAt + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)))} DAYS)` : 'LOCKED';
                          } else if (isDemoPhase) {
                            labelText = 'Demo in Progress';
                          } else if (['tutor', 'teacher'].includes(offerApp?.lastUpdatedBy)) {
                            labelText = 'Offer Sent';
                          } else if (offerApp) {
                            labelText = 'Offer Received';
                          }

                          return (
                            <div key={group.id} className="bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col h-full overflow-hidden relative group">
                              {/* Header */}
                              <div className="bg-[#00a992] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                                  {group.rank && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md flex-shrink-0 ${group.rank === 1 ? 'bg-yellow-400 text-yellow-900' : group.rank === 2 ? 'bg-gray-200 text-gray-800' : group.rank === 3 ? 'bg-orange-500 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                                      #{group.rank}
                                    </div>
                                  )}
                                  <h3 className="text-lg font-bold text-white tracking-tight truncate">{parentName}</h3>
                                </div>
                                {labelText ? (
                                  <span className={`px-3 py-1 text-[10px] font-black rounded-full border shadow-sm uppercase tracking-wider whitespace-nowrap flex-shrink-0 ${isRed ? 'bg-white/95 text-red-600 border-red-100' : 'bg-white/95 text-teal-700 border-teal-100'}`}>
                                    {labelText}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 border border-white/40 text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex-shrink-0">
                                    {group.category || 'School'}
                                  </span>
                                )}
                              </div>
                              
                              <div className="p-5 flex flex-col flex-grow">
                                {/* Group Name */}
                                <div className="flex items-center gap-2 mb-4 text-gray-900">
                                  <Users className="w-5 h-5 text-[#00a992]" />
                                  <h4 className="font-bold text-base">Group: {group.name || 'Student'}</h4>
                                </div>
                                
                                {/* Details Box */}
                                <div className="bg-emerald-50/50 rounded-2xl p-4 space-y-3 mb-6">
                                  <div className="flex items-center gap-2 text-sm">
                                    <LayoutDashboard className="w-4 h-4 text-[#00a992]" />
                                    <span className="text-slate-600 font-bold">Class:</span>
                                    <span className="text-slate-500">{firstStudent.classLevel || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <BookOpen className="w-4 h-4 text-[#00a992]" />
                                    <span className="text-slate-600 font-bold">Sub:</span>
                                    <span className="text-slate-500 truncate">{firstStudent.subjects?.[0] || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Wallet className="w-4 h-4 text-[#00a992]" />
                                    <span className="text-slate-600 font-bold">Budget:</span>
                                    <span className="text-[#00a992] font-bold">₹{group.budget}/mo</span>
                                  </div>
                                </div>
                                
                                {/* Actions Area */}
                                <div className="mt-auto">
                                  {!hasProfile ? (
                                    <button 
                                      onClick={() => setActiveTab('profile')}
                                      className="w-full bg-[#00a992] text-white font-bold py-3.5 rounded-full transition-all shadow-md hover:bg-[#00927d] text-sm"
                                    >
                                      Unlock to View
                                    </button>
                                  ) : (
                                    <>
                                      <div className="mb-4">
                                        <p className="text-[10px] text-gray-500 leading-tight mb-3">Type a value below to negotiate, or leave empty to request a demo at the original price.</p>
                                        <input 
                                          type="number"
                                          min={group.budget || 0}
                                          max={group.budget ? Math.floor(group.budget * 1.4) : undefined}
                                          className="w-full px-4 py-2.5 border border-gray-200 rounded-full text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                          placeholder={group.budget ? `e.g. ${group.budget}` : "Your Offer (₹/mo)"}
                                          value={negotiationOffer[group.id] || ''}
                                          onChange={(e) => setNegotiationOffer({...negotiationOffer, [group.id]: e.target.value})}
                                        />
                                        {group.budget && negotiationOffer[group.id] && parseInt(negotiationOffer[group.id]) >= group.budget * 1.3 && parseInt(negotiationOffer[group.id]) <= group.budget * 1.4 && (
                                          <p className="text-xs text-yellow-600 font-medium mt-1">Note: Your offer is quite high compared to the student's budget. They might reject it.</p>
                                        )}
                                      </div>
                                      
                                      {isHired ? (
                                        <button disabled className="w-full bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-full shadow-none text-sm cursor-not-allowed border border-emerald-200">
                                          Active Student
                                        </button>
                                      ) : (
                                        <div className="flex gap-2 mb-4">
                                          <button 
                                            onClick={() => setSelectedViewUser(group)}
                                            className="flex-1 py-2.5 text-[#00a992] font-bold text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-all active:scale-95"
                                          >
                                            View
                                          </button>
                                          {negotiationOffer[group.id] ? (
                                            <button 
                                              onClick={() => {
                                                if (tokensUsed >= quotaLimit) {
                                                  toast.error("You have reached your weekly token quota. Upgrade to Pro for more tokens!");
                                                  setActiveTab('subscriptions');
                                                  return;
                                                }
                                                if (!!offerApp) {
                                                  toast.error("You already have an active request or offer sent to this group.");
                                                  return;
                                                }
                                                handleSendOffer(group);
                                              }}
                                              disabled={(offerLoading && !offerApp) || isLocked}
                                              className={`flex-[2] py-2.5 font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-all ${!!offerApp || isLocked ? 'bg-gray-200 text-gray-500 shadow-none cursor-not-allowed' : (tokensUsed >= quotaLimit ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#00a992] text-white hover:bg-[#00927d] active:scale-95')}`}
                                            >
                                              {isLocked ? 'Locked' : (offerLoading && !offerApp ? 'Sending...' : 'Make Offer')} <ArrowRight className="w-4 h-4" />
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => {
                                                if (tokensUsed >= quotaLimit) {
                                                  toast.error("You have reached your weekly token quota. Upgrade to Pro for more tokens!");
                                                  setActiveTab('subscriptions');
                                                  return;
                                                }
                                                if (!!offerApp) {
                                                  toast.error("You already have an active request or offer sent to this group.");
                                                  return;
                                                }
                                                handleDirectRequestDemo(group);
                                              }}
                                              disabled={!!offerApp || isLocked}
                                              className={`flex-[2] py-2.5 font-bold text-sm rounded-full flex items-center justify-center gap-2 transition-all ${!!offerApp || isLocked ? 'bg-gray-200 text-gray-500 shadow-none cursor-not-allowed' : (tokensUsed >= quotaLimit ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#00a992] text-white hover:bg-[#00927d] active:scale-95')}`}
                                            >
                                              {isLocked ? 'Locked' : 'Request Demo'} <ArrowRight className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                      <button className="w-full text-center text-sm font-bold text-emerald-700 flex items-center justify-center gap-2 hover:text-emerald-800 transition-colors">
                                        <Bookmark className="w-4 h-4" /> Save for later
                                      </button>
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
                </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">All Notifications</h2>
                  {((data?.allNotifications)?.length ?? 0) > 0 && (
                    <button onClick={handleClearAllNotifications} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-xl text-sm transition-colors self-start sm:self-auto">
                      Clear All
                    </button>
                  )}
                </div>
                {((data?.allNotifications)?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {data?.allNotifications?.map((neg: any) => {
                      return (
                        <div key={neg.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                          <div className="flex-1 cursor-pointer" onClick={() => { setActiveRequestViewId(neg.id); setActiveTab('requests'); }}>
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
                          <div className="flex items-center gap-3">
                            <button onClick={(e) => handleDismissNotification(neg.id, e)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors" title="Dismiss">
                              <X className="w-5 h-5" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
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
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">{neg.studentName}</h4>
                                  {neg.applicationId && <p className="text-xs text-slate-500 font-mono font-bold mt-1 uppercase tracking-wider">ID: {neg.applicationId}</p>}
                                </div>
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
                                    </div>
                                ) : (
                                  <div className="text-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-auto">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{neg.status === 'demo_pending_payment' ? 'Agreed Price' : 'Current Offer'}</p>
                                    <p className="text-2xl font-black text-emerald-600 tracking-tight">₹{neg.currentOffer}</p>
                                  </div>
                                )}                  
                            </div>
                              
                              {/* Request Specific Status UI (Buttons/Labels) */}
                              <div className="mt-auto space-y-2">
                                <button
                                  onClick={() => {
                                    const studentUser = buildStudentViewUser(neg, {
                                      id: neg.groupDocId || neg.studentDocId, 
                                      name: neg.studentName || 'Student',
                                      category: neg.category,
                                      budget: neg.initialBudget || neg.currentOffer,
                                    });
                                    setSelectedViewUser(studentUser);
                                    setSelectedViewApp(neg);
                                  }}
                                  className="w-full bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                  View Profile
                                </button>
                                {(() => {
                                  const leadId = neg.groupDocId || neg.studentDocId;
                                  const lockInfo = data?.globalLocks?.[leadId];
                                  const isLockedByOther = lockInfo && lockInfo.unlockDate > Date.now() && lockInfo.tutorDocId !== data?.user?.uid;
                                  
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
                                         disabled={actionLoadingAppId === neg.id}
                                         className={`w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all ${actionLoadingAppId === neg.id ? 'opacity-50 cursor-wait' : ''}`}
                                       >
                                         {actionLoadingAppId === neg.id ? 'Processing...' : 'Accept & Request Demo'}
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
                                        onClick={() => {
                                          const displayNames = neg.studentName || (neg.studentDocIds?.length > 1 ? 'Group' : 'Student');
                                          setActionConfirmModal({ isOpen: true, type: 'reject', appId: neg.id, studentName: displayNames });
                                        }}
                                        disabled={actionLoadingAppId === neg.id}
                                        className={`w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all ${actionLoadingAppId === neg.id ? 'opacity-50 cursor-wait' : ''}`}
                                      >
                                        {actionLoadingAppId === neg.id ? 'Processing...' : 'Decline'}
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-center mb-2">
                                        <p className="text-sm font-semibold text-slate-500">Waiting for student response...</p>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          const displayNames = neg.studentName || (neg.studentDocIds?.length > 1 ? 'Group' : 'Student');
                                          setActionConfirmModal({ isOpen: true, type: 'reject', appId: neg.id, studentName: displayNames });
                                        }}
                                        disabled={actionLoadingAppId === neg.id}
                                        className={`w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all ${actionLoadingAppId === neg.id ? 'opacity-50 cursor-wait' : ''}`}
                                      >
                                        {actionLoadingAppId === neg.id ? 'Processing...' : 'Withdraw Offer'}
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
                                      onClick={() => {
                                        const displayNames = neg.studentName || (neg.studentDocIds?.length > 1 ? 'Group' : 'Student');
                                        setActionConfirmModal({ isOpen: true, type: 'reject', appId: neg.id, studentName: displayNames });
                                      }}
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
                                          const displayNames = neg.studentName || (neg.studentDocIds?.length > 1 ? 'Group' : 'Student');
                                          const payload = { id: neg.id, studentName: displayNames, finalPrice: 500, studentsList: neg.studentsList || (neg.studentDetails ? [neg.studentDetails] : []) };
                                          setActionConfirmModal({ isOpen: true, type: 'accept_demo', appId: neg.id, studentName: displayNames, payload });
                                        }}
                                        className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-black text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                      >
                                        <CheckCircle2 className="w-4 h-4" /> Accept & Book Demo
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const displayNames = neg.studentName || (neg.studentDocIds?.length > 1 ? 'Group' : 'Student');
                                          setActionConfirmModal({ isOpen: true, type: 'reject', appId: neg.id, studentName: displayNames });
                                        }}
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
                                        const displayNames = neg.studentName || (neg.studentDocIds?.length > 1 ? 'Group' : 'Student');
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
                                              isOnline: (neg.mode || 'Online').toLowerCase() === 'online',
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
                                      onClick={() => {
                                        const displayNames = neg.studentName || (neg.studentDocIds?.length > 1 ? 'Group' : 'Student');
                                        setActionConfirmModal({ isOpen: true, type: 'reject', appId: neg.id, studentName: displayNames });
                                      }}
                                      className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                      Cancel Demo
                                    </button>
                                  </>
                                )}
                                {neg.status === 'demo_scheduled' && (
                                  <>
                                    <div className="w-full bg-blue-50/50 px-4 py-3 rounded-2xl border border-blue-100 text-center mb-3">
                                      <p className="text-sm font-semibold text-blue-600">Demo Scheduled! Prepare for the class.</p>
                                    </div>
                                    {(neg.mode || 'Online').toLowerCase() === 'online' && (
                                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            {meetingPlatforms[neg.id] === 'zoom' ? 'Zoom Link' : meetingPlatforms[neg.id] === 'teams' ? 'MS Teams Link' : 'Google Meet Link'}
                                          </p>
                                          <div className="flex bg-white rounded-md border border-slate-200 p-0.5 shadow-sm">
                                            <button onClick={() => setMeetingPlatforms(prev => ({...prev, [neg.id]: 'gmeet'}))} className={`px-2 py-1 text-[10px] font-bold rounded ${(!meetingPlatforms[neg.id] || meetingPlatforms[neg.id] === 'gmeet') ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Meet</button>
                                            <button onClick={() => setMeetingPlatforms(prev => ({...prev, [neg.id]: 'zoom'}))} className={`px-2 py-1 text-[10px] font-bold rounded ${meetingPlatforms[neg.id] === 'zoom' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Zoom</button>
                                            <button onClick={() => setMeetingPlatforms(prev => ({...prev, [neg.id]: 'teams'}))} className={`px-2 py-1 text-[10px] font-bold rounded ${meetingPlatforms[neg.id] === 'teams' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Teams</button>
                                          </div>
                                        </div>
                                        <input 
                                          type="text" 
                                          placeholder={meetingPlatforms[neg.id] === 'zoom' ? 'https://zoom.us/j/...' : meetingPlatforms[neg.id] === 'teams' ? 'https://teams.microsoft.com/...' : 'https://meet.google.com/...'}
                                          value={gmeetLinks[neg.id] || ''}
                                          onChange={(e) => setGmeetLinks(prev => ({...prev, [neg.id]: e.target.value}))}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a992]"
                                        />
                                        <button 
                                          onClick={() => handleSaveMeetingLink(neg.id)}
                                          disabled={savingGmeetAppId === neg.id}
                                          className={`w-full mt-1 bg-[#00a992] text-white py-2 rounded-lg text-sm font-bold transition-all ${savingGmeetAppId === neg.id ? 'opacity-50 cursor-wait' : 'hover:bg-[#008f7b]'}`}
                                        >
                                          {savingGmeetAppId === neg.id ? 'Saving...' : gmeetLinks[neg.id] ? 'Update Link Securely' : 'Save Link Securely'}
                                        </button>
                                      </div>
                                    )}
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'demo_finished')}
                                      disabled={actionLoadingAppId === neg.id}
                                      className={`w-full mt-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${actionLoadingAppId === neg.id ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                      {actionLoadingAppId === neg.id ? 'Processing...' : 'Mark Demo as Finished'}
                                    </button>
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
                            {cls.app?.demoDate && cls.app?.demoTime && (
                              <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Demo Schedule</p>
                                  <p className="font-bold text-slate-800">{new Date(cls.app.demoDate).toLocaleDateString()} at {cls.app.demoTime}</p>
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
                          
                          {cls.status === 'demo_scheduled' && (cls.app?.mode || 'Online').toLowerCase() === 'online' && (
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 mt-3">
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                  {meetingPlatforms[cls.id] === 'zoom' ? 'Zoom Link' : meetingPlatforms[cls.id] === 'teams' ? 'MS Teams Link' : 'Google Meet Link'}
                                </p>
                                <div className="flex bg-white rounded-md border border-slate-200 p-[2px] shadow-sm">
                                  <button onClick={(e) => { e.stopPropagation(); setMeetingPlatforms(prev => ({...prev, [cls.id]: 'gmeet'})); }} className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${(!meetingPlatforms[cls.id] || meetingPlatforms[cls.id] === 'gmeet') ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Meet</button>
                                  <button onClick={(e) => { e.stopPropagation(); setMeetingPlatforms(prev => ({...prev, [cls.id]: 'zoom'})); }} className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${meetingPlatforms[cls.id] === 'zoom' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Zoom</button>
                                  <button onClick={(e) => { e.stopPropagation(); setMeetingPlatforms(prev => ({...prev, [cls.id]: 'teams'})); }} className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${meetingPlatforms[cls.id] === 'teams' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>Teams</button>
                                </div>
                              </div>
                              <input 
                                type="text" 
                                placeholder={meetingPlatforms[cls.id] === 'zoom' ? 'https://zoom.us/j/...' : meetingPlatforms[cls.id] === 'teams' ? 'https://teams.microsoft.com/...' : 'https://meet.google.com/...'}
                                value={gmeetLinks[cls.id] || ''}
                                onChange={(e) => setGmeetLinks(prev => ({...prev, [cls.id]: e.target.value}))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00a992]"
                              />
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleSaveMeetingLink(cls.id); }}
                                disabled={savingGmeetAppId === cls.id}
                                className={`w-full mt-1 bg-[#00a992] text-white py-1.5 rounded-lg text-xs font-bold transition-all ${savingGmeetAppId === cls.id ? 'opacity-50 cursor-wait' : 'hover:bg-[#008f7b]'}`}
                              >
                                {savingGmeetAppId === cls.id ? 'Saving...' : gmeetLinks[cls.id] ? 'Update Link Securely' : 'Save Link Securely'}
                              </button>
                            </div>
                          )}

                          {cls.status === 'demo_scheduled' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleNegotiationAction(cls.id, 'demo_finished'); }}
                              disabled={actionLoadingAppId === cls.id}
                              className={`w-full mt-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 px-4 py-2.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${actionLoadingAppId === cls.id ? 'opacity-50 cursor-wait' : ''}`}
                            >
                              {actionLoadingAppId === cls.id ? 'Processing...' : 'Mark Demo as Finished'}
                            </button>
                          )}

                          <div className="mt-4 flex gap-2">
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const viewUser = buildStudentViewUser(cls.app || cls, {
                                    id: cls.id, 
                                    name: cls.student || 'Group', 
                                    phoneNumber: cls.app?.parentContact?.phone || '',
                                    email: cls.app?.parentContact?.email || '',
                                    budget: cls.app?.finalPrice || cls.app?.currentOffer || 0,
                                    preferredMode: cls.app?.preferredMode || 'Online'
                                  });
                                  setSelectedViewUser(viewUser);
                                  setSelectedViewApp(cls.app || cls);
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
                          
                          {(() => {
                            const appData = cls.app || cls;
                            if (appData.status === 'tuition_started' && appData.feePaid === false) {
                              const daysElapsed = Math.max(1, Math.ceil((Date.now() - (appData.startDate || Date.now())) / (1000 * 60 * 60 * 24)));
                              if (daysElapsed >= 10) {
                                return (
                                  <div className="mt-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-start gap-2 shadow-sm">
                                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
                                    <div className="flex flex-col">
                                      <span className="font-black text-sm uppercase tracking-wide text-red-700 mb-0.5">STOP CLASSES</span>
                                      <span className="text-xs font-medium">The student's payment is overdue and their account is locked. Please halt tuitions until the platform receives the fee.</span>
                                    </div>
                                  </div>
                                );
                              } else if (daysElapsed >= 7) {
                                return (
                                  <div className="mt-2 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl flex items-start gap-2 shadow-sm">
                                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-yellow-600" />
                                    <span className="text-xs font-bold leading-tight">The 7-day trial is over. The student has {10 - daysElapsed} days to complete the payment.</span>
                                  </div>
                                );
                              }
                            }
                            return null;
                          })()}

                          <div className="mt-4 flex gap-2">
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const viewUser = buildStudentViewUser(cls.app || cls, {
                                    id: cls.id, 
                                    name: cls.student || 'Group', 
                                    phoneNumber: cls.app?.parentContact?.phone || '',
                                    email: cls.app?.parentContact?.email || '',
                                    budget: cls.app?.finalPrice || cls.app?.currentOffer || 0,
                                    preferredMode: cls.app?.preferredMode || 'Online'
                                  });
                                  setSelectedViewUser(viewUser);
                                  setSelectedViewApp(cls.app || cls);
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

            {/* TAB: MY REVIEWS */}
            {activeTab === 'my_reviews' && (
              <div className="space-y-6 pb-10">
                <div className="mb-6">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Reviews</h1>
                  <p className="text-slate-500 font-medium mt-1">See what parents and students are saying about you.</p>
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : myReviews.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myReviews.map((review: any) => (
                      <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="font-bold text-gray-900">{review.parentName || 'Parent'}</h4>
                            <div className="flex flex-col gap-0.5 mt-1">
                              {review.groupId && <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md inline-block w-fit">Group: {review.groupId}</span>}
                              {review.studentsList && review.studentsList.length > 0 && (
                                <span className="text-xs text-slate-500 font-medium">Students: {review.studentsList.join(', ')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 fill-slate-100'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-700 italic border-l-2 border-emerald-200 pl-3">"{review.comment}"</p>
                        <p className="text-xs text-slate-400 font-medium mt-auto pt-4 text-right">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Star className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h3>
                    <p className="text-slate-500 max-w-sm">When parents hire you and leave feedback, their reviews will appear here.</p>
                  </div>
                )}
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

                {/* Detailed Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Plan Card */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Current Plan</p>
                    <h3 className="text-3xl font-black text-gray-900 flex items-center gap-2">
                      {isProPlan ? 'Pro' : 'Basic'} 
                      <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md ml-2">Active</span>
                    </h3>
                  </div>
                  
                  {/* Quota Progress */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm col-span-1 md:col-span-2 flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Weekly Tokens</p>
                        <p className="text-2xl font-black text-gray-900">{tokensUsed} / {quotaLimit} Used</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                          {tokensRemaining} Tokens Left
                        </p>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-[#00a992] rounded-full transition-all duration-500" style={{ width: `${Math.min((tokensUsed / quotaLimit) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-3 flex justify-between">
                      <span>Resets on Monday</span>
                      <span>{activePendingOffers} Total Pending Offers</span>
                    </p>
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
                    
                    <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50" disabled={!isProPlan}>
                      {!isProPlan ? 'Current Plan' : 'Downgrade (Coming Soon)'}
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
                        ₹299 <span className="text-lg text-emerald-200/50 font-medium tracking-normal">/month</span>
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
                      
                      <button 
                        onClick={isProPlan ? undefined : () => setUpgradeModalOpen(true)} 
                        disabled={isProPlan}
                        className={`w-full font-black py-4 px-6 rounded-xl transition-all active:scale-95 ${isProPlan ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-400 to-[#00a992] hover:from-emerald-300 hover:to-emerald-400 text-[#04241f] shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80'}`}
                      >
                        {isProPlan ? 'Active Plan' : 'Upgrade to Pro'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REFERRALS */}
            {activeTab === 'referrals' && (
              <div>
                {/* "Invited By" Banner */}
                {data?.userData?.referrerName && (
                  <div className="mb-8 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xl">🤝</span>
                    </div>
                    <div>
                      <h4 className="text-emerald-900 font-bold">Welcome to the community!</h4>
                      <p className="text-emerald-700 text-sm font-medium">You joined MiTutora via <span className="font-bold">{data.userData.referrerName}'s</span> invite link.</p>
                    </div>
                  </div>
                )}
                
                {(() => {
                  const bankedTokens = data?.profile?.bankedTokens || 0;
                  const tokensUsed = isCurrentWeek ? (data?.profile?.weeklyQuota?.tokensUsed || 0) : 0;
                  if (bankedTokens > 0) {
                    return (
                      <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                        <div>
                          <h4 className="font-black text-emerald-900 text-lg">Banked Tokens: {bankedTokens}</h4>
                          <p className="text-sm font-medium text-emerald-700 mt-1">You earned free requests from referring teachers!</p>
                        </div>
                        <button 
                          disabled={tokensUsed <= 0}
                          onClick={handleRedeemToken}
                          className="px-5 py-3 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-900/10"
                        >
                          Redeem 1 Token
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}

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
                        <h3 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight leading-tight">Invite friends.<br/><span className="text-emerald-300">Earn rewards.</span></h3>
                        <div className="text-emerald-50/90 text-base sm:text-lg font-medium leading-relaxed space-y-3">
                          <p>Share your unique referral code and unlock exclusive rewards based on who joins!</p>
                          <ul className="text-sm sm:text-base space-y-2 mt-2 bg-black/20 p-4 rounded-xl border border-white/10">
                            <li className="flex items-center gap-2"><span className="text-xl">🎓</span> <strong>Refer Students:</strong> Earn 25% of margin as Wallet Cash.</li>
                            <li className="flex items-center gap-2"><span className="text-xl">👨‍🏫</span> <strong>Refer Teachers:</strong> Earn 1 Banked Token (Free Request).</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl flex flex-col gap-4 transform transition-all hover:bg-white/15">
                        <div>
                          <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-2">Your Unique Code</p>
                          <span className="text-3xl sm:text-4xl font-black tracking-widest text-white drop-shadow-md">{data?.userData?.referralCode || data?.userData?.referralcode || 'GENERATING...'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button onClick={() => {
                            navigator.clipboard.writeText(data?.userData?.referralCode || data?.userData?.referralcode || '');
                            toast.success("Code copied to clipboard!");
                          }} className="flex-1 bg-white/20 text-white px-4 py-3.5 rounded-xl font-bold text-sm shadow-sm hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" /> Copy Code
                          </button>
                          <button onClick={() => {
                            const code = data?.userData?.referralCode || data?.userData?.referralcode || '';
                            const link = `${window.location.origin}/signup?ref=${code}`;
                            navigator.clipboard.writeText(link);
                            toast.success("Invite Link copied to clipboard!");
                          }} className="flex-1 bg-white text-[#063831] px-4 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" /> Copy Invite Link
                          </button>
                        </div>
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
                      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(((data?.userData?.walletBalance || data?.userData?.walletbalance || 0) / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex justify-between">
                        <span>Min Withdrawal: ₹1000</span>
                        <span className="font-bold text-emerald-600">{Math.min(((data?.userData?.walletBalance || data?.userData?.walletbalance || 0) / 1000) * 100, 100).toFixed(0)}%</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const bal = data?.userData?.walletBalance || data?.userData?.walletbalance || 0;
                        const msg = `Hello Admin, I would like to request a referral withdrawal.\n\nMy User ID is: ${data?.user?.uid}\nMy current Wallet Balance is: ₹${bal}`;
                        window.open(`https://api.whatsapp.com/send?phone=+917483034168&text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      disabled={(data?.userData?.walletBalance || data?.userData?.walletbalance || 0) < 1000}
                      className="w-full py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 shadow-lg shadow-gray-900/20 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" /> Withdraw via WhatsApp
                    </button>
                  </div>
                </div>

                {/* Referrals List */}
                <div>
                  <ReferralsList referrals={data?.referrals || []} />
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
                          <div key={cls.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">{cls.student}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5 mb-2">{cls.subject} • ₹{cls.app.finalPrice}/mo</p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                                  Next Due: {cls.app.nextPaymentDate ? new Date(cls.app.nextPaymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : new Date(cls.app.updatedAt + 7*24*60*60*1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-xs font-bold text-slate-500">
                                  {cls.app.paymentHistory?.length || 0} Payments Received
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-2 shrink-0">
                              <button
                                onClick={() => setSelectedPaymentHistoryApp(cls.app)}
                                className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                              >
                                View History
                              </button>
                              <button
                                onClick={() => handleMarkAsPaid(cls.app)}
                                disabled={actionLoading === cls.id}
                                className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === cls.id ? 'Marking...' : 'Mark Paid'}
                              </button>
                            </div>
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
                    onSuccess={async () => await mutate()} 
                  />
                </div>

                {/* TRUST & SAFETY VERIFICATION */}
                {hasProfile && (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <ShieldCheck className={`w-6 h-6 ${kycStep === 'verified' ? 'text-emerald-500' : 'text-slate-400'}`} />
                      Trust & Safety Verification
                    </h3>
                    
                    {kycStep === 'verified' ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-lg font-black text-emerald-900 flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Identity Verified
                          </p>
                          <p className="text-sm text-emerald-700 font-medium tracking-wide">Aadhar: {data?.profile?.maskedAadhar || 'XXXX-XXXX-XXXX'}</p>
                        </div>
                        <div className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> +20 Match Points
                        </div>
                      </div>
                    ) : kycStep === 'input' ? (
                      <div>
                        <p className="text-sm text-slate-600 mb-5 max-w-xl">Verify your Aadhar to get an "Identity Verified" badge on your public profile and a <strong className="text-emerald-600">+20 points boost</strong> in the matchmaking ranking system.</p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                          <input
                            type="text"
                            maxLength={12}
                            placeholder="Enter 12-digit Aadhar Number"
                            value={aadharInput}
                            onChange={(e) => setAadharInput(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 border border-slate-300 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                          />
                          <button
                            onClick={handleGenerateOTP}
                            disabled={kycLoading || aadharInput.length !== 12}
                            className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-all flex justify-center shadow-md whitespace-nowrap"
                          >
                            {kycLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-slate-600 mb-5 max-w-xl">Enter the 6-digit OTP sent to your Aadhar-linked mobile number.</p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 border border-slate-300 rounded-xl px-5 py-3.5 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 tracking-widest font-black text-center sm:text-left"
                          />
                          <button
                            onClick={handleVerifyOTP}
                            disabled={kycLoading || otpInput.length < 4}
                            className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all flex justify-center shadow-md whitespace-nowrap shadow-emerald-600/20"
                          >
                            {kycLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Aadhar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                            const userString = localStorage.getItem('user');
                            if (userString) {
                              const userObj = JSON.parse(userString);
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
      {/* Modals and Overlays */}
      
      {/* View Payment History Modal */}
      {selectedPaymentHistoryApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-xl">Payment History</h3>
              <button 
                onClick={() => setSelectedPaymentHistoryApp(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Total Received</p>
                  <p className="font-black text-emerald-900 text-2xl">
                    {selectedPaymentHistoryApp.paymentHistory?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {selectedPaymentHistoryApp.paymentHistory && selectedPaymentHistoryApp.paymentHistory.length > 0 ? (
                  selectedPaymentHistoryApp.paymentHistory.map((payment: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-emerald-200 shadow-sm transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">₹{payment.amount?.toLocaleString()}</p>
                          <p className="text-xs font-medium text-slate-500">{new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Received</span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center">
                    <p className="text-slate-400 font-medium text-sm">No payment history available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Student Profile Modal */}
      <StudentViewModal
        selectedViewUser={selectedViewUser}
        selectedViewApp={selectedViewApp}
        setSelectedViewUser={setSelectedViewUser}
        setSelectedViewApp={setSelectedViewApp}
        data={data}
        negotiationOffer={negotiationOffer}
        setNegotiationOffer={setNegotiationOffer}
        handleSendOffer={handleSendOffer}
        handleDirectRequestDemo={handleDirectRequestDemo}
        quotaExceeded={tokensUsed >= quotaLimit}
        onUpgradeRequested={() => setActiveTab('subscriptions')}
        offerLoading={offerLoading}
      />
      {/* Upgrade to Pro Confirm Modal */}
      <TransactionConfirmModal
        isOpen={upgradeModalOpen}
        type="success"
        title="Upgrade to Pro"
        description="Are you sure you want to upgrade to the Pro plan for ₹299/month? You will receive 15 tokens per week and priority matching."
        confirmText="Confirm & Pay"
        onConfirm={handleUpgradeToPro}
        onCancel={() => setUpgradeModalOpen(false)}
      />
      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        isDeleting={isDeletingAccount}
        onConfirm={async () => {
          setIsDeletingAccount(true);
          try {
            const { db, auth } = await import('@/utils/firebase/client');
            const { doc, deleteDoc, query, collection, where, getDocs, getDoc, updateDoc } = await import('firebase/firestore');
            const { deleteUser } = await import('firebase/auth');
            
            if(!auth.currentUser) throw new Error('Not logged in');
            
            const lastSignIn = new Date(auth.currentUser.metadata.lastSignInTime || 0).getTime();
            if (Date.now() - lastSignIn > 5 * 60 * 1000) {
              toast.error("For security reasons, you must have logged in recently to delete your account. Please sign out, sign back in, and try again.");
              setIsDeletingAccount(false);
              return;
            }
            
            const uid = auth.currentUser.uid;
            
            // Delete tutor doc
            await deleteDoc(doc(db, 'tutors', uid));
            
            // Handle applications
            const appQ = query(collection(db, 'applications'), where('tutorDocId', '==', uid));
            const appSnap = await getDocs(appQ);
            for (const d of appSnap.docs) {
              await deleteDoc(doc(db, 'applications', d.id));
            }
            
            // Handle requests
            const reqQ = query(collection(db, 'tuition_requests'), where('tutorDocId', '==', uid));
            const reqSnap = await getDocs(reqQ);
            for (const d of reqSnap.docs) {
              await updateDoc(doc(db, 'tuition_requests', d.id), { status: 'tutor_deleted' });
            }

            // Delete groups
            const groupQ = query(collection(db, 'groups'), where('tutorDocId', '==', uid));
            const groupSnap = await getDocs(groupQ);
            for (const d of groupSnap.docs) await deleteDoc(doc(db, 'groups', d.id));

            // Delete referrals
            const refQ1 = query(collection(db, 'referrals'), where('referrerId', '==', uid));
            const refSnap1 = await getDocs(refQ1);
            for (const d of refSnap1.docs) await deleteDoc(doc(db, 'referrals', d.id));
            
            const refQ2 = query(collection(db, 'referrals'), where('referredUserId', '==', uid));
            const refSnap2 = await getDocs(refQ2);
            for (const d of refSnap2.docs) await deleteDoc(doc(db, 'referrals', d.id));

            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data() || {};
            const roles = userData.roles || (userData.role ? [userData.role] : []);
            
            const isDualRole = roles.length > 1;
            
            if (isDualRole) {
              const newRoles = roles.filter((r: string) => r !== 'teacher');
              await updateDoc(userDocRef, {
                roles: newRoles
              });
              
              const updatedUser = { ...JSON.parse(localStorage.getItem('user') || '{}'), role: newRoles[0] || 'student', roles: newRoles };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              toast.success('Teacher profile deleted successfully');
              window.location.href = '/dashboard/student';
            } else {
              await deleteDoc(userDocRef);
              try {
                await deleteUser(auth.currentUser);
                localStorage.removeItem('user');
                toast.success('Account deleted successfully');
                window.location.href = '/';
              } catch (e: any) {
                if(e.code === 'auth/requires-recent-login') {
                  localStorage.removeItem('user');
                  toast.success('Account deleted successfully');
                  await auth.signOut();
                  window.location.href = '/login';
                } else {
                  throw e;
                }
              }
            }
          } catch (err: any) {
            toast.error(err.message);
            setIsDeletingAccount(false);
          }
        }}
      />
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
        const phone = postPaymentPopup.parentDetails?.phone || postPaymentPopup.parentDetails?.whatsapp || postPaymentPopup.parentDetails?.phoneNumber || postPaymentPopup.parentDetails?.whatsappNumber || student.phoneNumber || student.whatsappNumber || student.parentDetails?.phone || student.parentDetails?.whatsapp || 'Not provided';
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
                      isOnline: (neg.mode || 'Online').toLowerCase() === 'online',
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
      {/* Action Confirm Modal */}
      <TransactionConfirmModal
        isOpen={!!actionConfirmModal?.isOpen}
        type={actionConfirmModal?.type === 'accept_demo' ? 'success' : 'warning'}
        title={actionConfirmModal?.type === 'accept_demo' ? 'Confirm Acceptance' : 'Confirm Rejection'}
        description={actionConfirmModal?.type === 'accept_demo' 
          ? `Are you sure you want to accept ${actionConfirmModal.studentName} and proceed to pay the demo fee?`
          : `Are you sure you want to decline or withdraw your request with ${actionConfirmModal?.studentName}?`}
        onCancel={() => setActionConfirmModal(null)}
        onConfirm={async () => {
          if (actionConfirmModal?.type === 'accept_demo') {
            setPayingClass(actionConfirmModal.payload);
            setActionConfirmModal(null);
          } else if (actionConfirmModal) {
            const success = await handleNegotiationAction(actionConfirmModal.appId, 'decline');
            if (success !== false) {
              setActionConfirmModal(null);
            }
          }
        }}
      />

      </main>
      <WhatsAppButton />
    </div>
  );
}
