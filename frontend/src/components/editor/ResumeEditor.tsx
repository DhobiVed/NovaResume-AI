import React, { useState, useRef, useEffect } from 'react';
import type { TemplateDefinition, ResumeData, ThemeConfig, LayoutType } from '../../lib/resumeTypes';
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
  FileText, Plus, Trash2, ArrowLeft, Check, Camera, Printer
} from 'lucide-react';

interface Props {
  template: TemplateDefinition;
  onBackToGallery: () => void;
}

export const ResumeEditor: React.FC<Props> = ({ template, onBackToGallery }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.85);
  const [editorTab, setEditorTab] = useState<'content' | 'design' | 'colors' | 'layout' | 'ai'>('content');
  const [contentSection, setContentSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'custom'>('personal');
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Auto-calculate exact zoom scale so canvas fits preview area with zero border clipping
  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth - 32;
        const targetScale = Math.min(1, Math.max(0.35, containerWidth / 794));
        setPreviewScale(targetScale);
      }
    };
    updateScale();
    const timer = setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [mobileViewMode]);

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
      setAiNotice('PDF exported successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
      setTimeout(() => setAiNotice(null), 4000);
    }
  };

  const handlePrintPdf = () => {
    if (canvasRef.current) {
      triggerPrintPdf(canvasRef.current, `${data.fullName || 'Resume'}_Resume`);
    }
  };

  // Profile Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, photoUrl: reader.result as string, showPhoto: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Assistant actions
  const handleAiAction = (actionType: string) => {
    setAiNotice(null);
    setTimeout(() => {
      if (actionType === 'summary') {
        setData(prev => ({
          ...prev,
          summary: 'High-impact Senior AI Engineer specializing in LLM production orchestration, RAG retrieval architectures, and scalable async Python microservices with a proven track record of boosting system performance.'
        }));
        setAiNotice('Executive Summary enhanced for ATS readability & impact!');
      } else if (actionType === 'skills') {
        setData(prev => ({
          ...prev,
          skills: `${prev.skills}, Vector DBs, Prompt Optimization, RAG Architectures, Microservices`
        }));
        setAiNotice('Top ATS technical keywords injected!');
      }
      setTimeout(() => setAiNotice(null), 4000);
    }, 400);
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
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans overflow-hidden animate-fade-in">
      {/* Top Action Navbar */}
      <header className="h-16 px-4 md:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 text-white flex-shrink-0">
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
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
            title="Open browser print dialog to save as A4 PDF"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={() => handleDownloadPdf(true)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download PDF (A4)'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Top View Switcher (Edit vs Preview) */}
      <div className="flex md:hidden bg-slate-950 p-2 border-b border-slate-800 gap-2 flex-shrink-0">
        <button
          onClick={() => setMobileViewMode('edit')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            mobileViewMode === 'edit' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📝 Form Editor
        </button>
        <button
          onClick={() => setMobileViewMode('preview')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
            mobileViewMode === 'preview' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          👁️ Live Preview
        </button>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Controls Panel */}
        <div className={`w-full md:w-[420px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 overflow-y-auto min-h-0 ${
          mobileViewMode === 'edit' ? 'flex flex-1' : 'hidden md:flex'
        }`}>
          {/* Top 5 Control Tabs */}
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
                <button
                  key={tab.id}
                  onClick={() => setEditorTab(tab.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center py-2 text-[11px] font-bold rounded-xl transition-all min-h-[44px] ${
                    editorTab === tab.id
                      ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI Banner / Feedback */}
          {aiNotice && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{aiNotice}</span>
            </div>
          )}

          {/* TAB 1: Content Forms */}
          {editorTab === 'content' && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Content Sub-tabs */}
              <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50">
                {[
                  { id: 'personal', label: 'Personal' },
                  { id: 'experience', label: 'Experience' },
                  { id: 'education', label: 'Education' },
                  { id: 'skills', label: 'Skills' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'custom', label: 'Custom' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setContentSection(sub.id as any)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors min-h-[40px] ${
                      contentSection === sub.id ? 'bg-emerald-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. PERSONAL */}
                {contentSection === 'personal' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={data.fullName}
                          onChange={(e) => setData({ ...data, fullName: e.target.value })}
                          className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Job Title</label>
                        <input
                          type="text"
                          value={data.title}
                          onChange={(e) => setData({ ...data, title: e.target.value })}
                          className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Email</label>
                        <input
                          type="email"
                          value={data.email}
                          onChange={(e) => setData({ ...data, email: e.target.value })}
                          className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone</label>
                        <input
                          type="text"
                          value={data.phone}
                          onChange={(e) => setData({ ...data, phone: e.target.value })}
                          className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Location</label>
                        <input
                          type="text"
                          value={data.location}
                          onChange={(e) => setData({ ...data, location: e.target.value })}
                          className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">LinkedIn</label>
                        <input
                          type="text"
                          value={data.linkedin}
                          onChange={(e) => setData({ ...data, linkedin: e.target.value })}
                          className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">GitHub / Website</label>
                      <input
                        type="text"
                        value={data.github}
                        onChange={(e) => setData({ ...data, github: e.target.value })}
                        className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Executive Summary</label>
                      <textarea
                        value={data.summary}
                        onChange={(e) => setData({ ...data, summary: e.target.value })}
                        rows={4}
                        className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* 2. EXPERIENCE */}
                {contentSection === 'experience' && (
                  <div className="space-y-3">
                    {data.experience.map((exp, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">Position #{idx + 1}</span>
                          <button
                            onClick={() => setData({ ...data, experience: data.experience.filter((_, i) => i !== idx) })}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => {
                              const updated = [...data.experience];
                              updated[idx].role = e.target.value;
                              setData({ ...data, experience: updated });
                            }}
                            placeholder="Job Role / Title"
                            className="p-2.5 text-xs rounded-xl bg-white border border-slate-200 font-bold min-h-[44px]"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...data.experience];
                              updated[idx].company = e.target.value;
                              setData({ ...data, experience: updated });
                            }}
                            placeholder="Company"
                            className="p-2.5 text-xs rounded-xl bg-white border border-slate-200 min-h-[44px]"
                          />
                        </div>
                        <input
                          type="text"
                          value={exp.dates}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].dates = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          placeholder="Dates (e.g. 2022 - Present)"
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 min-h-[44px]"
                        />
                        <textarea
                          value={exp.bullets}
                          onChange={(e) => {
                            const updated = [...data.experience];
                            updated[idx].bullets = e.target.value;
                            setData({ ...data, experience: updated });
                          }}
                          rows={3}
                          placeholder="Bullet accomplishments (newline separated)..."
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setData({
                        ...data,
                        experience: [...data.experience, { company: 'New Tech Corp', role: 'Senior Engineer', dates: '2023 - Present', bullets: 'Led cross-functional engineering sprint\nOptimized infrastructure throughput by 40%' }]
                      })}
                      className="w-full py-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Position</span>
                    </button>
                  </div>
                )}

                {/* 3. EDUCATION */}
                {contentSection === 'education' && (
                  <div className="space-y-3">
                    {data.education.map((ed, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">Education #{idx + 1}</span>
                          <button
                            onClick={() => setData({ ...data, education: data.education.filter((_, i) => i !== idx) })}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={ed.degree}
                          onChange={(e) => {
                            const updated = [...data.education];
                            updated[idx].degree = e.target.value;
                            setData({ ...data, education: updated });
                          }}
                          placeholder="Degree"
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 font-bold min-h-[44px]"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={ed.school}
                            onChange={(e) => {
                              const updated = [...data.education];
                              updated[idx].school = e.target.value;
                              setData({ ...data, education: updated });
                            }}
                            placeholder="University / School"
                            className="p-2.5 text-xs rounded-xl bg-white border border-slate-200 min-h-[44px]"
                          />
                          <input
                            type="text"
                            value={ed.year}
                            onChange={(e) => {
                              const updated = [...data.education];
                              updated[idx].year = e.target.value;
                              setData({ ...data, education: updated });
                            }}
                            placeholder="Graduation Year"
                            className="p-2.5 text-xs rounded-xl bg-white border border-slate-200 min-h-[44px]"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setData({
                        ...data,
                        education: [...data.education, { degree: 'M.S. in Computer Science', school: 'Stanford University', year: '2021' }]
                      })}
                      className="w-full py-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Education</span>
                    </button>
                  </div>
                )}

                {/* 4. SKILLS & EXTRA */}
                {contentSection === 'skills' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Technical & Core Skills (Comma Separated)</label>
                      <textarea
                        value={data.skills}
                        onChange={(e) => setData({ ...data, skills: e.target.value })}
                        rows={4}
                        className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Certifications</label>
                      <textarea
                        value={data.certifications || ''}
                        onChange={(e) => setData({ ...data, certifications: e.target.value })}
                        rows={2}
                        className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* 5. PROJECTS */}
                {contentSection === 'projects' && (
                  <div className="space-y-3">
                    {data.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">Project #{idx + 1}</span>
                          <button
                            onClick={() => setData({ ...data, projects: data.projects.filter((_, i) => i !== idx) })}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].name = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          placeholder="Project Name"
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 font-bold min-h-[44px]"
                        />
                        <input
                          type="text"
                          value={proj.tech || ''}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].tech = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          placeholder="Tech Stack (e.g. React, Python, AWS)"
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 min-h-[44px]"
                        />
                        <textarea
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[idx].description = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          rows={2}
                          placeholder="Description..."
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setData({
                        ...data,
                        projects: [...data.projects, { name: 'AI Analytics Engine', description: 'Built an async real-time telemetry dashboard using React and Python.', tech: 'Python, FastAPI, React' }]
                      })}
                      className="w-full py-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Project</span>
                    </button>
                  </div>
                )}

                {/* 6. CUSTOM SECTIONS */}
                {contentSection === 'custom' && (
                  <div className="space-y-3">
                    {data.customSections.map((sec, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-800">Custom Section #{idx + 1}</span>
                          <button
                            onClick={() => setData({ ...data, customSections: data.customSections.filter((_, i) => i !== idx) })}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => {
                            const updated = [...data.customSections];
                            updated[idx].title = e.target.value;
                            setData({ ...data, customSections: updated });
                          }}
                          placeholder="Section Title (e.g. Research, Volunteering)"
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 font-bold min-h-[44px]"
                        />
                        <textarea
                          value={sec.content}
                          onChange={(e) => {
                            const updated = [...data.customSections];
                            updated[idx].content = e.target.value;
                            setData({ ...data, customSections: updated });
                          }}
                          rows={3}
                          placeholder="Section content..."
                          className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setData({
                        ...data,
                        customSections: [...data.customSections, { title: 'Awards & Honors', content: 'Received Outstanding Engineer Award 2025' }]
                      })}
                      className="w-full py-3 bg-white border-2 border-dashed border-slate-300 rounded-2xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Custom Section</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Typography & Spacing Controls */}
          {editorTab === 'design' && (
            <div className="p-4 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="font-bold text-slate-800 block mb-2">Typography Pairings</label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setTheme(prev => ({ ...prev, fontId: f.id, font: f }))}
                      className={`p-3 rounded-2xl border text-left font-bold transition-all min-h-[44px] ${
                        theme.fontId === f.id ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{f.name}</span>
                      <span className="block text-[10px] opacity-60 font-normal">Modern Font</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Font Size Control */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">Base Font Size ({theme.fontSize}px)</label>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={() => setTheme(prev => ({ ...prev, fontSize: Math.max(7, Number((prev.fontSize - 0.5).toFixed(1))) }))}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 font-bold text-slate-700 shadow-xs"
                      title="Decrease font size"
                    >
                      -
                    </button>
                    <span className="px-1.5 font-mono font-bold text-[11px] text-emerald-700">{theme.fontSize}px</span>
                    <button
                      onClick={() => setTheme(prev => ({ ...prev, fontSize: Math.min(18, Number((prev.fontSize + 0.5).toFixed(1))) }))}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 font-bold text-slate-700 shadow-xs"
                      title="Increase font size"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Presets Grid */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: 'Compact', size: 8.5 },
                    { label: 'Standard', size: 10 },
                    { label: 'Medium', size: 11.5 },
                    { label: 'Large', size: 13 },
                    { label: 'XL', size: 15 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setTheme(prev => ({ ...prev, fontSize: preset.size }))}
                      className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        theme.fontSize === preset.size
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>{preset.label}</div>
                      <div className="text-[9px] opacity-80">{preset.size}px</div>
                    </button>
                  ))}
                </div>

                {/* Granular Slider */}
                <input
                  type="range"
                  min="7"
                  max="18"
                  step="0.5"
                  value={theme.fontSize}
                  onChange={(e) => setTheme({ ...theme, fontSize: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Line Height Control */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">Line Spacing ({theme.lineHeight})</label>
                  <span className="font-mono font-bold text-[11px] text-emerald-700">{theme.lineHeight}x</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Tight', val: 1.25 },
                    { label: 'Normal', val: 1.5 },
                    { label: 'Relaxed', val: 1.75 }
                  ].map(lh => (
                    <button
                      key={lh.label}
                      onClick={() => setTheme(prev => ({ ...prev, lineHeight: lh.val }))}
                      className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                        theme.lineHeight === lh.val
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lh.label} ({lh.val})
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="1.1"
                  max="2.0"
                  step="0.05"
                  value={theme.lineHeight}
                  onChange={(e) => setTheme({ ...theme, lineHeight: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Section Spacing Control */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">Section Gap ({theme.sectionSpacing}px)</label>
                  <span className="font-mono font-bold text-[11px] text-emerald-700">{theme.sectionSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="1"
                  value={theme.sectionSpacing}
                  onChange={(e) => setTheme({ ...theme, sectionSpacing: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Palettes */}
          {editorTab === 'colors' && (
            <div className="p-4 space-y-4 text-xs overflow-y-auto">
              <label className="font-bold text-slate-800 block mb-2">White-First Accent Palettes</label>
              <div className="grid grid-cols-2 gap-2">
                {PALETTES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setTheme(prev => ({ ...prev, paletteId: p.id, palette: p }))}
                    className={`p-3 rounded-2xl border text-left font-bold flex items-center justify-between min-h-[44px] ${
                      theme.paletteId === p.id ? 'border-2 border-emerald-600 shadow-sm' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="w-5 h-5 rounded-full border border-slate-200 flex-shrink-0" style={{ backgroundColor: p.primary }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Layout Customizer */}
          {editorTab === 'layout' && (
            <div className="p-4 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="font-bold text-slate-800 block mb-2">Layout Structure</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'two_col_left', label: '2-Col Left Sidebar' },
                    { id: 'two_col_right', label: '2-Col Right Sidebar' },
                    { id: 'one_col', label: 'Single Column ATS' },
                    { id: 'top_header', label: 'Top Header Banner' }
                  ].map(l => (
                    <button
                      key={l.id}
                      onClick={() => setTheme(prev => ({ ...prev, layout: l.id as LayoutType }))}
                      className={`p-2.5 rounded-xl border text-left font-bold text-xs min-h-[44px] ${
                        theme.layout === l.id ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800">Sidebar Width ({theme.sidebarWidth}%)</label>
                </div>
                <input
                  type="range"
                  min="25"
                  max="40"
                  value={theme.sidebarWidth}
                  onChange={(e) => setTheme({ ...theme, sidebarWidth: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Show Profile Photo</span>
                  <input
                    type="checkbox"
                    checked={data.showPhoto || false}
                    onChange={(e) => setData({ ...data, showPhoto: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 min-w-[20px] min-h-[20px]"
                  />
                </div>
                {data.showPhoto && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-3">
                      <img src={data.photoUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-slate-300" />
                      <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 min-h-[44px]">
                        <Camera className="w-4 h-4" />
                        <span>Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AI Assistance */}
          {editorTab === 'ai' && (
            <div className="p-4 space-y-3 text-xs">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-3">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>1-Click AI Optimizer</span>
                </span>
                <button
                  onClick={() => handleAiAction('summary')}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-left shadow text-xs min-h-[44px]"
                >
                  ✨ Enhance Executive Summary
                </button>
                <button
                  onClick={() => handleAiAction('skills')}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-left shadow text-xs min-h-[44px]"
                >
                  🎯 Inject Top ATS Keywords
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Canvas Preview Area */}
        <div
          ref={previewContainerRef}
          className={`flex-1 bg-slate-950 p-2 sm:p-4 md:p-6 overflow-auto flex justify-center items-start min-h-0 ${
            mobileViewMode === 'preview' ? 'flex flex-1' : 'hidden md:flex'
          }`}
        >
          <div
            className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0 my-3 transition-all duration-150"
            style={{
              width: `${794 * previewScale}px`,
              height: `${1123 * previewScale}px`,
            }}
          >
            <div
              ref={canvasRef}
              style={{
                width: 794,
                minHeight: 1123,
                margin: 0,
                padding: 0,
                backgroundColor: '#ffffff',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              {renderCanvasTemplate()}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="md:hidden bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-2 z-30 flex-shrink-0">
        <button
          onClick={onBackToGallery}
          className="px-3 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Templates</span>
        </button>

        <button
          onClick={() => handleDownloadPdf(true)}
          disabled={isExporting}
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>
    </div>
  );
};
