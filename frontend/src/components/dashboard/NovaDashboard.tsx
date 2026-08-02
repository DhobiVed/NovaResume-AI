import React, { useState } from 'react';
import {
  FileText, Plus, Sparkles, CheckCircle, Search, Award,
  Edit3, Trash2, ShieldCheck, Zap, ArrowRight, Upload, Briefcase
} from 'lucide-react';

interface SavedResumeItem {
  id: string;
  title: string;
  template_id: string;
  ats_score: number;
  updated_at?: string;
  target_role?: string;
}

interface NovaDashboardProps {
  resumes: SavedResumeItem[];
  onCreateNew: () => void;
  onEditResume: (resume: SavedResumeItem) => void;
  onDeleteResume: (id: string) => void;
  onOpenAtsAnalyzer: () => void;
  onOpenCoverLetter: () => void;
  onOpenPortfolio: () => void;
  onOpenImport: () => void;
}

export const NovaDashboard: React.FC<NovaDashboardProps> = ({
  resumes,
  onCreateNew,
  onEditResume,
  onDeleteResume,
  onOpenAtsAnalyzer,
  onOpenCoverLetter,
  onOpenPortfolio,
  onOpenImport
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.target_role && r.target_role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 md:p-10 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white shadow-2xl overflow-hidden border border-indigo-500/20">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-300 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>NovaResume AI 2.0 Enterprise</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Build Canva-Grade, ATS-Passed Resumes in Seconds
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Create designed vector graphic resumes, analyze ATS compatibility, match job descriptions, and export matching Cover Letters & Web Portfolios.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs md:text-sm font-bold shadow-lg transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Resume</span>
            </button>
            <button
              onClick={onOpenImport}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs md:text-sm font-bold backdrop-blur-md transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import Existing PDF / LinkedIn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Quick Tools Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { title: 'ATS Analyzer', desc: 'Score & Keyword Matcher', icon: ShieldCheck, color: 'text-emerald-500', action: onOpenAtsAnalyzer },
          { title: 'Cover Letter AI', desc: 'Tailored Job Applications', icon: Briefcase, color: 'text-purple-500', action: onOpenCoverLetter },
          { title: 'Web Portfolio', desc: 'Personal Webpage Generator', icon: Zap, color: 'text-amber-500', action: onOpenPortfolio },
          { title: '50+ Templates', desc: 'Canva & Graphic Styles', icon: Award, color: 'text-blue-500', action: onCreateNew },
        ].map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              onClick={tool.action}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-2">
                <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${tool.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-100">{tool.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{tool.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Saved Resumes Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Saved Resumes & History</h2>
            <p className="text-xs text-slate-400">Manage, edit, or export your saved resume versions</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resumes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {filteredResumes.length === 0 ? (
          <div className="p-8 text-center bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Resumes Saved Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Create your first resume using Canva-style designer templates or import an existing PDF.</p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow hover:bg-primary-hover transition-colors"
            >
              + Create Resume Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResumes.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{r.title}</h3>
                        <span className="text-[10px] text-slate-400">{r.target_role || 'Software Engineer'}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>{r.ats_score || 85}% ATS</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button
                    onClick={() => onEditResume(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Editor</span>
                  </button>

                  <button
                    onClick={() => onDeleteResume(r.id)}
                    className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
