"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import { motion } from 'motion/react';
import { CalendarDays, Wallet, LayoutDashboard, LogOut, ShieldCheck, User } from 'lucide-react';
const logo = '/imports/logo.png';

export default function TeacherDashboard() {
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
        const response = await axios.get('http://localhost:3001/api/data/teacher/dashboard', {
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
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      

      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-gradient-to-b from-[#063831] to-[#04241f] text-white flex-col hidden md:flex border-r border-white/5 shadow-xl z-10">
        <div className="p-6 border-b border-white/10 flex flex-col items-start gap-4">
          <div className="flex flex-col justify-center">
            <img src={logo} alt="Mi Tutora Logo" className="h-12 w-auto object-contain object-left mb-1 -ml-2" />
            <p className="text-[#00a992] text-[11px] font-bold uppercase tracking-widest mt-2">Teacher Portal</p>
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
            <h1 className="font-bold text-gray-900">Teacher Portal</h1>
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
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Welcome back, Teacher!</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                      <Wallet className="w-7 h-7 text-[#00a992]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wide">Total Earnings</h3>
                      <p className="text-4xl font-black text-[#063831]">${data?.earnings?.total || 0}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-6">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
                      <Wallet className="w-7 h-7 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wide">Pending Payments</h3>
                      <p className="text-4xl font-black text-orange-600">${data?.earnings?.pending || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EARNINGS */}
            {activeTab === 'earnings' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Earnings Breakdown</h2>
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 max-w-3xl">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                      <p className="text-gray-500 font-medium mb-2">Available for Withdrawal</p>
                      <h3 className="text-5xl font-black text-[#00a992]">${data?.earnings?.total || 0}</h3>
                    </div>
                    <button className="bg-[#063831] hover:bg-[#04241f] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
                      Withdraw Funds
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SCHEDULE */}
            {activeTab === 'schedule' && (
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">Interested Students & Schedule</h2>
                <div className="bg-white shadow-sm overflow-hidden sm:rounded-2xl border border-gray-100">
                  <ul className="divide-y divide-gray-100">
                    {data?.schedule?.map((session: any) => (
                      <li key={session.id} className="p-6 hover:bg-emerald-50/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-bold text-[#063831] truncate mb-1">{session.student}</p>
                            <p className="text-sm font-medium text-gray-500">{session.subject}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                              <span className="block font-semibold text-gray-700">{new Date(session.date).toLocaleDateString()}</span>
                              <span>{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                              session.status === 'confirmed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                    {(!data?.schedule || data.schedule.length === 0) && (
                      <li className="p-8 text-sm text-gray-500 text-center font-medium">No classes scheduled.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 max-w-2xl">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-8">My Profile</h2>
                <p className="text-gray-500 mb-4">Manage your teacher account and availability.</p>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Email</p>
                    <p className="text-gray-900 font-bold">teacher@example.com</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Status</p>
                    <p className="text-emerald-600 font-bold">Active</p>
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
