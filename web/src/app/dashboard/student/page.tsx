"use client";

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import axios from 'axios';
import { motion } from 'motion/react';
import { Home, Search, BookOpen, Clock, Settings, LogOut, ChevronRight, Star, Calendar, MapPin, Users, Video, CreditCard, ChevronDown, CheckCircle2, XCircle, FileText, ArrowRight, Activity, Bell, Filter, Edit2, PlayCircle, Plus, Info, Zap, Shield, Lock, Trash2, X, CalendarDays, LayoutDashboard, ShieldCheck, User, Gift, MessageCircle, Menu, Globe, Banknote, Handshake, AlertCircle, AlertTriangle, FileImage, Phone, Mail, GraduationCap, ArrowLeft, Loader2, Copy, Wallet } from 'lucide-react';

import GroupManager from '@/components/GroupManager';
import DemoForm from '@/components/DemoForm';
import LoadingScreen from '@/components/ui/LoadingScreen';
import ActionModal from '@/components/ActionModal';
import MessageModal from '@/components/MessageModal';
import GroupSettingsModal from '@/components/GroupSettingsModal';
import { generateReferralCode } from '@/utils/referral';
import { calculateSuitabilityScore, doesClassMatch } from '@/utils/matching';
import { toast } from 'sonner';
const logo = '/imports/logo.png';

import useSWR from 'swr';
import { fetchStudentDashboardData } from '@/api/dashboardApi';
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

export default function StudentDashboard() {
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
  const [negotiationOffer, setNegotiationOffer] = useState<{ [key: string]: string }>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
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
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'price'|'timing'|'demo_booking', title: string, description: string, placeholder: string, initialValue: string, initialDate?: string, initialTime?: string, min?: number, max?: number, isOnline?: boolean, onSubmit: (val: string, date?: string, time?: string) => void }>({ isOpen: false, type: 'price', title: '', description: '', placeholder: '', initialValue: '', onSubmit: () => {} });
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

  const [modifiedGroupQueue, setModifiedGroupQueue] = useState<string[]>([]);
  const [showPreferencesPrompt, setShowPreferencesPrompt] = useState(false);
  const [pendingGroupSaveData, setPendingGroupSaveData] = useState<any[]>([]);
  const [isSavingGroups, setIsSavingGroups] = useState(false);
  const [viewingGroupDetails, setViewingGroupDetails] = useState<any>(null);
  
  const [groupSettingsModalOpen, setGroupSettingsModalOpen] = useState(false);
  const [selectedGroupForSettings, setSelectedGroupForSettings] = useState<any>(null);
  const [newlyCreatedGroupId, setNewlyCreatedGroupId] = useState<string | null>(null);
  const [actionConfirmModal, setActionConfirmModal] = useState<{isOpen: boolean, type: 'hire'|'reject', appId: string, teacherName: string} | null>(null);
  const router = useRouter();

  const { data, error: swrError, isLoading: loading, mutate } = useSWR(
    'studentDashboardData', 
    fetchStudentDashboardData,
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
        router.push('/dashboard/teacher');
      }
    }
  }, [swrError, router]);


  const allStudents = data?.students || (data?.myStudent ? [data.myStudent] : []);
  
  const hasPendingDues = useMemo(() => {
    if (!data?.upcomingClasses) return false;
    return data.upcomingClasses.some((cls: any) => {
      if (cls.status !== 'tuition_started') return false;
      if (cls.feePaid === true) return false;
      const daysElapsed = Math.max(1, Math.ceil((Date.now() - (cls.startDate || Date.now())) / (1000 * 60 * 60 * 24)));
      return daysElapsed >= 7;
    });
  }, [data?.upcomingClasses]);
  
  const studentGroups = useMemo(() => {
    const acc: any = {};
    allStudents.forEach((student: any) => {
      const gId = student.groupId || `indv_${student.id}`;
      if (!acc[gId]) acc[gId] = { id: gId, students: [], totalBudget: 0, categories: [] };
      acc[gId].students.push(student);
      acc[gId].totalBudget += (parseInt(student.budget) || 0);
      acc[gId].categories.push(student.category);
    });
    return Object.values(acc)
      .filter((g: any) => g.id !== 'unassigned')
      .sort((a: any, b: any) => {
        const aTime = Math.min(...a.students.map((s:any) => s.createdAt || 0));
        const bTime = Math.min(...b.students.map((s:any) => s.createdAt || 0));
        return aTime - bTime;
      })
      .map((g: any) => ({
        ...g,
        name: g.students.length === 1 ? g.students[0].name : `Group: ${g.students.map((s:any)=>s.name).join(', ')}`,
        category: g.categories[0]
      }));
  }, [allStudents]);

  const executeGroupSave = async (saveData: any[], openModalAfter: boolean) => {
    setIsSavingGroups(true);
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, getDoc, updateDoc, collection, setDoc, getDocs, query, where, deleteDoc } = await import('firebase/firestore');
      const { syncTuitionRequestForGroup } = await import('@/utils/groupUtils');
      
      const newGroupIds = new Set<string>();

      for (const student of saveData) {
        await updateDoc(doc(db, 'students', student.id), {
          groupId: student.groupId
        });
        if (student.groupId) {
          newGroupIds.add(student.groupId);
        }
      }
      
      for (const groupId of Array.from(newGroupIds)) {
          const groupRef = doc(db, 'groups', groupId);
          const groupSnap = await getDoc(groupRef);
          
          if (!groupSnap.exists()) {
            const sampleStudent = saveData.find(s => s.groupId === groupId);
            const oldStudentData = allStudents.find((s:any) => s.id === sampleStudent?.id);
            let oldGroupData: any = {};
            if (oldStudentData && oldStudentData.groupId) {
              const oldGroupSnap = await getDoc(doc(db, 'groups', oldStudentData.groupId));
              if (oldGroupSnap.exists()) oldGroupData = oldGroupSnap.data();
            }
            
            await setDoc(groupRef, {
                id: groupId,
                parentId: data?.user?.uid,
                mode: oldGroupData.mode || '',
                area: oldGroupData.area || '',
                city: oldGroupData.city || '',
                latitude: oldGroupData.latitude || null,
                longitude: oldGroupData.longitude || null,
                teacherGenderPreference: oldGroupData.teacherGenderPreference || 'No Preference',
                preferredTimeRange: oldGroupData.preferredTimeRange || '',
                daysPerWeek: oldGroupData.daysPerWeek || '',
                specificDays: oldGroupData.specificDays || [],
                createdAt: Date.now(),
                status: 'active'
            });
            setNewlyCreatedGroupId(groupId);
          }
          
          const groupStudents = saveData.filter(s => s.groupId === groupId).map(s => s.id);
          await updateDoc(groupRef, { studentIds: groupStudents });
          await syncTuitionRequestForGroup(db, groupId, (data?.user?.uid || '') as string);
      }

      const allGroupsQuery = query(collection(db, 'groups'), where('parentId', '==', data?.user?.uid));
      const allGroupsSnap = await getDocs(allGroupsQuery);
      for (const groupDoc of allGroupsSnap.docs) {
          const reqData = groupDoc.data();
          if (reqData.id && !newGroupIds.has(reqData.id)) {
            await deleteDoc(doc(db, 'groups', reqData.id));
            const requestQuery = query(collection(db, 'tuition_requests'), where('groupId', '==', reqData.id));
            const requestSnap = await getDocs(requestQuery);
            for(const r of requestSnap.docs) await deleteDoc(r.ref);
          }
      }

      toast.success("Groups updated successfully!");
      mutate();
      
      if (openModalAfter && modifiedGroupQueue.length > 0) {
        const nextGroupId = modifiedGroupQueue[0];
        const nextGroup = studentGroups.find((g:any) => g.id === nextGroupId) || { id: nextGroupId, name: `Group` };
        const requestDoc = data?.groups?.find((g: any) => g.id === nextGroupId) || data?.tuitionRequests?.find((req: any) => req.groupId === nextGroupId) || data?.myRequest;
        setSelectedGroupForSettings({ ...nextGroup, requestDoc });
        setGroupSettingsModalOpen(true);
      } else {
        setModifiedGroupQueue([]);
        setActiveTab('profile');
      }
    } catch (error) {
      console.error("Error saving groups:", error);
      toast.error("Failed to save group changes.");
    } finally {
      setIsSavingGroups(false);
    }
  };

  useEffect(() => {
    if (newlyCreatedGroupId && studentGroups && studentGroups.length > 0) {
      const newGroup = studentGroups.find((g: any) => g.id === newlyCreatedGroupId);
      if (newGroup) {
        // We find the request doc for the new group from data (it may be stale, but the modal fetches/relies on group settings)
        setSelectedGroupForSettings({ ...newGroup, requestDoc: { groupId: newlyCreatedGroupId } });
        setGroupSettingsModalOpen(true);
        setNewlyCreatedGroupId(null);
      }
    }
  }, [studentGroups, newlyCreatedGroupId]);

  const activeGroup = studentGroups.find(g => g.id === activeGroupId) || studentGroups[0] || null;
  const activeStudent = allStudents.find((s:any) => s.id === activeStudentId) || data?.myStudent || allStudents[0] || null;
  const scoringContext = activeGroup || activeStudent;

  const allTutorsWithScores = (data?.allTutors || []).filter((tutor: any) => {
      if (tutor.id === data?.userData?.id || (tutor.email && tutor.email === data?.userData?.email)) return false; // Prevent self-hiring
      const matchGroup = (app: any) => {
          if (app.groupId) return app.groupId === activeGroup?.id;
          return activeGroup?.students?.some((s:any) => s.id === app.studentId) || false;
      };
      const app = data?.applications?.find((app: any) => app.tutorId === tutor.id && matchGroup(app));
      if (app && app.status === 'tuition_started') return false;
      return true;
  }).map((tutor: any) => {
    const getDetail = (obj: any, field: string) => obj?.[field] || (obj?.students && obj.students[0] ? obj.students[0][field] : '') || '';
    const studentBudget = parseFloat(scoringContext?.budget || scoringContext?.totalBudget || scoringContext?.combinedBudget || getDetail(scoringContext, 'budget') || 0);
    const teacherFee = parseFloat(tutor.feeRange || tutor.minFee || 0);
    return {
      ...tutor,
      suitabilityScore: calculateSuitabilityScore(scoringContext, tutor),
      budgetDifference: Math.abs(studentBudget - teacherFee)
    };
  }).sort((a: any, b: any) => {
      const getStatus = (tutorId: string) => {
          const matchGroup = (app: any) => {
              if (app.groupId) return app.groupId === activeGroup?.id;
              return activeGroup?.students?.some((s:any) => s.id === app.studentId) || false;
          };
          const app = data?.applications?.find((app: any) => app.tutorId === tutorId && matchGroup(app));
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
  }).map((tutor: any, index: number) => ({
      ...tutor,
      rank: index + 1
  }));

  const computedRecommendedTutors = allTutorsWithScores.filter((tutor: any) => {
      if (tutor.suitabilityScore <= 0) return false;
      
      const getDetail = (obj: any, field: string) => obj[field] || (obj.students && obj.students[0] ? obj.students[0][field] : '') || '';
      
      const studentCat = getDetail(scoringContext, 'category').toLowerCase().trim();
      const teacherCats = tutor.category ? tutor.category.toLowerCase().split(',').map((c: string) => c.trim()) : [];
      if (studentCat && !teacherCats.includes(studentCat)) return false;

      if (studentCat === 'school') {
          const studentBoard = getDetail(scoringContext, 'board').toLowerCase().trim();
          const teacherBoards = (tutor.boards || []).map((b: string) => b.toLowerCase().trim());
          if (studentBoard && !teacherBoards.includes(studentBoard)) return false;

          const studentClass = (getDetail(scoringContext, 'classLevel') || getDetail(scoringContext, 'classGrade')).toLowerCase().trim();
          const teacherClasses = (tutor.classes || []).map((c: string) => c.toLowerCase().trim());
          if (!doesClassMatch(studentClass, teacherClasses)) return false;
      }

      const activeGroupDoc = data?.groups?.find((g: any) => g.id === activeGroup?.id) || data?.tuitionRequests?.find((req: any) => req.groupId === activeGroup?.id);
      const genderPref = activeGroupDoc?.teacherGenderPreference || scoringContext?.teacherGenderPreference;
      if (genderPref && genderPref !== 'No Preference') {
          if (tutor.gender !== genderPref) return false;
      }

      let studentNeeds: string[] = [];
      let teacherOffers: string[] = [];
      
      if (studentCat === 'school') {
        studentNeeds = getDetail(scoringContext, 'subjects') || getDetail(scoringContext, 'combinedSubjects') || [];
        teacherOffers = tutor.subjects || [];
      } else if (studentCat === 'programming') {
        studentNeeds = getDetail(scoringContext, 'technologies') || getDetail(scoringContext, 'combinedTechnologies') || [];
        teacherOffers = tutor.technologies || [];
      } else if (studentCat === 'languages') {
        studentNeeds = getDetail(scoringContext, 'languages') || getDetail(scoringContext, 'combinedLanguages') || [];
        teacherOffers = tutor.languagesTaught || tutor.languages || [];
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

  const computedRecommendedNegotiations = data?.allNegotiations?.filter((app:any) => computedRecommendedTutors.some((t:any) => t.id === app.tutorId)) || [];

  const hasProfile = allStudents.length > 0;

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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dailyRequestsCount = data?.applications?.filter((app: any) => app.initiator === 'student' && app.createdAt >= todayStart.getTime()).length || 0;

  const handleRequestTutor = async (tutor: any) => {
    if (dailyRequestsCount >= 5) {
      toast.error("You have reached your daily limit of 5 requests.");
      return;
    }
    const pendingStatuses = ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked'];
    const studentPendingCount = data?.applications?.filter((app: any) => pendingStatuses.includes(app.status)).length || 0;
    if (studentPendingCount >= 5) {
      setMessageModalConfig({ isOpen: true, title: 'Queue Full', message: 'You already have 5 pending requests. Please wait for a response or cancel an existing request before sending a new one.' });
      return;
    }
    const teacherLimit = tutor.isSubscribed ? 15 : 5;
    const teacherPendingCount = tutor.pendingRequests?.length || 0;
    if (teacherPendingCount >= teacherLimit) {
      toast.error("This teacher's queue is currently full. Please try again later.");
      return;
    }
    if (requestLoading) return;

    const matchGroup = (app: any) => {
      if (app.groupId) return app.groupId === activeGroup?.id;
      return activeGroup?.students?.some((s:any) => s.id === app.studentId) || false;
    };
    
    const activeAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
    
    if (activeAppForGroup) {
      toast.error("This group already has an active demo request in progress. Please wait for a response or decline the current request before requesting another tutor.");
      return;
    }
    const offerPrice = parseInt(negotiationOffer[tutor.id]);
    if (!offerPrice || offerPrice <= 0) return toast.error("Please enter a valid budget offer.");
    
    const tutorPrice = getTutorBasePrice(tutor);
    if (tutorPrice > 0 && offerPrice > tutorPrice) {
      setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The maximum you can offer is Rs. ${tutorPrice} (100% of the teacher's base fee). Please adjust your offer.` });
      return;
    }
    if (tutorPrice > 0 && offerPrice < tutorPrice * 0.6) {
      setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The minimum you can offer is Rs. ${Math.ceil(tutorPrice * 0.6)} (60% of the teacher's base fee). Please adjust your offer.` });
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
      const { collection, addDoc, setDoc, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const { generateCustomId } = await import('@/utils/idGenerator');
      const user = auth.currentUser;
      
      const groupToUse = activeGroup;
      if (!groupToUse) {
        toast.error("Please add a student profile first.");
        setRequestLoading(false);
        return;
      }

      const appId = generateCustomId('APP');
      const appRef = doc(db, 'applications', appId);
      await setDoc(appRef, {
        id: appId,
        tutorId: tutor.id,
        tutorName: tutor.name,
        parentId: data?.profile?.id || user?.uid,
        groupId: groupToUse.id,
        studentIds: groupToUse.students.map((s: any) => s.id),
        studentName: groupToUse.name,
        currentOffer: offerPrice,
        initialBudget: tutorPrice > 0 ? tutorPrice : offerPrice,
        absoluteMin: tutorPrice > 0 ? Math.ceil(tutorPrice * 0.6) : Math.ceil(offerPrice * 0.6),
        absoluteMax: tutorPrice > 0 ? tutorPrice : offerPrice,
        initiator: 'student',
        lastUpdatedBy: 'student',
        status: 'negotiating',
        source: 'direct',
        category: tutor.category || groupToUse.category || '',
        mode: tutor.mode,
        demoHours: data?.myRequest?.preferredTimeRange || 'Flexible',
        createdAt: Date.now()
      });

      // Update the teacher's pending request queue
      await updateDoc(doc(db, 'tutors', tutor.id), {
        pendingRequests: arrayUnion(appRef.id)
      });
      // Update the students' pending request queue
      for (const s of groupToUse.students) {
        await updateDoc(doc(db, 'students', s.id), {
          pendingRequests: arrayUnion(appRef.id)
        });
      }

      toast.success("Tutor request & offer sent successfully!");
      mutate();
    } catch (e: any) {
      toast.error("Error sending request: " + e.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDirectRequestDemo = async (tutor: any) => {
    if (dailyRequestsCount >= 5) {
      toast.error("You have reached your daily limit of 5 requests.");
      return;
    }

    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const recentDemosCount = data?.applications?.filter((app: any) => 
      ['demo_requested_by_student', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(app.status) &&
      (Date.now() - (app.updatedAt || app.createdAt || 0) < SEVEN_DAYS)
    ).length || 0;

    if (recentDemosCount >= 2) {
      toast.error("You can only have up to 2 active demos in a 7-day period. Please complete or cancel your current demos first.");
      return;
    }
    const pendingStatuses = ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked'];
    const studentPendingCount = data?.applications?.filter((app: any) => pendingStatuses.includes(app.status)).length || 0;
    if (studentPendingCount >= 5) {
      setMessageModalConfig({ isOpen: true, title: 'Queue Full', message: 'You already have 5 pending requests. Please wait for a response or cancel an existing request before sending a new one.' });
      return;
    }
    const teacherLimit = tutor.isSubscribed ? 15 : 5;
    const teacherPendingCount = tutor.pendingRequests?.length || 0;
    if (teacherPendingCount >= teacherLimit) {
      toast.error("This teacher's queue is currently full. Please try again later.");
      return;
    }
    if (requestLoading) return;

    const matchGroup = (app: any) => {
      if (app.groupId) return app.groupId === activeGroup?.id;
      return activeGroup?.students?.some((s:any) => s.id === app.studentId) || false;
    };
    
    const activeAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
    
    if (activeAppForGroup) {
      toast.error("This group already has an active demo request in progress. Please wait for a response or decline the current request before requesting another tutor.");
      return;
    }
    try {
      setRequestLoading(true);
      const { db, auth } = await import('@/utils/firebase/client');
      const { collection, setDoc, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
      const { generateCustomId } = await import('@/utils/idGenerator');
      const user = auth.currentUser;
      
      const groupToUse = activeGroup;
      if (!groupToUse) {
        toast.error("Please add a student profile first.");
        setRequestLoading(false);
        return;
      }

      const tutorPrice = getTutorBasePrice(tutor);

      const appId = generateCustomId('APP');
      const appRef = doc(db, 'applications', appId);
      await setDoc(appRef, {
        id: appId,
        tutorId: tutor.id,
        tutorName: tutor.name,
        parentId: data?.profile?.id || user?.uid,
        groupId: groupToUse.id,
        studentIds: groupToUse.students.map((s: any) => s.id),
        studentName: groupToUse.name,
        currentOffer: tutorPrice,
        finalPrice: tutorPrice,
        initialBudget: tutorPrice > 0 ? tutorPrice : 500,
        absoluteMin: tutorPrice > 0 ? Math.ceil(tutorPrice * 0.6) : 300,
        absoluteMax: tutorPrice > 0 ? tutorPrice : 500,
        initiator: 'student',
        lastUpdatedBy: 'student',
        status: 'demo_requested_by_student',
        source: 'direct',
        category: tutor.category || groupToUse.category || '',
        mode: tutor.mode,
        demoHours: data?.myRequest?.preferredTimeRange || 'Flexible',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Update the teacher's pending request queue
      await updateDoc(doc(db, 'tutors', tutor.id), {
        pendingRequests: arrayUnion(appRef.id)
      });
      // Update the students' pending request queue
      for (const s of groupToUse.students) {
        await updateDoc(doc(db, 'students', s.id), {
          pendingRequests: arrayUnion(appRef.id)
        });
      }

      toast.success("Demo requested successfully!");
      mutate();
    } catch (e: any) {
      toast.error("Error requesting demo: " + e.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleNegotiationAction = async (appId: string, action: string, newOffer?: number, neg?: any) => {
    if (['request_demo', 'accept_demo'].includes(action)) {
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
      const recentDemosCount = data?.applications?.filter((app: any) => 
        ['demo_requested_by_student', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(app.status) &&
        (Date.now() - (app.updatedAt || app.createdAt || 0) < SEVEN_DAYS)
      ).length || 0;

      if (recentDemosCount >= 2) {
        toast.error("You can only have up to 2 active demos in a 7-day period. Please complete or cancel your current demos first.");
        return;
      }
    }

    if (action === 'counter_price' && newOffer && neg) {
      const maxAllowed = neg.absoluteMax || (neg.initialBudget || 0);
      const minAllowed = neg.absoluteMin || Math.ceil((neg.initialBudget || 0) * 0.6);
      if (newOffer > maxAllowed) {
        setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The absolute maximum you can offer is Rs. ${maxAllowed}. Please adjust your offer.` });
        return;
      }
      if (newOffer < minAllowed) {
        setMessageModalConfig({ isOpen: true, title: 'Invalid Offer', message: `The absolute minimum you can offer is Rs. ${minAllowed}. Please adjust your offer.` });
        return;
      }
    }
    
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc, arrayRemove } = await import('firebase/firestore');
      
      const updateData: any = {};
      let isFinalState = false;
      if (action === 'accept_price' || action === 'request_demo') {
        updateData.status = 'demo_requested_by_student';
        if (newOffer) updateData.finalPrice = newOffer;
        updateData.lastUpdatedBy = 'student';
      } else if (action === 'accept_demo') {
        updateData.status = 'demo_pending_payment';
        updateData.lastUpdatedBy = 'student';
      } else if (action === 'propose_demo_date') {
        updateData.proposedDate = neg?.proposedDate;
        updateData.proposedTime = neg?.proposedTime;
        updateData.lastUpdatedBy = 'student';
      } else if (action === 'accept_demo_date') {
        updateData.status = 'demo_scheduled';
        updateData.demoDate = neg?.proposedDate || data?.applications?.find((a:any)=>a.id===appId)?.proposedDate;
        updateData.demoTime = neg?.proposedTime || data?.applications?.find((a:any)=>a.id===appId)?.proposedTime;
        updateData.lastUpdatedBy = 'student';
      } else if (action === 'counter_price') {
        updateData.currentOffer = newOffer;
        updateData.lastUpdatedBy = 'student';
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

  const handleAppointTutor = async (appId: string) => {
    try {
      const { db } = await import('@/utils/firebase/client');
      const { doc, updateDoc, arrayRemove, getDocs, query, collection, where, addDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'applications', appId), { 
        status: 'tuition_started', 
        startDate: Date.now(),
        feePaid: false
      });
      
      const app = data?.applications?.find((a: any) => a.id === appId);
      if (app) {
        if (app.tutorId) await updateDoc(doc(db, 'tutors', app.tutorId), { pendingRequests: arrayRemove(appId) });
        if (app.studentIds) {
          for (const sid of app.studentIds) {
            await updateDoc(doc(db, 'students', sid), { pendingRequests: arrayRemove(appId) });
          }
        }
        
        const qGroupId = app.groupId || app.studentId;
        if (qGroupId) {
          const otherAppsSnap1 = await getDocs(query(collection(db, 'applications'), where('groupId', '==', qGroupId)));
          const otherAppsSnap2 = await getDocs(query(collection(db, 'applications'), where('studentId', '==', qGroupId)));
          
          const docsToProcess = new Map();
          otherAppsSnap1.docs.forEach(d => docsToProcess.set(d.id, d));
          otherAppsSnap2.docs.forEach(d => docsToProcess.set(d.id, d));
          
          for (const [docId, docSnap] of Array.from(docsToProcess.entries())) {
             if (docId !== appId && docSnap.data().status !== 'declined' && docSnap.data().status !== 'tuition_started') {
                await updateDoc(doc(db, 'applications', docId), {
                   status: 'declined',
                   reason: 'student_hired_another_tutor',
                   declinedAt: Date.now(),
                   updatedAt: Date.now()
                });
                const d = docSnap.data();
                if (d.tutorId) {
                   await updateDoc(doc(db, 'tutors', d.tutorId), { pendingRequests: arrayRemove(docId) });
                   const { addDoc } = await import('firebase/firestore');
                   await addDoc(collection(db, 'notifications'), {
                      userId: d.tutorId,
                      type: 'application_declined',
                      title: 'Update on Student Lead',
                      message: 'This student has hired another tutor',
                      read: false,
                      createdAt: Date.now(),
                      applicationId: docId,
                      role: 'teacher'
                   }).catch(console.error);
                }
             }
          }
        }
      }
      
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
      const { doc, updateDoc, collection, query, where, getDocs, getDoc, arrayRemove } = await import('firebase/firestore');
      
      const coursePrice = payingClass.finalPrice || payingClass.currentOffer || payingClass.budget || 4000;
      const totalToPay = coursePrice + Math.round(coursePrice * 0.18);
      
      const walletBalance = data?.userData?.walletBalance || 0;
      
      // Deduct wallet if used
      if (useWallet && walletBalance > 0) {
        const usedAmount = Math.min(totalToPay, walletBalance);
        await updateDoc(doc(db, 'users', data?.user?.uid as string), { walletBalance: walletBalance - usedAmount });
      }

      if (payingClass.isRemoval) {
        await updateDoc(doc(db, 'applications', payingClass.id), { 
          status: 'declined', 
          feePaid: true,
          updatedAt: Date.now()
        });
      } else {
        await updateDoc(doc(db, 'applications', payingClass.id), { 
          status: 'tuition_started', 
          feePaid: true,
          updatedAt: Date.now()
        });
      }

      // Note: We no longer auto-decline other applications here because hiring (which auto-declines) happens earlier.

      const qGroupId = payingClass.groupId || payingClass.studentId;
      if (qGroupId) {
          const otherAppsSnap1 = await getDocs(query(collection(db, 'applications'), where('groupId', '==', qGroupId)));
          const otherAppsSnap2 = await getDocs(query(collection(db, 'applications'), where('studentId', '==', qGroupId)));
          
          const docsToProcess = new Map();
          otherAppsSnap1.docs.forEach(d => docsToProcess.set(d.id, d));
          otherAppsSnap2.docs.forEach(d => docsToProcess.set(d.id, d));
          
          for (const [docId, docSnap] of Array.from(docsToProcess.entries())) {
             if (docId !== payingClass.id && docSnap.data().status !== 'declined' && docSnap.data().status !== 'tuition_started') {
                await updateDoc(doc(db, 'applications', docId), {
                   status: 'declined',
                   reason: 'student_hired_another_tutor',
                   declinedAt: Date.now(),
                   updatedAt: Date.now()
                });
                const d = docSnap.data();
                if (d.tutorId) {
                   await updateDoc(doc(db, 'tutors', d.tutorId), { pendingRequests: arrayRemove(docId) });
                   const { addDoc } = await import('firebase/firestore');
                   await addDoc(collection(db, 'notifications'), {
                      userId: d.tutorId,
                      type: 'application_declined',
                      title: 'Update on Student Lead',
                      message: 'This student has hired another tutor',
                      read: false,
                      createdAt: Date.now(),
                      applicationId: docId,
                      role: 'teacher'
                   }).catch(console.error);
                }
             }
          }
      }

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
        <div className="h-[88px] px-6 border-b border-white/10 flex flex-col justify-center items-start">
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
            {(data?.profile?.name || data?.user?.displayName || 'S').charAt(0)}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="font-bold text-sm truncate">{data?.profile?.name || data?.user?.displayName || 'Student'}</p>
            <p className="text-xs text-emerald-400 font-medium">Student Account</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      {showCategoryPopup && !hasProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 md:p-10 shadow-2xl max-w-lg w-full text-center">
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
            
            <div className="relative group cursor-pointer" ref={profileRef} onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 768) setIsProfileDropdownOpen(!isProfileDropdownOpen) }}>
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
                  {hasPendingDues && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-xl">
                          ⚠️
                        </div>
                        <div>
                          <h3 className="font-bold text-red-900 text-sm">Action Required: Pending Dues</h3>
                          <p className="text-red-700 text-xs font-medium mt-0.5">You have pending monthly fees. Please clear your dues in "My Teachers" to unlock booking features.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('my_teachers')}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
                      >
                        Go to My Teachers
                      </button>
                    </div>
                  )}
                  {/* Hero Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3 mb-2">
                        Hello {activeStudent?.name?.split(' ')[0] || data?.user?.displayName?.split(' ')[0] || 'Student'}! <span className="text-4xl animate-bounce origin-bottom-right">👋</span>
                      </h1>
                      <p className="text-slate-500 text-lg">Nice to have you back, what an exciting day! Get ready to continue your learning journey.</p>
                    </div>

                    {/* Profile Completeness Card */}
                    <div 
                      onClick={() => setActiveTab('profile')}
                      className="bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100/60 rounded-3xl p-5 shadow-lg shadow-emerald-900/5 md:w-80 flex-shrink-0 flex items-start gap-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-50">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-gray-900 text-sm tracking-tight">Strengthen your profile</p>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 leading-snug font-medium">You're {profileCompleteness}% there! Add missing details to stand out.</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-emerald-100/50 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-[#00a992] to-teal-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${profileCompleteness}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600">{profileCompleteness}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Split Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left: My Teachers */}
                    <div className="lg:col-span-2 space-y-4">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">My Teachers</h2>
                      
                      {myActiveTeachers.length === 0 ? (
                        <div className="bg-gradient-to-b from-white to-slate-50 border border-gray-100 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-sm min-h-[300px]">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100/50">
                            <BookOpen className="w-10 h-10 text-emerald-500" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">No teachers chosen yet</h3>
                          <p className="text-slate-500 max-w-sm mb-8 font-medium">Explore our catalog of verified tutors and find the perfect match to start your learning journey.</p>
                          <button 
                            onClick={() => setActiveTab('new_tuition')}
                            className="bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Globe className="w-5 h-5" /> Explore Teachers
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {myActiveTeachers.slice(0, 3).map((cls: any) => (
                            <div key={cls.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-bold text-lg flex-shrink-0 border border-emerald-100/50 shadow-sm">
                                  {cls.teacher?.charAt(0) || 'T'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 truncate tracking-tight">{cls.teacher}</h4>
                                  <p className="text-sm text-slate-500 truncate font-medium">{cls.subject}</p>
                                </div>
                              </div>
                              <button onClick={() => { if(cls.tutorDetails) setSelectedViewUser(cls.tutorDetails); else setActiveTab('my_teachers'); }} className="text-slate-700 font-bold text-sm bg-slate-100 px-5 py-2.5 rounded-xl hover:bg-slate-200 hover:text-slate-900 flex-shrink-0 transition-colors">
                                View
                              </button>
                            </div>
                          ))}
                          {myActiveTeachers.length > 3 && (
                            <button onClick={() => setActiveTab('my_teachers')} className="text-sm font-bold text-slate-500 hover:text-[#00a992] py-2 text-center w-full transition-colors">
                              View all {myActiveTeachers.length} teachers →
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Recommended Teachers */}
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recommended Teachers</h2>
                        {studentGroups.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Finding tutors for:</label>
                            <select 
                              className="w-32 sm:w-48 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-[#00a992] focus:outline-none focus:ring-1 focus:ring-[#00a992] truncate transition-colors hover:bg-slate-100 cursor-pointer"
                              value={activeGroupId || activeGroup?.id || ''}
                              onChange={(e) => setActiveGroupId(e.target.value)}
                            >
                              {studentGroups.map((g:any) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      
                      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        {computedRecommendedTutors.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-slate-500 text-sm font-medium">No recommendations yet.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50/50">
                            {computedRecommendedTutors.filter((tutor: any) => {
                               const matchGroup = (app: any) => {
                                 if (app.groupId) return app.groupId === activeGroup?.id;
                                 return activeGroup?.students?.some((s:any) => s.id === app.studentId) || false;
                               };
                               const isLocked = !!data?.applications?.find((app: any) => app.tutorId === tutor.id && matchGroup(app) && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                               return !isLocked;
                            }).slice(0, 4).map((tutor: any, index: number) => {
                              const matchGroup = (app: any) => {
                                if (app.groupId) return app.groupId === activeGroup?.id;
                                return activeGroup?.students?.some((s:any) => s.id === app.studentId) || false;
                              };
                              const activeAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                              const hiredAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && app.status === 'tuition_started');
                              const offerApp = activeAppForGroup?.tutorId === tutor.id ? activeAppForGroup : undefined;
                              
                              const teacherLimit = tutor.isSubscribed ? 15 : 5;
                              const teacherPendingCount = tutor.pendingRequests?.length || 0;
                              const isTeacherFull = teacherPendingCount >= teacherLimit;

                              const isLocked = !!activeAppForGroup || !!hiredAppForGroup || isTeacherFull; 
                              const isRed = isTeacherFull || (isLocked && !offerApp); 
                              const isDemoPhase = offerApp && ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(offerApp.status);
                              
                              let labelText = '';
                              if (isTeacherFull) labelText = 'Queue Full';
                              else if (hiredAppForGroup) labelText = 'Teacher Assigned';
                              else if (offerApp) labelText = isDemoPhase ? 'Demo Phase' : (offerApp.lastUpdatedBy === 'tutor' ? 'Offer Received' : 'Offer Sent');
                              else if (activeAppForGroup) labelText = 'Busy with Another Demo';

                              return (
                                <div key={tutor.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3 relative hover:bg-slate-50 px-2 -mx-2 rounded-2xl transition-colors">
                                  {isLocked && (
                                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-end pr-4 rounded-2xl pointer-events-none">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${isRed ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                            {labelText}
                                        </span>
                                    </div>
                                  )}
                                  <div className="w-8 h-8 rounded-full bg-orange-50/80 border border-orange-100 flex items-center justify-center font-bold text-orange-600 text-xs flex-shrink-0 shadow-sm">
                                    #{index + 1}
                                  </div>
                                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0 shadow-sm">
                                    {tutor.name?.charAt(0) || 'T'}
                                  </div>
                                  <div className="flex-1 min-w-0 overflow-hidden">
                                    <h4 className="font-bold text-gray-900 text-sm truncate tracking-tight">{tutor.name || 'Tutor'}</h4>
                                    <p className="text-xs text-slate-500 truncate font-medium">{tutor.subjects ? tutor.subjects.join(', ') : tutor.category}</p>
                                  </div>
                                  <button onClick={() => setSelectedViewUser(tutor)} className="text-slate-700 font-bold text-xs bg-slate-100 px-4 py-2 rounded-xl hover:bg-slate-200 hover:text-slate-900 z-0 flex-shrink-0 transition-colors">
                                    View
                                  </button>
                                </div>
                              );
                            })}
                            {computedRecommendedTutors.length > 3 && (
                              <div className="pt-4 mt-2">
                                <button onClick={() => { setActiveTab('new_tuition'); setTuitionSubTab('recommendation'); }} className="w-full text-center text-xs font-bold text-gray-500 hover:text-[#00a992]">
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
                    {studentGroups.length > 0 && (
                      <div className="mt-4 flex items-center gap-3">
                        <label className="text-sm font-bold text-gray-600">Finding tutors for:</label>
                        <select 
                          className="w-48 sm:w-64 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-[#00a992] focus:outline-none focus:ring-2 focus:ring-[#00a992]/50 truncate"
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
                    {(tuitionSubTab === 'all' ? allTutorsWithScores : computedRecommendedTutors)?.filter((t: any) => !selectedCategory || (t.category && t.category.includes(selectedCategory))).map((teacher: any) => {
                      const matchGroup = (app: any) => {
                        if (app.groupId) return app.groupId === activeGroup?.id;
                        return activeGroup?.students?.some((s:any) => s.id === app.studentId) || false;
                      };
                      const lockedApp = data?.applications?.find((app: any) => app.tutorId === teacher.id && matchGroup(app) && (app.status === 'locked' || (app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000))));
                      const activeAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
                      const hiredAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && app.status === 'tuition_started');
                      const offerApp = activeAppForGroup?.tutorId === teacher.id ? activeAppForGroup : undefined;
                      
                      const teacherLimit = teacher.isSubscribed ? 15 : 5;
                      const teacherPendingCount = teacher.pendingRequests?.length || 0;
                      const isTeacherFull = teacherPendingCount >= teacherLimit;

                      const isPending = offerApp && ['demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(offerApp.status);
                      const isHired = offerApp && ['tuition_started'].includes(offerApp.status);
                      
                      const isLocked = !!lockedApp || isTeacherFull;
                      const isRed = !!lockedApp || isTeacherFull || (!!activeAppForGroup && !offerApp);
                      const isDemoPhase = offerApp && ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(offerApp.status);
                      
                      let labelText = '';
                      if (isTeacherFull) labelText = 'Queue Full';
                      else if (lockedApp) labelText = 'Locked';
                      else if (hiredAppForGroup) labelText = 'Teacher Assigned';
                      else if (offerApp) labelText = isDemoPhase ? 'Demo Phase' : (offerApp.lastUpdatedBy === 'tutor' ? 'Offer Received' : 'Offer Sent');
                      else if (activeAppForGroup) labelText = 'Busy with Another Demo';
                      
                      let subText = '';
                      if (isTeacherFull) subText = 'Teacher is unavailable';
                      else if (lockedApp) subText = lockedApp.declinedAt ? `Available in ${Math.ceil((lockedApp.declinedAt + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000))} days` : 'Currently unavailable';
                      else if (hiredAppForGroup) subText = 'This group already has a teacher';
                      else if (offerApp) subText = isDemoPhase ? 'Demo in progress...' : (offerApp.lastUpdatedBy === 'tutor' ? 'Waiting to analyze...' : 'Waiting for response...');
                      else if (activeAppForGroup) subText = 'Active demo with another tutor';
                      
                      return (
                        <div key={teacher.id} className="bg-white rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
                          {isLocked && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm ${isRed ? 'bg-red-50' : 'bg-emerald-50'}`}>
                                <Lock className={`w-6 h-6 ${isRed ? 'text-red-500' : 'text-emerald-500'}`} />
                              </div>
                              <h4 className="font-bold text-gray-900 mb-1">{labelText}</h4>
                              <p className="text-sm text-gray-600 font-medium">
                                {subText}
                              </p>
                            </div>
                          )}
                          <div className="bg-gradient-to-br from-[#00a992] to-teal-600 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                              {teacher.rank && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md flex-shrink-0 ${teacher.rank === 1 ? 'bg-yellow-400 text-yellow-900' : teacher.rank === 2 ? 'bg-gray-300 text-gray-800' : teacher.rank === 3 ? 'bg-amber-600 text-white' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                                  #{teacher.rank}
                                </div>
                              )}
                              <h3 className="text-xl font-bold text-white tracking-tight truncate">{teacher.name}</h3>
                            </div>
                            {!isLocked && labelText ? (
                              <span className={`px-3 py-1 text-[10px] font-black rounded-full border shadow-sm uppercase tracking-wider whitespace-nowrap ${isRed ? 'bg-white/95 text-red-600 border-red-100' : 'bg-white/95 text-teal-700 border-teal-100'}`}>
                                {labelText}
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30 shadow-sm">
                                {teacher.mode || 'Online'}
                              </span>
                            )}
                          </div>
                          <div className="p-6 flex flex-col flex-grow">
                            {teacher.teachingApproach && (
                              <p className="text-sm text-gray-600 mb-5 overflow-hidden leading-relaxed">{teacher.teachingApproach}</p>
                            )}
                          <div className="space-y-2 text-sm text-slate-600 mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100/60 flex-grow shadow-inner">
                            {teacher.category === 'programming' && (teacher.technologies?.length ?? 0) > 0 && <p><strong className="text-slate-900">Technologies:</strong> {teacher.technologies.join(', ')}</p>}
                            {teacher.category === 'languages' && (teacher.languagesTaught?.length ?? 0) > 0 && <p><strong className="text-slate-900">Languages:</strong> {teacher.languagesTaught.join(', ')}</p>}
                            {(!teacher.category || teacher.category === 'school') && (teacher.subjects?.length ?? 0) > 0 && <p><strong className="text-slate-900">Subjects:</strong> {teacher.subjects.join(', ')}</p>}
                            {teacher.experience && <p><strong className="text-slate-900">Experience:</strong> {teacher.experience}</p>}
                            {teacher.mode !== 'Online' && teacher.locations && (
                              <p><strong className="text-slate-900">📍 Location:</strong> {teacher.locations} {teacher.travelKm ? `(Travels up to ${teacher.travelKm}km)` : ''}</p>
                            )}
                            <p><strong className="text-slate-900">Fee Range:</strong> <span className="text-emerald-600 font-bold">{teacher.feeRange || 'Negotiable'}</span></p>
                          </div>
                          
                          <div className="flex flex-col gap-3 mt-auto">
                            {!hasProfile ? (
                              <button 
                                onClick={() => setActiveTab('profile')}
                                className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 text-white hover:from-[#009b86] hover:to-teal-600 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm transform hover:scale-[1.02] active:scale-[0.98]"
                              >
                                <User className="w-4 h-4" /> View Teacher
                              </button>
                            ) : (
                              <>
                                <div className="mb-4">
                                  <p className="text-[10px] text-gray-500 leading-tight mb-2">Type a value below to negotiate, or leave empty to request a demo at the original price.</p>
                                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Your Offer (₹/mo)</label>
                                  <input 
                                    type="number"
                                    min={getTutorBasePrice(teacher) ? Math.ceil(getTutorBasePrice(teacher) * 0.6) : 0}
                                    max={getTutorBasePrice(teacher) || undefined}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50"
                                    placeholder={getTutorBasePrice(teacher) ? `e.g. ${getTutorBasePrice(teacher)}` : "e.g. 500"}
                                    value={negotiationOffer[teacher.id] || ''}
                                    onChange={(e) => setNegotiationOffer({...negotiationOffer, [teacher.id]: e.target.value})}
                                  />
                                  {getTutorBasePrice(teacher) > 0 && negotiationOffer[teacher.id] && parseInt(negotiationOffer[teacher.id]) >= getTutorBasePrice(teacher) * 0.6 && parseInt(negotiationOffer[teacher.id]) <= getTutorBasePrice(teacher) * 0.7 && (
                                      <p className="text-xs text-yellow-600 font-medium mt-1">Note: Your offer is quite low. The teacher is highly likely to reject it.</p>
                                  )}
                                </div>
                                {isHired ? (
                                  <button disabled className="w-full bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl shadow-none text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-emerald-200">
                                    <CheckCircle2 className="w-4 h-4" /> Already Hired
                                  </button>
                                ) : (
                                  <div className="flex flex-col gap-2 mt-auto">
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => setSelectedViewUser(teacher)}
                                        className="w-1/3 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center active:scale-[0.98]"
                                      >
                                        View
                                      </button>
                                      {negotiationOffer[teacher.id] ? (
                                        <button
                                          disabled={requestLoading || !!offerApp || (dailyRequestsCount >= 5) || hasPendingDues}
                                          onClick={() => { 
                                            if (hasPendingDues) { toast.error("Please clear your pending dues first."); return; }
                                            if (!!offerApp) {
                                              toast.error("You already have an active request or offer with this teacher.");
                                              return;
                                            }
                                            handleRequestTutor(teacher);
                                          }}
                                          className={`flex-1 py-3.5 px-3 rounded-xl text-sm font-bold transition-all ${!!offerApp || hasPendingDues ? 'bg-gray-200 text-gray-500 shadow-none cursor-not-allowed' : (dailyRequestsCount >= 5 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98]')}`}
                                        >
                                          {hasPendingDues ? 'Clear Dues First' : (dailyRequestsCount >= 5 ? 'Daily Limit Reached' : 'Make Offer')}
                                        </button>
                                      ) : (
                                        <button
                                          disabled={(requestLoading && !offerApp) || hasPendingDues}
                                          onClick={() => { 
                                            if (hasPendingDues) { toast.error("Please clear your pending dues first."); return; }
                                            if (!!offerApp) {
                                              toast.error("You already have an active request or offer with this teacher.");
                                              return;
                                            }
                                            handleDirectRequestDemo(teacher); 
                                          }}
                                          className={`flex-1 py-3.5 px-3 rounded-xl text-sm font-bold transition-all ${!!offerApp || hasPendingDues ? 'bg-gray-200 text-gray-500 shadow-none cursor-not-allowed' : (dailyRequestsCount >= 5 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98]')}`}
                                        >
                                          {hasPendingDues ? 'Clear Dues First' : (dailyRequestsCount >= 5 ? 'Daily Limit Reached' : 'Request Demo')}
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
                    {(!((tuitionSubTab === 'all' ? allTutorsWithScores : computedRecommendedTutors)?.filter((t: any) => !selectedCategory || (t.category && t.category.includes(selectedCategory)))) || ((tuitionSubTab === 'all' ? allTutorsWithScores : computedRecommendedTutors)?.filter((t: any) => !selectedCategory || (t.category && t.category.includes(selectedCategory))).length === 0)) && (
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

            {/* TAB: MANAGE GROUPS */}
            {activeTab === 'manage_groups' && (
              <div className="space-y-8 animate-in fade-in duration-300 h-full">
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 min-h-[600px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                  
                  <div className="mb-8 flex items-center gap-4 relative z-10">
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manage Groups</h2>
                      <p className="text-slate-500 font-medium mt-1">Organize your students into logical groups</p>
                    </div>
                  </div>
                  
                  <GroupManager 
                    students={allStudents}
                    title=""
                    subtitle="Drag and drop students to change their group assignments. Click save when you are done."
                    onSave={(groupedStudents) => {
                        const modifiedGroupIds = new Set<string>();
                        for (const student of groupedStudents) {
                          const oldStudent = allStudents.find((s:any) => s.id === student.id);
                          if (oldStudent?.groupId !== student.groupId) {
                            if (student.groupId) modifiedGroupIds.add(student.groupId);
                          }
                        }

                        if (modifiedGroupIds.size > 0) {
                          setPendingGroupSaveData(groupedStudents);
                          setModifiedGroupQueue(Array.from(modifiedGroupIds));
                          setShowPreferencesPrompt(true);
                        } else {
                          executeGroupSave(groupedStudents, false);
                        }
                    }}
                    onCancel={() => setActiveTab('profile')}
                  />
                </div>
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
                    {displayRequests?.map((neg: any) => {
                      const studentForApp = allStudents.find((s:any) => s.id === neg.studentId) || { name: neg.studentName || 'Student' };
                      return (
                      <div key={neg.id} className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-3xl border border-gray-100 shadow-lg shadow-slate-200/50 flex flex-col h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300">
                            
                            {/* Card Header */}
                            <div className="mb-4">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="font-bold text-lg text-slate-900 tracking-tight leading-tight flex-1 min-w-0 break-words">Tutor: {neg.tutorName}</h4>
                                <span 
                                  className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100/50 uppercase tracking-wider truncate max-w-[50%] flex-shrink-0"
                                  title={`For: ${studentForApp.name}`}
                                >
                                  For: {studentForApp.name.replace(/^Group:\s*/i, 'Group ')}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{neg.category}</p>
                              <div className="space-y-1">
                                {neg.category === 'programming' && neg.technologies && neg.technologies.length > 0 && <p className="text-sm font-semibold text-slate-600"><span className="text-slate-400 font-medium">Tech:</span> {neg.technologies.join(', ')}</p>}
                                {neg.category === 'languages' && neg.languagesTaught && neg.languagesTaught.length > 0 && <p className="text-sm font-semibold text-slate-600"><span className="text-slate-400 font-medium">Lang:</span> {neg.languagesTaught.join(', ')}</p>}
                                {(!neg.category || neg.category === 'school') && neg.subjects && neg.subjects.length > 0 && <p className="text-sm font-semibold text-slate-600"><span className="text-slate-400 font-medium">Subj:</span> {neg.subjects.join(', ')}</p>}
                              </div>
                            </div>

                            <div className="h-px w-full bg-slate-100 my-4"></div>

                            {/* Status Section */}
                            <div className="flex-1 flex flex-col mb-5">
                                {neg.status === 'demo_booking_phase' && neg.proposedDate ? (
                                  <div className="w-full bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/50 mb-auto">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Proposed Schedule</p>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Calendar className="w-4 h-4 text-emerald-600" />
                                      <span className="text-sm font-bold text-slate-800">{new Date(neg.proposedDate).toLocaleDateString()} at {neg.proposedTime?.split('||')[0] || neg.proposedTime}</span>
                                    </div>
                                    {neg.mode === 'online' && neg.proposedTime?.includes('||') && (
                                      <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-200/50">
                                        <div className="flex items-center gap-1.5 text-xs">
                                          <span className="font-bold text-slate-500">Platform:</span>
                                          <span className="text-slate-800 font-medium">{neg.proposedTime.split('||')[1]}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                          <span className="font-bold text-slate-500">Link:</span>
                                          <a href={neg.proposedTime.split('||')[2]} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline truncate max-w-full">{neg.proposedTime.split('||')[2]}</a>
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
                                  const activeLockApp = data?.applications?.find((app: any) => 
                                    (app.groupId || app.studentId) === leadId && 
                                    ['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision'].includes(app.status)
                                  );
                                  const isLockedByOtherTutor = activeLockApp && activeLockApp.id !== neg.id;
                                  
                                  if (neg.status !== 'declined' && neg.status !== 'tuition_started' && isLockedByOtherTutor) {
                                    return (
                                      <button 
                                        disabled
                                        className="w-full bg-gray-200 text-gray-500 px-5 py-3.5 rounded-xl font-bold text-sm cursor-not-allowed flex flex-col items-center justify-center gap-1"
                                      >
                                        <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Demo in Progress</span>
                                        <span className="text-[10px] font-normal leading-tight px-2 text-center">Demo in progress with another teacher</span>
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
                                  neg.lastUpdatedBy === 'tutor' ? (
                                    <>
                                      <button 
                                        onClick={() => {
                                          handleNegotiationAction(neg.id, 'request_demo', neg.currentOffer);
                                        }}
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
                                            description: 'Propose a new monthly fee for this tutor.',
                                            placeholder: 'e.g. 500',
                                            initialValue: neg.currentOffer?.toString() || '',
                                            min: neg.absoluteMin || Math.ceil((neg.initialBudget || 0) * 0.6),
                                            max: neg.absoluteMax || (neg.initialBudget || 0),
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
                                        <p className="text-sm font-semibold text-slate-500">Waiting for tutor response...</p>
                                      </div>
                                      <button 
                                        onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                        className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                      >
                                        Withdraw Request
                                      </button>
                                    </>
                                  )
                                )}

                                {/* Direct Payment / Demo Statuses */}
                                {neg.status === 'demo_requested_by_teacher' && (
                                  <>
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'accept_demo')}
                                      className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-black text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" /> Accept Demo
                                    </button>
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                      className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}
                                {neg.status === 'demo_requested_by_student' && (
                                  <>
                                    <div className="w-full bg-blue-50/50 px-4 py-3 rounded-2xl border border-blue-100 text-center mb-2">
                                      <p className="text-sm font-semibold text-blue-600">Waiting for Teacher to Accept</p>
                                    </div>
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                      className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                      Withdraw Request
                                    </button>
                                  </>
                                )}
                                {neg.status === 'demo_pending_payment' && (
                                  <>
                                    <div className="w-full bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 text-center mb-2 shadow-sm">
                                      <p className="text-sm font-semibold text-orange-600">Waiting for Teacher to Pay Fee</p>
                                    </div>
                                    <button 
                                      onClick={() => handleNegotiationAction(neg.id, 'decline')}
                                      className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                      Withdraw Request
                                    </button>
                                  </>
                                )}
                                {neg.status === 'demo_booking_phase' && (
                                  <>
                                    {neg.proposedDate && neg.lastUpdatedBy === 'teacher' ? (
                                      <>
                                        <button 
                                          onClick={() => handleNegotiationAction(neg.id, 'accept_demo_date')}
                                          className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-bold text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                          <CheckCircle2 className="w-4 h-4" /> Accept Proposed Date
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setModalConfig({
                                              isOpen: true,
                                              type: 'demo_booking',
                                              title: 'Counter-Offer Date',
                                              description: 'Suggest a different date and time for the demo class.',
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
                                          className="w-full bg-white border-2 border-slate-200 hover:border-[#00a992] hover:bg-emerald-50/50 text-slate-700 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                          <Calendar className="w-4 h-4" /> Change requested Date/Time
                                        </button>
                                      </>
                                    ) : (
                                      <div className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-center mb-2">
                                        <p className="text-sm font-semibold text-slate-500">Waiting for Teacher to propose date...</p>
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
                                    <div className="w-full bg-blue-50/50 px-4 py-3 rounded-2xl border border-blue-100 text-center">
                                      <p className="text-sm font-semibold text-blue-600">Demo Scheduled! Wait for it to complete.</p>
                                    </div>
                                )}
                                {neg.status === 'waiting_for_parent_decision' && (
                                  <>
                                    <button 
                                      onClick={() => setActionConfirmModal({ isOpen: true, type: 'hire', appId: neg.id, teacherName: neg.tutorName || 'the teacher' })}
                                      className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white px-5 py-3.5 rounded-xl font-black text-sm shadow-md shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" /> Hire Teacher
                                    </button>
                                    <button 
                                      onClick={() => setActionConfirmModal({ isOpen: true, type: 'reject', appId: neg.id, teacherName: neg.tutorName || 'the teacher' })}
                                      className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                    </>
                                  );
                                })()}
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
              <div className="space-y-12">
                {/* Demo Teachers Section */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">Demo Teachers</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.demoClasses?.map((cls: any) => {
                      const phone = cls.tutorDetails?.phone || cls.tutorDetails?.whatsapp;
                      const email = cls.tutorDetails?.email;
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
                                {cls.teacher?.charAt(0) || 'T'}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[150px]">{cls.teacher}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md border border-blue-100/50 uppercase tracking-wider">Demo Phase</span>
                                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 truncate max-w-[100px]">For {allStudents.find((s:any) => s.id === cls.studentId)?.name?.split(' ')[0] || cls.studentName?.split(' ')[0] || 'Student'}</span>
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
                              {phone && (
                                <a href={`tel:${phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"><Phone className="w-3.5 h-3.5" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                    <p className="font-semibold text-slate-700 text-xs truncate">{phone}</p>
                                  </div>
                                </a>
                              )}
                              {email && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0"><Mail className="w-3.5 h-3.5" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                    <p className="font-semibold text-slate-700 text-xs truncate" title={email}>{email}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-2">
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const viewUser = cls.tutorDetails || {
                                    id: cls.app?.tutorId,
                                    name: cls.teacher || 'Tutor',
                                    feeRange: cls.app?.finalPrice || cls.app?.currentOffer || 0,
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
                        <p className="text-slate-500 text-sm max-w-sm">Wait for a teacher to accept and schedule a demo class.</p>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Active Teachers Section */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">Active Teachers</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.upcomingClasses?.map((cls: any) => (
                      <li 
                        key={cls.id} 
                        className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-gray-100 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col cursor-pointer"
                        onClick={() => {
                          if (cls.tutorDetails) {
                            setSelectedViewUser(cls.tutorDetails);
                            setSelectedViewApp(cls);
                          }
                        }}
                      >
                        
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                        
                        <div className="flex flex-col h-full gap-5">
                          {/* Header section */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00a992] to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
                                {cls.teacher?.charAt(0) || 'T'}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-[150px]">{cls.teacher}</h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-100/50 uppercase tracking-wider">{cls.subject}</span>
                                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 truncate max-w-[100px]">For {allStudents.find((s:any) => s.id === cls.studentId)?.name?.split(' ')[0] || cls.studentName?.split(' ')[0] || 'Student'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm whitespace-nowrap ${
                              cls.status === 'confirmed' || cls.status === 'tuition_started'
                                ? 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200/50' 
                                : 'bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-700 border-orange-200/50'
                            }`}>
                              {cls.status === 'tuition_started' ? 'Active' : cls.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Divider */}
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent my-1" />

                          {/* Details section */}
                          {['demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted'].includes(cls.status) && cls.tutorDetails ? (
                            <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-sm flex-grow">
                              {cls.tutorDetails.phone && (
                                <a href={`tel:${cls.tutorDetails.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Phone className="w-3.5 h-3.5" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                    <p className="font-semibold text-slate-700 text-xs truncate">{cls.tutorDetails.phone}</p>
                                  </div>
                                </a>
                              )}
                              {cls.tutorDetails.email && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Mail className="w-3.5 h-3.5" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                    <p className="font-semibold text-slate-700 text-xs truncate" title={cls.tutorDetails.email}>{cls.tutorDetails.email}</p>
                                  </div>
                                </div>
                              )}
                              {cls.tutorDetails.qualification && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><GraduationCap className="w-3.5 h-3.5" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Degree</p>
                                    <p className="font-semibold text-slate-700 text-xs truncate">{cls.tutorDetails.qualification}</p>
                                  </div>
                                </div>
                              )}
                              {cls.tutorDetails.experience && (
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"><Star className="w-3.5 h-3.5" /></div>
                                  <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exp.</p>
                                    <p className="font-semibold text-slate-700 text-xs truncate">{cls.tutorDetails.experience}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex-grow flex items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-200 border-dashed">
                              <p className="text-sm font-medium text-slate-500 text-center">Contact details will be revealed once the demo is scheduled.</p>
                            </div>
                          )}

                          <div className="mt-4 flex gap-2">
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const viewUser = cls.tutorDetails || {
                                    id: cls.app?.tutorId,
                                    name: cls.teacher || 'Tutor',
                                    feeRange: cls.app?.finalPrice || cls.app?.currentOffer || 0,
                                  };
                                  setSelectedViewUser(viewUser);
                                  setSelectedViewApp(cls);
                                }}
                                className="w-full bg-white border-2 border-slate-200 hover:border-[#00a992] hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-700 px-4 py-3 rounded-xl font-bold text-sm transition-all"
                            >
                                View Details
                            </button>
                          </div>

                          {/* Action Button */}
                          {cls.status === 'demo_requested_by_teacher' && (
                            <div className="mt-2 flex flex-col gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleNegotiationAction(cls.id, 'accept_demo'); }} className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 hover:from-[#009b86] hover:to-teal-600 text-white py-3.5 rounded-xl font-bold shadow-md shadow-emerald-500/25 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                Accept Demo
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleNegotiationAction(cls.id, 'decline'); }} className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                Decline
                              </button>
                            </div>
                          )}
                          {cls.status === 'demo_requested_by_student' && (
                            <div className="mt-2 w-full bg-blue-50 text-blue-600 py-3.5 rounded-xl font-bold text-center border border-blue-100">
                              Waiting for Teacher to Accept
                            </div>
                          )}
                          {cls.status === 'tuition_started' && (() => {
                            const daysElapsed = Math.max(1, Math.ceil((Date.now() - (cls.startDate || Date.now())) / (1000 * 60 * 60 * 24)));
                            const monthlyFee = cls.finalPrice || cls.currentOffer || 0;
                            const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                            const proratedFee = Math.max(1, Math.round((monthlyFee / daysInMonth) * daysElapsed));
                            const isPaid = cls.feePaid === true;
                            const displayNames = cls.studentName || (cls.studentIds?.length > 1 ? 'Group' : 'Student');

                            return (
                              <div className="mt-2 flex flex-col gap-2">
                                {!isPaid && daysElapsed >= 7 && (
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setPayingClass({ id: cls.id, studentName: displayNames, finalPrice: monthlyFee, isProrated: false, isRemoval: false, studentsList: cls.studentsList || (cls.studentDetails ? [cls.studentDetails] : []), tutorName: cls.tutorName || cls.teacher });
                                    }} 
                                    className="w-full bg-gradient-to-r from-[#00a992] to-teal-500 text-white py-3.5 rounded-xl font-bold shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Pay Monthly Fees
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (daysElapsed < 7) {
                                      setPayingClass({ id: cls.id, studentName: displayNames, finalPrice: proratedFee, isProrated: true, isRemoval: true, studentsList: cls.studentsList || (cls.studentDetails ? [cls.studentDetails] : []), tutorName: cls.tutorName || cls.teacher });
                                    } else {
                                      setPayingClass({ id: cls.id, studentName: displayNames, finalPrice: monthlyFee, isProrated: false, isRemoval: true, studentsList: cls.studentsList || (cls.studentDetails ? [cls.studentDetails] : []), tutorName: cls.tutorName || cls.teacher });
                                    }
                                  }} 
                                  className="w-full bg-red-50/50 text-red-600 border border-transparent hover:border-red-100 hover:bg-red-50 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                  Remove Teacher
                                </button>
                              </div>
                            );
                          })()}
                          {cls.status === 'demo_pending_payment' && (
                            <div className="mt-2 w-full bg-orange-50 text-orange-600 py-3.5 rounded-xl font-bold text-center border border-orange-100">
                              Waiting for Teacher to Pay
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                    {(!data?.upcomingClasses || data?.upcomingClasses?.length === 0) && (
                      <li className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active classes</h3>
                        <p className="text-slate-500 max-w-sm">You haven't hired any teachers yet. Explore our recommended tutors to get started!</p>
                      </li>
                    )}
                  </ul>
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
                          Share your unique referral code. Earn 25% of the initial company margin (approx. 10% of total course value) when your friend books their first class!
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
                          className="bg-white border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-50 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" /> Edit Profile
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
                            defaultIsEditing={true}
                            initialData={{
                              guardianName: data?.profile?.name || data?.user?.displayName || '',
                              email: data?.profile?.email || data?.user?.email || '',
                              phoneNumber: data?.profile?.phone || '',
                              whatsappNumber: data?.profile?.whatsapp || '',
                              address: data?.profile?.address || '',
                            }} 
                            onSuccess={() => {
                              mutate();
                              setIsEditingParentProfile(false);
                            }} 
                          />
                        </div>
                      </div>
                    ) : (
                    <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-teal-900/5 border border-white/50 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-300 overflow-hidden mb-8 group">
                      <div className="bg-gradient-to-br from-[#00a992] to-teal-600 p-6 sm:p-8 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-900/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
                        
                        <div className="relative z-10 flex items-center gap-5">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-bold text-white backdrop-blur-md shadow-inner border border-white/30">
                            {(data?.profile?.name || data?.user?.displayName || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{data?.profile?.name || data?.user?.displayName || 'Parent Profile'}</h3>
                            <p className="text-sm font-medium text-emerald-100/90 mt-0.5">{data?.profile?.email || data?.user?.email || 'No email provided'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 sm:p-8 bg-slate-50/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</p>
                            <p className="text-lg font-bold text-slate-800">{data?.profile?.phone || '-'}</p>
                          </div>
                          {data?.profile?.whatsapp && (
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</p>
                              <p className="text-lg font-bold text-slate-800">{data?.profile?.whatsapp}</p>
                            </div>
                          )}
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
                        onClick={() => setActiveTab('manage_groups')}
                        className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" /> Manage Groups
                      </button>
                      <button 
                        onClick={() => {
                          setActiveStudentId('new');
                        }}
                        className="bg-gradient-to-r from-[#00a992] to-teal-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-500/25 hover:from-[#009b86] hover:to-teal-600 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Student
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
                      defaultIsEditing={!!editingStudentId}
                      existingGroups={studentGroups}
                      initialData={(() => {
                        const activeId = editingStudentId || activeStudentId;
                        if (activeId !== 'new' && activeId !== '') {
                          return allStudents.find((s:any) => s.id === activeId);
                        } else {
                          return null;
                        }
                      })()}
                      onSuccess={() => {
                        if(activeStudentId === 'new') setActiveStudentId('');
                        if(editingStudentId) setEditingStudentId('');
                        mutate();
                      }} 
                      onCancel={() => {
                        if(activeStudentId === 'new') setActiveStudentId('');
                        if(editingStudentId) setEditingStudentId('');
                      }}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentGroups.map((group: any, idx: number) => {
                      const requestDoc = data?.groups?.find((g: any) => g.id === group.id) || data?.tuitionRequests?.find((req: any) => req.groupId === group.id) || data?.myRequest; // Fallback
                      
                      return (
                        <div key={group.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 flex flex-col h-full">
                          {/* Header */}
                          <div className="bg-gradient-to-br from-[#00a992] to-teal-600 p-5 flex justify-between items-center relative overflow-hidden group/header">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover/header:scale-110 transition-transform duration-700" />
                            <div className="relative z-10">
                              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 line-clamp-1">
                                Group {idx + 1}
                              </h3>
                              <p className="text-xs font-bold text-teal-100 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-300" /> {group.category}
                              </p>
                            </div>
                            <div className="relative z-10 flex flex-shrink-0 ml-3">
                              <span className="text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg shadow-sm">
                                ₹{group.totalBudget}/mo
                              </span>
                            </div>
                          </div>

                          {/* Student List */}
                          <div className="p-5 flex-grow">
                            <ul className="space-y-1">
                              {group.students.map((s: any) => (
                                <li key={s.id} className="group/student flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                  <span className="font-medium text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" /> {s.name}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover/student:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => setEditingStudentId(s.id)}
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                      title="Edit Student"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => setStudentToRemove(s)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                      title="Remove Student"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Footer */}
                          <div className="flex border-t border-slate-100 bg-slate-50/50">
                            <button
                              onClick={() => {
                                setViewingGroupDetails({ ...group, index: idx + 1 });
                              }}
                              className="flex-1 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border-r border-slate-100"
                            >
                              <Info className="w-4 h-4" /> View Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedGroupForSettings({ ...group, requestDoc });
                                setGroupSettingsModalOpen(true);
                              }}
                              className="flex-1 py-3 text-sm font-bold text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <Settings className="w-4 h-4" /> Preferences
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {data?.userData?.roles?.includes('teacher') && (
                  <div className="mt-12 pt-8 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-[#00a992] to-teal-600 rounded-3xl p-8 sm:p-10 shadow-xl shadow-teal-900/10 border border-[#00a992]/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700" />
                      <div className="relative z-10">
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Teacher Portal</h3>
                        <p className="text-emerald-50 font-medium mb-6 max-w-lg">
                          You have a verified Teacher Profile. Switch to your Teacher dashboard to manage tuitions, students, and requests.
                        </p>
                        <button
                          onClick={() => {
                            let userString = localStorage.getItem('user');
                            if (userString) {
                              let userObj = JSON.parse(userString);
                              userObj.role = 'teacher';
                              localStorage.setItem('user', JSON.stringify(userObj));
                            }
                            router.push('/dashboard/teacher');
                          }}
                          className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 hover:shadow-xl hover:bg-emerald-50 hover:-translate-y-1 active:scale-95 transition-all inline-flex items-center gap-2"
                        >
                          <GraduationCap className="w-4 h-4" />
                          Switch to Teacher Portal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-red-50">
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-8 border border-red-100 shadow-lg shadow-red-900/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-red-100/50 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10">
                      <h3 className="text-xl font-black text-red-700 mb-2 tracking-tight flex items-center gap-2"><Lock className="w-5 h-5" /> Danger Zone</h3>
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

            {/* PAYMENT MODAL */}
            {payingClass && (() => {
              const coursePrice = payingClass.finalPrice || payingClass.currentOffer || payingClass.budget || 4000;
              const totalToPay = coursePrice + Math.round(coursePrice * 0.18);
              
              return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00a992]/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                  <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">Complete Payment</h3>
                  <p className="text-gray-500 mb-6 font-medium relative z-10">You are about to hire <span className="font-bold text-gray-900">{payingClass.tutorName || payingClass.teacher}</span> and start tuition.</p>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100 relative z-10">
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                        <div className="flex flex-col">
                          <span className="text-gray-900">Tuition Fee {payingClass.finalPrice ? '(Negotiated)' : '(Original)'}</span>
                          <span className="text-xs font-medium">Agreed monthly fee</span>
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
                          -₹{useWallet ? Math.min(totalToPay, data?.userData?.walletBalance) : 0}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 text-lg font-black text-gray-900">
                      <span>Total to Pay</span>
                      <span className="text-[#00a992]">
                        ₹{useWallet ? Math.max(0, totalToPay - (data?.userData?.walletBalance || 0)) : totalToPay}
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
              );
            })()}

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
              onClick={() => { setSelectedViewUser(null); setSelectedViewApp(null); }}
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
                    Contact & Professional Details
                  </h4>
                  {(!selectedViewApp || !['demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted'].includes(selectedViewApp.status)) ? (
                    <div className="mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-center">
                      <p className="text-sm font-bold text-orange-600 text-center">Contact details will be revealed once the demo is scheduled.</p>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedViewApp && ['demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted'].includes(selectedViewApp.status) && (selectedViewUser.phone || selectedViewUser.whatsapp || selectedViewUser.phoneNumber) && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                        <p className="font-bold text-gray-800">{selectedViewUser.phone || selectedViewUser.whatsapp || selectedViewUser.phoneNumber}</p>
                      </div>
                    )}
                    {selectedViewApp && ['demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted'].includes(selectedViewApp.status) && selectedViewUser.email && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                        <p className="font-bold text-gray-800 break-all">{selectedViewUser.email}</p>
                      </div>
                    )}
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
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                      {selectedViewApp ? (selectedViewApp.status === 'tuition_started' ? 'Amount Paid' : 'Amount to be Paid') : 'Total Budget'}
                    </p>
                    <p className="text-3xl font-black text-emerald-700">₹{selectedViewApp?.finalPrice || selectedViewApp?.currentOffer || selectedViewUser.feeRange || 'Negotiable'}<span className="text-base font-bold text-emerald-600/70">/mo</span></p>
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
              if (selectedViewApp?.status === 'waiting_for_parent_decision') {
                return (
                  <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => {
                        setActionConfirmModal({ isOpen: true, type: 'hire', appId: selectedViewApp.id, teacherName: selectedViewApp.tutorName || 'the teacher' });
                        setSelectedViewUser(null);
                        setSelectedViewApp(null);
                      }}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg transform hover:scale-105 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Hire Teacher
                    </button>
                    <button 
                      onClick={() => {
                        setActionConfirmModal({ isOpen: true, type: 'reject', appId: selectedViewApp.id, teacherName: selectedViewApp.tutorName || 'the teacher' });
                        setSelectedViewUser(null);
                        setSelectedViewApp(null);
                      }}
                      className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center"
                    >
                      Reject
                    </button>
                  </div>
                );
              }

              const matchGroup = (app: any) => {
                if (app.groupId) return app.groupId === activeGroup?.id;
                return activeGroup?.students?.some((s:any) => s.id === app.studentId) || false;
              };
              const activeAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && ['negotiating', 'pending', 'reviewing', 'offer_sent', 'demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'accepted', 'tuition_started'].includes(app.status));
              const hiredAppForGroup = data?.applications?.find((app: any) => matchGroup(app) && app.status === 'tuition_started');
              const hasNegotiation = data?.applications?.some((app: any) => app.tutorId === selectedViewUser.id && ['negotiating'].includes(app.status));
              const isPending = data?.applications?.some((app: any) => app.tutorId === selectedViewUser.id && ['demo_requested_by_student', 'demo_requested_by_teacher', 'demo_pending_payment', 'demo_booked', 'pending', 'accepted'].includes(app.status));
              const isHired = data?.applications?.some((app: any) => app.tutorId === selectedViewUser.id && ['tuition_started'].includes(app.status));
              const cooldownApp = data?.applications?.find((app: any) => app.tutorId === selectedViewUser.id && app.status === 'declined' && app.declinedAt && (Date.now() - app.declinedAt < 7 * 24 * 60 * 60 * 1000));
              
              if (isHired || isPending || hasNegotiation || cooldownApp || selectedViewApp || activeAppForGroup || hiredAppForGroup) {
                return (
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
                    {hiredAppForGroup ? 'A teacher has already been hired for this group.' : (activeAppForGroup && activeAppForGroup.tutorId !== selectedViewUser.id ? 'You have an active demo with another tutor for this group.' : 'Currently unavailable for new requests.')}
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
                        min={getTutorBasePrice(selectedViewUser) ? Math.ceil(getTutorBasePrice(selectedViewUser) * 0.6) : 0}
                        max={getTutorBasePrice(selectedViewUser) || undefined}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-bold text-emerald-700 bg-gray-50"
                        placeholder={getTutorBasePrice(selectedViewUser) ? `e.g. ${getTutorBasePrice(selectedViewUser)}` : "e.g. 500"}
                        value={negotiationOffer[selectedViewUser.id] || ''}
                        onChange={(e) => setNegotiationOffer({...negotiationOffer, [selectedViewUser.id]: e.target.value})}
                      />
                      {getTutorBasePrice(selectedViewUser) > 0 && negotiationOffer[selectedViewUser.id] && parseInt(negotiationOffer[selectedViewUser.id]) >= getTutorBasePrice(selectedViewUser) * 0.6 && parseInt(negotiationOffer[selectedViewUser.id]) <= getTutorBasePrice(selectedViewUser) * 0.7 && (
                        <p className="text-xs text-yellow-600 font-medium mt-1">Note: Your offer is quite low. The teacher is highly likely to reject it.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {negotiationOffer[selectedViewUser.id] ? (
                        <button 
                          onClick={() => { handleRequestTutor(selectedViewUser); setSelectedViewUser(null); }}
                          className={`flex-1 py-3 px-6 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300 shadow-none' : 'bg-[#00a992] hover:bg-[#008f7b] text-white shadow-[#00a992]/20'}`}
                        >
                          <CheckCircle2 className="w-4 h-4" /> Negotiate
                        </button>
                      ) : (
                        <button 
                          onClick={() => { handleDirectRequestDemo(selectedViewUser); setSelectedViewUser(null); }}
                          className={`flex-1 py-3 px-6 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${dailyRequestsCount >= 5 ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300 shadow-none' : 'bg-[#00a992] hover:bg-[#008f7b] text-white shadow-[#00a992]/20'}`}
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
                    
                    // Update group and sync tuition requests
                    const groupId = studentToRemove.groupId;
                    if (groupId) {
                        const { syncTuitionRequestForGroup } = await import('@/utils/groupUtils');
                        const { getDoc, updateDoc } = await import('firebase/firestore');
                        const groupRef = doc(db, 'groups', groupId);
                        const groupSnap = await getDoc(groupRef);
                        if (groupSnap.exists()) {
                            const groupData = groupSnap.data();
                            const newStudentIds = (groupData.studentIds || []).filter((id: string) => id !== studentToRemove.id);
                            await updateDoc(groupRef, { studentIds: newStudentIds });
                            await syncTuitionRequestForGroup(db, groupId, (data?.user?.uid || '') as string);
                        }
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

      {/* Action Confirm Modal */}
      {actionConfirmModal?.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${actionConfirmModal.type === 'hire' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {actionConfirmModal.type === 'hire' ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                {actionConfirmModal.type === 'hire' ? 'Confirm Hiring' : 'Confirm Rejection'}
              </h3>
              <p className="text-slate-500 font-medium mb-8">
                {actionConfirmModal.type === 'hire' 
                  ? `Are you sure you want to hire ${actionConfirmModal.teacherName}? Your 1-week trial will begin today.`
                  : `Are you sure you want to reject ${actionConfirmModal.teacherName}?`}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setActionConfirmModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (actionConfirmModal.type === 'hire') {
                      handleAppointTutor(actionConfirmModal.appId);
                    } else {
                      handleNegotiationAction(actionConfirmModal.appId, 'decline');
                    }
                    setActionConfirmModal(null);
                  }}
                  className={`flex-1 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors ${actionConfirmModal.type === 'hire' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/25' : 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/25'}`}
                >
                  Yes, Confirm
                </button>
              </div>
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
      
      {showPreferencesPrompt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-5">
               <Settings className="w-6 h-6 text-teal-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Update Group Preferences?</h3>
             <p className="text-slate-600 mb-8 font-medium">You have modified the students in {modifiedGroupQueue.length} group(s). Would you like to review and update their group preferences (e.g., preferred timings, teacher gender) now?</p>
             <div className="flex gap-4">
               <button 
                 onClick={() => { 
                   setShowPreferencesPrompt(false); 
                   executeGroupSave(pendingGroupSaveData, false);
                 }} 
                 disabled={isSavingGroups}
                 className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
               >
                 No, Skip
               </button>
               <button 
                 onClick={() => { 
                    setShowPreferencesPrompt(false);
                    executeGroupSave(pendingGroupSaveData, true);
                 }} 
                 disabled={isSavingGroups}
                 className="flex-1 px-4 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50"
               >
                 Yes, Update
               </button>
             </div>
          </div>
        </div>
      )}

      <GroupSettingsModal 
        isOpen={groupSettingsModalOpen}
        onClose={() => {
          setGroupSettingsModalOpen(false);
          setSelectedGroupForSettings(null);
          
          if (modifiedGroupQueue.length > 0) {
             const nextQueue = modifiedGroupQueue.slice(1);
             if (nextQueue.length > 0) {
                setTimeout(() => {
                   const nextId = nextQueue[0];
                   const nextGroup = studentGroups.find((g:any) => g.id === nextId) || { id: nextId, name: `Group` };
                   const requestDoc = data?.groups?.find((g: any) => g.id === nextId) || data?.tuitionRequests?.find((req: any) => req.groupId === nextId) || data?.myRequest;
                   setSelectedGroupForSettings({ ...nextGroup, requestDoc });
                   setGroupSettingsModalOpen(true);
                   setModifiedGroupQueue(nextQueue);
                }, 300);
             } else {
                setModifiedGroupQueue([]);
                setActiveTab('profile');
             }
          }
        }}
        groupId={selectedGroupForSettings?.id}
        category={selectedGroupForSettings?.category}
        parentId={(data?.user?.uid || '') as string}
        initialData={selectedGroupForSettings?.requestDoc}
        onSave={() => mutate()}
        studentNames={(() => {
          if (!selectedGroupForSettings?.id) return [];
          const source = pendingGroupSaveData.length > 0 ? pendingGroupSaveData : allStudents;
          return source.filter(s => s.groupId === selectedGroupForSettings.id).map(s => s.name);
        })()}
      />
      
      {isSavingGroups && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white">Setting up your groups...</h3>
          <p className="text-teal-100/70 font-medium mt-2">Please wait a moment.</p>
        </div>
      )}

      {viewingGroupDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Group {viewingGroupDetails.index}: Student Details</h3>
                <p className="text-slate-500 font-medium">{viewingGroupDetails.name}</p>
              </div>
              <button onClick={() => setViewingGroupDetails(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {viewingGroupDetails.students.map((s: any) => (
                  <div key={s.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex justify-between items-start mb-4">
                      <h5 className="text-lg font-bold text-slate-800 tracking-tight">{s.name}</h5>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">₹{s.budget}/mo</span>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      {s.classLevel && <p><strong className="text-slate-900">Class:</strong> {s.classLevel}</p>}
                      {s.board && <p><strong className="text-slate-900">Board:</strong> {s.board}</p>}
                      {s.subjects && s.subjects.length > 0 && <p><strong className="text-slate-900">Subjects:</strong> {s.subjects.join(', ')}</p>}
                      {s.technologies && s.technologies.length > 0 && <p><strong className="text-slate-900">Tech:</strong> {s.technologies.join(', ')}</p>}
                      {s.languages && s.languages.length > 0 && <p><strong className="text-slate-900">Lang:</strong> {s.languages.join(', ')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
}
