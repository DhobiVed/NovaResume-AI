import React, { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategoryFilter } from '../../lib/templateData';
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
  Search, Sparkles, ShieldCheck, Star, Eye, ArrowRight, CheckCircle2,
  Layers, Award, ChevronLeft, ChevronRight, X, Play, ZoomIn, ZoomOut, Maximize2, Download
} from 'lucide-react';
import { exportSinglePagePdf } from '../../lib/pdfExport';

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
const ResumeThumbnailPreview: React.FC<{ template: TemplateDefinition; height?: number; onClick?: () => void }> = memo(({ template, height = 310, onClick }) => {
  const scale = height === 260 ? 0.23 : 0.265;

  return (
    <div
      onClick={onClick}
      className="w-full bg-slate-100 flex items-center justify-center overflow-hidden relative p-2 border-b border-slate-200/80 cursor-pointer gpu-accelerated select-none"
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
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutFilter, setLayoutFilter] = useState<'all' | 'one_col' | 'two_col'>('all');
  const [previewModalTemplate, setPreviewModalTemplate] = useState<TemplateDefinition | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [modalZoom, setModalZoom] = useState(0.70);

  const previewModalRef = useRef<HTMLDivElement>(null);

  // Auto-slide carousel state & refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [isPageScrolling, setIsPageScrolling] = useState(false);

  const featuredTemplates = ALL_TEMPLATES.filter(t => t.isPopular || t.isNew).slice(0, 10);

  // Scroll detection to pause auto-slider during active page scrolling
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      setIsPageScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setIsPageScrolling(false), 800);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Automatic Smooth Auto-Slide Effect every 3.5 seconds (paused when user is scrolling)
  useEffect(() => {
    if (isCarouselHovered || isPageScrolling) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const maxScroll = scrollWidth - clientWidth;
        if (scrollLeft >= maxScroll - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 240, behavior: 'smooth' });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isCarouselHovered, isPageScrolling]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -240 : 240,
        behavior: 'smooth'
      });
    }
  };

  const handleDownloadSample = async () => {
    if (previewModalRef.current && previewModalTemplate) {
      await exportSinglePagePdf(previewModalRef.current, `${previewModalTemplate.name}_Sample`);
    }
  };

  const filteredTemplates = ALL_TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLayout = layoutFilter === 'all' || 
                          (layoutFilter === 'one_col' && t.layout === 'one_col') ||
                          (layoutFilter === 'two_col' && t.layout !== 'one_col');
    return matchesCategory && matchesSearch && matchesLayout;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans animate-fade-in gpu-accelerated">
      {/* Hero Section with Embedded Promo Video Showcase */}
      <div className="bg-gradient-to-b from-white via-slate-50 to-emerald-50/30 border-b border-slate-200/80 py-8 sm:py-12 px-4 md:px-12 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-extrabold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Next-Generation Career Platform & Resume Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Craft Exceptional Resumes.<br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 bg-clip-text text-transparent">
              100% ATS Guaranteed.
            </span>
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Browse 100+ designer templates with real-time A4 preview, single-page vector export, and 1-click web portfolio generator.
          </p>

          {/* Embedded Promo Video Showcase */}
          <div className="max-w-3xl mx-auto pt-2">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200 shadow-2xl bg-slate-950 group">
              <video
                src="/promo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[220px] sm:h-[360px] object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-4 sm:p-6 text-left">
                <div>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold text-[10px] sm:text-xs rounded-lg uppercase tracking-wider shadow">
                    PROMO SHOWCASE
                  </span>
                  <h3 className="text-white font-black text-sm sm:text-xl pt-1">NovaResume AI Platform Overview</h3>
                </div>

                <button
                  onClick={() => setShowPromoModal(true)}
                  className="px-3 py-2 bg-white/90 hover:bg-white text-slate-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current text-emerald-600" />
                  <span className="hidden sm:inline">Expand Video</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto pt-2">
            <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-lg sm:text-xl font-black text-emerald-600">99.4%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">ATS Pass Rate</div>
            </div>
            <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-lg sm:text-xl font-black text-teal-600">100+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Designer Templates</div>
            </div>
            <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-lg sm:text-xl font-black text-green-700">0.2s</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Vector Export</div>
            </div>
            <div className="bg-white p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="text-lg sm:text-xl font-black text-emerald-700">100%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Offline Web</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Templates Auto-Sliding Showcase */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900">Featured Showcase</h2>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
              ⚡ Auto-Sliding
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider */}
        <div
          ref={carouselRef}
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
          className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x scrollbar-none scroll-smooth gpu-accelerated"
        >
          {featuredTemplates.map(t => (
            <div
              key={`feat-${t.id}`}
              className="w-[200px] sm:w-[250px] flex-shrink-0 snap-start bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 overflow-hidden group gpu-accelerated"
            >
              <ResumeThumbnailPreview
                template={t}
                height={260}
                onClick={() => { setPreviewModalTemplate(t); setModalZoom(0.70); }}
              />
              <div className="p-3 space-y-1 bg-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-600 truncate">{t.name}</h3>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">{t.atsScore}% ATS</span>
                </div>
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPreviewModalTemplate(t); setModalZoom(0.70); }}
                    className="flex-1 py-1 text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSelectTemplate(t); }}
                    className="flex-1 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow"
                  >
                    <span>Use</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 md:px-8 py-2 sm:py-4 flex flex-col md:flex-row gap-6 flex-1">
        {/* Left Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ templates..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>

          {/* Mobile Categories scroll */}
          <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Desktop Layout Filter */}
          <div className="hidden md:block bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Layout Format</span>
            </div>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'one_col', label: 'Single Column (ATS Clean)' },
                { id: 'two_col', label: 'Two Column (Graphic Sidebar)' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setLayoutFilter(l.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    layoutFilter === l.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Categories */}
          <div className="hidden md:block bg-white p-4 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Categories</div>
            <div className="space-y-1 max-h-[440px] overflow-y-auto pr-1">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const count = cat === 'All' ? ALL_TEMPLATES.length : ALL_TEMPLATES.filter(t => t.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex justify-between items-center transition-colors ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* TEMPLATE CARDS GRID */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Showing {filteredTemplates.length} Templates
            </h2>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <p className="text-slate-500 font-medium text-xs">No templates match your filters.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setLayoutFilter('all'); }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
              {filteredTemplates.map((t) => {
                const palette = PALETTES.find(p => p.id === t.defaultPaletteId) || PALETTES[0];
                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col group relative gpu-accelerated"
                  >
                    {/* ATS Badge Overlay */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-wrap gap-1 pointer-events-none">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/95 text-emerald-800 shadow-md border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                        <span>{t.atsScore}% ATS</span>
                      </span>
                      {t.isPopular && (
                        <span className="hidden sm:flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-sm items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Popular</span>
                        </span>
                      )}
                    </div>

                    {/* Centered Thumbnail Preview */}
                    <div className="h-[200px] sm:h-[310px] w-full overflow-hidden bg-slate-100 relative flex items-center justify-center">
                      <ResumeThumbnailPreview
                        template={t}
                        height={310}
                        onClick={() => { setPreviewModalTemplate(t); setModalZoom(0.70); }}
                      />
                    </div>

                    {/* Card Information Footer */}
                    <div className="p-3.5 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-emerald-600 truncate transition-colors">
                            {t.name}
                          </h3>
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm flex-shrink-0" style={{ backgroundColor: palette.primary }} title={`Color theme: ${palette.name}`} />
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 line-clamp-1 leading-relaxed">{t.description}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setPreviewModalTemplate(t);
                            setModalZoom(0.70);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                          title="Full Screen Preview"
                        >
                          <Eye className="w-4 h-4 text-emerald-600" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onSelectTemplate(t);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-transform active:scale-95"
                        >
                          <span>Use Template</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Developer Branding Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-10 px-6 text-center mt-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-black text-white text-sm shadow-md">
              VD
            </div>
            <h3 className="font-extrabold text-base tracking-wide text-white">NovaResume AI Platform</h3>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold">
            <span>Designed & Engineered by</span>
            <span className="text-emerald-400 font-black">VED DHOBI</span>
          </div>

          <div className="flex justify-center items-center gap-4 text-xs font-bold text-slate-300 pt-1">
            <a href="mailto:veddhobi252@gmail.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              ✉ veddhobi252@gmail.com
            </a>
          </div>

          <div className="text-[11px] text-slate-500 font-medium pt-2">
            © 2026 NovaResume AI SaaS · All Rights Reserved. Created by Ved Dhobi.
          </div>
        </div>
      </footer>

      {/* FULL-SCREEN HIGH-RES PREVIEW MODAL MOUNTED DIRECTLY TO DOCUMENT.BODY VIA REACT PORTAL */}
      {previewModalTemplate && createPortal(
        <div
          onClick={() => setPreviewModalTemplate(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-6 animate-scale-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-200"
          >
            {/* Top Toolbar */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap justify-between items-center bg-slate-50 gap-2 flex-shrink-0">
              <div>
                <h3 className="font-black text-base text-slate-900">{previewModalTemplate.name}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{previewModalTemplate.category} Layout · {previewModalTemplate.atsScore}% ATS Compatible</p>
              </div>

              {/* Toolbar Zoom & Download Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
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
                  <button
                    onClick={() => setModalZoom(0.70)}
                    className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold px-1.5"
                    title="Fit to Screen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleDownloadSample}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  title="Download Sample PDF"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">Sample PDF</span>
                </button>

                <button
                  onClick={() => setPreviewModalTemplate(null)}
                  className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-700 transition-colors"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* High-Resolution Scrollable Viewport */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center items-start min-h-0 smooth-scroll-container">
              <div
                style={{
                  width: `${794 * modalZoom}px`,
                  height: `${1123 * modalZoom}px`,
                  position: 'relative',
                  flexShrink: 0,
                  marginTop: '16px',
                  marginBottom: '32px'
                }}
              >
                <div
                  ref={previewModalRef}
                  className="bg-white shadow-2xl rounded-sm overflow-hidden gpu-accelerated"
                  style={{
                    width: '794px',
                    minHeight: '1123px',
                    transform: `scale(${modalZoom})`,
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                >
                  <TemplateRenderer template={previewModalTemplate} />
                </div>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-white flex-shrink-0">
              <button
                onClick={() => setPreviewModalTemplate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const selected = previewModalTemplate;
                  setPreviewModalTemplate(null);
                  onSelectTemplate(selected);
                }}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Use This Template</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Expanded Promo Video Modal */}
      {showPromoModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-lg z-[99999] flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-4xl w-full flex flex-col overflow-hidden shadow-2xl border border-slate-800 relative">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-white font-extrabold text-base">NovaResume AI — Official Promo Video</h3>
              <button
                onClick={() => setShowPromoModal(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black flex justify-center items-center">
              <video
                src="/promo.mp4"
                controls
                autoPlay
                className="w-full max-h-[70vh] rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
