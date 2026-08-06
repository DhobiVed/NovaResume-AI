import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TemplateDefinition, ResumeData, ThemeConfig, LayoutType } from '../../lib/resumeTypes';
import { PALETTES, FONTS } from '../../lib/resumeTypes';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES } from '../../lib/templateData';
import { exportToPdf, exportSinglePagePdf, triggerPrintPdf } from '../../lib/pdfExport';
import { saveResumeItem, calculateCompletionPercentage, addActivityLog } from '../../lib/resumeStorage';

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
  Download, Sparkles, Palette as PaletteIcon, Type,
  FileText, Plus, Trash2, ArrowLeft, Check, Camera, Printer, RotateCcw, RotateCw,
  ArrowUp, ArrowDown, Layout, X, Sliders, ZoomIn, ZoomOut, Maximize2, RefreshCw
} from 'lucide-react';

interface Props {
  template: TemplateDefinition;
  onBackToGallery: () => void;
  initialData?: any;
  resumeId?: string;
}

export const ResumeEditor: React.FC<Props> = ({ template: initialTemplate, onBackToGallery, initialData, resumeId: initialResumeId }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Active Template & Switcher
  const [activeTemplate, setActiveTemplate] = useState<TemplateDefinition>(initialTemplate);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [currentResumeId] = useState<string>(
    initialResumeId || `resume_${Date.now()}`
  );

  const [previewScale, setPreviewScale] = useState(0.85);
  const [zoomLevel, setZoomLevel] = useState<number | null>(null);
  const [isFullScreenViewerOpen, setIsFullScreenViewerOpen] = useState(false);

  const [editorTab, setEditorTab] = useState<'content' | 'design' | 'colors' | 'layout' | 'ai'>('content');
  const [contentSection, setContentSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'custom'>('personal');
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved'>('saved');

  // Auto-calculate exact scale to fit 100% of the A4 page inside the viewport
  const calculateAutoFitScale = useCallback(() => {
    if (previewContainerRef.current) {
      const padding = window.innerWidth <= 640 ? 12 : 32;
      const availableW = previewContainerRef.current.clientWidth - padding;
      const availableH = previewContainerRef.current.clientHeight - padding;

      const scaleW = availableW / 794;
      const scaleH = availableH > 250 ? availableH / 1123 : scaleW;

      // On mobile, prioritize full width fit with zero horizontal scroll
      const fit = window.innerWidth <= 640 ? scaleW : Math.min(scaleW, scaleH);
      return Math.min(1, Math.max(0.24, fit));
    }
    return 0.5;
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (zoomLevel === null) {
        setPreviewScale(calculateAutoFitScale());
      } else {
        setPreviewScale(zoomLevel);
      }
    };
    updateScale();
    const timer = setTimeout(updateScale, 80);
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, [mobileViewMode, zoomLevel, calculateAutoFitScale]);

  // Default Theme Configuration based on active template
  const defaultPalette = PALETTES.find(p => p.id === activeTemplate.defaultPaletteId) || PALETTES[0];
  const defaultFont = FONTS.find(f => f.id === activeTemplate.defaultFontId) || FONTS[0];

  const [theme, setTheme] = useState<ThemeConfig>({
    paletteId: defaultPalette.id,
    palette: defaultPalette,
    fontId: defaultFont.id,
    font: defaultFont,
    fontSize: 11,
    lineHeight: 1.5,
    sectionSpacing: 14,
    sidebarWidth: 32,
    layout: activeTemplate.layout
  });

  // Resume Data State
  const [data, setData] = useState<ResumeData>(() => ({
    fullName: initialData?.fullName || 'Alex Vance',
    title: initialData?.title || 'Senior AI & Systems Engineer',
    email: initialData?.email || 'alex.vance@example.com',
    phone: initialData?.phone || '+1 (555) 019-2834',
    location: initialData?.location || 'San Francisco, CA',
    linkedin: initialData?.linkedin || 'linkedin.com/in/alexvance',
    github: initialData?.github || 'github.com/alexvance',
    summary: initialData?.summary || 'Senior AI Engineer with 6+ years of experience designing scalable LLM pipelines, RAG vector architectures, and high-performance FastAPI backends.',
    objective: initialData?.objective || 'To lead innovative AI engineering teams in developing high-throughput LLM architectures and production RAG retrieval platforms.',
    experience: initialData?.experience && initialData.experience.length > 0 ? initialData.experience : [
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
    education: initialData?.education && initialData.education.length > 0 ? initialData.education : [
      { degree: 'B.S. in Computer Science', school: 'University of California, Berkeley', year: '2019', gpa: '3.85' }
    ],
    projects: initialData?.projects && initialData.projects.length > 0 ? initialData.projects : [
      { name: 'NovaResume AI Platform', description: 'Enterprise AI Resume Builder with Canva-style graphic editor and single-page ATS vector PDF generator.', tech: 'React, TypeScript, FastAPI' }
    ],
    skills: initialData?.skills || 'Python, FastAPI, Groq API, LangChain, PyTorch, React, TypeScript, PostgreSQL, Docker, Git, REST APIs',
    certifications: initialData?.certifications || 'AWS Certified Machine Learning Specialist, TensorFlow Developer Certificate',
    languages: initialData?.languages || 'English (Native), Spanish (Professional Working), German (Intermediate)',
    achievements: initialData?.achievements || 'Winner of Global AI Innovation Hackathon (1st place out of 400 teams)\nPublished research paper on Context Window Compression in LLMs',
    showPhoto: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    photoShape: 'round',
    customSections: initialData?.customSections || [
      { title: 'Research & Publications', content: 'Co-authored paper: "Optimizing Context Retrieval Overhead in High-Concurrency Agentic Workflows" (2025)' }
    ]
  }));

  // Structured Language List State
  const [languageList, setLanguageList] = useState<Array<{ name: string; level: string }>>([
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Professional Working' },
    { name: 'German', level: 'Intermediate' }
  ]);

  useEffect(() => {
    if (typeof data.languages === 'string' && data.languages.trim().length > 0) {
      const parts = data.languages.split(/[,|;]/).map(s => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        const parsed = parts.map(p => {
          const match = p.match(/^(.+?)\s*\((.+?)\)$/);
          if (match) return { name: match[1].trim(), level: match[2].trim() };
          return { name: p, level: 'Fluent' };
        });
        setLanguageList(parsed);
      }
    }
  }, []);

  const updateLanguageData = (newList: Array<{ name: string; level: string }>) => {
    setLanguageList(newList);
    const text = newList.map(l => `${l.name} (${l.level})`).join(', ');
    setData(prev => ({ ...prev, languages: text }));
  };

  // Undo / Redo History Stack
  const [history, setHistory] = useState<ResumeData[]>([data]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistoryState = useCallback((newData: ResumeData) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, newData];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setData(history[newIdx]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setData(history[newIdx]);
    }
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerAutoSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, data]);

  // Auto-Save Mechanism
  const triggerAutoSave = useCallback(() => {
    setSaveStatus('saving');
    saveResumeItem(data, activeTemplate.id, currentResumeId);
    setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
  }, [data, activeTemplate, currentResumeId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerAutoSave();
    }, 2500);
    return () => clearTimeout(timer);
  }, [data, activeTemplate, triggerAutoSave]);

  // Sync initialData updates
  useEffect(() => {
    if (initialData) {
      setData((prev) => ({
        ...prev,
        fullName: initialData.fullName || prev.fullName,
        title: initialData.title || prev.title,
        email: initialData.email || prev.email,
        phone: initialData.phone || prev.phone,
        location: initialData.location || prev.location,
        linkedin: initialData.linkedin || prev.linkedin,
        github: initialData.github || prev.github,
        summary: initialData.summary || prev.summary,
        objective: initialData.objective || prev.objective,
        skills: initialData.skills || prev.skills,
        experience: Array.isArray(initialData.experience) && initialData.experience.length > 0 ? initialData.experience : prev.experience,
        education: Array.isArray(initialData.education) && initialData.education.length > 0 ? initialData.education : prev.education,
        projects: Array.isArray(initialData.projects) && initialData.projects.length > 0 ? initialData.projects : prev.projects,
        certifications: initialData.certifications || prev.certifications,
        languages: initialData.languages || prev.languages,
        achievements: initialData.achievements || prev.achievements
      }));
    }
  }, [initialData]);

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
      addActivityLog('pdf_download', `Downloaded PDF for "${data.fullName || 'Resume'}"`);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newData = { ...data, photoUrl: reader.result as string, showPhoto: true };
        setData(newData);
        pushHistoryState(newData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwitchTemplate = (newTemplate: TemplateDefinition) => {
    setActiveTemplate(newTemplate);
    const newPalette = PALETTES.find(p => p.id === newTemplate.defaultPaletteId) || PALETTES[0];
    const newFont = FONTS.find(f => f.id === newTemplate.defaultFontId) || FONTS[0];
    setTheme(prev => ({
      ...prev,
      paletteId: newPalette.id,
      palette: newPalette,
      fontId: newFont.id,
      font: newFont,
      layout: newTemplate.layout
    }));
    setIsTemplateModalOpen(false);
    addActivityLog('template_change', `Switched template to "${newTemplate.name}"`);
    setAiNotice(`Template switched to ${newTemplate.name}! Candidate data preserved 100%.`);
    setTimeout(() => setAiNotice(null), 4000);
  };

  const handleAiAction = (actionType: string) => {
    setAiNotice(null);
    setTimeout(() => {
      if (actionType === 'summary') {
        const newData = {
          ...data,
          summary: 'High-impact Senior AI Engineer specializing in LLM production orchestration, RAG retrieval architectures, and scalable async Python microservices with a proven track record of boosting system performance.'
        };
        setData(newData);
        pushHistoryState(newData);
        setAiNotice('Executive Summary enhanced for ATS readability & impact!');
      } else if (actionType === 'skills') {
        const newData = {
          ...data,
          skills: `${data.skills}, Vector DBs, Prompt Optimization, RAG Architectures, Microservices`
        };
        setData(newData);
        pushHistoryState(newData);
        setAiNotice('Top ATS technical keywords injected!');
      }
      setTimeout(() => setAiNotice(null), 4000);
    }, 400);
  };

  const completionPercentage = calculateCompletionPercentage(data);

  const renderCanvasTemplate = () => {
    switch (activeTemplate.rendererFamily) {
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
    <div className="fixed inset-0 bg-slate-100 z-50 flex flex-col font-sans overflow-hidden animate-fade-in">
      
      {/* ── TOP NAV ACTION BAR (LIGHT / WHITE THEME) ── */}
      <header className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between z-20 text-slate-900 flex-shrink-0 shadow-xs">
        
        {/* Left Brand & Back Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGallery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Active Template & Change Button */}
          <div className="flex items-center gap-2">
            <div>
              <h1 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>{activeTemplate.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase border border-emerald-200 hidden md:inline-block">
                  ATS {activeTemplate.atsScore}%
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                {activeTemplate.category} Layout
              </p>
            </div>

            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-extrabold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer min-h-[36px]"
              title="Change template without losing data"
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Change Template</span>
            </button>
          </div>
        </div>

        {/* Center: Save Status & Completion Meter */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-500">Completion:</span>
            <span className="text-emerald-700">{completionPercentage}%</span>
            <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-1.5 text-xs font-bold">
            {saveStatus === 'saving' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="text-amber-600">Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Saved ✓</span>
              </>
            )}
          </div>
        </div>

        {/* Right CTA Actions: Undo/Redo, Print, Download */}
        <div className="flex items-center gap-2">
          
          {/* Undo / Redo Buttons */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrintPdf}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer min-h-[44px]"
            title="Open browser print dialog to save as A4 PDF"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Print PDF</span>
          </button>

          <button
            onClick={() => handleDownloadPdf(true)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {aiNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shadow-md z-30 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{aiNotice}</span>
          </div>
          <button onClick={() => setAiNotice(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Mode Switcher Bar */}
      <div className="md:hidden flex bg-white p-2 border-b border-slate-200 gap-2 text-xs font-extrabold text-slate-800">
        <button
          onClick={() => setMobileViewMode('edit')}
          className={`flex-1 py-2.5 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
            mobileViewMode === 'edit' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          ✏️ Edit Content
        </button>
        <button
          onClick={() => setMobileViewMode('preview')}
          className={`flex-1 py-2.5 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
            mobileViewMode === 'preview' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          👁️ Live Preview
        </button>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT SIDEBAR EDITOR CONTROLS (LIGHT / WHITE THEME) ── */}
        <div className={`w-full md:w-[480px] lg:w-[520px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-10 ${
          mobileViewMode === 'preview' ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Main Control Tabs */}
          <div className="flex bg-slate-50 border-b border-slate-200 p-2 gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'design', label: 'Typography', icon: Type },
              { id: 'colors', label: 'Palettes', icon: PaletteIcon },
              { id: 'layout', label: 'Layout', icon: Sliders },
              { id: 'ai', label: 'AI Optimizer', icon: Sparkles },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setEditorTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[40px] whitespace-nowrap ${
                    editorTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Section Pills for Content Tab */}
          {editorTab === 'content' && (
            <div className="flex items-center gap-1.5 p-3 bg-slate-50/70 border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { id: 'personal', label: 'Personal' },
                { id: 'experience', label: 'Experience' },
                { id: 'education', label: 'Education' },
                { id: 'skills', label: 'Skills' },
                { id: 'projects', label: 'Projects' },
                { id: 'languages', label: 'Languages' },
                { id: 'custom', label: 'Custom' },
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setContentSection(sec.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                    contentSection === sec.id
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          )}

          {/* Inputs Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 text-xs">
            
            {/* 1. CONTENT TAB */}
            {editorTab === 'content' && (
              <>
                {/* Personal Section */}
                {contentSection === 'personal' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2">Personal & Contact Info</h3>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Full Name</label>
                      <input
                        type="text"
                        value={data.fullName}
                        onChange={e => setData({ ...data, fullName: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Professional Title</label>
                      <input
                        type="text"
                        value={data.title}
                        onChange={e => setData({ ...data, title: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Email</label>
                        <input
                          type="email"
                          value={data.email}
                          onChange={e => setData({ ...data, email: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Phone</label>
                        <input
                          type="text"
                          value={data.phone}
                          onChange={e => setData({ ...data, phone: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">Location</label>
                        <input
                          type="text"
                          value={data.location}
                          onChange={e => setData({ ...data, location: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block">LinkedIn URL</label>
                        <input
                          type="text"
                          value={data.linkedin}
                          onChange={e => setData({ ...data, linkedin: e.target.value })}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Executive Summary</label>
                      <textarea
                        value={data.summary}
                        onChange={e => setData({ ...data, summary: e.target.value })}
                        rows={4}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Experience Section */}
                {contentSection === 'experience' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h3 className="text-sm font-black text-slate-900">Work Experience</h3>
                      <button
                        onClick={() => {
                          const newExp = [...(data.experience || []), { company: 'New Company', role: 'Role Title', dates: '2024 - Present', bullets: 'Add key responsibility or achievement bullet.' }];
                          const nd = { ...data, experience: newExp };
                          setData(nd);
                          pushHistoryState(nd);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Experience
                      </button>
                    </div>

                    {data.experience?.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group">
                        <button
                          onClick={() => {
                            const newExp = data.experience.filter((_, i) => i !== idx);
                            const nd = { ...data, experience: newExp };
                            setData(nd);
                            pushHistoryState(nd);
                          }}
                          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={e => {
                              const copy = [...data.experience];
                              copy[idx].company = e.target.value;
                              setData({ ...data, experience: copy });
                            }}
                            placeholder="Company Name"
                            className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                          />
                          <input
                            type="text"
                            value={exp.role}
                            onChange={e => {
                              const copy = [...data.experience];
                              copy[idx].role = e.target.value;
                              setData({ ...data, experience: copy });
                            }}
                            placeholder="Role / Job Title"
                            className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-emerald-700"
                          />
                        </div>

                        <input
                          type="text"
                          value={exp.dates}
                          onChange={e => {
                            const copy = [...data.experience];
                            copy[idx].dates = e.target.value;
                            setData({ ...data, experience: copy });
                          }}
                          placeholder="Dates (e.g., 2022 - Present)"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                        />

                        <textarea
                          value={exp.bullets}
                          onChange={e => {
                            const copy = [...data.experience];
                            copy[idx].bullets = e.target.value;
                            setData({ ...data, experience: copy });
                          }}
                          rows={3}
                          placeholder="Key responsibilities and achievements (separate lines with Enter)"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Education Section */}
                {contentSection === 'education' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h3 className="text-sm font-black text-slate-900">Education & Degrees</h3>
                      <button
                        onClick={() => {
                          const newEdu = [...(data.education || []), { degree: 'Degree Name', school: 'University Name', year: '2024' }];
                          const nd = { ...data, education: newEdu };
                          setData(nd);
                          pushHistoryState(nd);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Education
                      </button>
                    </div>

                    {data.education?.map((edu, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                        <button
                          onClick={() => {
                            const newEdu = data.education.filter((_, i) => i !== idx);
                            const nd = { ...data, education: newEdu };
                            setData(nd);
                            pushHistoryState(nd);
                          }}
                          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={e => {
                              const copy = [...data.education];
                              copy[idx].degree = e.target.value;
                              setData({ ...data, education: copy });
                            }}
                            placeholder="Degree"
                            className="p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                          />
                          <input
                            type="text"
                            value={edu.school}
                            onChange={e => {
                              const copy = [...data.education];
                              copy[idx].school = e.target.value;
                              setData({ ...data, education: copy });
                            }}
                            placeholder="School / University"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={edu.year}
                            onChange={e => {
                              const copy = [...data.education];
                              copy[idx].year = e.target.value;
                              setData({ ...data, education: copy });
                            }}
                            placeholder="Graduation Year"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                          />
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={e => {
                              const copy = [...data.education];
                              copy[idx].gpa = e.target.value;
                              setData({ ...data, education: copy });
                            }}
                            placeholder="GPA / CGPA"
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills Section */}
                {contentSection === 'skills' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2">Technical & Soft Skills</h3>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Skills (Comma separated list)</label>
                      <textarea
                        value={data.skills}
                        onChange={e => setData({ ...data, skills: e.target.value })}
                        rows={5}
                        placeholder="Python, React, TypeScript, Node.js, SQL, Machine Learning..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {contentSection === 'projects' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h3 className="text-sm font-black text-slate-900">Projects Showcase</h3>
                      <button
                        onClick={() => {
                          const newProj = [...(data.projects || []), { name: 'Project Name', description: 'Project overview and metrics.', tech: 'Technologies used' }];
                          const nd = { ...data, projects: newProj };
                          setData(nd);
                          pushHistoryState(nd);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Project
                      </button>
                    </div>

                    {data.projects?.map((proj, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative">
                        <button
                          onClick={() => {
                            const newProj = data.projects.filter((_, i) => i !== idx);
                            const nd = { ...data, projects: newProj };
                            setData(nd);
                            pushHistoryState(nd);
                          }}
                          className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <input
                          type="text"
                          value={proj.name}
                          onChange={e => {
                            const copy = [...data.projects];
                            copy[idx].name = e.target.value;
                            setData({ ...data, projects: copy });
                          }}
                          placeholder="Project Title"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-900 pr-10"
                        />

                        <textarea
                          value={proj.description}
                          onChange={e => {
                            const copy = [...data.projects];
                            copy[idx].description = e.target.value;
                            setData({ ...data, projects: copy });
                          }}
                          rows={2}
                          placeholder="Description & Key Impact"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-700"
                        />

                        <input
                          type="text"
                          value={proj.tech}
                          onChange={e => {
                            const copy = [...data.projects];
                            copy[idx].tech = e.target.value;
                            setData({ ...data, projects: copy });
                          }}
                          placeholder="Tech Stack (e.g. React, Python, PostgreSQL)"
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-emerald-700 font-bold"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Languages Section */}
                {contentSection === 'languages' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <h3 className="text-sm font-black text-slate-900">Languages & Proficiency</h3>
                      <button
                        onClick={() => {
                          const newList = [...languageList, { name: 'New Language', level: 'Intermediate' }];
                          updateLanguageData(newList);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Language
                      </button>
                    </div>

                    <div className="space-y-2">
                      {languageList.map((lang, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                          <div className="flex flex-col gap-0.5">
                            <button
                              disabled={idx === 0}
                              onClick={() => {
                                if (idx === 0) return;
                                const copy = [...languageList];
                                const temp = copy[idx];
                                copy[idx] = copy[idx - 1];
                                copy[idx - 1] = temp;
                                updateLanguageData(copy);
                              }}
                              className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={idx === languageList.length - 1}
                              onClick={() => {
                                if (idx === languageList.length - 1) return;
                                const copy = [...languageList];
                                const temp = copy[idx];
                                copy[idx] = copy[idx + 1];
                                copy[idx + 1] = temp;
                                updateLanguageData(copy);
                              }}
                              className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={lang.name}
                            onChange={e => {
                              const copy = [...languageList];
                              copy[idx].name = e.target.value;
                              updateLanguageData(copy);
                            }}
                            className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-bold"
                          />

                          <select
                            value={lang.level}
                            onChange={e => {
                              const copy = [...languageList];
                              copy[idx].level = e.target.value;
                              updateLanguageData(copy);
                            }}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-emerald-700 font-bold text-xs"
                          >
                            <option value="Native">Native</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Professional Working">Professional Working</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Basic">Basic</option>
                          </select>

                          <button
                            onClick={() => {
                              const copy = languageList.filter((_, i) => i !== idx);
                              updateLanguageData(copy);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Section */}
                {contentSection === 'custom' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Certifications</label>
                      <textarea
                        value={data.certifications}
                        onChange={e => setData({ ...data, certifications: e.target.value })}
                        rows={3}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">Key Accomplishments</label>
                      <textarea
                        value={data.achievements}
                        onChange={e => setData({ ...data, achievements: e.target.value })}
                        rows={3}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. DESIGN / TYPOGRAPHY TAB (WITH ALL ORIGINAL SLIDERS!) */}
            {editorTab === 'design' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2">Typography & Spacing Controls</h3>
                
                {/* Font Family Selector */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-800 block">Font Family</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setTheme({ ...theme, fontId: f.id, font: f })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all min-h-[44px] ${
                          theme.fontId === f.id ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-bold text-xs block">{f.name}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{f.css}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size Slider */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800">Font Size ({theme.fontSize}px)</label>
                    <span className="font-mono font-bold text-[11px] text-emerald-700">{theme.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="9"
                    max="14"
                    step="0.5"
                    value={theme.fontSize}
                    onChange={(e) => setTheme({ ...theme, fontSize: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Line Height Slider */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800">Line Height ({theme.lineHeight})</label>
                    <span className="font-mono font-bold text-[11px] text-emerald-700">{theme.lineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={theme.lineHeight}
                    onChange={(e) => setTheme({ ...theme, lineHeight: Number(e.target.value) })}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Section Gap Slider */}
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

            {/* 3. COLOR PALETTES TAB */}
            {editorTab === 'colors' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2">White-First Accent Palettes</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {PALETTES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setTheme({ ...theme, paletteId: p.id, palette: p })}
                      className={`p-3 rounded-2xl border text-left font-bold flex items-center justify-between min-h-[44px] cursor-pointer transition-all ${
                        theme.paletteId === p.id ? 'border-2 border-emerald-600 bg-emerald-50/60 shadow-xs' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-slate-900 font-bold text-xs">{p.name}</span>
                      <span className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0" style={{ backgroundColor: p.primary }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. LAYOUT TAB (STRUCTURE & SIDEBAR WIDTH) */}
            {editorTab === 'layout' && (
              <div className="space-y-5 animate-fadeIn">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2">Layout Structure & Photo</h3>
                
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
                        className={`p-2.5 rounded-xl border text-left font-bold text-xs min-h-[44px] cursor-pointer ${
                          theme.layout === l.id ? 'bg-emerald-50 border-2 border-emerald-600 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800">Sidebar Width ({theme.sidebarWidth}%)</label>
                    <span className="font-mono font-bold text-[11px] text-emerald-700">{theme.sidebarWidth}%</span>
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

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
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

            {/* 5. AI OPTIMIZER TAB */}
            {editorTab === 'ai' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-3">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>1-Click AI Resume Optimizer</span>
                  </span>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed">
                    Auto-tune your resume with AI keyword injection, active verbs, and executive phrasing.
                  </p>
                  <button
                    onClick={() => handleAiAction('summary')}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-left shadow-sm text-xs min-h-[44px] cursor-pointer"
                  >
                    ✨ Enhance Executive Summary
                  </button>
                  <button
                    onClick={() => handleAiAction('skills')}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-left shadow-sm text-xs min-h-[44px] cursor-pointer"
                  >
                    🎯 Inject Top ATS Keywords
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT CANVAS LIVE PREVIEW AREA (SLATE-950 CANVAS BACKDROP) ── */}
        <div
          ref={previewContainerRef}
          className={`flex-1 bg-slate-950 p-2 sm:p-4 md:p-6 overflow-auto flex flex-col items-center justify-start min-h-0 relative ${
            mobileViewMode === 'preview' ? 'flex flex-1' : 'hidden md:flex'
          }`}
        >
          {/* Floating Document Viewer Tool Bar */}
          <div className="sticky top-2 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xl text-slate-300 text-xs font-bold my-1">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.25, (prev || previewScale) - 0.1))}
              className="p-1 hover:text-white hover:bg-slate-800 rounded-full cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="font-mono text-[11px] text-emerald-400 min-w-[42px] text-center">
              {Math.round(previewScale * 100)}%
            </span>

            <button
              onClick={() => setZoomLevel(prev => Math.min(1.5, (prev || previewScale) + 0.1))}
              className="p-1 hover:text-white hover:bg-slate-800 rounded-full cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-1" />

            <button
              onClick={() => {
                setZoomLevel(null);
                setPreviewScale(calculateAutoFitScale());
              }}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              title="Reset to Fit Screen"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Fit Page</span>
            </button>

            <button
              onClick={() => setIsFullScreenViewerOpen(true)}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ml-1"
              title="Full Screen Viewer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          </div>

          {/* Scaled A4 Document Canvas */}
          <div
            className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0 my-3 transition-all duration-150 relative"
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

      {/* ── FULL SCREEN MOBILE / DESKTOP DOCUMENT VIEWER MODAL ── */}
      {isFullScreenViewerOpen && (
        <div className="fixed inset-0 z-[999999] bg-slate-950 flex flex-col animate-fadeIn">
          {/* Viewer Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-30">
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm text-white">{data.fullName || 'Resume'} — Live Preview</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                100% Fit View
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownloadPdf(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={() => setIsFullScreenViewerOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Center Canvas */}
          <div className="flex-1 p-4 overflow-auto flex justify-center items-start bg-slate-950">
            <div
              className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0 my-4"
              style={{
                width: `${794 * (window.innerWidth <= 640 ? (window.innerWidth - 24) / 794 : 0.85)}px`,
                height: `${1123 * (window.innerWidth <= 640 ? (window.innerWidth - 24) / 794 : 0.85)}px`,
              }}
            >
              <div
                style={{
                  width: 794,
                  minHeight: 1123,
                  margin: 0,
                  padding: 0,
                  backgroundColor: '#ffffff',
                  transform: `scale(${window.innerWidth <= 640 ? (window.innerWidth - 24) / 794 : 0.85})`,
                  transformOrigin: 'top left',
                }}
              >
                {renderCanvasTemplate()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATE SWITCHER MODAL ── */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-black text-slate-900">Switch Resume Template</h2>
                <p className="text-xs text-slate-500 font-semibold">Your resume candidate data will be preserved 100%.</p>
              </div>
              <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-2 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
              {TEMPLATE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="p-5 flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_TEMPLATES.filter(t => selectedCategory === 'All' || t.category === selectedCategory).map(t => (
                <div
                  key={t.id}
                  onClick={() => handleSwitchTemplate(t)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    activeTemplate.id === t.id ? 'border-emerald-600 bg-emerald-50/20 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-xs text-slate-900">{t.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black">ATS {t.atsScore}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2">{t.description}</p>
                  </div>
                  <button className="mt-3 w-full py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
                    {activeTemplate.id === t.id ? 'Active ✓' : 'Use Template'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
