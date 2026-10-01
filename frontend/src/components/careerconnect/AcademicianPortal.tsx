import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Download, BarChart3, Filter, ShieldCheck, Building2,
  Briefcase, Plus, Search, Share2,
  Sparkles, Check, CheckCircle2, FileText,
  ArrowUpRight, X,
  LayoutDashboard, HelpCircle, User, Mail, MessageSquare,
  GraduationCap, Clock, RefreshCw, AlertCircle, ChevronRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { careerConnectService } from '../../services/careerConnectService';
import { DirectMessagingView } from './DirectMessagingView';
import {
  DonutChart, VerticalBarChart, HorizontalBarChart, ComparisonBarChart,
  CHART_COLORS, type DonutSlice, type BarDataPoint, type HorizontalBarItem
} from './CareerCharts';
import type {
  DepartmentAnonymousStats, OpportunityItem, AuthUserSession,
  CurriculumGapItem, FacultyOpportunityItem, IndustryPostItem,
  BankQuestion, QuestionDifficulty, QuestionReviewStatus,
  DepartmentFilterParams
} from '../../types/careerConnect';

interface Props {
  activeSection?: string;
  onNavigateSection?: (section: string) => void;
}

export const AcademicianPortal: React.FC<Props> = ({
  activeSection = 'dashboard',
  onNavigateSection
}) => {
  const [session, setSession] = useState<AuthUserSession | null>(null);
  const [departmentName, setDepartmentName] = useState('Computer Engineering');
  const [institutionName, setInstitutionName] = useState('Government Engineering College, Modasa (GEC Modasa)');

  // ── Filters ──
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  const [selectedGraduationYear, setSelectedGraduationYear] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedScoreRange, setSelectedScoreRange] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');

  // ── Real Database State ──
  const [stats, setStats] = useState<DepartmentAnonymousStats | null>(null);
  const [curriculumGaps, setCurriculumGaps] = useState<CurriculumGapItem[]>([]);
  const [hasCurriculum, setHasCurriculum] = useState(false);
  const [facultyOpps, setFacultyOpps] = useState<FacultyOpportunityItem[]>([]);
  const [industryOpps, setIndustryOpps] = useState<OpportunityItem[]>([]);
  const [industryPosts, setIndustryPosts] = useState<IndustryPostItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Question Bank Explorer State ──
  const [qbLanguage, setQbLanguage] = useState<'Python' | 'Java' | 'SQL' | 'C++'>('Python');
  const [qbDifficulty, setQbDifficulty] = useState<string>('All');
  const [qbStatusFilter, setQbStatusFilter] = useState<string>('All');
  const [qbSearch, setQbSearch] = useState('');
  const [qRefreshKey, setQRefreshKey] = useState(0);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState<{
    domainId: string;
    skillName: string;
    programmingLanguage: string;
    module: string;
    topic: string;
    subtopic: string;
    difficulty: QuestionDifficulty;
    questionType: any;
    question: string;
    codeSnippet: string;
    diagramDescription: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>({
    domainId: 'mechanical',
    skillName: 'SolidWorks',
    programmingLanguage: 'SolidWorks',
    module: 'Core Competency',
    topic: '2D Sketching & Geometric Relations',
    subtopic: '',
    difficulty: 'Medium',
    questionType: 'conceptual',
    question: '',
    codeSnippet: '',
    diagramDescription: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });

  // ── Modals ──
  const [showAddCurriculumModal, setShowAddCurriculumModal] = useState(false);
  const [newTopicCourse, setNewTopicCourse] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSkill, setNewTopicSkill] = useState('Python');
  const [newTopicSemester, setNewTopicSemester] = useState(6);
  const [newTopicCoverage, setNewTopicCoverage] = useState(60);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState<'Placement Cell' | 'Head of Department' | 'Dean / Administration'>('Placement Cell');
  const [shareSuccess, setShareSuccess] = useState(false);

  // ── Active Navigation Tab (5 Streamlined Hubs) ──
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'student-performance' | 'curriculum' | 'mentorship' | 'profile'
  >('dashboard');

  // ── Contextual Sub-Tab States ──
  const [performanceSubTab, setPerformanceSubTab] = useState<'matrix' | 'reports'>('matrix');
  const [curriculumSubTab, setCurriculumSubTab] = useState<'question-bank' | 'curriculum-gap'>('question-bank');
  const [mentorshipSubTab, setMentorshipSubTab] = useState<'messages' | 'opportunities'>('messages');

  const handleSelectTab = (tabId: 'dashboard' | 'student-performance' | 'curriculum' | 'mentorship' | 'profile') => {
    setActiveTab(tabId);
    if (onNavigateSection) {
      onNavigateSection(tabId);
    }
  };

  // ── Faculty Profile State ──
  const [facultyDesignation, setFacultyDesignation] = useState('Associate Professor & Academic Mentor');
  const [facultySpecializations, setFacultySpecializations] = useState<string[]>([
    'Data Structures & Algorithms',
    'Python & Backend Engineering',
    'Database Systems (SQL & NoSQL)',
    'Cloud Architecture'
  ]);
  const [newSpecInput, setNewSpecInput] = useState('');
  const [facultyOfficeHours, setFacultyOfficeHours] = useState('Monday - Thursday: 2:00 PM - 5:00 PM');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Active filter params memo
  const filterParams: DepartmentFilterParams = useMemo(() => ({
    semester: selectedSemester,
    academicYear: selectedAcademicYear,
    graduationYear: selectedGraduationYear,
    language: selectedLanguage,
    difficulty: selectedDifficulty,
    scoreRange: selectedScoreRange,
    dateRange: selectedDateRange
  }), [
    selectedSemester, selectedAcademicYear, selectedGraduationYear,
    selectedLanguage, selectedDifficulty, selectedScoreRange, selectedDateRange
  ]);

  useEffect(() => {
    const curSession = careerConnectService.getCurrentSession();
    setSession(curSession);
    const dept = curSession?.department || departmentName || 'Computer Engineering';
    const inst = curSession?.institution || institutionName || 'Government Engineering College, Modasa (GEC Modasa)';
    if (curSession?.department) setDepartmentName(curSession.department);
    if (curSession?.institution) setInstitutionName(curSession.institution);

    loadDashboardData(dept, inst, filterParams);

    const unsubAnalytics = careerConnectService.subscribeDepartmentAnalytics(
      dept,
      inst,
      filterParams,
      (liveStats) => {
        if (liveStats) {
          setStats(liveStats);
        }
      }
    );

    const unsubPosts = careerConnectService.subscribeIndustryPosts(
      { department: dept },
      (livePosts) => {
        setIndustryPosts(livePosts);
      }
    );

    return () => {
      unsubAnalytics();
      unsubPosts();
    };
  }, [filterParams]);

  useEffect(() => {
    if (activeSection === 'dashboard' || activeSection === 'overview') {
      setActiveTab('dashboard');
    } else if (['student-performance', 'skills', 'skill-dev', 'department-skills'].includes(activeSection)) {
      setActiveTab('student-performance');
      setPerformanceSubTab('matrix');
    } else if (activeSection === 'reports') {
      setActiveTab('student-performance');
      setPerformanceSubTab('reports');
    } else if (['curriculum', 'assessments', 'question-bank'].includes(activeSection)) {
      setActiveTab('curriculum');
      setCurriculumSubTab('question-bank');
    } else if (['skill-gap', 'curriculum-gap'].includes(activeSection)) {
      setActiveTab('curriculum');
      setCurriculumSubTab('curriculum-gap');
    } else if (['mentorship', 'messages', 'mentorship-messages', 'direct-messages'].includes(activeSection)) {
      setActiveTab('mentorship');
      setMentorshipSubTab('messages');
    } else if (['opportunities', 'internships', 'industry-opps', 'faculty-opps', 'collaboration'].includes(activeSection)) {
      setActiveTab('mentorship');
      setMentorshipSubTab('opportunities');
    } else if (activeSection === 'profile') {
      setActiveTab('profile');
    }
  }, [activeSection]);

  const loadDashboardData = async (dept: string, inst: string, filters: DepartmentFilterParams) => {
    setLoading(true);
    try {
      const st = await careerConnectService.getDepartmentAnonymousAnalytics(dept, inst, filters);
      setStats(st);

      const gapData = await careerConnectService.getCurriculumSkillGap(dept, filters.semester !== 'all' ? parseInt(filters.semester || '6') : undefined);
      setHasCurriculum(gapData.hasCurriculum);
      setCurriculumGaps(gapData.comparison);

      const fOpps = await careerConnectService.getFacultyOpportunities();
      setFacultyOpps(fOpps);

      const indOpps = await careerConnectService.getOpportunities({ department: dept });
      setIndustryOpps(indOpps);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedSemester('all');
    setSelectedAcademicYear('all');
    setSelectedGraduationYear('all');
    setSelectedLanguage('all');
    setSelectedDifficulty('all');
    setSelectedScoreRange('all');
    setSelectedDateRange('all');
  };

  // Add Curriculum Topic handler
  const handleAddCurriculumTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !newTopicCourse.trim()) return;

    careerConnectService.addCurriculumTopic({
      course_name: newTopicCourse.trim(),
      topic_name: newTopicName.trim(),
      skill_tag: newTopicSkill,
      department: departmentName,
      semester: newTopicSemester,
      hours_allocated: 16,
      coverage_percentage: newTopicCoverage
    });

    setShowAddCurriculumModal(false);
    setNewTopicName('');
    setNewTopicCourse('');
    loadDashboardData(departmentName, institutionName, filterParams);
  };

  // Question bank items filtered with Status and Search
  const questionBankItems = useMemo(() => {
    let items = careerConnectService.getQuestionsForLanguage(qbLanguage);
    if (qbDifficulty !== 'All') {
      items = items.filter(q => q.difficulty === qbDifficulty);
    }
    if (qbStatusFilter !== 'All') {
      items = items.filter(q => (q.status || 'Published') === qbStatusFilter);
    }
    if (qbSearch.trim()) {
      const s = qbSearch.toLowerCase();
      items = items.filter(q =>
        q.question.toLowerCase().includes(s) ||
        q.topic.toLowerCase().includes(s) ||
        (q.subtopic && q.subtopic.toLowerCase().includes(s))
      );
    }
    return items;
  }, [qbLanguage, qbDifficulty, qbStatusFilter, qbSearch, qRefreshKey]);

  const handleUpdateQuestionStatus = async (qId: string, newStatus: QuestionReviewStatus) => {
    await careerConnectService.updateQuestionStatus(qId, newStatus);
    setQRefreshKey(k => k + 1);
  };

  const handleSaveNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.question.trim() || newQuestionForm.options.some(o => !o.trim())) {
      alert('Please fill in the question and all 4 options.');
      return;
    }

    const q: BankQuestion = {
      id: `q-fac-${Date.now()}`,
      programmingLanguage: newQuestionForm.programmingLanguage,
      module: newQuestionForm.module || 'custom-faculty',
      topic: newQuestionForm.topic || 'General',
      subtopic: newQuestionForm.subtopic || undefined,
      difficulty: newQuestionForm.difficulty,
      questionType: newQuestionForm.questionType,
      question: newQuestionForm.question.trim(),
      codeSnippet: newQuestionForm.codeSnippet.trim() || undefined,
      options: newQuestionForm.options.map(o => o.trim()),
      correctIndex: newQuestionForm.correctIndex,
      explanation: newQuestionForm.explanation.trim() || 'Verified by Department Faculty.',
      marks: 1,
      negativeMarks: 0.25,
      estimatedTimeSeconds: 60,
      status: 'Published'
    };

    await careerConnectService.saveFacultyQuestion(q);
    setShowAddQuestionModal(false);
    setQRefreshKey(k => k + 1);
    setNewQuestionForm({
      domainId: 'mechanical',
      skillName: 'SolidWorks',
      programmingLanguage: 'Python',
      module: 'Part Modeling',
      topic: 'Parametric Feature Modeling',
      subtopic: '',
      difficulty: 'Medium',
      questionType: 'conceptual',
      question: '',
      codeSnippet: '',
      diagramDescription: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    });
  };

  // ── Donut Chart Data: Student Skill Distribution ──
  const skillDonutData: DonutSlice[] = useMemo(() => {
    if (!stats || stats.assessedCount === 0 || !stats.scoreDistribution) return [];
    return stats.scoreDistribution.map(d => ({
      label: d.range,
      value: d.percentage,
      sublabel: `${d.count} students`,
      color: d.range.includes('Strong')
        ? CHART_COLORS.emerald
        : d.range.includes('Moderate')
        ? CHART_COLORS.amber
        : CHART_COLORS.rose
    }));
  }, [stats]);

  // ── 5-Bin Histogram Data: Assessment Score Distribution ──
  const scoreHistogramData: BarDataPoint[] = useMemo(() => {
    if (!stats || !stats.histogramDistribution || stats.histogramDistribution.length === 0) return [];
    return stats.histogramDistribution.map(h => ({
      label: h.range,
      sublabel: `${h.percentage}%`,
      value: h.count,
      percentage: h.percentage,
      color: h.range.includes('81-100')
        ? '#10B981'
        : h.range.includes('61-80')
        ? '#3B82F6'
        : h.range.includes('41-60')
        ? '#F59E0B'
        : '#EF4444'
    }));
  }, [stats]);

  // ── Language Performance Bar Data ──
  const languageBarData: BarDataPoint[] = useMemo(() => {
    if (!stats || !stats.topSkillsProficiency || stats.topSkillsProficiency.length === 0) return [];
    return stats.topSkillsProficiency.map(s => ({
      label: s.skill,
      sublabel: `${s.studentCount} tests`,
      value: s.avgScore,
      percentage: s.avgScore,
      color: s.avgScore >= 75 ? '#10B981' : s.avgScore >= 60 ? '#F59E0B' : '#EF4444'
    }));
  }, [stats]);

  // ── Topic Breakdown Data ──
  const topicBreakdownBarData: HorizontalBarItem[] = useMemo(() => {
    if (!stats || !stats.topicPerformance || stats.topicPerformance.length === 0) return [];
    return stats.topicPerformance.map(t => ({
      name: t.topic,
      value: t.avgScore,
      benchmark: 75,
      status: t.avgScore >= 75 ? 'Strong' : t.avgScore >= 60 ? 'Moderate' : 'Needs Improvement'
    }));
  }, [stats]);

  // ── Industry Comparison Items ──
  const industryComparisonData = useMemo(() => {
    if (!stats || !stats.industryComparison) return [];
    return stats.industryComparison.map(c => ({
      skill: c.skill,
      curriculumCoveragePct: c.studentScore,
      industryDemandPct: c.industryDemand,
      gapPercentage: c.gap,
      priority: c.gap >= 25 ? ('High' as const) : c.gap >= 15 ? ('Medium' as const) : ('Low' as const),
      recommendedAction: `Organize targeted technical workshops in ${c.skill} to bridge the ${c.gap}% industry readiness deficit.`
    }));
  }, [stats]);

  // ── Export CSV Report ──
  const handleExportCsv = () => {
    if (!stats) return;
    const rows = [
      ['Department Student Performance & Skill Analysis Report', ''],
      ['Department', stats.department],
      ['Institution', stats.institution],
      ['Department Total Students', stats.totalStudents.toString()],
      ['Assessed Students Count', stats.assessedCount.toString()],
      ['Average Score (%)', stats.avgReadinessScore.toString()],
      ['Average Accuracy (%)', stats.avgAccuracy.toString()],
      ['Filter - Semester', selectedSemester],
      ['Filter - Language', selectedLanguage],
      ['Filter - Difficulty', selectedDifficulty],
      ['Filter - Score Range', selectedScoreRange],
      ['Filter - Date Range', selectedDateRange],
      ['Generated On', new Date().toLocaleDateString('en-IN')],
      [''],
      ['SKILL LEVEL DISTRIBUTION', 'STUDENTS COUNT', 'PERCENTAGE'],
      ...stats.scoreDistribution.map(s => [s.range, s.count.toString(), `${s.percentage}%`]),
      [''],
      ['ASSESSMENT SCORE HISTOGRAM (5 BINS)', 'STUDENTS COUNT', 'PERCENTAGE'],
      ...stats.histogramDistribution.map(h => [h.range, h.count.toString(), `${h.percentage}%`]),
      [''],
      ['PROGRAMMING LANGUAGE SKILLS', 'AVERAGE SCORE (%)', 'ASSESSMENT ATTEMPTS'],
      ...stats.topSkillsProficiency.map(s => [s.skill, s.avgScore.toString(), s.studentCount.toString()]),
      [''],
      ['TOPIC PERFORMANCE', 'AVERAGE SCORE (%)', 'ASSESSMENT ATTEMPTS'],
      ...(stats.topicPerformance || []).map(t => [t.topic, t.avgScore.toString(), t.attemptsCount.toString()]),
      [''],
      ['INDUSTRY SKILL COMPARISON', 'STUDENT SCORE (%)', 'INDUSTRY DEMAND (%)', 'GAP (%)'],
      ...(stats.industryComparison || []).map(c => [c.skill, c.studentScore.toString(), c.industryDemand.toString(), `${c.gap}%`])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Department_Skill_Report_${stats.department.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Export PDF Report with rendered visual charts ──
  const handleExportPdf = async () => {
    if (!reportContainerRef.current) return;
    setIsExportingPdf(true);
    try {
      const element = reportContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Department_Performance_Report_${departmentName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShareReport = () => {
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShowShareModal(false);
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* ── HEADER BANNER: STUDENT PERFORMANCE — [DEPARTMENT] ── */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                Faculty & Academician Portal
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Anonymous Aggregates Only
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Student Performance — {departmentName}
            </h1>
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{institutionName}</span>
              {session?.full_name && (
                <span className="text-slate-400 ml-2 font-medium">• Academic Mentor: {session.full_name}</span>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              Share Report
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf || !stats}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-slate-100 transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-800" />
              {isExportingPdf ? 'Exporting PDF...' : 'Download PDF Report'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar (5 Streamlined Hubs) */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'student-performance', label: 'Student Performance', icon: BarChart3 },
            { id: 'curriculum', label: 'Curriculum & Tests', icon: Sparkles },
            { id: 'mentorship', label: 'Mentorship & Industry', icon: MessageSquare },
            { id: 'profile', label: 'Faculty Profile', icon: User }
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-300' : 'text-slate-400'}`} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTER TOOLBAR (DEPARTMENT FILTERS) ── */}
      {(activeTab === 'dashboard' || activeTab === 'student-performance') && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Filter className="w-3.5 h-3.5 text-purple-600" />
              <span>Department Analytics Filters:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => loadDashboardData(departmentName, institutionName, filterParams)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
            {/* Semester Filter */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={e => setSelectedSemester(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Semesters (1-8)</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={e => setSelectedAcademicYear(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Academic Years</option>
                <option value="2025-2026">2025 - 2026</option>
                <option value="2024-2025">2024 - 2025</option>
                <option value="2023-2024">2023 - 2024</option>
              </select>
            </div>

            {/* Skill / Programming Language */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Language / Skill</label>
              <select
                value={selectedLanguage}
                onChange={e => setSelectedLanguage(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Languages</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="SQL">SQL</option>
                <option value="C++">C++</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy (Foundational)</option>
                <option value="Medium">Medium (Intermediate)</option>
                <option value="Hard">Hard (Advanced)</option>
                <option value="Industry">Industry Ready</option>
              </select>
            </div>

            {/* Score Range */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Score Band</label>
              <select
                value={selectedScoreRange}
                onChange={e => setSelectedScoreRange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Scores</option>
                <option value="80-100">Strong (80% - 100%)</option>
                <option value="60-79">Moderate (60% - 79%)</option>
                <option value="<60">Needs Imp. (&lt; 60%)</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Time Period</label>
              <select
                value={selectedDateRange}
                onChange={e => setSelectedDateRange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="all">All Recorded History</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="semester">Current Semester</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
      {activeTab === 'dashboard' && (
        <div ref={reportContainerRef} className="space-y-6">
          {/* 4 TOP SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-amber-200/80 shadow-xs">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Department Students</div>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {stats?.totalStudents || 0}
              </div>
              <div className="text-xs text-amber-700 mt-1">
                Registered cohort in {departmentName}
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Students Assessed</div>
              <div className="text-3xl font-black text-purple-700 mt-2">
                {stats?.assessedCount || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {stats && stats.totalStudents > 0
                  ? `${Math.round((stats.assessedCount / stats.totalStudents) * 100)}% cohort participation`
                  : 'Awaiting assessments'}
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Score</div>
              <div className="text-3xl font-black text-emerald-600 mt-2">
                {stats && stats.assessedCount > 0 ? `${stats.avgReadinessScore}%` : '—'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Mean performance across verified tests
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Accuracy</div>
              <div className="text-3xl font-black text-blue-600 mt-2">
                {stats && stats.assessedCount > 0 ? `${stats.avgAccuracy}%` : '—'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Correct answers per attempted questions
              </div>
            </div>
          </div>

          {/* VISUAL CHARTS GRID: DONUT + 5-BIN HISTOGRAM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Donut Chart: Student Skill Level Distribution */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Student Skill Distribution
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Donut View
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Composition across Strong (≥75%), Moderate (60-74%), and Needs Improvement (&lt;60%).
                </p>
              </div>

              {stats && stats.assessedCount > 0 ? (
                <DonutChart
                  data={skillDonutData}
                  centerLabel={`${stats.avgReadinessScore}%`}
                  centerSublabel="Avg Score"
                  size={210}
                />
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 my-4">
                  <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No Data Available Yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Students have not completed any 50-question assessments for {selectedLanguage === 'all' ? 'the selected department' : selectedLanguage}.
                  </p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-4 text-center">
                Strict Privacy: Individual student names and roll numbers are never exposed.
              </div>
            </div>

            {/* 5-Bin Histogram: Assessment Score Distribution */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Assessment Score Distribution
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    5-Bin Histogram
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Student distribution across 5 performance tiers (0-20%, 21-40%, 41-60%, 61-80%, 81-100%).
                </p>
              </div>

              {stats && stats.assessedCount > 0 ? (
                <VerticalBarChart
                  data={scoreHistogramData}
                  height={220}
                  unit="students"
                  emptyMessage="No assessment scores recorded for this filter."
                />
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 my-4">
                  <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No Score Records</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    When students take assessments in this department, score bands will populate in real time.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-4">
                <span>Filter: Semester {selectedSemester === 'all' ? '1-8' : selectedSemester}</span>
                <span>Language: {selectedLanguage}</span>
              </div>
            </div>
          </div>

          {/* VISUAL CHARTS ROW 2: PROGRAMMING LANGUAGE PERFORMANCE + SKILL GAP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Programming Language Skills */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Programming Language Skills
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Avg Score %
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Comparative performance across Python, Java, SQL, and C++.
                </p>
              </div>

              {languageBarData.length > 0 ? (
                <VerticalBarChart
                  data={languageBarData}
                  height={200}
                  unit="%"
                  emptyMessage="No language records found."
                />
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 my-4">
                  <BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No Language Records</p>
                  <p className="text-xs text-slate-400 mt-1">Assessments taken in Python, Java, SQL, and C++ will be benchmarked here.</p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-4">
                Target Proficiency Benchmark: 75%
              </div>
            </div>

            {/* Curriculum & Industry Skill Gap / Student Skills vs Industry Requirements */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Student Skills vs Industry Requirements
                  </h3>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Industry Alignment
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Benchmarking cohort proficiency against live recruiter demand targeting {departmentName}.
                </p>
              </div>

              {stats && stats.industryDemandAvailable && industryComparisonData.length > 0 ? (
                <ComparisonBarChart
                  data={industryComparisonData}
                  title="Cohort Score vs Live Recruiter Demand"
                  emptyMessage="No active industry gaps"
                />
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 my-4">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Industry Demand Data Unavailable</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Waiting for recruiter job postings targeting {departmentName}. Once published, real market demand will be computed automatically.
                  </p>
                </div>
              )}

              <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span>Data Source: Active Recruiter Job Posts</span>
                <button
                  onClick={() => {
                    handleSelectTab('curriculum');
                    setCurriculumSubTab('curriculum-gap');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                >
                  View Full Gap Analysis →
                </button>
              </div>
            </div>
          </div>

          {/* QUICK RECENT INDUSTRY OPPORTUNITIES FEED (2-3 ITEMS) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recent Industry Opportunities Targeting {departmentName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Internships, drives, and announcements shared by verified employers.
                </p>
              </div>
              <button
                onClick={() => {
                  handleSelectTab('mentorship');
                  setMentorshipSubTab('opportunities');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Feed ({industryPosts.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {industryPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {industryPosts.slice(0, 2).map(post => (
                  <div key={post.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{post.company_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {post.post_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 line-clamp-2">{post.message}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {post.skills?.slice(0, 3).join(', ') || 'Technical'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (post.primary_apply_url) {
                              navigator.clipboard.writeText(post.primary_apply_url);
                              alert('Opportunity link copied! Share with your students.');
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              alert('Link copied to clipboard!');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Share2 className="w-3 h-3 text-amber-300" />
                          <span>Share</span>
                        </button>
                        {post.primary_apply_url && (
                          <a
                            href={post.primary_apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <span>Link</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No Active Posts Yet</p>
                <p className="text-xs text-slate-400 mt-1">When recruiters post opportunities targeting {departmentName}, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: STUDENT PERFORMANCE & ACCREDITATION REPORTS ── */}
      {activeTab === 'student-performance' && (
        <div className="space-y-6">
          {/* Sub-nav pills */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/80">
            <button
              onClick={() => setPerformanceSubTab('matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                performanceSubTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
              Topic Performance & Scores
            </button>
            <button
              onClick={() => setPerformanceSubTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                performanceSubTab === 'reports'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Accreditation Reports & PDF
            </button>
          </div>

          {performanceSubTab === 'matrix' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Department Student Performance & Topic Analytics
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Granular topic-level strengths, areas needing improvement, and language mastery across {departmentName} cohort.
                </p>
              </div>

              {/* Highlight Cards: Strongest Topics vs Weakest Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strongest Topics */}
                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Strongest Topics (Cohort Strengths)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      ≥ 75% Mastery
                    </span>
                  </div>
                  {stats?.strongestTopics && stats.strongestTopics.length > 0 ? (
                    <div className="space-y-2">
                      {stats.strongestTopics.map((t, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{t.topic}</span>
                          <span className="text-xs font-black text-emerald-700">{t.avgScore}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 italic">No topic scores evaluated yet.</p>
                  )}
                </div>

                {/* Weakest Topics */}
                <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Topics Needing Improvement (Faculty Focus)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      &lt; 60% Foundational
                    </span>
                  </div>
                  {stats?.weakestTopics && stats.weakestTopics.length > 0 ? (
                    <div className="space-y-2">
                      {stats.weakestTopics.map((t, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{t.topic}</span>
                          <span className="text-xs font-black text-rose-700">{t.avgScore}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-rose-700 italic">No low-scoring topics detected.</p>
                  )}
                </div>
              </div>

              {/* Complete Topic Breakdown Chart */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Full Technical Topic Performance
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {stats?.topicPerformance?.length || 0} evaluated topics
                  </span>
                </div>

                {topicBreakdownBarData.length > 0 ? (
                  <HorizontalBarChart
                    data={topicBreakdownBarData}
                    unit="%"
                    emptyMessage="No topic assessment records recorded."
                  />
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">No Topic Records</p>
                    <p className="text-xs text-slate-400 mt-1">When students answer conceptual, output and debugging questions, topic breakdown will populate here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {performanceSubTab === 'reports' && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Department Accreditation Reports</h3>
                  <p className="text-xs text-slate-500">
                    Export verifiable, anonymized reports for GTU, NAAC, NBA, and AICTE compliance.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportCsv}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    Export CSV Data
                  </button>
                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-900" />
                    {isExportingPdf ? 'Exporting...' : 'Export PDF Document'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Privacy & Compliance Safeguard:</span> Generated reports strictly aggregate cohort percentiles and topic readiness scores. Student personal identities, roll numbers, and contact details are excluded from all departmental exports in accordance with DISHA and AICTE institutional guidelines.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CURRICULUM & TESTS HUB ── */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Sub-nav pills */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/80">
            <button
              onClick={() => setCurriculumSubTab('question-bank')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                curriculumSubTab === 'question-bank'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
              Question Bank Governance
            </button>
            <button
              onClick={() => setCurriculumSubTab('curriculum-gap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                curriculumSubTab === 'curriculum-gap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Curriculum vs Market Gap
            </button>
          </div>

          {curriculumSubTab === 'question-bank' && (
            <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Faculty Question Bank Quality Governance
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                    SIH26044 Standard
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect and review conceptual, code output, and debugging questions with faculty quality control.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Language Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {(['Python', 'Java', 'SQL', 'C++'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setQbLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        qbLanguage === lang ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Author Question</span>
                </button>
              </div>
            </div>

            {/* Filter Sub-bar: Search, Difficulty, and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions, topics or concepts..."
                  value={qbSearch}
                  onChange={e => setQbSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <span className="text-xs text-slate-500 font-medium mr-1 flex-shrink-0">Diff:</span>
                {(['All', 'Easy', 'Medium', 'Hard', 'Industry'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setQbDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      qbDifficulty === diff
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <span className="text-xs text-slate-500 font-medium mr-1 flex-shrink-0">Status:</span>
                {(['All', 'Published', 'Approved', 'Review', 'Draft'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setQbStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      qbStatusFilter === st
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Showing {questionBankItems.length} curated questions for {qbLanguage}</span>
              <span className="text-[11px] text-slate-500 font-medium">Auto-synced with live student 50-Q assessment engine</span>
            </div>
          </div>

          {/* Question List Cards */}
          <div className="space-y-3">
            {questionBankItems.slice(0, 20).map((q, i) => {
              const reviewStatus = q.status || 'Published';
              return (
                <div key={q.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {q.topic}
                      </span>
                      {q.subtopic && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          • {q.subtopic}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          q.difficulty === 'Industry'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : q.difficulty === 'Hard'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          reviewStatus === 'Published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : reviewStatus === 'Approved'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : reviewStatus === 'Review'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {reviewStatus}
                      </span>
                    </div>

                    {/* Faculty Action Controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold">{q.marks} Mark</span>
                      <select
                        value={reviewStatus}
                        onChange={(e) => handleUpdateQuestionStatus(q.id, e.target.value as QuestionReviewStatus)}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="Published">Published</option>
                        <option value="Approved">Approved</option>
                        <option value="Review">In Review</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-900 leading-relaxed">
                    {q.question}
                  </div>

                  {/* Code Snippet Box if available */}
                  {q.codeSnippet && (
                    <pre className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-xl text-xs flex items-center gap-2 border ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold w-5 h-5 rounded-full bg-white flex items-center justify-center border border-slate-200 flex-shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="truncate flex-1">{opt}</span>
                        {oIdx === q.correctIndex && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {q.explanation && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                      <span className="font-bold">Faculty Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal: Author New Question */}
          {showAddQuestionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn">
              <div className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 text-slate-900 max-h-[90vh] overflow-y-auto space-y-4">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-50 text-amber-900 text-[10px] font-mono font-bold border border-slate-200/90">
                    FACULTY QUESTION AUTHORING
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">Author Technical Assessment Question</h3>
                  <p className="text-xs text-slate-500">
                    Contribute directly to the national verified question pool for {newQuestionForm.programmingLanguage}.
                  </p>
                </div>

                <form onSubmit={handleSaveNewQuestion} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Discipline / Domain</label>
                      <select
                        value={newQuestionForm.domainId}
                        onChange={e => {
                          const domId = e.target.value;
                          const dom = careerConnectService.getSkillDomainById(domId);
                          const firstSkill = dom?.categories[0]?.skills[0]?.name || 'Core Skill';
                          setNewQuestionForm({
                            ...newQuestionForm,
                            domainId: domId,
                            skillName: firstSkill,
                            programmingLanguage: firstSkill
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                      >
                        {careerConnectService.getSkillDomains().map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Skill / Tool / Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. SolidWorks, GD&T, PLC, AutoCAD, Python..."
                        value={newQuestionForm.skillName}
                        onChange={e => setNewQuestionForm({
                          ...newQuestionForm,
                          skillName: e.target.value,
                          programmingLanguage: e.target.value
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Question Type</label>
                      <select
                        value={newQuestionForm.questionType}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, questionType: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                      >
                        <option value="conceptual">Conceptual Theory</option>
                        <option value="scenario">Engineering Scenario</option>
                        <option value="numerical">Numerical Calculation</option>
                        <option value="practical">Practical / Tool Specific</option>
                        <option value="code_output">Code / Script Output</option>
                        <option value="debugging">Debugging & Inspection</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                      <select
                        value={newQuestionForm.difficulty}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                      >
                        <option value="Easy">Easy (Foundational)</option>
                        <option value="Medium">Medium (Intermediate)</option>
                        <option value="Hard">Hard (Advanced)</option>
                        <option value="Industry">Industry Ready</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Polymorphism / Indexing"
                        value={newQuestionForm.topic}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subtopic (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Method Overriding"
                        value={newQuestionForm.subtopic}
                        onChange={e => setNewQuestionForm({ ...newQuestionForm, subtopic: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Question Statement</label>
                    <textarea
                      rows={3}
                      placeholder="Enter the question text..."
                      value={newQuestionForm.question}
                      onChange={e => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Code Snippet (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Paste code snippet if code-based question..."
                      value={newQuestionForm.codeSnippet}
                      onChange={e => setNewQuestionForm({ ...newQuestionForm, codeSnippet: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">4 Options (Select radio for correct answer)</label>
                    <div className="space-y-2">
                      {newQuestionForm.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={newQuestionForm.correctIndex === oIdx}
                            onChange={() => setNewQuestionForm({ ...newQuestionForm, correctIndex: oIdx })}
                            className="cursor-pointer"
                          />
                          <span className="font-bold w-4">{String.fromCharCode(65 + oIdx)}.</span>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={e => {
                              const opts = [...newQuestionForm.options];
                              opts[oIdx] = e.target.value;
                              setNewQuestionForm({ ...newQuestionForm, options: opts });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Faculty Explanation</label>
                    <textarea
                      rows={2}
                      placeholder="Detailed explanation justifying the correct answer..."
                      value={newQuestionForm.explanation}
                      onChange={e => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddQuestionModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xs cursor-pointer"
                    >
                      Publish Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
            </div>
          )}

          {curriculumSubTab === 'curriculum-gap' && (
            <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Curriculum & Industry Skill Gap
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Comparing WHAT STUDENTS ARE LEARNING in the syllabus vs WHAT INDUSTRY NEEDS in live recruiter postings.
              </p>
            </div>

            <button
              onClick={() => setShowAddCurriculumModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              Add Curriculum Topic
            </button>
          </div>

          {hasCurriculum && curriculumGaps.length > 0 ? (
            <div className="space-y-6">
              {/* Dual Bar Comparison Chart */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <ComparisonBarChart
                  data={curriculumGaps}
                  title="Syllabus Coverage vs Recruiter Skill Demand"
                  emptyMessage="No curriculum gaps found"
                />
              </div>

              {/* Priority Gap Action List */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                  Priority Action List for Board of Studies (BoS)
                </h4>
                <div className="space-y-3">
                  {curriculumGaps.filter(g => g.priority === 'High' || g.priority === 'Medium').map((g, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{g.skill}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                            {g.priority} Priority Gap
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {g.recommendedAction}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold text-rose-600">-{g.gapPercentage}% Deficit</div>
                        <div className="text-[10px] text-slate-400">Industry: {g.industryDemandPct}% | Syllabus: {g.curriculumCoveragePct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                No Curriculum Data Configured Yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Map your department's syllabus topics to compare academic coverage against live industry recruiter requirements.
              </p>
              <button
                onClick={() => setShowAddCurriculumModal(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-950 font-bold text-xs transition cursor-pointer shadow-xs"
              >
                + Add First Curriculum Topic
              </button>
            </div>
          )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: MENTORSHIP & INDUSTRY HUB ── */}
      {activeTab === 'mentorship' && (
        <div className="space-y-6">
          {/* Sub-nav pills */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/80">
            <button
              onClick={() => setMentorshipSubTab('messages')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                mentorshipSubTab === 'messages'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              Direct Mentorship Messages
            </button>
            <button
              onClick={() => setMentorshipSubTab('opportunities')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                mentorshipSubTab === 'opportunities'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-600" />
              Industry Opportunities & Postings
            </button>
          </div>

          {mentorshipSubTab === 'messages' && session && (
            <div className="h-[750px]">
              <DirectMessagingView session={session} />
            </div>
          )}

          {mentorshipSubTab === 'opportunities' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-amber-700" />
                  <h3 className="text-base font-black text-slate-900">
                    Industry Opportunities & Placement Drives for {departmentName}
                  </h3>
                </div>
            <p className="text-xs text-slate-500">
              Verified corporate hiring, campus drives, and faculty development opportunities published by enterprise recruiters.
            </p>
          </div>

          {/* Mentorship Awareness KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Drives</div>
              <div className="text-2xl font-black text-slate-900">{industryPosts.length}</div>
              <div className="text-[10px] text-slate-400">Targeting {departmentName}</div>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>In-Demand Skills</span>
              </div>
              <div className="text-sm font-black text-amber-950 truncate">
                {stats?.topSkillsProficiency?.slice(0, 2).map(s => s.skill).join(', ') || 'Python, Java, SQL'}
              </div>
              <div className="text-[10px] text-amber-700 font-medium">Recruiter requirement tags</div>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                <span>Hiring Types</span>
              </div>
              <div className="text-sm font-black text-blue-950">
                Internships & Graduate
              </div>
              <div className="text-[10px] text-blue-700 font-medium">Campus placements & drives</div>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 shadow-xs space-y-1">
              <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                <span>Faculty FDPs</span>
              </div>
              <div className="text-2xl font-black text-purple-950">{facultyOpps.length}</div>
              <div className="text-[10px] text-purple-700 font-medium">Workshops & collaborations</div>
            </div>
          </div>

          {/* Live Industry Posts Feed for Faculty */}
          {industryPosts.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900">
                  Published Industry Posts ({industryPosts.length})
                </h4>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/90">
                  Targeted to {departmentName}
                </span>
              </div>

              {industryPosts.map(post => {
                const rawImgs = (post as any).images || (post as any).imageUrls || (post as any).image_url || (post as any).imageUrl || [];
                const images: string[] = Array.isArray(rawImgs)
                  ? rawImgs.filter(Boolean)
                  : (typeof rawImgs === 'string' && rawImgs.trim() ? [rawImgs.trim()] : []);

                return (
                  <div key={post.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs space-y-3">
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
                            {post.is_verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Verified Industry</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Target: <strong className="text-slate-700">{post.target_department || 'All Departments'}</strong> • Published {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Announcement Message */}
                    <p className="text-xs md:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {post.message}
                    </p>

                    {/* Posters / Images */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="Hiring Poster"
                            className="w-full h-28 object-contain rounded-xl border border-slate-200/90 bg-slate-50"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Skills Chips */}
                    {post.skills && post.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/90 text-slate-700 text-[10px] font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Mentorship & Student Guidance Action Bar */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-4 text-slate-700 font-bold">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Building2 className="w-3.5 h-3.5 text-amber-800" />
                          <span>{post.company_name}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>{post.skills?.length || 0} Skills Required</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (post.primary_apply_url) {
                              navigator.clipboard.writeText(post.primary_apply_url);
                              alert('Opportunity link copied to clipboard! Share with your students.');
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              alert('Link copied to clipboard!');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Share2 className="w-3 h-3 text-amber-300" />
                          <span>Share with Students</span>
                        </button>

                        {post.primary_apply_url && (
                          <a
                            href={post.primary_apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>Official Link</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : industryOpps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industryOpps.map(opp => (
                <div key={opp.id} className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {opp.opportunity_type}
                      </span>
                      <span className="text-xs font-bold text-slate-800 ml-2">{opp.company_name}</span>
                    </div>
                    {opp.deadline && (
                      <span className="text-[11px] text-slate-400 font-medium">Deadline: {opp.deadline}</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">{opp.title}</h4>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{opp.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {opp.required_skills.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">{opp.location} • {opp.stipend_or_salary || 'Competitive'}</span>
                    {opp.external_apply_url ? (
                      <a
                        href={opp.external_apply_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-amber-700 hover:underline"
                      >
                        Apply Link (External) ↗
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-slate-600">Apply via Nova Connect</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                No Industry Opportunities Posted Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Recruiters can publish opportunities targeting {departmentName} through the Recruiter Portal. Posts and opportunities will appear here in real-time.
              </p>
            </div>
          )}
            </div>
          )}
        </div>
      )}


      {/* ── TAB 7: FACULTY PROFILE & MENTORSHIP ── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Identity & Department Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-xs">
                  {(session?.full_name || 'Prof. Faculty').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900">
                      {session?.full_name || 'Prof. Faculty Lead'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                      Academician
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{facultyDesignation}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{departmentName} • {institutionName}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setProfileSaveSuccess(true);
                    setTimeout(() => setProfileSaveSuccess(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{profileSaveSuccess ? 'Profile Updated!' : 'Save Profile'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Contact & Office Info */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span>Academic Information</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Designation & Role Title</label>
                  <input
                    type="text"
                    value={facultyDesignation}
                    onChange={e => setFacultyDesignation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-400 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Official Email Address</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-xs font-mono text-slate-700 border border-slate-200">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session?.email || 'faculty@gecmodasa.ac.in'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Department</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-xs text-slate-700 border border-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{departmentName}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Student Consultation & Office Hours</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={facultyOfficeHours}
                      onChange={e => setFacultyOfficeHours(e.target.value)}
                      placeholder="e.g. Monday - Thursday: 2:00 PM - 4:00 PM"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-400 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Mentorship Specializations & Department Impact */}
            <div className="lg:col-span-7 space-y-6">
              {/* Mentorship Specializations */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Mentorship & Subject Specializations</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {facultySpecializations.length} domains
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Key technical domains where you guide students for project assessments, curriculum design, and industry preparation.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {facultySpecializations.map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-2"
                    >
                      <span>{spec}</span>
                      <button
                        onClick={() => setFacultySpecializations(prev => prev.filter((_, i) => i !== sIdx))}
                        className="text-purple-400 hover:text-rose-600 text-xs font-black transition cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={newSpecInput}
                    onChange={e => setNewSpecInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newSpecInput.trim()) {
                        e.preventDefault();
                        if (!facultySpecializations.includes(newSpecInput.trim())) {
                          setFacultySpecializations(prev => [...prev, newSpecInput.trim()]);
                        }
                        setNewSpecInput('');
                      }
                    }}
                    placeholder="Add domain (e.g. AI/ML, DevOps, Rust)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-purple-400 transition"
                  />
                  <button
                    onClick={() => {
                      if (newSpecInput.trim() && !facultySpecializations.includes(newSpecInput.trim())) {
                        setFacultySpecializations(prev => [...prev, newSpecInput.trim()]);
                        setNewSpecInput('');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Department Mentorship Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
                  <div className="text-xl font-black text-slate-900">{stats?.totalStudents || 0}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dept Students</div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
                  <div className="text-xl font-black text-purple-700">{stats?.assessedCount || 0}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessed</div>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
                  <div className="text-xl font-black text-emerald-700">{stats?.avgReadinessScore || 0}%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CURRICULUM TOPIC ── */}
      {showAddCurriculumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Curriculum Syllabus Topic</h3>
            <p className="text-xs text-slate-500 mb-4">
              Map department coursework topics to benchmark against industry skills.
            </p>

            <form onSubmit={handleAddCurriculumTopic} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Course / Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Database Management Systems"
                  value={newTopicCourse}
                  onChange={e => setNewTopicCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Topic / Competency Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Query Optimization & Index Tuning"
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Skill Tag</label>
                  <select
                    value={newTopicSkill}
                    onChange={e => setNewTopicSkill(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <option value="Python">Python</option>
                    <option value="SQL">SQL</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="Docker">Docker</option>
                    <option value="Cloud APIs">Cloud APIs</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Semester</label>
                  <select
                    value={newTopicSemester}
                    onChange={e => setNewTopicSemester(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Syllabus Coverage: {newTopicCoverage}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={newTopicCoverage}
                  onChange={e => setNewTopicCoverage(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCurriculumModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                >
                  Save Curriculum Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SHARE REPORT ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Share Anonymous Department Report</h3>
            <p className="text-xs text-slate-500 mb-4">
              Dispatches authenticated aggregate report to verified institutional stakeholders.
            </p>

            <div className="space-y-3 mb-5">
              {(['Placement Cell', 'Head of Department', 'Dean / Administration'] as const).map(target => (
                <label
                  key={target}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    shareTarget === target ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800">{target}</span>
                  <input
                    type="radio"
                    name="shareTarget"
                    checked={shareTarget === target}
                    onChange={() => setShareTarget(target)}
                    className="accent-amber-500"
                  />
                </label>
              ))}
            </div>

            {shareSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center">
                ✓ Report successfully shared with {shareTarget}!
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareReport}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-slate-100 text-slate-950 shadow-xs"
                >
                  Send Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
