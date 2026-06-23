"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, UserPlus, Sparkles, BookOpen, Users, Award, Briefcase, GraduationCap, ArrowLeft } from 'lucide-react';
const logo = '/imports/logo.png';

function SignupContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const isTeacher = role === 'teacher';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role
          }
        }
      });

      if (authError) throw authError;

      if (data?.user) {
        if (!data.session) {
          // Email confirmation required, so we can't insert into DB due to RLS
          setSuccessMsg("Success! Please check your email to confirm your account before logging in.");
          return;
        }

        // Insert into public users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: name,
            role: role
          });
          
        if (userError && userError.code !== '23505') {
          throw new Error(`Users table error: ${userError.message}`);
        }

        // Insert into parents or tutors
        if (role === 'student') {
          const { error: parentError } = await supabase.from('parents').insert({ id: data.user.id });
          if (parentError && parentError.code !== '23505') {
            throw new Error(`Parents table error: ${parentError.message}`);
          }
          const searchParams = new URLSearchParams(window.location.search);
          router.push(searchParams.get('next') || '/dashboard/student');
        } else {
          const { error: tutorError } = await supabase.from('tutors').insert({ id: data.user.id, name: name, email: email });
          if (tutorError && tutorError.code !== '23505') {
            throw new Error(`Tutors table error: ${tutorError.message}`);
          }
          const searchParams = new URLSearchParams(window.location.search);
          router.push(searchParams.get('next') || '/dashboard/teacher');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get('next');
      const redirectUrl = `${window.location.origin}/auth/callback?role=${role}${next ? `&next=${encodeURIComponent(next)}` : ''}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message || 'Google signup failed');
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
              onClick={() => router.push('/signup?role=student')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${!isTeacher ? 'bg-white text-[#063831] shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              Student
            </button>
            <button
              onClick={() => router.push('/signup?role=teacher')}
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
                  {isTeacher ? 'Join as an Educator' : 'Join as a Student'}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight mb-4 lg:mb-6 tracking-tight">
                {isTeacher ? (
                  <>Start inspiring <br /> <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">minds today.</span></>
                ) : (
                  <>Unlock your <br /> <span className="bg-gradient-to-r from-[#00a992] to-emerald-300 bg-clip-text text-transparent">true potential.</span></>
                )}
              </h1>
              
              <p className="hidden lg:block text-emerald-100/80 text-lg leading-relaxed font-medium mb-12">
                Create your account in seconds and get full access to the Mi Tutora platform.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="hidden lg:flex relative z-10 text-emerald-100/60 text-sm font-medium justify-between">
          <span>© {new Date().getFullYear()} Mi Tutora. All rights reserved.</span>
          <span className="opacity-50">Support: +91 7483034168</span>
        </div>
      </div>

      {/* RIGHT COLUMN - SIGNUP FORM */}
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
              Create an Account
            </h2>
            <p className="text-gray-500 font-medium">Already have an account? <a href={`/login${searchParams.toString() ? '?' + searchParams.toString() : ''}`} className="text-[#00a992] hover:underline font-bold">Log in</a></p>
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

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl mb-8 text-sm font-medium border border-emerald-100 flex items-center justify-center lg:justify-start"
            >
              {successMsg}
            </motion.div>
          )}

          <div className="space-y-4 mb-6">
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 hover:border-gray-300 rounded-2xl shadow-sm hover:shadow transition-all text-sm font-bold text-gray-700"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign up with Google
            </button>
          </div>

          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or</span>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-2">
                Full Name<span className="text-[#00a992] ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-4 transition duration-300 placeholder:text-gray-400 font-medium hover:border-gray-300
                    ${isTeacher ? 'focus:border-emerald-500 focus:ring-emerald-500/10' : 'focus:border-[#00a992] focus:ring-[#00a992]/10'}
                  `}
                />
              </div>
            </div>

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
              <label className="text-xs sm:text-sm font-bold text-gray-700 block mb-2">
                Password<span className="text-[#00a992] ml-0.5">*</span>
              </label>
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
                  <UserPlus className="w-5 h-5" />
                  Sign up
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="min-h-screen flex bg-gray-50 items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
