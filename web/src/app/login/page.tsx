"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, Sparkles, BookOpen, Users, Award, Briefcase, GraduationCap, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
const logo = '/imports/logo.png';
import { getFriendlyAuthError } from '@/utils/authErrors';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address to reset password.');
      return;
    }
    try {
      const { auth } = await import('@/utils/firebase/client');
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      toast.error(getFriendlyAuthError(err));
    }
  };
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const isTeacher = role === 'teacher';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { auth, db } = await import('@/utils/firebase/client');
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { doc, getDoc } = await import('firebase/firestore');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        if (!user.emailVerified) {
          await auth.signOut();
          toast.error("Please verify your email before logging in. Check your inbox.");
          return;
        }

        // Fetch user role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userRole = userDoc.exists() ? userDoc.data().role : role;
        
        localStorage.setItem('user', JSON.stringify({ id: user.uid, email: user.email, role: userRole }));
        
        toast.success("Login successful!");
        if (userRole === 'student') {
          router.push(searchParams.get('next') || '/dashboard/student');
        } else {
          router.push(searchParams.get('next') || '/dashboard/teacher');
        }
      }
    } catch (err: any) {
      toast.error(getFriendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      

      {/* LEFT COLUMN - BRANDING (Visible on Mobile as Banner) */}
      <div className={`flex w-full lg:w-1/2 relative overflow-hidden flex-col justify-between p-6 pt-8 pb-16 lg:p-12 transition-colors duration-700
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
              onClick={() => router.push('/login?role=student')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${!isTeacher ? 'bg-white text-[#063831] shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              Student
            </button>
            <button
              onClick={() => router.push('/login?role=teacher')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${isTeacher ? 'bg-white text-[#063831] shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              Teacher
            </button>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg mt-12 lg:mt-20 mb-8 lg:mb-20">
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
              
              <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight mb-4 lg:mb-6 tracking-tight">
                {isTeacher ? (
                  <>Empower the next <br /> <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">generation.</span></>
                ) : (
                  <>Transform your <br /> <span className="bg-gradient-to-r from-[#00a992] to-emerald-300 bg-clip-text text-transparent">learning journey.</span></>
                )}
              </h1>
              
              <p className="hidden lg:block text-emerald-100/80 text-lg leading-relaxed font-medium mb-12">
                {isTeacher 
                  ? "Join India's top platform for educators. Manage your schedule, teach passionate students, and grow your teaching career with complete flexibility."
                  : "Join India's fastest-growing platform connecting students with highly qualified, background-verified tutors for offline and online classes."
                }
              </p>

              {/* Feature Highlights */}
              <div className="hidden lg:block space-y-6">
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
        <div className="hidden lg:flex relative z-10 text-emerald-100/60 text-sm font-medium justify-between">
          <span>© {new Date().getFullYear()} Mi Tutora. All rights reserved.</span>
          <span className="opacity-50">Support: +91 7483034168</span>
        </div>
      </div>

      {/* RIGHT COLUMN - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 relative overflow-hidden bg-white min-h-screen lg:min-h-0 -mt-8 lg:mt-0 rounded-t-[2.5rem] lg:rounded-none z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-none">
        
        {/* Subtle mobile background glow */}
        <div className={`lg:hidden absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -translate-y-1/2 transition-colors duration-700
          ${isTeacher ? 'bg-emerald-500/5' : 'bg-[#00a992]/5'}
        `} />

        {/* Back to Home Button (Mobile & Desktop) */}
        <div className="w-full max-w-md flex justify-start mb-6 lg:mb-10 z-20 relative">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        <motion.div 
          key={role + '-form'}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile Logo & Role Selector Removed (now in banner) */}

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
              {isTeacher ? 'Teacher Login' : 'Student Login'}
            </h2>
            <p className="text-gray-500 font-medium">
              Don't have an account? <a href={`/signup${searchParams.toString() ? '?' + searchParams.toString() : ''}`} className="text-[#00a992] hover:underline font-bold">Sign up</a>
            </p>
          </div>
          
          {/* Removed inline error rendering */}

          <div className="space-y-4 mb-6">
            <button
              onClick={async () => {
                const { auth, db } = await import('@/utils/firebase/client');
                const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
                const { doc, getDoc, setDoc } = await import('firebase/firestore');
                try {
                  const provider = new GoogleAuthProvider();
                  const result = await signInWithPopup(auth, provider);
                  const user = result.user;
                  
                  const userDoc = await getDoc(doc(db, 'users', user.uid));
                  let userRole = role;
                  if (userDoc.exists()) {
                    userRole = userDoc.data().role || role;
                  } else {
                    await setDoc(doc(db, 'users', user.uid), {
                      id: user.uid,
                      email: user.email,
                      name: user.displayName || '',
                      role: role
                    });
                    if (role === 'student') {
                      await setDoc(doc(db, 'parents', user.uid), { id: user.uid });
                    } else {
                      await setDoc(doc(db, 'tutors', user.uid), { id: user.uid, name: user.displayName || '', email: user.email });
                    }
                  }
                  
                  localStorage.setItem('user', JSON.stringify({ id: user.uid, email: user.email, role: userRole }));
                  const next = searchParams.get('next');
                  router.push(next || (userRole === 'student' ? '/dashboard/student' : '/dashboard/teacher'));
                } catch (error: any) {
                  toast.error(getFriendlyAuthError(error));
                }
              }}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl shadow-sm hover:shadow transition-all text-sm font-bold text-gray-700"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or</span>
          </div>

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
                <a href="#" onClick={handleForgotPassword} className={`text-xs font-bold hover:text-emerald-700 transition-colors ${isTeacher ? 'text-emerald-500' : 'text-[#00a992]'}`}>
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-4 transition duration-300 placeholder:text-gray-400 font-medium hover:border-gray-300
                    ${isTeacher ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-[#00a992] focus:ring-[#00a992]/10'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
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
            
            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push(`/signup${searchParams.toString() ? '?' + searchParams.toString() : ''}`)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl shadow-sm hover:shadow transition-all text-base font-bold text-gray-700"
              >
                Create a new account
              </button>
            </div>
          </form>


        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex bg-gray-50 items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
