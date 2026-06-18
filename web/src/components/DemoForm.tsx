"use client";

// src/app/components/DemoForm.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface Props {
  category?: string;
  isDashboard?: boolean;
  hasProfile?: boolean;
}

export default function DemoForm({
  category,
  isDashboard = false,
  hasProfile = false,
}: Props) {

  const [isEditing, setIsEditing] = useState(!hasProfile);
  const [formData, setFormData] =
    useState({
      fullName: '',
      gender: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
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
    });

  // Load profile from Supabase if inside dashboard and hasProfile is true
  useEffect(() => {
    if (isDashboard && hasProfile) {
      const fetchProfile = async () => {
        try {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Fetch student data
            const { data: studentData } = await supabase.from('students').select('*').eq('parentId', user.id).single();
            // Fetch tuition request data
            const { data: requestData } = await supabase.from('tuition_requests').select('*').eq('parentId', user.id).order('created_at', { ascending: false }).limit(1).single();
            
            if (studentData && requestData) {
              setIsEditing(false);
              setFormData({
                fullName: studentData.name || '',
                gender: studentData.gender || '',
                phone: studentData.phoneNumber || '',
                whatsapp: studentData.whatsappNumber || '',
                email: studentData.email || '',
                address: studentData.address || '',
                studentType: studentData.studentType || '',
                classGrade: studentData.classLevel || '',
                parentName: '', // parents table name
                demoMode: studentData.preferredMode || '',
                board: studentData.board || '',
                subjects: studentData.subjects ? studentData.subjects.join(', ') : '',
                classMode: '',
                hours: requestData.preferredTimeRange || '',
                days: '',
                goal: studentData.learningGoal || '',
                source: '',
                requirements: studentData.specialRequirements || '',
                budget: studentData.budget?.toString() || '',
                category: studentData.category || '',
                technologies: studentData.technologies || [],
                languages: studentData.languages || [],
              });
            }
          }
        } catch (e) {
          console.error('Failed to load profile', e);
        }
      };
      fetchProfile();
    }
  }, [isDashboard, hasProfile]);

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
      // Check if they are logged in, and sign them out so they can log in as a student
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.signOut();
      }

      // Save data to localStorage and redirect to signup
      localStorage.setItem('demoFormData', JSON.stringify({ ...formData, category }));
      router.push('/signup?role=student&next=/dashboard/student');
      return;
    }

    // If in dashboard, submit to Supabase
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      if (hasProfile) {
        // Update existing records
        const { error: studentError } = await supabase.from('students').update({
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
          subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [],
          technologies: formData.technologies,
          languages: formData.languages,
          preferredMode: formData.demoMode,
          learningGoal: formData.goal,
          specialRequirements: formData.requirements,
          budget: parseInt(formData.budget) || 0,
        }).eq('parentId', user.id);

        if (studentError) throw studentError;

        const { error: reqError } = await supabase.from('tuition_requests').update({
          category: formData.category || '',
          studentName: formData.fullName,
          classLevel: formData.classGrade,
          board: formData.board,
          subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [],
          technologies: formData.technologies,
          languages: formData.languages,
          mode: formData.demoMode,
          preferredTimeRange: formData.hours,
          area: formData.address,
          budget: parseInt(formData.budget) || 0,
        }).eq('parentId', user.id);
        
        if (reqError) throw reqError;
        
        setSuccessMsg('Profile updated successfully!');
      } else {
        // Mark user as having profile
        await supabase.from('users').update({ hasProfile: true }).eq('id', user.id);

        // Fetch parent (create if not exists)
        const { data: existingParent } = await supabase.from('parents').select('id').eq('id', user.id).single();
        if (!existingParent) {
          await supabase.from('parents').insert({ id: user.id, name: formData.parentName || formData.fullName });
        }

        // Create student record
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
          subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [],
          budget: parseInt(formData.budget) || 0,
          preferredMode: formData.demoMode,
          learningGoal: formData.goal,
          specialRequirements: formData.requirements,
          technologies: formData.technologies,
          languages: formData.languages,
        }).select('id').single();

        // Create the open request
        const { error } = await supabase.from('tuition_requests').insert({
          parentId: user.id,
          studentId: newStudent?.id,
          category: formData.category || '',
          studentName: formData.fullName,
          classLevel: formData.classGrade,
          board: formData.board,
          subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [],
          technologies: formData.technologies,
          languages: formData.languages,
          mode: formData.demoMode,
          preferredTimeRange: formData.hours,
          area: formData.address,
          budget: parseInt(formData.budget) || 0,
          status: 'open'
        });

        if (error) throw error;
        setSuccessMsg('Demo request submitted successfully!');
      }

      sessionStorage.removeItem('demoFormData');
      if (isDashboard) {
        window.location.reload();
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
                  {formData.technologies.map(t => (
                    <span key={t} className="bg-purple-100/50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-bold">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {formData.category === 'languages' && formData.languages.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 col-span-1 md:col-span-2">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Languages</p>
                <div className="flex gap-2 flex-wrap">
                  {formData.languages.map(l => (
                    <span key={l} className="bg-purple-100/50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-sm font-bold">{l}</span>
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
              onChange={handleChange}
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
                    onChange={handleChange}
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
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              💬 WhatsApp No. *
            </label>

            <input
              type="tel"
              name="whatsapp"
              placeholder="Enter WhatsApp number"
              onChange={handleChange}
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
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
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
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
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
