"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { motion } from 'motion/react';
import { CalendarDays, LayoutDashboard, LogOut, ShieldCheck, User, Users, Gift, CheckCircle2, MessageCircle, BookOpen, Menu, X, Globe, Star, Lock, GraduationCap, Bell } from 'lucide-react';
import DemoForm from '@/components/DemoForm';
import ActionModal from '@/components/ActionModal';
import { toast } from 'sonner';
const logo = '/imports/logo.png';

import useSWR from 'swr';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [selectedViewUser, setSelectedViewUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [negotiationOffer, setNegotiationOffer] = useState<{ [key: string]: string }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [payingClass, setPayingClass] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState<string>('');
  const [editingStudentId, setEditingStudentId] = useState<string>('');
  const [tuitionSubTab, setTuitionSubTab] = useState<'all'|'recommendation'>('recommendation');
  const [subTab, setSubTab] = useState<string>('');
  const [upiId, setUpiId] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'price' as 'price'|'timing', title: '', description: '', placeholder: '', initialValue: '', onSubmit: (val: string, date?: string, time?: string) => {} });
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

    // referrals fetched sequentially above

    const tutorIds = applications.map((app: any) => app.tutorId).filter(Boolean);
    let tutorsInfo: any[] = [];
    if (tutorIds.length > 0) {
       const { documentId } = await import('firebase/firestore');
       
       // Chunk tutorIds into groups of 10
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
    const recommendedNegotiations = allNegotiations.filter(app => matchedTutors.some((t:any) => t.id === app.tutorId));

    return {
      user,
      userData,
      profile: parentData,
      myStudent,
      allStudents: students,
      myRequest,
      applications: applicationsWithSubjects,
      availableTeachers: matchedTutors,
      allTutors: availableTutors,
      recommendedTutors: matchedTutors,
      referrals,
      negotiations: allNegotiations,
      allNegotiations,
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


  const allStudents = data?.allStudents || [];
  const activeStudent = allStudents.find((s:any) => s.id === activeStudentId) || data?.myStudent || allStudents[0] || null;
  
  const computedRecommendedTutors = data?.allTutors?.filter((tutor: any) => {
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
  }) || [];

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
    const existingCode = data?.userData?.referralCode || data?.userData?.referralcode;
    if (data && !existingCode && !isGeneratingRef && data.user) {
      const generateCode = async () => {
        setIsGeneratingRef(true);
        try {
          const { db } = await import('@/utils/firebase/client');
          const { doc, updateDoc } = await import('firebase/firestore');
          const baseName = data?.myStudent?.name || data?.user?.displayName || 'USER';
          const newCode = baseName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          
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
          const newCode = existingCode || (formData.fullName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
          await setDoc(userDocRef, { hasProfile: true, referralCode: newCode }, { merge: true });

          const parentDocRef = doc(db, 'parents', user.uid);
          const parentDocSnap = await getDoc(parentDocRef);
          if (!parentDocSnap.exists()) {
            await setDoc(parentDocRef, { id: user.uid, name: formData.parentName || formData.fullName });
          }

          const newStudentRef = await addDoc(collection(db, 'students'), {
            parentId: user.uid,
            category: formData.category || '',
            name: formData.fullName,
            gender: formData.gender,
            phoneNumber: formData.phone,
            whatsappNumber: formData.whatsapp,
            email: formData.email,
            address: formData.address,
            studentType: formData.studentType,
            classLevel: formData.classGrade,
            board: formData.board,
            subjects: formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : [],
            budget: parseInt(formData.budget) || 0,
            preferredMode: formData.demoMode,
            learningGoal: formData.goal,
            specialRequirements: formData.requirements,
            createdAt: Date.now()
          });

          await addDoc(collection(db, 'tuition_requests'), {
            parentId: user.uid,
            studentId: newStudentRef.id,
            category: formData.category || '',
            studentName: formData.fullName,
            classLevel: formData.classGrade,
            board: formData.board,
            subjects: formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : [],
            budget: parseInt(formData.budget) || 0,
            mode: formData.demoMode,
            preferredTimeRange: formData.hours,
            area: formData.address,
            status: 'open',
            createdAt: Date.now()
          });

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

  const handleRequestTutor = async (tutor: any) => {
    if (requestLoading) return;
    const offerPrice = parseInt(negotiationOffer[tutor.id]);
    if (!offerPrice || offerPrice <= 0) return toast.error("Please enter a valid budget offer.");
    
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
      
      const studentToUse = activeStudent || data?.myStudent;
      if (!studentToUse) {
        toast.error("Please add a student profile first.");
        setRequestLoading(false);
        return;
      }

      await addDoc(collection(db, 'applications'), {
        tutorId: tutor.id,
        tutorName: tutor.name,
        parentId: user?.uid,
        studentId: studentToUse.id,
        studentName: studentToUse.name || 'Student',
        currentOffer: offerPrice,
        initialBudget: studentToUse.budget || offerPrice,
        lastUpdatedBy: 'student',
        status: 'negotiating',
        source: 'direct',
        category: tutor.category,
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

  const handleNegotiationAction = async (appId: string, action: string, newOffer?: number) => {
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
      }

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
        startDate: new Date().toLocaleDateString('en-GB')
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
    { id: 'requests', label: 'Requests', icon: MessageCircle },
    { id: 'my_teachers', label: 'My Teachers', icon: BookOpen },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (loading && !data) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#00a992]/30 border-t-[#00a992] rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
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
                <span className="font-black text-xl tracking-tight leading-none">Mi Tutora</span>
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
            {data?.user?.displayName?.charAt(0) || 'S'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-sm truncate">{data?.user?.displayName || 'Student'}</p>
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
      <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col relative">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 sticky top-0 z-30 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('requests')} className="text-gray-400 hover:text-emerald-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#063831] text-white flex items-center justify-center font-bold shadow-md ring-2 ring-transparent group-hover:ring-emerald-500 transition-all">
                  {data?.user?.displayName?.charAt(0) || 'S'}
                </div>
              </div>
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
                 <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                   <p className="font-bold text-sm text-gray-900 truncate">{data?.user?.displayName || 'Student'}</p>
                   <p className="text-xs text-gray-500 truncate mt-0.5">{data?.user?.email}</p>
                 </div>
                 <div className="p-2">
                   <button onClick={() => setActiveTab('profile')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <User className="w-4 h-4" /> Profile Settings
                   </button>
                   <button onClick={() => setActiveTab('my_teachers')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <BookOpen className="w-4 h-4" /> My Teachers
                   </button>
                   <div className="h-px bg-gray-100 my-1 mx-2"></div>
                   <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors">
                     <LogOut className="w-4 h-4" /> Logout
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </header>

        <ActionModal {...modalConfig} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
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
                  activeStudent?.address,
                  activeStudent?.classLevel || activeStudent?.technologies?.length > 0 || activeStudent?.languages?.length > 0 ? true : false,
                  activeStudent?.board,
                  activeStudent?.category,
                  activeStudent?.budget,
                  activeStudent?.subjects?.length > 0 ? true : false,
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
                    <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm md:w-80 flex-shrink-0 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-gray-900 text-sm">Strengthen your profile</p>
                          <button onClick={() => setActiveTab('profile')} className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"><X className="w-4 h-4" /></button>
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
                              <button onClick={() => setActiveTab('my_teachers')} className="text-[#00a992] font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100">
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
                            {computedRecommendedTutors.slice(0, 4).map((tutor: any, index: number) => (
                              <div key={tutor.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3">
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
                                <button onClick={() => setActiveTab('new_tuition')} className="text-xs font-bold text-[#00a992] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 flex-shrink-0">
                                  View
                                </button>
                              </div>
                            ))}
                            {computedRecommendedTutors.length > 4 && (
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
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                      {tuitionSubTab === 'all' ? 'All Tutors' : 'Recommended Tutors'}
                    </h2>
                    {tuitionSubTab === 'recommendation' && allStudents.length > 1 && (
                      <div className="mt-4 flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-600">Shopping for:</label>
                        <select 
                          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-[#00a992] focus:outline-none focus:ring-2 focus:ring-[#00a992]/50"
                          value={activeStudentId || activeStudent?.id || ''}
                          onChange={(e) => setActiveStudentId(e.target.value)}
                        >
                          {allStudents.map((s:any) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
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
                      const hasNegotiation = data?.applications?.some((app: any) => app.tutorId === teacher.id && ['negotiating'].includes(app.status));
                      const isPending = data?.applications?.some((app: any) => app.tutorId === teacher.id && ['demo_pending_payment', 'demo_booked'].includes(app.status));
                      const isHired = data?.applications?.some((app: any) => app.tutorId === teacher.id && ['tuition_started'].includes(app.status));
                      
                      if (hasNegotiation) return null; // Already negotiating
                      
                      return (
                        <div key={teacher.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-[#00a992]/30 transition-all flex flex-col h-full">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                              {teacher.mode || 'Online'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden leading-relaxed">{teacher.teachingApproach || 'Experienced Tutor'}</p>
                          <div className="space-y-2 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex-grow">
                            {teacher.category === 'programming' && (teacher.technologies?.length ?? 0) > 0 && <p><strong className="text-gray-700">Technologies:</strong> {teacher.technologies.join(', ')}</p>}
                            {teacher.category === 'languages' && (teacher.languagesTaught?.length ?? 0) > 0 && <p><strong className="text-gray-700">Languages:</strong> {teacher.languagesTaught.join(', ')}</p>}
                            {(!teacher.category || teacher.category === 'school') && (teacher.subjects?.length ?? 0) > 0 && <p><strong className="text-gray-700">Subjects:</strong> {teacher.subjects.join(', ')}</p>}
                            {teacher.experience && <p><strong className="text-gray-700">Experience:</strong> {teacher.experience}</p>}
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
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50"
                                    placeholder="e.g. 500"
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
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => setSelectedViewUser(teacher)}
                                      className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                      <User className="w-4 h-4" /> View Profile
                                    </button>
                                    <button 
                                      onClick={() => handleRequestTutor(teacher)}
                                      disabled={requestLoading}
                                      className="w-full bg-[#00a992] text-white hover:bg-emerald-600 font-bold py-3 rounded-xl transition-colors shadow-md shadow-[#00a992]/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <MessageCircle className="w-4 h-4" /> {requestLoading ? 'Requesting...' : 'Request & Offer'}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
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

            {/* TAB: REQUESTS */}
            {activeTab === 'requests' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Requests & Offers</h2>
                {((data?.allNegotiations)?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {data?.allNegotiations?.map((neg: any) => {
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
                              
                              {/* Price Negotiation Logic */}
                              {neg.status === 'negotiating' && (
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
                                          onSubmit: (val: string) => {
                                            setModalConfig(prev => ({ ...prev, isOpen: false }));
                                            handleNegotiationAction(neg.id, 'counter_price', parseInt(val));
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
                )}

            {/* TAB: MY TEACHERS */}
            {activeTab === 'my_teachers' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">My Teachers & Classes</h2>
                <div className="bg-white shadow-sm overflow-hidden sm:rounded-2xl border border-gray-100">
                  <ul className="divide-y divide-gray-100">
                    {data?.upcomingClasses?.map((cls: any) => (
                      <li key={cls.id} className="p-6 hover:bg-emerald-50/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-lg font-bold text-[#063831] truncate">{cls.subject}</p>
                              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md border border-blue-100">For: {allStudents.find((s:any) => s.id === cls.studentId)?.name || cls.studentName || 'Student'}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-500">Tutor: <span className="text-gray-900 font-bold">{cls.teacher}</span></p>
                            {cls.status === 'tuition_started' && cls.tutorDetails && (
                              <div className="mt-3 space-y-1 text-sm text-gray-600 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                                {cls.tutorDetails.phone && <p><span className="font-semibold text-emerald-800">Phone:</span> {cls.tutorDetails.phone}</p>}
                                {cls.tutorDetails.whatsapp && <p><span className="font-semibold text-emerald-800">WhatsApp:</span> {cls.tutorDetails.whatsapp}</p>}
                                {cls.tutorDetails.email && <p><span className="font-semibold text-emerald-800">Email:</span> {cls.tutorDetails.email}</p>}
                                {cls.tutorDetails.address && <p><span className="font-semibold text-emerald-800">Address:</span> {cls.tutorDetails.address}</p>}
                                {cls.tutorDetails.qualification && <p><span className="font-semibold text-emerald-800">Qualification:</span> {cls.tutorDetails.qualification}</p>}
                                {cls.tutorDetails.experience && <p><span className="font-semibold text-emerald-800">Experience:</span> {cls.tutorDetails.experience}</p>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                              cls.status === 'confirmed' || cls.status === 'tuition_started'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                            {cls.status === 'demo_pending_payment' ? (
                              <button onClick={() => setPayingClass(cls)} className="text-orange-700 font-bold hover:text-orange-800 uppercase tracking-wider">
                                Pay Fee
                              </button>
                            ) : (
                              <span>{cls.status}</span>
                            )}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                    {(!data?.upcomingClasses || data?.upcomingClasses?.length === 0) && (
                      <li className="p-8 text-sm text-gray-500 text-center font-medium">No active classes yet.</li>
                    )}
                  </ul>
                </div>
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
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-gray-900">Registered Students</h2>
                  {hasProfile && (
                    <button 
                      onClick={() => {
                        setActiveStudentId('new');
                      }}
                      className="bg-[#00a992] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-600 transition-colors"
                    >
                      + Add Student
                    </button>
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
                      hasProfile={hasProfile && activeStudentId !== 'new'} 
                      category={selectedCategory} 
                      activeStudentId={editingStudentId || activeStudentId} 
                      initialData={
                        (editingStudentId || activeStudentId) !== 'new' && (editingStudentId || activeStudentId) !== '' 
                          ? allStudents.find((s:any) => s.id === (editingStudentId || activeStudentId)) 
                          : ((editingStudentId || activeStudentId) === '' ? allStudents[0] : null)
                      }
                      onSuccess={() => {
                        if(activeStudentId === 'new') setActiveStudentId('');
                        if(editingStudentId) setEditingStudentId('');
                        mutate();
                      }} 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allStudents.map((s:any) => (
                      <div key={s.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
                            <p className="text-sm font-medium text-emerald-600 capitalize">{s.category}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex-grow">
                          {s.classLevel && <p><strong className="text-gray-700">Class:</strong> {s.classLevel}</p>}
                          {s.board && <p><strong className="text-gray-700">Board:</strong> {s.board}</p>}
                          {s.subjects && s.subjects.length > 0 && <p><strong className="text-gray-700">Subjects:</strong> {s.subjects.join(', ')}</p>}
                          {s.technologies && s.technologies.length > 0 && <p><strong className="text-gray-700">Technologies:</strong> {s.technologies.join(', ')}</p>}
                          {s.languages && s.languages.length > 0 && <p><strong className="text-gray-700">Languages:</strong> {s.languages.join(', ')}</p>}
                          <p><strong className="text-gray-700">Budget:</strong> ₹{s.budget}/mo</p>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <button 
                            onClick={() => setActiveStudentId(s.id)}
                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                              activeStudentId === s.id || (activeStudentId === '' && activeStudent?.id === s.id) 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {activeStudentId === s.id || (activeStudentId === '' && activeStudent?.id === s.id) ? (
                              <><CheckCircle2 className="w-4 h-4" /> Active Student</>
                            ) : (
                              'Select'
                            )}
                          </button>
                          <button 
                            onClick={() => setEditingStudentId(s.id)}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 rounded-xl font-bold text-sm transition-colors"
                          >
                            Edit Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      
      {/* View Teacher Profile Modal */}
      {selectedViewUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative my-8">
            <button 
              onClick={() => setSelectedViewUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-black uppercase">
                {selectedViewUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">{selectedViewUser.name}</h3>
                <p className="text-emerald-600 font-bold capitalize">{selectedViewUser.category || 'Tutor'}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Experience</p>
                <p className="text-lg font-bold text-gray-900">{selectedViewUser.experience || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Highest Qualification</p>
                <p className="text-lg font-bold text-gray-900">{selectedViewUser.qualification || 'Not specified'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teaching Expertise</p>
              {selectedViewUser.category === 'programming' && (selectedViewUser.technologies?.length ?? 0) > 0 && <p className="mb-2"><strong className="text-gray-700">Technologies:</strong> {selectedViewUser.technologies.join(', ')}</p>}
              {selectedViewUser.category === 'languages' && (selectedViewUser.languagesTaught?.length ?? 0) > 0 && <p className="mb-2"><strong className="text-gray-700">Languages:</strong> {selectedViewUser.languagesTaught.join(', ')}</p>}
              {(!selectedViewUser.category || selectedViewUser.category === 'school') && (selectedViewUser.subjects?.length ?? 0) > 0 && <p className="mb-2"><strong className="text-gray-700">Subjects:</strong> {selectedViewUser.subjects.join(', ')}</p>}
              <p className="mb-2"><strong className="text-gray-700">Teaching Approach:</strong> {selectedViewUser.teachingApproach || 'Not specified'}</p>
              <p><strong className="text-gray-700">Fee Range:</strong> {selectedViewUser.feeRange || 'Negotiable'}</p>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Residential Address</p>
              <p className="font-medium text-gray-900">{selectedViewUser.address || 'Not specified'}</p>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
