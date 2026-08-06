import React, { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES } from '../../lib/templateData';
import type { TemplateDefinition } from '../../lib/resumeTypes';
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
import { PALETTES, FONTS, type ResumeData, type ThemeConfig } from '../../lib/resumeTypes';
import {
  Search, Sparkles, ShieldCheck, Eye, ArrowRight, X, ZoomIn, ZoomOut,
  Heart, Filter, SlidersHorizontal, RefreshCw, Grid, Check, Film
} from 'lucide-react';

const PREVIEW_SAMPLE_DATA: ResumeData = {
  fullName: 'Alex Vance',
  title: 'Senior AI & Software Engineer',
  email: 'alex.vance@example.com',
  phone: '+1 (555) 019-2834',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/alexvance',
  github: 'github.com/alexvance',
  summary: 'Senior AI Engineer with 6+ years of experience designing scalable LLM pipelines, RAG vector architectures, and high-performance FastAPI backends.',
  objective: 'To build high-throughput LLM platforms and enterprise vector search engines.',
  experience: [
    { company: 'NeuralTech AI', role: 'Lead AI Engineer', dates: '2022 - Present', location: 'San Francisco, CA', bullets: 'Architected enterprise RAG document retrieval engines using FAISS & Groq API, scaling query throughput by 300%.\nEngineered async FastAPI microservices handling 50k+ daily streaming requests.' },
    { company: 'DataFlow Systems', role: 'Software Engineer', dates: '2019 - 2022', location: 'San Jose, CA', bullets: 'Developed React & TypeScript dashboards for real-time model monitoring.\nOptimized SQL queries reducing analytics latency by 45%.' }
  ],
  education: [
    { degree: 'B.S. in Computer Science', school: 'UC Berkeley', year: '2019', gpa: '3.85' }
  ],
  projects: [
    { name: 'NovaResume AI', description: 'Enterprise AI Resume Builder with Canva-style graphic editor and single-page ATS vector PDF generator.', tech: 'React, TypeScript, Python' }
  ],
  skills: 'Python, FastAPI, Groq API, LangChain, PyTorch, React, TypeScript, PostgreSQL, Docker, Git, REST APIs',
  certifications: 'AWS Certified Machine Learning Specialist, TensorFlow Developer Certificate',
  languages: 'English (Native), Spanish (Professional)',
  achievements: 'Winner of Global AI Innovation Hackathon (1st place out of 400 teams)\nPublished research paper on Context Window Compression in LLMs',
  customSections: [
    { title: 'Publications & Research', content: 'Co-authored paper: "Optimizing Context Retrieval Overhead in Agentic Workflows" (2025)' }
  ]
};

const QUICK_CATEGORY_CHIPS = [
  { id: 'All', label: 'All Templates' },
  { id: 'Modern', label: '✨ Modern' },
  { id: 'ATS Professional', label: '🛡️ ATS Safe' },
  { id: 'Student', label: '🎓 Student' },
  { id: 'Executive', label: '💼 Executive' },
  { id: 'Software Engineer', label: '💻 Software' },
  { id: 'AI Engineer', label: '🤖 AI & ML' },
  { id: 'Corporate', label: '🏢 Corporate' },
  { id: 'Creative', label: '🎨 Creative' },
  { id: 'Minimal', label: '🌿 Minimal' },
  { id: 'Finance', label: '📈 Finance' },
  { id: 'Marketing', label: '🚀 Marketing' }
] as const;

const TemplateRenderer: React.FC<{ template: TemplateDefinition }> = memo(({ template }) => {
  const palette = PALETTES.find(p => p.id === template.defaultPaletteId) || PALETTES[0];
  const font = FONTS.find(f => f.id === template.defaultFontId) || FONTS[0];

  const theme: ThemeConfig = {
    paletteId: palette.id,
    palette,
    fontId: font.id,
    font,
    fontSize: 11,
    lineHeight: 1.5,
    sectionSpacing: 14,
    sidebarWidth: 32,
    layout: template.layout
  };

  switch (template.rendererFamily) {
    case 'ExecutiveHeader': return <ExecutiveHeaderTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'AtsClassic': return <AtsClassicTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'MinimalLine': return <MinimalLineTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'SoftwareEng': return <SoftwareEngTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'StudentFresher': return <StudentFresherTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'Corporate': return <CorporateTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'CreativeCard': return <CreativeCardTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'Startup': return <StartupTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'Elegant': return <ElegantTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
    case 'ModernSidebar':
    default: return <ModernSidebarTemplate data={PREVIEW_SAMPLE_DATA} theme={theme} />;
  }
});

/** 60FPS Pure CSS GPU-Accelerated Centered Thumbnail Component */
const ResumeThumbnailPreview: React.FC<{ template: TemplateDefinition; height?: number; onClick?: () => void }> = memo(({ template, height = 300, onClick }) => {
  const scale = height <= 220 ? 0.20 : 0.255;

  return (
    <div
      onClick={onClick}
      className="w-full bg-slate-100/80 flex items-center justify-center overflow-hidden relative p-1.5 cursor-pointer gpu-accelerated select-none"
      style={{ height: `${height}px` }}
    >
      <div
        className="bg-white shadow-md rounded-sm overflow-hidden flex-shrink-0 pointer-events-none gpu-accelerated"
        style={{
          width: '794px',
          height: '1123px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <TemplateRenderer template={template} />
      </div>
    </div>
  );
});

interface Props {
  onSelectTemplate: (template: TemplateDefinition) => void;
}

export const TemplateGalleryPage: React.FC<Props> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutFilter, setLayoutFilter] = useState<'all' | 'one_col' | 'two_col'>('all');
  const [atsFilter, setAtsFilter] = useState<'all' | '98' | '100'>('all');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Favorites Local State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('fav_templates') || '[]');
    } catch {
      return [];
    }
  });

  // Modal State
  const [previewModalTemplate, setPreviewModalTemplate] = useState<TemplateDefinition | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [modalZoom, setModalZoom] = useState(0.70);
  const previewModalRef = useRef<HTMLDivElement>(null);

  // Virtualized Incremental Pagination State
  const [visibleCount, setVisibleCount] = useState(16);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = (id: string, e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('fav_templates', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  // Filter Logic
  const filteredTemplates = ALL_TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'All' || 
                            t.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                            (selectedCategory === 'ATS Professional' && t.atsScore >= 98);

    const matchesSearch = searchQuery === '' || 
                          t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLayout = layoutFilter === 'all' || 
                          (layoutFilter === 'one_col' && t.layout === 'one_col') ||
                          (layoutFilter === 'two_col' && t.layout !== 'one_col');

    const matchesAts = atsFilter === 'all' ||
                       (atsFilter === '98' && t.atsScore >= 98) ||
                       (atsFilter === '100' && t.atsScore === 100);

    const matchesColor = !selectedColor || t.defaultPaletteId === selectedColor;

    const matchesFav = !showFavoritesOnly || favorites.includes(t.id);

    return matchesCategory && matchesSearch && matchesLayout && matchesAts && matchesColor && matchesFav;
  });

  // Infinite Scroll Handler inside Right Grid Container
  const handleGridScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 300) {
      setVisibleCount(prev => Math.min(prev + 12, filteredTemplates.length));
    }
  };

  // Reset pagination count on filter change
  useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategory, searchQuery, layoutFilter, atsFilter, selectedColor, showFavoritesOnly]);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setLayoutFilter('all');
    setAtsFilter('all');
    setSelectedColor(null);
    setShowFavoritesOnly(false);
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden animate-fade-in">
      
      {/* ── MAIN TWO-PANEL MARKETPLACE LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT FIXED FILTER SIDEBAR (DESKTOP) ── */}
        <aside className="hidden lg:flex w-72 flex-shrink-0 bg-white border-r border-slate-200 flex-col h-full overflow-y-auto p-5 space-y-6 z-10 shadow-sm">
          
          {/* Marketplace Title & Favorite Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-700 flex items-center justify-center text-white font-extrabold shadow-sm">
                <Grid className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-black text-sm text-slate-900 tracking-wide">Template Hub</h2>
                <p className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase">{ALL_TEMPLATES.length} Designs Live</p>
              </div>
            </div>

            {/* Reset Button */}
            {(selectedCategory !== 'All' || searchQuery || layoutFilter !== 'all' || atsFilter !== 'all' || selectedColor || showFavoritesOnly) && (
              <button
                onClick={resetAllFilters}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                title="Reset All Filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, tags..."
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Favorites & Popular Shortcuts */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">Quick Filters</span>
            
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                showFavoritesOnly ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span>My Saved Favorites</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-white text-[10px] border border-slate-200 font-extrabold">{favorites.length}</span>
            </button>
          </div>

          {/* Categories List with Item Counts */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">Categories</span>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {TEMPLATE_CATEGORIES.map(cat => {
                const count = cat === 'All' 
                  ? ALL_TEMPLATES.length 
                  : ALL_TEMPLATES.filter(t => t.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedCategory === cat ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Swatch Filters */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Color Theme</span>
              {selectedColor && (
                <button onClick={() => setSelectedColor(null)} className="text-[10px] text-emerald-600 font-bold">Clear</button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedColor(selectedColor === p.id ? null : p.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform active:scale-95 ${
                    selectedColor === p.id ? 'border-emerald-600 ring-2 ring-emerald-300 scale-110 shadow-sm' : 'border-white shadow-xs hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.primary }}
                  title={p.name}
                >
                  {selectedColor === p.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* ATS Compliance Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">ATS Parser Score</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: '98', label: '98%+' },
                { id: '100', label: '100% Safe' }
              ].map(ats => (
                <button
                  key={ats.id}
                  onClick={() => setAtsFilter(ats.id as any)}
                  className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                    atsFilter === ats.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {ats.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Layout Structure Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">Column Structure</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'one_col', label: '1-Column' },
                { id: 'two_col', label: '2-Column' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setLayoutFilter(l.id as any)}
                  className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                    layoutFilter === l.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cinematic Platform Video Showcase Card */}
          <div
            onClick={() => setShowVideoModal(true)}
            className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950 group cursor-pointer"
          >
            <video
              src="/promo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-24 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end justify-between p-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shadow-md">
                  <Film className="w-3 h-3 text-white" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider block font-mono">Platform Showcase</span>
                  <h4 className="text-[11px] font-extrabold text-white">NovaResume AI Video</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tip Box */}
          <div className="p-3 bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Vector A4 PDF</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
              Every template exports in single-page crisp vector resolution with zero text distortion.
            </p>
          </div>
        </aside>

        {/* ── RIGHT MAIN MARKETPLACE GRID CONTAINER (ONLY THIS AREA SCROLLS) ── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">

          {/* TOP FIXED MARKETPLACE BAR */}
          <div className="bg-white border-b border-slate-200 p-3 sm:p-4 flex flex-col gap-3 flex-shrink-0 shadow-xs z-10">
            
            {/* Upper Bar: Title & Mobile Filter Toggle Button */}
            <div className="flex items-center justify-between gap-2">
              
              {/* Quick Category Chips Carousel */}
              <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-2 py-0.5">
                {QUICK_CATEGORY_CHIPS.map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => setSelectedCategory(chip.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedCategory === chip.id
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Mobile Filter Sheet Trigger */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 flex-shrink-0 min-h-[40px]"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Filters</span>
                {(selectedCategory !== 'All' || searchQuery || selectedColor || showFavoritesOnly) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </button>
            </div>

            {/* Results Count & Search Bar on Mobile */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <div className="flex items-center gap-2">
                <span>Showing <strong className="text-slate-900">{filteredTemplates.length}</strong> templates</span>
                {showFavoritesOnly && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px]">Favorites Only</span>}
                {selectedColor && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">Filtered by Color</span>}
              </div>

              <div className="hidden sm:flex items-center gap-3 text-[11px]">
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition-transform active:scale-95 border border-slate-700"
                >
                  <Film className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Watch Demo Video</span>
                </button>
                <div className="flex items-center gap-1 text-emerald-700 font-extrabold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant A4 Canvas</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SCROLLABLE TEMPLATE CARDS GRID ── */}
          <div
            ref={scrollContainerRef}
            onScroll={handleGridScroll}
            className="flex-1 overflow-y-auto p-3 sm:p-6 smooth-scroll-container"
          >
            {filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">No matching templates found</h3>
                  <p className="text-slate-500 font-medium text-xs mt-1">Try clearing your filters or searching for different keywords.</p>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 pb-20">
                {filteredTemplates.slice(0, visibleCount).map((t) => {
                  const palette = PALETTES.find(p => p.id === t.defaultPaletteId) || PALETTES[0];
                  const isFav = favorites.includes(t.id);

                  return (
                    <div
                      key={t.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 overflow-hidden flex flex-col group relative gpu-accelerated"
                    >
                      {/* ATS & Favorite Badge Overlay */}
                      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-center pointer-events-none">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/95 text-emerald-800 shadow-md border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                          <span>{t.atsScore}% ATS</span>
                        </span>

                        {/* Favorite Button (High Z-Index & 40px Touch Target) */}
                        <button
                          onClick={(e) => toggleFavorite(t.id, e)}
                          onTouchEnd={(e) => toggleFavorite(t.id, e)}
                          className="z-30 relative pointer-events-auto p-2 min-w-[40px] min-h-[40px] rounded-full bg-white/95 hover:bg-white text-slate-700 shadow-md border border-slate-200/90 flex items-center justify-center transition-transform active:scale-90 touch-manipulation cursor-pointer"
                          title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                          aria-label="Toggle Favorite"
                        >
                          <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
                        </button>
                      </div>

                      {/* Centered Live A4 Thumbnail Preview Container */}
                      <div className="h-[170px] sm:h-[260px] md:h-[290px] w-full overflow-hidden bg-slate-100 relative flex items-center justify-center group-hover:bg-slate-200/60 transition-colors">
                        <ResumeThumbnailPreview
                          template={t}
                          height={260}
                          onClick={() => { setPreviewModalTemplate(t); setModalZoom(0.70); }}
                        />

                        {/* Hover Overlay Action Bar (Desktop & Mobile Touch) */}
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModalTemplate(t);
                              setModalZoom(0.70);
                            }}
                            className="px-3 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition-transform active:scale-95 flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTemplate(t);
                            }}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
                          >
                            <span>Use</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Card Information Footer */}
                      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-600 truncate transition-colors">
                              {t.name}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={(e) => toggleFavorite(t.id, e)}
                                onTouchEnd={(e) => toggleFavorite(t.id, e)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors z-20 min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer touch-manipulation"
                                title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
                              </button>
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs flex-shrink-0"
                                style={{ backgroundColor: palette.primary }}
                                title={`Color theme: ${palette.name}`}
                              />
                            </div>
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 font-medium">{t.description}</p>
                        </div>

                        {/* Action Buttons Row — stacks on xs, side-by-side on sm+ */}
                        <div className="flex flex-col xs:flex-row items-stretch gap-1.5 pt-2 border-t border-slate-100/80">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewModalTemplate(t);
                              setModalZoom(0.70);
                            }}
                            className="flex-1 px-2 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-extrabold text-[11px] transition-colors flex items-center justify-center gap-1 min-h-[38px]"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTemplate(t);
                            }}
                            className="flex-1 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95 min-h-[38px]"
                          >
                            <span>Use</span>
                            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM SHEET FILTER PANEL ── */}
      {isMobileFilterOpen && (
        <div
          onClick={() => setIsMobileFilterOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 lg:hidden flex justify-end flex-col animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl border-t border-slate-200 animate-slideUp"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h3 className="font-black text-base text-slate-900">Filter Templates</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories Grid */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">Category</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {TEMPLATE_CATEGORIES.map(cat => (
                  <button
                    key={`mob-${cat}`}
                    onClick={() => { setSelectedCategory(cat); setIsMobileFilterOpen(false); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left truncate transition-colors ${
                      selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Palette Filter */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400">Color Palette</label>
              <div className="flex flex-wrap gap-2">
                {PALETTES.map(p => (
                  <button
                    key={`mob-pal-${p.id}`}
                    onClick={() => { setSelectedColor(selectedColor === p.id ? null : p.id); }}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${
                      selectedColor === p.id ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: p.primary }}
                  >
                    {selectedColor === p.id && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { resetAllFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-xs text-slate-700"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 font-bold text-xs text-white shadow-md"
              >
                Apply Filters ({filteredTemplates.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FULL-SCREEN HIGH-RES PREVIEW MODAL (PORTALED TO BODY) ── */}
      {previewModalTemplate && createPortal(
        <div
          onClick={() => setPreviewModalTemplate(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-6 animate-scale-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-200"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap justify-between items-center bg-slate-50 gap-2 flex-shrink-0">
              <div>
                <h3 className="font-black text-base text-slate-900">{previewModalTemplate.name}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{previewModalTemplate.category} Layout · {previewModalTemplate.atsScore}% ATS Compatible</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
                  <button
                    onClick={() => setModalZoom(z => Math.max(z - 0.1, 0.4))}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-2 font-mono">
                    {Math.round(modalZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setModalZoom(z => Math.min(z + 0.1, 1.3))}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    onSelectTemplate(previewModalTemplate);
                    setPreviewModalTemplate(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPreviewModalTemplate(null)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-slate-950 p-6 flex justify-center items-start">
              <div
                className="transform origin-top shadow-2xl rounded-sm overflow-hidden flex-shrink-0 transition-transform duration-150"
                style={{
                  width: `${794 * modalZoom}px`,
                  minHeight: `${1123 * modalZoom}px`,
                }}
              >
                <div ref={previewModalRef} style={{ width: 794, minHeight: 1123, margin: 0, padding: 0, backgroundColor: '#ffffff' }}>
                  <TemplateRenderer template={previewModalTemplate} />
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── FULL-SCREEN CINEMA VIDEO PLAYER MODAL ── */}
      {showVideoModal && createPortal(
        <div
          onClick={() => setShowVideoModal(false)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-6 animate-scale-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 relative flex flex-col"
          >
            {/* Modal Topbar */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-2 text-white">
                <Film className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">NovaResume AI Platform Overview</h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src="/promo.mp4"
                autoPlay
                muted
                playsInline
                loop
                className="w-full h-full object-contain pointer-events-none"
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Developer Branding Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-3 px-6 text-center flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>NovaResume AI Platform</span>
          </div>
          <div>
            Designed & Engineered by <span className="text-emerald-400 font-extrabold">VED DHOBI</span> (<a href="mailto:veddhobi252@gmail.com" className="hover:underline">veddhobi252@gmail.com</a>)
          </div>
        </div>
      </footer>
    </div>
  );
};
