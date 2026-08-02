import React, { useState } from 'react';
import {
  Search, Eye, Sparkles, Plus, ArrowRight,
  ShieldCheck, Star
} from 'lucide-react';

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  layout: 'one_column' | 'two_column';
  atsScore: number;
  isPopular?: boolean;
  isNew?: boolean;
  themeColor: string;
  accentColor: string;
  cardBg: string;
  textColor: string;
  previewDescription: string;
}

export const TEMPLATE_GALLERY_DATA: TemplateItem[] = [
  { id: 'modern_pro', name: 'Modern Professional', category: 'Modern', layout: 'two_column', atsScore: 98, isPopular: true, themeColor: '#1e3a8a', accentColor: '#3b82f6', cardBg: '#f8fafc', textColor: '#0f172a', previewDescription: 'Clean 2-column layout with dark blue sidebar and ATS-optimized typography.' },
  { id: 'navy_gold_exec', name: 'Navy & Gold Executive', category: 'Executive', layout: 'two_column', atsScore: 96, isPopular: true, themeColor: '#0f172a', accentColor: '#eab308', cardBg: '#f8fafc', textColor: '#0f172a', previewDescription: 'Executive leadership layout with gold accents and dark obsidian sidebar.' },
  { id: 'ai_engineer_dark', name: 'AI & ML Engineer Dark', category: 'AI Engineer', layout: 'two_column', atsScore: 95, isNew: true, themeColor: '#09090b', accentColor: '#f43f5e', cardBg: '#18181b', textColor: '#f4f4f5', previewDescription: 'Cyberpunk dark mode designed specifically for AI researchers and ML engineers.' },
  { id: 'google_designer', name: 'Google Studio Minimal', category: 'Software Engineer', layout: 'one_column', atsScore: 99, isPopular: true, themeColor: '#1a73e8', accentColor: '#ea4335', cardBg: '#f8f9fa', textColor: '#202124', previewDescription: 'Single column Google-style clean layout prioritizing experience and technical skills.' },
  { id: 'canva_studio_purple', name: 'Canva Studio Modern', category: 'Creative', layout: 'two_column', atsScore: 94, isPopular: true, themeColor: '#7d2ae8', accentColor: '#00c4cc', cardBg: '#fafafa', textColor: '#2d3748', previewDescription: 'Vibrant Canva graphic studio style with teal highlights and skill badge chips.' },
  { id: 'emerald_corporate', name: 'Black & Emerald Tech', category: 'Corporate', layout: 'two_column', atsScore: 97, isNew: true, themeColor: '#064e3b', accentColor: '#10b981', cardBg: '#f0fdf4', textColor: '#064e3b', previewDescription: 'Corporate green theme tailored for tech leads, engineering managers, and directors.' },
  { id: 'minimal_ats_classic', name: 'ATS Classic Minimalist', category: 'ATS Professional', layout: 'one_column', atsScore: 100, isPopular: true, themeColor: '#1e293b', accentColor: '#64748b', cardBg: '#ffffff', textColor: '#0f172a', previewDescription: '100% ATS parser compliant single-column traditional resume structure.' },
  { id: 'startup_violet', name: 'Startup Founder Violet', category: 'Startup', layout: 'two_column', atsScore: 93, isNew: true, themeColor: '#581c87', accentColor: '#c084fc', cardBg: '#faf5ff', textColor: '#3b0764', previewDescription: 'Dynamic purple layout for startup founders, product leads, and growth engineers.' },
  { id: 'ui_ux_portfolio', name: 'UI/UX Designer Card', category: 'UI/UX Designer', layout: 'two_column', atsScore: 92, isPopular: true, themeColor: '#4c1d95', accentColor: '#ec4899', cardBg: '#fdf2f8', textColor: '#0f172a', previewDescription: 'Portfolio-focused design with project showcase cards and tech stack tags.' },
  { id: 'data_science_cyan', name: 'Data Scientist Cyan', category: 'Data Scientist', layout: 'two_column', atsScore: 96, themeColor: '#172554', accentColor: '#38bdf8', cardBg: '#f0f9ff', textColor: '#0f172a', previewDescription: 'Tailored for Data Scientists, Data Engineers, and Analytics leads.' },
  { id: 'luxury_rose_gold', name: 'Luxury Rose Executive', category: 'Luxury', layout: 'two_column', atsScore: 91, isNew: true, themeColor: '#881337', accentColor: '#fb7185', cardBg: '#fff1f2', textColor: '#4c0519', previewDescription: 'High-end luxury aesthetic with rose gold accents and elegant typography.' },
  { id: 'student_fresher_blue', name: 'Graduate & Student Pro', category: 'Student', layout: 'one_column', atsScore: 98, themeColor: '#1d4ed8', accentColor: '#60a5fa', cardBg: '#ffffff', textColor: '#1e293b', previewDescription: 'Clean student template emphasizing education, hackathons, and projects.' },
];

const CATEGORIES = [
  'All', 'ATS Professional', 'Modern', 'Executive', 'Software Engineer',
  'AI Engineer', 'Data Scientist', 'UI/UX Designer', 'Corporate', 'Creative',
  'Startup', 'Student', 'Luxury'
];

interface TemplateMarketplaceProps {
  onSelectTemplate: (templateId: string, themeColor: string) => void;
  onOpenCustomBuilder: () => void;
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({ onSelectTemplate, onOpenCustomBuilder }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutFilter, setLayoutFilter] = useState<'all' | 'one_column' | 'two_column'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  const filteredTemplates = TEMPLATE_GALLERY_DATA.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLayout = layoutFilter === 'all' || t.layout === layoutFilter;
    return matchesCat && matchesSearch && matchesLayout;
  });

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-2xl border border-indigo-500/20">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>50+ Graphic Designer Templates</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Template Marketplace & Gallery</h2>
          <p className="text-xs md:text-sm text-slate-300">
            Browse Canva & Figma grade templates designed for 100% ATS parser compatibility and single-page vector PDF export.
          </p>
        </div>

        <button
          onClick={onOpenCustomBuilder}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Template</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search template name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Layout Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
          {[
            { id: 'all', label: 'All Layouts' },
            { id: 'one_column', label: '1-Column' },
            { id: 'two_column', label: '2-Column Graphic' }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLayoutFilter(l.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                layoutFilter === l.id ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white shadow'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((t) => (
          <div
            key={t.id}
            className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Mini Resume Graphic Preview Box */}
            <div
              className="h-44 p-4 relative flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.01]"
              style={{ backgroundColor: t.themeColor }}
            >
              {/* Badges */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white backdrop-blur-md border border-white/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{t.atsScore}% ATS</span>
                </span>

                {t.isPopular && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Popular</span>
                  </span>
                )}
                {t.isNew && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500 text-white shadow">
                    NEW
                  </span>
                )}
              </div>

              {/* Graphic Layout Skeleton */}
              <div className="space-y-1.5 text-white">
                <div className="font-extrabold text-sm tracking-tight">{t.name}</div>
                <div className="text-[10px] opacity-80 uppercase tracking-wider" style={{ color: t.accentColor }}>
                  {t.category} Layout
                </div>

                <div className="flex gap-1 pt-2">
                  <div className="w-1/3 h-12 rounded-lg bg-white/10 p-1 space-y-1">
                    <div className="h-1.5 w-3/4 rounded bg-white/30"></div>
                    <div className="h-1.5 w-1/2 rounded bg-white/20"></div>
                  </div>
                  <div className="w-2/3 h-12 rounded-lg bg-white/20 p-1 space-y-1">
                    <div className="h-1.5 w-full rounded bg-white/40"></div>
                    <div className="h-1.5 w-4/5 rounded bg-white/30"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Information & Actions */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{t.name}</h3>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-500">
                    {t.layout === 'two_column' ? '2-Column' : '1-Column'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{t.previewDescription}</p>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setPreviewTemplate(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => onSelectTemplate(t.id, t.themeColor)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow transition-transform active:scale-95"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">{previewTemplate.name}</h3>
                <span className="text-xs text-primary font-semibold">{previewTemplate.category} Template</span>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <Eye className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl text-white space-y-3" style={{ backgroundColor: previewTemplate.themeColor }}>
              <div className="font-extrabold text-xl">ALEX VANCE</div>
              <div className="text-xs font-bold uppercase" style={{ color: previewTemplate.accentColor }}>Senior AI Systems Engineer</div>
              <p className="text-xs opacity-80">6+ years of experience engineering LLM architectures and vector search platforms.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectTemplate(previewTemplate.id, previewTemplate.themeColor);
                  setPreviewTemplate(null);
                }}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow"
              >
                Use This Template Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
