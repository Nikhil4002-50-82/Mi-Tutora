"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { motion } from 'motion/react';
import { BookOpen, Users, LayoutDashboard, LogOut, ShieldCheck, User, Gift, Lock, CheckCircle2, MessageCircle, Menu, X } from 'lucide-react';
import DemoForm from '@/components/DemoForm';
import ActionModal from '@/components/ActionModal';
import { toast } from 'sonner';
const logo = '/imports/logo.png';

import useSWR from 'swr';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [negotiationOffer, setNegotiationOffer] = useState<{ [key: string]: string }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'price' as 'price'|'timing', title: '', description: '', placeholder: '', initialValue: '', onSubmit: (val: string) => {} });
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
    
    const { data: userData } = await supabase.from('users').select('hasProfile, referralCode').eq('id', user.id).single();
    const { data: parentData } = await supabase.from('parents').select('*, students(*)').eq('id', user.id).single();
    const { data: applications } = await supabase.from('applications').select('*').eq('parentId', user.id);
    const { data: students } = await supabase.from('students').select('*').eq('parentId', user.id);
    const myStudent = students && students.length > 0 ? students[0] : null;
    const { data: requests } = await supabase.from('tuition_requests').select('*').eq('parentId', user.id);
    const myRequest = requests && requests.length > 0 ? requests[0] : null;
    const { data: availableTutors } = await supabase.from('tutors').select('*').eq('hasProfile', true);

    const matchedTutors = availableTutors?.filter(tutor => {
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

    const { data: referrals } = await supabase.from('referrals').select('*').eq('referrerId', user.id);

    // Fetch tutor subjects for active applications
    const tutorIds = applications?.map(app => app.tutorId).filter(Boolean) || [];
    let tutorsInfo: any[] = [];
    if (tutorIds.length > 0) {
      const { data } = await supabase.from('tutors').select('id, subjects, technologies, languagesTaught').in('id', tutorIds);
      tutorsInfo = data || [];
    }

    const applicationsWithSubjects = applications?.map(app => {
      const tutor = tutorsInfo.find(t => t.id === app.tutorId);
      return { 
        ...app, 
        subjects: tutor?.subjects || [],
        technologies: tutor?.technologies || [],
        languagesTaught: tutor?.languagesTaught || []
      };
    }) || [];

    return {
      user,
      userData,
      profile: parentData,
      myStudent,
      myRequest,
      applications: applicationsWithSubjects,
      availableTeachers: matchedTutors,
      referrals: referrals || [],
      negotiations: applicationsWithSubjects.filter(app => ['negotiating', 'scheduling'].includes(app.status)),
      upcomingClasses: applicationsWithSubjects.filter(app => ['tuition_started', 'demo_booked', 'demo_pending_payment'].includes(app.status)).map(app => ({
        id: app.id,
        subject: app.category || 'General',
        teacher: app.tutorName || 'Assigned Tutor',
        date: app.nextPaymentDate || app.startDate || new Date().toISOString(),
        status: app.status
      }))
    };
  };

  const { data, error: swrError, isLoading: loading, mutate } = useSWR('studentDashboardData', fetcher);
  const hasProfile = data?.userData?.hasProfile || false;

  useEffect(() => {
    if (data && !hasProfile) {
      setActiveTab('profile');
    }
  }, [data, hasProfile]);

  useEffect(() => {
    const processSilentSubmission = async () => {
      const savedDemoData = localStorage.getItem('demoFormData');
      if (savedDemoData && data?.user) {
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const formData = JSON.parse(savedDemoData);
          const user = data?.user;
          if (!user) return;
          
          await supabase.from('users').update({ hasProfile: true }).eq('id', user.id);

          const { data: existingParent } = await supabase.from('parents').select('id').eq('id', user.id).single();
          if (!existingParent) {
            await supabase.from('parents').insert({ id: user.id, name: formData.parentName || formData.fullName });
          }

          const { data: newStudent } = await supabase.from('students').insert({
            parentId: user.id,
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
            specialRequirements: formData.requirements
          }).select('id').single();

          await supabase.from('tuition_requests').insert({
            parentId: user.id,
            studentId: newStudent?.id,
            category: formData.category || '',
            studentName: formData.fullName,
            classLevel: formData.classGrade,
            board: formData.board,
            subjects: formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : [],
            budget: parseInt(formData.budget) || 0,
            mode: formData.demoMode,
            preferredTimeRange: formData.hours,
            area: formData.address,
            status: 'open'
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
    let channel: any;
    let supabaseInstance: any;
    const setupRealtime = async () => {
      const { createClient } = await import('@/utils/supabase/client');
      supabaseInstance = createClient();
      
      channel = supabaseInstance
        .channel(`student_applications_${data?.user?.id}_${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'applications', filter: `parentId=eq.${data?.user?.id}` },
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

  const handleRequestTutor = async (tutor: any) => {
    const offerPrice = parseInt(negotiationOffer[tutor.id]);
    if (!offerPrice || offerPrice <= 0) return toast.error("Please enter a valid budget offer.");

    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('applications').insert({
        tutorId: tutor.id,
        tutorName: tutor.name,
        parentId: user?.id,
        studentId: data?.myStudent?.id,
        studentName: data?.myStudent?.name || 'Student',
        currentOffer: offerPrice,
        initialBudget: data?.myStudent?.budget || offerPrice,
        lastUpdatedBy: 'student',
        status: 'negotiating',
        source: 'direct',
        category: tutor.category,
        mode: tutor.mode,
        demoHours: data?.myRequest?.preferredTimeRange || 'Flexible'
      });

      if (error) throw error;
      toast.success("Tutor request & offer sent successfully!");
      mutate();
    } catch (e: any) {
      toast.error("Error sending request: " + e.message);
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
        updateData.lastUpdatedBy = 'student';
      } else if (action === 'propose_schedule') {
        updateData.scheduleStatus = 'pending_tutor';
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'find_tutors', label: 'Find Tutors', icon: Users },
    { id: 'negotiations', label: 'Negotiations', icon: MessageCircle },
    { id: 'my_teachers', label: 'My Teachers', icon: BookOpen },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'profile', label: 'Profile Settings', icon: User },
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
              <p className="text-[#00a992] text-[11px] font-bold uppercase tracking-widest mt-2">Student Portal</p>
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
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">Welcome back, {data?.myStudent?.name || 'Student'}!</h1>
                <p className="text-gray-500 max-w-md mx-auto text-lg">Your dashboard overview is currently being updated. In the meantime, use the sidebar to find tutors and manage your negotiations!</p>
              </div>
            )}

            {/* TAB: FIND TUTORS */}
            {activeTab === 'find_tutors' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Find Your Perfect Tutor</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.availableTeachers?.map((teacher: any) => {
                    const hasNegotiation = data?.applications?.some((app: any) => app.tutorId === teacher.id && ['negotiating'].includes(app.status));
                    const isPending = data?.applications?.some((app: any) => app.tutorId === teacher.id && ['demo_pending_payment', 'demo_booked', 'scheduling'].includes(app.status));
                    const isHired = data?.applications?.some((app: any) => app.tutorId === teacher.id && ['tuition_started'].includes(app.status));
                    
                    if (hasNegotiation) return null; // Already negotiating
                    
                    return (
                      <div key={teacher.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-[#00a992]/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                            {teacher.mode || 'Online'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden leading-relaxed">{teacher.teachingApproach || 'Experienced Tutor'}</p>
                        <div className="space-y-2 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          {teacher.category === 'programming' && (teacher.technologies?.length ?? 0) > 0 && <p><strong className="text-gray-700">Technologies:</strong> {teacher.technologies.join(', ')}</p>}
                          {teacher.category === 'languages' && (teacher.languagesTaught?.length ?? 0) > 0 && <p><strong className="text-gray-700">Languages:</strong> {teacher.languagesTaught.join(', ')}</p>}
                          {(!teacher.category || teacher.category === 'school') && (teacher.subjects?.length ?? 0) > 0 && <p><strong className="text-gray-700">Subjects:</strong> {teacher.subjects.join(', ')}</p>}
                          {teacher.experience && <p><strong className="text-gray-700">Experience:</strong> {teacher.experience}</p>}
                          <p><strong className="text-gray-700">Fee Range:</strong> <span className="text-emerald-600 font-bold">{teacher.feeRange || 'Negotiable'}</span></p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <div className="mb-4">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Offer (₹/hr)</label>
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
                              <CheckCircle2 className="w-4 h-4" /> Already Your Teacher
                            </button>
                          ) : isPending ? (
                            <button disabled className="w-full bg-orange-100 text-orange-800 font-bold py-3 rounded-xl shadow-none text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                              Pending
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleRequestTutor(teacher)}
                              className="w-full bg-[#00a992] text-white hover:bg-emerald-600 font-bold py-3 rounded-xl transition-colors shadow-md shadow-[#00a992]/20 flex items-center justify-center gap-2 text-sm"
                            >
                              <MessageCircle className="w-4 h-4" /> Request & Offer
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(!data?.availableTeachers || data?.availableTeachers?.length === 0) && (
                    <div className="col-span-full p-10 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                      <Users className="w-12 h-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-bold text-gray-900">No tutors found</h3>
                      <p className="text-gray-500 max-w-sm mt-2">We couldn't find tutors matching your exact requirements right now.</p>
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
                          <h4 className="font-bold text-lg text-gray-900">Tutor: {neg.tutorName}</h4>
                          <p className="text-sm text-gray-500 mb-1">{neg.category}</p>
                          {neg.category === 'programming' && neg.technologies && neg.technologies.length > 0 && <p className="text-sm font-medium text-emerald-600">Technologies: {neg.technologies.join(', ')}</p>}
                          {neg.category === 'languages' && neg.languagesTaught && neg.languagesTaught.length > 0 && <p className="text-sm font-medium text-emerald-600">Languages: {neg.languagesTaught.join(', ')}</p>}
                          {(!neg.category || neg.category === 'school') && neg.subjects && neg.subjects.length > 0 && <p className="text-sm font-medium text-emerald-600">Subjects: {neg.subjects.join(', ')}</p>}
                          {neg.status === 'scheduling' && (
                            <div className="mt-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <p><span className="font-bold">You requested:</span> {neg.demoHours}</p>
                              {neg.proposedSchedule && <p><span className="font-bold text-emerald-700">Tutor Proposed:</span> {neg.proposedSchedule}</p>}
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
                              </div>
                            ) : (
                              <div className="w-full sm:w-auto bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">
                                <p className="text-sm font-semibold text-gray-600">Waiting for tutor response...</p>
                              </div>
                            )
                          )}

                          {/* Scheduling Logic */}
                          {neg.status === 'scheduling' && (
                            neg.scheduleStatus === 'pending_student' ? (
                              <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                                <button 
                                  onClick={() => handleNegotiationAction(neg.id, 'accept_schedule', 0, neg.proposedSchedule)}
                                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md"
                                >
                                  Accept Timings
                                </button>
                                <button 
                                  onClick={() => {
                                    setModalConfig({
                                      isOpen: true,
                                      type: 'timing',
                                      title: 'Propose Timings',
                                      description: 'Suggest your preferred class timings.',
                                      placeholder: 'e.g. Mon, Wed, Fri 6PM-7PM',
                                      initialValue: neg.proposedSchedule || '',
                                      onSubmit: (val: string) => {
                                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                                        handleNegotiationAction(neg.id, 'propose_schedule', 0, val);
                                      }
                                    });
                                  }}
                                  className="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-emerald-500 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm"
                                >
                                  Change Timings
                                </button>
                              </div>
                            ) : (
                              <div className="w-full sm:w-auto bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-center">
                                <p className="text-sm font-semibold text-gray-600">Waiting for tutor to propose timings...</p>
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
                            <p className="text-lg font-bold text-[#063831] truncate mb-1">{cls.subject}</p>
                            <p className="text-sm font-medium text-gray-500">Tutor: <span className="text-gray-900 font-bold">{cls.teacher}</span></p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                              cls.status === 'confirmed' || cls.status === 'tuition_started'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {cls.status === 'demo_pending_payment' ? 'Pay Demo Fee' : cls.status}
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
                  <div className="relative z-10 max-w-lg">
                    <h3 className="text-2xl font-black mb-4">Invite Friends</h3>
                    <p className="text-gray-300 mb-8 text-lg">Share your unique referral code. Earn rewards when they book their first class!</p>
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl inline-block">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Referral Code</p>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-black tracking-widest">{data?.userData?.referralCode || 'GENERATING...'}</span>
                        <button className="bg-white text-[#063831] px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                          Copy
                        </button>
                      </div>
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
                    <Lock className="w-4 h-4" /> Please submit a demo request profile to unlock the rest of your dashboard!
                  </div>
                )}
                <DemoForm isDashboard={true} hasProfile={hasProfile} />
              </div>
            )}

          </motion.div>
        </div>

      </main>
    </div>
  );
}
