"use client";

// src/app/components/DemoForm.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface Props {
  category?: string;
  isDashboard?: boolean;
  hasProfile?: boolean;
  onSuccess?: () => void;
  activeStudentId?: string;
  initialData?: any;
}

export default function DemoForm({
  category,
  isDashboard = false,
  hasProfile = false,
  onSuccess,
  activeStudentId,
  initialData,
}: Props) {

  const getInitialFormData = () => {
    if (initialData) {
      return {
        fullName: initialData.name || '',
        gender: initialData.gender || '',
        phone: initialData.phoneNumber || '',
        whatsapp: initialData.whatsappNumber || '',
        email: initialData.email || '',
        addressFlat: initialData.address?.split(', ')[0] || '',
        addressStreet: initialData.address?.split(', ')[1] || initialData.address || '',
        addressPincode: initialData.address?.split(', ')[2] || '',
        studentType: initialData.studentType || '',
        classGrade: initialData.classLevel || '',
        parentName: '',
        demoMode: initialData.preferredMode || '',
        board: initialData.board || '',
        subjects: initialData.subjects ? initialData.subjects.join(', ') : '',
        classMode: '',
        hours: initialData.hoursPerDay || '',
        days: initialData.daysPerWeek || '',
        goal: initialData.learningGoal || '',
        source: '',
        requirements: initialData.specialRequirements || '',
        budget: initialData.budget?.toString() || '',
        category: initialData.category || category || '',
        technologies: initialData.technologies || [],
        languages: initialData.languages || [],
      };
    }
    return {
      fullName: '',
      gender: '',
      phone: '',
      whatsapp: '',
      email: '',
      addressFlat: '',
      addressStreet: '',
      addressPincode: '',
      studentType: '',
      classGrade: '',
      parentName: '',
      demoMode: '',
      board: '',
      subjects: '',
      classMode: '',
      hours: '',
      days: '',
      goal: '',
      source: '',
      requirements: '',
      budget: '',
      category: category || '',
      technologies: [] as string[],
      languages: [] as string[],
    };
  };

  const [isEditing, setIsEditing] = useState(!hasProfile || !initialData);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  // Load profile from Supabase if inside dashboard and no initialData provided
  useEffect(() => {
    if (isDashboard && !initialData) {
      const fetchProfile = async () => {
        try {
          const { auth, db } = await import('@/utils/firebase/client');
          const { collection, query, where, getDocs, doc, getDoc, orderBy, limit, updateDoc, setDoc, addDoc } = await import('firebase/firestore');
          await new Promise(resolve => auth.onAuthStateChanged(resolve));
          const user = auth.currentUser;
          if (user) {
            if (hasProfile) {
              // Fetch student data
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

              // Fetch tuition request data
              let requestData: any = {};
              if (activeStudentId && activeStudentId !== 'new') {
                const requestQuery = query(collection(db, 'tuition_requests'), where('studentId', '==', activeStudentId));
                const requestSnap = await getDocs(requestQuery);
                const requestDocs = requestSnap.docs.map(d => d.data());
                requestDocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                requestData = requestDocs[0] || {};
              } else if (!activeStudentId) {
                const requestQuery = query(collection(db, 'tuition_requests'), where('parentId', '==', user.uid));
                const requestSnap = await getDocs(requestQuery);
                const requestDocs = requestSnap.docs.map(d => d.data());
                requestDocs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                requestData = requestDocs[0] || {};
              }

              if (studentData) {
                setIsEditing(false);
                setFormData(prev => ({
                  ...prev,
                  fullName: studentData.name || '',
                  gender: studentData.gender || '',
                  phone: studentData.phoneNumber || '',
                  whatsapp: studentData.whatsappNumber || '',
                  email: studentData.email || '',
                  addressFlat: studentData.address?.split(', ')[0] || '',
                  addressStreet: studentData.address?.split(', ')[1] || studentData.address || '',
                  addressPincode: studentData.address?.split(', ')[2] || '',
                  studentType: studentData.studentType || '',
                  classGrade: studentData.classLevel || '',
                  parentName: parentData ? parentData.name : '',
                  demoMode: studentData.preferredMode || '',
                  board: studentData.board || '',
                  subjects: studentData.subjects ? studentData.subjects.join(', ') : '',
                  classMode: '',
                  hours: studentData.hoursPerDay || requestData.preferredTimeRange || '',
                  days: studentData.daysPerWeek || '',
                  goal: studentData.learningGoal || '',
                  source: '',
                  requirements: studentData.specialRequirements || '',
                  budget: studentData.budget?.toString() || '',
                  category: studentData.category || '',
                  technologies: studentData.technologies || [],
                  languages: studentData.languages || [],
                }));
              } else {
                setIsEditing(true);
                setFormData(prev => ({
                  fullName: user.displayName || '',
                  gender: '',
                  phone: '',
                  whatsapp: '',
                  email: user.email || '',
                  addressFlat: '',
                  addressStreet: '',
                  addressPincode: '',
                  studentType: '',
                  classGrade: '',
                  parentName: parentData ? parentData.name : '',
                  demoMode: '',
                  board: '',
                  subjects: '',
                  classMode: '',
                  hours: '',
                  days: '',
                  goal: '',
                  source: '',
                  requirements: '',
                  budget: '',
                  category: category || '',
                  technologies: [],
                  languages: [],
                }));
              }
            } else {
              // Pre-fill name and email from auth user metadata if they don't have a profile yet
              setFormData(prev => ({
                ...prev,
                fullName: user.displayName || prev.fullName,
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

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData((prev: any) => {
      const array = prev[field] || [];
      if (array.includes(value)) {
        return { ...prev, [field]: array.filter((item: string) => item !== value) };
      } else {
        return { ...prev, [field]: [...array, value] };
      }
    });
  };

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  // Removed sessionStorage loading because dashboard handles silent submission

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const val = e.target.value;
    const name = e.target.name;
    
    setFormData((prev: any) => {
      const next = { ...prev, [name]: val };
      if (name === 'phone' && sameAsPhone) {
        next.whatsapp = val;
      }
      return next;
    });
  };

  const handleSameAsPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsPhone(checked);
    if (checked) {
      setFormData((prev: any) => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    const combinedAddress = [formData.addressFlat, formData.addressStreet, formData.addressPincode].filter(Boolean).join(', ');

    if (!isDashboard) {
      // Check if they are logged in, and sign them out so they can log in as a student
      const { auth } = await import('@/utils/firebase/client');
      if (auth.currentUser) {
        await auth.signOut();
      }

      // Save data to localStorage and redirect to signup
      localStorage.setItem('demoFormData', JSON.stringify({ ...formData, category }));
      router.push('/signup?role=student&next=/dashboard/student');
      return;
    }

    // If in dashboard, submit to Supabase
    try {
      const { auth, db } = await import('@/utils/firebase/client');
      const { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, addDoc } = await import('firebase/firestore');
      
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      // Check if we need to create the user profile first
      if (!hasProfile) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const newCode = (userDocSnap.exists() && userDocSnap.data().referralCode) || (formData.fullName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
        await setDoc(userDocRef, { hasProfile: true, referralCode: newCode }, { merge: true });
      }

      // Always update parent document to ensure parentName changes are saved
      const parentDocRef = doc(db, 'parents', user.uid);
      await setDoc(parentDocRef, { 
        id: user.uid, 
        name: formData.parentName || formData.fullName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email
      }, { merge: true });

      if (activeStudentId && activeStudentId !== 'new') {
        // Update specific student
        const studentRef = doc(db, 'students', activeStudentId);
        await updateDoc(studentRef, {
          category: formData.category || '',
          name: formData.fullName,
          gender: formData.gender,
          phoneNumber: formData.phone,
          whatsappNumber: formData.whatsapp,
          email: formData.email,
          address: combinedAddress,
          studentType: formData.studentType,
          classLevel: formData.classGrade,
          board: formData.board,
          subjects: formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : [],
          technologies: formData.technologies,
          languages: formData.languages,
          preferredMode: formData.demoMode,
          learningGoal: formData.goal,
          specialRequirements: formData.requirements,
          hoursPerDay: formData.hours,
          daysPerWeek: formData.days,
          budget: parseInt(formData.budget) || 0,
        });

        // Find the tuition request for this specific student and update it
        const requestQuery = query(collection(db, 'tuition_requests'), where('studentId', '==', activeStudentId));
        const requestSnap = await getDocs(requestQuery);
        if (!requestSnap.empty) {
          await updateDoc(requestSnap.docs[0].ref, {
            category: formData.category || '',
            studentName: formData.fullName,
            classLevel: formData.classGrade,
            board: formData.board,
            subjects: formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : [],
            technologies: formData.technologies,
            languages: formData.languages,
            mode: formData.demoMode,
            preferredTimeRange: formData.hours,
            area: combinedAddress,
            budget: parseInt(formData.budget) || 0,
          });
        }
        
        setSuccessMsg('Profile updated successfully!');
      } else {
        // Create new student record (either because activeStudentId is 'new' or no profile existed)
        const newStudentRef = await addDoc(collection(db, 'students'), {
          parentId: user.uid,
          category: formData.category || '',
          name: formData.fullName,
          gender: formData.gender,
          phoneNumber: formData.phone,
          whatsappNumber: formData.whatsapp,
          email: formData.email,
          address: combinedAddress,
          studentType: formData.studentType,
          classLevel: formData.classGrade,
          board: formData.board,
          subjects: formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : [],
          budget: parseInt(formData.budget) || 0,
          preferredMode: formData.demoMode,
          learningGoal: formData.goal,
          specialRequirements: formData.requirements,
          technologies: formData.technologies,
          languages: formData.languages,
          hoursPerDay: formData.hours,
          daysPerWeek: formData.days,
          createdAt: Date.now()
        });

        // Create the open request
        await addDoc(collection(db, 'tuition_requests'), {
          parentId: user.uid,
          studentId: newStudentRef.id,
          category: formData.category || '',
          studentName: formData.fullName,
          classLevel: formData.classGrade,
          board: formData.board,
          subjects: formData.subjects ? formData.subjects.split(',').map((s: string) => s.trim()) : [],
          technologies: formData.technologies,
          languages: formData.languages,
          mode: formData.demoMode,
          preferredTimeRange: formData.hours,
          area: combinedAddress,
          budget: parseInt(formData.budget) || 0,
          status: 'open',
          createdAt: Date.now()
        });

        setSuccessMsg('Student added successfully!');
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



  return (

    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-6xl mx-auto">

      {hasProfile && !isEditing ? (
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
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-lg font-bold text-slate-800">{formData.fullName || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Gender</p>
              <p className="text-lg font-bold text-slate-800 capitalize">{formData.gender || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Parent's Name</p>
              <p className="text-lg font-bold text-slate-800">{formData.parentName || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Category</p>
              <p className="text-lg font-bold text-purple-600 capitalize">{formData.category || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Phone / WhatsApp</p>
              <p className="text-lg font-bold text-slate-800">{formData.phone || formData.whatsapp || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Email</p>
              <p className="text-lg font-bold text-slate-800">{formData.email || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 md:col-span-2">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Residential Address</p>
              <p className="text-lg font-bold text-slate-800">{[formData.addressFlat, formData.addressStreet, formData.addressPincode].filter(Boolean).join(', ') || '-'}</p>
            </div>
            
            {formData.category === 'school' && (
              <>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Class / Grade</p>
                  <p className="text-lg font-bold text-slate-800">{formData.classGrade || '-'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Subjects</p>
                  <p className="text-lg font-bold text-slate-800">{formData.subjects || '-'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Board</p>
                  <p className="text-lg font-bold text-slate-800">{formData.board || '-'}</p>
                </div>
              </>
            )}

            {formData.category === 'programming' && formData.technologies.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Technologies</p>
                <div className="flex gap-2 flex-wrap">
                  {formData.technologies.map((t: string) => (
                    <span key={t} className="bg-purple-100/50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-md text-sm font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.category === 'languages' && formData.languages.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Languages</p>
                <div className="flex gap-2 flex-wrap">
                  {formData.languages.map((l: string) => (
                    <span key={l} className="bg-blue-100/50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md text-sm font-medium">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Budget</p>
              <p className="text-xl font-black text-emerald-600">₹{formData.budget || 0} <span className="text-sm text-slate-500 font-medium">/ month</span></p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Preferred Mode</p>
              <p className="text-lg font-bold text-slate-800">{formData.demoMode || '-'}</p>
            </div>
            
            {(formData.goal || formData.requirements) && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Goals & Requirements</p>
                <p className="text-base text-slate-700 whitespace-pre-wrap">{formData.goal} {formData.requirements}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                {hasProfile ? '👤 Edit Profile' : (isDashboard ? '🎓 Complete Demo Request' : '🎓 Book a Free Demo')}
              </h2>
              <p className="text-slate-500 text-lg">
                {hasProfile 
                  ? 'Update your details and learning preferences.'
                  : (isDashboard 
                    ? 'Review and confirm your details to book your demo session.' 
                    : 'Fill in your details to book your free demo session.')}
              </p>
            </div>
            {hasProfile && (
              <button 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

        {/* CATEGORY */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            📚 Selected Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
          >
            <option value="">Select Category</option>
            <option value="school">School / Academics</option>
            <option value="programming">Programming / IT</option>
            <option value="languages">Languages</option>
          </select>
        </div>

        {/* NAME + GENDER */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* NAME */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              👤 Full Name *
            </label>

            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              🚻 Gender *
            </label>

            <div className="flex gap-6 pt-3">

              {[
                'Female',
                'Male',
                'Other',
              ].map((item) => (

                <label
                  key={item}
                  className="flex items-center gap-2"
                >

                  <input
                    type="radio"
                    name="gender"
                    value={item}
                    checked={formData.gender === item}
                    onChange={handleChange}
                    required
                  />

                  {item}

                </label>

              ))}

            </div>
          </div>

        </div>

        {/* PHONE */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              📞 Phone Number *
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="[0-9]{10,15}"
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold">
                💬 WhatsApp No. *
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhone} className="rounded" />
                Same as Phone
              </label>
            </div>

            <input
              type="tel"
              name="whatsapp"
              placeholder="Enter WhatsApp number"
              value={formData.whatsapp}
              onChange={handleChange}
              disabled={sameAsPhone}
              required={!sameAsPhone}
              pattern="[0-9]{10,15}"
              className={`w-full border border-slate-300 rounded-xl px-4 py-4 ${sameAsPhone ? 'bg-slate-100' : ''}`}
            />
          </div>

        </div>

        {/* EMAIL + ADDRESS */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              📧 Email ID *
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              🏠 Residential Address *
            </label>

            <div className="space-y-3">
              <input
                type="text"
                name="addressFlat"
                placeholder="Flat / House No. & Building"
                value={formData.addressFlat}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              />
              <input
                type="text"
                name="addressStreet"
                placeholder="Street & Landmark"
                value={formData.addressStreet}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              />
              <input
                type="text"
                name="addressPincode"
                placeholder="Pincode"
                value={formData.addressPincode}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              />
            </div>
          </div>

        </div>

        {formData.category === 'school' && (

          <>

            {/* SCHOOL DETAILS */}
            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-semibold mb-2">
                  👨‍🎓 I am a *
                </label>

                <select
                  name="studentType"
                  value={formData.studentType}
              onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                >
                  <option>
                    Select option
                  </option>

                  <option>
                    School Student
                  </option>

                  <option>
                    College Student
                  </option>

                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  🏫 Class / Grade *
                </label>

                <select
                  name="classGrade"
                  value={formData.classGrade}
              onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                >

                  <option>
                    Select class
                  </option>

                  <option>
                    LKG
                  </option>

                  <option>
                    UKG
                  </option>

                  <option>
                    1st Standard
                  </option>

                  <option>
                    2nd Standard
                  </option>

                  <option>
                    3rd Standard
                  </option>

                  <option>
                    4th Standard
                  </option>

                  <option>
                    5th Standard
                  </option>

                  <option>
                    6th Standard
                  </option>

                  <option>
                    7th Standard
                  </option>

                  <option>
                    8th Standard
                  </option>

                  <option>
                    9th Standard
                  </option>

                  <option>
                    10th Standard
                  </option>

                  <option>
                    11th Standard
                  </option>

                  <option>
                   12th Standard
                  </option>

                  <option>
                    KCET Coaching
                  </option>

                  <option>
                    NEET Coaching
                  </option>

                  <option>
                    JEE Coaching
                  </option>

                </select>
              </div>

            </div>

            {/* BOARD */}
            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-semibold mb-2">
                  📚 Board *
                </label>

                <select
                  name="board"
                  value={formData.board}
              onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                >

                  <option>
                    Select Board
                  </option>

                  <option>
                    CBSE
                  </option>

                  <option>
                    ICSE
                  </option>

                  <option>
                    State Board
                  </option>

                  <option>
                    IB
                  </option>

                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  📖 Subjects *
                </label>

                <input
                  type="text"
                  name="subjects"
                  placeholder="Maths, Science..."
                  value={formData.subjects}
              onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                />
              </div>

            </div>

          </>
        )}

        {formData.category === 'programming' && (

          <>

            <div>
              <label className="block text-lg font-bold mb-4">
                💻 Technical Languages you want to learn
              </label>

              <div className="grid md:grid-cols-4 gap-4">

                {[
                  'Python',
                  'Java',
                  'AI & ML',
                  'HTML',
                  'Data Analytics',
                  'Gen AI',
                  'Agentic AI',
                ].map((item) => (

                  <label
                    key={item}
                    className="border border-slate-300 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-purple-500 transition-all"
                  >

                    <input 
                      type="checkbox" 
                      checked={formData.technologies.includes(item)}
                      onChange={() => handleCheckboxChange('technologies', item)}
                    />

                    {item}

                  </label>

                ))}

              </div>
            </div>

          </>
        )}

        {formData.category === 'languages' && (

          <>

            <div>
              <label className="block text-lg font-bold mb-4">
                🌍 Languages you want to learn
              </label>

              <div className="grid md:grid-cols-4 gap-4">

                {[
                  'Arabic',
                  'English',
                  'German',
                  'Japanese',
                ].map((item) => (

                  <label
                    key={item}
                    className="border border-slate-300 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-purple-500 transition-all"
                  >

                    <input 
                      type="checkbox" 
                      checked={formData.languages.includes(item)}
                      onChange={() => handleCheckboxChange('languages', item)}
                    />

                    {item}

                  </label>

                ))}

              </div>
            </div>

          </>
        )}

        {/* MODE */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-3">
              🌐 Preferred Mode *
            </label>

            {(formData.category === 'programming' ||
              formData.category === 'languages') ? (

              <div className="border-2 border-emerald-500 bg-emerald-50 rounded-xl px-4 py-4 flex items-center gap-3">

                <input
                  type="radio"
                  name="demoMode"
                  value="Online"
                  checked
                  readOnly
                />

                <span className="font-semibold text-emerald-700">
                  Online Only
                </span>

              </div>

            ) : (

              <div className="grid grid-cols-2 gap-4">

                {[
                  'Online',
                  'Offline',
                ].map((item) => (

                  <label
                    key={item}
                    className="border border-slate-300 rounded-xl px-4 py-4 flex items-center gap-3"
                  >

                    <input
                      type="radio"
                      name="demoMode"
                      value={item}
                      checked={formData.demoMode === item}
                      onChange={handleChange}
                    />

                    {item}

                  </label>

                ))}

              </div>

            )}

          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              👪 Parent / Guardian Name
            </label>

            <input
              type="text"
              name="parentName"
              placeholder="Parent Name"
              value={formData.parentName}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

        </div>

        {/* HOURS */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              ⏰ Hours per day
            </label>

            <select
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            >

              <option>
                Select Hours
              </option>

              <option>
                1 Hour
              </option>

              <option>
                2 Hours
              </option>

              <option>
                3 Hours
              </option>

              <option>
                4 Hours
              </option>

            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              📅 Days per week
            </label>

            <select
              name="days"
              value={formData.days}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            >

              <option>
                Select Days
              </option>

              <option>
                2 Days
              </option>

              <option>
                3 Days
              </option>

              <option>
                5 Days
              </option>

              <option>
                6 Days
              </option>

            </select>
          </div>

        </div>

        {/* GOAL */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            🎯 Learning Goal
          </label>

          <textarea
            rows={4}
            name="goal"
            placeholder="Write your goal..."
            value={formData.goal}
              onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />
        </div>

        {/* REQUIREMENTS */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            📝 Specific Requirements
          </label>

          <textarea
            rows={4}
            name="requirements"
            placeholder="Any specific requirements?"
            value={formData.requirements}
              onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            💰 Expected Budget / Monthly Fee (in ₹)
          </label>

          <input
            type="number"
            name="budget"
            placeholder="E.g. 5000"
            value={formData.budget}
              onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />
        </div>

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-200">
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 disabled:opacity-50 text-white py-5 rounded-xl font-semibold text-lg transition-all shadow-lg"
        >
          {loading ? 'Processing...' : (hasProfile ? '✅ Update Profile' : (isDashboard ? '✅ Confirm & Book Demo' : '🚀 Continue to Book Demo'))}
        </button>

      </form>
      </div>
      )}
    </div>
  );
}
