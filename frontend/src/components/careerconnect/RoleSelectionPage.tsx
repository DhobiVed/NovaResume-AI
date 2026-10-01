import React, { useState } from 'react';
import {
  GraduationCap, BookOpen, Building2, BarChart3, ShieldAlert,
  Zap, ShieldCheck, Sparkles, UserPlus, LogIn, ExternalLink
} from 'lucide-react';
import { DEMO_ROLES_CATALOG, careerConnectService } from '../../services/careerConnectService';
import type { UserRoleType, AuthUserSession } from '../../types/careerConnect';
import { RoleAuthModal } from './RoleAuthModal';
import { ThemeToggle } from '../common/ThemeToggle';

interface Props {
  onAuthSuccess: (session: AuthUserSession) => void;
  onNavigateToNova: () => void;
}

export const RoleSelectionPage: React.FC<Props> = ({ onAuthSuccess, onNavigateToNova }) => {
  const [selectedRoleForModal, setSelectedRoleForModal] = useState<UserRoleType | null>(null);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  const handleOpenAuth = (role: UserRoleType, mode: 'login' | 'register') => {
    try {
      localStorage.setItem('novaresume_saved_role', role);
    } catch {}
    setSelectedRoleForModal(role);
    setModalMode(mode);
  };

  const handleQuickDemo = async (role: UserRoleType) => {
    setIsDemoLoading(role);
    try {
      try {
        localStorage.setItem('novaresume_saved_role', role);
      } catch {}
      const session = await careerConnectService.loginWithDemo(role);
      onAuthSuccess(session);
    } finally {
      setIsDemoLoading(null);
    }
  };

  const roleIcons: Record<string, React.ReactNode> = {
    student: <GraduationCap className="w-8 h-8 text-emerald-700" />,
    academician: <BookOpen className="w-8 h-8 text-purple-700" />,
    industry: <Building2 className="w-8 h-8 text-blue-700" />,
    institution: <BarChart3 className="w-8 h-8 text-amber-700" />,
    super_admin: <ShieldAlert className="w-8 h-8 text-rose-700" />
  };

  return (
    <div className="min-h-screen glass-canvas text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden flex flex-col justify-between">
      {/* Top Header */}
      <header className="glass-header px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Nova CareerConnect</span>
              <span className="px-2 py-0.5 rounded-md glass-pill text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold">
                SIH 26044
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Ministry of Ayush / AIIA • Academia–Industry Collaboration Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={onNavigateToNova}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span>Nova Resume AI</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 z-10 w-full flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-slate-700 dark:text-slate-300 text-xs font-medium shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Role-Isolated Secure Collaboration Portal</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Academia–Industry Collaboration Ecosystem
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Complete ecosystem connecting Students, Faculty, Institutions, and Industry Recruiters for Skill Mapping, Verified Assessments, Internships, and Placements.
          </p>
        </div>

        {/* 5 Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {DEMO_ROLES_CATALOG.map((item) => {
            const isSuperAdmin = item.role === 'super_admin';
            const loadingThis = isDemoLoading === item.role;

            return (
              <div
                key={item.role}
                className="glass-card-interactive rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="relative z-10 space-y-4">
                  {/* Top Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl glass-pill shadow-xs">
                      {roleIcons[item.role]}
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold glass-pill uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {item.role === 'academician' ? 'Faculty' : item.role === 'super_admin' ? 'Super Admin' : item.role}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed mt-1">
                      "{item.tagline}"
                    </p>
                  </div>

                  {/* Persona Scope Detail */}
                  <div className="p-3 rounded-xl glass-pill text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.affiliation}</div>
                  </div>
                </div>

                {/* Actions Suite */}
                <div className="relative z-10 space-y-2 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenAuth(item.role, 'login')}
                      className="w-full py-2 px-3 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Login</span>
                    </button>

                    {!isSuperAdmin ? (
                      <button
                        onClick={() => handleOpenAuth(item.role, 'register')}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register</span>
                      </button>
                    ) : (
                      <div className="py-2 px-3 rounded-xl glass-pill text-slate-400 dark:text-slate-500 font-semibold text-[10px] text-center">
                        Admin Only
                      </div>
                    )}
                  </div>

                  {/* 1-Click Demo Shortcut */}
                  <button
                    onClick={() => handleQuickDemo(item.role)}
                    disabled={loadingThis}
                    className="w-full py-2 px-3 rounded-xl glass-indigo text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/70 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${loadingThis ? 'animate-spin' : ''}`} />
                    <span>{loadingThis ? 'Authenticating...' : 'Instant Demo Access'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* SIH 26044 Note Card */}
        <div className="mt-10 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400 max-w-2xl mx-auto flex items-center justify-center gap-2 shadow-xs">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span>
            <strong>SIH Evaluator Notice:</strong> Each role account has isolated credentials, separate dashboards, and authenticated server access.
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-4 px-6 text-center text-xs text-slate-600 dark:text-slate-400 z-10">
        Smart India Hackathon 2026 • Problem Statement ID: SIH26044 • Ministry of Ayush &amp; AIIA
      </footer>

      {/* Role Auth Modal */}
      {selectedRoleForModal && (
        <RoleAuthModal
          role={selectedRoleForModal}
          initialMode={modalMode}
          isOpen={Boolean(selectedRoleForModal)}
          onClose={() => setSelectedRoleForModal(null)}
          onSuccess={(session) => {
            try {
              localStorage.setItem('novaresume_saved_role', session.role);
            } catch {}
            setSelectedRoleForModal(null);
            onAuthSuccess(session);
          }}
        />
      )}
    </div>
  );
};
