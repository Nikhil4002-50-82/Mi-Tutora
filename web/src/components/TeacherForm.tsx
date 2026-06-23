"use client";

// src/app/components/TeacherForm.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface Props {
  category?: string;
  isDashboard?: boolean;
  hasProfile?: boolean;
}

export default function TeacherForm({
  category,
  isDashboard = false,
  hasProfile = false,
}: Props) {

  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!hasProfile);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    qualification: '',
    experience: '',
    occupation: '',
    subjects: '',
    mode: '',
    description: '',
    studentsCount: '',
    schoolNames: '',
    locations: '',
    travelKm: '',
    feeRange: '',
    classes: [] as string[],
    boards: [] as string[],
    technologies: [] as string[],
    languages: [] as string[],
    categories: category ? [category] : [] as string[],
  });

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

  // Load profile from Supabase if inside dashboard
  useEffect(() => {
    if (isDashboard) {
      const fetchProfile = async () => {
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase.from('tutors').select('*').eq('id', user.id).single();
            if (data) {
              setIsEditing(false);
              setFormData({
                fullName: data.name || '',
                gender: data.gender || '',
                phone: data.phone || '',
                whatsapp: data.whatsapp || '',
                email: data.email || '',
                address: data.address || '',
                qualification: data.qualification || '',
                experience: data.experience || '',
                occupation: data.occupation || '',
                subjects: data.subjects ? data.subjects.join(', ') : '',
                mode: data.mode || '',
                description: data.teachingApproach || '',
                studentsCount: data.studentCount || '',
                schoolNames: data.schoolNames || '',
                locations: data.preferredLocations || '',
                travelKm: data.travelDistance || '',
                feeRange: data.feeRange || '',
                classes: data.classes || [],
                boards: data.boards || [],
                technologies: data.technologies || [],
                languages: data.languagesTaught || [],
                categories: data.category ? data.category.split(',').map((c:string) => c.trim()) : [],
              });
            }
          }
        } catch (e) {
          console.error('Failed to load profile', e);
        }
      };
      fetchProfile();
    }
  }, [isDashboard]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    if (!isDashboard) {
      // Check if they are logged in, and sign them out so they can log in as a tutor
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.signOut();
      }

      // Save data to localStorage (more robust across OAuth redirects) and redirect to signup
      localStorage.setItem('teacherFormData', JSON.stringify({ ...formData, category }));
      router.push('/signup?role=teacher&next=/dashboard/teacher');
      return;
    }

    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Update user hasProfile flag
      await supabase.from('users').update({ hasProfile: true }).eq('id', user.id);

      // Update the existing tutor record
      const { error } = await supabase.from('tutors').update({
        category: formData.categories.join(','),
        name: formData.fullName,
        gender: formData.gender,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address,
        qualification: formData.qualification,
        experience: formData.experience,
        occupation: formData.occupation,
        subjects: formData.subjects.split(',').map(s => s.trim()),
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
      }).eq('id', user.id);

      if (error) throw error;

      localStorage.removeItem('teacherFormData');
      setSuccessMsg('Profile updated successfully!');
      
      if (isDashboard) {
        window.location.reload();
      } else {
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
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Teaching Categories</p>
              <div className="flex gap-2 flex-wrap mt-1">
                {formData.categories.map(c => (
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
            
            {formData.categories.includes('school') && (
              <>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Subjects (School)</p>
                  <p className="text-lg font-bold text-slate-800">{formData.subjects || '-'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Classes (School)</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {formData.classes.map(c => (
                      <span key={c} className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-bold">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Boards (School)</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {formData.boards.map(b => (
                      <span key={b} className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-bold">{b}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {formData.categories.includes('programming') && formData.technologies.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Technologies Taught</p>
                <div className="flex gap-2 flex-wrap">
                  {formData.technologies.map(t => (
                    <span key={t} className="bg-emerald-100/50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-sm font-bold">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {formData.categories.includes('languages') && formData.languages.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Languages Taught</p>
                <div className="flex gap-2 flex-wrap">
                  {formData.languages.map(l => (
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

          <form onSubmit={handleSubmit} className="space-y-8">

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
                  type="checkbox" 
                  checked={formData.categories.includes(cat.id)}
                  onChange={() => handleCheckboxChange('categories', cat.id)}
                  className="w-5 h-5 accent-emerald-500 rounded"
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
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              💬 WhatsApp No.
            </label>

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



          <div>
            <label className="block text-sm font-semibold mb-2">
              🏠 Residential Address *
            </label>

            <textarea
              rows={4}
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
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
                  onChange={handleChange}
                />

                {item}

              </label>

            ))}

          </div>
        </div>

        {/* SCHOOL CATEGORY */}
        {formData.categories.includes('school') && (

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
        {formData.categories.includes('programming') && (

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
        {formData.categories.includes('languages') && (

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

          {(formData.categories.includes('programming') ||
            formData.categories.includes('languages')) && !formData.categories.includes('school') ? (

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
