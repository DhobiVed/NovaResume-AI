import React, { useState, useRef } from 'react';
import type { TemplateDefinition, ResumeData, ThemeConfig } from '../../lib/resumeTypes';
import { PALETTES, FONTS } from '../../lib/resumeTypes';
import { exportToPdf, exportSinglePagePdf, triggerPrintPdf } from '../../lib/pdfExport';
import { ModernSidebarTemplate } from '../templates/ModernSidebarTemplate';
import { ExecutiveHeaderTemplate } from '../templates/ExecutiveHeaderTemplate';
import { AtsClassicTemplate } from '../templates/AtsClassicTemplate';
import { MinimalLineTemplate } from '../templates/MinimalLineTemplate';
import { SoftwareEngTemplate } from '../templates/SoftwareEngTemplate';
import { StudentFresherTemplate } from '../templates/StudentFresherTemplate';
import { CorporateTemplate } from '../templates/CorporateTemplate';
import { CreativeCardTemplate } from '../templates/CreativeCardTemplate';
import { StartupTemplate } from '../templates/StartupTemplate';
import { ElegantTemplate } from '../templates/ElegantTemplate';
import {
  Download, Sparkles, Palette as PaletteIcon, Type, Layout as LayoutIcon,
  FileText, ArrowLeft, Check, Printer
} from 'lucide-react';

interface Props {
  template: TemplateDefinition;
  onBackToGallery: () => void;
}

export const ResumeEditor: React.FC<Props> = ({ template, onBackToGallery }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [editorTab, setEditorTab] = useState<'content' | 'design' | 'colors' | 'layout' | 'ai'>('content');
  const [contentSection, setContentSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'custom'>('personal');
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Default theme state based on template selection
  const defaultPalette = PALETTES.find(p => p.id === template.defaultPaletteId) || PALETTES[0];
  const defaultFont = FONTS.find(f => f.id === template.defaultFontId) || FONTS[0];

  const [theme, setTheme] = useState<ThemeConfig>({
    paletteId: defaultPalette.id,
    palette: defaultPalette,
    fontId: defaultFont.id,
    font: defaultFont,
    fontSize: 11,
    lineHeight: 1.5,
    sectionSpacing: 14,
    sidebarWidth: 32,
    layout: template.layout
  });

  // Resume Content State
  const [data, setData] = useState<ResumeData>({
    fullName: 'Alex Vance',
    title: 'Senior AI & Systems Engineer',
    email: 'alex.vance@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexvance',
    github: 'github.com/alexvance',
    summary: 'Senior AI Engineer with 6+ years of experience designing scalable LLM pipelines, RAG vector architectures, and high-performance FastAPI backends.',
    objective: 'To lead innovative AI engineering teams in developing high-throughput LLM architectures and production RAG retrieval platforms.',
    experience: [
      {
        company: 'NeuralTech AI',
        role: 'Lead AI Engineer',
        dates: '2022 - Present',
        location: 'San Francisco, CA',
        bullets: 'Architected enterprise RAG document retrieval engines using FAISS & Groq API, scaling query throughput by 300%.\nEngineered async FastAPI microservices handling 50k+ daily streaming requests.'
      },
      {
        company: 'DataFlow Systems',
        role: 'Software Engineer',
        dates: '2019 - 2022',
        location: 'San Jose, CA',
        bullets: 'Developed React & TypeScript dashboards for real-time model monitoring.\nOptimized SQL queries reducing analytics latency by 45%.'
      }
    ],
    education: [
      { degree: 'B.S. in Computer Science', school: 'University of California, Berkeley', year: '2019', gpa: '3.85' }
    ],
    projects: [
      { name: 'NovaResume AI Platform', description: 'Enterprise AI Resume Builder with Canva-style graphic editor and single-page ATS vector PDF generator.', tech: 'React, TypeScript, FastAPI' }
    ],
    skills: 'Python, FastAPI, Groq API, LangChain, PyTorch, React, TypeScript, PostgreSQL, Docker, Git, REST APIs',
    certifications: 'AWS Certified Machine Learning Specialist, TensorFlow Developer Certificate',
    languages: 'English (Native), Spanish (Professional)',
    achievements: 'Winner of Global AI Innovation Hackathon (1st place out of 400 teams)\nPublished research paper on Context Window Compression in LLMs',
    showPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    photoShape: 'round',
    customSections: [
      { title: 'Research & Publications', content: 'Co-authored paper: "Optimizing Context Retrieval Overhead in High-Concurrency Agentic Workflows" (2025)' }
    ]
  });

  // Export handlers
  const handleDownloadPdf = async (singlePage: boolean = true) => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    setAiNotice('Generating vector PDF...');
    try {
      if (singlePage) {
        await exportSinglePagePdf(canvasRef.current, `${data.fullName || 'Resume'}_Resume`);
      } else {
        await exportToPdf(canvasRef.current, `${data.fullName || 'Resume'}_Resume`);
      }
      setAiNotice('Resume PDF exported successfully!');
    } catch (e) {
      console.error('Download error:', e);
      if (canvasRef.current) {
        triggerPrintPdf(canvasRef.current, `${data.fullName || 'Resume'}_Resume`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    if (canvasRef.current) {
      triggerPrintPdf(canvasRef.current, `${data.fullName || 'Resume'}_Resume`);
    }
  };



  // Render proper template component inside live canvas
  const renderCanvasTemplate = () => {
    switch (template.rendererFamily) {
      case 'ExecutiveHeader': return <ExecutiveHeaderTemplate data={data} theme={theme} />;
      case 'AtsClassic': return <AtsClassicTemplate data={data} theme={theme} />;
      case 'MinimalLine': return <MinimalLineTemplate data={data} theme={theme} />;
      case 'SoftwareEng': return <SoftwareEngTemplate data={data} theme={theme} />;
      case 'StudentFresher': return <StudentFresherTemplate data={data} theme={theme} />;
      case 'Corporate': return <CorporateTemplate data={data} theme={theme} />;
      case 'CreativeCard': return <CreativeCardTemplate data={data} theme={theme} />;
      case 'Startup': return <StartupTemplate data={data} theme={theme} />;
      case 'Elegant': return <ElegantTemplate data={data} theme={theme} />;
      case 'ModernSidebar':
      default: return <ModernSidebarTemplate data={data} theme={theme} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans select-none overflow-hidden animate-fade-in">
      {/* Top Action Navbar */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGallery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <div className="h-5 w-[1px] bg-slate-700 hidden sm:block" />
          <div>
            <h1 className="font-extrabold text-sm text-white">{template.name}</h1>
            <span className="text-[10px] text-emerald-400 font-semibold">{template.category} Layout</span>
          </div>
        </div>

        {/* Export CTA Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
            title="Open browser print dialog to save as A4 PDF"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Print / Save PDF</span>
          </button>

          <button
            onClick={() => handleDownloadPdf(true)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      <div className="flex md:hidden bg-slate-950 p-2 border-b border-slate-800 gap-2">
        <button onClick={() => setMobileViewMode('edit')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${mobileViewMode === 'edit' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>📝 Form Editor</button>
        <button onClick={() => setMobileViewMode('preview')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${mobileViewMode === 'preview' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>👁️ Live Preview</button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`w-full md:w-[420px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 ${mobileViewMode === 'edit' ? 'flex flex-1' : 'hidden md:flex'}`}>
          <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200">
            {[
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'design', label: 'Fonts', icon: Type },
              { id: 'colors', label: 'Palettes', icon: PaletteIcon },
              { id: 'layout', label: 'Layout', icon: LayoutIcon },
              { id: 'ai', label: 'AI Tools', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setEditorTab(tab.id as any)} className={`flex-1 flex flex-col items-center justify-center py-2 text-[11px] font-bold rounded-xl transition-all min-h-[44px] ${editorTab === tab.id ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {aiNotice && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{aiNotice}</span>
            </div>
          )}

          {editorTab === 'content' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50">
                {['personal', 'experience', 'education', 'skills', 'projects', 'custom'].map(sub => (
                  <button key={sub} onClick={() => setContentSection(sub as any)} className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors min-h-[40px] ${contentSection === sub ? 'bg-emerald-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {contentSection === 'personal' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                        <input type="text" value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold min-h-[44px]" />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Job Title</label>
                        <input type="text" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold min-h-[44px]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Executive Summary</label>
                      <textarea value={data.summary} onChange={(e) => setData({ ...data, summary: e.target.value })} rows={4} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 leading-relaxed" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {editorTab === 'design' && (
            <div className="p-4 space-y-4 text-xs overflow-y-auto">
              <label className="font-bold text-slate-800 block mb-2">Typography Pairings</label>
              <div className="grid grid-cols-2 gap-2">
                {FONTS.map(f => (
                  <button key={f.id} onClick={() => setTheme(prev => ({ ...prev, fontId: f.id, font: f }))} className={`p-3 rounded-2xl border text-left font-bold transition-all ${theme.fontId === f.id ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`flex-1 bg-slate-950 p-2 sm:p-4 md:p-8 overflow-y-auto flex justify-center items-start ${mobileViewMode === 'preview' ? 'flex flex-1' : 'hidden md:flex'}`}>
          <div className="w-full flex justify-center py-4 overflow-x-hidden">
            <div className="transform scale-[0.42] sm:scale-[0.62] md:scale-90 lg:scale-100 origin-top shadow-2xl rounded-sm overflow-hidden flex-shrink-0" style={{ width: 794, minHeight: 1123 }}>
              <div ref={canvasRef} style={{ width: 794, minHeight: 1123, margin: 0, padding: 0, backgroundColor: '#ffffff' }}>
                {renderCanvasTemplate()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-2 z-30 flex-shrink-0">
        <button onClick={onBackToGallery} className="px-3 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" />
          <span>Templates</span>
        </button>
        <button onClick={() => handleDownloadPdf(true)} className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 min-h-[44px]">
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>
    </div>
  );
};
