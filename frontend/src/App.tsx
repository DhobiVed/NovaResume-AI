import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { TemplateGalleryPage } from './components/gallery/TemplateGalleryPage';
import { ResumeEditor } from './components/editor/ResumeEditor';
import { AtsAnalyzerModal } from './components/ats/AtsAnalyzerModal';
import { CoverLetterModal } from './components/coverletter/CoverLetterModal';
import { PortfolioModal } from './components/portfolio/PortfolioModal';
import { ResumeImportModal } from './components/import/ResumeImportModal';
import type { TemplateDefinition } from './lib/resumeTypes';
import { ALL_TEMPLATES } from './lib/templateData';
import { Plus, ShieldCheck, Briefcase, Globe, Menu, X } from 'lucide-react';

export const AppContent: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(true);

  // Modals
  const [isAtsOpen, setIsAtsOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const activeResumeData = {
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

  const handleSelectTemplate = (template: TemplateDefinition) => {
    setSelectedTemplate(template);
  };

  const handleImportComplete = (_parsedData: any) => {
    setSelectedTemplate(ALL_TEMPLATES[0]);
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
            onClick={() => setSelectedTemplate(ALL_TEMPLATES[0])}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition-transform active:scale-95 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Resume</span>
          </button>

          <button
            onClick={() => setIsAtsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ATS & JD Matcher</span>
          </button>

          <button
            onClick={() => setIsCoverLetterOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            <Briefcase className="w-4 h-4 text-teal-600" />
            <span>AI Cover Letter</span>
          </button>

          <button
            onClick={() => setIsPortfolioOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Web Portfolio Generator</span>
          </button>
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
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Navigation Menu</h3>
            
            <button
              onClick={() => { setSelectedTemplate(ALL_TEMPLATES[0]); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm min-h-[44px]"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Resume</span>
            </button>

            <button
              onClick={() => { setIsAtsOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm min-h-[44px]"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>ATS & JD Matcher</span>
            </button>

            <button
              onClick={() => { setIsCoverLetterOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm min-h-[44px]"
            >
              <Briefcase className="w-5 h-5 text-teal-600" />
              <span>AI Cover Letter Generator</span>
            </button>

            <button
              onClick={() => { setIsPortfolioOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm min-h-[44px]"
            >
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Web Portfolio Generator</span>
            </button>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-bold text-emerald-400">Developed by Ved Dhobi</div>
            <div className="text-[11px] text-slate-400 font-mono">veddhobi252@gmail.com</div>
          </div>
        </div>
      )}

      {/* View Switcher: Gallery Page vs Full Editor */}
      <div className="flex-1 overflow-hidden relative">
        {selectedTemplate ? (
          <ResumeEditor
            template={selectedTemplate}
            onBackToGallery={() => setSelectedTemplate(null)}
          />
        ) : (
          <div className="h-full overflow-y-auto">
            <TemplateGalleryPage onSelectTemplate={handleSelectTemplate} />
          </div>
        )}
      </div>

      {/* Modals Suite */}
      <AtsAnalyzerModal isOpen={isAtsOpen} onClose={() => setIsAtsOpen(false)} resumeData={activeResumeData} />
      <CoverLetterModal isOpen={isCoverLetterOpen} onClose={() => setIsCoverLetterOpen(false)} resumeData={activeResumeData} />
      <PortfolioModal isOpen={isPortfolioOpen} onClose={() => setIsPortfolioOpen(false)} resumeData={activeResumeData} />
      <ResumeImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImportComplete={handleImportComplete} />

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
                onClick={() => setShowIntroVideo(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 min-h-[40px]"
              >
                <span>Skip Intro</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Box - Cropped top 12% to hide watermark */}
            <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
              <video
                src="/promo.mp4"
                autoPlay
                controls
                onEnded={() => setShowIntroVideo(false)}
                className="w-full h-[126%] object-cover -mt-[13%] transform origin-bottom"
              />
              
              {/* Floating Bottom-Right Quick Skip Pill */}
              <button
                onClick={() => setShowIntroVideo(false)}
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
