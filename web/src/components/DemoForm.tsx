"use client";

// src/app/components/DemoForm.tsx

import { useState } from 'react';

interface Props {
  category?: string;
}

export default function DemoForm({
  category,
}: Props) {

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

  const handleSubmit = (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    const message = `
🎓 NEW FREE DEMO REQUEST

📚 Category:
${category}

👤 Name:
${formData.fullName}

🚻 Gender:
${formData.gender}

📞 Phone:
${formData.phone}

💬 WhatsApp:
${formData.whatsapp}

📧 Email:
${formData.email}

🏠 Address:
${formData.address}

👨‍🎓 Student Type:
${formData.studentType}

🏫 Class:
${formData.classGrade}

👪 Parent Name:
${formData.parentName}

🌐 Demo Mode:
${formData.demoMode}

📚 Board:
${formData.board}

📖 Subjects:
${formData.subjects}

💻 Class Mode:
${formData.classMode}

⏰ Hours:
${formData.hours}

📅 Days:
${formData.days}

🎯 Goal:
${formData.goal}

📢 Source:
${formData.source}

📝 Requirements:
${formData.requirements}
`;

    window.open(
      `https://wa.me/917483034168?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (

    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl max-w-6xl mx-auto">

      {/* TITLE */}
      <h2 className="text-5xl font-bold text-black mb-4">
        🎓 Student Details Form
      </h2>

      <p className="text-slate-500 mb-10 text-lg">
        Fill in your details to book your free demo session.
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

        {/* SCHOOL CATEGORY */}
        {category === 'school' && (

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

        {/* PROGRAMMING CATEGORY */}
        {category === 'programming' && (

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

                    <input type="checkbox" />

                    {item}

                  </label>

                ))}

              </div>
            </div>

          </>
        )}

        {/* LANGUAGE CATEGORY */}
        {category === 'languages' && (

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

                    <input type="checkbox" />

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

            {(category === 'programming' ||
              category === 'languages') ? (

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

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white py-5 rounded-xl font-semibold text-lg transition-all shadow-lg"
        >
          🚀 Submit
        </button>

      </form>
    </div>
  );
}
