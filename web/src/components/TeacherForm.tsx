"use client";

// src/app/components/TeacherForm.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateReferralCode } from '@/utils/referral';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';


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
  const [locationLoading, setLocationLoading] = useState(false);
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
    subjects: initialData?.subjects || [] as string[],
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
        subjects: initialData.subjects || [] as string[],
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

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        const street = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
        const city = data.address?.city || data.address?.town || data.address?.state_district || '';
        const pincode = data.address?.postcode || '';
        
        setFormData((prev: any) => ({
          ...prev,
          street: street || prev.street,
          city: city || prev.city,
          pincode: pincode || prev.pincode
        }));
      } catch (err) {
        console.error('Error fetching location details:', err);
        alert('Failed to automatically detect your address. Please enter it manually.');
      } finally {
        setLocationLoading(false);
      }
    }, (error) => {
      console.warn('Geolocation error:', error.message);
      alert('Failed to get location. Please ensure location permissions are granted.');
      setLocationLoading(false);
    }, { timeout: 10000 });
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
      const newCode = (userDocSnap.exists() && userDocSnap.data().referralCode) || generateReferralCode(formData.fullName, user.uid);
      await setDoc(userDocRef, { hasProfile: true, referralCode: newCode }, { merge: true });

      // Update the existing tutor record
      const isOnlineOnlyCategory = formData.category === 'programming' || formData.category === 'languages';
      const actualMode = isOnlineOnlyCategory ? 'Online' : formData.mode;
      
      await setDoc(doc(db, 'tutors', user.uid), {
        id: user.uid,
        category: formData.category,
        name: formData.fullName,
        email: formData.email,
        gender: formData.gender,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        mode: actualMode,
        address: (actualMode?.toLowerCase() === 'online') ? '' : [formData.street, formData.city, formData.pincode].filter(Boolean).join(', '),
        qualification: formData.qualification,
        experience: formData.experience,
        occupation: formData.occupation,
        subjects: formData.subjects,
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
        knownLanguages: [],
        preferredTimeRange: '',
        price: 0,
        rating: 0.0,
        area: (actualMode?.toLowerCase() === 'online') ? '' : (formData.street || ''),
        city: (actualMode?.toLowerCase() === 'online') ? '' : (formData.city || ''),
        latitude: 0.0,
        longitude: 0.0,
        hasProfile: true
      }, { merge: true });

      

      localStorage.removeItem('teacherFormData');
      setSuccessMsg('Profile updated successfully!');
      toast.success("Profile saved successfully!", { description: "Your teacher profile has been updated." });
      setIsEditing(false);
      if (onSuccess) onSuccess();
      
      if (!isDashboard) {
        setTimeout(() => router.push('/dashboard/teacher'), 1500);
      }
    } catch (error: any) {
      toast.error('Failed to update profile', { description: error.message });
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-10 shadow-2xl max-w-6xl mx-auto">

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
              <p className="text-lg font-bold text-slate-800">{formData.experience || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Occupation</p>
              <p className="text-lg font-bold text-slate-800">{formData.occupation || '-'}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Mode of Teaching</p>
              <p className="text-lg font-bold text-slate-800">{(formData.category === 'programming' || formData.category === 'languages') ? 'Online' : (formData.mode || '-')}</p>
            </div>
            
            {formData.category ===('school') && (
              <>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Subjects (School)</p>
                  <p className="text-lg font-bold text-slate-800">{formData.subjects?.length > 0 ? formData.subjects.join(', ') : '-'}</p>
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
                    : 'Fill in your details to join MiTutora as a tutor.')}
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
          <label className="block text-sm font-semibold mb-2">📚 Selected Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
            required
          >
            <option value="">Select Category</option>
            <option value="school">School / Academics</option>
            <option value="programming">Programming / IT</option>
            <option value="languages">Languages</option>
          </select>
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
              🚻 Gender *
            </label>

            <div className="flex flex-wrap gap-4 sm:gap-6 pt-3">

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
              📞 Phone Number *
            </label>

            <input
              type="tel"
              name="phone"
              maxLength={10}
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit phone number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold">
                💬 WhatsApp No. *
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhone} /> Same as Phone
              </label>
            </div>

            <input
              type="tel"
              name="whatsapp"
              maxLength={10}
              pattern="[0-9]{10}"
              placeholder="Enter 10-digit WhatsApp number"
              value={formData.whatsapp}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
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
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
              required
            />
          </div>



        {/* MODE */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            🌐 Preferred Mode *
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

          {(formData.mode !== 'Online' && formData.category !== 'programming' && formData.category !== 'languages') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="block text-sm font-semibold">🏠 Residential Address *</label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={locationLoading}
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 shadow-sm"
                >
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  {locationLoading ? 'Detecting...' : 'Auto-Detect Location'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street / Locality"
                    value={formData.street}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-4"
                    required={formData.mode !== 'Online'}
                  />
                </div>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                  required={formData.mode !== 'Online'}
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-4"
                  required={formData.mode !== 'Online'}
                />
              </div>
            </div>
          )}

        </div>

        {/* CV */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            📄 Your Resume / CV (if available)
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  alert("File size exceeds the 5MB limit. Please upload a smaller file.");
                  e.target.value = '';
                } else if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
                  alert("Invalid file format. Only PDF and Word documents are allowed.");
                  e.target.value = '';
                }
              }
            }}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#00a992]/10 file:text-[#00a992] hover:file:bg-[#00a992]/20 transition-all cursor-pointer"
          />
          <p className="text-xs text-slate-500 mt-2 font-medium">Max size: 5MB. Formats allowed: PDF, DOCX.</p>
        </div>

        {/* QUALIFICATION + EXPERIENCE */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block text-sm font-semibold mb-2">
              🎓 Highest Qualification *
            </label>

            <select
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
            >
              <option value="">Select Qualification</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
              <option value="B.E / B.Tech">B.E / B.Tech</option>
              <option value="B.Sc">B.Sc</option>
              <option value="B.A">B.A</option>
              <option value="B.Com">B.Com</option>
              <option value="M.Sc">M.Sc</option>
              <option value="M.A">M.A</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              📖 Total Teaching Experience *
            </label>

            <select
              name="experience"
              value={formData.experience || ''}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-white"
            >
              <option value="" disabled>Select your experience</option>
              <option value="Fresher (No experience)">Fresher (No experience)</option>
              <option value="Less than 1 Year">Less than 1 Year</option>
              <option value="1-3 Years">1-3 Years</option>
              <option value="4-6 Years">4-6 Years</option>
              <option value="7-10 Years">7-10 Years</option>
              <option value="10+ Years">10+ Years</option>
            </select>
          </div>

        </div>

        {/* OCCUPATION */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            💼 Current Occupation
          </label>

          <input
            type="text"
            name="occupation"
            placeholder="e.g. Full-Time Teacher, Software Engineer, Student"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-xl px-4 py-4"
          />
        </div>

        {/* SCHOOL CATEGORY */}
        {formData.category ===('school') && (

          <>

            {/* CLASSES */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                🏫 Classes you Teach *
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
                📚 Preferred Teaching Board *
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

          {/* SUBJECTS */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                📘 Subjects you Teach *
              </label>

              {formData.boards.length === 0 || formData.classes.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">Please select at least one class and one board below to see the subjects.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-3">
                  {(() => {
                    let availableSubjects = new Set();
                    
                    const hasEarly = formData.classes.some((c: string) => ['LKG', 'UKG', '1st - 5th'].includes(c));
                    const hasMiddle = formData.classes.some((c: string) => ['6th - 8th'].includes(c));
                    const hasHigh = formData.classes.some((c: string) => ['9th - 10th'].includes(c));
                    const hasPU = formData.classes.some((c: string) => ['1st PU', '2nd PU'].includes(c));

                    if (formData.boards.includes('ICSE')) {
                      if (hasEarly) ['English', 'Second Language', 'Mathematics', 'Environmental Studies (EVS)', 'General Knowledge (GK)', 'Computer', 'Art', 'Music', 'Physical Education', 'Moral Science', 'Science', 'Social Studies'].forEach(s => availableSubjects.add(s));
                      if (hasMiddle) ['English Language', 'English Literature', 'Second Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Integrated Science', 'History', 'Civics', 'Geography', 'Computer Applications', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasHigh) ['English Language', 'English Literature', 'Second Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Civics', 'Geography', 'Computer Applications', 'Physical Education', 'Economics', 'Commercial Studies', 'Yoga', 'Home Science'].forEach(s => availableSubjects.add(s));
                      if (hasPU) ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Business Studies', 'Economics', 'KCET', 'NEET', 'JEE'].forEach(s => availableSubjects.add(s));
                    }
                    if (formData.boards.includes('CBSE')) {
                      if (hasEarly) ['English', 'Mathematics', 'EVS', 'Hindi/Regional Language', 'Hindi', 'Computer', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasMiddle) ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Sanskrit/Third Language', 'Computer', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasHigh) ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Artificial Intelligence/Information Technology', 'Health & Physical Education', 'Skill Subjects', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasPU) ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Business Studies', 'Economics', 'KCET', 'NEET', 'JEE'].forEach(s => availableSubjects.add(s));
                    }
                    if (formData.boards.includes('State Board') || formData.boards.includes('IB / IGCSE')) {
                      if (hasEarly) ['Kannada', 'English', 'Mathematics', 'EVS', 'Science', 'Social Science', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasMiddle) ['Kannada', 'English', 'Hindi/Third Language', 'Mathematics', 'Science', 'Social Science', 'Computer', 'Art', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasHigh) ['Kannada', 'English', 'Hindi/Third Language', 'Mathematics', 'Science', 'Social Science', 'Computer', 'Physical Education'].forEach(s => availableSubjects.add(s));
                      if (hasPU) ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English', 'Accountancy', 'Business Studies', 'Economics', 'KCET', 'NEET', 'JEE'].forEach(s => availableSubjects.add(s));
                    }

                    return Array.from(availableSubjects).sort().map((sub: any) => (
                      <label
                        key={sub as string}
                        className="flex items-center gap-3 border border-slate-300 rounded-xl px-4 py-3 hover:border-emerald-500 transition-all cursor-pointer"
                      >
                        <input 
                          type="checkbox" 
                          checked={formData.subjects?.includes(sub as string)}
                          onChange={() => handleCheckboxChange('subjects', sub as string)}
                          className="accent-emerald-500"
                        />
                        <span className="text-sm font-medium">{sub as string}</span>
                      </label>
                    ));
                  })()}
                </div>
              )}
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
        {(formData.mode !== 'Online' && formData.category !== 'programming' && formData.category !== 'languages') && (
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-semibold mb-2">
                📍 Preferred Locations *
              </label>

              <input
                type="text"
                name="locations"
                placeholder="Area / Pincode"
                value={formData.locations}
                onChange={handleChange}
                required={formData.mode !== 'Online'}
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                🚗 Willing to travel within KM *
              </label>

              <input
                type="text"
                name="travelKm"
                placeholder="Travel distance"
                value={formData.travelKm}
                onChange={handleChange}
                required={formData.mode !== 'Online'}
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
              />
            </div>

          </div>
        )}

        {/* FEES */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            💰 Expected Fee Range *
          </label>

          <div className="flex justify-between items-center mb-2">
            <span className="text-emerald-600 font-bold">₹{formData.feeRange || 1000}</span>
          </div>
          <input
            type="range"
            name="feeRange"
            min="1000"
            max="20000"
            step="500"
            value={formData.feeRange || 1000}
            onChange={handleChange}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
            <span>₹1,000</span>
            <span>₹20,000</span>
          </div>
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
