import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TemplateDefinition, ResumeData, ThemeConfig } from '../../lib/resumeTypes';
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
  ArrowUp, ArrowDown, Layout, X
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
  
  // Template Switcher State
  const [activeTemplate, setActiveTemplate] = useState<TemplateDefinition>(initialTemplate);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Active Resume ID & Storage
  const [currentResumeId] = useState<string>(
    initialResumeId || `resume_${Date.now()}`
  );

  const [previewScale, setPreviewScale] = useState(0.85);
  const [editorTab, setEditorTab] = useState<'content' | 'design' | 'colors' | 'layout' | 'ai'>('content');
  const [contentSection, setContentSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'languages' | 'custom'>('personal');
  const [mobileViewMode, setMobileViewMode] = useState<'edit' | 'preview'>('edit');
  const [isExporting, setIsExporting] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved'>('saved');

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

  // Default theme state based on active template selection
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

  // Resume Content State (Populates imported data if present)
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
    languages: initialData?.languages || 'English (Native), Spanish (Professional), German (Intermediate)',
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

  // Sync data to languageList when data.languages string updates
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

  // Sync languageList back into data.languages string
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

  // Auto-Save Mechanism (Debounced 2.5s)
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

  // Sync state if initialData changes dynamically
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
        experience: initialData.experience && initialData.experience.length > 0 ? initialData.experience : prev.experience,
        education: initialData.education && initialData.education.length > 0 ? initialData.education : prev.education,
        projects: initialData.projects && initialData.projects.length > 0 ? initialData.projects : prev.projects,
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

  // Profile Photo Upload Handler
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

  // Switch template without losing data
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
    setAiNotice(`Template switched to ${newTemplate.name}! All your data remains intact.`);
    setTimeout(() => setAiNotice(null), 4000);
  };

  // AI Assistant actions
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

  // Render proper template component inside live canvas
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
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans overflow-hidden animate-fade-in">
      
      {/* ── TOP NAV ACTION BAR ── */}
      <header className="h-16 px-4 md:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 text-white flex-shrink-0">
        
        {/* Left Brand & Back Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGallery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700 hidden sm:block" />

          {/* Active Template & Switch Button */}
          <div className="flex items-center gap-2">
            <div>
              <h1 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                <span>{activeTemplate.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase border border-emerald-500/30 hidden md:inline-block">
                  ATS {activeTemplate.atsScore}%
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                {activeTemplate.category} Layout
              </p>
            </div>

            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer min-h-[36px]"
              title="Change template without losing data"
            >
              <Layout className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Change Template</span>
            </button>
          </div>
        </div>

        {/* Center: Save Status & Completion Percentage */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-slate-400">Completion:</span>
            <span className="text-emerald-400">{completionPercentage}%</span>
            <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Auto-Save Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            {saveStatus === 'saving' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-400">Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Saved ✓</span>
              </>
            )}
          </div>
        </div>

        {/* Right CTA Actions: Undo/Redo, Print, Download */}
        <div className="flex items-center gap-2">
          
          {/* Undo / Redo */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handlePrintPdf}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer min-h-[44px]"
            title="Open browser print dialog to save as A4 PDF"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Print PDF</span>
          </button>

          <button
            onClick={() => handleDownloadPdf(true)}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 min-h-[44px] cursor-pointer"
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

      {/* Mobile Mode Switcher Bar (Edit Form vs Preview) */}
      <div className="md:hidden flex bg-slate-950 p-2 border-b border-slate-800 gap-2 text-xs font-extrabold text-white">
        <button
          onClick={() => setMobileViewMode('edit')}
          className={`flex-1 py-2.5 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
            mobileViewMode === 'edit' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          ✏️ Edit Content
        </button>
        <button
          onClick={() => setMobileViewMode('preview')}
          className={`flex-1 py-2.5 rounded-xl transition-colors min-h-[44px] cursor-pointer ${
            mobileViewMode === 'preview' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          👁️ Live Preview
        </button>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT SIDEBAR EDITOR CONTROLS ── */}
        <div className={`w-full md:w-[480px] lg:w-[520px] bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0 z-10 ${
          mobileViewMode === 'preview' ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Main Tabs */}
          <div className="flex bg-slate-900 border-b border-slate-800 p-2 gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setEditorTab('content')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[40px] whitespace-nowrap ${
                editorTab === 'content' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Content</span>
            </button>

            <button
              onClick={() => setEditorTab('colors')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[40px] whitespace-nowrap ${
                editorTab === 'colors' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <PaletteIcon className="w-3.5 h-3.5" />
              <span>Palette</span>
            </button>

            <button
              onClick={() => setEditorTab('design')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[40px] whitespace-nowrap ${
                editorTab === 'design' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Typography</span>
            </button>

            <button
              onClick={() => setEditorTab('ai')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[40px] whitespace-nowrap ${
                editorTab === 'ai' ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md' : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Optimizer</span>
            </button>
          </div>

          {/* Sub-Section Pills (for Content Tab) */}
          {editorTab === 'content' && (
            <div className="flex items-center gap-1.5 p-3 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar scroll-smooth">
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
                    contentSection === sec.id ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          )}

          {/* Content Inputs Section */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-white text-xs">
            
            {editorTab === 'content' && (
              <>
                {/* 1. Personal Info */}
                {contentSection === 'personal' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-black text-white border-b border-slate-800 pb-2">Personal & Contact Info</h3>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">Full Name</label>
                      <input
                        type="text"
                        value={data.fullName}
                        onChange={e => {
                          const nd = { ...data, fullName: e.target.value };
                          setData(nd);
                        }}
                        className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-white focus:border-emerald-500 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">Professional Title</label>
                      <input
                        type="text"
                        value={data.title}
                        onChange={e => setData({ ...data, title: e.target.value })}
                        className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-white focus:border-emerald-500 focus:outline-none min-h-[44px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block">Email</label>
                        <input
                          type="email"
                          value={data.email}
                          onChange={e => setData({ ...data, email: e.target.value })}
                          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block">Phone</label>
                        <input
                          type="text"
                          value={data.phone}
                          onChange={e => setData({ ...data, phone: e.target.value })}
                          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block">Location</label>
                        <input
                          type="text"
                          value={data.location}
                          onChange={e => setData({ ...data, location: e.target.value })}
                          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block">LinkedIn URL</label>
                        <input
                          type="text"
                          value={data.linkedin}
                          onChange={e => setData({ ...data, linkedin: e.target.value })}
                          className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">Executive Summary</label>
                      <textarea
                        value={data.summary}
                        onChange={e => setData({ ...data, summary: e.target.value })}
                        rows={4}
                        className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Photo Upload Option */}
                    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Profile Photo</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.showPhoto}
                            onChange={e => setData({ ...data, showPhoto: e.target.checked })}
                            className="rounded accent-emerald-600"
                          />
                          <span className="text-xs font-semibold text-slate-300">Show on Resume</span>
                        </label>
                      </div>

                      {data.showPhoto && (
                        <div className="flex items-center gap-3 pt-2">
                          {data.photoUrl ? (
                            <img src={data.photoUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-emerald-500" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                              <Camera className="w-6 h-6" />
                            </div>
                          )}

                          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs cursor-pointer border border-slate-700 transition-colors">
                            Upload Photo
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Experience Section */}
                {contentSection === 'experience' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-black text-white">Work Experience</h3>
                      <button
                        onClick={() => {
                          const newExp = [...(data.experience || []), { company: 'New Company', role: 'Role Title', dates: '2024 - Present', bullets: 'Add key responsibility or achievement bullet.' }];
                          const nd = { ...data, experience: newExp };
                          setData(nd);
                          pushHistoryState(nd);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Experience
                      </button>
                    </div>

                    {data.experience?.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative group">
                        <button
                          onClick={() => {
                            const newExp = data.experience.filter((_, i) => i !== idx);
                            const nd = { ...data, experience: newExp };
                            setData(nd);
                            pushHistoryState(nd);
                          }}
                          className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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
                            className="p-2 bg-slate-950 border border-slate-800 rounded-lg font-bold text-white"
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
                            className="p-2 bg-slate-950 border border-slate-800 rounded-lg font-bold text-emerald-400"
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
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
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
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Education Section */}
                {contentSection === 'education' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-black text-white">Education & Degrees</h3>
                      <button
                        onClick={() => {
                          const newEdu = [...(data.education || []), { degree: 'Degree Name', school: 'University Name', year: '2024' }];
                          const nd = { ...data, education: newEdu };
                          setData(nd);
                          pushHistoryState(nd);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Education
                      </button>
                    </div>

                    {data.education?.map((edu, idx) => (
                      <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative">
                        <button
                          onClick={() => {
                            const newEdu = data.education.filter((_, i) => i !== idx);
                            const nd = { ...data, education: newEdu };
                            setData(nd);
                            pushHistoryState(nd);
                          }}
                          className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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
                            className="p-2 bg-slate-950 border border-slate-800 rounded-lg font-bold text-white"
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
                            className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
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
                            className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
                          />
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={e => {
                              const copy = [...data.education];
                              copy[idx].gpa = e.target.value;
                              setData({ ...data, education: copy });
                            }}
                            placeholder="GPA / CGPA (Optional)"
                            className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Skills Section */}
                {contentSection === 'skills' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-sm font-black text-white border-b border-slate-800 pb-2">Technical & Soft Skills</h3>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">Skills (Comma separated list)</label>
                      <textarea
                        value={data.skills}
                        onChange={e => setData({ ...data, skills: e.target.value })}
                        rows={5}
                        placeholder="Python, React, TypeScript, Node.js, SQL, Machine Learning..."
                        className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-medium focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Projects Section */}
                {contentSection === 'projects' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-black text-white">Projects Showcase</h3>
                      <button
                        onClick={() => {
                          const newProj = [...(data.projects || []), { name: 'Project Name', description: 'Project overview and metrics.', tech: 'Technologies used' }];
                          const nd = { ...data, projects: newProj };
                          setData(nd);
                          pushHistoryState(nd);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Project
                      </button>
                    </div>

                    {data.projects?.map((proj, idx) => (
                      <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative">
                        <button
                          onClick={() => {
                            const newProj = data.projects.filter((_, i) => i !== idx);
                            const nd = { ...data, projects: newProj };
                            setData(nd);
                            pushHistoryState(nd);
                          }}
                          className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg font-bold text-white pr-10"
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
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
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
                          className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 6. Languages Section (Structured CRUD & Reordering) */}
                {contentSection === 'languages' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-black text-white">Languages & Proficiency</h3>
                      <button
                        onClick={() => {
                          const newList = [...languageList, { name: 'New Language', level: 'Intermediate' }];
                          updateLanguageData(newList);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Language
                      </button>
                    </div>

                    <div className="space-y-2">
                      {languageList.map((lang, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                          {/* Reorder Buttons */}
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
                              className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
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
                              className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
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
                            className="flex-1 p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold"
                          />

                          <select
                            value={lang.level}
                            onChange={e => {
                              const copy = [...languageList];
                              copy[idx].level = e.target.value;
                              updateLanguageData(copy);
                            }}
                            className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-bold text-xs"
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
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Custom Section */}
                {contentSection === 'custom' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">Certifications</label>
                      <textarea
                        value={data.certifications}
                        onChange={e => setData({ ...data, certifications: e.target.value })}
                        rows={3}
                        className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-bold block">Key Accomplishments</label>
                      <textarea
                        value={data.achievements}
                        onChange={e => setData({ ...data, achievements: e.target.value })}
                        rows={3}
                        className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Colors Palette Tab */}
            {editorTab === 'colors' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-white border-b border-slate-800 pb-2">Color Palettes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PALETTES.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setTheme({ ...theme, paletteId: p.id, palette: p })}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        theme.paletteId === p.id ? 'border-emerald-500 bg-slate-900 shadow-lg' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs text-white block mb-2">{p.name}</span>
                      <div className="flex h-5 rounded-lg overflow-hidden border border-slate-800">
                        <div style={{ backgroundColor: p.primary }} className="flex-1" />
                        <div style={{ backgroundColor: p.accent }} className="flex-1" />
                        <div style={{ backgroundColor: p.body }} className="flex-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Typography Tab */}
            {editorTab === 'design' && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-black text-white border-b border-slate-800 pb-2">Font Families</h3>
                <div className="space-y-2">
                  {FONTS.map(f => (
                    <div
                      key={f.id}
                      onClick={() => setTheme({ ...theme, fontId: f.id, font: f })}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        theme.fontId === f.id ? 'border-emerald-500 bg-slate-900' : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <span className="font-bold text-xs text-white block">{f.name}</span>
                      <span className="text-[10px] text-slate-400 block">{f.css}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant Tab */}
            {editorTab === 'ai' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-gradient-to-br from-teal-900/40 via-slate-900 to-emerald-900/40 rounded-2xl border border-teal-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                    <Sparkles className="w-5 h-5" />
                    <span>AI Resume Optimizer</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    Auto-tune your resume with AI keyword injection, active verbs, and executive phrasing.
                  </p>
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleAiAction('summary')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Optimize Executive Summary</span>
                    </button>
                    <button
                      onClick={() => handleAiAction('skills')}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Inject Top ATS Keywords</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT CANVAS LIVE PREVIEW AREA ── */}
        <div
          ref={previewContainerRef}
          className={`flex-1 bg-slate-950 p-4 sm:p-8 flex items-start justify-center overflow-auto relative ${
            mobileViewMode === 'edit' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Zoom scale wrapper */}
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              width: 794,
              minHeight: 1123
            }}
            className="transition-transform duration-200 shadow-2xl rounded-sm"
          >
            <div ref={canvasRef} className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl relative overflow-hidden">
              {renderCanvasTemplate()}
            </div>
          </div>
        </div>

      </div>

      {/* ── TEMPLATE SWITCHER MODAL INSIDE EDITOR ── */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-lg font-black text-slate-900">Switch Resume Template</h2>
                <p className="text-xs text-slate-500 font-semibold">Your resume content will be preserved 100%.</p>
              </div>
              <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-full">
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
                  <button className="mt-3 w-full py-1.5 bg-slate-100 group-hover:bg-emerald-600 text-slate-700 text-xs font-bold rounded-xl">
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
