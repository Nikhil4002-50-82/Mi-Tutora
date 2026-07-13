"use client";

// src/app/components/TeacherForm.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface Props {
  category?: string;
  isDashboard?: boolean;
  hasProfile?: boolean;
  initialData?: any;
  onSuccess?: () => void;
}

export default function TeacherForm({
  category,
  isDashboard = false,
  hasProfile = false,
  initialData = null,
  onSuccess,
}: Props) {

  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!hasProfile);
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: initialData?.name || (typeof window !== 'undefined' ? localStorage.getItem('signup_name') || '' : ''),
    gender: initialData?.gender || '',
    phone: initialData?.phone || '',
    whatsapp: initialData?.whatsapp || '',
    email: initialData?.email || (typeof window !== 'undefined' ? localStorage.getItem('signup_email') || '' : ''),
    street: initialData?.address ? initialData.address.split(',')[0]?.trim() : '',
    city: initialData?.address ? initialData.address.split(',')[1]?.trim() : '',
    pincode: initialData?.address ? initialData.address.split(',')[2]?.trim() : '',
    qualification: initialData?.qualification || '',
    experience: initialData?.experience || '',
    occupation: initialData?.occupation || '',
    subjects: initialData?.subjects ? initialData.subjects.join(', ') : '',
    mode: initialData?.mode || '',
    description: initialData?.teachingApproach || '',
    studentsCount: initialData?.studentCount || '',
    schoolNames: initialData?.schoolNames || '',
    locations: initialData?.preferredLocations || '',
    travelKm: initialData?.travelDistance || '',
    feeRange: initialData?.feeRange || '',
    classes: initialData?.classes || [] as string[],
    boards: initialData?.boards || [] as string[],
    technologies: initialData?.technologies || [] as string[],
    languages: initialData?.languages || [] as string[],
    category: initialData?.category || category || (typeof window !== 'undefined' ? localStorage.getItem('selectedCategory') || '' : ''),
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (initialData && !dataLoaded) {
      setFormData({
        fullName: initialData.name || (typeof window !== 'undefined' ? localStorage.getItem('signup_name') || '' : ''),
        gender: initialData.gender || '',
        phone: initialData.phone || '',
        whatsapp: initialData.whatsapp || '',
        email: initialData.email || (typeof window !== 'undefined' ? localStorage.getItem('signup_email') || '' : ''),
        street: initialData.address ? initialData.address.split(',')[0]?.trim() : '',
        city: initialData.address ? initialData.address.split(',')[1]?.trim() : '',
        pincode: initialData.address ? initialData.address.split(',')[2]?.trim() : '',
        qualification: initialData.qualification || '',
        experience: initialData.experience || '',
        occupation: initialData.occupation || '',
        subjects: initialData.subjects ? initialData.subjects.join(', ') : '',
        mode: initialData.mode || '',
        description: initialData.teachingApproach || '',
        studentsCount: initialData.studentCount || '',
        schoolNames: initialData.schoolNames || '',
        locations: initialData.preferredLocations || '',
        travelKm: initialData.travelDistance || '',
        feeRange: initialData.feeRange || '',
        classes: initialData.classes || [] as string[],
        boards: initialData.boards || [] as string[],
        technologies: initialData.technologies || [] as string[],
        languages: initialData.languages || [] as string[],
        category: initialData.category || category || (typeof window !== 'undefined' ? localStorage.getItem('selectedCategory') || '' : ''),
      });
      setDataLoaded(true);
      if (!hasProfile) {
        setIsEditing(true);
      }
    }
  }, [initialData, dataLoaded, category, hasProfile]);

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
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();
    if (!formData.category) {
      alert("Please select at least one teaching category.");
      return;
    }
    
    setLoading(true);
    setSuccessMsg('');

    if (!isDashboard) {
      // Check if they are logged in, and sign them out so they can log in as a tutor
      const { auth } = await import('@/utils/firebase/client');
      if (auth.currentUser) {
        await auth.signOut();
      }

      // Save data to localStorage (more robust across OAuth redirects) and redirect to signup
      localStorage.setItem('teacherFormData', JSON.stringify({ ...formData, category }));
      router.push('/signup?role=teacher&next=/dashboard/teacher');
      return;
    }

    try {
      const { auth, db } = await import('@/utils/firebase/client');
      const { doc, setDoc, getDoc, updateDoc } = await import('firebase/firestore');
      
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      // Update user hasProfile flag and referral code
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const newCode = (userDocSnap.exists() && userDocSnap.data().referralCode) || (formData.fullName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
      await setDoc(userDocRef, { hasProfile: true, referralCode: newCode }, { merge: true });

      // Update the existing tutor record
      await setDoc(doc(db, 'tutors', user.uid), {
        category: formData.category,
        name: formData.fullName,
        email: formData.email,
        gender: formData.gender,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: [formData.street, formData.city, formData.pincode].filter(Boolean).join(', '),
        qualification: formData.qualification,
        experience: formData.experience,
        occupation: formData.occupation,
        subjects: formData.subjects.split(',').map((s: string) => s.trim()),
        mode: formData.mode,
        teachingApproach: formData.description,
        studentCount: formData.studentsCount,
        schoolNames: formData.schoolNames,
        preferredLocations: formData.locations,
        travelDistance: formData.travelKm,
        feeRange: formData.feeRange,
        classes: formData.classes,
        boards: formData.boards,
        technologies: formData.technologies,
        languagesTaught: formData.languages,
        hasProfile: true
      }, { merge: true });

      

      localStorage.removeItem('teacherFormData');
      setSuccessMsg('Profile updated successfully!');
      if (onSuccess) onSuccess();
      
      if (!isDashboard) {
        setTimeout(() => router.push('/dashboard/teacher'), 1500);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update profile');
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
              <p className="text-slate-500 mt-1 font-medium">Your teaching details and preferences.</p>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2"
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
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Teaching Categories</p>
              <div className="flex gap-2 flex-wrap mt-1">
                {[formData.category].map(c => (
                  <span key={c} className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-bold capitalize">{c}</span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Phone / WhatsApp</p>
              <p className="text-lg font-bold text-slate-800">{formData.phone || formData.whatsapp || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Email</p>
              <p className="text-lg font-bold text-slate-800">{formData.email || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Highest Qualification</p>
              <p className="text-lg font-bold text-slate-800">{formData.qualification || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Experience</p>
              <p className="text-lg font-bold text-slate-800">{formData.experience ? `${formData.experience} Years` : '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Occupation</p>
              <p className="text-lg font-bold text-slate-800">{formData.occupation || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Mode of Teaching</p>
              <p className="text-lg font-bold text-slate-800">{formData.mode || '-'}</p>
            </div>
            
            {formData.category ===('school') && (
              <>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Subjects (School)</p>
                  <p className="text-lg font-bold text-slate-800">{formData.subjects || '-'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Classes (School)</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {formData.classes.map((c: string) => (
                      <span key={c} className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-bold">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Boards (School)</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {formData.boards.map((b: string) => (
                      <span key={b} className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-bold">{b}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {formData.category ===('programming') && formData.technologies.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Technologies Taught</p>
                <div className="flex gap-2 flex-wrap">
                  {formData.technologies.map((t: string) => (
                    <span key={t} className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-bold">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {formData.category ===('languages') && formData.languages.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Languages Taught</p>
                <div className="flex gap-2 flex-wrap">
                  {formData.languages.map((l: string) => (
                    <span key={l} className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-bold">{l}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Fee Range</p>
              <p className="text-xl font-black text-emerald-600">₹{formData.feeRange || 0} <span className="text-sm text-slate-500 font-medium">/ month</span></p>
            </div>
            
            {formData.description && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Teaching Approach</p>
                <p className="text-base text-slate-700 whitespace-pre-wrap">{formData.description}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                {hasProfile ? '👤 Edit Profile' : (isDashboard ? '👨‍🏫 Complete Teacher Profile' : '👨‍🏫 Teacher Information Form')}
              </h2>
              <p className="text-slate-500 text-lg">
                {hasProfile 
                  ? 'Update your teaching details and preferences.'
                  : (isDashboard 
                    ? 'Review and confirm your details to complete your tutor profile.' 
                    : 'Fill in your details to join Mi Tutora as a tutor.')}
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

          <form onSubmit={handleSubmit} onKeyDown={(e: any) => { if (e.key === 'Enter' && e.target?.tagName !== 'TEXTAREA') e.preventDefault(); }} className="space-y-8">

        {/* CATEGORY */}
        <div>
          <label className="block text-lg font-bold mb-4">
            📚 Select Teaching Categories (Multi-select)
          </label>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: 'school', label: 'School / Academics' },
              { id: 'programming', label: 'Programming / IT' },
              { id: 'languages', label: 'Languages' },
            ].map((cat) => (
              <label
                key={cat.id}
                className="border border-slate-300 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-emerald-500 transition-all cursor-pointer"
              >
                <input 
                  type="radio" 
                  name="category"
                  checked={formData.category === cat.id}
                  onChange={() => setFormData((prev: any) => ({ ...prev, category: cat.id }))}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className="font-semibold text-slate-700">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* FULL NAME + GENDER */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* FULL NAME */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              👤 Full Name *
            </label>

            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              🚻 Gender
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
                  />

                  {item}

                </label>

              ))}

            </div>
          </div>

        </div>

        {/* PHONE + WHATSAPP */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              📞 Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold">
                💬 WhatsApp No.
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input type="checkbox" onChange={(e) => {
                  if (e.target.checked && formData.phone) {
                    setFormData({ ...formData, whatsapp: formData.phone });
                  }
                }} /> Same as Phone
              </label>
            </div>

            <input
              type="tel"
              name="whatsapp"
              placeholder="Enter WhatsApp number"
              value={formData.whatsapp}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

        </div>

        {/* EMAIL + ADDRESS */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              📧 Email ID
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
              required
            />
          </div>



          <div className="space-y-4">
            <label className="block text-sm font-semibold mb-2">🏠 Residential Address *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <input
                  type="text"
                  name="street"
                  placeholder="Street / Locality"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                  required
                />
              </div>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
                required
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
                required
              />
            </div>
          </div>

        </div>

        {/* CV */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            📄 Your Resume / CV (if available)
          </label>

          <input
            type="file"
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />
        </div>

        {/* QUALIFICATION + EXPERIENCE */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              🎓 Highest Qualification *
            </label>

            <input
              type="text"
              name="qualification"
              placeholder="Enter qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              📖 Total Teaching Experience
            </label>

            <input
              type="text"
              name="experience"
              placeholder="Years of experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

        </div>

        {/* OCCUPATION */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            💼 Current Occupation
          </label>

          <div className="grid md:grid-cols-2 gap-3">

            {[
              'Freelancer',
              'Full-Time Teacher',
              'Student',
              'Others',
            ].map((item) => (

              <label
                key={item}
                className="border border-slate-300 rounded-xl px-4 py-4 flex items-center gap-3 hover:border-emerald-500 transition-all"
              >

                <input
                  type="radio"
                  name="occupation"
                  value={item}
                  checked={formData.occupation === item}
                  onChange={handleChange}
                />

                {item}

              </label>

            ))}

          </div>
        </div>

        {/* SCHOOL CATEGORY */}
        {formData.category ===('school') && (

          <>

            {/* SUBJECTS */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                📘 Subjects you Teach
              </label>

              <input
                type="text"
                name="subjects"
                placeholder="Maths, Science, English"
                value={formData.subjects}
              onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
              />
            </div>

            {/* CLASSES */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                🏫 Classes you Teach
              </label>

              <div className="grid md:grid-cols-2 gap-3">

                {[
                  'LKG',
                  'UKG',
                  '1st - 5th',
                  '6th - 8th',
                  '9th - 10th',
                  '1st PU',
                  '2nd PU',
                  'KCET',
                  'NEET',
                  'JEE',
                ].map((item) => (

                  <label
                    key={item}
                    className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-4"
                  >

                    <input 
                      type="checkbox" 
                      checked={formData.classes.includes(item)}
                      onChange={() => handleCheckboxChange('classes', item)}
                    />

                    {item}

                  </label>

                ))}

              </div>
            </div>

            {/* BOARD */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                📚 Preferred Teaching Board
              </label>

              <div className="grid md:grid-cols-2 gap-3">

                {[
                  'CBSE',
                  'ICSE',
                  'State Board',
                  'IB / IGCSE',
                ].map((item) => (

                  <label
                    key={item}
                    className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-4"
                  >

                    <input 
                      type="checkbox" 
                      checked={formData.boards.includes(item)}
                      onChange={() => handleCheckboxChange('boards', item)}
                    />

                    {item}

                  </label>

                ))}

              </div>
            </div>

          </>
        )}

        {/* PROGRAMMING CATEGORY */}
        {formData.category ===('programming') && (

          <div>
            <label className="block text-sm font-semibold mb-3">
              💻 Technologies you Teach
            </label>

            <div className="grid md:grid-cols-2 gap-3">

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
        )}

        {/* LANGUAGE CATEGORY */}
        {formData.category ===('languages') && (

          <div>
            <label className="block text-sm font-semibold mb-3">
              🌍 Languages you Teach
            </label>

            <div className="grid md:grid-cols-2 gap-3">

              {[
                'English',
                'Arabic',
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
        )}

        {/* MODE */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            🌐 Preferred Mode
          </label>

          {(formData.category ===('programming') ||
            formData.category ===('languages'))  ? (

            <div className="border-2 border-emerald-500 bg-emerald-50 rounded-xl px-4 py-4 flex items-center gap-3">

              <input
                type="radio"
                name="mode"
                value="Online"
                checked
                readOnly
              />

              <span className="font-semibold text-emerald-700">
                Online Only
              </span>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 gap-3">

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
                    name="mode"
                    value={item}
                    checked={formData.mode === item}
                    onChange={handleChange}
                  />

                  {item}

                </label>

              ))}

            </div>

          )}

        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            📝 Teaching Approach
          </label>

          <textarea
            rows={4}
            name="description"
            placeholder="Describe your teaching approach"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />
        </div>

        {/* STUDENTS + SCHOOLS */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              👨‍🎓 Current Students Count
            </label>

            <input
              type="text"
              name="studentsCount"
              placeholder="No. of students"
              value={formData.studentsCount}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              🏫 School Names
            </label>

            <input
              type="text"
              name="schoolNames"
              placeholder="School names"
              value={formData.schoolNames}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

        </div>

        {/* LOCATION + KM */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              📍 Preferred Locations
            </label>

            <input
              type="text"
              name="locations"
              placeholder="Area / Pincode"
              value={formData.locations}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              🚗 Willing to travel within KM
            </label>

            <input
              type="text"
              name="travelKm"
              placeholder="Travel distance"
              value={formData.travelKm}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

        </div>

        {/* FEES */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            💰 Expected Fee Range
          </label>

          <input
            type="text"
            name="feeRange"
            placeholder="Expected monthly fees"
            value={formData.feeRange}
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
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-semibold py-5 rounded-xl transition-all shadow-lg text-lg"
        >
          {loading ? 'Processing...' : (hasProfile ? '✅ Save Changes' : (isDashboard ? '✅ Save Profile' : '🚀 Continue to Apply'))}
        </button>

      </form>
      </div>
      )}
    </div>
  );
}
