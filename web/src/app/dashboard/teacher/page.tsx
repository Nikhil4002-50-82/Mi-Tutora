"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { motion } from 'motion/react';
import { CalendarDays, LayoutDashboard, LogOut, ShieldCheck, User, Users, Gift, Lock, CheckCircle2, MessageCircle, BookOpen, Menu, X } from 'lucide-react';
import TeacherForm from '@/components/TeacherForm';
import ActionModal from '@/components/ActionModal';
import { toast } from 'sonner';
const logo = '/imports/logo.png';

import useSWR from 'swr';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subTab, setSubTab] = useState<string>('');
  const [negotiationOffer, setNegotiationOffer] = useState<{ [key: string]: string }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'price' as 'price'|'timing', title: '', description: '', placeholder: '', initialValue: '', onSubmit: (val: string) => {} });
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const router = useRouter();

  const fetcher = async () => {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      router.push('/login');
      throw new Error('Unauthenticated');
    }

    const user = session.user;
    
    let { data: userData, error: fetchUserError } = await supabase.from('users').select('hasProfile, referralCode, walletbalance').eq('id', user.id).single();
    
    if (!userData) {
      console.log("userData not found! Attempting insert. Error was:", fetchUserError);
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'Teacher',
        role: 'teacher'
      });
      console.log("Insert result error:", insertError);
      const { data: newUserData } = await supabase.from('users').select('hasProfile, referralCode, walletbalance').eq('id', user.id).single();
      userData = newUserData;
    }

    const { data: tutorData } = await supabase.from('tutors').select('*').eq('id', user.id).single();
    const { data: applications } = await supabase.from('applications').select('*').eq('tutorId', user.id);

    const { data: availableStudentsRaw } = await supabase
      .from('tuition_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    const uniqueParentIds = new Set();
    const availableStudents = availableStudentsRaw?.filter(req => {
      if (uniqueParentIds.has(req.parentId)) return false;
      uniqueParentIds.add(req.parentId);
      return true;
    }) || [];

    const teacherCategories = tutorData?.category ? tutorData.category.split(',').map((c:string) => c.trim()) : [];
    
    const matchedStudents = availableStudents?.filter(student => {
      if (!tutorData) return true;
      if (!teacherCategories.includes(student.category)) return false;
      
      if (student.category === 'school') {
        const boardMatch = !student.board || (tutorData.boards && tutorData.boards.includes(student.board));
        const classMatch = !student.classLevel || (tutorData.classes && tutorData.classes.includes(student.classLevel));
        return boardMatch || classMatch;
      }
      return true;
    }) || [];

    const { data: referrals } = await supabase.from('referrals').select('*').eq('referrerId', user.id);

    // Fetch student subjects for active applications
    const studentIds = applications?.map(app => app.studentId).filter(Boolean) || [];
    let studentsInfo: any[] = [];
    if (studentIds.length > 0) {
      const { data } = await supabase.from('students').select('id, subjects, technologies, languages').in('id', studentIds);
      studentsInfo = data || [];
    }

    const applicationsWithSubjects = applications?.map(app => {
      const student = studentsInfo.find(s => s.id === app.studentId);
      return { 
        ...app, 
        subjects: student?.subjects || [],
        technologies: student?.technologies || [],
        languages: student?.languages || []
      };
    }) || [];

    return {
      user,
      userData,
      profile: tutorData,
      teacherCategories,
      availableStudents: matchedStudents,
      applications: applicationsWithSubjects,
      referrals: referrals || [],
      negotiations: applicationsWithSubjects.filter(app => ['negotiating', 'scheduling'].includes(app.status)),
      upcomingClasses: applicationsWithSubjects.filter(app => ['tuition_started', 'demo_booked', 'demo_pending_payment'].includes(app.status)).map(app => ({
        id: app.id,
        student: app.studentName || 'Assigned Student',
        subject: app.category || 'General',
        date: app.nextPaymentDate || app.startDate || new Date().toISOString(),
        status: app.status === 'tuition_started' ? 'confirmed' : 'pending'
      }))
    };
  };

  const { data, error: swrError, isLoading: loading, mutate } = useSWR('teacherDashboardData', fetcher);
  const hasProfile = data?.userData?.hasProfile || !!data?.profile?.phone || false;

  useEffect(() => {
    if (data && !hasProfile) {
      setActiveTab('profile');
    }
  }, [data, hasProfile]);

  const [isGeneratingRef, setIsGeneratingRef] = useState(false);

  useEffect(() => {
    const existingCode = data?.userData?.referralCode || data?.userData?.referralcode;
    if (data && !existingCode && !isGeneratingRef) {
      const generateCode = async () => {
        setIsGeneratingRef(true);
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const baseName = data?.profile?.name || data?.user?.user_metadata?.name || 'USER';
          const newCode = baseName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          
          // Optimistic update
          mutate({ ...data, userData: { ...data.userData, referralCode: newCode, referralcode: newCode } }, false);
          
          const { data: updatedData, error } = await supabase.from('users').upsert({ 
            id: data.user.id,
            email: data.user.email,
            name: baseName,
            referralCode: newCode 
          }, { onConflict: 'id' }).select();
          
          if (error) {
            toast.error("Generation error: " + error.message);
          } else {
            toast.success("Generated referral code: " + newCode);
          }
          // Revalidate with server
          mutate();
        } catch (e: any) {
          toast.error("Failed to generate referral code: " + e.message);
        }
      };
      generateCode();
    }
  }, [data?.userData?.referralCode, data?.userData?.referralcode, data?.user?.id, data?.profile?.name, mutate, data, isGeneratingRef]);

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
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const parsedData = JSON.parse(savedTeacherData);
          const user = data?.user;
          if (!user) return;
          
          const { data: existingUser } = await supabase.from('users').select('referralCode').eq('id', user.id).single();
          const newCode = existingUser?.referralCode || (parsedData.fullName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
          await supabase.from('users').update({ hasProfile: true, referralCode: newCode }).eq('id', user.id);

          await supabase.from('tutors').update({
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
          }).eq('id', user.id);
          localStorage.removeItem('teacherFormData');
          mutate();
        } catch (e) {
          console.error("Failed to silently submit profile data", e);
        }
      }
    };
    processSilentSubmission();
  }, [data?.user, mutate]);

  useEffect(() => {
    if (!data?.user) return;
    let channel: any;
    let supabaseInstance: any;
    const setupRealtime = async () => {
      const { createClient } = await import('@/utils/supabase/client');
      supabaseInstance = createClient();
      
      channel = supabaseInstance
        .channel(`teacher_applications_${data?.user?.id}_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'applications', filter: `tutorId=eq.${data?.user?.id}` },
          () => mutate()
        )
        .subscribe();
    };
    setupRealtime();

    return () => {
      if (channel && supabaseInstance) supabaseInstance.removeChannel(channel);
    };
  }, [data?.user, mutate]);

  const handleLogout = async () => {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    toast.success("Logged out successfully!");
    router.push('/login');
  };

  const handleSendOffer = async (student: any) => {
    const offerPrice = parseInt(negotiationOffer[student.id]);
    if (!offerPrice || offerPrice <= 0) return toast.error("Please enter a valid offer price.");

    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('applications').insert({
        tutorId: user?.id,
        tutorName: data?.profile?.name,
        requestId: student.id,
        parentId: student.parentId,
        studentId: student.studentId,
        studentName: student.studentName,
        currentOffer: offerPrice,
        initialBudget: student.budget,
        lastUpdatedBy: 'tutor',
        status: 'negotiating',
        source: 'direct',
        category: student.category,
        mode: student.mode,
        demoHours: student.preferredTimeRange || 'Flexible'
      });

      if (error) throw error;
      toast.success("Offer sent successfully!");
      mutate();
    } catch (e: any) {
      toast.error("Error sending offer: " + e.message);
    }
  };

  const handleNegotiationAction = async (appId: string, action: string, newOffer?: number, newSchedule?: string) => {
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      const updateData: any = {};
      if (action === 'accept_price') {
        updateData.status = 'scheduling';
        updateData.scheduleStatus = 'pending_tutor';
        updateData.finalPrice = newOffer;
      } else if (action === 'counter_price') {
        updateData.currentOffer = newOffer;
        updateData.lastUpdatedBy = 'tutor';
      } else if (action === 'propose_schedule') {
        updateData.scheduleStatus = 'pending_student';
        updateData.proposedSchedule = newSchedule;
      } else if (action === 'accept_schedule') {
        updateData.status = 'demo_pending_payment';
        updateData.proposedSchedule = newSchedule;
      }

      const { error } = await supabase.from('applications').update(updateData).eq('id', appId);
      if (error) throw error;
      toast.success(`Successfully ${action === 'accept_schedule' || action === 'accept_price' ? 'accepted deal' : 'sent counter offer'}!`);
      mutate();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  const handleWithdrawSubmit = async () => {
    if (!upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID');
      return;
    }
    setWithdrawLoading(true);
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const currentBalance = data?.userData?.walletBalance || 0;
      
      if (currentBalance < 1000) {
        throw new Error('Minimum withdrawal amount is ₹1000');
      }
      
      await supabase.from('withdrawals').insert({
        userId: data?.user?.id,
        amount: currentBalance,
        upiId: upiId,
        status: 'pending'
      });
      
      await supabase.from('users').update({ walletBalance: 0 }).eq('id', data?.user?.id);
      
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
    { id: 'find_students', label: 'Find Students', icon: Users },
    { id: 'negotiations', label: 'Negotiations', icon: MessageCircle },
    { id: 'my_students', label: 'My Students', icon: BookOpen },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-gradient-to-r from-[#063831] to-[#04241f] text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <img src={logo} alt="Mi Tutora Logo" className="h-8 w-auto object-contain" />
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
            <div className="flex flex-col justify-center">
              <img src={logo} alt="Mi Tutora Logo" className="h-12 w-auto object-contain object-left mb-1 -ml-2" />
              <p className="text-[#00a992] text-[11px] font-bold uppercase tracking-widest mt-2">Teacher Portal</p>
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

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <ActionModal {...modalConfig} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">Welcome back, {data?.profile?.name || 'Teacher'}!</h1>
                <p className="text-gray-500 max-w-md mx-auto text-lg">Your dashboard overview is currently being updated. In the meantime, use the sidebar to find students and manage your negotiations!</p>
              </div>
            )}

            {/* TAB: FIND STUDENTS */}
            {activeTab === 'find_students' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Find Students</h2>
                
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
                  {data?.availableStudents?.filter((s:any) => data?.teacherCategories?.length > 1 ? s.category === subTab : true).map((student: any) => {
                    const hasNegotiation = data?.applications?.some((app: any) => app.requestId === student.id && ['negotiating'].includes(app.status));
                    const isPending = data?.applications?.some((app: any) => app.requestId === student.id && ['demo_pending_payment', 'demo_booked', 'scheduling'].includes(app.status));
                    const isHired = data?.applications?.some((app: any) => app.requestId === student.id && ['tuition_started'].includes(app.status));
                    
                    if (hasNegotiation) return null; // Don't show students we are already negotiating with

                    return (
                      <div key={student.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{student.studentName || 'Student Request'}</h3>
                            <p className="text-sm font-medium text-emerald-600">{student.category} • {student.board || student.mode}</p>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                            New
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                          {student.classLevel && <p><span className="text-gray-500 font-medium">Class:</span> <span className="font-semibold text-gray-900">{student.classLevel}</span></p>}
                          {student.category === 'programming' && (student.technologies?.length ?? 0) > 0 && <p><span className="text-gray-500 font-medium">Technologies:</span> <span className="font-semibold text-gray-900">{student.technologies.join(', ')}</span></p>}
                          {student.category === 'languages' && (student.languages?.length ?? 0) > 0 && <p><span className="text-gray-500 font-medium">Languages:</span> <span className="font-semibold text-gray-900">{student.languages.join(', ')}</span></p>}
                          {(!student.category || student.category === 'school') && (student.subjects?.length ?? 0) > 0 && <p><span className="text-gray-500 font-medium">Subjects:</span> <span className="font-semibold text-gray-900">{student.subjects.join(', ')}</span></p>}
                          {student.area && <p><span className="text-gray-500 font-medium">Location:</span> <span className="font-semibold text-gray-900">{student.area}</span></p>}
                          <p><span className="text-gray-500 font-medium">Budget:</span> <span className="font-black text-emerald-600 text-base">₹{student.budget}</span></p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Offer (₹/hr)</label>
                            <input 
                              type="number"
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50"
                              placeholder="e.g. 500"
                              value={negotiationOffer[student.id] || ''}
                              onChange={(e) => setNegotiationOffer({...negotiationOffer, [student.id]: e.target.value})}
                            />
                          </div>
                          {isHired ? (
                            <button disabled className="w-full bg-emerald-100 text-emerald-800 font-bold py-3 rounded-xl shadow-none text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                              <CheckCircle2 className="w-4 h-4" /> Already Your Student
                            </button>
                          ) : isPending ? (
                            <button disabled className="w-full bg-orange-100 text-orange-800 font-bold py-3 rounded-xl shadow-none text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                              Pending
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleSendOffer(student)}
                              className="w-full bg-[#063831] hover:bg-[#04241f] text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm flex items-center justify-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4" /> Send Proposal
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(!data?.availableStudents || data?.availableStudents?.filter((s:any) => data?.teacherCategories?.length > 1 ? s.category === subTab : true).length === 0) && (
                    <div className="col-span-full p-10 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                      <Users className="w-12 h-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-bold text-gray-900">No matching students found</h3>
                      <p className="text-gray-500 max-w-sm mt-2">We'll notify you when new students matching your profile requirements post a request.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
                    {/* TAB: NEGOTIATIONS */}
            {activeTab === 'negotiations' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Negotiations & Scheduling</h2>
                
                {(data?.negotiations?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {data?.negotiations?.map((neg: any) => (
                      <div key={neg.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{neg.studentName}</h4>
                          <p className="text-sm text-gray-500 mb-1">{neg.category}</p>
                          {neg.category === 'programming' && neg.technologies && neg.technologies.length > 0 && <p className="text-sm font-medium text-emerald-600">Technologies: {neg.technologies.join(', ')}</p>}
                          {neg.category === 'languages' && neg.languages && neg.languages.length > 0 && <p className="text-sm font-medium text-emerald-600">Languages: {neg.languages.join(', ')}</p>}
                          {(!neg.category || neg.category === 'school') && neg.subjects && neg.subjects.length > 0 && <p className="text-sm font-medium text-emerald-600">Subjects: {neg.subjects.join(', ')}</p>}
                          {neg.status === 'scheduling' && (
                            <div className="mt-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <p><span className="font-bold">Student requested:</span> {neg.demoHours}</p>
                              {neg.proposedSchedule && <p><span className="font-bold text-emerald-700">You Proposed:</span> {neg.proposedSchedule}</p>}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mt-4 sm:mt-0 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                          <div className="text-center w-full sm:w-auto">
                            <p className="text-xs font-bold text-gray-400 uppercase">{neg.status === 'scheduling' ? 'Agreed Price' : 'Current Offer'}</p>
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
                              </div>
                            ) : (
                              <div className="w-full sm:w-auto bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">
                                <p className="text-sm font-semibold text-gray-600">Waiting for student response...</p>
                              </div>
                            )
                          )}

                          {/* Scheduling Logic */}
                          {neg.status === 'scheduling' && (
                            neg.scheduleStatus === 'pending_tutor' ? (
                              <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                                {neg.proposedSchedule && (
                                  <button 
                                    onClick={() => handleNegotiationAction(neg.id, 'accept_schedule', 0, neg.proposedSchedule)}
                                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
                                  >
                                    Accept Timings
                                  </button>
                                )}
                                <button 
                                  onClick={() => {
                                    setModalConfig({
                                      isOpen: true,
                                      type: 'timing',
                                      title: 'Propose Timings',
                                      description: 'Suggest your preferred class timings.',
                                      placeholder: 'e.g. Mon & Wed 5 PM - 6 PM',
                                      initialValue: neg.proposedSchedule || '',
                                      onSubmit: (val: string) => {
                                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                                        handleNegotiationAction(neg.id, 'propose_schedule', 0, val);
                                      }
                                    });
                                  }}
                                  className="w-full sm:w-auto bg-[#063831] hover:bg-[#04241f] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md"
                                >
                                  {neg.proposedSchedule ? 'Change Timings' : 'Propose Timings'}
                                </button>
                              </div>
                            ) : (
                              <div className="w-full sm:w-auto bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">
                                <p className="text-sm font-semibold text-gray-600">Waiting for student to confirm timings...</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">No active negotiations.</p>
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
                <TeacherForm isDashboard={true} hasProfile={hasProfile} />
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

      </main>
    </div>
  );
}
