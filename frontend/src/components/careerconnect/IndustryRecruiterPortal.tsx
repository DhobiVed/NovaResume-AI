import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Users, CheckCircle, X, Search, Briefcase,
  Building2, ShieldCheck, Link as LinkIcon,
  Image as ImageIcon, Trash2, Edit2, Send, ArrowUpRight,
  ExternalLink, Eye, Heart, MessageSquare, Share2, Bookmark,
  Loader2, Check, Sparkles, AlertCircle,
  BarChart3, Save
} from 'lucide-react';
import { careerConnectService } from '../../services/careerConnectService';
import { DirectMessagingView } from './DirectMessagingView';
import type {
  AuthUserSession,
  IndustryPostItem, IndustryPostType,
  StudentInternalProfile, CompanyProfileData,
  ApplicationItem
} from '../../types/careerConnect';

interface Props {
  activeSection?: string;
  onNavigateSection?: (section: string) => void;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const IndustryRecruiterPortal: React.FC<Props> = ({
  activeSection = 'dashboard',
  onNavigateSection
}) => {
  const [session, setSession] = useState<AuthUserSession | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'talent-search' | 'postings' | 'messages' | 'company-profile'>('dashboard');
  const [dashboardSubTab, setDashboardSubTab] = useState<'overview' | 'analytics'>('overview');

  // Posts & Real Engagement Telemetry
  const [recruiterPosts, setRecruiterPosts] = useState<IndustryPostItem[]>([]);
  // Real-time Applications Stream
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileData | null>(null);
  const [isSavingCompanyProfile, setIsSavingCompanyProfile] = useState(false);
  const [companyProfileSuccess, setCompanyProfileSuccess] = useState<string | null>(null);

  // Talent Discovery State
  const [discoveredStudents, setDiscoveredStudents] = useState<StudentInternalProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentInternalProfile | null>(null);
  const [isLoadingTalent, setIsLoadingTalent] = useState(false);
  const [talentSkillFilter, setTalentSkillFilter] = useState('All');
  const [talentDeptFilter, setTalentDeptFilter] = useState('All');
  const [talentSemFilter, setTalentSemFilter] = useState<number>(0);
  const [talentMinScoreFilter, setTalentMinScoreFilter] = useState<number>(0);
  const [talentSearchQuery, setTalentSearchQuery] = useState('');

  // Messaging Target
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string; role: string; companyOrDept?: string } | null>(null);

  const handleSelectTab = (tabKey: 'dashboard' | 'talent-search' | 'postings' | 'messages' | 'company-profile') => {
    setActiveTab(tabKey);
    if (onNavigateSection) {
      onNavigateSection(tabKey);
    }
  };

  const handleUpdateApplicantStatus = async (appId: string, status: any) => {
    try {
      await careerConnectService.updateApplicationStatus(appId, status);
      showToast(`Applicant status updated to ${status}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update applicant status');
    }
  };

  // ── SOCIAL-STYLE POST COMPOSER STATE ─────────────────────────────
  const [showPostingModal, setShowPostingModal] = useState(false);
  const [isComposerSubmitting, setIsComposerSubmitting] = useState(false);
  const [composerMessage, setComposerMessage] = useState('');
  const [composerImages, setComposerImages] = useState<string[]>([]);
  const [composerPostType, setComposerPostType] = useState<IndustryPostType>('Internship');
  const [composerDepartment, setComposerDepartment] = useState('All Departments');
  const [composerScope, setComposerScope] = useState<'All India' | 'State' | 'College'>('All India');
  const [composerSkills, setComposerSkills] = useState('Python, SQL, Git');
  const [composerAppMode, setComposerAppMode] = useState<'external' | 'internal'>('external');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const cur = careerConnectService.getCurrentSession();
    setSession(cur);
    const companyOrId = cur?.company || cur?.id || 'Google AI Labs';

    // 1. Real-time recruiter posts stream
    const unsubPosts = careerConnectService.subscribeRecruiterPosts(companyOrId, (posts) => {
      setRecruiterPosts(posts);
    });

    // 2. Real-time candidate applications stream
    const unsubApps = careerConnectService.subscribeRecruiterApplications(companyOrId, (apps) => {
      setApplications(apps);
    });

    return () => {
      unsubPosts();
      unsubApps();
    };
  }, []);


  useEffect(() => {
    if (activeSection === 'dashboard') {
      setActiveTab('dashboard');
      setDashboardSubTab('overview');
    } else if (['analytics', 'engagement-analytics'].includes(activeSection)) {
      setActiveTab('dashboard');
      setDashboardSubTab('analytics');
    } else if (['talent-search', 'talent-discovery', 'talent-analytics', 'students'].includes(activeSection)) {
      setActiveTab('talent-search');
    } else if (['postings', 'internships', 'post-opportunity', 'drives'].includes(activeSection)) {
      setActiveTab('postings');
      if (activeSection === 'post-opportunity') setShowPostingModal(true);
    } else if (['messages', 'direct-messages'].includes(activeSection)) {
      setActiveTab('messages');
    } else if (['company-profile', 'profile'].includes(activeSection)) {
      setActiveTab('company-profile');
    }
  }, [activeSection]);

  // Load company profile and talent discovery
  const loadCompanyData = async (compName: string) => {
    try {
      const cp = await careerConnectService.getCompanyProfile(compName);
      setCompanyProfile(cp);
    } catch (err) {
      console.warn('Failed to load company profile:', err);
    }
  };

  const searchTalent = async () => {
    setIsLoadingTalent(true);
    try {
      const list = await careerConnectService.searchTalentProfiles({
        skill: talentSkillFilter,
        department: talentDeptFilter,
        semester: talentSemFilter,
        minScore: talentMinScoreFilter,
        searchQuery: talentSearchQuery
      });
      setDiscoveredStudents(list);
    } catch (err) {
      console.warn('Failed to discover talent:', err);
    } finally {
      setIsLoadingTalent(false);
    }
  };

  useEffect(() => {
    const comp = session?.company || session?.id || 'Google AI Labs';
    loadCompanyData(comp);
    searchTalent();
  }, [session, talentSkillFilter, talentDeptFilter, talentSemFilter, talentMinScoreFilter, talentSearchQuery]);

  // ── IMAGE UPLOAD HANDLER (JPG, JPEG, PNG, WebP, JFIF, BMP with client-side compression) ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      for (const file of Array.from(files)) {
        const isImage = file.type.toLowerCase().startsWith('image/') || /\.(jpe?g|png|webp|jfif|pjpeg|bmp|gif)$/i.test(file.name);
        if (!isImage) {
          showToast(`Invalid format: ${file.name}. Please select a valid image (JPG, PNG, WebP).`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          showToast(`File too large: ${file.name}. Max size is 10MB.`);
          continue;
        }

        try {
          const uploadedUrl = await careerConnectService.uploadPostImage(file);
          if (uploadedUrl && uploadedUrl.length > 20) {
            setComposerImages(prev => [...prev, uploadedUrl]);
            showToast(`Attached poster: ${file.name}`);
          } else {
            showToast(`Could not process image "${file.name}".`);
          }
        } catch (err: any) {
          showToast(`Upload error for ${file.name}: ${err?.message || 'Processing failed'}`);
        }
      }
    } finally {
      setIsUploadingImages(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setComposerImages(prev => prev.filter((_, i) => i !== index));
  };

  // ── SOCIAL POST PUBLISH HANDLER ──────────────────────────────────
  const handlePublishPost = async () => {
    if (isUploadingImages) {
      showToast('Please wait for image attachment to complete before publishing.');
      return;
    }

    const msg = composerMessage.trim();
    if (!msg) {
      showToast('Please enter an announcement message');
      return;
    }

    setIsComposerSubmitting(true);
    try {
      const skillsArray = composerSkills.split(',').map(s => s.trim()).filter(Boolean);
      const detectedUrls = careerConnectService.extractUrls(msg);

      if (editingPostId) {
        await careerConnectService.updateIndustryPost(editingPostId, {
          message: msg,
          images: composerImages,
          post_type: composerPostType,
          target_department: composerDepartment,
          target_scope: composerScope,
          skills: skillsArray,
          application_mode: composerAppMode,
          primary_apply_url: detectedUrls[0] || ''
        });
        showToast('Industry post updated successfully!');
        setEditingPostId(null);
      } else {
        await careerConnectService.createIndustryPost({
          company_name: session?.company || 'Google AI Labs',
          author_id: session?.id || 'demo-industry-1',
          author_name: session?.full_name || 'Priya Patel',
          message: msg,
          images: composerImages,
          post_type: composerPostType,
          target_department: composerDepartment,
          target_scope: composerScope,
          skills: skillsArray,
          application_mode: composerAppMode,
          primary_apply_url: detectedUrls[0] || ''
        });
        showToast('Industry announcement published to student feed successfully!');
      }

      // Reset composer
      setComposerMessage('');
      setComposerImages([]);
      setShowPostingModal(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to publish post');
    } finally {
      setIsComposerSubmitting(false);
    }
  };

  const handleEditPost = (post: IndustryPostItem) => {
    setEditingPostId(post.id);
    setComposerMessage(post.message);
    setComposerImages(post.images || []);
    setComposerPostType(post.post_type);
    setComposerDepartment(post.target_department || 'All Departments');
    setComposerScope((post.target_scope as any) || 'All India');
    setComposerSkills((post.skills || []).join(', '));
    setComposerAppMode(post.application_mode);
    setShowPostingModal(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? It will also be removed from the student feed.')) return;
    await careerConnectService.deleteIndustryPost(postId);
    showToast('Post removed successfully');
  };

  // Derived Real Social Engagement Metrics (Strictly Real Firebase Data)
  const socialMetrics = useMemo(() => {
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalSaves = 0;
    let totalExternalClicks = 0;

    recruiterPosts.forEach(p => {
      totalViews += (p.views_count || 0);
      totalLikes += (p.likes_count || 0);
      totalComments += (p.comments_count || 0);
      totalShares += (p.shares_count || 0);
      totalSaves += (p.saves_count || 0);
      totalExternalClicks += (p.external_clicks_count || 0);
    });

    const totalEngagements = totalLikes + totalComments + totalShares + totalSaves + totalExternalClicks;
    const engagementRate = totalViews > 0
      ? ((totalEngagements / totalViews) * 100).toFixed(1)
      : '0.0';

    return {
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      totalExternalClicks,
      totalEngagements,
      engagementRate
    };
  }, [recruiterPosts]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-xl flex items-center gap-3 animate-slideIn text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER BANNER ────────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-cyan-900 text-[10px] font-mono font-bold border border-slate-200/90">
              RECRUITER WORKSPACE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Enterprise Account
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {session?.company || 'Google AI Labs'}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Campus Collaboration & University Talent Acquisition Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 text-center shadow-2xs">
            <div className="text-xl font-bold text-slate-900">{recruiterPosts.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Published Posts</div>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 text-center shadow-2xs">
            <div className="text-xl font-bold text-indigo-600">{applications.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Applications</div>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 text-center shadow-2xs">
            <div className="text-xl font-bold text-amber-600">{socialMetrics.totalExternalClicks}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">External Clicks</div>
          </div>

          <button
            onClick={() => {
              setEditingPostId(null);
              setComposerMessage('');
              setComposerImages([]);
              setShowPostingModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition border border-slate-200/90 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Industry Post</span>
          </button>
        </div>
      </div>

      {/* ── NAVIGATION TABS (5 Streamlined Hubs) ──────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: Building2 },
          { key: 'talent-search', label: `Talent Discovery (${discoveredStudents.length})`, icon: Users },
          { key: 'postings', label: `Postings & Opportunities (${recruiterPosts.length})`, icon: Briefcase },
          { key: 'messages', label: 'Direct Messages', icon: MessageSquare },
          { key: 'company-profile', label: 'Company Profile', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleSelectTab(tab.key as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: COMPANY OVERVIEW & TELEMETRY DASHBOARD ─────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Sub-nav pills */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/80">
            <button
              onClick={() => setDashboardSubTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                dashboardSubTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Overview & Applications
            </button>
            <button
              onClick={() => setDashboardSubTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                dashboardSubTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              Live Engagement Telemetry
            </button>
          </div>

          {dashboardSubTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Published Posts & Announcements</div>
                  <div className="text-3xl font-black text-slate-900 mt-2">{recruiterPosts.length}</div>
                  <div className="text-xs text-slate-500 mt-1">Live on Student Industry Feed</div>
                </div>

                <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">External Link Clicks</div>
              <div className="text-3xl font-black text-amber-700 mt-2">{socialMetrics.totalExternalClicks}</div>
              <div className="text-xs text-slate-500 mt-1">Students navigated to official application portal</div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase">Discovered Talent Pool</div>
              <div className="text-3xl font-black text-purple-700 mt-2">{discoveredStudents.length}</div>
              <div className="text-xs text-slate-500 mt-1">Verified student profiles ready for direct messaging</div>
            </div>
          </div>

          {/* ── REAL POST ENGAGEMENT & REACH ANALYTICS ── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-amber-900 text-[10px] font-mono font-bold border border-slate-200/90">
                  REAL-TIME ENGAGEMENT TELEMETRY
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Post Performance & Student Engagement
                </h3>
                <p className="text-xs text-slate-500">
                  Authoritative metrics aggregated from Firestore subcollections and impression observers.
                </p>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/90 text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Engagement Rate</span>
                <span className="text-xl font-black text-amber-900">{socialMetrics.engagementRate}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Total Views</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">{socialMetrics.totalViews}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dwell impressions</div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Total Likes</span>
                </div>
                <div className="text-2xl font-black text-rose-900 mt-1">{socialMetrics.totalLikes}</div>
                <div className="text-[10px] text-rose-600/80 mt-0.5">Student endorsements</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Comments</span>
                </div>
                <div className="text-2xl font-black text-amber-900 mt-1">{socialMetrics.totalComments}</div>
                <div className="text-[10px] text-amber-700/80 mt-0.5">Interactive queries</div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Shares</span>
                </div>
                <div className="text-2xl font-black text-blue-900 mt-1">{socialMetrics.totalShares}</div>
                <div className="text-[10px] text-blue-600/80 mt-0.5">Link copies & shares</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saves</span>
                </div>
                <div className="text-2xl font-black text-emerald-900 mt-1">{socialMetrics.totalSaves}</div>
                <div className="text-[10px] text-emerald-700/80 mt-0.5">Bookmarked by students</div>
              </div>
            </div>
          </div>

          {/* ── REAL-TIME CANDIDATE APPLICATION PIPELINE ── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200/60">
                  REAL-TIME CANDIDATE PIPELINE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Received Student Applications ({applications.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Live Firestore stream of students who applied to your campus roles. Review and take immediate action.
                </p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                No candidate applications received yet. Posts published to the Student Industry Feed will appear here automatically.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="pb-2.5">Candidate</th>
                      <th className="pb-2.5">Department / College</th>
                      <th className="pb-2.5">Role Applied</th>
                      <th className="pb-2.5">Verified Score</th>
                      <th className="pb-2.5">Current Status</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.slice(0, 8).map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{app.student_name}</div>
                          <div className="text-[10px] text-slate-500">{app.student_email}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-slate-700 font-medium">{app.student_department}</div>
                          <div className="text-[10px] text-slate-400">Sem {app.student_semester} • CGPA {app.student_cgpa}</div>
                        </td>
                        <td className="py-3 text-slate-800 font-medium truncate max-w-[160px]">{app.title}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-200/60">
                            {app.verified_score}% Verified
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            app.status === 'Selected' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            app.status === 'Shortlisted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            app.status === 'Interview' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Shortlisted')}
                              className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Shortlist Candidate"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Interview')}
                              className="px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Invite to Interview"
                            >
                              Interview
                            </button>
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Selected')}
                              className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Select Candidate"
                            >
                              Select
                            </button>
                            <button
                              onClick={() => handleUpdateApplicantStatus(app.id, 'Rejected')}
                              className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition-colors cursor-pointer"
                              title="Reject Candidate"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Social-Style Quick Post Banner */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-900 font-black">
                {(session?.company || 'Google AI Labs').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Create Industry Announcement or Opening</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Compose a natural post, attach hiring posters, and include any application link (Google Form, ATS, or portal).
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingPostId(null);
                setComposerMessage('');
                setComposerImages([]);
                setShowPostingModal(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs cursor-pointer flex items-center gap-1.5 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compose Post</span>
            </button>
          </div>
            </div>
          )}

          {dashboardSubTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                <h2 className="text-base font-black text-slate-900 mb-1">
                  Real Engagement & Telemetry Analytics
                </h2>
                <p className="text-xs text-slate-600">
                  Live interaction metrics across all published opportunities. Backed by genuine Firestore events with strict zero mock data.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
                  <div className="text-2xl font-black text-slate-900">{socialMetrics.totalViews}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Total Views</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
                  <div className="text-2xl font-black text-rose-600">{socialMetrics.totalLikes}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Likes</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
                  <div className="text-2xl font-black text-amber-700">{socialMetrics.totalComments}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Comments</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
                  <div className="text-2xl font-black text-blue-600">{socialMetrics.totalShares}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Shares</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
                  <div className="text-2xl font-black text-emerald-600">{socialMetrics.totalSaves}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Saves</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs text-center">
                  <div className="text-2xl font-black text-purple-700">{socialMetrics.totalExternalClicks}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">External Clicks</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY POSTINGS & ANNOUNCEMENTS ─────────────────────── */}
      {activeTab === 'postings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                My Published Posts ({recruiterPosts.length})
              </h2>
              <p className="text-xs text-slate-500">
                Announcements and opportunities visible on the Student Industry Feed.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPostId(null);
                setComposerMessage('');
                setComposerImages([]);
                setShowPostingModal(true);
              }}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer shadow-2xs border border-slate-200/90 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Post</span>
            </button>
          </div>

          {recruiterPosts.length > 0 ? (
            <div className="space-y-4">
              {recruiterPosts.map(post => (
                <div key={post.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-900 font-black text-xs flex-shrink-0">
                        {post.company_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{post.company_name}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {post.post_type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Target: <strong className="text-slate-700">{post.target_department || 'All Departments'}</strong> • {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-amber-900 border border-slate-200/90 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="text-xs md:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {post.message}
                  </div>

                  {/* Attached Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {post.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Poster attachment"
                          className="w-full h-28 object-contain rounded-xl border border-slate-200/90 bg-slate-50"
                        />
                      ))}
                    </div>
                  )}

                  {/* Detected Links */}
                  {post.primary_apply_url && (
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between gap-2">
                      <span className="text-amber-900 font-bold truncate flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                        <span>Application Link: {post.primary_apply_url}</span>
                      </span>
                      <a
                        href={post.primary_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-900 hover:text-amber-700 underline font-black flex items-center gap-1 flex-shrink-0"
                      >
                        <span>Test Link</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* ── REAL-TIME ENGAGEMENT STATS TELEMETRY ── */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-slate-700 font-bold">
                      <span className="flex items-center gap-1.5" title="Real views tracked via IntersectionObserver">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.views_count || 0} Views</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>{post.likes_count || 0} Likes</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>{post.comments_count || 0} Comments</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{post.shares_count || 0} Shares</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{post.saves_count || 0} Saves</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
                        <span>{post.external_clicks_count || 0} External Link Clicks</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">
                        Rate: <strong className="text-slate-900">{post.views_count ? ((((post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0) + (post.saves_count || 0)) / post.views_count) * 100).toFixed(1) : '0.0'}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Footer status & action */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-emerald-600" />
                        <span>External Registration / Application Model</span>
                      </span>
                    </div>

                    {post.primary_apply_url && (
                      <a
                        href={post.primary_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Application Link</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center mx-auto text-amber-800">
                <Briefcase className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                No Industry Posts Published Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Publish announcements, internships, recruitment drives, or workshops using the flexible composer. Posts appear directly on the Student Industry Feed.
              </p>
              <button
                onClick={() => {
                  setEditingPostId(null);
                  setComposerMessage('');
                  setComposerImages([]);
                  setShowPostingModal(true);
                }}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs border border-slate-200/90 cursor-pointer"
              >
                + Create First Post
              </button>
            </div>
          )}
        </div>
      )}

            {/* ── TAB: COMPANY PROFILE ───────────────────────────────────── */}
      {activeTab === 'company-profile' && companyProfile && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200/90">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-900 font-black text-lg">
                {companyProfile.company_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>{companyProfile.company_name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    Verified Partner
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">{companyProfile.industry}</p>
              </div>
            </div>

            <button
              onClick={async () => {
                setIsSavingCompanyProfile(true);
                try {
                  await careerConnectService.saveCompanyProfile(companyProfile.company_name, companyProfile);
                  setCompanyProfileSuccess('Company profile saved to database!');
                  setTimeout(() => setCompanyProfileSuccess(null), 3000);
                } catch (err) {
                  showToast('Failed to save company profile');
                } finally {
                  setIsSavingCompanyProfile(false);
                }
              }}
              disabled={isSavingCompanyProfile}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingCompanyProfile ? 'Saving...' : 'Save Company Profile'}</span>
            </button>
          </div>

          {companyProfileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{companyProfileSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                value={companyProfile.company_name}
                onChange={e => setCompanyProfile({ ...companyProfile, company_name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/90 text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Industry Sector</label>
              <input
                type="text"
                value={companyProfile.industry}
                onChange={e => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/90 text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Careers / Company Website</label>
              <input
                type="text"
                value={companyProfile.website}
                onChange={e => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/90 text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Company Size</label>
              <input
                type="text"
                value={companyProfile.company_size || ''}
                onChange={e => setCompanyProfile({ ...companyProfile, company_size: e.target.value })}
                placeholder="e.g. 500-1000 employees"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/90 text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Recruiter Contact Person</label>
              <input
                type="text"
                value={companyProfile.contact_person || ''}
                onChange={e => setCompanyProfile({ ...companyProfile, contact_person: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/90 text-slate-900 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Official Contact Email</label>
              <input
                type="email"
                value={companyProfile.contact_email || ''}
                onChange={e => setCompanyProfile({ ...companyProfile, contact_email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/90 text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">About Company & Campus Collaborations</label>
            <textarea
              rows={4}
              value={companyProfile.about}
              onChange={e => setCompanyProfile({ ...companyProfile, about: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/90 text-slate-900 leading-relaxed font-normal"
            />
          </div>
        </div>
      )}

      {/* ── TAB: TALENT DISCOVERY ───────────────────────────────────── */}
      {activeTab === 'talent-search' && (
        <div className="space-y-6">
          {/* Discovery Filters Bar */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={talentSearchQuery}
                  onChange={e => setTalentSearchQuery(e.target.value)}
                  placeholder="Search students by skill, name or college..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={talentSkillFilter}
                  onChange={e => setTalentSkillFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200/90 text-slate-800 cursor-pointer"
                >
                  <option value="All">All Disciplines & Skills</option>
                  <optgroup label="Mechanical">
                    <option value="SolidWorks">SolidWorks</option>
                    <option value="GD&T">GD&T</option>
                    <option value="CNC Machining">CNC Machining</option>
                    <option value="AutoCAD (Mechanical)">AutoCAD (Mechanical)</option>
                  </optgroup>
                  <optgroup label="Civil">
                    <option value="AutoCAD (Civil)">AutoCAD (Civil)</option>
                    <option value="Autodesk Revit">Autodesk Revit & BIM</option>
                    <option value="STAAD.Pro">STAAD.Pro</option>
                    <option value="Surveying">Surveying & Total Station</option>
                  </optgroup>
                  <optgroup label="Electrical & ECE">
                    <option value="PLC Programming">PLC Programming</option>
                    <option value="SCADA & HMI">SCADA & HMI</option>
                    <option value="MATLAB">MATLAB & Simulink</option>
                    <option value="Embedded C">Embedded C</option>
                    <option value="Verilog HDL">Verilog HDL</option>
                    <option value="PCB Design">PCB Design</option>
                  </optgroup>
                  <optgroup label="Computer Science & IT">
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="SQL">SQL</option>
                    <option value="C++">C++</option>
                    <option value="Data Structures">Data Structures</option>
                  </optgroup>
                </select>

                <select
                  value={talentDeptFilter}
                  onChange={e => setTalentDeptFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200/90 text-slate-800 cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Chemical Engineering">Chemical Engineering</option>
                  <option value="Management & Commerce">Management & Commerce</option>
                </select>

                <select
                  value={talentSemFilter}
                  onChange={e => setTalentSemFilter(Number(e.target.value))}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200/90 text-slate-800 cursor-pointer"
                >
                  <option value={0}>All Semesters</option>
                  <option value={6}>Sem 6</option>
                  <option value={7}>Sem 7</option>
                  <option value={8}>Sem 8</option>
                </select>

                <select
                  value={talentMinScoreFilter}
                  onChange={e => setTalentMinScoreFilter(Number(e.target.value))}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200/90 text-slate-800 cursor-pointer"
                >
                  <option value={0}>Any Score</option>
                  <option value={75}>Min 75% Verified</option>
                  <option value={85}>Min 85% Verified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          {isLoadingTalent ? (
            <div className="p-12 text-center text-xs font-bold text-slate-400">
              Searching verified student candidate pool...
            </div>
          ) : discoveredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoveredStudents.map(student => (
                <div
                  key={student.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{student.full_name}</h4>
                          <p className="text-[11px] text-slate-500">{student.department} • Sem {student.semester}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        CGPA {student.cgpa}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {student.headline || student.bio}
                    </p>

                    {/* Data-driven Strengths */}
                    {student.data_driven_strengths && student.data_driven_strengths.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Verified Strengths
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {student.data_driven_strengths.slice(0, 2).map((str, si) => (
                            <span
                              key={si}
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 text-[10px] font-bold border border-emerald-200 flex items-center gap-1"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{str}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Skills */}
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 4).map((sk, ski) => (
                        <span key={ski} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {sk.skill_name} {sk.test_score ? `(${sk.test_score}%)` : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions: View Profile & Direct Message */}
                  <div className="pt-3 border-t border-slate-200/90 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 text-xs font-bold cursor-pointer"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setMessagingTarget({
                          id: student.student_id || student.id,
                          name: student.full_name,
                          role: 'student',
                          companyOrDept: student.department
                        });
                        setActiveTab('messages');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                No Candidate Profiles Matched
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try loosening your filters or search keywords to discover candidates.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: DIRECT MESSAGES ────────────────────────────────────── */}
      {activeTab === 'messages' && session && (
        <div className="h-[750px]">
          <DirectMessagingView
            session={session}
            targetUser={messagingTarget}
            onClearTarget={() => setMessagingTarget(null)}
          />
        </div>
      )}


      {/* ── MODAL: CREATE / EDIT INDUSTRY POST (SOCIAL COMPOSER) ───── */}
      {showPostingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-200/90 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-900 font-black">
                  {(session?.company || 'Google AI Labs').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingPostId ? 'Edit Industry Announcement' : 'Create Industry Post'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Post to student feeds across participating colleges, departments, and regional pools.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPostingModal(false);
                  setEditingPostId(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Message Box (Freely write announcements, internships, jobs, placement drives, paste links) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Announcement Message (Write freely — paste any application link or Google Form directly) *
              </label>
              <textarea
                rows={6}
                value={composerMessage}
                onChange={e => setComposerMessage(e.target.value)}
                placeholder={`Write an industry announcement, internship opening, placement drive, skill requirement, or workshop details...\n\nExample:\nWe are hiring Computer Engineering students for our Summer Software Engineering Internship.\n\nStudents with Python, SQL and Git knowledge are preferred.\n\nApplications are open until 25 September.\nApply using: https://example-company.com/apply`}
                className="w-full p-4 text-xs md:text-sm rounded-2xl border border-slate-200/90 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 leading-relaxed placeholder-slate-400"
              />
            </div>

            {/* Live Detected URLs Pill */}
            {careerConnectService.extractUrls(composerMessage).length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
                  <span>Detected Clickable Link(s) in Message:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {careerConnectService.extractUrls(composerMessage).map((u, i) => (
                    <a
                      key={i}
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-950 text-xs font-semibold underline flex items-center gap-1 hover:bg-amber-100"
                    >
                      <span>{u}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Image Attachments & Real Previews (JPG, PNG, WebP) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span>Attached Posters / Images (JPG, PNG, WebP)</span>
                </label>
                <button
                  type="button"
                  disabled={isUploadingImages}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-amber-900 text-xs font-bold border border-slate-200/90 flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isUploadingImages ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compressing & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Poster / Image</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {composerImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                  {composerImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200/90 group bg-white">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-28 object-contain" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-md"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center rounded-2xl border border-dashed border-slate-200/90 text-[11px] text-slate-400">
                  No poster attached yet. Attach your hiring poster, drive banner, or workshop flyer.
                </div>
              )}
            </div>

            {/* Optional Metadata Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Optional Post Discovery Metadata
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Post Type</label>
                  <select
                    value={composerPostType}
                    onChange={e => setComposerPostType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200/90 bg-white cursor-pointer"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Job">Job / Placement</option>
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Industry Project">Industry Project</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Event">Event</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Department</label>
                  <select
                    value={composerDepartment}
                    onChange={e => setComposerDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200/90 bg-white cursor-pointer"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Management & Commerce">Management & Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Application Channel</label>
                  <select
                    value={composerAppMode}
                    onChange={e => setComposerAppMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200/90 bg-white cursor-pointer"
                  >
                    <option value="external">External Link in Message</option>
                    <option value="internal">Nova Internal Applications</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Relevant Skills (Optional, comma-separated e.g. Python, SQL, Git)
                </label>
                <input
                  type="text"
                  value={composerSkills}
                  onChange={e => setComposerSkills(e.target.value)}
                  placeholder="e.g. Python, SQL, Docker, React"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/90 bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPostingModal(false);
                  setEditingPostId(null);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isComposerSubmitting || isUploadingImages}
                onClick={handlePublishPost}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors border border-slate-200/90 shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isComposerSubmitting || isUploadingImages ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isUploadingImages
                    ? 'Processing Image...'
                    : isComposerSubmitting
                    ? 'Publishing...'
                    : editingPostId
                    ? 'Save Changes'
                    : 'Publish Announcement'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: STUDENT INTERNAL PROFESSIONAL PROFILE ──────────── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/90">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-900 text-white font-bold text-base flex items-center justify-center shadow-xs">
                  {selectedStudent.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedStudent.full_name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedStudent.college} • {selectedStudent.department} (Sem {selectedStudent.semester})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Headline & Academic Snapshot */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="text-xs font-bold text-slate-800">{selectedStudent.headline}</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div>CGPA: <strong>{selectedStudent.cgpa}</strong></div>
                <div>Graduation: <strong>{selectedStudent.graduation_year}</strong></div>
                <div>Location: <strong>{selectedStudent.location}</strong></div>
                <div>Status: <strong className="text-emerald-700">Verified</strong></div>
              </div>
            </div>

            {/* Data-Driven Strengths & Weaknesses */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Data-Driven Assessment Insights
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Verified Strengths</span>
                  </div>
                  {selectedStudent.data_driven_strengths.map((s, idx) => (
                    <div key={idx} className="text-xs text-emerald-800 font-semibold">• {s}</div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Growth / Focus Areas</span>
                  </div>
                  {selectedStudent.data_driven_weaknesses.map((w, idx) => (
                    <div key={idx} className="text-xs text-amber-800 font-semibold">• {w}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Engineering Projects */}
            {selectedStudent.projects && selectedStudent.projects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Engineering Projects
                </h4>
                <div className="space-y-2">
                  {selectedStudent.projects.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{p.title}</span>
                        <div className="flex items-center gap-2">
                          {p.github_url && (
                            <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 text-xs font-bold underline flex items-center gap-0.5">
                              <GithubIcon className="w-3 h-3" /> Code
                            </a>
                          )}
                          {p.live_url && (
                            <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-900 text-xs font-bold underline flex items-center gap-0.5">
                              <ArrowUpRight className="w-3 h-3" /> Live
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-200/90 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Connect directly with this candidate
              </span>
              <button
                onClick={() => {
                  setMessagingTarget({
                    id: selectedStudent.student_id || selectedStudent.id,
                    name: selectedStudent.full_name,
                    role: 'student',
                    companyOrDept: selectedStudent.department
                  });
                  setSelectedStudent(null);
                  setActiveTab('messages');
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Start Direct Conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
