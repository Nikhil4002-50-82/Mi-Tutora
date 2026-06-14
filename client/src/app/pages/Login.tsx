import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, Sparkles, BookOpen, Users, Award, Briefcase, GraduationCap } from 'lucide-react';
import logo from '../../imports/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const isTeacher = role === 'teacher';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (response.data.user.role === 'student') {
          navigate('/dashboard/student');
        } else {
          navigate('/dashboard/teacher');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Helmet>
        <title>{isTeacher ? 'Teacher Login' : 'Student Login'} - Mi Tutora</title>
        <meta name="description" content="Login to your Mi Tutora dashboard" />
      </Helmet>

      {/* LEFT COLUMN - BRANDING (Hidden on Mobile) */}
      <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 transition-colors duration-700
        ${isTeacher ? 'bg-gradient-to-br from-[#04241f] to-[#021411]' : 'bg-gradient-to-br from-[#063831] to-[#04241f]'}
      `}>
        {/* Decorative Background Elements */}
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3 transition-colors duration-700
          ${isTeacher ? 'bg-emerald-500/10' : 'bg-[#00a992]/20'}
        `} />
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3 transition-colors duration-700
          ${isTeacher ? 'bg-orange-500/10' : 'bg-emerald-500/20'}
        `} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Logo & Role Selector Toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl">
              <img src={logo} alt="Mi Tutora Logo" className="h-8 w-auto object-contain" />
            </div>
            <span className="text-white font-bold text-xl tracking-wide">Mi Tutora</span>
          </div>

          <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10">
            <button
              onClick={() => navigate('/login?role=student')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${!isTeacher ? 'bg-white text-[#063831] shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              Student
            </button>
            <button
              onClick={() => navigate('/login?role=teacher')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${isTeacher ? 'bg-white text-[#063831] shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              Teacher
            </button>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg mt-20 mb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                <Sparkles className={`w-4 h-4 ${isTeacher ? 'text-emerald-400' : 'text-[#00a992]'}`} />
                <span className="text-sm text-emerald-100 font-semibold uppercase tracking-wider">
                  {isTeacher ? 'Educator Portal' : 'Student Portal'}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                {isTeacher ? (
                  <>Empower the next <br /> <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">generation.</span></>
                ) : (
                  <>Transform your <br /> <span className="bg-gradient-to-r from-[#00a992] to-emerald-300 bg-clip-text text-transparent">learning journey.</span></>
                )}
              </h1>
              
              <p className="text-emerald-100/80 text-lg leading-relaxed font-medium mb-12">
                {isTeacher 
                  ? "Join India's top platform for educators. Manage your schedule, teach passionate students, and grow your teaching career with complete flexibility."
                  : "Join India's fastest-growing platform connecting students with highly qualified, background-verified tutors for offline and online classes."
                }
              </p>

              {/* Feature Highlights */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    {isTeacher ? <Briefcase className="w-6 h-6 text-emerald-400" /> : <Users className="w-6 h-6 text-[#00a992]" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{isTeacher ? 'Flexible Schedule' : '10,000+ Active Students'}</h3>
                    <p className="text-emerald-100/60 text-sm">{isTeacher ? 'Teach on your own terms' : 'Learning across India'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    {isTeacher ? <GraduationCap className="w-6 h-6 text-emerald-400" /> : <Award className="w-6 h-6 text-[#00a992]" />}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{isTeacher ? 'Great Earnings' : 'Verified Educators'}</h3>
                    <p className="text-emerald-100/60 text-sm">{isTeacher ? 'Consistent and reliable payouts' : 'Top 1% of teaching talent'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-emerald-100/60 text-sm font-medium flex justify-between">
          <span>© {new Date().getFullYear()} Mi Tutora. All rights reserved.</span>
          <span className="opacity-50">Support: +91 7483034168</span>
        </div>
      </div>

      {/* RIGHT COLUMN - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-white">
        
        {/* Subtle mobile background glow */}
        <div className={`lg:hidden absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 transition-colors duration-700
          ${isTeacher ? 'bg-emerald-500/5' : 'bg-[#00a992]/5'}
        `} />

        <motion.div 
          key={role + '-form'}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo & Role Selector */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <img src={logo} alt="Mi Tutora Logo" className="h-12 w-auto object-contain mb-6" />
            <div className="flex bg-gray-100 p-1 rounded-xl w-full max-w-[240px]">
              <button
                onClick={() => navigate('/login?role=student')}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${!isTeacher ? 'bg-white text-[#063831] shadow-sm' : 'text-gray-500'}`}
              >
                Student
              </button>
              <button
                onClick={() => navigate('/login?role=teacher')}
                className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${isTeacher ? 'bg-white text-[#063831] shadow-sm' : 'text-gray-500'}`}
              >
                Teacher
              </button>
            </div>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
              {isTeacher ? 'Teacher Login' : 'Student Login'}
            </h2>
            <p className="text-gray-500 font-medium">Please sign in to access your {isTeacher ? 'educator' : 'student'} dashboard</p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-sm font-medium border border-red-100 flex items-center justify-center lg:justify-start"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-2">
                Email<span className="text-[#00a992] ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-4 transition duration-300 placeholder:text-gray-400 font-medium hover:border-gray-300
                    ${isTeacher ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-[#00a992] focus:ring-[#00a992]/10'}
                  `}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs sm:text-sm font-bold text-gray-700">
                  Password<span className="text-[#00a992] ml-0.5">*</span>
                </label>
                <a href="#" className={`text-xs font-bold hover:text-emerald-700 transition-colors ${isTeacher ? 'text-emerald-500' : 'text-[#00a992]'}`}>
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-4 transition duration-300 placeholder:text-gray-400 font-medium hover:border-gray-300
                    ${isTeacher ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-[#00a992] focus:ring-[#00a992]/10'}
                  `}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`group w-full disabled:opacity-70 text-white py-4 rounded-2xl text-base font-bold transition duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer mt-4
                ${isTeacher 
                  ? 'bg-gradient-to-r from-[#04241f] to-emerald-800 hover:from-emerald-900 hover:to-emerald-700 shadow-emerald-900/20 hover:shadow-emerald-900/40' 
                  : 'bg-[#063831] hover:bg-[#04241f] shadow-[#063831]/20 hover:shadow-[#063831]/40'
                }
              `}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign in to {isTeacher ? 'Educator' : 'Student'} Dashboard
                </>
              )}
            </button>
          </form>

          {/* Test Accounts Box dynamically updates based on role */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 text-center lg:text-left">Test Account Details</p>
            <div className={`p-5 rounded-2xl border text-sm space-y-3 transition-colors duration-500
              ${isTeacher ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100'}
            `}>
              {isTeacher ? (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span className="font-bold text-emerald-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Teacher Login
                  </span>
                  <span className="font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 shadow-sm">
                    teacher@test.com / password
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span className="font-bold text-[#063831] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#00a992]" />
                    Student Login
                  </span>
                  <span className="font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 shadow-sm">
                    student@test.com / password
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
