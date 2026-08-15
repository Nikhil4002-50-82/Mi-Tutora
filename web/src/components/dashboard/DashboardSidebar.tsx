import React from 'react';
import { BookOpen, GraduationCap, Lock, X } from 'lucide-react';
import { toast } from 'sonner';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardSidebarProps {
  role: 'student' | 'teacher';
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveRequestViewId: (id: string | null) => void;
  hasProfile: boolean;
  navItems: NavItem[];
  userName: string;
}

export function DashboardSidebar({
  role,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  activeTab,
  setActiveTab,
  setActiveRequestViewId,
  hasProfile,
  navItems,
  userName
}: DashboardSidebarProps) {
  const IconHeader = role === 'student' ? GraduationCap : BookOpen;
  const subtitle = role === 'student' ? 'Student' : 'Teacher';
  const defaultInitial = role === 'student' ? 'S' : 'T';

  return (
    <>
      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR (Desktop & Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 bg-gradient-to-b from-[#063831] to-[#04241f] text-white flex flex-col border-r border-white/5 shadow-2xl md:shadow-xl z-50`}>
        <div className="h-[76px] px-6 border-b border-white/10 flex flex-col justify-center items-start">
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-3">
              <IconHeader className="w-8 h-8 text-emerald-400" />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight leading-none">MiTutora</span>
                <span className="text-[#00a992] text-[10px] font-bold uppercase tracking-widest mt-1">{subtitle}</span>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-white/70 hover:text-white bg-white/5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-3 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = !hasProfile && item.id !== 'profile';
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLocked) {
                    toast.error("Please complete your profile first!");
                    return;
                  }
                  setActiveTab(item.id);
                  setActiveRequestViewId(null);
                  setIsMobileMenuOpen(false);
                }}
                disabled={isLocked}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isLocked ? "opacity-50 cursor-not-allowed text-gray-400" :
                  isActive 
                    ? "bg-[#00a992] text-white shadow-lg shadow-[#00a992]/20" 
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-400"}`} />
                {item.label}
                {isLocked && <Lock className="w-4 h-4 ml-auto opacity-50" />}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-white/10 flex items-center gap-3 bg-white/5">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-lg shadow-inner">
            {(userName || defaultInitial).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="font-bold text-sm truncate">{userName || subtitle}</p>
            <p className="text-xs text-emerald-400 font-medium">{subtitle} Account</p>
          </div>
        </div>
      </aside>
    </>
  );
}
