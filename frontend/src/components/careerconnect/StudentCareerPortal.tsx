import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Sparkles, Target, Check, X, Search,
  Briefcase, Play, Clock,
  ExternalLink, Edit3, AlertTriangle, AlertCircle,
  ShieldAlert, CheckCircle2, Radio, Code2, FileText
} from 'lucide-react';
import { careerConnectService } from '../../services/careerConnectService';
import { CAREER_ROLES } from '../../data/careerRolesData';
import { IndustryFeedView } from './IndustryFeedView';
import { DirectMessagingView } from './DirectMessagingView';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { CareerRolesView } from './CareerRolesView';
import { CertificatesView } from './CertificatesView';
import { BookOpen, Layers, Award, Lock } from 'lucide-react';
import type {
  StudentSkillItem, SkillGapAnalysis, OpportunityItem, ExplainableMatchResult,
  GeneratedAssessmentTest,
  AssessmentReport, TestAntiCheatingViolation, AuthUserSession,
  StudentInternalProfile, StudentProjectItem, IndustryPostItem,
  ApplicationItem
} from '../../types/careerConnect';
import {
  User, Bookmark, MessageSquare, ArrowUpRight, Globe,
  Plus, CheckCircle, Upload, Trash2, MapPin, Calendar, GraduationCap, BarChart2, Compass, HelpCircle
} from 'lucide-react';

interface Props {
  activeSection?: string;
  onNavigateSection?: (section: string) => void;
  onOpenResumeBuilder?: () => void;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const cleanQuestionText = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(/^\[(?:Concept|Case|Test|Topic|Q)\s*#?\d+\]\s*/i, '')
    .replace(/\s*\[Module:[^\]]+\]\s*$/i, '')
    .replace(/\s*\[Topic:[^\]]+\]\s*$/i, '')
    .trim();
};

const ALL_50_PROGRAMMING_LANGUAGES = new Set([
  'java', 'python', 'javascript', 'js', 'cpp', 'c++', 'csharp', 'c#', 'sql', 'typescript', 'ts', 'golang', 'go',
  'rust', 'c', 'php', 'html', 'css', 'kotlin', 'swift', 'dart', 'bash', 'powershell', 'ruby', 'scala', 'r',
  'assembly', 'asm', 'solidity', 'lua', 'perl', 'julia', 'objective-c', 'groovy', 'matlab', 'visual-basic',
  'vb', 'zig', 'fortran', 'plsql', 'pl/sql', 'tsql', 't-sql', 'cuda', 'haskell', 'erlang', 'elixir',
  'fsharp', 'f#', 'clojure', 'lisp', 'prolog', 'ada', 'cobol', 'crystal', 'nim', 'v', 'ocaml', 'd', 'apex'
]);

export const StudentCareerPortal: React.FC<Props> = ({
  activeSection = 'dashboard',
  onNavigateSection,
  onOpenResumeBuilder
}) => {
  // Session & Academic Profile State
  const [session, setSession] = useState<AuthUserSession | null>(null);
  const [currentSemester, setCurrentSemester] = useState<number>(6);
  const [department, setDepartment] = useState<string>('Computer Engineering');
  const [institution, setInstitution] = useState<string>('Government Engineering College, Modasa (GEC Modasa)');
  const [cgpa, setCgpa] = useState<string>('8.8');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<{
    full_name: string;
    headline: string;
    bio: string;
    target_role: string;
    profile_photo: string;
    degree: string;
    college: string;
    department: string;
    semester: number;
    cgpa: string;
    phone: string;
    email: string;
    location: string;
    github: string;
    linkedin: string;
    website: string;
    discipline?: string;
    cad_portfolio?: string;
    research_gate?: string;
  }>({
    full_name: '',
    headline: '',
    bio: '',
    target_role: '',
    profile_photo: '',
    degree: '',
    college: '',
    department: '',
    semester: 6,
    cgpa: '',
    phone: '',
    email: '',
    location: '',
    github: '',
    linkedin: '',
    website: '',
    discipline: 'Mechanical Engineering',
    cad_portfolio: '',
    research_gate: ''
  });

  const openEditProfileModal = () => {
    if (internalProfile) {
      setEditProfileData({
        full_name: internalProfile.full_name || session?.full_name || '',
        headline: internalProfile.headline || '',
        bio: internalProfile.bio || '',
        target_role: internalProfile.target_role || targetRole || CAREER_ROLES[0].title,
        profile_photo: internalProfile.profile_photo || '',
        degree: internalProfile.degree || 'B.Tech in Computer Engineering',
        college: internalProfile.college || institution || '',
        department: internalProfile.department || department || 'Computer Engineering',
        semester: internalProfile.semester || currentSemester || 6,
        cgpa: internalProfile.cgpa || cgpa || '8.8',
        phone: internalProfile.phone || '',
        email: internalProfile.email || session?.email || '',
        location: internalProfile.location || 'Gujarat, India',
        github: internalProfile.portfolio_links?.github || '',
        linkedin: internalProfile.portfolio_links?.linkedin || '',
        website: internalProfile.portfolio_links?.website || '',
        discipline: internalProfile.discipline || internalProfile.department || 'Mechanical Engineering',
        cad_portfolio: internalProfile.portfolio_links?.cad_portfolio || '',
        research_gate: internalProfile.portfolio_links?.research_gate || ''
      });
    } else {
      setEditProfileData({
        full_name: session?.full_name || 'Ved Dhobi',
        headline: 'Full Stack & AI Engineer | B.Tech Computer Engineering',
        bio: 'Aspiring Software & AI Engineer passionate about building real-time distributed systems and AI applications.',
        target_role: targetRole || CAREER_ROLES[0].title,
        profile_photo: '',
        degree: 'B.Tech in Computer Engineering',
        college: institution || 'Government Engineering College, Modasa (GEC Modasa)',
        department: department || 'Computer Engineering',
        semester: currentSemester || 6,
        cgpa: cgpa || '8.8',
        phone: '+91 98765 43210',
        email: session?.email || 'student@novaconnect.edu',
        location: 'Gujarat, India',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        website: ''
      });
    }
    setIsEditProfileModalOpen(true);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo size exceeds 2MB limit. Please select an image under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditProfileData(prev => ({ ...prev, profile_photo: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Core Data State
  const [skills, setSkills] = useState<StudentSkillItem[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [myApplications, setMyApplications] = useState<ApplicationItem[]>([]);
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis | null>(null);
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [selectedMatch, setSelectedMatch] = useState<{ opp: OpportunityItem; match: ExplainableMatchResult } | null>(null);

  // Unified Navigation & Sub-Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'learning' | 'assessments' | 'opportunities' | 'messages' | 'profile' | 'internal-profile' | 'feed' | 'assessment' | 'skills' | 'saved-opps' | 'knowledge-base' | 'career-roles' | 'certificates'>('dashboard');
  const [learningSubTab, setLearningSubTab] = useState<'languages' | 'roadmaps' | 'skill-gap'>('languages');
  const [assessmentSubTab, setAssessmentSubTab] = useState<'tests' | 'certificates'>('tests');
  const [opportunitySubTab, setOpportunitySubTab] = useState<'jobs' | 'feed' | 'saved'>('jobs');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('All');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('All');
  const [selectedDurationMins, setSelectedDurationMins] = useState<number>(45);

  const handleNavigateTab = (tabKey: any) => {
    if (['learning', 'knowledge-base', 'learn', 'knowledge', 'modules'].includes(tabKey)) {
      setActiveTab('learning');
      setLearningSubTab('languages');
      if (onNavigateSection) onNavigateSection('learning');
    } else if (['career-roles', 'roles', 'roadmaps'].includes(tabKey)) {
      setActiveTab('learning');
      setLearningSubTab('roadmaps');
      if (onNavigateSection) onNavigateSection('learning');
    } else if (['skills', 'skill-gap'].includes(tabKey)) {
      setActiveTab('learning');
      setLearningSubTab('skill-gap');
      if (onNavigateSection) onNavigateSection('learning');
    } else if (['assessments', 'assessment'].includes(tabKey)) {
      setActiveTab('assessments');
      setAssessmentSubTab('tests');
      if (onNavigateSection) onNavigateSection('assessments');
    } else if (['certificates', 'credentials', 'cert'].includes(tabKey)) {
      setActiveTab('assessments');
      setAssessmentSubTab('certificates');
      if (onNavigateSection) onNavigateSection('assessments');
    } else if (['opportunities', 'internships', 'jobs'].includes(tabKey)) {
      setActiveTab('opportunities');
      setOpportunitySubTab('jobs');
      if (onNavigateSection) onNavigateSection('opportunities');
    } else if (['feed', 'industry-feed', 'industry_feed'].includes(tabKey)) {
      setActiveTab('opportunities');
      setOpportunitySubTab('feed');
      if (onNavigateSection) onNavigateSection('opportunities');
    } else if (['saved-opps', 'saved', 'bookmarks'].includes(tabKey)) {
      setActiveTab('opportunities');
      setOpportunitySubTab('saved');
      if (onNavigateSection) onNavigateSection('opportunities');
    } else if (['profile', 'internal-profile'].includes(tabKey)) {
      setActiveTab('profile');
      if (onNavigateSection) onNavigateSection('profile');
    } else {
      setActiveTab(tabKey);
      if (onNavigateSection) onNavigateSection(tabKey);
    }
  };

  // Internal Profile & Saved Opportunities State
  const [internalProfile, setInternalProfile] = useState<StudentInternalProfile | null>(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<IndustryPostItem[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [newProject, setNewProject] = useState<Partial<StudentProjectItem>>({});
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [messagingTarget, setMessagingTarget] = useState<{ id: string; name: string; role: string; companyOrDept?: string } | null>(null);

  const [selectedDomainId, setSelectedDomainId] = useState<string>('mechanical');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('solidworks');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('SolidWorks');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Industry' | 'Mixed'>('Mixed');
  const [activeTest, setActiveTest] = useState<GeneratedAssessmentTest | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(45 * 60);
  const [isTestSubmitting, setIsTestSubmitting] = useState(false);
  const [latestReport, setLatestReport] = useState<AssessmentReport | null>(null);
  const [showHintFor, setShowHintFor] = useState<Record<string, boolean>>({});
  const [completedExamQuestions, setCompletedExamQuestions] = useState<any[]>([]);
  const [completedExamAnswers, setCompletedExamAnswers] = useState<Record<string, number>>({});
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentReport[]>([]);
  const [antiCheatingViolations, setAntiCheatingViolations] = useState<TestAntiCheatingViolation[]>([]);
  const [antiCheatingToast, setAntiCheatingToast] = useState<string | null>(null);

  // Search & Filters
  const [oppSearchFilter, setOppSearchFilter] = useState('');
  const [oppTypeFilter, setOppTypeFilter] = useState<'All' | 'Internship' | 'Job' | 'Live Project'>('All');

  // Load Initial Data & Real-time Continuous Subscriptions
  useEffect(() => {
    const curSession = careerConnectService.getCurrentSession();
    setSession(curSession);
    if (curSession) {
      if (curSession.department) setDepartment(curSession.department);
      if (curSession.institution) setInstitution(curSession.institution);
      if (curSession.cgpa) setCgpa(curSession.cgpa);
    }
    const studentId = curSession?.id || 'demo-student-1';

    // 1. Real-time verified skills subscription
    const unsubSkills = careerConnectService.subscribeStudentSkills(studentId, (sk) => {
      setSkills(sk);
    });

    // 2. Real-time applications tracking subscription
    const unsubApps = careerConnectService.subscribeMyApplications(studentId, (apps) => {
      setMyApplications(apps);
      setAppliedIds(new Set(apps.map(a => a.opportunity_id)));
    });

    // 3. Real-time saved bookmarks subscription
    const unsubSaved = careerConnectService.subscribeUserSavedPosts(studentId, () => {
      loadSavedOpportunities(studentId);
    });

    loadData();

    return () => {
      unsubSkills();
      unsubApps();
      unsubSaved();
    };
  }, []);

  // ── ACTIVE TEST SESSION PERSISTENCE (Survives Reloads & Remounts) ──
  useEffect(() => {
    try {
      const savedSession = sessionStorage.getItem('novaconnect_active_test_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.activeTest && Array.isArray(parsed.activeTest.questions) && parsed.activeTest.questions.length > 0) {
          setActiveTest(parsed.activeTest);
          setCurrentQIndex(typeof parsed.currentQIndex === 'number' ? parsed.currentQIndex : 0);
          setTestAnswers(parsed.testAnswers || {});
          setTimeLeftSeconds(typeof parsed.timeLeftSeconds === 'number' ? parsed.timeLeftSeconds : parsed.activeTest.durationSeconds);
          if (Array.isArray(parsed.flaggedQuestions)) {
            setFlaggedQuestions(new Set(parsed.flaggedQuestions));
          }
          setActiveTab('assessment');
        }
      }
    } catch (e) {
      console.warn('Failed to restore active test session from sessionStorage:', e);
    }
  }, []);

  // Sync active test changes to sessionStorage
  useEffect(() => {
    try {
      if (activeTest && activeTest.questions && activeTest.questions.length > 0) {
        sessionStorage.setItem('novaconnect_active_test_session', JSON.stringify({
          activeTest,
          currentQIndex,
          testAnswers,
          timeLeftSeconds,
          flaggedQuestions: Array.from(flaggedQuestions)
        }));
      } else {
        sessionStorage.removeItem('novaconnect_active_test_session');
      }
    } catch {}
  }, [activeTest, currentQIndex, testAnswers, timeLeftSeconds, flaggedQuestions]);


  // Sync with activeSection prop
  useEffect(() => {
    if (activeSection === 'dashboard') {
      setActiveTab('dashboard');
    } else if (['learning', 'knowledge-base', 'learn', 'knowledge', 'modules'].includes(activeSection)) {
      setActiveTab('learning');
      setLearningSubTab('languages');
    } else if (['career-roles', 'roles', 'roadmaps'].includes(activeSection)) {
      setActiveTab('learning');
      setLearningSubTab('roadmaps');
    } else if (['skills', 'skill-gap'].includes(activeSection)) {
      setActiveTab('learning');
      setLearningSubTab('skill-gap');
    } else if (['assessments', 'assessment'].includes(activeSection)) {
      setActiveTab('assessments');
      setAssessmentSubTab('tests');
    } else if (['certificates', 'credentials', 'cert'].includes(activeSection)) {
      setActiveTab('assessments');
      setAssessmentSubTab('certificates');
    } else if (['opportunities', 'internships', 'jobs'].includes(activeSection)) {
      setActiveTab('opportunities');
      setOpportunitySubTab('jobs');
    } else if (['feed', 'industry-feed', 'industry_feed'].includes(activeSection)) {
      setActiveTab('opportunities');
      setOpportunitySubTab('feed');
    } else if (['saved-opps', 'saved', 'bookmarks'].includes(activeSection)) {
      setActiveTab('opportunities');
      setOpportunitySubTab('saved');
    } else if (['messages', 'direct-messages'].includes(activeSection)) {
      setActiveTab('messages');
    } else if (['profile', 'internal-profile'].includes(activeSection)) {
      setActiveTab('profile');
    } else if (activeSection === 'resume' && onOpenResumeBuilder) {
      onOpenResumeBuilder();
    }
  }, [activeSection, onOpenResumeBuilder]);

  // Load student internal profile and saved posts
  const loadInternalProfile = async (sId: string) => {
    try {
      const p = await careerConnectService.getStudentInternalProfile(sId);
      setInternalProfile(p);
      if (p.target_role) setTargetRole(p.target_role);
      if (p.semester) setCurrentSemester(p.semester);
      if (p.department) setDepartment(p.department);
      if (p.cgpa) setCgpa(p.cgpa);
      if (p.college) setInstitution(p.college);
    } catch (err) {
      console.warn('Failed to load internal profile:', err);
    }
  };

  const loadSavedOpportunities = async (sId: string) => {
    setIsLoadingSaved(true);
    try {
      const list = await careerConnectService.getSavedPostsDetailed(sId);
      setSavedPosts(list);
    } catch (err) {
      console.warn('Failed to load saved posts:', err);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    const sId = session?.id || 'demo-student-1';
    loadInternalProfile(sId);
    loadSavedOpportunities(sId);
  }, [session?.id, activeTab]);

  // Recalculate skill gap on target role change
  useEffect(() => {
    careerConnectService.getSkillGap(targetRole).then(setSkillGap);
  }, [targetRole]);

  // Assessment Countdown Timer & Anti-Cheating Telemetry
  useEffect(() => {
    if (!activeTest || !activeTest.questions || activeTest.questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Browser-based anti-cheating listeners
    const handleVisibilityChange = () => {
      if (document.hidden && activeTest) {
        recordViolation('tab_switch', 'Tab switch or background minimize detected');
      }
    };

    const handleWindowBlur = () => {
      if (activeTest) {
        recordViolation('blur', 'Exam window lost active desktop focus');
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (activeTest) {
        e.preventDefault();
        recordViolation('copy_paste', 'Clipboard copy action prohibited during proctored exam');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
    };
  }, [activeTest]);

  const recordViolation = (type: TestAntiCheatingViolation['type'], message: string) => {
    const v: TestAntiCheatingViolation = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setAntiCheatingViolations(prev => [...prev, v]);
    setAntiCheatingToast(`Anti-Cheating Warning: ${message}`);
    setTimeout(() => setAntiCheatingToast(null), 4000);
  };

  const loadData = async () => {
    const curSession = careerConnectService.getCurrentSession();
    const sk = await careerConnectService.getStudentSkills(curSession?.id);
    setSkills(sk);
    const opps = await careerConnectService.getOpportunities();
    setOpportunities(opps);
    const history = careerConnectService.getStudentAssessmentHistory(curSession?.id);
    setAssessmentHistory(history);
  };

  // ── STUDENT INTERNAL PROFILE & ACADEMIC STATUS FIRESTORE PERSISTENCE ────────────────────────
  const handleSaveFullProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const sId = session?.id || 'demo-student-1';
      const semNum = Number(editProfileData.semester) || 6;
      const payload: Partial<StudentInternalProfile> = {
        full_name: editProfileData.full_name.trim() || 'Ved Dhobi',
        headline: editProfileData.headline.trim(),
        bio: editProfileData.bio.trim(),
        target_role: editProfileData.target_role,
        profile_photo: editProfileData.profile_photo || undefined,
        degree: editProfileData.degree.trim(),
        college: editProfileData.college.trim(),
        department: editProfileData.department,
        semester: semNum,
        cgpa: editProfileData.cgpa.trim(),
        phone: editProfileData.phone.trim(),
        email: editProfileData.email.trim(),
        location: editProfileData.location.trim(),
        discipline: editProfileData.discipline || editProfileData.department,
        portfolio_links: {
          ...(internalProfile?.portfolio_links || {}),
          github: editProfileData.github.trim(),
          linkedin: editProfileData.linkedin.trim(),
          website: editProfileData.website.trim(),
          cad_portfolio: (editProfileData.cad_portfolio || '').trim(),
          research_gate: (editProfileData.research_gate || '').trim()
        }
      };

      await careerConnectService.saveStudentInternalProfile(sId, payload);
      const updatedSession = await careerConnectService.updateStudentAcademicStatus(
        sId,
        { semester: semNum, department: editProfileData.department, cgpa: editProfileData.cgpa.trim() }
      );

      setSession(updatedSession);
      setCurrentSemester(semNum);
      setDepartment(editProfileData.department);
      setCgpa(editProfileData.cgpa.trim());
      setInstitution(editProfileData.college.trim());
      if (editProfileData.target_role) {
        setTargetRole(editProfileData.target_role);
      }

      await loadInternalProfile(sId);
      setIsEditProfileModalOpen(false);
      setProfileSuccessMsg('Profile updated and saved to Firestore successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile changes. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // ── 50-QUESTION / FILTERED ASSESSMENT ENGINE ───────────────────────
  const handleStart50QuestionTest = async () => {
    try {
      sessionStorage.removeItem('novaconnect_active_test_session');
    } catch {}

    const count = selectedDurationMins === 15 ? 15 : selectedDurationMins === 30 ? 30 : 50;
    const skillKey = (selectedSkillId || selectedLanguage || 'python').toLowerCase();
    const isProg = ALL_50_PROGRAMMING_LANGUAGES.has(skillKey);
    const domain = selectedDomainId || (isProg ? 'computer_science' : 'mechanical');
    const sId = session?.id || 'demo-student-1';

    // 1. Authoritative Backend Session Creation (PostgreSQL/SQLite 106,771 Bank with Frozen Sequence)
    try {
      const backendSession = await careerConnectService.createAssessmentSession({
        language: selectedLanguage || skillKey,
        skillId: skillKey,
        domainId: domain,
        topicId: selectedTopicId === 'All' ? undefined : selectedTopicId,
        difficulty: selectedDifficulty,
        count,
        durationMinutes: selectedDurationMins
      });
      if (backendSession) {
        if (!backendSession.questions || backendSession.questions.length === 0) {
          alert(backendSession.shortageMessage || "No verified questions currently available for this exact topic. No unrelated questions will be added to preserve test integrity.");
          return;
        }
        setActiveTest(backendSession);
        setCurrentQIndex(0);
        setTestAnswers({});
        setFlaggedQuestions(new Set());
        setTimeLeftSeconds(backendSession.durationSeconds);
        setAntiCheatingViolations([]);
        setLatestReport(null);
        try {
          sessionStorage.setItem(`novaconnect_exam_answers_${backendSession.testId}`, JSON.stringify({}));
        } catch {}
        return;
      }
    } catch (apiErr) {
      console.warn('Backend assessment session creation failed or offline, falling back to local engine:', apiErr);
    }

    // 2. Preload language dataset if programming to guarantee 2,000 questions in local bank
    if (isProg) {
      await careerConnectService.preloadLanguageMCQs(skillKey);
    }

    // 3. Select appropriate local engine: multi-topic certification if comprehensive 50-Q, else filtered
    let test: GeneratedAssessmentTest;
    if ((!selectedTopicId || selectedTopicId === 'All') && count === 50) {
      test = careerConnectService.generateFinalCertificationAssessment(
        skillKey,
        selectedDurationMins,
        undefined,
        sId
      );
    } else if (selectedTopicId && selectedTopicId !== 'All') {
      const topicItem = availableKbTopics.find(t => t.id === selectedTopicId);
      const topTitle = topicItem?.name || selectedTopicId;
      test = careerConnectService.generateTopicAssessment(
        skillKey,
        selectedTopicId,
        topTitle,
        selectedDifficulty as any,
        selectedDurationMins,
        count,
        undefined,
        sId
      );
    } else {
      test = careerConnectService.generateFilteredAssessment({
        domainId: domain,
        skillId: skillKey,
        language: selectedLanguage || skillKey,
        moduleId: selectedModuleId === 'All' ? undefined : selectedModuleId,
        topicId: selectedTopicId === 'All' ? undefined : selectedTopicId,
        difficulty: selectedDifficulty,
        durationMinutes: selectedDurationMins,
        count
      });
    }

    if (!test || !test.questions || test.questions.length === 0) {
      alert("No verified questions available for the selected topic filter. Please select another topic or take the comprehensive assessment.");
      return;
    }

    // Language Purity Guard: Reject any cross-language leakage
    const targetKey = skillKey.replace(/[^a-z0-9]/g, '');
    if (test && test.questions) {
      test.questions = test.questions.filter(q => {
        const qLang = (q.languageId || q.programmingLanguage || q.skillId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (targetKey !== 'java' && targetKey !== 'jvm') {
          if (qLang === 'java' || (q.codeSnippet && (q.codeSnippet.includes('System.out') || q.codeSnippet.includes('public class Loop_')))) {
            return false;
          }
        }
        if (targetKey === 'sql' || targetKey === 'dbms') {
          if (q.codeSnippet && (q.codeSnippet.includes('int sum') || q.codeSnippet.includes('int val') || q.codeSnippet.includes('for (int'))) {
            return false;
          }
        }
        return true;
      });
      test.totalQuestions = test.questions.length;
    }

    setActiveTest(test);
    setCurrentQIndex(0);
    setTestAnswers({});
    setFlaggedQuestions(new Set());
    setTimeLeftSeconds(test.durationSeconds);
    setAntiCheatingViolations([]);
    setLatestReport(null);
    try {
      sessionStorage.setItem(`novaconnect_exam_answers_${test.testId}`, JSON.stringify({}));
    } catch {}
  };

  const handleStartTopicPractice = async (
    language: string,
    moduleId: string,
    topicId: string,
    difficulty: any,
    topicTitle?: string,
    questionCount?: number
  ) => {
    try {
      sessionStorage.removeItem('novaconnect_active_test_session');
    } catch {}

    const sId = session?.id || 'demo-student-1';
    setSelectedLanguage(language as any);
    setSelectedSkillId(language.toLowerCase());
    setSelectedModuleId(moduleId);
    setSelectedTopicId(topicId);
    setSelectedDifficulty(difficulty);
    setSelectedDurationMins(15);

    const targetCount = Math.min(15, questionCount && questionCount > 0 ? questionCount : 15);

    // Try authoritative Fail-Closed backend engine first
    try {
      const backendSession = await careerConnectService.createAssessmentSession({
        language: language,
        skillId: language.toLowerCase(),
        domainId: 'computer_science',
        topicId: topicId,
        difficulty: difficulty,
        count: targetCount,
        durationMinutes: 15
      });
      if (backendSession) {
        if (!backendSession.questions || backendSession.questions.length === 0) {
          alert(backendSession.shortageMessage || `No verified questions currently available for topic "${topicTitle || topicId}". No unrelated questions will be added.`);
          return;
        }
        backendSession.moduleId = moduleId;
        backendSession.topicName = topicTitle || topicId;
        backendSession.testMode = 'TOPIC_TEST';

        // Language Purity Guard on backend session
        const targetLangKey = language.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (backendSession.questions) {
          backendSession.questions = backendSession.questions.filter(q => {
            const qLang = (q.languageId || q.programmingLanguage || q.skillId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (targetLangKey !== 'java' && targetLangKey !== 'jvm') {
              if (qLang === 'java' || (q.codeSnippet && (q.codeSnippet.includes('System.out') || q.codeSnippet.includes('public class Loop_')))) {
                return false;
              }
            }
            if (targetLangKey === 'sql' || targetLangKey === 'dbms') {
              if (q.codeSnippet && (q.codeSnippet.includes('int sum') || q.codeSnippet.includes('int val') || q.codeSnippet.includes('for (int'))) {
                return false;
              }
            }
            return true;
          });
          backendSession.totalQuestions = backendSession.questions.length;
        }

        setActiveTest(backendSession);
        setCurrentQIndex(0);
        setTestAnswers({});
        setFlaggedQuestions(new Set());
        setTimeLeftSeconds(backendSession.durationSeconds);
        setAntiCheatingViolations([]);
        setLatestReport(null);
        setActiveTab('assessment');
        try {
          sessionStorage.setItem(`novaconnect_exam_answers_${backendSession.testId}`, JSON.stringify({}));
        } catch {}
        return;
      }
    } catch (backendErr) {
      console.warn('Backend topic practice failed, falling back to local bank:', backendErr);
    }

    // Ensure 2,000 MCQs dataset is preloaded for accurate generation if offline
    await careerConnectService.preloadLanguageMCQs(language.toLowerCase());

    const test = careerConnectService.generateTopicAssessment(
      language.toLowerCase(),
      topicId,
      topicTitle,
      difficulty,
      15, // 15 mins
      targetCount,
      undefined,
      sId
    );

    if (!test || !test.questions || test.questions.length === 0) {
      alert(`Verified questions are being prepared for topic "${topicTitle || topicId}". Autonomous background replenishment has been queued.`);
      return;
    }

    // Strict Language & Topic Isolation Guard
    const targetLangKey = language.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (test && test.questions) {
      test.questions = test.questions.filter(q => {
        const qLang = (q.languageId || q.programmingLanguage || q.skillId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (targetLangKey !== 'java' && targetLangKey !== 'jvm') {
          if (qLang === 'java' || (q.codeSnippet && (q.codeSnippet.includes('System.out') || q.codeSnippet.includes('public class Loop_')))) {
            return false;
          }
        }
        if (targetLangKey === 'sql' || targetLangKey === 'dbms') {
          if (q.codeSnippet && (q.codeSnippet.includes('int sum') || q.codeSnippet.includes('int val') || q.codeSnippet.includes('for (int'))) {
            return false;
          }
        }
        return true;
      });
      test.totalQuestions = test.questions.length;
    }

    setActiveTest(test);
    setCurrentQIndex(0);
    setTestAnswers({});
    setFlaggedQuestions(new Set());
    setTimeLeftSeconds(test.durationSeconds);
    setAntiCheatingViolations([]);
    setLatestReport(null);
    setActiveTab('assessment');
    try {
      sessionStorage.setItem(`novaconnect_exam_answers_${test.testId}`, JSON.stringify({}));
    } catch {}
  };

  const handleStartFinalCertification = async (subjectId: string) => {
    try {
      sessionStorage.removeItem('novaconnect_active_test_session');
    } catch {}

    const sId = session?.id || 'demo-student-1';
    const progress = careerConnectService.getSubjectSyllabusProgress(sId, subjectId);
    if (!progress.isFinalCertificationUnlocked) {
      alert(`Final Certification is locked. You must complete 100% of the syllabus topics (${progress.completedTopicsCount}/${progress.totalTopics} completed) to attempt the final certification.`);
      return;
    }

    // Ensure 2,000 MCQs dataset is preloaded for accurate generation
    await careerConnectService.preloadLanguageMCQs(subjectId);

    // 1. Authoritative Backend Session Creation (PostgreSQL/SQLite 106,771 Bank with Frozen Sequence)
    try {
      const backendSession = await careerConnectService.createAssessmentSession({
        language: subjectId,
        skillId: subjectId.toLowerCase(),
        domainId: 'computer_science',
        topicId: undefined, // All topics for full certification
        difficulty: 'Mixed',
        count: 50,
        durationMinutes: 45
      });
      if (backendSession && backendSession.questions && backendSession.questions.length >= 40) {
        backendSession.moduleId = 'All';
        backendSession.topicName = 'All';
        backendSession.testMode = 'FINAL_CERTIFICATION';

        // Purity Guard on backend session
        const targetSubKey = subjectId.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (backendSession.questions) {
          backendSession.questions = backendSession.questions.filter(q => {
            const qLang = (q.languageId || q.programmingLanguage || q.skillId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (targetSubKey !== 'java' && targetSubKey !== 'jvm') {
              if (qLang === 'java' || (q.codeSnippet && (q.codeSnippet.includes('System.out') || q.codeSnippet.includes('public class Loop_')))) {
                return false;
              }
            }
            if (targetSubKey === 'sql' || targetSubKey === 'dbms') {
              if (q.codeSnippet && (q.codeSnippet.includes('int sum') || q.codeSnippet.includes('int val') || q.codeSnippet.includes('for (int'))) {
                return false;
              }
            }
            return true;
          });
          backendSession.totalQuestions = backendSession.questions.length;
        }

        setSelectedLanguage(backendSession.language as any);
        setSelectedSkillId(subjectId.toLowerCase());
        setSelectedModuleId('All');
        setSelectedTopicId('All');
        setSelectedDifficulty('Mixed');
        setSelectedDurationMins(45);
        setActiveTest(backendSession);
        setCurrentQIndex(0);
        setTestAnswers({});
        setFlaggedQuestions(new Set());
        setTimeLeftSeconds(backendSession.durationSeconds);
        setAntiCheatingViolations([]);
        setLatestReport(null);
        setActiveTab('assessment');
        try {
          sessionStorage.setItem(`novaconnect_exam_answers_${backendSession.testId}`, JSON.stringify({}));
        } catch {}
        return;
      }
    } catch (backendErr) {
      console.warn('Backend final certification failed or offline, falling back to local engine:', backendErr);
    }

    // 2. Fall back to newly synchronized 90/10 local multi-topic certification engine
    const test = careerConnectService.generateFinalCertificationAssessment(subjectId, 45, undefined, sId);
    if (!test || !test.questions || test.questions.length === 0) {
      alert(`Could not assemble 50-MCQ final certification test for ${subjectId}.`);
      return;
    }

    // Purity Guard on local test
    const targetSubKey = subjectId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (test && test.questions) {
      test.questions = test.questions.filter(q => {
        const qLang = (q.languageId || q.programmingLanguage || q.skillId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (targetSubKey !== 'java' && targetSubKey !== 'jvm') {
          if (qLang === 'java' || (q.codeSnippet && (q.codeSnippet.includes('System.out') || q.codeSnippet.includes('public class Loop_')))) {
            return false;
          }
        }
        if (targetSubKey === 'sql' || targetSubKey === 'dbms') {
          if (q.codeSnippet && (q.codeSnippet.includes('int sum') || q.codeSnippet.includes('int val') || q.codeSnippet.includes('for (int'))) {
            return false;
          }
        }
        return true;
      });
      test.totalQuestions = test.questions.length;
    }

    setSelectedLanguage(test.language as any);
    setSelectedSkillId(subjectId.toLowerCase());
    setSelectedModuleId('All');
    setSelectedTopicId('All');
    setSelectedDifficulty('Mixed');
    setSelectedDurationMins(45);

    setActiveTest(test);
    setCurrentQIndex(0);
    setTestAnswers({});
    setFlaggedQuestions(new Set());
    setTimeLeftSeconds(test.durationSeconds);
    setAntiCheatingViolations([]);
    setLatestReport(null);
    setActiveTab('assessment');
    try {
      sessionStorage.setItem(`novaconnect_exam_answers_${test.testId}`, JSON.stringify({}));
    } catch {}
  };

  const handleStartSkillAssessmentFromRole = (language: string) => {
    const langKey = language.toLowerCase();
    const isProg = ALL_50_PROGRAMMING_LANGUAGES.has(langKey);
    const domain = isProg ? 'computer_science' : (
      ['solidworks', 'autocad_mech', 'autocad-mech'].includes(langKey) ? 'mechanical' : (
        ['staad_pro', 'autocad_civil'].includes(langKey) ? 'civil' : (
          ['plc_programming', 'plc'].includes(langKey) ? 'electrical' : 'electronics'
        )
      )
    );
    setSelectedDomainId(domain);
    setSelectedSkillId(langKey);
    setSelectedLanguage(language);
    setSelectedModuleId('All');
    setSelectedTopicId('All');
    setSelectedDifficulty('Mixed');
    setSelectedDurationMins(45);
    setActiveTab('assessment');
  };

  const handleSetTargetRole = async (roleTitle: string) => {
    setTargetRole(roleTitle);
    if (internalProfile) {
      await careerConnectService.saveStudentInternalProfile(internalProfile.student_id, {
        target_role: roleTitle
      });
      setInternalProfile(prev => prev ? { ...prev, target_role: roleTitle } : null);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setTestAnswers(prev => {
      const next = {
        ...prev,
        [questionId]: optionIndex
      };
      if (activeTest) {
        try {
          sessionStorage.setItem(`novaconnect_exam_answers_${activeTest.testId}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const handleToggleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const handleManualSubmitAssessment = async () => {
    if (!activeTest) return;
    const answeredCount = Object.keys(testAnswers).length;
    const confirmMsg = answeredCount < activeTest.totalQuestions
      ? `You have answered ${answeredCount} of ${activeTest.totalQuestions} questions. Are you sure you want to submit?`
      : 'Ready to submit your assessment and compute verified scores?';

    if (!window.confirm(confirmMsg)) return;
    await executeSubmission();
  };

  const handleAutoSubmitAssessment = async () => {
    await executeSubmission();
  };

  const executeSubmission = async () => {
    if (!activeTest) return;
    setIsTestSubmitting(true);
    try {
      const questionsSnapshot = [...activeTest.questions];
      const answersSnapshot = { ...testAnswers };
      setCompletedExamQuestions(questionsSnapshot);
      setCompletedExamAnswers(answersSnapshot);

      const report = await careerConnectService.submitStudentAssessment(
        activeTest,
        testAnswers,
        antiCheatingViolations,
        session
      );
      setLatestReport(report);
      try {
        sessionStorage.removeItem(`novaconnect_exam_answers_${activeTest.testId}`);
        sessionStorage.removeItem('novaconnect_active_test_session');
      } catch {}
      setActiveTest(null);
      await loadData();
    } finally {
      setIsTestSubmitting(false);
    }
  };

  const handleApplyOpportunity = async (opp: OpportunityItem) => {
    if (opp.deadline && opp.deadline === 'Expired') return;

    const res = await careerConnectService.applyToOpportunity(opp.id, session);
    if (res.status === 'external_redirect' && res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (res.status === 'applied') {
      setAppliedIds(prev => new Set([...prev, opp.id]));
      setAntiCheatingToast(`Application submitted successfully to ${opp.company_name}!`);
      setTimeout(() => setAntiCheatingToast(null), 3000);
    } else if (res.status === 'already_applied') {
      setAntiCheatingToast(`You have already applied to this opportunity.`);
      setTimeout(() => setAntiCheatingToast(null), 3000);
    }
  };

  const handleInternalApplyFromFeed = async (postId: string) => {
    let opp = opportunities.find(o => o.id === postId);
    if (!opp) {
      const posts = await careerConnectService.getIndustryPosts();
      const p = posts.find(item => item.id === postId);
      if (p) {
        opp = {
          id: p.id,
          company_name: p.company_name,
          company_logo: p.company_logo,
          title: p.message.split('\n')[0].slice(0, 70) || `${p.company_name} ${p.post_type}`,
          opportunity_type: p.post_type,
          description: p.message,
          required_skills: p.skills || [],
          location: p.target_state || 'All India / Hybrid',
          status: 'Open'
        };
      }
    }
    if (opp) {
      await handleApplyOpportunity(opp);
    }
  };

  const handleMatchCheck = (opp: OpportunityItem) => {
    const match = careerConnectService.matchOpportunityForStudent(opp, internalProfile, skills);
    setSelectedMatch({ opp, match });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Dynamic Modules & Topics for Assessment Drill-Down
  const availableKbModules = React.useMemo(() => {
    const hierarchy = careerConnectService.getKnowledgeBaseHierarchy(selectedLanguage);
    return hierarchy[0]?.modules || [];
  }, [selectedLanguage]);

  const availableKbTopics = React.useMemo(() => {
    if (selectedModuleId === 'All') {
      return availableKbModules.flatMap(m => m.topics);
    }
    const mod = availableKbModules.find(m => m.id === selectedModuleId);
    return mod?.topics || [];
  }, [availableKbModules, selectedModuleId]);

  // Real-time verified question count for exact topic locking
  const availableVerifiedCount = React.useMemo(() => {
    return careerConnectService.getAvailableQuestionCount({
      domainId: selectedDomainId,
      skillId: selectedSkillId,
      language: selectedLanguage || selectedSkillId,
      moduleId: selectedModuleId === 'All' ? undefined : selectedModuleId,
      topicId: selectedTopicId === 'All' ? undefined : selectedTopicId,
      difficulty: selectedDifficulty,
    });
  }, [selectedDomainId, selectedSkillId, selectedLanguage, selectedModuleId, selectedTopicId, selectedDifficulty]);

  // Reset module/topic selection on language switch
  useEffect(() => {
    setSelectedModuleId('All');
    setSelectedTopicId('All');
  }, [selectedLanguage]);

  // Reset topic on module switch
  useEffect(() => {
    setSelectedTopicId('All');
  }, [selectedModuleId]);

  // Filtered Opportunities
  const filteredOpps = opportunities.filter(opp => {
    const matchesSearch = !oppSearchFilter ||
      opp.title.toLowerCase().includes(oppSearchFilter.toLowerCase()) ||
      opp.company_name.toLowerCase().includes(oppSearchFilter.toLowerCase()) ||
      opp.required_skills.some(s => s.toLowerCase().includes(oppSearchFilter.toLowerCase()));

    const matchesType = oppTypeFilter === 'All' || opp.opportunity_type === oppTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ── TOAST NOTIFICATIONS (Anti-Cheating / Status) ── */}
      {antiCheatingToast && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-xl flex items-center gap-3 animate-slideIn">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-bold">{antiCheatingToast}</span>
        </div>
      )}

      {/* ── TOP ACADEMIC PROFILE & COMMAND BANNER ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold border border-slate-200/80">
              STUDENT WORKSPACE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200/60">
              SEMESTER {currentSemester}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200/60">
              CGPA {cgpa}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>

          <div className="flex items-center gap-4">
            {internalProfile?.profile_photo ? (
              <img
                src={internalProfile.profile_photo}
                alt={internalProfile.full_name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-white font-bold text-xl flex items-center justify-center shadow-xs flex-shrink-0">
                {(internalProfile?.full_name || session?.full_name || 'V').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  {internalProfile?.full_name || session?.full_name || 'Ved Dhobi'}
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200/60 hidden sm:inline">
                  {targetRole}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {department} • {institution}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Metrics & Self-Update Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
            <div className="text-lg font-bold text-emerald-600">{skills.filter(s => s.is_verified).length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Verified Skills</div>
          </div>

          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
            <div className="text-lg font-bold text-indigo-600">{myApplications.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Applications</div>
          </div>

          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 text-center shadow-2xs">
            <div className="text-lg font-bold text-amber-600">{savedPosts.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Saved Posts</div>
          </div>

          <button
            onClick={openEditProfileModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ── STREAMLINED PRIMARY TAB BAR (6 COHESIVE HUBS) ── */}
      <div className="border-b border-slate-200/90 flex items-center gap-1 overflow-x-auto pb-px custom-scrollbar bg-white">
        {[
          { key: 'dashboard', label: 'Overview', icon: <Sparkles className="w-4 h-4" /> },
          { key: 'learning', label: 'Learning & Skills', icon: <Code2 className="w-4 h-4" /> },
          { key: 'assessments', label: 'Assessments & Certs', icon: <CheckCircle2 className="w-4 h-4" /> },
          { key: 'opportunities', label: 'Career Hub', icon: <Briefcase className="w-4 h-4" />, count: opportunities.length },
          { key: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
          { key: 'profile', label: 'Profile & Resume', icon: <User className="w-4 h-4" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.key || (tab.key === 'learning' && ['learning', 'knowledge-base', 'career-roles', 'skills'].includes(activeTab)) || (tab.key === 'assessments' && ['assessments', 'assessment', 'certificates'].includes(activeTab)) || (tab.key === 'opportunities' && ['opportunities', 'feed', 'saved-opps'].includes(activeTab)) || (tab.key === 'profile' && ['profile', 'internal-profile'].includes(activeTab));
          return (
            <button
              key={tab.key}
              onClick={() => handleNavigateTab(tab.key as any)}
              className={`px-4 py-2.5 text-xs font-semibold transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer rounded-t-lg ${
                isActive
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 border-b-2 border-transparent'
              }`}
            >
              <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── CONTEXTUAL SUB-NAVIGATION PILLS (REDUCES CROWDNESS TO 2-3 ITEMS) ── */}
      {(activeTab === 'learning' || ['knowledge-base', 'career-roles', 'skills'].includes(activeTab)) && (
        <div className="flex items-center gap-2 py-2 px-3 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto">
          {[
            { key: 'languages', label: 'Languages & Syllabus', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { key: 'roadmaps', label: 'Career Roadmaps', icon: <Layers className="w-3.5 h-3.5" /> },
            { key: 'skill-gap', label: 'Skill Gap Analysis', icon: <Target className="w-3.5 h-3.5" /> },
          ].map((sub) => (
            <button
              key={sub.key}
              onClick={() => {
                setActiveTab('learning');
                setLearningSubTab(sub.key as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                learningSubTab === sub.key
                  ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {sub.icon}
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {(activeTab === 'assessments' || ['assessment', 'certificates'].includes(activeTab)) && (
        <div className="flex items-center gap-2 py-2 px-3 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto">
          {[
            { key: 'tests', label: 'Take Assessment (50-Q & Topic Tests)', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            { key: 'certificates', label: 'My Certificates & Badges', icon: <Award className="w-3.5 h-3.5" /> },
          ].map((sub) => (
            <button
              key={sub.key}
              onClick={() => {
                setActiveTab('assessments');
                setAssessmentSubTab(sub.key as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                assessmentSubTab === sub.key
                  ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {sub.icon}
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      )}

      {(activeTab === 'opportunities' || ['feed', 'saved-opps'].includes(activeTab)) && (
        <div className="flex items-center gap-2 py-2 px-3 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto">
          {[
            { key: 'jobs', label: 'Explore Opportunities', icon: <Briefcase className="w-3.5 h-3.5" />, count: opportunities.length },
            { key: 'feed', label: 'Industry Feed & Announcements', icon: <Radio className="w-3.5 h-3.5" /> },
            { key: 'saved', label: 'Saved Bookmarks', icon: <Bookmark className="w-3.5 h-3.5" />, count: savedPosts.length },
          ].map((sub) => (
            <button
              key={sub.key}
              onClick={() => {
                setActiveTab('opportunities');
                setOpportunitySubTab(sub.key as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                opportunitySubTab === sub.key
                  ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {sub.icon}
              <span>{sub.label}</span>
              {typeof sub.count === 'number' && sub.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-200 text-slate-700">
                  {sub.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {(activeTab === 'profile' || activeTab === 'internal-profile') && (
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-slate-100/80 rounded-xl border border-slate-200/60">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>Academic Profile & Professional Portfolios</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenResumeBuilder}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Launch ATS Resume Builder</span>
            </button>
          </div>
        </div>
      )}

      {/* ── SUB-VIEW: INDUSTRY FEED ── */}
      {((activeTab === 'opportunities' && opportunitySubTab === 'feed') || activeTab === 'feed') && (
        <IndustryFeedView
          session={session}
          appliedPostIds={appliedIds}
          onApplyInternal={handleInternalApplyFromFeed}
          onOpenDirectMessage={(contact) => {
            setMessagingTarget(contact);
            setActiveTab('messages');
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Action Hero Card */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-medium border border-slate-700">
                <Sparkles className="w-3 h-3 text-slate-400" />
                RECOMMENDED ASSESSMENT
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Launch Your Verified Skill Assessment
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Take an anti-cheat verified assessment across Python, JavaScript, HTML, CSS, or Java. Scores above 60% automatically award a verified skill credential and unlock direct interview shortlisting.
              </p>
            </div>
            <button
              onClick={() => handleNavigateTab('assessment')}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch Assessment Engine</span>
            </button>
          </div>

          {/* Grid: Skills Verified vs Recent Opportunities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills & Badges */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Verified Technical Skills</h3>
                </div>
                <button
                  onClick={() => handleNavigateTab('skills')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map(s => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{s.skill_name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{s.confidence_level} • Score: {s.test_score}%</div>
                    </div>
                    {s.is_verified ? (
                      <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300/80" title="Verified Credential">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Unverified</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Opportunities Feed */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Latest Active Opportunities</h3>
                </div>
                <button
                  onClick={() => handleNavigateTab('opportunities')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Browse {opportunities.length} Openings →
                </button>
              </div>

              <div className="space-y-3">
                {opportunities.slice(0, 3).map(opp => (
                  <div key={opp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{opp.title}</div>
                      <div className="text-[10px] text-slate-500 font-medium truncate">{opp.company_name} • {opp.stipend_or_salary}</div>
                    </div>
                    <button
                      onClick={() => handleMatchCheck(opp)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold cursor-pointer flex-shrink-0 shadow-2xs"
                    >
                      Match Score
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Application Tracking Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Live Application Tracking</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200/60">
                  {myApplications.length} Submissions
                </span>
              </div>
              <button
                onClick={() => handleNavigateTab('opportunities')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Browse All Openings →
              </button>
            </div>

            {myApplications.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs font-medium text-slate-500">
                  No active applications yet. Review recommended opportunities and apply with 1 click.
                </p>
                <button
                  onClick={() => handleNavigateTab('opportunities')}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  Explore Opportunities
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="pb-2.5">Opportunity</th>
                      <th className="pb-2.5">Company</th>
                      <th className="pb-2.5">Date</th>
                      <th className="pb-2.5">Match Score</th>
                      <th className="pb-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myApplications.slice(0, 5).map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900 truncate max-w-[200px]">{app.title}</td>
                        <td className="py-2.5 text-slate-600 truncate max-w-[150px]">{app.company_name}</td>
                        <td className="py-2.5 text-slate-500 font-mono text-[11px]">{app.applied_at}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] border border-emerald-200/60">
                            {app.match_score}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: 50-QUESTION SELF-GENERATED ASSESSMENT ENGINE ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {((activeTab === 'assessments' && assessmentSubTab === 'tests') || activeTab === 'assessment') && (
        <div className="space-y-6">
          {/* Active Exam Interface Mode */}
          {activeTest ? (
            (!activeTest.questions || activeTest.questions.length === 0) ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900">No Assessment Questions Available</h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  We could not find verified questions for topic &ldquo;{activeTest.topicId || activeTest.moduleId || activeTest.language}&rdquo;. Please select another topic or return to the Knowledge Base.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      try { sessionStorage.removeItem('novaconnect_active_test_session'); } catch {}
                      setActiveTest(null);
                      setActiveTab('knowledge-base');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                  >
                    Return to Knowledge Base
                  </button>
                </div>
              </div>
            ) : (
            <div className="glass-card rounded-3xl p-5 md:p-8 space-y-6">
              {/* Exam Header & Proctor Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl glass-pill">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5 flex-wrap">
                      <span className="text-slate-900 dark:text-white font-extrabold">{activeTest.language}</span>
                      <span>→</span>
                      <span>{activeTest.moduleId || 'Curriculum'}</span>
                      <span>→</span>
                      <span>{activeTest.topicName || activeTest.topicId || 'Comprehensive'}</span>
                      {activeTest.exactTopicLocked && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-500/40 shadow-xs">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          Exact Topic Locked (Zero Fallback)
                        </span>
                      )}
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="px-2 py-0.5 rounded-md glass-amber text-[10px] uppercase font-black text-amber-700 dark:text-amber-300">{activeTest.difficulty}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">Question {currentQIndex + 1} of {activeTest.totalQuestions}</span>
                    </div>
                    <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                      {activeTest.testMode === 'TOPIC_TEST'
                        ? `${activeTest.language} Topic Practice: ${activeTest.topicName || activeTest.topicId}`
                        : `${activeTest.language} 50-Question Proctored Final Certification Exam`
                      }
                    </h2>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {activeTest.testMode === 'TOPIC_TEST'
                        ? 'Mastery Requirement: ≥70% • Passing awards a Topic Mastery Badge & marks topic COMPLETED in syllabus'
                        : 'Official Accreditation Requirement: ≥70% (35/50) • Passing awards Accredited Certificate & Verified Profile Credential'
                      }
                    </div>
                  </div>
                </div>

                {/* Countdown & Trust Meter */}
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl glass-pill flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-slate-100 shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>{formatTime(timeLeftSeconds)}</span>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl glass-emerald flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Trust: {Math.max(0, 100 - antiCheatingViolations.length * 15)}%</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to exit this assessment? Your progress will be discarded.")) {
                        try { sessionStorage.removeItem('novaconnect_active_test_session'); } catch {}
                        setActiveTest(null);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl glass-rose text-rose-700 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:bg-rose-100 dark:hover:bg-rose-950"
                    title="Exit Assessment"
                  >
                    Exit Test
                  </button>
                </div>
              </div>

              {/* Internal Developer / Debug Observability Ribbon */}
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 dark:bg-slate-900 text-slate-300 font-mono text-[10px] flex flex-wrap items-center justify-between gap-2 border border-slate-700/60 shadow-xs backdrop-blur-md">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    ACTIVE ENGINE INTEGRITY
                  </span>
                  <span className="text-slate-400">ID: <strong className="text-white">{activeTest.testId}</strong></span>
                  <span className="text-slate-400">Topic: <strong className="text-amber-300">{activeTest.topicName || activeTest.topicId || 'Comprehensive'}</strong></span>
                </div>
                <div className="flex items-center gap-3 flex-wrap font-semibold">
                  <span className="text-slate-400">Items: <strong className="text-white">{activeTest.questions.length}</strong></span>
                  <span className="text-slate-400">Unique IDs: <strong className="text-emerald-300">{new Set(activeTest.questions.map(q => q.id)).size}</strong></span>
                  <span className="text-slate-400">Duplicates: <strong className="text-emerald-400">0</strong></span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                    NO-DUPLICATE GATE: PASSED
                  </span>
                </div>
              </div>

              {/* Honest Shortage Alert if pool had fewer verified questions than requested */}
              {activeTest.shortageMessage && (
                <div className="p-3.5 rounded-2xl glass-amber text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2 shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{activeTest.shortageMessage}</span>
                </div>
              )}

              {/* Question 1 to 50 Navigator Palette - Clean 10 per row */}
              <div className="p-4 rounded-2xl glass-card space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white">Question Palette</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 dark:bg-indigo-600 text-white font-mono text-[10px] font-bold">
                      {Object.keys(testAnswers).length} / {activeTest.totalQuestions} Answered
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                      <span>Answered</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block"></span>
                      <span>Flagged</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded glass-pill inline-block"></span>
                      <span>Pending</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleManualSubmitAssessment}
                      className="ml-2 px-2.5 py-1 rounded-lg glass-emerald text-emerald-800 dark:text-emerald-300 font-bold text-[10px] cursor-pointer hover:bg-emerald-200"
                    >
                      Finish Early
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-1">
                  {activeTest.questions.map((q, idx) => {
                    const isAnswered = testAnswers[q.id] !== undefined;
                    const isFlagged = flaggedQuestions.has(q.id);
                    const isCurrent = idx === currentQIndex;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQIndex(idx)}
                        className={`h-8 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          isCurrent
                            ? 'ring-2 ring-indigo-500 scale-105 shadow-md'
                            : ''
                        } ${
                          isFlagged
                            ? 'bg-amber-400 text-slate-950 font-black border border-amber-500'
                            : isAnswered
                            ? 'bg-emerald-600 text-white font-black shadow-2xs'
                            : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
                        }`}
                        title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : isFlagged ? 'Flagged' : 'Pending'}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Question Display */}
              {activeTest.questions[currentQIndex] && (() => {
                const q = activeTest.questions[currentQIndex];
                const chosenOption = testAnswers[q.id];

                return (
                  <div key={q.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white font-mono text-xs font-black">
                          Q{currentQIndex + 1} of {activeTest.totalQuestions}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg glass-pill text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {q.topic}
                        </span>
                        {q.primaryConcept && (
                          <span className="px-2 py-0.5 rounded-lg glass-blue text-blue-800 dark:text-blue-300 text-[10px] font-mono font-bold">
                            Concept: {q.primaryConcept}
                          </span>
                        )}
                        {q.duplicateGroupId && (
                          <span className="px-2 py-0.5 rounded-lg glass-purple text-purple-800 dark:text-purple-300 text-[10px] font-mono font-bold">
                            {q.duplicateGroupId}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          +{q.marks} Mark / -{q.negativeMarks} Negative
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleFlagQuestion(q.id)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                          flaggedQuestions.has(q.id)
                            ? 'bg-amber-200 text-amber-900 border border-amber-400'
                            : 'glass-pill text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800'
                        }`}
                      >
                        {flaggedQuestions.has(q.id) ? 'Flagged' : 'Flag for Review'}
                      </button>
                    </div>

                    <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                      {cleanQuestionText(q.question)}
                    </p>

                    {/* Diagram or Engineering Scenario if available */}
                    {q.diagramDescription && (
                      <div className="p-3 rounded-xl glass-pill text-slate-800 dark:text-slate-200 text-xs font-mono flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span><strong>Engineering Specification / Schematic:</strong> {q.diagramDescription}</span>
                      </div>
                    )}

                    {/* Code snippet rendering if available */}
                    {q.codeSnippet && (
                      <pre className="p-3.5 rounded-2xl bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                        <code>{q.codeSnippet}</code>
                      </pre>
                    )}

                    {/* 4 Selectable Options */}
                    <div className="space-y-2 pt-2">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer ${
                            chosenOption === optIdx
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                              : 'glass-card-interactive text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0 ${
                            chosenOption === optIdx
                              ? 'bg-white text-indigo-700 border-white'
                              : 'glass-pill text-slate-600 dark:text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      ))}
                    </div>

                    {/* Collapsible Educational Hint */}
                    {q.hint && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowHintFor(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-2xs"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>{showHintFor[q.id] ? 'Hide Educational Hint' : 'Show Educational Hint'}</span>
                        </button>
                        {showHintFor[q.id] && (
                          <div className="mt-2 p-3.5 rounded-2xl glass-panel text-xs text-slate-800 dark:text-slate-200 leading-relaxed animate-fadeIn">
                            <span className="font-bold">Pedagogical Hint:</span> {q.hint}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/60">
                      <button
                        type="button"
                        disabled={currentQIndex === 0}
                        onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                        className="px-4 py-2 rounded-xl glass-pill hover:bg-white/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer disabled:opacity-40"
                      >
                        ← Previous
                      </button>

                      <div className="flex items-center gap-2">
                        {currentQIndex < activeTest.totalQuestions - 1 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentQIndex(prev => Math.min(activeTest.totalQuestions - 1, prev + 1))}
                            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer"
                          >
                            Save & Next →
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isTestSubmitting}
                            onClick={handleManualSubmitAssessment}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                          >
                            {isTestSubmitting ? 'Computing Score...' : `Submit ${activeTest.totalQuestions}-Q Assessment`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )
        ) : (
            /* Test Generation Form & Historical Record */
            <div className="space-y-6">
              {/* Test Launcher Card - 5-Step Topic-Specific Drill-Down */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90">
                      <Sparkles className="w-6 h-6 text-emerald-700" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Topic-Specific Technical Assessment Engine
                      </h2>
                      <p className="text-xs text-slate-600 font-medium">
                        Drill down from language to specific module and topic. Questions are strictly filtered to the selected area.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('knowledge-base')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      <span>Review Knowledge Base</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('certificates')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-700" />
                      <span>My Certificates</span>
                    </button>
                  </div>
                </div>

                {/* 5-Step Interactive Drill-Down Controls (Multi-Disciplinary) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                  {/* Step 1: Discipline / Domain */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wider">
                      1. Discipline
                    </label>
                    <select
                      value={selectedDomainId}
                      onChange={e => {
                        const newDomId = e.target.value;
                        setSelectedDomainId(newDomId);
                        const dom = careerConnectService.getSkillDomainById(newDomId);
                        const firstSkill = dom?.categories[0]?.skills[0];
                        if (firstSkill) {
                          setSelectedSkillId(firstSkill.id);
                          setSelectedLanguage(firstSkill.name);
                        }
                        setSelectedTopicId('All');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                    >
                      {careerConnectService.getSkillDomains().map(dom => (
                        <option key={dom.id} value={dom.id}>{dom.name} ({dom.code})</option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Skill / Tool */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wider">
                      2. Skill / Tool
                    </label>
                    <select
                      value={selectedSkillId}
                      onChange={e => {
                        const newSkillId = e.target.value;
                        setSelectedSkillId(newSkillId);
                        const sItem = careerConnectService.getSkillById(newSkillId);
                        if (sItem) setSelectedLanguage(sItem.name);
                        setSelectedTopicId('All');
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                    >
                      {(() => {
                        const dom = careerConnectService.getSkillDomainById(selectedDomainId);
                        if (!dom) return <option value="solidworks">SolidWorks</option>;
                        return dom.categories.flatMap(cat => cat.skills.map(sk => (
                          <option key={sk.id} value={sk.id}>{sk.name} [{cat.name}]</option>
                        )));
                      })()}
                    </select>
                  </div>

                  {/* Step 3: Topic / Module */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                        3. Topic (Specific)
                      </label>
                      {selectedTopicId !== 'All' && (
                        <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Exact Locked ({availableVerifiedCount} Qs)
                        </span>
                      )}
                    </div>
                    <select
                      value={selectedTopicId}
                      onChange={e => setSelectedTopicId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All Topics (Comprehensive 50-Q)</option>
                      {(() => {
                        const isProg = ALL_50_PROGRAMMING_LANGUAGES.has((selectedSkillId || selectedLanguage || '').toLowerCase());

                        if (isProg && availableKbTopics.length > 0) {
                          return availableKbTopics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ));
                        }

                        const skItem = careerConnectService.getSkillById(selectedSkillId);
                        if (skItem && skItem.topics && skItem.topics.length > 0) {
                          return skItem.topics.map(t => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ));
                        }
                        return availableKbTopics.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ));
                      })()}
                    </select>
                    {selectedTopicId !== 'All' && (
                      <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        availableVerifiedCount > 0
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${availableVerifiedCount > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span>
                          {availableVerifiedCount > 0
                            ? `${availableVerifiedCount} Verified Questions Available`
                            : 'No verified questions available for this specific topic yet. Please choose another topic or take the comprehensive skill assessment.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Step 4: Difficulty */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wider">
                      4. Difficulty
                    </label>
                    <select
                      value={selectedDifficulty}
                      onChange={e => setSelectedDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Mixed">Mixed (Balanced)</option>
                      <option value="Easy">Foundational (Easy)</option>
                      <option value="Medium">Intermediate (Medium)</option>
                      <option value="Hard">Advanced (Hard)</option>
                      <option value="Industry">Industry Scenario</option>
                    </select>
                  </div>

                  {/* Step 5: Duration & Question Count */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1 uppercase tracking-wider">
                      5. Duration / Count
                    </label>
                    <select
                      value={selectedDurationMins}
                      onChange={e => setSelectedDurationMins(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value={15}>15 Mins • 15 Questions</option>
                      <option value={30}>30 Mins • 30 Questions</option>
                      <option value={45}>45 Mins • 50 Questions</option>
                      <option value={60}>60 Mins • 50 Questions</option>
                    </select>
                  </div>
                </div>

                {/* Scoping Guarantee Banner */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${availableVerifiedCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'} flex-shrink-0`} />
                    <span className="text-slate-600">
                      Assessment Target Scope:{' '}
                      <strong className="text-slate-900">{selectedLanguage}</strong>
                      {selectedModuleId !== 'All' && (
                        <span> → <strong className="text-slate-900">{availableKbModules.find(m => m.id === selectedModuleId)?.name || selectedModuleId}</strong></span>
                      )}
                      {selectedTopicId !== 'All' && (
                        <span> → <strong className="text-slate-900">{availableKbTopics.find(t => t.id === selectedTopicId)?.name || selectedTopicId}</strong></span>
                      )}
                      {selectedTopicId !== 'All' && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-mono font-bold">
                          Exact Topic Locked ({availableVerifiedCount} Qs)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold flex-shrink-0">
                    Score &ge; 70% auto-issues official Certificate of Achievement
                  </span>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {selectedTopicId !== 'All' && availableVerifiedCount === 0 && (
                    <p className="text-xs text-slate-600 font-medium">
                      No verified questions in bank for this topic yet. Please choose another topic or select "All Topics".
                    </p>
                  )}
                  <div className="ml-auto">
                    <button
                      type="button"
                      disabled={selectedTopicId !== 'All' && availableVerifiedCount === 0}
                      onClick={handleStart50QuestionTest}
                      className={`px-6 py-3 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                        selectedTopicId !== 'All' && availableVerifiedCount === 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-slate-900" />
                      <span>
                        {selectedTopicId !== 'All'
                          ? availableVerifiedCount > 0
                            ? `Generate & Begin ${Math.min(availableVerifiedCount, selectedDurationMins === 15 ? 15 : selectedDurationMins === 30 ? 30 : 50)}-Q Topic Mastery Exam`
                            : 'Topic Exam Unavailable'
                          : 'Generate & Begin 50-Q Comprehensive Exam'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Score Report Display if just completed */}
              {latestReport && (
                <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-xl space-y-5 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                        ASSESSMENT COMPLETE
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">
                        Official Score & Skill Credential Report
                      </h3>
                      <div className="text-xs text-slate-500 font-mono">
                        Verification Hash: <strong>{latestReport.certificateVerificationHash}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-700">{latestReport.percentage}%</div>
                      <div className="text-xs font-bold text-slate-600">All-India Percentile: {latestReport.percentile}th</div>
                    </div>
                  </div>

                  {/* Result & Credential Banner */}
                  {latestReport.testMode === 'TOPIC_TEST' ? (
                    latestReport.percentage >= 70 ? (
                      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-slate-800 text-emerald-400 flex-shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400">
                              TOPIC MASTERY ACHIEVED ✓
                            </div>
                            <div className="text-sm font-bold">
                              Topic Practice Passed! You scored {latestReport.percentage}%. Topic Mastery Badge awarded & topic marked COMPLETED in syllabus.
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Topic tests mark syllabus progress towards unlocking the 50-MCQ Final Certification Exam.
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('knowledge-base')}
                          className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold shadow-xs cursor-pointer flex-shrink-0"
                        >
                          Continue Syllabus in Knowledge Base →
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-slate-600" />
                            <span>Topic Mastery Incomplete</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            You scored {latestReport.percentage}% (≥70% required to complete this syllabus topic). Review the topic documentation in Knowledge Base and retry.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveTab('knowledge-base')}
                            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs cursor-pointer"
                          >
                            Return to Knowledge Base
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    latestReport.percentage >= 70 ? (
                      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-lg bg-slate-800 text-emerald-400 flex-shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-400">
                              OFFICIAL ACCREDITED CERTIFICATE ISSUED ✓
                            </div>
                            <div className="text-sm font-black">
                              Congratulations! You scored {latestReport.percentage}% ({latestReport.correctAnswers}/{latestReport.totalQuestions} Qs), qualifying for official Nova CareerConnect certification.
                            </div>
                            <div className="text-[11px] text-emerald-200 mt-0.5 font-mono">
                              Credential ID: {latestReport.certificateVerificationHash} • Official Skill Credential recorded to your profile
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('certificates')}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-black shadow-xs cursor-pointer flex-shrink-0"
                        >
                          Claim & View Certificate →
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                        <div className="space-y-1">
                          <div className="font-black text-sm text-rose-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-rose-700" />
                            <span>Certification Threshold Not Reached</span>
                          </div>
                          <p className="text-rose-800 leading-relaxed font-medium">
                            Official certification requires strictly ≥70% (35/50 correct). You scored {latestReport.correctAnswers}/{latestReport.totalQuestions} ({latestReport.percentage}%). No certificate issued. Review weak topics in Knowledge Base and retry.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setLatestReport(null);
                              handleStart50QuestionTest();
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs cursor-pointer"
                          >
                            Retake Exam Now
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('knowledge-base')}
                            className="px-3 py-2 rounded-xl bg-white text-rose-900 font-bold border border-rose-300 hover:bg-rose-100 cursor-pointer"
                          >
                            Review in Knowledge Base
                          </button>
                        </div>
                      </div>
                    )
                  )}


                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                      <div className="text-xs text-slate-500 font-semibold">Proficiency Level</div>
                      <div className="text-sm font-black text-slate-900">{latestReport.proficiencyLevel}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                      <div className="text-xs text-slate-500 font-semibold">Correct Answers</div>
                      <div className="text-sm font-black text-emerald-700">{latestReport.correctAnswers} / {latestReport.totalQuestions}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                      <div className="text-xs text-slate-500 font-semibold">Proctor Trust Score</div>
                      <div className="text-sm font-black text-blue-700">{latestReport.antiCheatingTrustScore}% Clean</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90">
                      <div className="text-xs text-slate-500 font-semibold">Skill Credential</div>
                      <div className="text-sm font-black text-purple-700">{latestReport.percentage >= 60 ? 'Verified ✓' : 'Needs Practice'}</div>
                    </div>
                  </div>

                  {/* Topic Breakdown */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 mb-2">Topic-by-Topic Performance</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {latestReport.topicBreakdown.map((t, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 truncate">{t.topic}</span>
                          <span className="font-mono font-bold text-slate-900">{t.correct}/{t.total} ({t.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comprehensive Question-by-Question Pedagogical Review */}
                  {completedExamQuestions.length > 0 && (
                    <div className="pt-5 border-t border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h4 className="text-sm font-black text-slate-900">
                            Comprehensive Question-by-Question Pedagogical Review
                          </h4>
                          <p className="text-xs text-slate-500">
                            Detailed solution rationales, distractor explanations, and concept mastery notes
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                          {completedExamQuestions.length} Questions Evaluated
                        </span>
                      </div>

                      <div className="space-y-4">
                        {completedExamQuestions.map((q, qIdx) => {
                          const userAns = completedExamAnswers[q.id];
                          const isCorrect = userAns === q.correctIndex;
                          const wasAnswered = typeof userAns === 'number';

                          return (
                            <div
                              key={q.id || qIdx}
                              className={`p-5 rounded-3xl border transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : wasAnswered
                                  ? 'bg-rose-50/40 border-rose-200'
                                  : 'bg-amber-50/40 border-amber-200'
                              }`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-[11px] font-bold">
                                    Q{qIdx + 1}
                                  </span>
                                  <span className="font-bold text-slate-700">{q.topic}</span>
                                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                                    {q.difficulty}
                                  </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  isCorrect
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : wasAnswered
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {isCorrect ? 'Correct (+1 Mark) ✓' : wasAnswered ? 'Incorrect (-0.25 Mark) ✗' : 'Unattempted'}
                                </span>
                              </div>

                              <p className="font-bold text-slate-900 text-xs md:text-sm leading-relaxed mb-3">
                                {cleanQuestionText(q.question)}
                              </p>

                              {q.codeSnippet && (
                                <pre className="p-3.5 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-700 mb-3">
                                  <code>{q.codeSnippet}</code>
                                </pre>
                              )}

                              {/* 4 Options breakdown */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                                {q.options.map((opt: string, optIdx: number) => {
                                  const isThisCorrect = optIdx === q.correctIndex;
                                  const isThisChosen = userAns === optIdx;

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                                        isThisCorrect
                                          ? 'bg-emerald-100/80 border-emerald-300 font-bold text-emerald-950'
                                          : isThisChosen
                                          ? 'bg-rose-100/80 border-rose-300 font-bold text-rose-950'
                                          : 'bg-white border-slate-200 text-slate-600'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-[10px]">
                                          {String.fromCharCode(65 + optIdx)}.
                                        </span>
                                        <span>{opt}</span>
                                      </div>
                                      {isThisCorrect && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-black shrink-0">
                                          CORRECT
                                        </span>
                                      )}
                                      {isThisChosen && !isThisCorrect && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-black shrink-0">
                                          YOUR CHOICE
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Detailed Conceptual Explanation */}
                              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
                                <div>
                                  <span className="font-black text-slate-900 text-[11px] uppercase tracking-wide">
                                    Concept Rationale &amp; Why This Answer Is Right:
                                  </span>
                                  <p className="text-slate-700 mt-1 leading-relaxed">{q.explanation}</p>
                                </div>

                                {q.hint && (
                                  <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-700">
                                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                    <span><strong>Learning Hint:</strong> {q.hint}</span>
                                  </div>
                                )}

                                {q.learningObjective && (
                                  <div className="pt-1 text-[10px] text-slate-500">
                                    <strong>Learning Objective:</strong> {q.learningObjective}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Historical Attempts Tracking & Summary Cards */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Historical Attempt Tracking & Verified Credentials</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Continuous progress record per skill (Attempt 1, 2, 3...). Best score determines certificate accreditation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('certificates')}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    <span>View All Issued Certificates</span>
                  </button>
                </div>

                {/* Aggregated attempt cards by language */}
                {(() => {
                  const grouped: Record<string, { attempts: AssessmentReport[]; latest: AssessmentReport; best: number; previous?: AssessmentReport }> = {};
                  assessmentHistory.forEach(h => {
                    if (!grouped[h.language]) {
                      grouped[h.language] = { attempts: [], latest: h, best: h.percentage };
                    }
                    grouped[h.language].attempts.push(h);
                    if (h.percentage > grouped[h.language].best) grouped[h.language].best = h.percentage;
                  });
                  Object.keys(grouped).forEach(lang => {
                    const list = grouped[lang].attempts;
                    grouped[lang].latest = list[0];
                    if (list.length > 1) {
                      grouped[lang].previous = list[1];
                    }
                  });
                  const langKeys = Object.keys(grouped);

                  if (langKeys.length === 0) {
                    return (
                      <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                        No previous assessment attempts recorded. Complete a 50-Q assessment above to start your verified record.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {langKeys.map(lang => {
                        const item = grouped[lang];
                        const totalAttempts = item.attempts.length;
                        const isCertEarned = item.best >= 70;

                        return (
                          <div key={lang} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900">{lang}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCertEarned
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {isCertEarned ? 'Certified ✓' : 'In Progress'}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                                <div className="text-[10px] text-slate-500 font-semibold">Latest</div>
                                <div className="font-black text-slate-900">{item.latest.percentage}%</div>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                                <div className="text-[10px] text-slate-500 font-semibold">Previous</div>
                                <div className="font-black text-slate-600">
                                  {item.previous ? `${item.previous.percentage}%` : '—'}
                                </div>
                              </div>
                              <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                                <div className="text-[10px] text-slate-500 font-semibold">Best Score</div>
                                <div className="font-black text-emerald-700">{item.best}%</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
                              <span>Total Attempts: <strong>Attempt {totalAttempts}</strong></span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLanguage(lang);
                                  setSelectedModuleId('All');
                                  setSelectedTopicId('All');
                                  setSelectedDurationMins(45);
                                  handleStart50QuestionTest();
                                }}
                                className="text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer"
                              >
                                Retake Exam →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Complete History Log Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200/90">
                      <tr>
                        <th className="p-3">Attempt #</th>
                        <th className="p-3">Skill / Language</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Percentile</th>
                        <th className="p-3">Level</th>
                        <th className="p-3">Trust</th>
                        <th className="p-3">Certificate Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assessmentHistory.map((h, idx) => (
                        <tr key={h.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-500">Attempt {assessmentHistory.length - idx}</td>
                          <td className="p-3 font-bold text-slate-900">{h.language} ({h.difficulty})</td>
                          <td className="p-3 font-black text-emerald-700">{h.percentage}%</td>
                          <td className="p-3 font-semibold text-slate-700">{h.percentile}th</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">{h.proficiencyLevel}</span></td>
                          <td className="p-3 font-mono font-bold text-slate-600">{h.antiCheatingTrustScore}%</td>
                          <td className="p-3 font-mono text-[10px] text-slate-500">{h.certificateVerificationHash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: INDUSTRY OPPORTUNITIES FEED (INTERNSHIPS & JOBS) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {((activeTab === 'opportunities' && opportunitySubTab === 'jobs') || (activeTab === 'opportunities' && !['feed', 'saved'].includes(opportunitySubTab))) && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={oppSearchFilter}
                onChange={e => setOppSearchFilter(e.target.value)}
                placeholder="Search openings, companies or skills..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
              {(['All', 'Internship', 'Job', 'Industry Project', 'Workshop / Event', 'Announcement'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setOppTypeFilter(type as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    oppTypeFilter === type
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Cards Grid or Clean Empty State */}
          {filteredOpps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOpps.map(opp => {
                const isApplied = appliedIds.has(opp.id);
                const hasExternalLink = opp.application_type === 'external' && !!opp.external_apply_url;

                return (
                  <div
                    key={opp.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Posted By Announcement Header */}
                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[11px] text-slate-500 font-medium">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center text-[10px]">
                          {opp.company_name.charAt(0)}
                        </span>
                        <span className="font-bold text-slate-800">{opp.company_name}</span>
                        <span>posted a {opp.opportunity_type}</span>
                        {opp.posted_at && (
                          <span className="text-slate-400 ml-auto text-[10px]">
                            {new Date(opp.posted_at).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-50 text-slate-700 border border-slate-200/90 uppercase">
                              {opp.opportunity_type}
                            </span>
                            {opp.work_mode && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                {opp.work_mode}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                          <div className="text-xs font-medium text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {opp.location}</span>
                            {opp.stipend_or_salary && <span className="text-emerald-700 font-semibold">• {opp.stipend_or_salary}</span>}
                          </div>
                        </div>

                        {opp.deadline && (
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Deadline</span>
                            <span className="text-xs font-bold text-slate-700">{opp.deadline}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {opp.description}
                      </p>

                      {/* Targeting Info */}
                      {(opp.target_department || opp.eligible_batches || opp.min_cgpa) && (
                        <div className="text-[11px] text-slate-500 flex flex-wrap gap-2.5 pt-1 font-medium">
                          {opp.target_department && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {opp.target_department}</span>}
                          {opp.eligible_batches && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Batch {opp.eligible_batches}</span>}
                          {opp.min_cgpa && <span className="flex items-center gap-1"><BarChart2 className="w-3.5 h-3.5 text-slate-400" /> Min CGPA {opp.min_cgpa}</span>}
                        </div>
                      )}

                      {/* Skill Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {opp.required_skills.map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200/90 text-[10px] font-bold text-slate-700">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Row: Explainable Match & Direct Working Apply */}
                    <div className="pt-3 border-t border-slate-200/90 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleMatchCheck(opp)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
                      >
                        <Target className="w-3.5 h-3.5 text-amber-700" />
                        <span>Match Explainability</span>
                      </button>

                      <div>
                        {hasExternalLink ? (
                          <button
                            onClick={() => handleApplyOpportunity(opp)}
                            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <span>Apply on Company Website</span>
                            <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApplyOpportunity(opp)}
                            disabled={isApplied}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              isApplied
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white border border-slate-200/90'
                            }`}
                          >
                            {isApplied ? 'Applied on CareerConnect ✓' : 'Apply on Nova CareerConnect'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                No Industry Opportunities Published Yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                There are currently no active postings in this category. New internships and placements published by partner enterprises will appear here in real time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: SKILL GAP & CAREER ROADMAP ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {((activeTab === 'learning' && learningSubTab === 'skill-gap') || activeTab === 'skills') && skillGap && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-mono font-bold border border-slate-200/90">
                ROLE SKILL MAPPING ENGINE
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Target Role: {skillGap.target_role}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Analysis compared against industry demand patterns from 280+ recruiting partners.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={targetRole}
                onChange={async e => {
                  const newR = e.target.value;
                  setTargetRole(newR);
                  if (session?.id) {
                    await careerConnectService.saveStudentInternalProfile(session.id, { target_role: newR });
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                {CAREER_ROLES.map(r => (
                  <option key={r.id} value={r.title}>{r.title}</option>
                ))}
              </select>

              <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 text-center shadow-2xs">
                <div className="text-lg font-black text-rose-700">{skillGap.gap_percentage}%</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Skill Gap</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Acquired Competencies</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillGap.matched_skills.map((sk, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>{sk}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Critical Missing Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillGap.missing_skills.map((sk, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const foundSkill = careerConnectService.getSkillById(sk);
                      if (foundSkill) {
                        setSelectedDomainId(foundSkill.domainId);
                        setSelectedSkillId(foundSkill.id);
                        setSelectedLanguage(foundSkill.name);
                      } else {
                        setSelectedLanguage(sk);
                      }
                      setSelectedTopicId('All');
                      setActiveTab('assessment');
                    }}
                    className="px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Click to launch assessment for this missing skill"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{sk}</span>
                    <span className="text-[10px] text-rose-600 underline ml-1">Take Test →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Verified Competencies Radar / Matrix */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  ASSESSMENT-VERIFIED COMPETENCY PROFILE
                </span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  Your Multi-Disciplinary Verified Skills
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('assessment')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Take New Assessment</span>
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Strong Skills (>=75%) */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Strong (Industry Ready)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 text-[10px]">
                      {skills.filter(s => (s.test_score ?? s.self_rating * 20) >= 75).length}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {skills.filter(s => (s.test_score ?? s.self_rating * 20) >= 75).map(s => (
                      <div key={s.id} className="p-2 rounded-xl bg-white border border-emerald-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{s.skill_name}</span>
                        <span className="font-mono text-emerald-800 font-black">{s.test_score ? `${s.test_score}%` : 'Level 4-5'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Moderate Skills (50-74%) */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-amber-700" />
                      <span>Moderate (Intermediate)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px]">
                      {skills.filter(s => {
                        const sc = s.test_score ?? s.self_rating * 20;
                        return sc >= 50 && sc < 75;
                      }).length}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {skills.filter(s => {
                      const sc = s.test_score ?? s.self_rating * 20;
                      return sc >= 50 && sc < 75;
                    }).map(s => (
                      <div key={s.id} className="p-2 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{s.skill_name}</span>
                        <span className="font-mono text-amber-800 font-black">{s.test_score ? `${s.test_score}%` : 'Level 3'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Needs Improvement (<50%) */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-rose-900">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-700" />
                      <span>Needs Improvement</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-950 text-[10px]">
                      {skills.filter(s => (s.test_score ?? s.self_rating * 20) < 50).length}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {skills.filter(s => (s.test_score ?? s.self_rating * 20) < 50).map(s => (
                      <div key={s.id} className="p-2 rounded-xl bg-white border border-rose-200 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{s.skill_name}</span>
                        <span className="font-mono text-rose-800 font-black">{s.test_score ? `${s.test_score}%` : 'Foundational'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xs text-slate-600 font-medium">
                  No verified skill assessments completed yet. Take an assessment in your discipline to build your verified skill matrix.
                </p>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">Recommended Action Plan</h3>
            <div className="space-y-2">
              {skillGap.recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3">
                  <span className="p-1.5 rounded-xl bg-white border border-slate-200/90 text-amber-800 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="text-xs font-black text-slate-900">{rec.skill} — {rec.type}</div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">{rec.recommended_action}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: STUDENT INTERNAL PROFESSIONAL PROFILE (FIRESTORE) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {(activeTab === 'profile' || activeTab === 'internal-profile') && internalProfile && (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/90">
              <div className="flex items-center gap-4">
                {internalProfile.profile_photo ? (
                  <img
                    src={internalProfile.profile_photo}
                    alt={internalProfile.full_name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-900 text-white font-bold text-2xl flex items-center justify-center shadow-xs">
                    {internalProfile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{internalProfile.full_name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      Verified Student
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">{internalProfile.headline}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {internalProfile.college} • {internalProfile.department} • Semester {internalProfile.semester} • CGPA {internalProfile.cgpa}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Edit Full Profile + Privacy Setting */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={openEditProfileModal}
                  className="px-3.5 py-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile & Photo</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Visibility:</span>
                  <select
                    value={internalProfile.privacy_setting}
                    onChange={async (e) => {
                      const newPrivacy = e.target.value as any;
                      const updated = { ...internalProfile, privacy_setting: newPrivacy };
                      setInternalProfile(updated);
                      await careerConnectService.saveStudentInternalProfile(internalProfile.student_id, { privacy_setting: newPrivacy });
                      setProfileSuccessMsg('Visibility updated successfully');
                      setTimeout(() => setProfileSuccessMsg(null), 3000);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="recruiter_only">Recruiters & Faculty Only</option>
                    <option value="private">Private (Hidden from Search)</option>
                  </select>
                </div>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Target Role & Career Path Selection */}
            <div className="pt-4 pb-3 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-black text-slate-900">Target Career Role:</span>
                <span className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-black text-slate-900">
                  {internalProfile.target_role || targetRole}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('career-roles')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold border border-slate-200/90 cursor-pointer shadow-2xs"
              >
                Change Target Role & View Roadmap →
              </button>
            </div>

            {/* Bio */}
            <div className="pt-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">About / Summary</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{internalProfile.bio}</p>
            </div>
          </div>

          {/* Data-Driven Strengths & Needs Improvement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths (Computed from Verified Tests >= 75%) */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Data-Driven Strengths (From Verified Assessments)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Derived directly from proctored 50-Q exam results and verified competencies. Zero hardcoded claims.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {internalProfile.data_driven_strengths && internalProfile.data_driven_strengths.length > 0 ? (
                  internalProfile.data_driven_strengths.map((str, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{str}</span>
                    </span>
                  ))
                ) : (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-slate-500 leading-relaxed">No verified assessment scores yet.</p>
                    <p className="text-xs text-indigo-600 font-bold">→ Attempt a 50-Q certification or topic MCQ test to unlock real verified strength badges here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Needs Improvement / Gap Areas */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Needs Improvement / Focus Areas
                </h3>
              </div>
              <p className="text-[11px] text-slate-500">
                Skills with exam scores below 60% or critical requirements for target industry roles.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {internalProfile.data_driven_weaknesses && internalProfile.data_driven_weaknesses.length > 0 ? (
                  internalProfile.data_driven_weaknesses.map((w, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>{w}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-700 font-bold">No critical skill deficiencies detected!</p>
                )}
              </div>
            </div>
          </div>

          {/* Technical Skills & Verified Badges */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Technical Skill Matrix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {internalProfile.skills.map((s) => (
                <div key={s.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-900">{s.skill_name}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{s.confidence_level}</div>
                  </div>
                  {s.is_verified ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>{s.test_score}% Score</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">Self-Assessed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Engineering Projects ({internalProfile.projects?.length || 0})
              </h3>
              <button
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-amber-900 text-xs font-bold border border-slate-200/90 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {/* Add Project Form */}
            {isAddingProject && (
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                <h4 className="text-xs font-bold text-amber-900">Add New Project</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={newProject.title || ''}
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                    className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200/90 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Tech Stack (comma separated)"
                    value={Array.isArray(newProject.tech_stack) ? newProject.tech_stack.join(', ') : (newProject.tech_stack || '')}
                    onChange={e => setNewProject({ ...newProject, tech_stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200/90 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="GitHub Repo URL"
                    value={newProject.github_url || ''}
                    onChange={e => setNewProject({ ...newProject, github_url: e.target.value })}
                    className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200/90 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Live Demo URL"
                    value={newProject.live_url || ''}
                    onChange={e => setNewProject({ ...newProject, live_url: e.target.value })}
                    className="px-3 py-2 text-xs bg-white rounded-xl border border-slate-200/90 focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Project Description & Contribution"
                  value={newProject.description || ''}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-slate-200/90 focus:outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingProject(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 font-bold hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!newProject.title) return;
                      const proj: StudentProjectItem = {
                        id: `proj-${Date.now()}`,
                        title: newProject.title,
                        description: newProject.description || '',
                        tech_stack: Array.isArray(newProject.tech_stack) ? newProject.tech_stack : [],
                        github_url: newProject.github_url,
                        live_url: newProject.live_url,
                        contribution: newProject.contribution
                      };
                      const updatedProjects = [...(internalProfile.projects || []), proj];
                      const updated = { ...internalProfile, projects: updatedProjects };
                      setInternalProfile(updated);
                      await careerConnectService.saveStudentInternalProfile(internalProfile.student_id, { projects: updatedProjects });
                      setIsAddingProject(false);
                      setNewProject({});
                      setProfileSuccessMsg('Project added successfully!');
                      setTimeout(() => setProfileSuccessMsg(null), 3000);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
                  >
                    Save Project
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {internalProfile.projects && internalProfile.projects.map((proj) => (
                <div key={proj.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-black text-slate-900">{proj.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.tech_stack.map((t, ti) => (
                        <span key={ti} className="px-2 py-0.5 bg-white border border-slate-200/90 text-[10px] font-bold text-slate-700 rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {proj.live_url && (
                      <a
                        href={proj.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Live</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications & Experience Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certifications */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Certifications & Badges
              </h3>
              <div className="space-y-2">
                {internalProfile.certifications.map((c) => (
                  <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{c.issuer} • {c.issue_date}</div>
                    </div>
                    {c.is_verified && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        Score: {c.score}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Links */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Professional Web & Portfolio Links
              </h3>
              <div className="space-y-2">
                {internalProfile.portfolio_links.resume_ai_portfolio && (
                  <a
                    href={internalProfile.portfolio_links.resume_ai_portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-slate-900">NovaResume AI Portfolio</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </a>
                )}
                {internalProfile.portfolio_links.github && (
                  <a
                    href={internalProfile.portfolio_links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GithubIcon className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-bold text-slate-900">GitHub Profile</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </a>
                )}
                {internalProfile.portfolio_links.linkedin && (
                  <a
                    href={internalProfile.portfolio_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <LinkedinIcon className="w-4 h-4 text-blue-700" />
                      <span className="text-xs font-bold text-slate-900">LinkedIn Profile</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: SAVED OPPORTUNITIES (FIRESTORE PERSISTENT) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {((activeTab === 'opportunities' && opportunitySubTab === 'saved') || activeTab === 'saved-opps') && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 font-black text-sm">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Saved Opportunities & Bookmarks ({savedPosts.length})
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  Persists permanently across sessions and devices in Firestore.
                </p>
              </div>
            </div>
          </div>

          {isLoadingSaved ? (
            <div className="p-8 text-center text-xs text-slate-400 font-bold">
              Loading bookmarked opportunities...
            </div>
          ) : savedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPosts.map(post => (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900">{post.company_name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200/90 text-[10px] font-bold text-slate-700">
                        {post.post_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {post.message}
                    </p>
                    {post.skills && post.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-white text-[9px] font-bold text-slate-600 border border-slate-200/90">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/90 flex items-center justify-between gap-2">
                    {post.primary_apply_url ? (
                      <button
                        type="button"
                        onClick={() => {
                          careerConnectService.recordExternalLinkClick(post.id, session);
                          window.open(post.primary_apply_url, '_blank', 'noopener,noreferrer');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>Register / Apply Externally</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Official Notice</span>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        if (!session?.id) return;
                        await careerConnectService.toggleSavePost(post.id, session.id);
                        loadSavedOpportunities(session.id);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold border border-slate-200/90 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                No Saved Opportunities Yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Click the bookmark icon on any opportunity post in the Industry Feed to save it for later reference.
              </p>
              <button
                onClick={() => {
                  setActiveTab('opportunities');
                  setOpportunitySubTab('feed');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Browse Industry Feed
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: DIRECT MESSAGING VIEW ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'messages' && session && (
        <div className="h-[750px]">
          <DirectMessagingView
            session={session}
            targetUser={messagingTarget}
            onClearTarget={() => setMessagingTarget(null)}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: TECHNICAL KNOWLEDGE BASE ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {((activeTab === 'learning' && learningSubTab === 'languages') || activeTab === 'knowledge-base') && (
        <KnowledgeBaseView
          onStartTopicPractice={handleStartTopicPractice}
          onStartFinalCertification={handleStartFinalCertification}
          initialLanguage={selectedLanguage}
          department={department}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: CAREER ROLES & ROADMAPS ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {((activeTab === 'learning' && learningSubTab === 'roadmaps') || activeTab === 'career-roles') && (
        <CareerRolesView
          session={session}
          studentSkills={skills}
          currentTargetRole={internalProfile?.target_role || targetRole}
          onSetTargetRole={handleSetTargetRole}
          onNavigateToKnowledgeBase={(lang, _mod, _top) => {
            const validLang = (['Python', 'Java', 'SQL', 'C++'].find(
              l => l.toLowerCase() === lang.toLowerCase()
            ) || 'Python') as 'Python' | 'Java' | 'SQL' | 'C++';
            setSelectedLanguage(validLang);
            setActiveTab('learning');
            setLearningSubTab('languages');
          }}
          onStartSkillAssessment={handleStartSkillAssessmentFromRole}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB: CERTIFICATES & BADGES ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {((activeTab === 'assessments' && assessmentSubTab === 'certificates') || activeTab === 'certificates') && (
        <CertificatesView
          session={session}
          onNavigateToAssessment={() => {
            setActiveTab('assessments');
            setAssessmentSubTab('tests');
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: EXPLAINABLE MATCH BREAKDOWN (50/15/15/10/10) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 text-slate-900 max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 text-[10px] font-mono font-bold border border-slate-200/90">
                EXPLAINABLE MATCH ENGINE
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">{selectedMatch.opp.title}</h3>
              <p className="text-xs text-slate-500">{selectedMatch.opp.company_name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600">Deterministic Match Score</div>
                <div className="text-2xl font-black text-emerald-700">{selectedMatch.match.overall_score}%</div>
              </div>
              <span className="text-xs font-bold text-slate-700 max-w-[200px] text-right">
                {selectedMatch.match.recommendation}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 uppercase">5-Factor Weight Breakdown</h4>
              <div className="space-y-1 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Required Skills (50% wt):</span>
                  <span className="font-bold text-slate-900">{selectedMatch.match.breakdown.required_skills}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Preferred Skills (15% wt):</span>
                  <span className="font-bold text-slate-900">{selectedMatch.match.breakdown.preferred_skills}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Academic Eligibility (15% wt):</span>
                  <span className="font-bold text-slate-900">{selectedMatch.match.breakdown.eligibility}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Verified Portfolio Evidence (10% wt):</span>
                  <span className="font-bold text-slate-900">{selectedMatch.match.breakdown.portfolio_evidence}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                  <span className="text-slate-600">Certifications & Badges (10% wt):</span>
                  <span className="font-bold text-slate-900">{selectedMatch.match.breakdown.certifications}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMatch(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: COMPREHENSIVE STUDENT PROFILE & PHOTO EDIT (FIRESTORE) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200/90 flex items-center justify-between bg-slate-50">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-black border border-amber-300">
                  FIRESTORE PERSISTED PROFILE
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Edit Student Profile & Photo</h3>
                <p className="text-xs text-slate-500">
                  Updates your internal student profile in Firestore (`studentProfiles/{session?.id || 'demo-student-1'}`).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-600 cursor-pointer border border-slate-200/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Scrollable Form */}
            <form onSubmit={handleSaveFullProfile} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Photo Upload & Preview Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Profile Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {editProfileData.profile_photo ? (
                    <img
                      src={editProfileData.profile_photo}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-900 text-white font-bold text-2xl flex items-center justify-center shadow-xs">
                      {(editProfileData.full_name || 'V').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          className="hidden"
                        />
                      </label>
                      {editProfileData.profile_photo && (
                        <button
                          type="button"
                          onClick={() => setEditProfileData(prev => ({ ...prev, profile_photo: '' }))}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={editProfileData.profile_photo}
                      onChange={e => setEditProfileData({ ...editProfileData, profile_photo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Personal & Target Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editProfileData.full_name}
                    onChange={e => setEditProfileData({ ...editProfileData, full_name: e.target.value })}
                    placeholder="e.g. Ved Dhobi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Career Role</label>
                  <select
                    value={editProfileData.target_role}
                    onChange={e => setEditProfileData({ ...editProfileData, target_role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                  >
                    {CAREER_ROLES.map(r => (
                      <option key={r.id} value={r.title}>{r.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={editProfileData.headline}
                  onChange={e => setEditProfileData({ ...editProfileData, headline: e.target.value })}
                  placeholder="e.g. Full Stack & AI Engineer | B.Tech Computer Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>

              {/* Bio / Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">About / Bio</label>
                <textarea
                  rows={3}
                  value={editProfileData.bio}
                  onChange={e => setEditProfileData({ ...editProfileData, bio: e.target.value })}
                  placeholder="Share a brief overview of your technical passions, background, and career focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>

              {/* Academic Profile Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Academic Status & Institution
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Degree / Program</label>
                    <input
                      type="text"
                      value={editProfileData.degree}
                      onChange={e => setEditProfileData({ ...editProfileData, degree: e.target.value })}
                      placeholder="e.g. B.Tech in Computer Engineering"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
                    <input
                      type="text"
                      value={editProfileData.college}
                      onChange={e => setEditProfileData({ ...editProfileData, college: e.target.value })}
                      placeholder="e.g. Government Engineering College, Modasa (GEC Modasa)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <select
                      value={editProfileData.department}
                      onChange={e => setEditProfileData({ ...editProfileData, department: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="AI & Data Science">AI & Data Science</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Management & Commerce">Management & Commerce</option>
                      <option value="Biotechnology & Life Sciences">Biotechnology & Life Sciences</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                      <select
                        value={editProfileData.semester}
                        onChange={e => setEditProfileData({ ...editProfileData, semester: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CGPA</label>
                      <input
                        type="text"
                        value={editProfileData.cgpa}
                        onChange={e => setEditProfileData({ ...editProfileData, cgpa: e.target.value })}
                        placeholder="e.g. 8.8"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Links Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editProfileData.email}
                    onChange={e => setEditProfileData({ ...editProfileData, email: e.target.value })}
                    placeholder="name@college.edu"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editProfileData.phone}
                    onChange={e => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editProfileData.location}
                    onChange={e => setEditProfileData({ ...editProfileData, location: e.target.value })}
                    placeholder="City, State"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* External Links & Portfolios (Multi-Disciplinary) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile</label>
                  <input
                    type="url"
                    value={editProfileData.github}
                    onChange={e => setEditProfileData({ ...editProfileData, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={editProfileData.linkedin}
                    onChange={e => setEditProfileData({ ...editProfileData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio / Website</label>
                  <input
                    type="url"
                    value={editProfileData.website}
                    onChange={e => setEditProfileData({ ...editProfileData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Engineering & Research Portfolios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CAD / 3D Design Showcase (GrabCAD / Autodesk Viewer)
                  </label>
                  <input
                    type="url"
                    value={editProfileData.cad_portfolio}
                    onChange={e => setEditProfileData({ ...editProfileData, cad_portfolio: e.target.value })}
                    placeholder="https://grabcad.com/library/... or Autodesk viewer"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Research / Publications (ResearchGate / Google Scholar)
                  </label>
                  <input
                    type="url"
                    value={editProfileData.research_gate}
                    onChange={e => setEditProfileData({ ...editProfileData, research_gate: e.target.value })}
                    placeholder="https://researchgate.net/profile/..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200/90 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/90 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Saving to Firestore...' : 'Save Profile & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};