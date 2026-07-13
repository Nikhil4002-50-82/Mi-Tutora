"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { motion } from 'motion/react';
import { CalendarDays, LayoutDashboard, LogOut, ShieldCheck, User, Users, Gift, Lock, CheckCircle2, MessageCircle, BookOpen, Menu, X, Globe, Star, Bell } from 'lucide-react';
import TeacherForm from '@/components/TeacherForm';
import ActionModal from '@/components/ActionModal';
import { toast } from 'sonner';
const logo = '/imports/logo.png';

import useSWR from 'swr';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [selectedViewUser, setSelectedViewUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tuitionSubTab, setTuitionSubTab] = useState<'all'|'recommendation'>('recommendation');
  const [subTab, setSubTab] = useState<string>('');
  const [negotiationOffer, setNegotiationOffer] = useState<{ [key: string]: string }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'price' as 'price'|'timing', title: '', description: '', placeholder: '', initialValue: '', onSubmit: (val: string, date?: string, time?: string) => {} });
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
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
    
    const matchedStudents = availableStudents?.filter((student: any) => {
      if (!tutorData) return true;
      
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
              // Match if one contains the other, ignoring non-alphanumeric
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
    }) || [];

    const referralsSnap = await getDocs(query(collection(db, 'referrals'), where('referrerId', '==', user.uid)));
    const referrals = referralsSnap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));

    const studentIds = applications.map((app: any) => app.studentId).filter(Boolean);
    let studentsInfo: any[] = [];
    if (studentIds.length > 0) {
      const { documentId } = await import('firebase/firestore');
      const studentsQuery = query(collection(db, 'students'), where(documentId(), 'in', studentIds.slice(0, 10)));
      const sSnap = await getDocs(studentsQuery);
      studentsInfo = sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    }

    const applicationsWithSubjects = applications.map((app: any) => {
      const student = studentsInfo.find(s => s.id === app.studentId);
      return { 
        ...app, 
        studentDetails: student,
        subjects: student?.subjects || [],
        technologies: student?.technologies || [],
        languages: student?.languages || []
      };
    }) || [];

    const allNegotiations = applicationsWithSubjects.filter((app: any) => ['negotiating', 'demo_pending_payment'].includes(app.status));
    const recommendedNegotiations = allNegotiations.filter(app => matchedStudents.some((s:any) => s.id === app.studentId));

    return {
      user,
      userData,
      profile: tutorData,
      teacherCategories,
      availableStudents: matchedStudents,
      allStudents: availableStudentsRaw,
      recommendedStudents: matchedStudents,
      applications: applicationsWithSubjects,
      referrals,
      negotiations: allNegotiations,
      allNegotiations,
      recommendedNegotiations,
      upcomingClasses: applicationsWithSubjects.filter((app: any) => ['tuition_started', 'demo_booked', 'demo_pending_payment'].includes(app.status)).map((app: any) => ({
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
    const existingCode = data?.userData?.referralCode || data?.userData?.referralcode;
    if (data && !existingCode && !isGeneratingRef && data.user) {
      const generateCode = async () => {
        setIsGeneratingRef(true);
        try {
          const { db } = await import('@/utils/firebase/client');
          const { doc, updateDoc } = await import('firebase/firestore');
          const baseName = data?.profile?.name || data?.user?.displayName || 'USER';
          const newCode = baseName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          
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
          const newCode = existingCode || (parsedData.fullName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
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

  const handleSendOffer = async (student: any) => {
    if (offerLoading) return;
    const offerPrice = parseInt(negotiationOffer[student.id]);
    if (!offerPrice || offerPrice <= 0) return toast.error("Please enter a valid offer price.");

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
        studentName: student.name,
        currentOffer: offerPrice,
        initialBudget: student.budget,
        lastUpdatedBy: 'tutor',
        status: 'negotiating',
        source: 'direct',
        category: student.category,
        mode: student.preferredMode || 'flexible',
        demoHours: student.hoursPerDay || student.preferredTimeRange || 'Flexible',
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

  const handleNegotiationAction = async (appId: string, action: string, newOffer?: number, date?: string, time?: string) => {
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc } = await import('firebase/firestore');
      
      const updateData: any = {};
      if (action === 'accept_price') {
        updateData.status = 'demo_pending_payment';
        updateData.finalPrice = newOffer;
      } else if (action === 'counter_price') {
        updateData.currentOffer = newOffer;
        updateData.lastUpdatedBy = 'tutor';
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

  if (!data && swrError) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">Error loading dashboard: {swrError.message}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

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
    { id: 'my_students', label: 'My Students', icon: BookOpen },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (loading && !data) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
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
                <span className="font-black text-xl tracking-tight leading-none">Mi Tutora</span>
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
            {data?.profile?.name?.charAt(0) || 'T'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-sm truncate">{data?.profile?.name || 'Teacher'}</p>
            <p className="text-xs text-emerald-400 font-medium">Teacher Account</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      {showCategoryPopup && !hasProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-lg w-full text-center">
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
                  {data?.profile?.name?.charAt(0) || 'T'}
                </div>
              </div>
              
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
                 <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                   <p className="font-bold text-sm text-gray-900 truncate">{data?.profile?.name || 'Teacher'}</p>
                   <p className="text-xs text-gray-500 truncate mt-0.5">{data?.user?.email}</p>
                 </div>
                 <div className="p-2">
                   <button onClick={() => setActiveTab('profile')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <User className="w-4 h-4" /> Profile Settings
                   </button>
                   <button onClick={() => setActiveTab('my_students')} className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl flex items-center gap-3 transition-colors">
                     <Users className="w-4 h-4" /> My Students
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
                  data?.profile?.name,
                  data?.profile?.gender,
                  data?.profile?.phone || data?.profile?.whatsapp,
                  data?.profile?.email,
                  data?.profile?.qualification,
                  data?.profile?.experience,
                  data?.profile?.category,
                  data?.profile?.mode,
                  data?.profile?.subjects?.length > 0 || data?.profile?.technologies?.length > 0 || data?.profile?.languages?.length > 0 ? true : false,
                  data?.profile?.occupation
                ];
                const filled = fields.filter(f => f && String(f).trim() !== '' && f !== false).length;
                return Math.max(10, Math.round((filled / fields.length) * 100));
              })();
              
              const myActiveStudents = data?.upcomingClasses || [];
              const computedRecommendedStudents = data?.recommendedStudents || [];

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
                    
                    {/* Left: My Students */}
                    <div className="lg:col-span-2 space-y-4">
                      <h2 className="text-xl font-bold text-gray-900">My Students</h2>
                      
                      {myActiveStudents.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
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
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg">
                                  {cls.student?.charAt(0) || 'S'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900">{cls.student}</h4>
                                  <p className="text-sm text-gray-500">{cls.subject}</p>
                                </div>
                              </div>
                              <button onClick={() => setActiveTab('my_students')} className="text-[#00a992] font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100">
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
                            {computedRecommendedStudents.slice(0, 4).map((student: any, index: number) => (
                              <div key={student.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 text-xs flex-shrink-0">
                                  #{index + 1}
                                </div>
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0">
                                  {student.name?.charAt(0) || 'S'}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <h4 className="font-bold text-gray-900 text-sm truncate">{student.name || 'Student'}</h4>
                                  <p className="text-xs text-gray-500 truncate">{student.subjects ? student.subjects.join(', ') : student.category}</p>
                                </div>
                                <button onClick={() => setActiveTab('new_tuition')} className="text-xs font-bold text-[#00a992] bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 flex-shrink-0">
                                  View
                                </button>
                              </div>
                            ))}
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
                      className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tuitionSubTab === 'all' ? 'bg-white text-[#063831] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setTuitionSubTab('recommendation')} 
                      className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${tuitionSubTab === 'recommendation' ? 'bg-white text-[#063831] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
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
                      {(() => {
                        const studentsList = (tuitionSubTab === 'all' ? data?.allStudents : data?.recommendedStudents)?.filter((s:any) => {
                          if (!hasProfile && selectedCategory) return s.category === selectedCategory;
                          return data?.teacherCategories?.length > 1 ? s.category === subTab : true;
                        }) || [];

                        const grouped = studentsList.reduce((acc: any, student: any) => {
                          const hasNegotiation = data?.applications?.some((app: any) => app.studentId === student.id && ['negotiating'].includes(app.status));
                          if (hasNegotiation) return acc;
                          if (!acc[student.parentId]) {
                            acc[student.parentId] = {
                              parentId: student.parentId,
                              address: student.area || student.address || 'Location Hidden',
                              students: []
                            };
                          }
                          acc[student.parentId].students.push(student);
                          return acc;
                        }, {});

                        const households = Object.values(grouped) as any[];

                        return households.map((household: any) => (
                          <div key={household.parentId} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                              <div>
                                <h3 className="text-lg font-black text-gray-900">Household / Parent</h3>
                                <p className="text-sm font-medium text-emerald-600">{household.students.length} Student(s) • {household.address}</p>
                              </div>
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                                New Request
                              </span>
                            </div>
                            
                            <div className="p-4 space-y-4 flex-grow">
                              {household.students.map((student: any) => {
                                const isPending = data?.applications?.some((app: any) => app.studentId === student.id && ['demo_pending_payment', 'demo_booked'].includes(app.status));
                                const isHired = data?.applications?.some((app: any) => app.studentId === student.id && ['tuition_started'].includes(app.status));
                                
                                return (
                                  <div key={student.id} className="border border-gray-100 rounded-xl p-4 bg-white relative">
                                    <div className="mb-3">
                                      <h4 className="font-bold text-gray-900 text-lg">{student.name || 'Student'} <span className="text-sm text-gray-500 font-normal capitalize">({student.category})</span></h4>
                                      <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-y-1">
                                        {student.classLevel && <span><strong className="text-gray-400">Class:</strong> {student.classLevel}</span>}
                                        {(!student.category || student.category === 'school') && (student.subjects?.length ?? 0) > 0 && <span><strong className="text-gray-400">Sub:</strong> {student.subjects[0]}...</span>}
                                        {student.category === 'programming' && (student.technologies?.length ?? 0) > 0 && <span><strong className="text-gray-400">Tech:</strong> {student.technologies[0]}...</span>}
                                        {student.category === 'languages' && (student.languages?.length ?? 0) > 0 && <span><strong className="text-gray-400">Lang:</strong> {student.languages[0]}...</span>}
                                        <span className="col-span-2"><strong className="text-gray-400">Budget:</strong> <span className="text-emerald-600 font-bold">₹{student.budget}/mo</span></span>
                                      </div>
                                    </div>

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
                                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50 text-sm"
                                            placeholder="Your Offer (₹/hr)"
                                            value={negotiationOffer[student.id] || ''}
                                            onChange={(e) => setNegotiationOffer({...negotiationOffer, [student.id]: e.target.value})}
                                          />
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
                                          <div className="flex gap-2">
                                            <button 
                                              onClick={() => setSelectedViewUser(student)}
                                              className="w-1/3 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-2 rounded-lg transition-colors text-sm"
                                            >
                                              View
                                            </button>
                                            <button 
                                              onClick={() => handleSendOffer(student)}
                                              disabled={offerLoading}
                                              className="w-2/3 bg-[#063831] hover:bg-[#04241f] text-white font-bold py-2 rounded-lg transition-colors shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {offerLoading ? 'Sending...' : 'Send Offer'}
                                            </button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ));
                      })()}
                      {(!((tuitionSubTab === 'all' ? data?.allStudents : data?.recommendedStudents)?.filter((s:any) => {
                        if (!hasProfile && selectedCategory) return s.category === selectedCategory;
                        return data?.teacherCategories?.length > 1 ? s.category === subTab : true;
                      })) || ((tuitionSubTab === 'all' ? data?.allStudents : data?.recommendedStudents)?.filter((s:any) => {
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

            {/* TAB: REQUESTS */}
            {activeTab === 'requests' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Requests & Offers</h2>
                {((data?.allNegotiations)?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {data?.allNegotiations?.map((neg: any) => (
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
                              
                              {/* Price Negotiation Logic */}
                              {neg.status === 'negotiating' && (
                                neg.lastUpdatedBy === 'student' ? (
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
                                          description: 'Propose a new monthly fee for this student.',
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

                              {/* Direct Payment Waiting */}
                              {neg.status === 'demo_pending_payment' && (
                                <div className="w-full sm:w-auto bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">
                                  <p className="text-sm font-semibold text-emerald-600">Waiting for student to complete payment...</p>
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
                )}

            {/* TAB: MY STUDENTS */}
            {activeTab === 'my_students' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">My Students & Classes</h2>
                <div className="bg-white shadow-sm overflow-hidden sm:rounded-2xl border border-gray-100">
                  <ul className="divide-y divide-gray-100">
                    {data?.upcomingClasses?.map((cls: any) => (
                      <li key={cls.id} className="p-6 hover:bg-emerald-50/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-bold text-[#063831] truncate mb-1">{cls.subject}</p>
                            <p className="text-sm font-medium text-gray-500">Student: <span className="text-gray-900 font-bold">{cls.student}</span></p>
                            {cls.status === 'confirmed' && cls.studentDetails && (
                              <div className="mt-3 space-y-1 text-sm text-gray-600 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                                {cls.studentDetails.phoneNumber && <p><span className="font-semibold text-emerald-800">Phone:</span> {cls.studentDetails.phoneNumber}</p>}
                                {cls.studentDetails.whatsappNumber && <p><span className="font-semibold text-emerald-800">WhatsApp:</span> {cls.studentDetails.whatsappNumber}</p>}
                                {cls.studentDetails.email && <p><span className="font-semibold text-emerald-800">Email:</span> {cls.studentDetails.email}</p>}
                                {cls.studentDetails.address && <p><span className="font-semibold text-emerald-800">Address:</span> {cls.studentDetails.address}</p>}
                                {cls.studentDetails.classLevel && <p><span className="font-semibold text-emerald-800">Class:</span> {cls.studentDetails.classLevel}</p>}
                                {cls.studentDetails.board && <p><span className="font-semibold text-emerald-800">Board:</span> {cls.studentDetails.board}</p>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                              cls.status === 'confirmed' || cls.status === 'tuition_started'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {cls.status === 'demo_pending_payment' ? 'Pending Student Payment' : cls.status}
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
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                {!hasProfile && (
                  <div className="bg-orange-50 border-b border-orange-100 p-4 text-orange-800 flex items-center justify-center gap-2 font-medium text-sm text-center">
                    <Lock className="w-4 h-4" /> Please complete your profile to unlock the dashboard and start finding students!
                  </div>
                )}
                <TeacherForm isDashboard={true} hasProfile={hasProfile} category={selectedCategory} initialData={data?.profile} onSuccess={() => mutate()} />
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
                {selectedViewUser.parentName ? selectedViewUser.parentName.charAt(0) : 'S'}
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">{selectedViewUser.parentName || 'Parent'}</h3>
                <p className="text-emerald-600 font-bold capitalize">Looking for a {selectedViewUser.category || 'Tutor'}</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Student Class/Grade</p>
                <p className="text-lg font-bold text-gray-900">{selectedViewUser.classGrade || 'Not specified'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Budget</p>
                <p className="text-lg font-bold text-emerald-600">₹{selectedViewUser.budget || 'Negotiable'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Requirements</p>
              {selectedViewUser.category === 'programming' && (selectedViewUser.technologies?.length ?? 0) > 0 && <p className="mb-2"><strong className="text-gray-700">Technologies:</strong> {selectedViewUser.technologies.join(', ')}</p>}
              {selectedViewUser.category === 'languages' && (selectedViewUser.languagesTaught?.length ?? 0) > 0 && <p className="mb-2"><strong className="text-gray-700">Languages:</strong> {selectedViewUser.languagesTaught.join(', ')}</p>}
              {(!selectedViewUser.category || selectedViewUser.category === 'school') && (selectedViewUser.subjects?.length ?? 0) > 0 && <p className="mb-2"><strong className="text-gray-700">Subjects:</strong> {selectedViewUser.subjects.join(', ')}</p>}
              <p className="mb-2"><strong className="text-gray-700">Preferred Days:</strong> {selectedViewUser.days || 'Not specified'}</p>
              <p><strong className="text-gray-700">Preferred Time:</strong> {selectedViewUser.time || 'Not specified'}</p>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</p>
              <p className="font-medium text-gray-900">{selectedViewUser.area || 'Not specified'} ({selectedViewUser.mode || 'Online'})</p>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
