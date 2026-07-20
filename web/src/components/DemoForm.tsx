
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateReferralCode } from '@/utils/referral';
import GroupManager from '@/components/GroupManager';

interface Props {
  category?: string;
  isDashboard?: boolean;
  hasProfile?: boolean;
  onSuccess?: () => void;
  activeStudentId?: string;
  initialData?: any;
  parentOnly?: boolean;
}

export const ICSE_SUBJECTS = ["English","English Language","English Literature","Second Language","Mathematics","Environmental Studies (EVS)","General Knowledge (GK)","Computer","Computer Applications","Science","Integrated Science","Physics","Chemistry","Biology","History","Civics","Geography","Art","Music","Physical Education","Moral Science","Economics","Commercial Studies","Yoga","Home Science"];
const CBSE_SUBJECTS = ["English","Mathematics","EVS","Hindi/Regional Language","Hindi","Sanskrit/Third Language","Science","Social Science","Computer","Artificial Intelligence/Information Technology","Health & Physical Education","Skill Subjects","Art","Physical Education"];
const STATE_BOARD_SUBJECTS = ["Kannada","English","Hindi/Third Language","Mathematics","EVS","Science","Social Science","Computer","Art","Physical Education"];

export default function DemoForm({
  category,
  isDashboard = false,
  hasProfile = false,
  onSuccess,
  activeStudentId,
  initialData,
  parentOnly = false,
}: Props) {

  const getInitialFormData = () => {
    if (initialData) {
      return {
        step: (hasProfile && !parentOnly) ? 2 : 1,
        numberOfStudents: 1,
        parentName: initialData.guardianName || initialData.parentName || '',
        phone: initialData.phoneNumber || '',
        whatsapp: initialData.whatsappNumber || '',
        email: initialData.email || '',
        addressFlat: initialData.address?.split(', ')[0] || '',
        addressStreet: initialData.address?.split(', ')[1] || initialData.address || '',
        addressPincode: initialData.address?.split(', ')[2] || '',
        category: initialData.category || category || '',
        demoMode: initialData.preferredMode || '',
        hours: initialData.hoursPerDay || '',
        days: initialData.daysPerWeek || '',
        specificDays: initialData.specificDays || [],
        goal: initialData.learningGoal || '',
        requirements: initialData.specialRequirements || '',
        // Budget removed from global level
        students: [
          {
            fullName: initialData.name || '',
            gender: initialData.gender || '',
            studentType: initialData.studentType || '',
            classGrade: initialData.classLevel || '',
            board: initialData.board || '',
            subjects: initialData.subjects || [],
            technologies: initialData.technologies || [],
            languages: initialData.languages || [],
            budget: initialData.budget?.toString() || '4000',
          }
        ]
      };
    }
    return {
      step: (hasProfile && !parentOnly) ? 2 : 1,
      numberOfStudents: 1,
      parentName: '',
      phone: '',
      whatsapp: '',
      email: '',
      addressFlat: '',
      addressStreet: '',
      addressPincode: '',
      category: category || '',
      demoMode: '',
      hours: '',
      days: '',
      specificDays: [],
      goal: '',
      requirements: '',
      // Budget removed from global level
      students: [
        {
          fullName: '',
          gender: '',
          studentType: '',
          classGrade: '',
          board: '',
          subjects: [] as string[],
          technologies: [] as string[],
          languages: [] as string[],
          budget: '4000',
        }
      ]
    };
  };

  const [isEditing, setIsEditing] = useState(!hasProfile || !initialData || activeStudentId === 'new');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const [shouldSubmitGroup, setShouldSubmitGroup] = useState(false);

  useEffect(() => {
    if (isDashboard && !initialData) {
      const fetchProfile = async () => {
        try {
          const { auth, db } = await import('@/utils/firebase/client');
          const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
          await new Promise(resolve => auth.onAuthStateChanged(resolve));
          const user = auth.currentUser;
          if (user) {
            if (hasProfile) {
              const parentDocRef = doc(db, 'parents', user.uid);
              const parentSnap = await getDoc(parentDocRef);
              const parentData = parentSnap.exists() ? parentSnap.data() : null;

              let studentData = null;
              if (activeStudentId && activeStudentId !== 'new') {
                const studentSnap = await getDoc(doc(db, 'students', activeStudentId));
                studentData = studentSnap.exists() ? studentSnap.data() : null;
              } else if (!activeStudentId) {
                const studentQuery = query(collection(db, 'students'), where('parentId', '==', user.uid));
                const studentSnap = await getDocs(studentQuery);
                studentData = !studentSnap.empty ? studentSnap.docs[0].data() : null;
              }

              let requestData: any = {};
              if (activeStudentId && activeStudentId !== 'new') {
                const requestQuery = query(collection(db, 'tuition_requests'), where('studentId', '==', activeStudentId));
                const requestSnap = await getDocs(requestQuery);
                const requestDocs = requestSnap.docs.map(d => d.data());
                requestDocs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
                requestData = requestDocs[0] || {};
              } else if (!activeStudentId) {
                const requestQuery = query(collection(db, 'tuition_requests'), where('parentId', '==', user.uid));
                const requestSnap = await getDocs(requestQuery);
                const requestDocs = requestSnap.docs.map(d => d.data());
                requestDocs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
                requestData = requestDocs[0] || {};
              }

              if (studentData) {
                setIsEditing(false);
                setFormData(prev => ({
                  ...prev,
                  parentName: parentData ? parentData.name : (studentData.parentName || ''),
                  phone: studentData.phoneNumber || '',
                  whatsapp: studentData.whatsappNumber || '',
                  email: studentData.email || '',
                  addressFlat: studentData.address?.split(', ')[0] || '',
                  addressStreet: studentData.address?.split(', ')[1] || studentData.address || '',
                  addressPincode: studentData.address?.split(', ')[2] || '',
                  category: studentData.category || '',
                  demoMode: studentData.preferredMode || '',
                  hours: studentData.hoursPerDay || requestData.preferredTimeRange || '',
                  days: studentData.daysPerWeek || '',
                  specificDays: studentData.specificDays || [],
                  goal: studentData.learningGoal || '',
                  requirements: studentData.specialRequirements || '',
                  budget: '4000',
                  numberOfStudents: 1,
                  students: [{
                    fullName: studentData.name || '',
                    gender: studentData.gender || '',
                    studentType: studentData.studentType || '',
                    classGrade: studentData.classLevel || '',
                    board: studentData.board || '',
                    subjects: studentData.subjects || [],
                    technologies: studentData.technologies || [],
                    languages: studentData.languages || [],
                    budget: studentData.budget?.toString() || '4000',
                  }]
                }));
              } else {
                setIsEditing(true);
                setFormData(prev => ({
                  ...prev,
                  parentName: parentData ? parentData.name : (user.displayName || ''),
                  email: user.email || prev.email,
                }));
              }
            } else {
              setFormData(prev => ({
                ...prev,
                parentName: user.displayName || prev.parentName,
                email: user.email || prev.email
              }));
            }
          }
        } catch (e) {
          console.error('Failed to load profile', e);
        }
      };
      fetchProfile();
    }
  }, [isDashboard, hasProfile, activeStudentId, initialData]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value;
    const name = e.target.name;
    
    setFormData((prev: any) => {
      const next = { ...prev, [name]: val };
      if (name === 'phone' && sameAsPhone) {
        next.whatsapp = val;
      }
      if (name === 'days') {
        const maxDays = val === 'Daily' ? 7 : parseInt(val.charAt(0)) || 0;
        if (maxDays > 0 && next.specificDays && next.specificDays.length > maxDays) {
          next.specificDays = next.specificDays.slice(0, maxDays);
        }
      }
      return next;
    });
  };

  const handleStudentChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value;
    const name = e.target.name;
    
    setFormData((prev: any) => {
      const newStudents = [...prev.students];
      newStudents[index] = { ...newStudents[index], [name]: val };
      return { ...prev, students: newStudents };
    });
  };

  const handleStudentCheckbox = (index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      const newStudents = [...prev.students];
      const array = newStudents[index][field] || [];
      const newArray = array.includes(value)
        ? array.filter((item: string) => item !== value)
        : [...array, value];
      newStudents[index] = { ...newStudents[index], [field]: newArray };
      return { ...prev, students: newStudents };
    });
  };
  


  const handleSpecificDayCheckbox = (day: string) => {
    setFormData((prev: any) => {
      const array = prev.specificDays || [];
      if (array.includes(day)) {
        return { ...prev, specificDays: array.filter((d: string) => d !== day) };
      } else {
        const maxDays = prev.days === 'Daily' ? 7 : parseInt(prev.days?.charAt(0)) || 0;
        if (maxDays > 0 && array.length >= maxDays) {
          return prev;
        }
        return { ...prev, specificDays: [...array, day] };
      }
    });
  };

  const updateNumberOfStudents = (num: number) => {
    setFormData((prev: any) => {
      const currentStudents = [...prev.students];
      if (num > currentStudents.length) {
        for (let i = currentStudents.length; i < num; i++) {
          currentStudents.push({
            fullName: '',
            gender: '',
            studentType: '',
            classGrade: '',
            board: '',
            subjects: [],
            technologies: [],
            languages: [],
            budget: '4000',
          });
        }
      } else if (num < currentStudents.length) {
        currentStudents.length = num;
      }
      return { ...prev, numberOfStudents: num, students: currentStudents };
    });
  };

  const handleSameAsPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsPhone(checked);
    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent, skipGroupingCheck = false) => {
    if (e) e.preventDefault();
    
    if (!parentOnly && !skipGroupingCheck) {
      if (formData.numberOfStudents > 1 && formData.step < formData.numberOfStudents + 1) {
        setFormData(prev => ({ ...prev, step: prev.step + 1 }));
        return;
      }
      if (formData.numberOfStudents > 1 && formData.step === formData.numberOfStudents + 1) {
        setFormData(prev => ({ ...prev, step: prev.step + 1 })); // Move to grouping step
        return;
      }
      if (formData.numberOfStudents === 1 && formData.step < formData.numberOfStudents + 1) {
        setFormData(prev => ({ ...prev, step: prev.step + 1 }));
        return;
      }
    }
    
    setLoading(true);
    setSuccessMsg('');

    const actualCategory = formData.category || category;
    if (actualCategory === 'programming') {
      formData.demoMode = 'Online';
    }
    const isOnline = formData.demoMode?.toLowerCase() === 'online';
    const combinedAddress = isOnline ? '' : [formData.addressFlat, formData.addressStreet, formData.addressPincode].filter(Boolean).join(', ');

    if (!isDashboard) {
      const { auth } = await import('@/utils/firebase/client');
      if (auth.currentUser) {
        await auth.signOut();
      }
      localStorage.setItem('demoFormData', JSON.stringify({ ...formData, category: formData.category || category }));
      router.push('/signup?role=student&next=/dashboard/student');
      return;
    }

    try {
      const { auth, db } = await import('@/utils/firebase/client');
      const { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, addDoc } = await import('firebase/firestore');
      
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      if (!hasProfile) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const newCode = (userDocSnap.exists() && userDocSnap.data().referralCode) || generateReferralCode(formData.parentName, user.uid);
        await setDoc(userDocRef, { hasProfile: true, referralCode: newCode }, { merge: true });
      }

      const parentDocRef = doc(db, 'parents', user.uid);
      await setDoc(parentDocRef, { 
        id: user.uid, 
        name: formData.parentName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        address: combinedAddress,
        preferredMode: formData.demoMode || ''
      }, { merge: true });

      if (parentOnly) {
        const studentsQuery = query(collection(db, 'students'), where('parentId', '==', user.uid));
        const studentsSnap = await getDocs(studentsQuery);
        for (const sDoc of studentsSnap.docs) {
          await updateDoc(sDoc.ref, {
            address: combinedAddress,
            preferredMode: formData.demoMode || ''
          });
        }

        const requestsQuery = query(collection(db, 'tuition_requests'), where('parentId', '==', user.uid));
        const requestsSnap = await getDocs(requestsQuery);
        for (const rDoc of requestsSnap.docs) {
          await updateDoc(rDoc.ref, {
            address: combinedAddress,
            city: formData.demoMode === 'Online' ? '' : (formData.addressPincode || combinedAddress.split(',').pop()?.trim() || ''),
            preferredMode: formData.demoMode || ''
          });
        }

        setSuccessMsg('Parent profile updated successfully!');
        sessionStorage.removeItem('demoFormData');
        if (onSuccess) onSuccess();
        return;
      }

      if (activeStudentId && activeStudentId !== 'new') {
        const s = formData.students[0];
        const studentRef = doc(db, 'students', activeStudentId);
        await updateDoc(studentRef, {
          id: activeStudentId,
          guardianName: formData.parentName,
          dob: '',
          category: formData.category || '',
          name: s.fullName,
          gender: s.gender,
          phoneNumber: formData.phone,
          whatsappNumber: formData.whatsapp,
          email: formData.email,
          address: combinedAddress,
          studentType: s.studentType,
          classLevel: s.classGrade,
          board: s.board,
          subjects: s.subjects || [],
          technologies: s.technologies || [],
          languages: s.languages || [],
          preferredMode: formData.demoMode || '',
          learningGoal: formData.goal || '',
          specialRequirements: formData.requirements || '',
          hoursPerDay: formData.hours || '',
          daysPerWeek: formData.days || '',
          specificDays: formData.specificDays || [],
          budget: parseInt(s.budget) || 0,
          groupId: (s as any).groupId || `indv_${activeStudentId}`,
        });

        const requestQuery = query(collection(db, 'tuition_requests'), where('studentId', '==', activeStudentId));
        const requestSnap = await getDocs(requestQuery);
        if (!requestSnap.empty) {
          await updateDoc(requestSnap.docs[0].ref, {
            id: requestSnap.docs[0].id,
            city: '',
            latitude: 0.0,
            longitude: 0.0,
            category: formData.category || '',
            studentName: s.fullName,
            classLevel: s.classGrade,
            board: s.board,
            subjects: s.subjects || [],
            technologies: s.technologies || [],
            languages: s.languages || [],
            mode: formData.demoMode || '',
            preferredTimeRange: formData.hours || '',
            area: combinedAddress,
            budget: parseInt(s.budget) || 0,
          });
        }
        setSuccessMsg('Profile updated successfully!');
      } else {
        for (let i = 0; i < formData.numberOfStudents; i++) {
          const s = formData.students[i];
          const newStudentRef = doc(collection(db, 'students'));
          await setDoc(newStudentRef, {
            id: newStudentRef.id,
            guardianName: formData.parentName,
            dob: '',
            parentId: user.uid,
            category: formData.category || '',
            name: s.fullName,
            gender: s.gender,
            phoneNumber: formData.phone,
            whatsappNumber: formData.whatsapp,
            email: formData.email,
            address: combinedAddress,
            studentType: s.studentType,
            classLevel: s.classGrade,
            board: s.board,
            subjects: s.subjects || [],
            budget: parseInt(s.budget) || 0,
            preferredMode: formData.demoMode || '',
            learningGoal: formData.goal || '',
            specialRequirements: formData.requirements || '',
            technologies: s.technologies || [],
            languages: s.languages || [],
            hoursPerDay: formData.hours || '',
            daysPerWeek: formData.days || '',
            specificDays: formData.specificDays || [],
            groupId: (s as any).groupId?.startsWith('indv_temp') ? `indv_${newStudentRef.id}` : ((s as any).groupId || `indv_${newStudentRef.id}`),
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
            studentName: s.fullName,
            classLevel: s.classGrade,
            board: s.board,
            subjects: s.subjects || [],
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
        setSuccessMsg('Student(s) added successfully!');
      }

      sessionStorage.removeItem('demoFormData');
      if (isDashboard) {
        if (onSuccess) onSuccess();
      } else {
        setTimeout(() => router.push('/dashboard/student'), 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit demo request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldSubmitGroup) {
      setShouldSubmitGroup(false);
      handleSubmit(undefined, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSubmitGroup]);

  const getAvailableSubjects = (board: string, classGrade: string) => {
    let availableSubjects = new Set<string>();
    if (board === 'ICSE') {
      ICSE_SUBJECTS.forEach(s => availableSubjects.add(s));
    } else if (board === 'CBSE') {
      CBSE_SUBJECTS.forEach(s => availableSubjects.add(s));
    } else if (board === 'State Board' || board === 'IB / IGCSE') {
      STATE_BOARD_SUBJECTS.forEach(s => availableSubjects.add(s));
    } else {
      ICSE_SUBJECTS.forEach(s => availableSubjects.add(s));
      CBSE_SUBJECTS.forEach(s => availableSubjects.add(s));
      STATE_BOARD_SUBJECTS.forEach(s => availableSubjects.add(s));
    }
    const puGrades = ['1st PU', '2nd PU', '11th Standard', '12th Standard'];
    if (puGrades.includes(classGrade)) {
      ['KCET', 'NEET', 'JEE'].forEach(s => availableSubjects.add(s));
    }
    return Array.from(availableSubjects).sort();
  };

  const renderProfileView = () => {
    const student = formData.students[0];
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-3xl font-black text-black">👤 My Profile</h2>
            <p className="text-slate-500 mt-1 font-medium">Your learning preferences and details.</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2"
          >
            ✏️ Edit Profile
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {!parentOnly && (
            <>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-lg font-bold text-slate-800">{student.fullName || '-'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Gender</p>
                <p className="text-lg font-bold text-slate-800 capitalize">{student.gender || '-'}</p>
              </div>
            </>
          )}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Parent's Name</p>
            <p className="text-lg font-bold text-slate-800">{formData.parentName || '-'}</p>
          </div>
          {!parentOnly && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Category</p>
              <p className="text-lg font-bold text-purple-600 capitalize">{formData.category || '-'}</p>
            </div>
          )}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Phone / WhatsApp</p>
            <p className="text-lg font-bold text-slate-800">{formData.phone || formData.whatsapp || '-'}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Email</p>
            <p className="text-lg font-bold text-slate-800">{formData.email || '-'}</p>
          </div>
          {formData.demoMode !== 'Online' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 md:col-span-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Residential Address</p>
              <p className="text-lg font-bold text-slate-800">{[formData.addressFlat, formData.addressStreet, formData.addressPincode].filter(Boolean).join(', ') || '-'}</p>
            </div>
          )}
          
          {formData.category === 'school' && (
            <>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Class / Grade</p>
                <p className="text-lg font-bold text-slate-800">{student.classGrade || '-'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Subjects</p>
                <p className="text-lg font-bold text-slate-800">{student.subjects?.length > 0 ? student.subjects.join(', ') : '-'}</p>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Board</p>
                <p className="text-lg font-bold text-slate-800">{student.board || '-'}</p>
              </div>
            </>
          )}

          {formData.category === 'programming' && student.technologies.length > 0 && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Technologies</p>
              <div className="flex gap-2 flex-wrap">
                {student.technologies.map((t: string) => (
                  <span key={t} className="bg-purple-100/50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-md text-sm font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.category === 'languages' && student.languages.length > 0 && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Languages</p>
              <div className="flex gap-2 flex-wrap">
                {student.languages.map((l: string) => (
                  <span key={l} className="bg-blue-100/50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md text-sm font-medium">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}


          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Preferred Mode</p>
            <p className="text-lg font-bold text-slate-800">{(formData.category === 'programming') ? 'Online' : (formData.demoMode || '-')}</p>
          </div>
          
          {(formData.goal || formData.requirements) && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Goals & Requirements</p>
              <p className="text-base text-slate-700 whitespace-pre-wrap">{formData.goal} {formData.requirements}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFormStep = () => {
    if (formData.step === 1) {
      return (
        <div className="space-y-8">
          {!activeStudentId && !parentOnly && (
            <div>
              <label className="block text-sm font-semibold mb-2">👥 Number of Students</label>
              <select
                value={formData.numberOfStudents}
                onChange={(e) => updateNumberOfStudents(parseInt(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} Student{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          )}

          {!parentOnly && (
            <div>
              <label className="block text-sm font-semibold mb-2">📚 Selected Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCommonChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
                required
              >
                <option value="">Select Category</option>
                <option value="school">School / Academics</option>
                <option value="programming">Programming / IT</option>
                <option value="languages">Languages</option>
              </select>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">👤 Parent / Guardian Name *</label>
              <input
                type="text"
                name="parentName"
                placeholder="Enter parent's full name"
                value={formData.parentName}
                onChange={handleCommonChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">📧 Email ID *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleCommonChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">📞 Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleCommonChange}
                required
                pattern="[0-9]{10,15}"
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold">💬 WhatsApp No. *</label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhone} className="rounded accent-purple-500" />
                  Same as Phone
                </label>
              </div>
              <input
                type="tel"
                name="whatsapp"
                placeholder="Enter WhatsApp number"
                value={formData.whatsapp}
                onChange={handleCommonChange}
                disabled={sameAsPhone}
                required={!sameAsPhone}
                pattern="[0-9]{10,15}"
                className={`w-full border border-slate-300 rounded-xl px-4 py-4 ${sameAsPhone ? 'bg-slate-100' : ''}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">🌐 Preferred Mode *</label>
            {(formData.category === 'programming') ? (
              <div className="border border-purple-200 bg-purple-50 rounded-xl px-4 py-4 flex items-center gap-3">
                <input type="radio" name="demoMode" value="Online" checked readOnly className="accent-purple-500" />
                <span className="font-semibold text-purple-700">Online Only (For Programming)</span>
              </div>
            ) : (
              <div className="flex gap-6 pt-1">
                {['Online', 'Offline'].map((item) => (
                  <label key={item} className="flex items-center gap-2 font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="demoMode"
                      value={item}
                      checked={formData.demoMode === item}
                      onChange={handleCommonChange}
                      required
                      className="accent-purple-500 w-4 h-4"
                    />
                    {item}
                  </label>
                ))}
              </div>
            )}
          </div>

          {(formData.demoMode !== 'Online' && formData.category !== 'programming') && (
            <div>
              <label className="block text-sm font-semibold mb-2">🏠 Residential Address *</label>
              <div className="space-y-3">
                <input
                  type="text"
                  name="addressFlat"
                  placeholder="Flat / House No. & Building"
                  value={formData.addressFlat}
                  onChange={handleCommonChange}
                  required={formData.demoMode !== 'Online'}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                />
                <input
                  type="text"
                  name="addressStreet"
                  placeholder="Street & Landmark"
                  value={formData.addressStreet}
                  onChange={handleCommonChange}
                  required={formData.demoMode !== 'Online'}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                />
                <input
                  type="text"
                  name="addressPincode"
                  placeholder="Pincode"
                  value={formData.addressPincode}
                  onChange={handleCommonChange}
                  required={formData.demoMode !== 'Online'}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                />
              </div>
            </div>
          )}

          {!parentOnly && (
            <>
              <div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">⏱ Preferred Study Time</label>
                    <select name="hours" value={formData.hours} onChange={handleCommonChange} className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white">
                      <option value="">Select duration</option>
                      <option value="1 Hour/Day">1 Hour / Day</option>
                      <option value="1.5 Hours/Day">1.5 Hours / Day</option>
                      <option value="2 Hours/Day">2 Hours / Day</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">📅 Days per Week</label>
                    <select name="days" value={formData.days} onChange={handleCommonChange} className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white">
                      <option value="">Select days</option>
                      <option value="1 Day/Week">1 Day / Week</option>
                      <option value="2 Days/Week">2 Days / Week</option>
                      <option value="3 Days/Week">3 Days / Week</option>
                      <option value="4 Days/Week">4 Days / Week</option>
                      <option value="5 Days/Week">5 Days / Week</option>
                      <option value="6 Days/Week">6 Days / Week</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {formData.days && (
                <div>
                  <label className="block text-sm font-semibold mb-3">📆 Specific Days of the Week (Optional)</label>
                  <div className="flex flex-wrap gap-3">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const isChecked = formData.specificDays.includes(day);
                      const maxDays = formData.days === 'Daily' ? 7 : parseInt(formData.days?.charAt(0)) || 0;
                      const isAtMax = maxDays > 0 && formData.specificDays.length >= maxDays;
                      const isDisabled = !isChecked && isAtMax;
                      return (
                      <label key={day} className={`flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-purple-500'}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleSpecificDayCheckbox(day)}
                          className="accent-purple-500"
                        />
                        <span className="text-sm font-medium">{day}</span>
                      </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">🎯 Learning Goal</label>
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleCommonChange}
                  placeholder="E.g., Improve grades, learn conversational German..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3"
                  rows={2}
                />
              </div>
            </>
          )}
        </div>
      );
    }

    const sIndex = formData.step - 2;
    const student = formData.students[sIndex];

    return (
      <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
        <h3 className="text-2xl font-bold border-b pb-4">Details for Student</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">👤 Student Name *</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter student name"
              value={student.fullName}
              onChange={(e) => handleStudentChange(sIndex, e)}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3">🚻 Gender *</label>
            <div className="flex gap-6 pt-3">
              {['Female', 'Male', 'Other'].map((item) => (
                <label key={item} className="flex items-center gap-2 font-medium">
                  <input
                    type="radio"
                    name="gender"
                    value={item}
                    checked={student.gender === item}
                    onChange={(e) => handleStudentChange(sIndex, e)}
                    required
                    className="accent-purple-500 w-4 h-4"
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <label className="block text-sm font-semibold mb-2 flex justify-between">
            <span>💰 Expected Budget / Monthly Fee</span>
            <span className="text-emerald-600 font-bold">₹{student.budget}</span>
          </label>
          <input
            type="range"
            name="budget"
            min="1000"
            max="20000"
            step="500"
            value={student.budget || '4000'}
            onChange={(e) => handleStudentChange(sIndex, e)}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
            <span>₹1,000</span>
            <span>₹20,000</span>
          </div>
        </div>

        {formData.category === 'school' && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">👨‍🎓 Student Type *</label>
                <select
                  name="studentType"
                  value={student.studentType}
                  onChange={(e) => handleStudentChange(sIndex, e)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
                  required
                >
                  <option value="">Select option</option>
                  <option value="School Student">School Student</option>
                  <option value="College Student">College Student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">🏫 Class / Grade *</label>
                <select
                  name="classGrade"
                  value={student.classGrade}
                  onChange={(e) => handleStudentChange(sIndex, e)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
                  required
                >
                  <option value="">Select class</option>
                  {student.studentType === 'College Student' ? (
                    <>
                      <option value="1st PU">1st PU</option>
                      <option value="2nd PU">2nd PU</option>
                      <option value="Degree">Degree</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Medical">Medical</option>
                    </>
                  ) : (
                    <>
                      <option value="LKG">LKG</option>
                      <option value="UKG">UKG</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                        <option key={num} value={`${num}th Standard`}>{num}th Standard</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">📚 Board *</label>
              <div className="grid md:grid-cols-2 gap-3">
                {['CBSE', 'ICSE', 'State Board', 'IB / IGCSE'].map((item) => (
                  <label key={item} className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-4 cursor-pointer hover:border-purple-500">
                    <input
                      type="radio"
                      name="board"
                      value={item}
                      checked={student.board === item}
                      onChange={(e) => handleStudentChange(sIndex, e)}
                      required
                      className="accent-purple-500"
                    />
                    <span className="font-medium">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">📘 Subjects *</label>
              {!student.board ? (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">Please select a board to see subjects.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-3">
                  {getAvailableSubjects(student.board, student.classGrade).map(sub => (
                    <label key={sub} className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3 cursor-pointer hover:border-purple-500">
                      <input
                        type="checkbox"
                        checked={student.subjects?.includes(sub)}
                        onChange={() => handleStudentCheckbox(sIndex, 'subjects', sub)}
                        className="accent-purple-500"
                      />
                      <span className="text-sm font-medium">{sub}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {formData.category === 'programming' && (
          <div>
            <label className="block text-sm font-semibold mb-3">💻 Technologies *</label>
            <div className="grid md:grid-cols-2 gap-3">
              {['Python', 'Java', 'AI & ML', 'HTML & CSS', 'Data Analytics', 'Gen AI', 'Agentic AI'].map((item) => (
                <label key={item} className="border border-slate-300 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-purple-500 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={student.technologies.includes(item)}
                    onChange={() => handleStudentCheckbox(sIndex, 'technologies', item)}
                    className="accent-purple-500"
                  />
                  <span className="font-medium">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {formData.category === 'languages' && (
          <div>
            <label className="block text-sm font-semibold mb-3">🌍 Languages *</label>
            <div className="grid md:grid-cols-2 gap-3">
              {['English', 'Arabic', 'German', 'Japanese', 'French', 'Spanish'].map((item) => (
                <label key={item} className="border border-slate-300 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-purple-500 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={student.languages.includes(item)}
                    onChange={() => handleStudentCheckbox(sIndex, 'languages', item)}
                    className="accent-purple-500"
                  />
                  <span className="font-medium">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isGroupingStep = formData.numberOfStudents > 1 && !parentOnly && formData.step === formData.numberOfStudents + 2;

  if (isGroupingStep) {
    const tempStudents = formData.students.slice(0, formData.numberOfStudents).map((s: any, index: number) => ({
      id: s.id || `temp_${index}`,
      name: s.fullName || s.name || `Student ${index + 1}`,
      category: formData.category || category,
      groupId: s.groupId || 'unassigned',
      ...s
    }));
    
    return (
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-6xl mx-auto min-h-[600px]">
        <GroupManager 
          students={tempStudents}
          onSave={(groupedStudents) => {
            const newStudents = [...formData.students];
            groupedStudents.forEach((gs) => {
              const originalIndex = tempStudents.findIndex(ts => ts.id === gs.id);
              if (originalIndex !== -1) {
                newStudents[originalIndex] = { ...(newStudents[originalIndex] as any), groupId: gs.groupId };
              }
            });
            setFormData(prev => ({ ...prev, students: newStudents }));
            // Trigger submission via useEffect to avoid stale closure
            setShouldSubmitGroup(true);
          }}
          onCancel={() => setFormData(prev => ({ ...prev, step: prev.step - 1 }))}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-6xl mx-auto">
      {hasProfile && !isEditing ? (
        renderProfileView()
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                {activeStudentId === 'new' ? '👤 Add Student' : (hasProfile ? '👤 Edit Profile' : (isDashboard ? '🎓 Complete Demo Request' : '🎓 Book a Free Demo'))}
              </h2>
              {activeStudentId !== 'new' && (
                <p className="text-slate-500 text-base">
                  {formData.step === 1 ? 'Step 1: Common Details & Preferences' : `Step ${formData.step}: Details for Student ${formData.step - 1}`}
                </p>
              )}
            </div>
            {hasProfile && activeStudentId !== 'new' && (
              <button 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {renderFormStep()}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-200">
                {successMsg}
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-slate-100">
              {formData.step > (hasProfile ? 2 : 1) && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, step: prev.step - 1 }))}
                  className="px-6 py-4 rounded-xl font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all shadow-lg text-lg"
              >
                {loading ? 'Processing...' : (parentOnly ? '✅ Save Profile' : (formData.step < formData.numberOfStudents + (formData.numberOfStudents > 1 ? 1 : 1) ? 'Next Step →' : (hasProfile ? '✅ Save Changes' : '🚀 Submit Request')))}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
