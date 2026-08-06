import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Sparkles, Search, Award,
  Edit3, Trash2, ShieldCheck, Zap, ArrowRight, Upload, Briefcase,
  Star, Pin, Copy, Activity, AlertTriangle
} from 'lucide-react';
import {
  getSavedResumes, deleteResumeItem, duplicateResumeItem,
  toggleFavoriteResume, togglePinResume, getActivityLogs,
  type SavedResumeItem, type ActivityLogItem
} from '../../lib/resumeStorage';

interface NovaDashboardProps {
  onCreateNew: () => void;
  onEditResume: (resume: SavedResumeItem) => void;
  onOpenAtsAnalyzer: () => void;
  onOpenCoverLetter: () => void;
  onOpenPortfolio: () => void;
  onOpenImport: () => void;
}

export const NovaDashboard: React.FC<NovaDashboardProps> = ({
  onCreateNew,
  onEditResume,
  onOpenAtsAnalyzer,
  onOpenCoverLetter,
  onOpenPortfolio,
  onOpenImport
}) => {
  const [resumes, setResumes] = useState<SavedResumeItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'drafts' | 'completed' | 'published' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<'updated' | 'title' | 'completion'>('updated');

  const refreshData = () => {
    setResumes(getSavedResumes());
    setActivityLogs(getActivityLogs());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filter resumes by Tab & Search
  const filteredResumes = resumes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.targetRole && r.targetRole.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'drafts') return r.status === 'draft' || r.status === 'in_progress';
    if (activeTab === 'completed') return r.status === 'ready' || r.completionPercentage >= 90;
    if (activeTab === 'published') return r.status === 'published';
    if (activeTab === 'archived') return r.status === 'archived';
    return true;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (selectedSort === 'title') {
      return a.title.localeCompare(b.title);
    } else if (selectedSort === 'completion') {
      return b.completionPercentage - a.completionPercentage;
    } else {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const handleDelete = (id: string) => {
    deleteResumeItem(id);
    setDeleteConfirmId(null);
    refreshData();
  };

  const handleDuplicate = (id: string) => {
    duplicateResumeItem(id);
    refreshData();
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteResume(id);
    refreshData();
  };

  const handleTogglePin = (id: string) => {
    togglePinResume(id);
    refreshData();
  };

  const getStatusBadge = (status: SavedResumeItem['status'], completion: number) => {
    switch (status) {
      case 'ready':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">Ready ({completion}%)</span>;
      case 'published':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">Published</span>;
      case 'archived':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 border border-emerald-900/30">Archived</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/30">In Progress ({completion}%)</span>;
      case 'draft':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">Draft ({completion}%)</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Hero Header with Video Background */}
      <div className="relative rounded-3xl overflow-hidden text-white shadow-2xl border border-teal-500/30" style={{ minHeight: '160px' }}>
        {/* Background Video */}
        <video
          src="/promo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-teal-950/85 to-green-950/80 pointer-events-none" />
        {/* Decorative Blobs */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-70 h-70 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 p-6 md:p-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>NovaResume AI 2.0 Enterprise</span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Build Canva-Grade, ATS-Passed Resumes in Seconds
          </h1>
          
          <p className="text-emerald-100/90 text-xs md:text-sm leading-relaxed">
            Create designed vector graphic resumes, analyze ATS compatibility, match job descriptions, and export matching Cover Letters & Web Portfolios.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2.5">
            <button
              onClick={onCreateNew}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-extrabold shadow-lg shadow-emerald-900/40 transition-transform active:scale-95 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Resume</span>
            </button>

            <button
              onClick={onOpenImport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-900/60 hover:bg-teal-800/80 text-teal-100 border border-teal-400/40 rounded-xl text-xs md:text-sm font-extrabold backdrop-blur-md transition-colors cursor-pointer min-h-[44px]"
            >
              <Upload className="w-4 h-4 text-teal-300" />
              <span>Import Resume (PDF / DOCX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Quick Tools Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
        {[
          { title: 'ATS Analyzer', desc: 'Score & JD Matcher', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200', action: onOpenAtsAnalyzer },
          { title: 'Cover Letter AI', desc: 'Tailored Applications', icon: Briefcase, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 border-teal-200', action: onOpenCoverLetter },
          { title: 'Web Portfolio', desc: 'Personal Web Generator', icon: Zap, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200', action: onOpenPortfolio },
          { title: '50+ Templates', desc: 'Canva & Graphic Styles', icon: Award, color: 'text-green-700 bg-green-50 dark:bg-green-950/60 border-green-200', action: onCreateNew },
        ].map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              onClick={tool.action}
              className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-2">
                <div className={`p-2 rounded-xl border ${tool.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-slate-100 truncate">{tool.title}</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{tool.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace & Drafts Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Workspace & Drafts</h2>
            <p className="text-xs text-slate-500 font-medium">Manage, edit, duplicate, or export your resume drafts</p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resumes..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 min-h-[38px]"
              />
            </div>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl min-h-[38px]"
            >
              <option value="updated">Last Edited</option>
              <option value="title">Title</option>
              <option value="completion">Completion %</option>
            </select>
          </div>
        </div>

        {/* Category Tabs with Emerald / Deep Teal Gradient */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'all', label: 'All Resumes' },
            { id: 'drafts', label: 'Drafts' },
            { id: 'completed', label: 'Completed' },
            { id: 'published', label: 'Published' },
            { id: 'archived', label: 'Archived' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resumes Grid */}
        {filteredResumes.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Resumes Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'all'
                ? 'Create your first resume using Canva-style designer templates or import an existing PDF.'
                : `No resumes currently in "${activeTab}" state.`}
            </p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              + Create Resume Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResumes.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all space-y-3 flex flex-col justify-between relative group ${
                  r.isPinned ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1.5">
                          <span>{r.title}</span>
                          {r.isPinned && <Pin className="w-3 h-3 text-emerald-500 fill-emerald-500" />}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium block">{r.targetRole || 'Professional'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(r.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          r.isPinned ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Pin resume"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleFavorite(r.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          r.isFavorite ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title="Favorite"
                      >
                        <Star className={`w-3.5 h-3.5 ${r.isFavorite ? 'fill-indigo-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Status */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center">
                      {getStatusBadge(r.status, r.completionPercentage)}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(r.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 h-full rounded-full"
                        style={{ width: `${r.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-2">
                  <button
                    onClick={() => onEditResume(r)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors cursor-pointer min-h-[38px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Continue Editing</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(r.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                    title="Duplicate Resume"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(r.id)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Activity Log Feed Panel */}
        {activityLogs.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Recent Activity Feed</span>
            </h3>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 max-h-48 overflow-y-auto scroll-smooth">
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex justify-between items-center text-xs font-semibold border-b border-slate-100 dark:border-slate-800/60 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-800 dark:text-slate-200">{log.description}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Delete Resume?</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Are you sure you want to delete this resume draft? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
