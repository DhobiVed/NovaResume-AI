import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Plus, Sparkles, Search,
  Edit3, Trash2, ShieldCheck, Zap, ArrowRight, Upload,
  Star, Pin, Copy, Activity, AlertTriangle, Play, Pause,
  Sliders, MoreVertical, ChevronRight, User, Download,
  Volume2, VolumeX
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

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

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

  const getActivityIcon = (type: ActivityLogItem['type']) => {
    switch (type) {
      case 'pdf_download':
        return (
          <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Download className="w-3.5 h-3.5" />
          </div>
        );
      case 'template_change':
        return (
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
        );
      case 'portfolio_generated':
        return (
          <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  const formatActivityTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '10:00 AM';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 space-y-6 max-w-7xl mx-auto text-slate-900 dark:text-slate-100">
      
      {/* ── 1. HERO WORKSPACE BANNER WITH LAPTOP VIDEO PLAYER ── */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/70 dark:from-slate-900/90 dark:via-slate-850/80 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden">
        {/* Left Column: Title & CTAs */}
        <div className="w-full lg:max-w-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Resume &amp; Career Workspace</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Professional Resume Builder &amp;{' '}
            <span className="text-blue-600 dark:text-blue-400">ATS </span>
            <span className="text-indigo-600 dark:text-indigo-400">Suite</span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
            Design vector graphic resumes, verify ATS compatibility against target job descriptions, and export matching application assets.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onCreateNew}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer min-h-[42px] active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create New Resume</span>
            </button>

            <button
              onClick={onOpenImport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer min-h-[42px] active:scale-95"
            >
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Import Resume (PDF / DOCX)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Realistic Laptop Mockup Video Player */}
        <div className="w-full lg:w-[460px] xl:w-[500px] flex-shrink-0 relative flex items-center justify-center">
          <div className="w-full max-w-md sm:max-w-lg flex flex-col items-center select-none group">
            {/* Screen Bezel */}
            <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-t-2xl p-2 sm:p-2.5 shadow-2xl border-[3px] border-slate-700/80 flex flex-col">
              {/* Web Camera */}
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mx-auto mb-1 flex-shrink-0" />
              
              {/* Screen Area */}
              <div className="relative flex-1 w-full h-full rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src="/promo.mp4"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Video Screen Overlay with "Build Your Future" and Circular Play Button */}
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-slate-950/40 hover:bg-slate-950/30 transition-all flex flex-col items-center justify-center cursor-pointer p-4"
                >
                  <div className="text-center space-y-2.5 transform transition-transform group-hover:scale-105">
                    <h3 className="text-white font-extrabold text-sm sm:text-base tracking-wide drop-shadow-md">
                      Build Your Future
                    </h3>

                    {/* Circular Glass Play Button */}
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-xl transition-all active:scale-90 mx-auto">
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white fill-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Audio Mute / Unmute Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white/80 hover:text-white backdrop-blur-sm text-[10px] flex items-center gap-1 transition"
                    title={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Laptop Base / Keyboard Deck */}
            <div className="relative w-[104%] h-3.5 bg-gradient-to-r from-slate-350 via-slate-200 to-slate-350 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-b-xl shadow-xl border-t border-slate-300 dark:border-slate-600 flex items-center justify-center">
              <div className="w-14 h-1 bg-slate-400/80 dark:bg-slate-500 rounded-full" />
            </div>

            {/* Desk Shadow */}
            <div className="w-[96%] h-3 bg-black/15 blur-md rounded-full mt-0.5" />
          </div>
        </div>
      </div>

      {/* ── 2. FEATURE QUICK ACCESS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ATS Analyzer */}
        <div
          onClick={onOpenAtsAnalyzer}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">ATS Analyzer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Score &amp; JD Matcher</p>
          </div>
        </div>

        {/* Cover Letter AI */}
        <div
          onClick={onOpenCoverLetter}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cover Letter AI</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tailored Applications</p>
          </div>
        </div>

        {/* Web Portfolio */}
        <div
          onClick={onOpenPortfolio}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
              <Zap className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Web Portfolio</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Personal Web Generator</p>
          </div>
        </div>

        {/* Template Gallery */}
        <div
          onClick={onCreateNew}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
              <User className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Template Gallery</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">50+ Enterprise Designs</p>
          </div>
        </div>
      </div>

      {/* ── 3. WORKSPACE & DRAFTS SECTION ── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace &amp; Drafts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage, edit, duplicate, or export your saved resume drafts</p>
            </div>
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
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 min-h-[36px] focus:outline-none"
              />
            </div>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl min-h-[36px] cursor-pointer"
            >
              <option value="updated">Last Edited</option>
              <option value="title">Title</option>
              <option value="completion">Completion %</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth pt-1">
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
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[32px] ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resumes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {filteredResumes.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {r.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                        {r.targetRole || 'Senior AI & Systems Engineer'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => handleTogglePin(r.id)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        r.isPinned ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' : 'hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      title="Pin resume"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleFavorite(r.id)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        r.isFavorite ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' : 'hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      title="Favorite"
                    >
                      <Star className={`w-3.5 h-3.5 ${r.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button className="p-1 rounded-lg hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      Ready ({r.completionPercentage}%)
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${r.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Bottom CTA Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => onEditResume(r)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-[36px]"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Continue Editing</span>
                </button>

                <button
                  onClick={() => handleDuplicate(r.id)}
                  className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
                  title="Duplicate Resume"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeleteConfirmId(r.id)}
                  className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                  title="Delete Resume"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. RECENT ACTIVITY LIST ── */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Activity className="w-4 h-4" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track your latest resume updates and actions</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {activityLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-3.5 px-4 flex items-center justify-between text-xs hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                {getActivityIcon(log.type)}
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {log.description}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-slate-400 font-mono text-[11px]">
                  {formatActivityTime(log.timestamp)}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
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
