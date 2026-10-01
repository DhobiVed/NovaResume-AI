import React, { useState } from 'react';
import {
  X, Briefcase, Plus, Search, ExternalLink, Trash2, Calendar
} from 'lucide-react';

export type JobStatus = 'Wishlist' | 'Applied' | 'Interview Scheduled' | 'Interview Completed' | 'Offer Received' | 'Rejected';

export interface JobApplication {
  id: string;
  company: string;
  title: string;
  date: string;
  status: JobStatus;
  interviewDate?: string;
  notes?: string;
  resumeVersion?: string;
  jobLink?: string;
  jobDescription?: string;
}

interface JobTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_APPLICATIONS: JobApplication[] = [
  {
    id: 'job_1',
    company: 'Google',
    title: 'Senior Software Engineer',
    date: '2026-07-28',
    status: 'Interview Scheduled',
    interviewDate: '2026-08-10',
    notes: 'Technical System Design round scheduled with Lead Architect.',
    resumeVersion: 'Software Eng v2',
    jobLink: 'https://careers.google.com'
  },
  {
    id: 'job_2',
    company: 'OpenAI',
    title: 'AI Systems Infrastructure Engineer',
    date: '2026-07-30',
    status: 'Applied',
    notes: 'Submitted via company portal with NovaResume PDF.',
    resumeVersion: 'AI Specialist v1',
    jobLink: 'https://openai.com/careers'
  },
  {
    id: 'job_3',
    company: 'Stripe',
    title: 'Backend Systems Engineer',
    date: '2026-07-15',
    status: 'Offer Received',
    notes: 'Offer package received. Reviewing compensation details.',
    resumeVersion: 'Executive Lead v1',
    jobLink: 'https://stripe.com/jobs'
  }
];

export const JobTrackerModal: React.FC<JobTrackerModalProps> = ({ isOpen, onClose }) => {
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem('nova_job_applications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_APPLICATIONS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newJob, setNewJob] = useState<Partial<JobApplication>>({
    company: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Applied',
    notes: '',
    jobLink: ''
  });

  if (!isOpen) return null;

  const saveApplicationsToStorage = (data: JobApplication[]) => {
    setApplications(data);
    try {
      localStorage.setItem('nova_job_applications', JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddJob = () => {
    if (!newJob.company || !newJob.title) return;
    const createdItem: JobApplication = {
      id: `job_${Date.now()}`,
      company: newJob.company,
      title: newJob.title,
      date: newJob.date || new Date().toISOString().split('T')[0],
      status: (newJob.status as JobStatus) || 'Applied',
      interviewDate: newJob.interviewDate,
      notes: newJob.notes,
      jobLink: newJob.jobLink
    };

    saveApplicationsToStorage([createdItem, ...applications]);
    setIsAddingNew(false);
    setNewJob({ company: '', title: '', date: new Date().toISOString().split('T')[0], status: 'Applied', notes: '', jobLink: '' });
  };

  const handleDeleteJob = (id: string) => {
    saveApplicationsToStorage(applications.filter(a => a.id !== id));
  };

  const handleStatusChange = (id: string, nextStatus: JobStatus) => {
    saveApplicationsToStorage(applications.map(a => a.id === id ? { ...a, status: nextStatus } : a));
  };

  // Filtered applications
  const filteredApps = applications.filter(a => {
    const matchesSearch = a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalApps = applications.length;
  const interviewsCount = applications.filter(a => a.status === 'Interview Scheduled' || a.status === 'Interview Completed').length;
  const offersCount = applications.filter(a => a.status === 'Offer Received').length;
  const conversionRate = totalApps > 0 ? Math.round((offersCount / totalApps) * 100) : 0;

  const STATUS_BADGES: Record<JobStatus, string> = {
    'Wishlist': 'bg-slate-100 text-slate-700 border-slate-200',
    'Applied': 'bg-blue-50 text-blue-700 border-blue-200',
    'Interview Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
    'Interview Completed': 'bg-teal-50 text-teal-700 border-teal-200',
    'Offer Received': 'bg-emerald-50 text-emerald-800 border-emerald-300 font-black',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-0 sm:p-4">
      <div className="glass-modal rounded-none sm:rounded-3xl w-full max-w-6xl shadow-2xl p-3 sm:p-6 relative flex flex-col h-full max-h-full sm:max-h-[94vh] overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header (Pinned Top) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800/70 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-2xl glass-emerald text-emerald-700 dark:text-emerald-300 shadow-xs flex-shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap leading-tight">
                <span>Job Application Tracker</span>
                <span className="px-2 py-0.5 rounded-full glass-emerald text-emerald-800 dark:text-emerald-300 text-[9px] font-extrabold uppercase">
                  {totalApps} Total
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-1">Track interviews, offers, and resume version usage</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0">
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 min-h-[40px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── UNIFIED SCROLLABLE MODAL BODY ── */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs custom-scrollbar">
          
          {/* Dashboard Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 sm:p-3 glass-card rounded-2xl">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-400 block truncate">Applications</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{totalApps}</div>
            </div>
            <div className="p-2.5 sm:p-3 glass-purple rounded-2xl">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 block truncate">Interviews</span>
              <div className="text-xl sm:text-2xl font-black text-purple-900 dark:text-purple-200">{interviewsCount}</div>
            </div>
            <div className="p-2.5 sm:p-3 glass-emerald rounded-2xl">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block truncate">Offers</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200">{offersCount}</div>
            </div>
            <div className="p-2.5 sm:p-3 glass-blue rounded-2xl">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300 block truncate">Offer Rate</span>
              <div className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-200">{conversionRate}%</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800/70">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company or job title..."
                className="w-full pl-9 pr-3 py-2 glass-input rounded-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto scrollbar-none py-0.5">
              {['All', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'glass-pill text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Add New Job Form Overlay */}
          {isAddingNew && (
            <div className="p-4 glass-card border-2 border-emerald-400/80 rounded-2xl space-y-3 text-xs shadow-lg animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-200/50 dark:border-emerald-800/50">
                <h3 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Add New Job Application</span>
                </h3>
                <button onClick={() => setIsAddingNew(false)} className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  placeholder="Company Name (e.g. Google)"
                  className="p-2.5 glass-input rounded-xl font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="Job Title (e.g. Software Engineer)"
                  className="p-2.5 glass-input rounded-xl font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <select
                  value={newJob.status}
                  onChange={(e) => setNewJob({ ...newJob, status: e.target.value as JobStatus })}
                  className="p-2.5 glass-input rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Wishlist">Wishlist</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interview Completed">Interview Completed</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={newJob.jobLink || ''}
                  onChange={(e) => setNewJob({ ...newJob, jobLink: e.target.value })}
                  placeholder="Job Posting URL (https://...)"
                  className="p-2.5 glass-input rounded-xl font-mono text-[11px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
                <input
                  type="text"
                  value={newJob.notes || ''}
                  onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                  placeholder="Notes / Interview Details"
                  className="p-2.5 glass-input rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Action Buttons — Stacked vertically on mobile, full width */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="w-full sm:w-auto px-5 py-2.5 glass-pill text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70 rounded-xl font-bold text-xs min-h-[44px] flex items-center justify-center cursor-pointer active:scale-95 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddJob}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <span>Save Job Application</span>
                </button>
              </div>
            </div>
          )}

          {/* Applications List Table / Grid */}
          <div className="space-y-2.5 pt-1">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold glass-card rounded-2xl">
                No job applications found matching filter. Click "Add Application" to track new roles.
              </div>
            ) : (
              filteredApps.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 sm:p-4 glass-card-interactive rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                >
                  <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{job.title}</h4>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">@ {job.company}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> Applied: {job.date}</span>
                      {job.interviewDate && <span className="text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-700 dark:text-slate-300" /> Interview: {job.interviewDate}</span>}
                      {job.resumeVersion && <span className="px-2 py-0.5 glass-pill rounded text-slate-700 dark:text-slate-300 font-mono text-[10px]">Resume: {job.resumeVersion}</span>}
                    </div>
                    {job.notes && <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">"{job.notes}"</p>}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/70 dark:border-slate-800/70">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value as JobStatus)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer ${STATUS_BADGES[job.status]}`}
                    >
                      <option value="Wishlist">Wishlist</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Interview Completed">Interview Completed</option>
                      <option value="Offer Received">Offer Received</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <div className="flex items-center gap-1.5">
                      {job.jobLink && (
                        <a
                          href={job.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 glass-pill rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-xs cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition"
                          title="Open Job Posting"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                        title="Delete Job Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer (Pinned Bottom) */}
        <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 glass-pill hover:bg-slate-200/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl min-h-[40px] cursor-pointer transition">
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
