import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
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
  Search, ShieldCheck, Eye, ArrowRight, X, ZoomIn, ZoomOut,
  Heart, Filter, SlidersHorizontal, RefreshCw, Grid, Check, Film,
  ChevronLeft, ChevronRight, Star, LayoutGrid, Layers
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
  { id: 'Favorites', label: 'Saved' },
  { id: 'Modern', label: 'Modern' },
  { id: 'ATS Professional', label: 'ATS Optimized' },
  { id: 'Software Engineer', label: 'Engineering' },
  { id: 'AI Engineer', label: 'AI & Data' },
  { id: 'Student', label: 'Entry Level' },
  { id: 'Executive', label: 'Executive' },
  { id: 'Corporate', label: 'Corporate' },
  { id: 'Creative', label: 'Creative' },
  { id: 'Minimal', label: 'Minimal' },
  { id: 'Finance', label: 'Finance' },
  { id: 'Marketing', label: 'Marketing' }
] as const;

// Helper: Smart Badges Generator
const getSmartBadges = (t: TemplateDefinition) => {
  const badges: { label: string; bg: string; text: string; border: string }[] = [];
  if (t.isPopular) {
    badges.push({ label: 'Popular', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' });
  }
  if (t.isNew) {
    badges.push({ label: 'New', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' });
  }
  if (t.atsScore >= 99) {
    badges.push({ label: `${t.atsScore}% ATS Match`, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' });
  }
  if (badges.length === 0) {
    badges.push({ label: t.category, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' });
  }
  return badges;
};

// Helper: Downloads Count Generator
const getDownloadsCount = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 9000;
  }
  const count = (12400 + hash).toLocaleString();
  return `${count} downloads`;
};

// Helper: Suitable For Tag Generator
const getSuitableFor = (t: TemplateDefinition) => {
  if (t.tags && t.tags.length > 0) {
    const mainTags = t.tags.slice(0, 3).map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).join(', ');
    return `Suitable for ${mainTags}`;
  }
  return `Suitable for ${t.category} professionals`;
};

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

/** 60FPS Pure CSS GPU-Accelerated Dynamic Centered Thumbnail Component */
const ResumeThumbnailPreview: React.FC<{ template: TemplateDefinition; onClick?: () => void }> = memo(({ template, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const availableW = containerRef.current.clientWidth - 8;
        const availableH = containerRef.current.clientHeight - 8;
        const fitW = availableW / 794;
        const fitH = availableH > 100 ? availableH / 1123 : fitW;
        setScale(Math.min(fitW, fitH));
      }
    };
    updateScale();
    const timer = setTimeout(updateScale, 50);
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="w-full h-full min-h-[120px] bg-slate-100/90 flex items-center justify-center overflow-hidden relative p-1 cursor-pointer select-none"
    >
      <div
        className="bg-white shadow-md rounded-sm overflow-hidden flex-shrink-0 pointer-events-none"
        style={{
          width: `${794 * scale}px`,
          height: `${1123 * scale}px`,
        }}
      >
        <div
          style={{
            width: 794,
            minHeight: 1123,
            margin: 0,
            padding: 0,
            backgroundColor: '#ffffff',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <TemplateRenderer template={template} />
        </div>
      </div>
    </div>
  );
});

interface Props {
  onSelectTemplate: (template: TemplateDefinition) => void;
}

export const TemplateGalleryPage: React.FC<Props> = ({ onSelectTemplate }) => {
  // View Mode Switcher State: 'grid' | 'coverflow' (Default to crisp enterprise Grid view)
  const [viewMode, setViewMode] = useState<'coverflow' | 'grid'>('grid');

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutFilter, setLayoutFilter] = useState<'all' | 'one_col' | 'two_col'>('all');
  const [atsFilter, setAtsFilter] = useState<'all' | '98' | '100'>('all');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Active Cover Flow Index State
  const [activeIndex, setActiveIndex] = useState(0);

  // Infinite Scroll Pagination State for Normal Grid View
  const [visibleCount, setVisibleCount] = useState(16);
  const gridScrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-calculate modal zoom to fit mobile screens perfectly without clipping
  useEffect(() => {
    if (previewModalTemplate) {
      const padding = window.innerWidth <= 640 ? 32 : 64;
      const fit = Math.min(0.95, (window.innerWidth - padding) / 794);
      setModalZoom(Math.max(0.32, fit));
    }
  }, [previewModalTemplate]);

  const [favToast, setFavToast] = useState<string | null>(null);

  const toggleFavorite = (id: string, e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
      if ('preventDefault' in e) e.preventDefault();
    }
    setFavorites(prev => {
      const isAlreadyFav = prev.includes(id);
      const next = isAlreadyFav ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('fav_templates', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      const t = ALL_TEMPLATES.find(x => x.id === id);
      setFavToast(isAlreadyFav ? `Removed "${t?.name || 'Template'}" from Favorites` : `Saved "${t?.name || 'Template'}" to Favorites`);
      setTimeout(() => setFavToast(null), 2500);
      return next;
    });
  };

  // Filter Logic
  const filteredTemplates = ALL_TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'All' ? true :
                            selectedCategory === 'Favorites' ? favorites.includes(t.id) :
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

    const matchesFav = (!showFavoritesOnly && selectedCategory !== 'Favorites') || favorites.includes(t.id);

    return matchesCategory && matchesSearch && matchesLayout && matchesAts && matchesColor && matchesFav;
  });

  // Ensure activeIndex stays within bounds whenever filteredTemplates changes (e.g. favorite toggle)
  useEffect(() => {
    if (filteredTemplates.length > 0) {
      setActiveIndex(prev => Math.min(prev, filteredTemplates.length - 1));
    } else {
      setActiveIndex(0);
    }
  }, [filteredTemplates.length]);

  // Reset CoverFlow activeIndex and Grid visibleCount on filter change
  useEffect(() => {
    setActiveIndex(0);
    setVisibleCount(16);
  }, [selectedCategory, searchQuery, layoutFilter, atsFilter, selectedColor, showFavoritesOnly]);

  // Force grid view on mobile screens (< 640px) — mobile uses old normal scroll
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setViewMode('grid');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setLayoutFilter('all');
    setAtsFilter('all');
    setSelectedColor(null);
    setShowFavoritesOnly(false);
    setActiveIndex(0);
    setVisibleCount(16);
  };

  // CoverFlow Navigation Helpers
  const handlePrev = useCallback(() => {
    setActiveIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex(prev => Math.min(filteredTemplates.length - 1, prev + 1));
  }, [filteredTemplates.length]);

  // Keyboard Arrow Navigation Listener for CoverFlow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'coverflow' || document.activeElement?.tagName === 'INPUT' || previewModalTemplate) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, handlePrev, handleNext, previewModalTemplate]);

  // Touch Swipe & Drag Handlers for Mobile & Desktop CoverFlow
  const touchStartXRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartXRef.current = clientX;
    isDraggingRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current || touchStartXRef.current === null) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diffX = clientX - touchStartXRef.current;
    
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    isDraggingRef.current = false;
  };

  // Mouse Wheel Handler for CoverFlow Stage
  const lastWheelTimeRef = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== 'coverflow') return;
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 250) return;
    
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 20) {
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      lastWheelTimeRef.current = now;
    }
  };

  // Infinite Scroll & Mobile Navbar Scroll Event Handler
  const handleGridScroll = () => {
    if (!gridScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = gridScrollContainerRef.current;
    window.dispatchEvent(new CustomEvent('nova_mobile_scroll', { detail: scrollTop }));
    if (viewMode === 'grid' && scrollTop + clientHeight >= scrollHeight - 300) {
      setVisibleCount(prev => Math.min(prev + 12, filteredTemplates.length));
    }
  };

  const activeTemplate = filteredTemplates[activeIndex] || filteredTemplates[0];

  return (
    <div className="h-[calc(100dvh-44px)] md:h-[calc(100vh-64px)] w-full glass-canvas text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden animate-fade-in">
      
      {/* ── MAIN TWO-PANEL COVER FLOW / GRID LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT FIXED FILTER SIDEBAR (DESKTOP) ── */}
        <aside className="hidden lg:flex w-72 flex-shrink-0 glass-sidebar flex-col h-full overflow-y-auto p-5 space-y-5 z-20">
          
          {/* Marketplace Title & Favorite Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 dark:from-indigo-600 dark:to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Grid className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Template Directory</h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">{ALL_TEMPLATES.length} Designs Available</p>
              </div>
            </div>

            {/* Reset Button */}
            {(selectedCategory !== 'All' || searchQuery || layoutFilter !== 'all' || atsFilter !== 'all' || selectedColor || showFavoritesOnly) && (
              <button
                onClick={resetAllFilters}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset All Filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates, roles, skills..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-lg bg-slate-50 dark:bg-[#0b101c] border border-slate-200 dark:border-[#1a2336] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#0e1422] focus:border-slate-400 dark:focus:border-[#4f46e5] transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Favorites & Popular Shortcuts */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">Saved</span>
            
            <button
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setSelectedCategory(showFavoritesOnly ? 'All' : 'Favorites');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                showFavoritesOnly || selectedCategory === 'Favorites' ? 'bg-slate-900 dark:bg-[#4f46e5] text-white shadow-2xs' : 'bg-white dark:bg-[#0e1422] hover:bg-slate-50 dark:hover:bg-[#141d30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1a2336]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly || selectedCategory === 'Favorites' ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span>Saved Templates</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${showFavoritesOnly || selectedCategory === 'Favorites' ? 'bg-slate-800 dark:bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-[#161c2e] text-slate-600 dark:text-slate-400'}`}>
                {favorites.length}
              </span>
            </button>
          </div>

          {/* Categories List with Item Counts */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">Industry Categories</span>
            <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {TEMPLATE_CATEGORIES.map(cat => {
                const count = cat === 'All' 
                  ? ALL_TEMPLATES.length 
                  : (cat as string) === 'Favorites'
                  ? favorites.length
                  : ALL_TEMPLATES.filter(t => t.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      if ((cat as string) === 'Favorites') setShowFavoritesOnly(true);
                      else setShowFavoritesOnly(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 dark:bg-[#4f46e5] text-white font-semibold shadow-2xs'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#141d30] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${selectedCategory === cat ? 'bg-slate-800 dark:bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-[#161c2e] text-slate-600 dark:text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Swatch Filters */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1a2336]">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Color Palette</span>
              {selectedColor && (
                <button onClick={() => setSelectedColor(null)} className="text-[10px] text-blue-600 dark:text-[#38bdf8] font-semibold cursor-pointer">Clear</button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedColor(selectedColor === p.id ? null : p.id)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                    selectedColor === p.id ? 'border-slate-900 dark:border-white ring-2 ring-slate-400 dark:ring-indigo-400 scale-105' : 'border-slate-200 dark:border-[#1a2336] hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: p.primary }}
                  title={p.name}
                >
                  {selectedColor === p.id && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* ATS Compliance Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1a2336]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">ATS Parser Compatibility</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: '98', label: '≥ 98%' },
                { id: '100', label: '100% Strict' }
              ].map(ats => (
                <button
                  key={ats.id}
                  onClick={() => setAtsFilter(ats.id as any)}
                  className={`py-1.5 rounded-lg text-[10px] font-semibold border transition-all text-center cursor-pointer ${
                    atsFilter === ats.id
                      ? 'bg-slate-900 dark:bg-[#4f46e5] text-white border-slate-900 dark:border-[#4f46e5] shadow-2xs'
                      : 'bg-white dark:bg-[#0e1422] border-slate-200 dark:border-[#1a2336] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#141d30]'
                  }`}
                >
                  {ats.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── RIGHT MAIN MARKETPLACE DISPLAY ── */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">

          {/* TOP FIXED MARKETPLACE BAR WITH VIEW MODE SWITCHER */}
          <div className="glass-header px-3 pt-2.5 pb-2 sm:p-4 flex flex-col gap-2 flex-shrink-0 z-20 shadow-2xs">
            
            {/* Row 1 on mobile: Category Chips (full width, scrollable) */}
            <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2 py-0.5">
              {QUICK_CATEGORY_CHIPS.map(chip => (
                <button
                  key={chip.id}
                  onClick={() => {
                    setSelectedCategory(chip.id);
                    if (chip.id === 'Favorites') setShowFavoritesOnly(true);
                    else setShowFavoritesOnly(false);
                  }}
                  className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                    selectedCategory === chip.id
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Row 2: View Switcher (left) + Filter Button (right) */}
            <div className="flex items-center justify-between gap-2">

              {/* View Mode Toggle Switcher — hidden on mobile (mobile always uses grid) */}
              <div className="hidden sm:flex items-center bg-slate-100 dark:bg-[#0e1422] p-0.5 rounded-lg border border-slate-200 dark:border-[#1a2336] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#4f46e5] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid View</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setViewMode('coverflow')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'coverflow'
                      ? 'bg-white dark:bg-[#4f46e5] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Preview Carousel"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Carousel</span>
                </button>
              </div>

              {/* Results count */}
              <span className="text-[11px] sm:text-xs font-medium text-slate-500 flex-1 text-center">
                <strong className="text-slate-900 font-bold">{filteredTemplates.length}</strong> Templates Available
                {showFavoritesOnly && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] border border-rose-200">Saved</span>}
              </span>

              {/* Mobile Filter Sheet Trigger */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] rounded-lg border border-slate-200 flex-shrink-0 min-h-[34px] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                <span>Filter</span>
                {(selectedCategory !== 'All' || searchQuery || selectedColor || showFavoritesOnly) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            </div>
          </div>

          {/* ── CONDITIONAL RENDERING: 3D COVER FLOW VS NORMAL GRID VIEW ── */}
          {viewMode === 'coverflow' ? (
            
            /* ── 3D COVER FLOW VIEW ── */
            <div className="flex-1 flex flex-col justify-between overflow-hidden relative p-2 sm:p-6">
              
              {filteredTemplates.length === 0 ? (
                <div className="bg-slate-900 rounded-xl p-8 sm:p-12 border border-slate-800 text-center space-y-4 max-w-md mx-auto my-auto shadow-xl">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-300">
                    {selectedCategory === 'Favorites' ? <Heart className="w-5 h-5 text-rose-500 fill-current" /> : <Search className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {selectedCategory === 'Favorites' ? 'No Saved Favorites Yet' : 'No matching templates found'}
                    </h3>
                    <p className="text-slate-400 font-medium text-xs mt-1 leading-relaxed">
                      {selectedCategory === 'Favorites'
                        ? 'Click the heart icon on any template card to save it to your favorites.'
                        : 'Try clearing your filters or searching for different keywords.'}
                    </p>
                  </div>
                  <button
                    onClick={resetAllFilters}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition-transform active:scale-95 cursor-pointer"
                  >
                    {selectedCategory === 'Favorites' ? 'Browse All Templates' : 'Reset All Filters'}
                  </button>
                </div>
              ) : (
                <>
                  {/* 3D COVER FLOW STAGE */}
                  <div
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleTouchStart}
                    onMouseUp={handleTouchEnd}
                    className="relative w-full flex-1 flex items-center justify-center perspective-1000 select-none py-1 overflow-hidden"
                  >
                    {/* Floating Prev Button */}
                    <button
                      onClick={handlePrev}
                      disabled={activeIndex === 0}
                      className="absolute left-1 sm:left-6 z-40 p-2.5 sm:p-4 rounded-full bg-slate-900/90 hover:bg-emerald-600 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      aria-label="Previous Template"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>

                    {/* Floating Next Button */}
                    <button
                      onClick={handleNext}
                      disabled={activeIndex === filteredTemplates.length - 1}
                      className="absolute right-1 sm:right-6 z-40 p-2.5 sm:p-4 rounded-full bg-slate-900/90 hover:bg-emerald-600 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all duration-200 active:scale-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      aria-label="Next Template"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>

                    {/* CAROUSEL CARDS STACK */}
                    <div className="relative w-full max-w-4xl h-[180px] sm:h-[295px] flex items-center justify-center preserve-3d">
                      {filteredTemplates.map((t, idx) => {
                        const offset = idx - activeIndex;
                        // Performance & click accuracy: only render visible range (-2 to +2)
                        if (Math.abs(offset) > 2) return null;

                        const isCentered = offset === 0;
                        const palette = PALETTES.find(p => p.id === t.defaultPaletteId) || PALETTES[0];
                        const isFav = favorites.includes(t.id);

                        // Calculate 3D transformation values based on offset distance & screen width
                        let translateX = '0px';
                        let scale = 1;
                        let rotateY = '0deg';
                        let opacity = 1;
                        let zIndex = 30;

                        if (offset === 0) {
                          translateX = '0px';
                          scale = 1.0;
                          rotateY = '0deg';
                          opacity = 1;
                          zIndex = 30;
                        } else if (offset === -1) {
                          translateX = window.innerWidth <= 640 ? '-60px' : '-200px';
                          scale = window.innerWidth <= 640 ? 0.78 : 0.84;
                          rotateY = '20deg';
                          opacity = window.innerWidth <= 640 ? 0.6 : 0.75;
                          zIndex = 20;
                        } else if (offset === 1) {
                          translateX = window.innerWidth <= 640 ? '60px' : '200px';
                          scale = window.innerWidth <= 640 ? 0.78 : 0.84;
                          rotateY = '-20deg';
                          opacity = window.innerWidth <= 640 ? 0.6 : 0.75;
                          zIndex = 20;
                        } else if (offset === -2) {
                          translateX = window.innerWidth <= 640 ? '-115px' : '-360px';
                          scale = 0.65;
                          rotateY = '35deg';
                          opacity = window.innerWidth <= 640 ? 0 : 0.4;
                          zIndex = 10;
                        } else if (offset === 2) {
                          translateX = window.innerWidth <= 640 ? '115px' : '360px';
                          scale = 0.65;
                          rotateY = '-35deg';
                          opacity = window.innerWidth <= 640 ? 0 : 0.4;
                          zIndex = 10;
                        }

                        return (
                          <div
                            key={t.id}
                            onClick={() => setActiveIndex(idx)}
                            className={`absolute w-[130px] sm:w-[215px] h-[175px] sm:h-[285px] rounded-2xl bg-white text-slate-900 border border-slate-200 overflow-hidden flex flex-col shadow-xl transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-pointer group gpu-accelerated ${
                              isCentered ? 'ring-4 ring-emerald-500/60 animate-active-card' : 'hover:opacity-90'
                            }`}
                            style={{
                              transform: `translateX(${translateX}) scale(${scale}) rotateY(${rotateY})`,
                              opacity,
                              zIndex,
                            }}
                          >
                            {/* Top Badges */}
                            <div className="absolute top-2 left-2 right-2 z-40 flex justify-between items-center pointer-events-none">
                              <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-slate-900/90 text-emerald-400 shadow-md border border-slate-700 flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                                <span>{t.atsScore}% ATS</span>
                              </span>

                              {isCentered && (
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavorite(t.id, e)}
                                  className="pointer-events-auto p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-lg flex items-center justify-center transition-transform active:scale-90 cursor-pointer min-w-[28px] min-h-[28px]"
                                  title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
                                </button>
                              )}
                            </div>

                            {/* Thumbnail Live Render */}
                            <div className="flex-1 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                              <ResumeThumbnailPreview
                                template={t}
                              />
                            </div>

                            {/* Minimal Header on Card */}
                            <div className="p-2 sm:p-3 bg-white border-t border-slate-100 flex items-center justify-between">
                              <div className="truncate pr-1">
                                <h4 className="font-black text-[11px] sm:text-xs text-slate-900 truncate">{t.name}</h4>
                                <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold truncate">{t.category}</p>
                              </div>
                              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-slate-300 flex-shrink-0" style={{ backgroundColor: palette.primary }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── ACTIVE TEMPLATE INFORMATION & ACTION PANEL (BOTTOM) ── */}
                  {activeTemplate && (
                    <div className="glass-modal rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 z-20 transition-all duration-300">
                      
                      {/* Template Meta Details */}
                      <div className="space-y-1.5 text-center md:text-left flex-1 w-full">
                        
                        {/* Name & Rating */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <h3 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            {activeTemplate.name}
                          </h3>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                            ))}
                            <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">5.0</span>
                          </div>
                        </div>

                        {/* Smart Badges */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                          {getSmartBadges(activeTemplate).map((b, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold border ${b.bg} ${b.text} ${b.border}`}>
                              {b.label}
                            </span>
                          ))}
                          <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            ATS Score: {activeTemplate.atsScore}%
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            Downloads: {getDownloadsCount(activeTemplate.id)}
                          </span>
                        </div>

                        {/* Suitable For Description */}
                        <p className="text-[11px] sm:text-xs text-slate-600 font-medium line-clamp-1">
                          {getSuitableFor(activeTemplate)} — {activeTemplate.description}
                        </p>
                      </div>

                      {/* Action Buttons Bar */}
                      <div className="flex items-center gap-2 w-full md:w-auto flex-shrink-0">
                        
                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(activeTemplate.id)}
                          className={`p-2.5 rounded-xl sm:rounded-2xl border transition-all active:scale-95 cursor-pointer min-h-[40px] sm:min-h-[46px] min-w-[40px] sm:min-w-[46px] flex items-center justify-center ${
                            favorites.includes(activeTemplate.id)
                              ? 'bg-rose-50 border-rose-300 text-rose-500'
                              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                          }`}
                          title="Save to Favorites"
                        >
                          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${favorites.includes(activeTemplate.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        {/* Fullscreen Preview Button */}
                        <button
                          onClick={() => {
                            setPreviewModalTemplate(activeTemplate);
                            setModalZoom(0.70);
                          }}
                          className="flex-1 md:flex-initial px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border border-slate-200 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] sm:min-h-[46px]"
                        >
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                          <span>Preview</span>
                        </button>

                        {/* Use Template CTA Button */}
                        <button
                          onClick={() => onSelectTemplate(activeTemplate)}
                          className="flex-1 md:flex-initial px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] sm:min-h-[44px]"
                        >
                          <span>Use Template</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            
            /* ── NORMAL GRID SCROLL VIEW (CLASSIC MULTI-COLUMN VIEW) ── */
            <div
              ref={gridScrollContainerRef}
              onScroll={handleGridScroll}
              className="flex-1 overflow-y-auto p-3 sm:p-6 smooth-scroll-container bg-slate-50 dark:bg-transparent"
            >
              {filteredTemplates.length === 0 ? (
                <div className="bg-white dark:bg-[#0e1422] rounded-xl p-8 sm:p-12 border border-slate-200 dark:border-[#1a2336] text-center space-y-4 max-w-md mx-auto my-12 shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-[#161c2e] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1a2336] flex items-center justify-center mx-auto text-xl">
                    <Search className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {selectedCategory === 'Favorites' ? 'No Saved Templates Yet' : 'No matching templates found'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-normal text-xs mt-1 leading-relaxed">
                      {selectedCategory === 'Favorites'
                        ? 'Click the heart icon on any template card to save it for quick access.'
                        : 'Try clearing your filters or searching for different keywords.'}
                    </p>
                  </div>
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-[#4f46e5] dark:hover:bg-[#4338ca] text-white font-medium text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    {selectedCategory === 'Favorites' ? 'Browse All Templates' : 'Reset Filters'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 pb-20">
                  {filteredTemplates.slice(0, visibleCount).map((t) => {
                    const palette = PALETTES.find(p => p.id === t.defaultPaletteId) || PALETTES[0];
                    const isFav = favorites.includes(t.id);

                    return (
                      <div
                        key={t.id}
                        className="bg-white dark:bg-[#0e1422] rounded-xl border border-slate-200 dark:border-[#1a2336] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-[#263248] transition-all overflow-hidden flex flex-col group relative gpu-accelerated text-slate-900 dark:text-slate-100"
                      >
                        {/* ATS & Favorite Badge Overlay */}
                        <div className="absolute top-2 left-2 right-2 z-40 flex justify-between items-center pointer-events-none">
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold bg-white/95 dark:bg-[#131b2e]/95 text-slate-800 dark:text-slate-200 shadow-2xs border border-slate-200 dark:border-[#1a2336] flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{t.atsScore}% ATS</span>
                          </span>

                          {/* Favorite Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              toggleFavorite(t.id, e);
                            }}
                            className="z-50 relative pointer-events-auto p-1.5 min-w-[30px] min-h-[30px] rounded-md bg-white/95 dark:bg-[#131b2e]/95 hover:bg-white dark:hover:bg-[#1c2842] text-slate-600 dark:text-slate-300 shadow-2xs border border-slate-200 dark:border-[#1a2336] flex items-center justify-center transition-colors cursor-pointer"
                            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                            aria-label="Toggle Favorite"
                          >
                            <Heart className={`w-3.5 h-3.5 transition-colors ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
                          </button>
                        </div>

                        {/* Centered Live A4 Thumbnail Preview Container */}
                        <div className="h-[210px] sm:h-[290px] w-full overflow-hidden bg-slate-50 dark:bg-[#070a13] relative flex items-center justify-center group-hover:bg-slate-100/80 dark:group-hover:bg-[#0a0f1d] transition-colors">
                          <ResumeThumbnailPreview
                            template={t}
                            onClick={() => { setPreviewModalTemplate(t); setModalZoom(0.70); }}
                          />

                          {/* Hover Overlay Action Bar */}
                          <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewModalTemplate(t);
                                setModalZoom(0.70);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0e1422] text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-sm hover:bg-slate-50 dark:hover:bg-[#141d30] transition-colors flex items-center gap-1 cursor-pointer min-h-[32px] border border-slate-200 dark:border-[#1a2336]"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                              <span>Preview</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTemplate(t);
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#4f46e5] dark:hover:bg-[#4338ca] text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1 cursor-pointer min-h-[32px]"
                            >
                              <span>Use</span>
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Card Information Footer */}
                        <div className="p-3 sm:p-3.5 space-y-1.5 flex-1 flex flex-col justify-between bg-white dark:bg-[#0e1422] border-t border-slate-100 dark:border-[#1a2336]">
                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#38bdf8] truncate transition-colors">
                                {t.name}
                              </h3>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <div
                                  className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 shadow-2xs flex-shrink-0"
                                  style={{ backgroundColor: palette.primary }}
                                  title={`Color theme: ${palette.name}`}
                                />
                              </div>
                            </div>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-normal">{t.description}</p>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-[#1a2336]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewModalTemplate(t);
                                setModalZoom(0.70);
                              }}
                              className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#141d30] hover:bg-slate-100 dark:hover:bg-[#1c2842] border border-slate-200 dark:border-[#1a2336] text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px] flex-shrink-0"
                              title="Preview Template"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTemplate(t);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-[#4f46e5] dark:hover:bg-[#4338ca] text-white font-medium text-xs flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer min-h-[32px] truncate"
                            >
                              <span className="truncate">Use Template</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE BOTTOM SHEET FILTER PANEL ── */}
      {isMobileFilterOpen && (
        <div
          onClick={() => setIsMobileFilterOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden flex justify-end flex-col animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl border-t border-slate-200 animate-slideUp text-slate-900"
          >
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-base text-slate-900">Filter Templates</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Category</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {TEMPLATE_CATEGORIES.map(cat => (
                  <button
                    key={`mob-${cat}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      if ((cat as string) === 'Favorites') setShowFavoritesOnly(true);
                      else setShowFavoritesOnly(false);
                      setIsMobileFilterOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left truncate transition-colors cursor-pointer ${
                      selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Palette Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Color Palette</label>
              <div className="flex flex-wrap gap-2">
                {PALETTES.map(p => (
                  <button
                    key={`mob-pal-${p.id}`}
                    onClick={() => { setSelectedColor(selectedColor === p.id ? null : p.id); }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      selectedColor === p.id ? 'border-slate-900 ring-2 ring-slate-400' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: p.primary }}
                  >
                    {selectedColor === p.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => { resetAllFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-xs text-slate-700 cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 font-semibold text-xs text-white shadow-sm cursor-pointer"
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-3 sm:p-6 animate-scale-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-200"
          >
            {/* Modal Header with Next/Prev Template Controls */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-wrap justify-between items-center bg-slate-50 gap-2 flex-shrink-0">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">{previewModalTemplate.name}</h3>
                <p className="text-xs text-slate-600 font-medium">{previewModalTemplate.category} Layout · {previewModalTemplate.atsScore}% ATS Compatible</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Prev & Next Template Navigation in Modal */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    onClick={() => {
                      const curIdx = filteredTemplates.findIndex(x => x.id === previewModalTemplate.id);
                      if (curIdx > 0) setPreviewModalTemplate(filteredTemplates[curIdx - 1]);
                    }}
                    disabled={filteredTemplates.findIndex(x => x.id === previewModalTemplate.id) === 0}
                    className="p-1 hover:bg-slate-100 text-slate-700 rounded disabled:opacity-30 cursor-pointer"
                    title="Previous Template"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-semibold text-slate-500 px-2 font-mono">
                    {filteredTemplates.findIndex(x => x.id === previewModalTemplate.id) + 1} / {filteredTemplates.length}
                  </span>
                  <button
                    onClick={() => {
                      const curIdx = filteredTemplates.findIndex(x => x.id === previewModalTemplate.id);
                      if (curIdx < filteredTemplates.length - 1) setPreviewModalTemplate(filteredTemplates[curIdx + 1]);
                    }}
                    disabled={filteredTemplates.findIndex(x => x.id === previewModalTemplate.id) === filteredTemplates.length - 1}
                    className="p-1 hover:bg-slate-100 text-slate-700 rounded disabled:opacity-30 cursor-pointer"
                    title="Next Template"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    onClick={() => setModalZoom(z => Math.max(z - 0.1, 0.4))}
                    className="p-1 hover:bg-slate-100 text-slate-700 rounded cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-slate-700 px-2 font-mono">
                    {Math.round(modalZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setModalZoom(z => Math.min(z + 0.1, 1.3))}
                    className="p-1 hover:bg-slate-100 text-slate-700 rounded cursor-pointer"
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
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>

                <button
                  onClick={() => setPreviewModalTemplate(null)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-slate-950 p-3 sm:p-6 flex justify-center items-start">
              <div
                className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0 transition-transform duration-150 relative"
                style={{
                  width: `${794 * modalZoom}px`,
                  height: `${1123 * modalZoom}px`,
                }}
              >
                <div
                  ref={previewModalRef}
                  style={{
                    width: 794,
                    minHeight: 1123,
                    margin: 0,
                    padding: 0,
                    backgroundColor: '#ffffff',
                    transform: `scale(${modalZoom})`,
                    transformOrigin: 'top left',
                  }}
                >
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
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
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

      {/* Favorite Toast Notification */}
      {favToast && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs font-black animate-scale-in backdrop-blur-md">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 flex-shrink-0" />
          <span>{favToast}</span>
        </div>
      )}

    </div>
  );
};
