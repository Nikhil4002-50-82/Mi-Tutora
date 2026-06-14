"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { motion } from 'motion/react';
import { BookOpen, Users, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
const logo = '/imports/logo.png';

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/data/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard', error);
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'teachers', label: 'Find Tutors', icon: Users },
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      

      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-gradient-to-b from-[#063831] to-[#04241f] text-white flex-col hidden md:flex border-r border-white/5 shadow-xl z-10">
        <div className="p-6 border-b border-white/10 flex flex-col items-start gap-4">
          <div className="flex flex-col justify-center">
            <img src={logo} alt="Mi Tutora Logo" className="h-12 w-auto object-contain object-left mb-1 -ml-2" />
            <p className="text-[#00a992] text-[11px] font-bold uppercase tracking-widest mt-2">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm
                  ${isActive 
                    ? "bg-[#00a992]/10 text-[#00a992] border border-[#00a992]/20 shadow-[0_0_10px_rgba(0,169,146,0.05)]" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#00a992]" : "text-gray-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#00a992]" />
            <h1 className="font-bold text-gray-900">Student Portal</h1>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* DYNAMIC CONTENT */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto pb-24 md:pb-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Welcome back, Student!</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Hours Studied</h3>
                    <p className="text-4xl font-black text-[#063831]">{data?.progress?.hoursStudied || 0}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Courses Completed</h3>
                    <p className="text-4xl font-black text-[#00a992]">{data?.progress?.coursesCompleted || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FIND TUTORS */}
            {activeTab === 'teachers' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Available Teachers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.availableTeachers?.map((teacher: any) => (
                    <div key={teacher.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-[#00a992]/30 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                          {teacher.mode}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden leading-relaxed">{teacher.description}</p>
                      <div className="space-y-2 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl">
                        <p><strong className="text-gray-700">Subjects:</strong> {teacher.subjects}</p>
                        <p><strong className="text-gray-700">Experience:</strong> {teacher.experience}</p>
                        <p><strong className="text-gray-700">Fee:</strong> <span className="text-emerald-600 font-bold">{teacher.feeRange}</span></p>
                      </div>
                      <button className="w-full bg-[#00a992] text-white hover:bg-emerald-600 font-bold py-3 rounded-xl transition-colors shadow-md shadow-[#00a992]/20">
                        Request Tutor
                      </button>
                    </div>
                  ))}
                  {(!data?.availableTeachers || data.availableTeachers.length === 0) && (
                    <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                      No teachers currently available.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: CLASSES */}
            {activeTab === 'classes' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">My Requests & Upcoming Classes</h2>
                <div className="bg-white shadow-sm overflow-hidden sm:rounded-2xl border border-gray-100">
                  <ul className="divide-y divide-gray-100">
                    {data?.upcomingClasses?.map((cls: any) => (
                      <li key={cls.id} className="p-6 hover:bg-emerald-50/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-bold text-[#063831] truncate mb-1">{cls.subject}</p>
                            <p className="text-sm text-gray-500 font-medium">with <span className="text-[#00a992]">{cls.teacher}</span></p>
                          </div>
                          <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                            <span className="block font-semibold text-gray-700">{new Date(cls.date).toLocaleDateString()}</span>
                            <span>{new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                    {(!data?.upcomingClasses || data.upcomingClasses.length === 0) && (
                      <li className="p-8 text-sm text-gray-500 text-center font-medium">No requests or upcoming classes.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">My Profile</h2>
                <p className="text-gray-500 mb-4">Manage your account details and preferences.</p>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Email</p>
                    <p className="text-gray-900 font-bold">student@example.com</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Grade Level</p>
                    <p className="text-gray-900 font-bold">10th Grade</p>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 flex-1 rounded-xl transition-colors ${
                  isActive ? "text-[#00a992] bg-emerald-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#00a992]" : "text-gray-500"}`} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
