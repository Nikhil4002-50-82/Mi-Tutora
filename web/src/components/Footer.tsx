'use client';

import { motion } from 'motion/react';
import { Phone, Mail, MapPin } from 'lucide-react';
const logo = '/imports/logo.png';

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a href={href} className="group relative inline-block hover:text-[#00a992] transition-colors duration-300">
      {children}
      <span className="absolute left-0 bottom-0 w-0 h-px bg-[#00a992] transition-all duration-300 group-hover:w-full"></span>
    </a>
  </li>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#063831] to-[#04241f] border-t border-white/5 text-white px-4 sm:px-6 md:px-12 lg:px-20 xl:px-28 py-16 sm:py-20 relative overflow-hidden w-full">
      {/* Subtle bottom edge spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#00a992]/10 via-transparent pointer-events-none" />

      {/* TOP GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 max-w-7xl mx-auto relative z-10">
        {/* LEFT SECTION (Logo & About) */}
        <div className="col-span-2 lg:col-span-2">
          <a href="#hero" className="inline-block mb-4 transition-transform hover:scale-105 duration-300">
            <img
              src={logo}
              alt="Mi Tutora"
              className="h-28 w-auto object-contain -ml-2"
            />
          </a>

          <p className="text-xs sm:text-sm text-gray-300 mb-4 leading-relaxed font-medium">
            Trusted home tuition and online learning platform helping students achieve academic excellence across India.
          </p>

          <div className="space-y-2 text-xs sm:text-sm text-gray-400 mt-6">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#00a992]" />
              <span className="text-white font-medium">Phone:</span> +91 7483034168, +91 9773980489
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00a992]" />
              <span className="text-white font-medium">Mail:</span> mitutoraeducation@gmail.com
            </p>
            <p className="flex items-start gap-2 mt-3 leading-relaxed max-w-sm">
              <MapPin className="w-4 h-4 text-[#00a992] mt-0.5" />
              <span>Bengaluru, Karnataka, India</span>
            </p>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="col-span-1 lg:col-span-1">
          <h3 className="font-semibold text-white mb-4 text-sm sm:text-base tracking-wide uppercase">
            Quick Links
          </h3>
          <ul className="space-y-3 text-gray-400 text-xs sm:text-sm font-medium">
            <FooterLink href="#hero">Home</FooterLink>
            <FooterLink href="#services">Services</FooterLink>
            <FooterLink href="#how-it-works">How It Works</FooterLink>
            <FooterLink href="#testimonials">Testimonials</FooterLink>
            <FooterLink href="#faq">FAQ</FooterLink>
          </ul>
        </div>

        {/* TOP SERVICES */}
        <div className="col-span-1 lg:col-span-1">
          <h3 className="font-semibold text-white mb-4 text-sm sm:text-base tracking-wide uppercase">
            Top Services
          </h3>
          <ul className="space-y-3 text-gray-400 text-xs sm:text-sm font-medium">
            <FooterLink href="#services">Home Tuition</FooterLink>
            <FooterLink href="#services">Online Classes</FooterLink>
            <FooterLink href="#services">NEET Coaching</FooterLink>
            <FooterLink href="#services">JEE Coaching</FooterLink>
          </ul>
        </div>

        {/* MORE SERVICES */}
        <div className="col-span-1 lg:col-span-1">
          <h3 className="font-semibold text-white mb-4 text-sm sm:text-base tracking-wide uppercase">
            More Services
          </h3>
          <ul className="space-y-3 text-gray-400 text-xs sm:text-sm font-medium">
            <FooterLink href="#services">Coding Classes</FooterLink>
            <FooterLink href="#services">Language Training</FooterLink>
            <FooterLink href="#services">Spoken English</FooterLink>
            <FooterLink href="#services">Exam Prep</FooterLink>
          </ul>
        </div>

        {/* POLICIES */}
        <div className="col-span-1 lg:col-span-1">
          <h3 className="font-semibold text-white mb-4 text-sm sm:text-base tracking-wide uppercase">
            Legal & Policies
          </h3>
          <ul className="space-y-3 text-gray-400 text-xs sm:text-sm font-medium">
            <li>
              <a href="/pdfs/privacy-policy.pdf#toolbar=0" target="_blank" rel="noopener noreferrer" className="hover:text-[#00a992] transition-colors duration-300">Privacy Policy</a>
            </li>
            <li>
              <a href="/pdfs/terms-and-conditions.pdf#toolbar=0" target="_blank" rel="noopener noreferrer" className="hover:text-[#00a992] transition-colors duration-300">Terms of Service</a>
            </li>
            <li>
              <a href="/pdfs/refund-policy.pdf#toolbar=0" target="_blank" rel="noopener noreferrer" className="hover:text-[#00a992] transition-colors duration-300">Refund Policy</a>
            </li>
          </ul>
        </div>
      </div>

      {/* DIVIDER & BOTTOM SECTION */}
      <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto relative z-10">
        <p className="text-xs sm:text-sm text-gray-500 text-center md:text-left font-medium">
          © {new Date().getFullYear()} Mi Tutora. All rights reserved.
        </p>

        {/* SOCIAL ICONS */}
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/mi_tutora?igsh=MXZ2M3J6YmZsOXVn0Q=="
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 border border-white/10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-[#00a992] hover:to-emerald-600 hover:border-transparent text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:shadow-[#00a992]/30 hover:-translate-y-1"
          >
            <InstagramIcon size={18} />
          </a>
          <a
            href="https://www.facebook.com/share/1CVSDJaYhA/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 border border-white/10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-[#00a992] hover:to-emerald-600 hover:border-transparent text-gray-400 hover:text-white transition-all duration-300 shadow-lg hover:shadow-[#00a992]/30 hover:-translate-y-1"
          >
            <FacebookIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
