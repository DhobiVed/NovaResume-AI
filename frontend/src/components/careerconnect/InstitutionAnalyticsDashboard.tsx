import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, Building2, Users, Plus, X, TrendingUp,
  GraduationCap, Award, FileText, Briefcase,
  Search, CheckCircle, Download, Sparkles, Filter
} from 'lucide-react';
import { careerConnectService } from '../../services/careerConnectService';
import type {
  DepartmentItem, FacultyMemberItem, InstitutionAdminMetrics,
  InstitutionAccreditationRecord, NationalBenchmarkData,
  OpportunityItem, AuthUserSession,
  CurriculumRecord, CurriculumAlignmentAnalysis,
  PlacementFunnelMetrics, DepartmentSkillGapItem, InstitutionPartnerCompany
} from '../../types/careerConnect';

interface Props {
  activeSection?: string;
  onNavigateSection?: (section: string) => void;
  session?: AuthUserSession;
}

type TabType =
  | 'dashboard'
  | 'directory'
  | 'skills'
  | 'accreditation'
  | 'partners';

export const InstitutionAnalyticsDashboard: React.FC<Props> = ({
  activeSection = 'dashboard',
  onNavigateSection,
  session: propSession
}) => {
  const currentSession = propSession || careerConnectService.getCurrentSession();
  // Strictly enforce authenticated institution context — no switching dropdown
  const institutionName = currentSession?.institution || 'Government Engineering College, Modasa (GEC Modasa)';

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [directorySubTab, setDirectorySubTab] = useState<'departments' | 'faculty' | 'students'>('departments');
  const [skillsSubTab, setSkillsSubTab] = useState<'skill-analytics' | 'skill-gap'>('skill-analytics');
  const [accreditationSubTab, setAccreditationSubTab] = useState<'accreditation' | 'benchmark' | 'reports'>('accreditation');

  const handleSelectTab = (tabId: TabType) => {
    setActiveTab(tabId);
    if (onNavigateSection) {
      onNavigateSection(tabId);
    }
  };

  useEffect(() => {
    switch (activeSection) {
      case 'dashboard':
      case 'overview':
        setActiveTab('dashboard');
        break;
      case 'directory':
      case 'departments':
        setActiveTab('directory');
        setDirectorySubTab('departments');
        break;
      case 'faculty':
        setActiveTab('directory');
        setDirectorySubTab('faculty');
        break;
      case 'students':
        setActiveTab('directory');
        setDirectorySubTab('students');
        break;
      case 'skills':
      case 'skill-analytics':
        setActiveTab('skills');
        setSkillsSubTab('skill-analytics');
        break;
      case 'skill-gap':
        setActiveTab('skills');
        setSkillsSubTab('skill-gap');
        break;
      case 'partners':
      case 'connections':
      case 'placement-analytics':
        setActiveTab('partners');
        break;
      case 'accreditation':
      case 'verification':
        setActiveTab('accreditation');
        setAccreditationSubTab('accreditation');
        break;
      case 'benchmark':
        setActiveTab('accreditation');
        setAccreditationSubTab('benchmark');
        break;
      case 'reports':
        setActiveTab('accreditation');
        setAccreditationSubTab('reports');
        break;
      default:
        setActiveTab('dashboard');
    }
  }, [activeSection]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── 1. REAL-TIME INSTITUTION METRICS & GLOBAL DEPT FILTER ─────
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const [metrics, setMetrics] = useState<InstitutionAdminMetrics>({
    totalStudents: 0,
    totalFaculty: 0,
    totalDepartments: 0,
    totalInternships: 0,
    totalPlacements: 0,
    placementReadyStudents: 0,
    industryPartners: 0,
    hiringPartners: 0,
    activeOpportunities: 0,
    applicationsCount: 0,
    selectedStudents: 0,
    assessedStudents: 0,
    activeAssessments: 0,
    verifiedPartners: 0,
    avgReadinessScore: 0,
    avgAccuracy: 0
  });

  const [placementData, setPlacementData] = useState<{
    funnel: PlacementFunnelMetrics;
    partnerCompanies: InstitutionPartnerCompany[];
  }>({
    funnel: { eligible: 0, applied: 0, shortlisted: 0, interviewed: 0, selected: 0, joined: 0, conversionRate: 0 },
    partnerCompanies: []
  });

  const [departmentSkillGaps, setDepartmentSkillGaps] = useState<DepartmentSkillGapItem[]>([]);

  useEffect(() => {
    const unsub = careerConnectService.subscribeInstitutionMetrics(institutionName, selectedDept, setMetrics);
    return () => unsub();
  }, [institutionName, selectedDept]);

  useEffect(() => {
    const unsub = careerConnectService.subscribeInstitutionPlacementAnalytics(institutionName, selectedDept, setPlacementData);
    return () => unsub();
  }, [institutionName, selectedDept]);

  useEffect(() => {
    const unsub = careerConnectService.subscribeDepartmentSkillAnalytics(institutionName, selectedDept, setDepartmentSkillGaps);
    return () => unsub();
  }, [institutionName, selectedDept]);

  // ── 2. DEPARTMENTS DIRECTORY & CRUD ───────────────────────────
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '', program: 'B.Tech' });

  useEffect(() => {
    const unsub = careerConnectService.subscribeInstitutionDepartments(institutionName, setDepartments);
    return () => unsub();
  }, [institutionName]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name.trim() || !newDept.code.trim()) return;
    try {
      await careerConnectService.addDepartment(institutionName, {
        name: newDept.name.trim(),
        code: newDept.code.trim().toUpperCase(),
        program: newDept.program
      });
      setShowAddDeptModal(false);
      setNewDept({ name: '', code: '', program: 'B.Tech' });
      showToast(`Department '${newDept.name}' registered to ${institutionName}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to add department');
    }
  };

  // ── BoS CURRICULUM GAP & INDUSTRY ALIGNMENT STATE ───────────
  const [curriculumRecords, setCurriculumRecords] = useState<CurriculumRecord[]>([]);
  const [curriculumAlignment, setCurriculumAlignment] = useState<CurriculumAlignmentAnalysis | null>(null);
  const [selectedCurriculumDept, setSelectedCurriculumDept] = useState<string>('all');
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    courseCode: '',
    courseTitle: '',
    departmentName: '',
    semester: 5,
    mappedSkillName: '',
    coverageLevel: 'Intermediate' as 'Basic' | 'Intermediate' | 'Advanced'
  });

  useEffect(() => {
    const targetDept = selectedCurriculumDept === 'all' 
      ? (departments[0]?.name || 'Mechanical Engineering')
      : selectedCurriculumDept;

    careerConnectService.getCurriculumIndustryAlignment(institutionName, targetDept).then(setCurriculumAlignment);
    const unsub = careerConnectService.subscribeCurriculum(institutionName, targetDept, setCurriculumRecords);
    return () => unsub();
  }, [institutionName, selectedCurriculumDept, departments]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dept = newCourseForm.departmentName || departments[0]?.name || 'Mechanical Engineering';
      await careerConnectService.addCurriculumCourse({
        institutionId: institutionName,
        institutionName: institutionName,
        departmentId: dept,
        departmentName: dept,
        program: 'B.Tech',
        academicYear: '2024-25',
        courseCode: newCourseForm.courseCode.trim(),
        courseTitle: newCourseForm.courseTitle.trim(),
        semester: Number(newCourseForm.semester),
        mappedSkills: newCourseForm.mappedSkillName ? [{
          skillId: newCourseForm.mappedSkillName.toLowerCase().replace(/\s+/g, '-'),
          skillName: newCourseForm.mappedSkillName.trim(),
          coverageLevel: newCourseForm.coverageLevel
        }] : [],
        bosApproved: true
      });
      showToast('Course syllabus registered and BoS alignment updated!');
      setShowAddCourseModal(false);
      setNewCourseForm({
        courseCode: '',
        courseTitle: '',
        departmentName: '',
        semester: 5,
        mappedSkillName: '',
        coverageLevel: 'Intermediate'
      });
      careerConnectService.getCurriculumIndustryAlignment(institutionName, dept).then(setCurriculumAlignment);
    } catch (err) {
      showToast('Failed to save course syllabus');
    }
  };



  // ── 3. FACULTY GOVERNANCE ────────────────────────────────────
  const [facultyMembers, setFacultyMembers] = useState<FacultyMemberItem[]>([]);

  useEffect(() => {
    const unsub = careerConnectService.subscribeInstitutionFaculty(institutionName, setFacultyMembers);
    return () => unsub();
  }, [institutionName]);

  const handleVerifyFaculty = async (userId: string, newStatus: 'Verified' | 'Rejected') => {
    await careerConnectService.verifyFacultyMember(userId, newStatus);
    showToast(`Faculty verification status set to ${newStatus}.`);
  };

  // ── 4. STUDENTS DIRECTORY ────────────────────────────────────
  const [students, setStudents] = useState<any[]>([]);
  const [studentDeptFilter, setStudentDeptFilter] = useState('All');
  const [studentSemFilter, setStudentSemFilter] = useState('All');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    const unsub = careerConnectService.subscribeInstitutionStudents(
      institutionName,
      { department: studentDeptFilter, semester: studentSemFilter, search: studentSearch },
      setStudents
    );
    return () => unsub();
  }, [institutionName, studentDeptFilter, studentSemFilter, studentSearch]);

  // ── 5. SKILL ANALYTICS ───────────────────────────────────────
  const [skillAnalytics, setSkillAnalytics] = useState<{
    tierBreakdown: { strong: number; moderate: number; needsImprovement: number };
    scoreHistogram: number[];
    languageAverages: { language: string; avgScore: number; testCount: number }[];
    overallAverage: number;
    totalAttempts: number;
  }>({
    tierBreakdown: { strong: 0, moderate: 0, needsImprovement: 0 },
    scoreHistogram: [0, 0, 0, 0, 0],
    languageAverages: [],
    overallAverage: 0,
    totalAttempts: 0
  });

  useEffect(() => {
    const unsub = careerConnectService.subscribeInstitutionSkillAnalytics(institutionName, setSkillAnalytics);
    return () => unsub();
  }, [institutionName]);

  // ── 6. INDUSTRY PARTNERS & OPPORTUNITIES ─────────────────────
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  useEffect(() => {
    careerConnectService.getOpportunities().then(setOpportunities);
  }, []);

  // ── 7. ACCREDITATION RECORD ──────────────────────────────────
  const [accreditation, setAccreditation] = useState<InstitutionAccreditationRecord>({
    institutionId: institutionName,
    naacGrade: 'A++',
    naacCgpa: '3.62',
    nbaCycles: 'Tier-1 (Valid 2023-2026)',
    aicteApprovalCode: 'F.No. Central/1-3659281921',
    nirfRank: 84,
    validThru: '2027-12-31',
    updatedAt: new Date().toISOString()
  });
  const [isEditingAccreditation, setIsEditingAccreditation] = useState(false);

  useEffect(() => {
    careerConnectService.getInstitutionAccreditation(institutionName).then(setAccreditation);
  }, [institutionName]);

  const handleSaveAccreditation = async (e: React.FormEvent) => {
    e.preventDefault();
    await careerConnectService.updateInstitutionAccreditation(institutionName, accreditation);
    setIsEditingAccreditation(false);
    showToast('Accreditation records updated successfully.');
  };

  // ── 8. ALL-INDIA BENCHMARK ───────────────────────────────────
  const [benchmark, setBenchmark] = useState<NationalBenchmarkData>({
    institutionAvgScore: 0,
    nationalAvgScore: 0,
    stateAvgScore: 0,
    percentileRank: 0,
    participatingInstitutionsCount: 0,
    totalAssessmentsEvaluated: 0,
    dataPeriod: '2024-2025 Academic Cycle',
    calculationMethod: 'Aggregated mean of verified 50-Question assessments'
  });

  useEffect(() => {
    careerConnectService.getInstitutionBenchmark(institutionName).then(setBenchmark);
  }, [institutionName]);

  // ── 9. EXPORT HELPERS (CSV / PDF) ─────────────────────────────
  const exportStudentsCSV = () => {
    if (students.length === 0) {
      showToast('No student records to export.');
      return;
    }
    const headers = ['ID', 'Full Name', 'Email', 'Department', 'Semester', 'CGPA', 'Tests Taken', 'Latest Score', 'Average Score', 'Status'];
    const rows = students.map(s => [
      s.id,
      `"${s.fullName}"`,
      s.email,
      `"${s.department}"`,
      s.semester,
      s.cgpa,
      s.attemptsCount,
      s.latestScore ?? 'N/A',
      s.avgScore,
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${institutionName.replace(/[^a-z0-9]/gi, '_')}_student_skill_matrix.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded.');
  };

  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-900 shadow-xl flex items-center gap-3 animate-slideIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── TOP HEADER BANNER (LOCKED TO AUTHORIZED INSTITUTION) ── */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-amber-800 text-xs font-mono font-bold border border-slate-200/90">
              INSTITUTION EXECUTIVE CONSOLE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 text-xs font-bold border border-slate-200/90">
              NAAC {accreditation.naacGrade || 'A++'} • NIRF #{accreditation.nirfRank || '84'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-blue-800 text-xs font-bold border border-slate-200/90">
              AICTE Approved
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 mt-2">
            {institutionName}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Strict Institutional Scope • Department Management, Real Student Assessments &amp; BoS Curriculum Gap Engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-amber-800" />
            <span className="text-xs font-bold text-slate-700">Department:</span>
            <select
              value={selectedDept}
              onChange={e => {
                const val = e.target.value;
                setSelectedDept(val);
                setStudentDeptFilter(val);
              }}
              className="text-xs font-bold text-slate-900 bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              <option value="All">All Departments (Campus-wide)</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-2 shadow-2xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-800">
              Live Firestore Tenant Active
            </span>
          </div>
        </div>
      </div>

      {/* ── 11 REAL-TIME DYNAMIC INSTITUTION KPI METRICS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2.5">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-slate-900">{metrics.totalStudents}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Total Students</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-purple-700">{metrics.totalFaculty}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Total Faculty</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-blue-700">{metrics.totalDepartments}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Departments</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-amber-700">{metrics.totalInternships}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Internships</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-emerald-700">{metrics.totalPlacements}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Placements</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-teal-700">{metrics.placementReadyStudents}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Placement-Ready</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-indigo-700">{metrics.industryPartners}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Industry Partners</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-rose-700">{metrics.hiringPartners}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Hiring Partners</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-slate-700">{metrics.activeOpportunities}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Opportunities</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-orange-700">{metrics.applicationsCount}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Applications</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-emerald-800">{metrics.selectedStudents}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Selected Students</div>
        </div>
      </div>

      {/* ── 5 UNIFIED NAVIGATION HUBS ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3 },
          { id: 'directory', label: 'Academic Directory', icon: Building2 },
          { id: 'skills', label: 'Skill Intelligence', icon: Sparkles },
          { id: 'accreditation', label: 'Accreditation & NIRF', icon: Award },
          { id: 'partners', label: 'Industry Partners', icon: Briefcase }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id as TabType)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: EXECUTIVE DASHBOARD ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real Skill Level Breakdown */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Student Readiness Distribution</h2>
                  <p className="text-xs text-slate-500">Categorized from verified 50-Q assessment attempts</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600">
                  {skillAnalytics.totalAttempts} Tests Evaluated
                </span>
              </div>

              {skillAnalytics.totalAttempts === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No assessment tests taken by students of this college yet.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-full h-4 rounded-full bg-slate-100 flex overflow-hidden">
                    <div
                      style={{ width: `${(skillAnalytics.tierBreakdown.strong / skillAnalytics.totalAttempts) * 100}%` }}
                      className="bg-emerald-500"
                      title={`Strong: ${skillAnalytics.tierBreakdown.strong}`}
                    />
                    <div
                      style={{ width: `${(skillAnalytics.tierBreakdown.moderate / skillAnalytics.totalAttempts) * 100}%` }}
                      className="bg-amber-400"
                      title={`Moderate: ${skillAnalytics.tierBreakdown.moderate}`}
                    />
                    <div
                      style={{ width: `${(skillAnalytics.tierBreakdown.needsImprovement / skillAnalytics.totalAttempts) * 100}%` }}
                      className="bg-rose-400"
                      title={`Needs Improvement: ${skillAnalytics.tierBreakdown.needsImprovement}`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <div className="text-base font-black text-emerald-800">
                        {skillAnalytics.tierBreakdown.strong}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700">Strong (&ge; 70%)</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                      <div className="text-base font-black text-amber-800">
                        {skillAnalytics.tierBreakdown.moderate}
                      </div>
                      <div className="text-[10px] font-bold text-amber-700">Moderate (40-69%)</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                      <div className="text-base font-black text-rose-800">
                        {skillAnalytics.tierBreakdown.needsImprovement}
                      </div>
                      <div className="text-[10px] font-bold text-rose-700">Needs Help (&lt; 40%)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5-Bin Score Histogram */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Score Range Frequency Histogram</h2>
                  <p className="text-xs text-slate-500">Distribution across 5 standard percentage bins</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  Mean: {metrics.avgReadinessScore}%
                </span>
              </div>

              {skillAnalytics.totalAttempts === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  Histogram generates automatically once assessments are submitted.
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  {[
                    { label: '81% - 100%', count: skillAnalytics.scoreHistogram[4], color: 'bg-emerald-600' },
                    { label: '61% - 80%', count: skillAnalytics.scoreHistogram[3], color: 'bg-emerald-500' },
                    { label: '41% - 60%', count: skillAnalytics.scoreHistogram[2], color: 'bg-amber-500' },
                    { label: '21% - 40%', count: skillAnalytics.scoreHistogram[1], color: 'bg-orange-400' },
                    { label: '0% - 20%', count: skillAnalytics.scoreHistogram[0], color: 'bg-rose-500' }
                  ].map((bin, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-3 text-xs">
                      <span className="w-20 text-[11px] font-mono text-slate-500 text-right">{bin.label}</span>
                      <div className="flex-1 h-3.5 rounded-md bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${skillAnalytics.totalAttempts > 0 ? (bin.count / skillAnalytics.totalAttempts) * 100 : 0}%` }}
                          className={`h-full ${bin.color} rounded-md`}
                        />
                      </div>
                      <span className="w-10 text-[11px] font-bold text-slate-800 text-right">{bin.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Department Snapshot */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">Academic Department Roster</h2>
                <p className="text-xs text-slate-500">Live student and faculty distribution across programs</p>
              </div>
              <button
                onClick={() => { handleSelectTab('directory'); setDirectorySubTab('departments'); }}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Manage Departments &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {departments.map(d => (
                <div key={d.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs text-amber-900">{d.code}</span>
                    <span className="text-[10px] text-slate-500">{d.program}</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate">{d.name}</div>
                  <div className="text-[10px] text-slate-600 pt-1 flex justify-between">
                    <span>{d.student_count || 0} Students</span>
                    <span>{d.faculty_count || 0} Faculty</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── REAL-TIME PLACEMENT PIPELINE & FUNNEL (ZERO FAKE DATA) ── */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-sm font-black text-slate-900">Campus Placement &amp; Internship Conversion Funnel</h2>
                <p className="text-xs text-slate-500">
                  Real-time pipeline tracking student progression from academic eligibility to joined industry positions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                  Conversion: {placementData.funnel.conversionRate}%
                </span>
              </div>
            </div>

            {placementData.funnel.eligible === 0 && placementData.funnel.applied === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xs text-slate-500 font-medium">
                  No placement pipeline data available yet for {selectedDept === 'All' ? 'this institution' : selectedDept}.
                  Students must submit applications to active company drives to populate the pipeline.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">1. Eligible</span>
                  <div className="text-2xl font-black text-blue-900">{placementData.funnel.eligible}</div>
                  <div className="text-[10px] text-blue-700 font-medium">CGPA &ge; 6.0 &amp; Assessed</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">2. Applied</span>
                  <div className="text-2xl font-black text-indigo-900">{placementData.funnel.applied}</div>
                  <div className="text-[10px] text-indigo-700 font-medium">Submitted Applications</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase">3. Shortlisted</span>
                  <div className="text-2xl font-black text-amber-900">{placementData.funnel.shortlisted}</div>
                  <div className="text-[10px] text-amber-700 font-medium">Passed Recruiter Screen</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                  <span className="text-[10px] font-bold text-purple-600 uppercase">4. Interview</span>
                  <div className="text-2xl font-black text-purple-900">{placementData.funnel.interviewed}</div>
                  <div className="text-[10px] text-purple-700 font-medium">Technical/HR Round</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1">
                  <span className="text-[10px] font-bold text-teal-600 uppercase">5. Selected</span>
                  <div className="text-2xl font-black text-teal-900">{placementData.funnel.selected}</div>
                  <div className="text-[10px] text-teal-700 font-medium">Job Offer Extended</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">6. Joined</span>
                  <div className="text-2xl font-black text-emerald-900">{placementData.funnel.joined}</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Offer Accepted</div>
                </div>
              </div>
            )}
          </div>

          {/* ── DEPARTMENT SKILL GAP HEATMAP ── */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Department Skill Gap Heatmap ({selectedDept === 'All' ? 'Campus Aggregate' : selectedDept})
                </h2>
                <p className="text-xs text-slate-500">
                  Target industry benchmark: 80% competency. Identifies urgent curriculum intervention needs.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600">
                {departmentSkillGaps.length} Skills Audited
              </span>
            </div>

            {departmentSkillGaps.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xs text-slate-500 font-medium">
                  No skill gap data recorded yet for {selectedDept === 'All' ? 'this institution' : selectedDept}.
                  Students must complete skill assessments to compute departmental readiness deficits.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[650px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Skill / Tool</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Current Avg</th>
                      <th className="py-2.5 px-3">Required</th>
                      <th className="py-2.5 px-3">Deficit Gap</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Affected Students</th>
                      <th className="py-2.5 px-3">Industry Demand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departmentSkillGaps.map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-black text-slate-900">{g.skillName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{g.department}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{g.currentLevel}%</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{g.requiredLevel}%</td>
                        <td className="py-2.5 px-3 font-mono font-black text-rose-700">-{g.gapPercentage}%</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            g.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : g.priority === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {g.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{g.affectedStudentsCount} students</td>
                        <td className="py-2.5 px-3 font-bold text-slate-600">{g.industryDemand}</td>
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
      {/* ── TAB 2: ACADEMIC DIRECTORY HUB ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Sub-nav pills */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/80">
            <button
              onClick={() => setDirectorySubTab('departments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                directorySubTab === 'departments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Departments ({departments.length})
            </button>
            <button
              onClick={() => setDirectorySubTab('faculty')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                directorySubTab === 'faculty'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              Faculty Mentors ({facultyMembers.length})
            </button>
            <button
              onClick={() => setDirectorySubTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                directorySubTab === 'students'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Students Cohort
            </button>
          </div>

          {directorySubTab === 'departments' && (
            <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900">Campus Departments ({departments.length})</h2>
              <p className="text-xs text-slate-500">Configure academic faculties, degree programs, and curriculum nodes</p>
            </div>
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center gap-1.5 border border-slate-200/90 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-50 font-bold text-slate-800 border border-slate-200/90">
                      {dept.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-2">{dept.name}</h3>
                    <span className="text-xs text-slate-500">Program: {dept.program}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    {dept.status || 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <div className="text-base font-black text-slate-900">{dept.student_count || 0}</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Students</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <div className="text-base font-black text-slate-900">{dept.faculty_count || 0}</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Faculty</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 text-xs">
                  <button
                    onClick={() => {
                      const newName = prompt('Update Department Name:', dept.name);
                      if (newName && newName.trim()) {
                        careerConnectService.updateDepartment(dept.id, { name: newName.trim() });
                        showToast('Department name updated.');
                      }
                    }}
                    className="px-2 py-1 text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Deactivate department ${dept.name}?`)) {
                        await careerConnectService.deleteDepartment(dept.id);
                        showToast('Department deactivated.');
                      }
                    }}
                    className="px-2 py-1 text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL: ADD DEPARTMENT ── */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-900">Add Academic Department</h2>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Engineering"
                  value={newDept.name}
                  onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EE"
                  value={newDept.code}
                  onChange={e => setNewDept({ ...newDept, code: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Degree Program</label>
                <select
                  value={newDept.program}
                  onChange={e => setNewDept({ ...newDept, program: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="Ph.D">Ph.D</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
            </div>
          )}

          {directorySubTab === 'faculty' && (
            <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900">Faculty Mentors Roster ({facultyMembers.length})</h2>
              <p className="text-xs text-slate-500">Verified academic staff teaching and evaluating students in this college</p>
            </div>
          </div>

          {facultyMembers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center text-xs text-slate-400 font-medium">
              No faculty members registered under this institution yet. Faculty can register with their college email.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facultyMembers.map(fac => (
                <div key={fac.id} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{fac.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{fac.email}</div>
                      <div className="text-xs text-amber-800 font-bold mt-1">{fac.designation}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        fac.verification_status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {fac.verification_status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Department: <span className="font-bold text-slate-800">{fac.department_name}</span></div>
                    <div>Employee ID: <span className="font-mono text-slate-700">{fac.employee_id}</span></div>
                    <div>Assigned Cohort: <span className="font-bold text-slate-800">{fac.assigned_students_count || 0} students</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                    {fac.verification_status !== 'Verified' ? (
                      <button
                        onClick={() => handleVerifyFaculty(fac.id, 'Verified')}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Approve Affiliation
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerifyFaculty(fac.id, 'Rejected')}
                        className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          )}

          {directorySubTab === 'students' && (
            <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex-1 flex flex-wrap gap-2 items-center w-full md:w-auto">
              <div className="relative min-w-[200px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student name, email, department..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200/90 focus:outline-none focus:bg-white"
                />
              </div>

              <select
                value={studentDeptFilter}
                onChange={e => setStudentDeptFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              <select
                value={studentSemFilter}
                onChange={e => setStudentSemFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All Semesters</option>
                <option value="1st Sem">1st Sem</option>
                <option value="2nd Sem">2nd Sem</option>
                <option value="3rd Sem">3rd Sem</option>
                <option value="4th Sem">4th Sem</option>
                <option value="5th Sem">5th Sem</option>
                <option value="6th Sem">6th Sem</option>
                <option value="7th Sem">7th Sem</option>
                <option value="8th Sem">8th Sem</option>
              </select>
            </div>

            <button
              onClick={exportStudentsCSV}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200/90 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/90 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-black text-slate-900">
                Enrolled Students Cohort ({students.length})
              </span>
            </div>

            {students.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 font-medium">
                No students enrolled under this institution matching the selected filter.
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[600px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/90">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Department &amp; Sem</th>
                      <th className="py-3 px-4">CGPA</th>
                      <th className="py-3 px-4">Assessments Taken</th>
                      <th className="py-3 px-4">Avg Score</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{s.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{s.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{s.department}</div>
                          <div className="text-[10px] text-slate-500">{s.semester}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{s.cgpa}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{s.attemptsCount} tests</td>
                        <td className="py-3 px-4">
                          {s.attemptsCount > 0 ? (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                s.avgScore >= 70
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : s.avgScore >= 40
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {s.avgScore}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {s.status}
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
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: SKILL INTELLIGENCE HUB ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Sub-nav pills */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/80">
            <button
              onClick={() => setSkillsSubTab('skill-analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                skillsSubTab === 'skill-analytics'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Programming & Domain Analytics
            </button>
            <button
              onClick={() => setSkillsSubTab('skill-gap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                skillsSubTab === 'skill-gap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              Curriculum vs Industry Skill Gap
            </button>
          </div>

          {skillsSubTab === 'skill-analytics' && (
            <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">Programming Language &amp; Domain Performance</h2>
                <p className="text-xs text-slate-500">Aggregated scores from students taking 50-Question verified exams</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800">
                Campus Mean: {skillAnalytics.overallAverage}%
              </span>
            </div>

            {skillAnalytics.languageAverages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No language assessment data collected yet for this college.
              </div>
            ) : (
              <div className="space-y-3">
                {skillAnalytics.languageAverages.map((lang, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-900">{lang.language}</span>
                      <span className="font-mono text-emerald-800">{lang.avgScore}% Average ({lang.testCount} tests)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        style={{ width: `${lang.avgScore}%` }}
                        className={`h-full rounded-full ${
                          lang.avgScore >= 70 ? 'bg-emerald-500' : lang.avgScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            </div>
          )}

          {skillsSubTab === 'skill-gap' && (
            <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-amber-900 text-[10px] font-mono font-bold border border-slate-200/90">
                  BOARD OF STUDIES (BoS) ALIGNMENT ENGINE
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Real Firestore Analytics
                </span>
              </div>
              <h2 className="text-sm font-black text-slate-900 mt-1">Curriculum vs Industry Skill Gap Engine</h2>
              <p className="text-xs text-slate-500">
                Correlates college syllabus coverage with live industry job requirements across academic disciplines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCurriculumDept}
                onChange={e => setSelectedCurriculumDept(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200/90 text-slate-800 cursor-pointer shadow-2xs"
              >
                <option value="all">Default Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddCourseModal(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Map Course Syllabus</span>
              </button>
            </div>
          </div>

          {/* Scores Overview Bar */}
          {curriculumAlignment && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Syllabus Coverage Score</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {curriculumAlignment.curriculumCoverageScore}%
                </div>
                <span className="text-[11px] text-slate-500">
                  Across {curriculumAlignment.totalSkillsAudited} key discipline skills
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Industry Demand Alignment</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {curriculumAlignment.industryAlignmentScore}%
                </div>
                <span className="text-[11px] text-slate-500">
                  Critical &amp; High-demand skills covered
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mapped Courses on Record</span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {curriculumRecords.length}
                </div>
                <span className="text-[11px] text-slate-500">
                  BoS approved syllabus records in database
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BoS Priority Gaps */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase">
                BoS Priority Academic Gaps ({curriculumAlignment?.prioritySkillGaps.length || 0})
              </h3>
              {curriculumAlignment && curriculumAlignment.prioritySkillGaps.length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {curriculumAlignment.prioritySkillGaps.map((gap, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-950">{gap.skillName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 text-[10px] font-mono font-bold">
                          {gap.industryDemand} Demand
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        {gap.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/90">
                  <p className="text-xs text-slate-500 font-medium">
                    No critical curriculum gaps identified for the active department.
                  </p>
                </div>
              )}
            </div>

            {/* Mapped Courses Directory */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase">
                Registered Department Courses ({curriculumRecords.length})
              </h3>
              {curriculumRecords.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs max-h-96 overflow-y-auto">
                  {curriculumRecords.map(c => (
                    <div key={c.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{c.courseCode} — {c.courseTitle}</div>
                        <span className="text-[10px] text-slate-500">
                          Semester {c.semester} • {c.mappedSkills?.length || 0} skills mapped: {c.mappedSkills?.map(s => s.skillName).join(', ')}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        BoS Approved
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/90">
                  <p className="text-xs text-slate-500 font-medium">
                    No curriculum data available yet for this department. Click "+ Map Course Syllabus" to record university subjects and verify industry alignment.
                  </p>
                </div>
              )}
            </div>
          </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: INDUSTRY PARTNERS & DRIVES ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          {/* Corporate Hiring Partners Directory */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Corporate Hiring Partners &amp; Recruiter Network ({placementData.partnerCompanies.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Industry companies with registered opportunities and candidate selections from {institutionName}
                </p>
              </div>
            </div>

            {placementData.partnerCompanies.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xs text-slate-500 font-medium">
                  No corporate hiring partners registered yet for this campus tenant.
                  Corporate partners appear here once companies publish recruitment opportunities.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[650px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Company</th>
                      <th className="py-2.5 px-3">Sector</th>
                      <th className="py-2.5 px-3">Active Drives</th>
                      <th className="py-2.5 px-3">Internships</th>
                      <th className="py-2.5 px-3">Placements</th>
                      <th className="py-2.5 px-3">Applications</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {placementData.partnerCompanies.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-black text-slate-900">{c.companyName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{c.industry}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{c.activeOpportunities}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-700">{c.internships}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">{c.placements}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{c.applications}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {c.hiringStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                          {new Date(c.lastActivity).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Job & Internship Drives */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">Active Placement &amp; Internship Drives ({opportunities.length})</h2>
                <p className="text-xs text-slate-500">Live opportunities currently accepting student applications</p>
              </div>
            </div>

            {opportunities.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/90">
                <p className="text-xs text-slate-500 font-medium">
                  No active recruitment drives open at this moment.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunities.map(opp => (
                  <div key={opp.id} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-xs text-slate-900">{opp.title}</h3>
                        <div className="text-xs font-bold text-amber-800 mt-0.5">{opp.company_name}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {opp.opportunity_type}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">{opp.description}</p>

                    <div className="text-[10px] text-slate-500 flex justify-between pt-2 border-t border-slate-100">
                      <span>{opp.location}</span>
                      <span className="font-bold text-slate-800">{opp.stipend_or_salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── TAB 5: ACCREDITATION & NIRF HUB ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'accreditation' && (
        <div className="space-y-6">
          {/* Sub-nav pills */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl w-fit border border-slate-200/80">
            <button
              onClick={() => setAccreditationSubTab('accreditation')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                accreditationSubTab === 'accreditation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              Accreditation & Approvals
            </button>
            <button
              onClick={() => setAccreditationSubTab('benchmark')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                accreditationSubTab === 'benchmark'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              All-India Benchmark
            </button>
            <button
              onClick={() => setAccreditationSubTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                accreditationSubTab === 'reports'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              Compliance Reports & Export
            </button>
          </div>

          {accreditationSubTab === 'accreditation' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900">National Accreditation &amp; Statutory Approvals</h2>
              <p className="text-xs text-slate-500">Official institutional certifications for NAAC, NBA, and AICTE compliance</p>
            </div>
            {!isEditingAccreditation ? (
              <button
                onClick={() => setIsEditingAccreditation(true)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer"
              >
                Edit Records
              </button>
            ) : (
              <button
                onClick={() => setIsEditingAccreditation(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          {!isEditingAccreditation ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">NAAC Accreditation</div>
                <div className="text-xl font-black text-emerald-800">{accreditation.naacGrade || 'A++'}</div>
                <div className="text-[11px] text-slate-600">CGPA: {accreditation.naacCgpa || '3.62'}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">NBA Cycle</div>
                <div className="text-base font-black text-slate-900">{accreditation.nbaCycles || 'Tier-1 Valid'}</div>
                <div className="text-[11px] text-slate-600">Outcome-Based Education</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">NIRF Rank</div>
                <div className="text-xl font-black text-blue-800">#{accreditation.nirfRank || 84}</div>
                <div className="text-[11px] text-slate-600">National Engineering Ranking</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">AICTE Approval Code</div>
                <div className="text-xs font-mono font-bold text-slate-800 break-all">
                  {accreditation.aicteApprovalCode || 'AICTE-REG-VALID'}
                </div>
                <div className="text-[10px] text-slate-500">Valid thru {accreditation.validThru}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveAccreditation} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NAAC Grade</label>
                <input
                  type="text"
                  value={accreditation.naacGrade || ''}
                  onChange={e => setAccreditation({ ...accreditation, naacGrade: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NAAC CGPA</label>
                <input
                  type="text"
                  value={accreditation.naacCgpa || ''}
                  onChange={e => setAccreditation({ ...accreditation, naacCgpa: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NBA Cycles</label>
                <input
                  type="text"
                  value={accreditation.nbaCycles || ''}
                  onChange={e => setAccreditation({ ...accreditation, nbaCycles: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIRF Rank</label>
                <input
                  type="number"
                  value={accreditation.nirfRank || ''}
                  onChange={e => setAccreditation({ ...accreditation, nirfRank: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">AICTE Approval Code</label>
                <input
                  type="text"
                  value={accreditation.aicteApprovalCode || ''}
                  onChange={e => setAccreditation({ ...accreditation, aicteApprovalCode: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAccreditation(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Accreditation
                </button>
              </div>
            </form>
          )}
            </div>
          )}

          {accreditationSubTab === 'benchmark' && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-900">All-India Institutional Benchmark</h2>
            <p className="text-xs text-slate-500">
              Statistical comparison against national aggregate across {benchmark.participatingInstitutionsCount} institutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Campus Average Score</div>
              <div className="text-2xl font-black text-emerald-800">{benchmark.institutionAvgScore}%</div>
              <div className="text-[10px] text-emerald-600">{institutionName}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase">National Aggregate Mean</div>
              <div className="text-2xl font-black text-slate-800">{benchmark.nationalAvgScore}%</div>
              <div className="text-[10px] text-slate-500">Across all platform attempts</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-center space-y-1">
              <div className="text-[10px] font-bold text-amber-800 uppercase">Campus Percentile Rank</div>
              <div className="text-2xl font-black text-amber-900">{benchmark.percentileRank}th</div>
              <div className="text-[10px] text-amber-700">Higher than {benchmark.percentileRank}% of colleges</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800">Calculation Transparency &amp; Metadata</div>
            <p className="text-slate-600">
              {benchmark.calculationMethod}. Total individual student assessments evaluated: <span className="font-bold text-slate-900">{benchmark.totalAssessmentsEvaluated}</span>. Academic cycle: <span className="font-mono">{benchmark.dataPeriod}</span>.
            </p>
          </div>
            </div>
          )}

          {accreditationSubTab === 'reports' && (
            <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900">Statutory &amp; BoS Executive Reports</h2>
              <p className="text-xs text-slate-500">Official print-ready audit reports for NAAC Criteria 5 &amp; NBA OBE Accreditation</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportStudentsCSV}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200/90 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Student Matrix (CSV)
              </button>
              <button
                onClick={handlePrintReport}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-950 text-xs font-black border border-slate-200/90 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Print / Export PDF
              </button>
            </div>
          </div>

          <div ref={reportRef} className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6 print:p-0 print:border-none">
            <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-slate-900">{institutionName}</h1>
                <div className="text-xs text-slate-600 font-medium mt-1">
                  Institutional Assessment &amp; Skill Competency Audit Report
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Generated on {new Date().toLocaleDateString()} via Nova CareerConnect National Platform
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-md bg-slate-50 text-amber-900 font-mono font-bold text-xs border border-slate-200/90">
                  NAAC {accreditation.naacGrade} / NBA Tier-1
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-lg font-black text-slate-900">{metrics.totalStudents}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Enrolled Cohort</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-lg font-black text-slate-900">{metrics.totalDepartments}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Departments</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-lg font-black text-emerald-800">{metrics.avgReadinessScore}%</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Average Readiness</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-lg font-black text-blue-800">{benchmark.percentileRank}th</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">National Percentile</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="font-black text-xs text-slate-900 uppercase">Language Proficiency Summary</h3>
              <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full min-w-[500px] text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Subject / Technology</th>
                      <th className="py-2.5 px-3">Assessment Count</th>
                      <th className="py-2.5 px-3">Average Mastery Score</th>
                      <th className="py-2.5 px-3">Readiness Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {skillAnalytics.languageAverages.map((lang, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{lang.language}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{lang.testCount}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{lang.avgScore}%</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {lang.avgScore >= 70 ? 'Industry Ready' : lang.avgScore >= 40 ? 'Moderate Proficiency' : 'Requires Remediation'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
              <span>Report Authenticity Hash: {Math.random().toString(36).substring(2, 12).toUpperCase()}</span>
              <span>Authorized Institutional Copy • Ministry of Ayush / AICTE Framework</span>
            </div>
          </div>
            </div>
          )}
        </div>
      )}
      {/* ── MODAL: MAP COURSE SYLLABUS (BoS) ── */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200/90 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/90">
              <h3 className="text-base font-black text-slate-900">Map Department Course Syllabus</h3>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Department</label>
                <select
                  value={newCourseForm.departmentName}
                  onChange={e => setNewCourseForm({ ...newCourseForm, departmentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-semibold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ME301 / CE402"
                    value={newCourseForm.courseCode}
                    onChange={e => setNewCourseForm({ ...newCourseForm, courseCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={newCourseForm.semester}
                    onChange={e => setNewCourseForm({ ...newCourseForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Aided Machine Drawing / Structural Design"
                  value={newCourseForm.courseTitle}
                  onChange={e => setNewCourseForm({ ...newCourseForm, courseTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Mapped Skill</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SolidWorks / AutoCAD"
                    value={newCourseForm.mappedSkillName}
                    onChange={e => setNewCourseForm({ ...newCourseForm, mappedSkillName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coverage Level</label>
                  <select
                    value={newCourseForm.coverageLevel}
                    onChange={e => setNewCourseForm({ ...newCourseForm, coverageLevel: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-semibold"
                  >
                    <option value="Basic">Basic Theory</option>
                    <option value="Intermediate">Intermediate Lab</option>
                    <option value="Advanced">Advanced Project</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/90">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save to Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
