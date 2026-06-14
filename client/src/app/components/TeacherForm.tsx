// src/app/components/TeacherForm.tsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

interface Props {
  category?: string;
}

export default function TeacherForm({
  category,
}: Props) {

  const navigate = useNavigate();
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
    travelKm: '',
    feeRange: '',
    password: '',
  });

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

    try {
      // Add category to formData payload
      const payload = { ...formData, category };
      const response = await axios.post('http://localhost:3001/api/auth/register-teacher', payload);

      if (response.data.success) {
        setSuccessMsg('Registration successful! Redirecting to dashboard...');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => navigate('/dashboard/teacher'), 1500);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-6xl mx-auto">

      {/* TITLE */}
      <h2 className="text-5xl font-bold text-black mb-4">
        👨‍🏫 Teacher Information Form
      </h2>

      <p className="text-slate-500 mb-10 text-lg">
        Fill in your details to join Mi Tutora as a tutor.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* CATEGORY */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            📚 Selected Category
          </label>

          <input
            type="text"
            value={category || ''}
            readOnly
            className="w-full border border-slate-300 rounded-xl px-4 py-4 bg-slate-100"
          />
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
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              🔒 Set Password *
            </label>

            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
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
        {category === 'school' && (

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

                    <input type="checkbox" />

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

                    <input type="checkbox" />

                    {item}

                  </label>

                ))}

              </div>
            </div>

          </>
        )}

        {/* PROGRAMMING CATEGORY */}
        {category === 'programming' && (

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

                  <input type="checkbox" />

                  {item}

                </label>

              ))}

            </div>
          </div>
        )}

        {/* LANGUAGE CATEGORY */}
        {category === 'languages' && (

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

                  <input type="checkbox" />

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

          {(category === 'programming' ||
            category === 'languages') ? (

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

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-semibold py-5 rounded-xl transition-all shadow-lg text-lg"
        >
          {loading ? 'Submitting...' : '🚀 Submit Application'}
        </button>

      </form>
    </div>
  );
}