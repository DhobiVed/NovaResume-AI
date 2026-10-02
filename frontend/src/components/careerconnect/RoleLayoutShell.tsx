import React, { useState } from 'react';
import {
  LayoutDashboard, CheckSquare, Sparkles,
  Award, Briefcase, Users, HelpCircle,
  Building2, Search, BarChart3,
  Menu, X, LogOut, ExternalLink, ChevronRight, MessageSquare, User,
  Code2, ShieldCheck, Settings
} from 'lucide-react';
import type { UserRoleType, AuthUserSession } from '../../types/careerConnect';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavItem {
  slug: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  session: AuthUserSession;
  activeNav: string;
  onSelectNav: (slug: string) => void;
  onLogout: () => void;
  onSwitchAccount?: (targetRole?: UserRoleType) => void;
  onNavigateToNova: () => void;
  children: React.ReactNode;
}

export const RoleLayoutShell: React.FC<Props> = ({
  session,
  activeNav,
  onSelectNav,
  onLogout,
  onNavigateToNova,
  children
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── ROLE-SPECIFIC SIDEBAR DEFINITIONS (STREAMLINED & COHESIVE) ──
  const getNavItems = (): NavItem[] => {
    switch (session.role) {
      case 'student':
        return [
          { slug: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { slug: 'learning', label: 'Learning & Skills', icon: <Code2 className="w-4 h-4" /> },
          { slug: 'assessments', label: 'Assessments & Certs', icon: <CheckSquare className="w-4 h-4" /> },
          { slug: 'opportunities', label: 'Career Opportunities', icon: <Briefcase className="w-4 h-4" /> },
          { slug: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
          { slug: 'profile', label: 'Profile & Resume', icon: <User className="w-4 h-4" /> }
        ];

      case 'academician':
        return [
          { slug: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { slug: 'student-performance', label: 'Student Performance', icon: <BarChart3 className="w-4 h-4" /> },
          { slug: 'curriculum', label: 'Curriculum & Tests', icon: <HelpCircle className="w-4 h-4" /> },
          { slug: 'mentorship', label: 'Industry & Mentorship', icon: <Briefcase className="w-4 h-4" /> },
          { slug: 'profile', label: 'Faculty Profile', icon: <User className="w-4 h-4" /> }
        ];

      case 'industry':
        return [
          { slug: 'dashboard', label: 'Recruiter Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { slug: 'talent-search', label: 'Talent Discovery', icon: <Search className="w-4 h-4" /> },
          { slug: 'postings', label: 'Postings & Feed', icon: <Briefcase className="w-4 h-4" /> },
          { slug: 'messages', label: 'Direct Messages', icon: <MessageSquare className="w-4 h-4" /> },
          { slug: 'company-profile', label: 'Company Profile', icon: <Building2 className="w-4 h-4" /> }
        ];

      case 'institution':
        return [
          { slug: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { slug: 'directory', label: 'Academic Directory', icon: <Users className="w-4 h-4" /> },
          { slug: 'skills', label: 'Skill Intelligence', icon: <Sparkles className="w-4 h-4" /> },
          { slug: 'accreditation', label: 'Accreditation & NIRF', icon: <Award className="w-4 h-4" /> },
          { slug: 'partners', label: 'Industry Partners', icon: <Briefcase className="w-4 h-4" /> }
        ];

      case 'super_admin':
        return [
          { slug: 'dashboard', label: 'National Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { slug: 'institutions', label: 'Institutions & Import', icon: <Building2 className="w-4 h-4" /> },
          { slug: 'users', label: 'Users & Verification', icon: <ShieldCheck className="w-4 h-4" /> },
          { slug: 'governance', label: 'Academic Governance', icon: <Sparkles className="w-4 h-4" /> },
          { slug: 'system', label: 'System & Security', icon: <Settings className="w-4 h-4" /> }
        ];

      default:
        return [];
    }
  };

  const isNavActive = (itemSlug: string, currentNav: string, role: string): boolean => {
    if (itemSlug === currentNav) return true;
    if (role === 'student') {
      if (itemSlug === 'learning' && ['learning', 'knowledge-base', 'career-roles', 'skills', 'skill-gap'].includes(currentNav)) return true;
      if (itemSlug === 'assessments' && ['assessments', 'assessment', 'certificates'].includes(currentNav)) return true;
      if (itemSlug === 'opportunities' && ['opportunities', 'feed', 'internships', 'saved-opps'].includes(currentNav)) return true;
      if (itemSlug === 'profile' && ['profile', 'internal-profile', 'resume', 'portfolio'].includes(currentNav)) return true;
    } else if (role === 'academician') {
      if (itemSlug === 'student-performance' && ['student-performance', 'skills', 'reports'].includes(currentNav)) return true;
      if (itemSlug === 'curriculum' && ['curriculum', 'assessments', 'question-bank', 'curriculum-gap', 'skill-gap'].includes(currentNav)) return true;
      if (itemSlug === 'mentorship' && ['mentorship', 'opportunities', 'industry-opps', 'messages'].includes(currentNav)) return true;
    } else if (role === 'industry') {
      if (itemSlug === 'postings' && ['postings', 'post-opportunity', 'internships', 'collaboration'].includes(currentNav)) return true;
      if (itemSlug === 'talent-search' && ['talent-search', 'talent-discovery'].includes(currentNav)) return true;
      if (itemSlug === 'dashboard' && ['dashboard', 'analytics'].includes(currentNav)) return true;
    } else if (role === 'institution') {
      if (itemSlug === 'directory' && ['directory', 'departments', 'faculty', 'students'].includes(currentNav)) return true;
      if (itemSlug === 'skills' && ['skills', 'skill-analytics', 'skill-gap'].includes(currentNav)) return true;
      if (itemSlug === 'accreditation' && ['accreditation', 'benchmark', 'reports'].includes(currentNav)) return true;
    } else if (role === 'super_admin') {
      if (itemSlug === 'institutions' && ['institutions', 'import'].includes(currentNav)) return true;
      if (itemSlug === 'users' && ['users', 'verifications'].includes(currentNav)) return true;
      if (itemSlug === 'governance' && ['governance', 'taxonomy', 'question-bank', 'opportunities'].includes(currentNav)) return true;
      if (itemSlug === 'system' && ['system', 'settings', 'audit-logs'].includes(currentNav)) return true;
    }
    return false;
  };

  const navItems = getNavItems();

  const roleLabels: Record<string, { title: string; badgeClass: string }> = {
    student: { title: 'Student Portal', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60' },
    academician: { title: 'Faculty & Mentorship', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60' },
    industry: { title: 'Recruiter Hub', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60' },
    institution: { title: 'Institution Admin', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60' },
    super_admin: { title: 'Super Admin', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60' },
  };

  const currentRoleMeta = roleLabels[session.role] || roleLabels.student;

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden glass-canvas text-slate-900 dark:text-slate-100 font-sans">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 glass-sidebar flex-shrink-0 z-20 select-none">
        {/* Brand & Role Header */}
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/70 bg-white/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              N
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight truncate">CareerConnect</span>
                <span className="px-1.5 py-0.2 rounded-md glass-pill text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-bold">
                  SIH
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {currentRoleMeta.title}
              </div>
            </div>
          </div>
        </div>

        {/* User Snapshot in Sidebar */}
        <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-800/70 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{session.full_name}</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full glass-emerald text-[9px] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            {session.department || session.institution || session.company || session.email}
          </div>
          {session.role === 'student' && session.title && (
            <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold truncate mt-1">
              {session.title}
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = isNavActive(item.slug, activeNav, session.role);
            return (
              <button
                key={item.slug}
                onClick={() => onSelectNav(item.slug)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-700/60 shadow-xs backdrop-blur-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span className="truncate flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-200/60 dark:border-slate-800/70 space-y-1.5 bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm">
          <button
            onClick={onNavigateToNova}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <span className="truncate">Nova Resume AI</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header — strict horizontal containment & frosted glass */}
        <header className="h-14 glass-header px-3 sm:px-4 md:px-6 flex items-center justify-between flex-shrink-0 z-10 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[65%] sm:max-w-none">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl glass-pill text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer flex-shrink-0"
              aria-label="Open menu"
            >
              {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Current Active Breadcrumb */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0 truncate">
              <span className={`px-2 sm:px-2.5 py-0.5 rounded-full font-mono text-[9px] sm:text-[10px] font-bold border uppercase flex-shrink-0 truncate max-w-[100px] sm:max-w-none ${currentRoleMeta.badgeClass}`}>
                {session.role === 'academician' ? 'Faculty' : session.role.replace('_', ' ')}
              </span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 capitalize truncate hidden sm:inline">
                {activeNav.replace('-', ' ')}
              </span>
              {session.department && (
                <>
                  <span className="text-slate-300 dark:text-slate-600 hidden md:inline">•</span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate hidden md:inline">
                    {session.department}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Live Real-Time Pulse Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-emerald text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Sync</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            <button
              onClick={onLogout}
              className="p-1.5 rounded-xl glass-pill hover:bg-rose-50/70 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shadow-2xs"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-4 md:p-6 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="relative w-72 glass-modal p-4 flex flex-col h-full z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  N
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">CareerConnect</span>
                <span className={`px-1.5 py-0.5 rounded-full font-mono text-[9px] uppercase ${currentRoleMeta.badgeClass}`}>
                  {session.role}
                </span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg glass-pill text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 space-y-1 custom-scrollbar">
              {navItems.map((item) => {
                const isActive = isNavActive(item.slug, activeNav, session.role);
                return (
                  <button
                    key={item.slug}
                    onClick={() => {
                      onSelectNav(item.slug);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-700/60 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/70 space-y-2">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Theme</span>
                <ThemeToggle showLabel />
              </div>
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  onNavigateToNova();
                }}
                className="w-full py-2 px-3 rounded-xl glass-pill text-slate-700 dark:text-slate-200 text-xs font-semibold text-center hover:bg-white/80 dark:hover:bg-slate-700 cursor-pointer"
              >
                Nova Resume AI ↗
              </button>
              <button
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  onLogout();
                }}
                className="w-full py-2 px-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center hover:bg-rose-100 dark:hover:bg-rose-900/60 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
