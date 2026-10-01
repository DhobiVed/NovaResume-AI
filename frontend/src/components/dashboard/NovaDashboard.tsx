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
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Ready ({completion}%)</span>;
      case 'published':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Published</span>;
      case 'archived':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Archived</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">In Progress ({completion}%)</span>;
      case 'draft':
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Draft ({completion}%)</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Executive Header Banner with Frosted Glass Overlay */}
      <div className="relative rounded-3xl overflow-hidden text-white border border-white/20 dark:border-white/10 shadow-xl min-h-[190px]">
        {/* Background Video — Vivid, clean and HD */}
        <video
          src="/promo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Soft left-side gradient scrim: keeps HD video vibrant and crisp across the banner while ensuring sharp text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/40 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-white text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Resume &amp; Career Workspace</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Professional Resume Builder &amp; ATS Suite
          </h1>
          
          <p className="text-slate-100 text-xs md:text-sm leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium">
            Design vector graphic resumes, verify ATS compatibility against target job descriptions, and export matching application assets.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2.5">
            <button
              onClick={onCreateNew}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer min-h-[38px] backdrop-blur-md"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              <span>Create New Resume</span>
            </button>

            <button
              onClick={onOpenImport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 glass-pill hover:bg-white/20 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer min-h-[38px]"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>Import Resume (PDF / DOCX)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Quick Tools Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: 'ATS Analyzer', desc: 'Score & JD Matcher', icon: ShieldCheck, action: onOpenAtsAnalyzer, color: 'text-emerald-500' },
          { title: 'Cover Letter AI', desc: 'Tailored Applications', icon: Briefcase, action: onOpenCoverLetter, color: 'text-blue-500' },
          { title: 'Web Portfolio', desc: 'Personal Web Generator', icon: Zap, action: onOpenPortfolio, color: 'text-purple-500' },
          { title: 'Template Gallery', desc: '50+ Enterprise Designs', icon: Award, action: onCreateNew, color: 'text-amber-500' },
        ].map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <div
              key={idx}
              onClick={tool.action}
              className="p-4 rounded-2xl glass-card-interactive cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="p-2 rounded-xl glass-pill text-slate-800 dark:text-slate-200">
                  <Icon className={`w-4 h-4 ${tool.color}`} />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <h3 className="font-semibold text-xs md:text-sm text-slate-900 dark:text-slate-100 truncate">{tool.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{tool.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace & Drafts Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/60 dark:border-slate-800/70 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Workspace &amp; Drafts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Manage, edit, duplicate, or export your saved resume drafts</p>
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
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input text-slate-900 dark:text-slate-100 min-h-[36px]"
              />
            </div>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="px-3 py-1.5 glass-input text-xs font-medium text-slate-800 dark:text-slate-200 rounded-xl min-h-[36px] cursor-pointer"
            >
              <option value="updated">Last Edited</option>
              <option value="title">Title</option>
              <option value="completion">Completion %</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
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
              className={`px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 font-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resumes Grid */}
        {filteredResumes.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-xl glass-pill text-slate-700 dark:text-slate-300 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">No Resumes Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {activeTab === 'all'
                ? 'Create your first resume using designer templates or import an existing PDF.'
                : `No resumes currently in "${activeTab}" state.`}
            </p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              + Create Resume Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResumes.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-2xl glass-card-interactive transition-all space-y-3 flex flex-col justify-between relative group ${
                  r.isPinned ? 'ring-2 ring-indigo-500/40 border-indigo-400/50' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl glass-pill text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1 flex items-center gap-1.5">
                          <span>{r.title}</span>
                          {r.isPinned && <Pin className="w-3 h-3 text-indigo-500 fill-indigo-500" />}
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block">{r.targetRole || 'Professional'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(r.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          r.isPinned ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title="Pin resume"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleFavorite(r.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          r.isFavorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                        title="Favorite"
                      >
                        <Star className={`w-3.5 h-3.5 ${r.isFavorite ? 'fill-amber-500' : ''}`} />
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

                    <div className="w-full bg-slate-200/60 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${r.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex justify-between items-center gap-2">
                  <button
                    onClick={() => onEditResume(r)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer min-h-[34px]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Continue Editing</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(r.id)}
                    className="p-1.5 hover:bg-white/80 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Duplicate Resume"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(r.id)}
                    className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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
          <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/70 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Recent Activity</span>
            </h3>

            <div className="glass-card rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto scroll-smooth">
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex justify-between items-center text-xs border-b border-slate-200/40 dark:border-slate-800/50 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{log.description}</span>
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
        <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Resume Draft?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Are you sure you want to delete this resume draft? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 glass-pill text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-white/80 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
