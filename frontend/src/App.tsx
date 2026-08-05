import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
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
import { ALL_TEMPLATES } from './lib/templateData';
import { Plus, ShieldCheck, Briefcase, Globe, Menu, X, Sparkles, History, Upload } from 'lucide-react';
import { firebaseAuthService } from './services/firebaseAuth';

export const AppContent: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Persistent User State with LocalStorage Fallback
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('nova_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Intro Video Splash State (Only shows on FIRST session visit if user is not logged in)
  const [showIntroVideo, setShowIntroVideo] = useState(() => {
    try {
      if (user) return false; // Never show splash to logged-in user
      return !sessionStorage.getItem('nova_intro_seen');
    } catch {
      return true;
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const closeIntroVideo = () => {
    setShowIntroVideo(false);
    try {
      sessionStorage.setItem('nova_intro_seen', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  // Sync user state to LocalStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('nova_user_profile', JSON.stringify(user));
        setShowIntroVideo(false); // Instantly dismiss splash when user is logged in
      } catch {}
    } else {
      try {
        localStorage.removeItem('nova_user_profile');
      } catch {}
    }
  }, [user]);

  // Force guaranteed native HTML5 video autoplay
  useEffect(() => {
    if (showIntroVideo && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => {
        console.warn("Autoplay play() error:", err);
      });
    }
  }, [showIntroVideo]);

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

  // Firebase Auth State Subscription & Mobile Redirect Result Check
  useEffect(() => {
    // Check for Google Redirect login result on load (for mobile browsers)
    firebaseAuthService.checkRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        setUser(redirectUser);
        setIsAuthOpen(false);
        setShowIntroVideo(false);
      }
    });

    // Real-time auth listener across page refreshes & multi-device isolation
    const unsubscribe = firebaseAuthService.onAuthState((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsAuthOpen(false); // Auto-close modal when user is authenticated
        setShowIntroVideo(false); // Dismiss splash screen on auth confirmation
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);
    setShowIntroVideo(false);
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

  const handleImportComplete = (parsedData: any) => {
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
      setSelectedTemplate(ALL_TEMPLATES[0]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Platform Header */}
      <header className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedTemplate(null)}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-700 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base md:text-lg tracking-wide text-slate-900">
                NovaResume AI
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] hidden md:inline-block">
                Dev: Ved Dhobi
              </span>
            </div>
            <p className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">Developed by Ved Dhobi (veddhobi252@gmail.com)</p>
          </div>
        </div>

        {/* Desktop Global Action Shortcuts */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => requireAuth(() => setSelectedTemplate(ALL_TEMPLATES[0]))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-transform active:scale-95 min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Resume</span>
          </button>

          <button
            onClick={() => requireAuth(() => setIsMentorOpen(true))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100 transition-colors min-h-[40px]"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Resume Mentor</span>
          </button>

          <button
            onClick={() => requireAuth(() => setIsJobTrackerOpen(true))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors min-h-[40px]"
          >
            <Briefcase className="w-4 h-4 text-teal-600" />
            <span>Job Tracker</span>
          </button>

          <button
            onClick={() => requireAuth(() => setIsHistoryOpen(true))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors min-h-[40px]"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>Version History</span>
          </button>

          <button
            onClick={() => requireAuth(() => setIsImportOpen(true))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors min-h-[40px]"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Import Resume</span>
          </button>

          <button
            onClick={() => requireAuth(() => setIsPortfolioOpen(true))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors min-h-[40px]"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Web Portfolio</span>
          </button>

          {/* User Auth Profile Badge / Login Buttons */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {/* Avatar: image if set, else green initials circle */}
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-emerald-300 shadow-xs object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-xs border border-emerald-300 shadow-xs flex-shrink-0">
                  {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <span className="font-extrabold text-xs text-slate-900 block leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-mono block leading-tight">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                className="px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[36px]"
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                className="px-3 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-transform active:scale-95 min-h-[36px]"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle Mobile Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-slate-950/70 backdrop-blur-sm z-50 md:hidden flex flex-col justify-between p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200 space-y-2.5 max-h-[85vh] overflow-y-auto">
            {/* Mobile User Profile Section */}
            {user ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2">
                <div className="flex items-center gap-2.5">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full border border-emerald-400 object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm border border-emerald-400 flex-shrink-0">
                      {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{user.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">{user.email}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="px-2.5 py-1 text-xs font-bold text-rose-600 bg-rose-50 rounded-lg">
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => { setAuthMode('login'); setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                  className="py-2.5 text-xs font-extrabold bg-slate-100 text-slate-800 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                  className="py-2.5 text-xs font-black text-white bg-emerald-600 rounded-xl"
                >
                  Sign Up Free
                </button>
              </div>
            )}

            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Navigation Menu</h3>
            
            <button
              onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setSelectedTemplate(ALL_TEMPLATES[0])); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm min-h-[44px]"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Resume</span>
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsMentorOpen(true)); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-sm min-h-[44px]"
            >
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>AI Resume Mentor</span>
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsJobTrackerOpen(true)); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm min-h-[44px]"
            >
              <Briefcase className="w-5 h-5 text-teal-600" />
              <span>Job Application Tracker</span>
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsHistoryOpen(true)); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm min-h-[44px]"
            >
              <History className="w-5 h-5 text-slate-600" />
              <span>Version History</span>
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsImportOpen(true)); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm min-h-[44px]"
            >
              <Upload className="w-5 h-5 text-emerald-600" />
              <span>Import Resume (PDF/DOCX)</span>
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsAtsOpen(true)); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm min-h-[44px]"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>ATS & JD Matcher</span>
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); requireAuth(() => setIsPortfolioOpen(true)); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm min-h-[44px]"
            >
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Web Portfolio Generator</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-hidden relative">
        {selectedTemplate ? (
          <ResumeEditor
            template={selectedTemplate}
            initialData={importedResumeData}
            onBackToGallery={() => setSelectedTemplate(null)}
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
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} onLoginSuccess={handleLoginSuccess} />

      {/* ── INTRO VIDEO SPLASH OVERLAY WITH TOP WATERMARK CROP & SKIP OPTION ── */}
      {showIntroVideo && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[999999] flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 relative flex flex-col">
            {/* Top Bar with Skip Button */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 z-20">
              <div className="flex items-center gap-2.5 text-white">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-black text-lg shadow-md">
                  N
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">NovaResume AI Showcase</h3>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Platform Introduction</span>
                </div>
              </div>

              {/* Skip Intro CTA */}
              <button
                onClick={closeIntroVideo}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 min-h-[40px]"
              >
                <span>Skip Intro</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Box - Cropped top 12% to hide watermark */}
            <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                src="/promo.mp4"
                autoPlay
                muted
                playsInline
                loop
                onEnded={closeIntroVideo}
                className="w-full h-[126%] object-cover -mt-[13%] transform origin-bottom pointer-events-none"
              />
              
              {/* Floating Bottom-Right Quick Skip Pill */}
              <button
                onClick={closeIntroVideo}
                className="absolute bottom-4 right-4 px-4 py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-extrabold rounded-xl backdrop-blur-md border border-slate-700 shadow-xl flex items-center gap-1.5 z-20 transition-transform active:scale-95"
              >
                <span>Skip & Start Building ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
