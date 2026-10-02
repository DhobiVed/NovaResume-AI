import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/common/ThemeToggle';
import { TemplateGalleryPage } from './components/gallery/TemplateGalleryPage';
import { ResumeEditor } from './components/editor/ResumeEditor';
import { AtsAnalyzerModal } from './components/ats/AtsAnalyzerModal';
import { CoverLetterModal } from './components/coverletter/CoverLetterModal';
import { PortfolioModal } from './components/portfolio/PortfolioModal';
import { ResumeImportModal } from './components/import/ResumeImportModal';
import { ResumeMentorModal } from './components/mentor/ResumeMentorModal';
import { VersionHistoryModal } from './components/history/VersionHistoryModal';
import { JobTrackerModal } from './components/tracker/JobTrackerModal';
import { AuthModal } from './components/auth/AuthModal';
import type { UserProfile } from './components/auth/AuthModal';
import type { TemplateDefinition } from './lib/resumeTypes';
import { NovaDashboard } from './components/dashboard/NovaDashboard';
import { ALL_TEMPLATES } from './lib/templateData';
import {
  Plus, Briefcase, Globe, Menu, X, Sparkles, History, Upload, Layout,
  LayoutGrid, Target, Building2, GraduationCap, BarChart3, ShieldAlert,
  ChevronDown
} from 'lucide-react';

import { firebaseAuthService } from './services/firebaseAuth';

// SIH26044 Multi-Role CareerConnect Components
import { RoleSelectionPage } from './components/careerconnect/RoleSelectionPage';
import { RoleLayoutShell } from './components/careerconnect/RoleLayoutShell';
import { AccessDeniedView } from './components/careerconnect/AccessDeniedView';
import { StudentCareerPortal } from './components/careerconnect/StudentCareerPortal';
import { IndustryRecruiterPortal } from './components/careerconnect/IndustryRecruiterPortal';
import { AcademicianPortal } from './components/careerconnect/AcademicianPortal';
import { InstitutionAnalyticsDashboard } from './components/careerconnect/InstitutionAnalyticsDashboard';
import { SuperAdminPortal } from './components/careerconnect/SuperAdminPortal';
import { careerConnectService } from './services/careerConnectService';
import type { UserRoleType, AuthUserSession } from './types/careerConnect';
import { ReturningUserLoginPage } from './components/careerconnect/ReturningUserLoginPage';

export const AppContent: React.FC = () => {
  // Page Route State with Persistence (Supports Nova Core + SIH26044 CareerConnect Portals)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash) return hash;

      const hasRegistered = localStorage.getItem('novaresume_has_registered') === 'true';
      const savedRole = localStorage.getItem('novaresume_saved_role');
      const savedSession = localStorage.getItem('nova_career_session');
      const cachedState = localStorage.getItem('nova_app_state');

      // 1. If user has an active session, restore their dashboard
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed && parsed.role) {
            const roleSlug = parsed.role === 'super_admin' ? 'admin' : parsed.role === 'academician' ? 'faculty' : parsed.role;
            if (cachedState) {
              const appState = JSON.parse(cachedState);
              if (appState.route && !['auth/choose-role', 'choose-role', 'auth/login', 'login'].includes(appState.route)) {
                return appState.route;
              }
            }
            return `${roleSlug}/dashboard`;
          }
        } catch {}
      }

      // 2. Returning visitor (registered/visited before) -> Common Sign In Page!
      if (hasRegistered || savedRole) {
        return 'auth/login';
      }

      // 3. First-time visitor -> 5-Role Selection Dashboard (Image 1)
      return 'auth/choose-role';
    } catch {}
    return 'auth/choose-role';
  });

  // CareerConnect Session State (Real session only — no auto-login for returning unauthenticated users)
  const [careerSession, setCareerSession] = useState<AuthUserSession | null>(() => {
    return careerConnectService.getCurrentSession();
  });

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(() => {
    try {
      const cached = localStorage.getItem('nova_app_state');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.templateId) {
          return ALL_TEMPLATES.find(t => t.id === parsed.templateId) || null;
        }
      }
    } catch {}
    return null;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Persistent User State with LocalStorage Fallback (Firebase Auth for Nova Core)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('nova_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Synchronize hash changes from browser history (Back / Forward / Link clicks)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim();
      if (hash && hash !== currentRoute) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoute]);

  const navigateToRoute = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
  };

  // Persist Route & Template Selection to LocalStorage
  useEffect(() => {
    try {
      const state = {
        route: selectedTemplate ? 'editor' : currentRoute,
        templateId: selectedTemplate?.id || null,
      };
      localStorage.setItem('nova_app_state', JSON.stringify(state));
      if (selectedTemplate) {
        window.location.hash = 'editor';
      }
    } catch {}
  }, [selectedTemplate, currentRoute]);

  // Modals
  const [isAtsOpen, setIsAtsOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isJobTrackerOpen, setIsJobTrackerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Compact Header Dropdown States
  const [isPortalsDropdownOpen, setIsPortalsDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown-container]')) {
        setIsPortalsDropdownOpen(false);
        setIsToolsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPortalsDropdownOpen(false);
        setIsToolsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Firebase Auth State Subscription & Mobile Redirect Result Check
  useEffect(() => {
    firebaseAuthService.checkRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        setUser(redirectUser);
        setIsAuthOpen(false);
        setSelectedTemplate(null);
        navigateToRoute('dashboard');
      }
    });

    const unsubscribe = firebaseAuthService.onAuthState((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = async (loggedInUser: UserProfile, chosenRole?: UserRoleType) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);
    setSelectedTemplate(null);
    const targetRole = chosenRole || (typeof localStorage !== 'undefined' ? (localStorage.getItem('novaresume_saved_role') as UserRoleType) : null) || 'student';
    try {
      try {
        localStorage.setItem('novaresume_saved_role', targetRole);
      } catch {}
      const session = await careerConnectService.loginWithDemo(targetRole);
      session.full_name = loggedInUser.name || session.full_name;
      session.email = loggedInUser.email || session.email;
      setCareerSession(session);
      const roleSlug = targetRole === 'super_admin' ? 'admin' : targetRole === 'academician' ? 'faculty' : targetRole;
      navigateToRoute(`${roleSlug}/dashboard`);
      return;
    } catch {}
    navigateToRoute('dashboard');
  };

  const handleLogout = async () => {
    setUser(null);
    setSelectedTemplate(null);
    try {
      localStorage.removeItem('nova_user_profile');
    } catch {}
    await firebaseAuthService.logout();
  };

  const [importedResumeData, setImportedResumeData] = useState<any>(null);

  const activeResumeData = importedResumeData || {
    fullName: 'Alex Vance',
    title: 'Senior AI Systems Engineer',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexvance',
    github: 'github.com/alexvance',
    summary: 'Senior AI Engineer with 6+ years of experience designing scalable LLM pipelines, RAG vector architectures, and high-performance FastAPI backends.',
    skills: 'Python, FastAPI, Groq API, LangChain, PyTorch, React, TypeScript, PostgreSQL, Docker, Git',
    experience: [
      {
        company: 'NeuralTech AI',
        role: 'Lead AI Engineer',
        dates: '2022 - Present',
        bullets: 'Architected enterprise RAG document retrieval engines using FAISS & Groq API, scaling query throughput by 300%.'
      }
    ],
    education: [
      { degree: 'B.S. in Computer Science', school: 'UC Berkeley', year: '2019' }
    ]
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      setAuthMode('login');
      setIsAuthOpen(true);
    } else {
      action();
    }
  };

  const handleSelectTemplate = (template: TemplateDefinition) => {
    requireAuth(() => setSelectedTemplate(template));
  };

  const handleImportComplete = (parsedData: any, chosenTemplate?: TemplateDefinition) => {
    if (parsedData) {
      const formattedData = {
        fullName: parsedData.fullName || 'Imported Candidate',
        title: parsedData.title || 'Professional',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        location: parsedData.location || '',
        linkedin: parsedData.linkedin || '',
        github: parsedData.github || '',
        summary: parsedData.summary || '',
        objective: parsedData.objective || '',
        skills: parsedData.skills || '',
        experience: Array.isArray(parsedData.experience) && parsedData.experience.length > 0 ? parsedData.experience : [],
        education: Array.isArray(parsedData.education) && parsedData.education.length > 0 ? parsedData.education : [],
        projects: Array.isArray(parsedData.projects) && parsedData.projects.length > 0 ? parsedData.projects : [],
        certifications: parsedData.certifications || '',
        languages: parsedData.languages || '',
        achievements: parsedData.achievements || '',
      };
      setImportedResumeData(formattedData);
      setSelectedTemplate(chosenTemplate || ALL_TEMPLATES[0]);
    }
  };

  // ── CareerConnect Authentication & Navigation Handlers ──
  const handleCareerAuthSuccess = (session: AuthUserSession) => {
    setCareerSession(session);
    setUser({
      id: session.id,
      name: session.full_name,
      email: session.email
    });
    setIsAuthOpen(false);
    try {
      localStorage.setItem('novaresume_has_registered', 'true');
      localStorage.setItem('novaresume_saved_role', session.role);
    } catch {}
    const roleSlug = session.role === 'super_admin' ? 'admin' : session.role === 'academician' ? 'faculty' : session.role;
    navigateToRoute(`${roleSlug}/dashboard`);
  };

  const handleCareerLogout = () => {
    careerConnectService.logoutCareerSession();
    setCareerSession(null);
    setUser(null);
    // Returning user sees Common Sign In Page on logout, NOT 5-role selection
    try {
      localStorage.setItem('novaresume_has_registered', 'true');
    } catch {}
    navigateToRoute('auth/login');
  };

  const handleCareerSwitchAccount = async (targetRole?: UserRoleType) => {
    if (targetRole) {
      const newSession = await careerConnectService.loginWithDemo(targetRole);
      setCareerSession(newSession);
      const roleSlug = targetRole === 'super_admin' ? 'admin' : targetRole === 'academician' ? 'faculty' : targetRole;
      navigateToRoute(`${roleSlug}/dashboard`);
    } else {
      navigateToRoute('auth/choose-role');
    }
  };

  // ── Route Dissection & Role Guard ──
  const routeParts = currentRoute.split('/');
  const routePrefix = routeParts[0];
  const subSection = routeParts.slice(1).join('/') || 'dashboard';

  const isCareerConnectRoute = [
    'auth', 'student', 'faculty', 'academia', 'industry',
    'recruiter', 'institution', 'admin', 'career'
  ].includes(routePrefix);

  const getRequiredRole = (prefix: string): UserRoleType => {
    switch (prefix) {
      case 'student':
      case 'career':
        return 'student';
      case 'faculty':
      case 'academia':
        return 'academician';
      case 'industry':
      case 'recruiter':
        return 'industry';
      case 'institution':
        return 'institution';
      case 'admin':
        return 'super_admin';
      default:
        return 'student';
    }
  };

  const renderRolePortal = (role: UserRoleType, section: string) => {
    switch (role) {
      case 'student':
        return (
          <StudentCareerPortal
            activeSection={section}
            onNavigateSection={(sec) => {
              if (sec === 'resume') {
                setSelectedTemplate(null);
                navigateToRoute('gallery');
              } else if (sec === 'portfolio') {
                setIsPortfolioOpen(true);
              } else {
                navigateToRoute(`student/${sec}`);
              }
            }}
            onOpenResumeBuilder={() => {
              setSelectedTemplate(null);
              navigateToRoute('gallery');
            }}
          />
        );
      case 'academician':
        return (
          <AcademicianPortal
            activeSection={section}
            onNavigateSection={(sec) => navigateToRoute(`faculty/${sec}`)}
          />
        );
      case 'industry':
        return (
          <IndustryRecruiterPortal
            activeSection={section}
            onNavigateSection={(sec) => navigateToRoute(`industry/${sec}`)}
          />
        );
      case 'institution':
        return (
          <InstitutionAnalyticsDashboard
            activeSection={section}
            onNavigateSection={(sec) => navigateToRoute(`institution/${sec}`)}
          />
        );
      case 'super_admin':
        return (
          <SuperAdminPortal
            activeSection={section}
            onNavigateSection={(sec) => navigateToRoute(`admin/${sec}`)}
          />
        );
      default:
        return null;
    }
  };

  // ── SCENARIO A: CAREERCONNECT PORTALS & AUTH ──────────────────────────
  if (isCareerConnectRoute && !selectedTemplate) {
    // 1. Explicit Role Selection Dashboard (First time users or switch role)
    if (currentRoute === 'auth/choose-role' || currentRoute === 'choose-role') {
      return (
        <RoleSelectionPage
          onAuthSuccess={handleCareerAuthSuccess}
          onNavigateToNova={() => {
            setSelectedTemplate(null);
            navigateToRoute('gallery');
          }}
        />
      );
    }

    // 2. Explicit Login Route -> Role-Specific Sign In Page
    if (currentRoute === 'auth/login' || currentRoute === 'login') {
      const savedRole = (typeof localStorage !== 'undefined' ? (localStorage.getItem('novaresume_saved_role') as UserRoleType) : null) || 'student';
      return (
        <ReturningUserLoginPage
          savedRole={savedRole}
          onSuccess={handleCareerAuthSuccess}
          onSwitchRole={() => {
            navigateToRoute('auth/choose-role');
          }}
          onNavigateToNova={() => {
            setSelectedTemplate(null);
            navigateToRoute('gallery');
          }}
        />
      );
    }

    // 3. Unauthenticated check for protected portal routes
    if (!careerSession) {
      const hasRegistered = typeof localStorage !== 'undefined' && localStorage.getItem('novaresume_has_registered') === 'true';
      const savedRole = typeof localStorage !== 'undefined' ? (localStorage.getItem('novaresume_saved_role') as UserRoleType) : null;

      if (hasRegistered || savedRole) {
        // Returning user: show Role-Specific Sign In Page
        return (
          <ReturningUserLoginPage
            savedRole={savedRole || 'student'}
            onSuccess={handleCareerAuthSuccess}
            onSwitchRole={() => {
              navigateToRoute('auth/choose-role');
            }}
            onNavigateToNova={() => {
              setSelectedTemplate(null);
              navigateToRoute('gallery');
            }}
          />
        );
      }

      // First-time visitor: show 5-Role Selection Page
      return (
        <RoleSelectionPage
          onAuthSuccess={handleCareerAuthSuccess}
          onNavigateToNova={() => {
            setSelectedTemplate(null);
            navigateToRoute('gallery');
          }}
        />
      );
    }

    // 3. Authenticated but Unauthorized Role -> HTTP 403 Forbidden AccessDeniedView
    const requiredRole = getRequiredRole(routePrefix);
    if (careerSession.role !== requiredRole) {
      return (
        <AccessDeniedView
          currentRole={careerSession.role}
          requiredRole={requiredRole}
          onReturnToDashboard={() => {
            const mySlug = careerSession.role === 'super_admin' ? 'admin' : careerSession.role === 'academician' ? 'faculty' : careerSession.role;
            navigateToRoute(`${mySlug}/dashboard`);
          }}
          onSwitchRole={() => navigateToRoute('auth/choose-role')}
          onNavigateToNova={() => {
            setSelectedTemplate(null);
            navigateToRoute('gallery');
          }}
        />
      );
    }

    // 4. Authenticated & Authorized -> Render RoleLayoutShell wrapping Portal
    return (
      <>
        <RoleLayoutShell
          session={careerSession}
          activeNav={subSection}
          onSelectNav={(slug) => {
            if (slug === 'resume') {
              setSelectedTemplate(null);
              navigateToRoute('gallery');
            } else if (slug === 'portfolio') {
              setIsPortfolioOpen(true);
            } else {
              navigateToRoute(`${routePrefix}/${slug}`);
            }
          }}
          onLogout={handleCareerLogout}
          onSwitchAccount={handleCareerSwitchAccount}
          onNavigateToNova={() => {
            setSelectedTemplate(null);
            navigateToRoute('gallery');
          }}
        >
          {renderRolePortal(careerSession.role, subSection)}
        </RoleLayoutShell>
        <PortfolioModal isOpen={isPortfolioOpen} onClose={() => setIsPortfolioOpen(false)} resumeData={activeResumeData} />
      </>
    );
  }

  // ── SCENARIO B: NOVA RESUME AI (TEMPLATES, EDITOR, DASHBOARD) ─────────
  return (
    <div className="flex flex-col h-screen w-full max-w-[100vw] overflow-x-hidden glass-canvas text-slate-900 dark:text-slate-100 font-sans relative box-border">
      {/* Sleek, Responsive Platform Header (Frosted Glass Surface) */}
      <header className="w-full max-w-full h-14 md:h-16 px-3 sm:px-4 md:px-5 glass-header flex items-center justify-between flex-shrink-0 z-30 relative box-border">
        {/* Left: Brand Identity */}
        <div
          className="flex items-center gap-2 md:gap-2.5 cursor-pointer flex-shrink-0 min-w-0"
          onClick={() => {
            setSelectedTemplate(null);
            navigateToRoute('gallery');
          }}
        >
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 flex items-center justify-center text-white font-bold text-sm md:text-base shadow-sm flex-shrink-0">
            N
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-xs md:text-base tracking-tight text-slate-900 dark:text-white leading-none truncate">
                NovaResume AI
              </h1>
              <span className="px-1.5 py-0.5 rounded-md glass-pill text-indigo-700 dark:text-indigo-300 font-semibold text-[9px] hidden sm:inline-block flex-shrink-0">
                Enterprise
              </span>
            </div>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-tight uppercase leading-none truncate hidden 2xl:block mt-0.5">
              AI Career &amp; Resume Platform
            </p>
          </div>
        </div>

        {/* Right: Desktop Actions & Dropdowns (Compact, No Overflow on Any Screen) */}
        <div className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2 flex-shrink-0">
          
          {/* 1. CareerConnect SIH26044 Dropdown */}
          <div className="relative" data-dropdown-container>
            <button
              onClick={() => {
                setIsPortalsDropdownOpen(!isPortalsDropdownOpen);
                setIsToolsDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] cursor-pointer shadow-xs ${
                isPortalsDropdownOpen
                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'glass-emerald text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/60'
              }`}
              title="CareerConnect SIH Portals"
            >
              <Target className={`w-3.5 h-3.5 flex-shrink-0 ${isPortalsDropdownOpen ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span className="truncate">CareerConnect</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border hidden xl:inline ${
                isPortalsDropdownOpen
                  ? 'bg-emerald-700/60 text-white border-emerald-400/40'
                  : 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-700/60'
              }`}>
                SIH
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${
                isPortalsDropdownOpen ? 'rotate-180 text-white' : 'text-emerald-600 dark:text-emerald-400'
              }`} />
            </button>

            {isPortalsDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 glass-dropdown rounded-2xl p-2 z-50 animate-fadeIn space-y-1 text-slate-800 dark:text-slate-200">
                <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    SIH 26044 Ecosystem
                  </span>
                  <button
                    onClick={() => {
                      setIsPortalsDropdownOpen(false);
                      setSelectedTemplate(null);
                      navigateToRoute('auth/choose-role');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-[10px] cursor-pointer"
                  >
                    Role Selector →
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setIsPortalsDropdownOpen(false);
                    setSelectedTemplate(null);
                    navigateToRoute('student/dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-left transition-colors hover:bg-slate-50 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100/80 group-hover:border-emerald-300 transition-colors">
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Student Career Portal</div>
                    <div className="text-[10px] text-slate-500 truncate">Skill assessment, gaps &amp; jobs</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsPortalsDropdownOpen(false);
                    setSelectedTemplate(null);
                    navigateToRoute('faculty/dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-left transition-colors hover:bg-slate-50 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/70 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100/80 group-hover:border-indigo-300 transition-colors">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Faculty Mentorship Hub</div>
                    <div className="text-[10px] text-slate-500 truncate">Mentees, FDPs &amp; endorsements</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsPortalsDropdownOpen(false);
                    setSelectedTemplate(null);
                    navigateToRoute('industry/dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-left transition-colors hover:bg-slate-50 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/70 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100/80 group-hover:border-blue-300 transition-colors">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Industry Recruiter Hub</div>
                    <div className="text-[10px] text-slate-500 truncate">Post opps &amp; candidate pipeline</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsPortalsDropdownOpen(false);
                    setSelectedTemplate(null);
                    navigateToRoute('institution/dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-left transition-colors hover:bg-slate-50 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/70 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100/80 group-hover:border-amber-300 transition-colors">
                    <BarChart3 className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Institution Analytics</div>
                    <div className="text-[10px] text-slate-500 truncate">Heatmaps, verification &amp; audits</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsPortalsDropdownOpen(false);
                    setSelectedTemplate(null);
                    navigateToRoute('admin/dashboard');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-left transition-colors hover:bg-slate-50 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/70 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100/80 group-hover:border-rose-300 transition-colors">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-rose-700 transition-colors">Super Admin Console</div>
                    <div className="text-[10px] text-slate-500 truncate">Taxonomy &amp; governance logs</div>
                  </div>
                </button>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsPortalsDropdownOpen(false);
                      setSelectedTemplate(null);
                      navigateToRoute('auth/choose-role');
                    }}
                    className="w-full py-2 px-3 text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Switch Persona / Test Demo Accounts</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Workspace Navigation */}
          <button
            onClick={() => {
              setSelectedTemplate(null);
              navigateToRoute('gallery');
            }}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[34px] cursor-pointer ${
              currentRoute === 'gallery' && !selectedTemplate
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
            }`}
            title="Resume Templates"
          >
            <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden lg:inline">Templates</span>
          </button>

          <button
            onClick={() => {
              setSelectedTemplate(null);
              navigateToRoute('dashboard');
            }}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[34px] cursor-pointer ${
              currentRoute === 'dashboard' && !selectedTemplate
                ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-sm'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
            }`}
            title="Saved Resumes Dashboard"
          >
            <Layout className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden lg:inline">Dashboard</span>
          </button>


          {/* 3. AI Tools Dropdown Menu */}
          <div className="relative" data-dropdown-container>
            <button
              onClick={() => {
                setIsToolsDropdownOpen(!isToolsDropdownOpen);
                setIsPortalsDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl glass-pill text-xs font-bold text-slate-900 dark:text-slate-100 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all min-h-[36px] cursor-pointer"
              title="Resume AI Tools"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="hidden lg:inline">AI Tools</span>
              <ChevronDown className={`w-3 h-3 transition-transform flex-shrink-0 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isToolsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl p-1.5 z-50 animate-fadeIn space-y-1 text-slate-900 dark:text-slate-100">
                <div className="px-3 py-1 text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200/50 dark:border-slate-800/80">
                  Resume &amp; Career AI Tools
                </div>

                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    requireAuth(() => setIsMentorOpen(true));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>AI Resume Mentor</span>
                </button>

                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    requireAuth(() => setIsAtsOpen(true));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <Target className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>ATS &amp; JD Matcher</span>
                </button>

                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    requireAuth(() => setIsJobTrackerOpen(true));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-blue-50/70 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>Job Tracker</span>
                </button>

                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    requireAuth(() => setIsHistoryOpen(true));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                  <span>Version History</span>
                </button>

                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    setIsImportOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-cyan-50/70 dark:hover:bg-cyan-950/50 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  <span>Import Resume</span>
                </button>

                <button
                  onClick={() => {
                    setIsToolsDropdownOpen(false);
                    requireAuth(() => setIsPortfolioOpen(true));
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-purple-50/70 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>Web Portfolio</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Theme Toggle Button */}
          <ThemeToggle />

          {/* 5. Primary CTA */}
          <button
            onClick={() => requireAuth(() => setSelectedTemplate(ALL_TEMPLATES[0]))}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all min-h-[34px] flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white flex-shrink-0" />
            <span>Create</span>
          </button>

          {/* 6. User Profile / Sign In */}
          {user && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200/60 dark:border-slate-800/80 flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full border border-white/60 dark:border-white/20 object-cover flex-shrink-0 shadow-2xs" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs border border-white/20 flex-shrink-0">
                  {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl glass-pill text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-850 focus:outline-none min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
          aria-label="Toggle Mobile Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-14 bg-slate-950/60 backdrop-blur-md z-50 md:hidden flex flex-col justify-between p-4 animate-fadeIn">
          <div className="glass-modal rounded-2xl p-4 shadow-2xl space-y-2.5 max-h-[85vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            {/* Theme Toggle in Mobile Drawer */}
            <div className="flex items-center justify-between p-3 glass-pill rounded-xl mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Theme</span>
              <ThemeToggle showLabel />
            </div>

            {/* Mobile User Profile Section */}
            {user && (
              <div className="flex items-center justify-between p-3 glass-card rounded-xl mb-2">
                <div className="flex items-center gap-2.5">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white font-semibold text-xs border border-slate-700 flex-shrink-0">
                      {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-white block">{user.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate max-w-[150px]">{user.email}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg">
                  Logout
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setSelectedTemplate(null);
                navigateToRoute('dashboard');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm min-h-[44px] cursor-pointer ${
                currentRoute === 'dashboard' && !selectedTemplate
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'glass-card text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layout className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Saved Resumes Dashboard</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setSelectedTemplate(null);
                navigateToRoute('gallery');
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm min-h-[44px] cursor-pointer ${
                currentRoute === 'gallery' && !selectedTemplate
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'glass-card text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Resume Templates Gallery</span>
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setSelectedTemplate(ALL_TEMPLATES[0])); }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold text-sm min-h-[44px] shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create New Resume</span>
            </button>

            {/* AI Tools Suite in Mobile Drawer */}
            <div className="p-3 glass-card rounded-2xl space-y-2 text-slate-900 dark:text-slate-100 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  AI & Career Tools
                </span>
                <span className="px-1.5 py-0.5 rounded glass-pill text-indigo-700 dark:text-indigo-300 font-semibold text-[9px]">Pro Suite</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-xs">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsAtsOpen(true)); }}
                  className="py-2 px-2.5 rounded-xl glass-pill hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-left truncate font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="truncate">ATS Matcher</span>
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsJobTrackerOpen(true)); }}
                  className="py-2 px-2.5 rounded-xl glass-pill hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-left truncate font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="truncate">Job Tracker</span>
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsMentorOpen(true)); }}
                  className="py-2 px-2.5 rounded-xl glass-pill hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-left truncate font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="truncate">AI Mentor</span>
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsPortfolioOpen(true)); }}
                  className="py-2 px-2.5 rounded-xl glass-pill hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-800 dark:text-purple-300 text-left truncate font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="truncate">Web Portfolio</span>
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsImportOpen(true); }}
                  className="py-2 px-2.5 rounded-xl glass-pill hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 text-left truncate font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                  <span className="truncate">Import Resume</span>
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsHistoryOpen(true)); }}
                  className="py-2 px-2.5 rounded-xl glass-pill hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-left truncate font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                  <span className="truncate">Version History</span>
                </button>
              </div>
            </div>

            {/* SIH26044 Role Portals in Mobile Menu */}
            <div className="p-3 glass-card rounded-2xl space-y-2 text-slate-900 dark:text-slate-100 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ecosystem Roles
                </span>
                <span className="px-1.5 py-0.5 rounded glass-pill text-slate-700 dark:text-slate-300 font-semibold text-[9px]">5 Portals</span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setSelectedTemplate(null);
                  navigateToRoute('auth/choose-role');
                }}
                className="w-full py-2 px-3 text-center rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs cursor-pointer"
              >
                Switch Persona / Test Accounts →
              </button>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setSelectedTemplate(null); navigateToRoute('student/dashboard'); }}
                  className="py-2 px-2 rounded-xl glass-pill text-slate-800 dark:text-slate-200 text-left truncate font-medium transition-colors cursor-pointer"
                >
                  Student Portal
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setSelectedTemplate(null); navigateToRoute('faculty/dashboard'); }}
                  className="py-2 px-2 rounded-xl glass-pill text-slate-800 dark:text-slate-200 text-left truncate font-medium transition-colors cursor-pointer"
                >
                  Faculty Hub
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setSelectedTemplate(null); navigateToRoute('industry/dashboard'); }}
                  className="py-2 px-2 rounded-xl glass-pill text-slate-800 dark:text-slate-200 text-left truncate font-medium transition-colors cursor-pointer"
                >
                  Recruiter Hub
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setSelectedTemplate(null); navigateToRoute('institution/dashboard'); }}
                  className="py-2 px-2 rounded-xl glass-pill text-slate-800 dark:text-slate-200 text-left truncate font-medium transition-colors cursor-pointer"
                >
                  Institution Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area (Resume Editor, Saved Resumes, or Template Gallery) */}
      <main className="flex-1 overflow-y-auto relative w-full max-w-full">
        {selectedTemplate ? (
          <ResumeEditor
            template={selectedTemplate}
            initialData={importedResumeData}
            onBackToGallery={() => {
              setSelectedTemplate(null);
              navigateToRoute('gallery');
            }}
          />
        ) : currentRoute === 'dashboard' ? (
          <NovaDashboard
            onCreateNew={() => {
              navigateToRoute('gallery');
            }}
            onEditResume={(item) => {
              setImportedResumeData(item.data);
              const found = ALL_TEMPLATES.find(t => t.id === item.templateId) || ALL_TEMPLATES[0];
              setSelectedTemplate(found);
            }}
            onOpenAtsAnalyzer={() => setIsAtsOpen(true)}
            onOpenCoverLetter={() => setIsCoverLetterOpen(true)}
            onOpenPortfolio={() => setIsPortfolioOpen(true)}
            onOpenImport={() => setIsImportOpen(true)}
          />
        ) : (
          <TemplateGalleryPage onSelectTemplate={handleSelectTemplate} />
        )}
      </main>

      {/* Modals Suite */}
      <AtsAnalyzerModal isOpen={isAtsOpen} onClose={() => setIsAtsOpen(false)} resumeData={activeResumeData} />
      <CoverLetterModal isOpen={isCoverLetterOpen} onClose={() => setIsCoverLetterOpen(false)} resumeData={activeResumeData} />
      <PortfolioModal isOpen={isPortfolioOpen} onClose={() => setIsPortfolioOpen(false)} resumeData={activeResumeData} />
      <ResumeImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImportComplete={handleImportComplete} />
      <ResumeMentorModal isOpen={isMentorOpen} onClose={() => setIsMentorOpen(false)} resumeData={activeResumeData} />
      <VersionHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} currentResumeData={activeResumeData} onRestoreVersion={handleImportComplete} />
      <JobTrackerModal isOpen={isJobTrackerOpen} onClose={() => setIsJobTrackerOpen(false)} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        onCareerAuthSuccess={handleCareerAuthSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
