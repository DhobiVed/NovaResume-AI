import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert, Building2, Briefcase, Database,
  CheckCircle, X, Activity, Server, Users, UploadCloud,
  ShieldCheck, HelpCircle, Settings, Search,
  Plus, AlertTriangle, ChevronLeft, ChevronRight,
  Check, Ban, RefreshCw, Eye, Compass
} from 'lucide-react';
import { careerConnectService } from '../../services/careerConnectService';
import { ALL_MULTI_DISCIPLINARY_QUESTIONS } from '../../data/multiDisciplinaryQuestionBank';
import type {
  SuperAdminMetrics, InstitutionRecord, InstitutionFilterParams,
  InstitutionImportRow, PlatformUserRecord,
  UserFilterParams, SkillTaxonomyCategoryItem, AuditLogItem,
  PlatformConfigData, OpportunityItem, SkillDomain, SkillItem,
  PlatformHealthReport, BankQuestion
} from '../../types/careerConnect';
import { questionValidationService, type QuestionValidationReport } from '../../services/questionValidationService';

interface Props {
  activeSection?: string;
  onNavigateSection?: (section: string) => void;
}

type TabType =
  | 'dashboard'
  | 'institutions'
  | 'users'
  | 'governance'
  | 'system';

export const SuperAdminPortal: React.FC<Props> = ({
  activeSection = 'dashboard',
  onNavigateSection
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [institutionsSubTab, setInstitutionsSubTab] = useState<'directory' | 'import'>('directory');
  const [usersSubTab, setUsersSubTab] = useState<'directory' | 'verifications'>('directory');
  const [governanceSubTab, setGovernanceSubTab] = useState<'taxonomy' | 'question-bank' | 'opportunities'>('taxonomy');
  const [systemSubTab, setSystemSubTab] = useState<'settings' | 'audit-logs'>('settings');

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
      case 'institutions':
        setActiveTab('institutions');
        setInstitutionsSubTab('directory');
        break;
      case 'import':
      case 'bulk-import':
        setActiveTab('institutions');
        setInstitutionsSubTab('import');
        break;
      case 'users':
        setActiveTab('users');
        setUsersSubTab('directory');
        break;
      case 'verifications':
        setActiveTab('users');
        setUsersSubTab('verifications');
        break;
      case 'governance':
      case 'taxonomy':
      case 'skills':
        setActiveTab('governance');
        setGovernanceSubTab('taxonomy');
        break;
      case 'question-bank':
      case 'assessments':
        setActiveTab('governance');
        setGovernanceSubTab('question-bank');
        break;
      case 'opportunities':
      case 'industry':
      case 'companies':
        setActiveTab('governance');
        setGovernanceSubTab('opportunities');
        break;
      case 'system':
      case 'settings':
        setActiveTab('system');
        setSystemSubTab('settings');
        break;
      case 'audit-logs':
      case 'audit':
        setActiveTab('system');
        setSystemSubTab('audit-logs');
        break;
      default:
        setActiveTab('dashboard');
    }
  }, [activeSection]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ── 1. REAL-TIME NATIONAL METRICS ────────────────────────────
  const [metrics, setMetrics] = useState<SuperAdminMetrics>({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalInstitutions: 0,
    totalCompanies: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    activeInstitutions: 0,
    activeIndustryPartners: 0,
    placementCount: 0,
    internshipCount: 0,
    assessmentAttempts: 0,
    verifiedInstitutions: 0,
    verifiedCompanies: 0,
    pendingVerifications: 0,
    lastUpdated: ''
  });

  // ── REAL SERVICE HEALTH MONITOR STATE (ZERO FAKE DATA) ────────
  const [serviceHealth, setServiceHealth] = useState<PlatformHealthReport | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const runServiceCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const report = await careerConnectService.checkPlatformServices();
      setServiceHealth(report);
    } catch (e) {
      console.error('Service health probe failed', e);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // ── QUESTION QUALITY VALIDATION STATE ─────────────────────────
  const [validatingQuestion, setValidatingQuestion] = useState<BankQuestion | null>(null);
  const [validationReport, setValidationReport] = useState<QuestionValidationReport | null>(null);

  const handleInspectQuestionQuality = (q: BankQuestion) => {
    setValidatingQuestion(q);
    const report = questionValidationService.validateQuestion(q, ALL_MULTI_DISCIPLINARY_QUESTIONS);
    setValidationReport(report);
  };

  useEffect(() => {
    const unsub = careerConnectService.subscribeSuperAdminMetrics(setMetrics);
    runServiceCheck();
    return () => unsub();
  }, []);

  // ── 2. INSTITUTIONS DIRECTORY STATE & SUBSCRIPTION ────────────
  const [institutions, setInstitutions] = useState<InstitutionRecord[]>([]);
  const [instFilters, setInstFilters] = useState<InstitutionFilterParams>({
    state: 'All',
    institutionType: 'All',
    ownership: 'All',
    verificationStatus: 'All',
    activeStatus: 'All',
    search: ''
  });
  const [instPage, setInstPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const unsub = careerConnectService.subscribeInstitutions(instFilters, (list) => {
      setInstitutions(list);
      setInstPage(1);
    });
    return () => unsub();
  }, [instFilters]);

  // Add Institution Modal
  const [showAddInstModal, setShowAddInstModal] = useState(false);
  const [newInst, setNewInst] = useState({
    officialName: '',
    shortName: '',
    code: '',
    institutionType: 'Engineering College',
    ownership: 'Government',
    state: 'Gujarat',
    city: 'Modasa',
    website: '',
    officialEmail: '',
    departments: 'Computer Engineering, Information Technology, Electronics & Communication'
  });

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInst.officialName.trim() || !newInst.code.trim()) {
      showToast('Please enter both Institution Name and Code.', 'error');
      return;
    }
    try {
      await careerConnectService.createInstitution({
        officialName: newInst.officialName.trim(),
        shortName: newInst.shortName.trim() || newInst.code.trim(),
        code: newInst.code.toUpperCase().trim(),
        institutionType: newInst.institutionType,
        ownership: newInst.ownership,
        state: newInst.state.trim(),
        city: newInst.city.trim(),
        district: newInst.city.trim(),
        address: `${newInst.city.trim()}, ${newInst.state.trim()}`,
        pincode: '000000',
        website: newInst.website.trim() || `https://${newInst.code.toLowerCase()}.edu.in`,
        officialEmail: newInst.officialEmail.trim() || `info@${newInst.code.toLowerCase()}.edu.in`,
        departments: newInst.departments.split(',').map(d => d.trim()).filter(Boolean),
        establishedYear: 2000,
        verificationStatus: 'Verified',
        activeStatus: 'Active',
        source: 'Super Admin Portal Manual Entry'
      });
      setShowAddInstModal(false);
      setNewInst({
        officialName: '',
        shortName: '',
        code: '',
        institutionType: 'Engineering College',
        ownership: 'Government',
        state: 'Gujarat',
        city: 'Modasa',
        website: '',
        officialEmail: '',
        departments: 'Computer Engineering, Information Technology, Electronics & Communication'
      });
      showToast(`Institution '${newInst.officialName}' registered successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Error registering institution.', 'error');
    }
  };

  // ── 3. BULK IMPORT PIPELINE STATE ────────────────────────────
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreviewRows, setImportPreviewRows] = useState<InstitutionImportRow[]>([]);
  const [importStats, setImportStats] = useState<{ total: number; valid: number; duplicates: number; invalid: number }>({
    total: 0,
    valid: 0,
    duplicates: 0,
    invalid: 0
  });
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        showToast('CSV file is empty or missing headers.', 'error');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
      const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('college') || h.includes('institution'));
      const codeIdx = headers.findIndex(h => h.includes('code') || h.includes('id') || h.includes('aishe'));
      const stateIdx = headers.findIndex(h => h.includes('state'));
      const cityIdx = headers.findIndex(h => h.includes('city') || h.includes('district') || h.includes('location'));
      const typeIdx = headers.findIndex(h => h.includes('type'));
      const ownerIdx = headers.findIndex(h => h.includes('owner') || h.includes('category'));
      const webIdx = headers.findIndex(h => h.includes('web') || h.includes('url'));
      const emailIdx = headers.findIndex(h => h.includes('mail'));

      const existingCodes = new Set(institutions.map(i => i.code.toLowerCase()));
      const existingNames = new Set(institutions.map(i => i.officialName.toLowerCase()));

      let valid = 0;
      let duplicates = 0;
      let invalid = 0;
      const parsedRows: InstitutionImportRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
        const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : (row[0] || '');
        const code = codeIdx !== -1 && row[codeIdx] ? row[codeIdx] : `IMP-${i}`;

        if (!name) {
          invalid++;
          continue;
        }

        const isDup = existingCodes.has(code.toLowerCase()) || existingNames.has(name.toLowerCase());
        if (isDup) {
          duplicates++;
        } else {
          valid++;
        }

        parsedRows.push({
          officialName: name,
          code: code.toUpperCase(),
          state: stateIdx !== -1 && row[stateIdx] ? row[stateIdx] : 'National',
          city: cityIdx !== -1 && row[cityIdx] ? row[cityIdx] : 'Metro',
          institutionType: typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : 'College',
          ownership: ownerIdx !== -1 && row[ownerIdx] ? row[ownerIdx] : 'Government',
          website: webIdx !== -1 && row[webIdx] ? row[webIdx] : undefined,
          officialEmail: emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : undefined
        });
      }

      setImportPreviewRows(parsedRows.slice(0, 15));
      setImportStats({
        total: lines.length - 1,
        valid,
        duplicates,
        invalid
      });
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (importPreviewRows.length === 0 || !importFile) return;
    setIsImporting(true);
    try {
      const result = await careerConnectService.importInstitutionsBatch(
        importPreviewRows,
        importFile.name
      );
      showToast(`Successfully imported ${result.importedCount} institutions (${result.duplicateCount} duplicates skipped).`);
      setImportFile(null);
      setImportPreviewRows([]);
      setImportStats({ total: 0, valid: 0, duplicates: 0, invalid: 0 });
    } catch (err: any) {
      showToast(err.message || 'Bulk import failed.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // ── 4. USERS MANAGEMENT STATE & SUBSCRIPTION ─────────────────
  const [users, setUsers] = useState<PlatformUserRecord[]>([]);
  const [userFilters, setUserFilters] = useState<UserFilterParams>({
    role: 'All',
    status: 'All',
    search: ''
  });

  useEffect(() => {
    const unsub = careerConnectService.subscribeUsers(userFilters, setUsers);
    return () => unsub();
  }, [userFilters]);

  const handleToggleUserStatus = async (user: PlatformUserRecord) => {
    const targetStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    const confirmMsg = targetStatus === 'Suspended'
      ? `Are you sure you want to SUSPEND ${user.fullName}? They will not be able to log in or apply.`
      : `Reactivate account for ${user.fullName}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await careerConnectService.updateUserStatus(user.id, targetStatus, 'Super Admin Action');
      showToast(`User ${user.fullName} status updated to ${targetStatus}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  // ── 5. VERIFICATIONS QUEUE ────────────────────────────────────
  const pendingInstitutions = useMemo(
    () => institutions.filter(i => i.verificationStatus === 'Pending'),
    [institutions]
  );
  const pendingCompanies = useMemo(
    () => users.filter(u => u.role === 'industry' && u.verificationStatus === 'Pending'),
    [users]
  );

  const handleApproveInstitution = async (instId: string) => {
    await careerConnectService.verifyInstitution(instId, 'Verified', 'Approved by Super Admin');
    showToast('Institution verified and activated.');
  };

  const handleRejectInstitution = async (instId: string) => {
    const reason = prompt('Enter rejection reason:') || 'Documentation incomplete';
    await careerConnectService.verifyInstitution(instId, 'Rejected', reason);
    showToast('Institution verification rejected.');
  };

  const handleApproveCompany = async (userId: string) => {
    await careerConnectService.verifyCompany(userId, 'Verified', 'Verified recruiter identity');
    showToast('Industry partner verified.');
  };

  const handleRejectCompany = async (userId: string) => {
    const reason = prompt('Enter rejection reason:') || 'Domain or business verification failed';
    await careerConnectService.verifyCompany(userId, 'Rejected', reason);
    showToast('Company verification rejected.');
  };

  // ── 6. MULTI-DISCIPLINARY SKILL TAXONOMY & DISCIPLINES ────────
  const [taxonomy, setTaxonomy] = useState<SkillTaxonomyCategoryItem[]>([]);
  const [skillDomains, setSkillDomains] = useState<SkillDomain[]>([]);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedTaxId, setSelectedTaxId] = useState<string>('');
  const [newSkillName, setNewSkillName] = useState('');
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCat, setNewCat] = useState<{ name: string; domain: string; inDemand: 'High' | 'Very High' | 'Critical' }>({
    name: '',
    domain: 'Technical',
    inDemand: 'High'
  });

  // New Multi-Disciplinary Domain & Skill modals
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newDomain, setNewDomain] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
    departments: '',
    categoryName: '',
    sampleSkill: ''
  });

  const [showAddSkillToDomainModal, setShowAddSkillToDomainModal] = useState(false);
  const [domainSkillForm, setDomainSkillForm] = useState({
    domainId: '',
    categoryId: '',
    categoryName: '',
    skillName: '',
    demandRating: 'High' as 'Critical' | 'High' | 'Moderate',
    skillType: 'software' as 'software' | 'tool' | 'method' | 'core_subject' | 'equipment'
  });

  useEffect(() => {
    const unsubTax = careerConnectService.subscribeSkillTaxonomy((tax) => {
      setTaxonomy(tax);
      if (tax.length > 0 && !selectedTaxId) {
        setSelectedTaxId(tax[0].id);
      }
    });

    const unsubDomains = careerConnectService.subscribeSkillDomains((domains) => {
      setSkillDomains(domains);
    });

    return () => {
      untax_cleanup: {
        unsubTax();
        unsubDomains();
      }
    };
  }, [selectedTaxId]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !selectedTaxId) return;
    await careerConnectService.addSkillToTaxonomy(selectedTaxId, newSkillName.trim());
    setNewSkillName('');
    setShowSkillModal(false);
    showToast(`Skill '${newSkillName.trim()}' added to taxonomy.`);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    await careerConnectService.createTaxonomyCategory({
      category_name: newCat.name.trim(),
      domain: newCat.domain,
      skills: [],
      in_demand_rating: newCat.inDemand,
      last_updated: new Date().toISOString().split('T')[0]
    });
    setShowCatModal(false);
    setNewCat({ name: '', domain: 'Technical', inDemand: 'High' });
    showToast(`Taxonomy category '${newCat.name.trim()}' created.`);
  };

  const handleCreateSkillDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.name.trim() || !newDomain.code.trim()) return;
    const domainId = newDomain.id.trim() || newDomain.code.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const catId = (newDomain.categoryName || 'core').toLowerCase().replace(/[^a-z0-9]/g, '_');

    const createdDomain: SkillDomain = {
      id: domainId,
      name: newDomain.name.trim(),
      code: newDomain.code.trim().toUpperCase(),
      description: newDomain.description.trim() || `${newDomain.name.trim()} Multi-Disciplinary Domain`,
      iconName: 'Cpu',
      isCore: true,
      displayOrder: skillDomains.length + 1,
      status: 'active',
      associatedDepartments: newDomain.departments.split(',').map(d => d.trim()).filter(Boolean),
      categories: [
        {
          id: catId,
          domainId: domainId,
          name: newDomain.categoryName.trim() || 'Core Competencies',
          code: catId.toUpperCase(),
          description: `Primary skills for ${newDomain.name.trim()}`,
          skills: newDomain.sampleSkill.trim() ? [
            {
              id: newDomain.sampleSkill.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
              domainId: domainId,
              categoryId: catId,
              name: newDomain.sampleSkill.trim(),
              code: newDomain.sampleSkill.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-'),
              inDemandRating: 'High',
              coreDisciplines: [newDomain.name.trim()],
              topics: [],
              status: 'active',
              skillType: 'software',
              minPracticalHours: 40
            }
          ] : []
        }
      ]
    };

    try {
      await careerConnectService.createSkillDomain(createdDomain);
      setShowAddDomainModal(false);
      setNewDomain({
        id: '',
        name: '',
        code: '',
        description: '',
        departments: '',
        categoryName: '',
        sampleSkill: ''
      });
      showToast(`Discipline '${createdDomain.name}' registered to National Taxonomy!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create skill domain', 'error');
    }
  };

  const handleAddSkillToDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainSkillForm.domainId || !domainSkillForm.skillName.trim()) return;

    const targetDomain = skillDomains.find(d => d.id === domainSkillForm.domainId);
    if (!targetDomain) return;

    const catId = domainSkillForm.categoryId || (domainSkillForm.categoryName || 'general').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newSkill: SkillItem = {
      id: domainSkillForm.skillName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
      domainId: targetDomain.id,
      categoryId: catId,
      name: domainSkillForm.skillName.trim(),
      code: domainSkillForm.skillName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-'),
      inDemandRating: domainSkillForm.demandRating,
      coreDisciplines: [targetDomain.name],
      topics: [],
      status: 'active',
      skillType: domainSkillForm.skillType,
      minPracticalHours: 40
    };

    const updatedCategories = [...(targetDomain.categories || [])];
    let cat = updatedCategories.find(c => 
      (domainSkillForm.categoryId && c.id === domainSkillForm.categoryId) || 
      (domainSkillForm.categoryName && c.name.toLowerCase() === domainSkillForm.categoryName.toLowerCase())
    );

    if (cat) {
      cat.skills = [...(cat.skills || []), newSkill];
    } else {
      updatedCategories.push({
        id: catId,
        domainId: targetDomain.id,
        name: domainSkillForm.categoryName.trim() || 'General Competencies',
        code: catId.toUpperCase(),
        skills: [newSkill]
      });
    }

    const updatedDomain: SkillDomain = {
      ...targetDomain,
      categories: updatedCategories
    };

    try {
      await careerConnectService.createSkillDomain(updatedDomain);
      setShowAddSkillToDomainModal(false);
      setDomainSkillForm({
        domainId: '',
        categoryId: '',
        categoryName: '',
        skillName: '',
        demandRating: 'High',
        skillType: 'software'
      });
      showToast(`Skill '${newSkill.name}' added to ${targetDomain.name}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to add skill to domain', 'error');
    }
  };

  // ── 7. QUESTION BANK GOVERNANCE ───────────────────────────────
  const [qbFilterDomain, setQbFilterDomain] = useState('All');
  const [qbFilterLang, setQbFilterLang] = useState('All');
  const [qbFilterDiff, setQbFilterDiff] = useState('All');
  const [qbSearch, setQbSearch] = useState('');

  const filteredQuestions = useMemo(() => {
    return ALL_MULTI_DISCIPLINARY_QUESTIONS.filter(q => {
      if (qbFilterDomain !== 'All') {
        const dId = q.domainId?.toLowerCase() || '';
        const dName = q.domainName?.toLowerCase() || '';
        const target = qbFilterDomain.toLowerCase();
        if (dId !== target && !dName.includes(target)) return false;
      }
      if (qbFilterLang !== 'All' && 
          q.programmingLanguage?.toLowerCase() !== qbFilterLang.toLowerCase() &&
          q.skillName?.toLowerCase() !== qbFilterLang.toLowerCase()) {
        return false;
      }
      if (qbFilterDiff !== 'All' && q.difficulty.toLowerCase() !== qbFilterDiff.toLowerCase()) return false;
      if (qbSearch.trim() && !q.question.toLowerCase().includes(qbSearch.toLowerCase().trim())) return false;
      return true;
    });
  }, [qbFilterDomain, qbFilterLang, qbFilterDiff, qbSearch]);

  // ── 8. OPPORTUNITIES GOVERNANCE ───────────────────────────────
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  useEffect(() => {
    careerConnectService.getOpportunities().then(setOpportunities);
  }, []);

  // ── 9. AUDIT LOGS ─────────────────────────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    const unsub = careerConnectService.subscribeAuditLogs({ search: auditSearch }, setAuditLogs);
    return () => unsub();
  }, [auditSearch]);

  // ── 10. PLATFORM CONFIGURATION ────────────────────────────────
  const [config, setConfig] = useState<PlatformConfigData | null>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    careerConnectService.getPlatformConfig().then(setConfig);
  }, []);

  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSavingConfig(true);
    try {
      await careerConnectService.updatePlatformConfig(config);
      showToast('Platform configuration saved and active.');
    } catch (err: any) {
      showToast(err.message || 'Failed to save configuration.', 'error');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Pagination for institutions
  const paginatedInstitutions = useMemo(() => {
    const start = (instPage - 1) * pageSize;
    return institutions.slice(start, start + pageSize);
  }, [institutions, instPage]);
  const totalInstPages = Math.ceil(institutions.length / pageSize) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl border shadow-xl flex items-center gap-3 animate-slideIn ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200/90 text-slate-900'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── TOP BANNER ── */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-800 text-xs font-mono font-bold border border-slate-200/90">
              CENTRAL SUPER ADMIN GOVERNANCE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 text-xs font-bold border border-slate-200/90">
              AICTE / AISHE NATIONAL NETWORK
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 mt-2">
            Nova CareerConnect Apex Portal
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Real Database Orchestration • Multi-Tenant College Governance, Bulk Imports &amp; National Skill Taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 flex items-center gap-2 shadow-2xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-800">
              Live Firestore Sync Active
            </span>
          </div>
        </div>
      </div>

      {/* ── REAL-TIME NATIONAL AGGREGATION METRICS (ZERO FAKE DATA) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2.5">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-slate-900">{metrics.activeUsers}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Active Users</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-emerald-700">{metrics.totalStudents}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Students</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-purple-700">{metrics.totalFaculty}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Faculty</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-blue-700">{metrics.totalInstitutions}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Institutions</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-amber-700">{metrics.totalCompanies}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Companies</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-slate-800">{metrics.totalOpportunities}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Opportunities</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-orange-700">{metrics.totalApplications}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Applications</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-emerald-800">{metrics.placementCount}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Placements</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-amber-800">{metrics.internshipCount}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Internships</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className="text-lg font-black text-teal-700">{metrics.assessmentAttempts}</div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Assessments</div>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-0.5">
          <div className={`text-lg font-black ${metrics.pendingVerifications > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {metrics.pendingVerifications}
          </div>
          <div className="text-[9px] font-bold text-slate-500 uppercase truncate">Pending Verif.</div>
        </div>
      </div>

      {/* ── 5 NAVIGATION HUBS ── */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'dashboard' as TabType, label: 'National Dashboard', icon: Activity },
          { id: 'institutions' as TabType, label: 'Institutions & Ingestion', icon: Building2 },
          {
            id: 'users' as TabType,
            label: 'Users & Verifications',
            icon: Users,
            badge: metrics.pendingVerifications > 0 ? metrics.pendingVerifications : undefined
          },
          { id: 'governance' as TabType, label: 'Academic Governance', icon: Database },
          { id: 'system' as TabType, label: 'System & Security', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs border border-slate-200/90 font-black'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── CONTEXTUAL SUB-TABS SEGMENTED CONTROL ── */}
      {activeTab === 'institutions' && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
          <button
            onClick={() => setInstitutionsSubTab('directory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              institutionsSubTab === 'directory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Colleges Directory</span>
          </button>
          <button
            onClick={() => setInstitutionsSubTab('import')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              institutionsSubTab === 'import'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Bulk AISHE/CSV Import</span>
          </button>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
          <button
            onClick={() => setUsersSubTab('directory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              usersSubTab === 'directory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Directory</span>
          </button>
          <button
            onClick={() => setUsersSubTab('verifications')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              usersSubTab === 'verifications'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verification Center</span>
            {metrics.pendingVerifications > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
                {metrics.pendingVerifications}
              </span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'governance' && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
          <button
            onClick={() => setGovernanceSubTab('taxonomy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              governanceSubTab === 'taxonomy'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Skill Taxonomy</span>
          </button>
          <button
            onClick={() => setGovernanceSubTab('question-bank')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              governanceSubTab === 'question-bank'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Question Bank</span>
          </button>
          <button
            onClick={() => setGovernanceSubTab('opportunities')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              governanceSubTab === 'opportunities'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Opportunities</span>
          </button>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit">
          <button
            onClick={() => setSystemSubTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              systemSubTab === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Settings</span>
          </button>
          <button
            onClick={() => setSystemSubTab('audit-logs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              systemSubTab === 'audit-logs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Security &amp; Audit Logs</span>
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── HUB 1: NATIONAL DASHBOARD ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Live Platform Services &amp; Infrastructure Monitor</h2>
                  <p className="text-xs text-slate-500">Real-time network &amp; database connection health probes (Zero fake uptime data)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    serviceHealth?.overallStatus === 'healthy'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : serviceHealth?.overallStatus === 'degraded'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                    PLATFORM: {serviceHealth?.overallStatus ? serviceHealth.overallStatus.toUpperCase() : 'CHECKING...'}
                  </span>
                  <button
                    disabled={isCheckingHealth}
                    onClick={runServiceCheck}
                    className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-700 cursor-pointer transition-colors"
                    title="Probe Services Now"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin text-amber-700' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Real Connection Probes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceHealth?.services.map((svc, sIdx) => (
                  <div key={sIdx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-slate-900 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-slate-600" />
                        {svc.serviceName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-600">
                          {svc.latencyMs}ms
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold font-mono ${
                          svc.status === 'operational'
                            ? 'bg-emerald-100 text-emerald-800'
                            : svc.status === 'degraded'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {svc.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-tight">
                      {svc.endpointOrDescription}
                    </p>
                    <div className="text-[9px] text-slate-400 font-mono pt-0.5">
                      Checked: {new Date(svc.lastChecked).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* User Distribution Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Platform Cohort Balance</span>
                  <span className="font-mono text-slate-500">{metrics.activeUsers} Total Active</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden">
                  <div
                    style={{ width: `${metrics.activeUsers > 0 ? (metrics.totalStudents / metrics.activeUsers) * 100 : 0}%` }}
                    className="bg-emerald-500"
                    title={`Students: ${metrics.totalStudents}`}
                  />
                  <div
                    style={{ width: `${metrics.activeUsers > 0 ? (metrics.totalFaculty / metrics.activeUsers) * 100 : 0}%` }}
                    className="bg-purple-500"
                    title={`Faculty: ${metrics.totalFaculty}`}
                  />
                  <div
                    style={{ width: `${metrics.activeUsers > 0 ? (metrics.totalCompanies / metrics.activeUsers) * 100 : 0}%` }}
                    className="bg-amber-500"
                    title={`Recruiters: ${metrics.totalCompanies}`}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Students ({metrics.totalStudents})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Faculty ({metrics.totalFaculty})</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Recruiters ({metrics.totalCompanies})</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & State Stats */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-sm font-black text-slate-900">Governance Directives</h2>

              <div className="space-y-2">
                <button
                  onClick={() => setShowAddInstModal(true)}
                  className="w-full p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-between border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Register Institution</span>
                  <Plus className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { handleSelectTab('institutions'); setInstitutionsSubTab('import'); }}
                  className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-between border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Bulk Upload CSV</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { handleSelectTab('users'); setUsersSubTab('verifications'); }}
                  className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-between border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Review Verifications</span>
                  {metrics.pendingVerifications > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {metrics.pendingVerifications} Pending
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => { handleSelectTab('governance'); setGovernanceSubTab('taxonomy'); }}
                  className="w-full p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-between border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Database className="w-4 h-4" /> Skill Taxonomy Ontology</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Verification Rate</div>
                <div className="text-lg font-black text-emerald-800">
                  {metrics.totalInstitutions > 0
                    ? Math.round((metrics.verifiedInstitutions / metrics.totalInstitutions) * 100)
                    : 100}% Verified
                </div>
                <p className="text-[10px] text-slate-600">
                  {metrics.verifiedInstitutions} of {metrics.totalInstitutions} institutions verified
                </p>
              </div>
            </div>
          </div>

          {/* Recent Audit Trail Preview */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">Recent Security &amp; Administrative Events</h2>
                <p className="text-xs text-slate-500">Immutable ledger stream from Firestore auditLogs</p>
              </div>
              <button
                onClick={() => { handleSelectTab('system'); setSystemSubTab('audit-logs'); }}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                View Complete Log &rarr;
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No administrative actions logged yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/90 font-bold text-slate-700">
                          {log.action}
                        </span>
                        <span className="font-bold text-slate-800 truncate">{log.details}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Actor: <span className="font-medium text-slate-600">{log.actor_name}</span> ({log.actor_role}) • Target: {log.resource_type}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── HUB 2a: INSTITUTIONS → COLLEGES DIRECTORY ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'institutions' && institutionsSubTab === 'directory' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
            <div className="flex-1 flex flex-wrap gap-2 items-center">
              <div className="relative min-w-[200px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search college name, code, city..."
                  value={instFilters.search || ''}
                  onChange={e => setInstFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200/90 focus:outline-none focus:bg-white"
                />
              </div>

              <select
                value={instFilters.state || 'All'}
                onChange={e => setInstFilters(prev => ({ ...prev, state: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All States</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>

              <select
                value={instFilters.ownership || 'All'}
                onChange={e => setInstFilters(prev => ({ ...prev, ownership: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All Ownerships</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Autonomous">Autonomous</option>
              </select>

              <select
                value={instFilters.verificationStatus || 'All'}
                onChange={e => setInstFilters(prev => ({ ...prev, verificationStatus: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddInstModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-1.5 border border-slate-200/90 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add College
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/90 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-black text-slate-900">
                Registered Higher Education Institutions ({institutions.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Showing page {instPage} of {totalInstPages}
              </span>
            </div>

            {institutions.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">No institutions found</div>
                <p className="text-xs text-slate-400">Try adjusting your filters or import a college batch.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[600px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/90">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Institution Name</th>
                      <th className="py-3 px-4">Type &amp; Category</th>
                      <th className="py-3 px-4">State / City</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedInstitutions.map(inst => (
                      <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {inst.code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{inst.officialName}</div>
                          <div className="text-[10px] text-slate-500">
                            {inst.shortName && `${inst.shortName} • `}
                            {inst.website || 'No website registered'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-[10px] text-slate-700">
                            {inst.institutionType}
                          </span>
                          <span className="ml-1 text-[10px] text-slate-500">({inst.ownership})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {inst.city}, <span className="font-bold">{inst.state}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              inst.verificationStatus === 'Verified'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : inst.verificationStatus === 'Rejected'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {inst.verificationStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inst.verificationStatus !== 'Verified' && (
                              <button
                                onClick={() => handleApproveInstitution(inst.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer"
                                title="Approve Verification"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const newName = prompt('Update Official Name:', inst.officialName);
                                if (newName && newName.trim()) {
                                  careerConnectService.updateInstitution(inst.id, { officialName: newName.trim() });
                                  showToast('Institution name updated.');
                                }
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Deactivate ${inst.officialName}?`)) {
                                  await careerConnectService.deleteInstitution(inst.id);
                                  showToast('Institution deactivated.');
                                }
                              }}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                              title="Deactivate"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalInstPages > 1 && (
              <div className="p-3 border-t border-slate-200/90 flex items-center justify-between bg-white text-xs">
                <button
                  disabled={instPage === 1}
                  onClick={() => setInstPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200/90 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <span className="font-mono text-slate-600">
                  Page {instPage} of {totalInstPages}
                </span>
                <button
                  disabled={instPage === totalInstPages}
                  onClick={() => setInstPage(p => Math.min(totalInstPages, p + 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200/90 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── HUB 2b: INSTITUTIONS → BULK AISHE/CSV IMPORT ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'institutions' && institutionsSubTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-black text-slate-900">National College CSV Bulk Ingestion Pipeline</h2>
              <p className="text-xs text-slate-500">
                Upload standardized AICTE / AISHE institutional CSV rosters. Automatically checks for duplicates against existing college codes and names.
              </p>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-200/90 rounded-2xl bg-slate-50 text-center space-y-3">
              <UploadCloud className="w-10 h-10 text-amber-700 mx-auto" />
              <div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-950 font-bold text-xs border border-slate-200/90 shadow-2xs inline-block">
                  <span>Select CSV File</span>
                  <input
                    type="file"
                    accept=".csv, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <div className="text-[11px] text-slate-500 mt-2">
                  Expected CSV headers: <code className="bg-white px-1 py-0.5 rounded border border-slate-200/90">Name, Code, State, City, Type, Category, Website, Email</code>
                </div>
              </div>
              {importFile && (
                <div className="text-xs font-bold text-emerald-700">
                  Loaded: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {importStats.total > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Total Rows</div>
                    <div className="text-lg font-black text-slate-900">{importStats.total}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-xs text-emerald-700 font-medium">Valid for Ingestion</div>
                    <div className="text-lg font-black text-emerald-800">{importStats.valid}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="text-xs text-amber-700 font-medium">Existing Duplicates</div>
                    <div className="text-lg font-black text-amber-800">{importStats.duplicates}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="text-xs text-rose-700 font-medium">Invalid / Missing</div>
                    <div className="text-lg font-black text-rose-800">{importStats.invalid}</div>
                  </div>
                </div>

                <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
                  <div className="p-3 bg-slate-50 font-bold text-xs text-slate-800 border-b border-slate-200/90 flex justify-between">
                    <span>Parsed Records Preview (Showing first {importPreviewRows.length})</span>
                    <span className="text-emerald-700">Ready for atomic Firestore write</span>
                  </div>
                  <div className="max-h-64 overflow-x-auto overflow-y-auto w-full custom-scrollbar">
                    <table className="w-full min-w-[500px] text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-2 px-3">Code</th>
                          <th className="py-2 px-3">Official Name</th>
                          <th className="py-2 px-3">State</th>
                          <th className="py-2 px-3">City</th>
                          <th className="py-2 px-3">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreviewRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.code}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{row.officialName}</td>
                            <td className="py-2 px-3 text-slate-700">{row.state}</td>
                            <td className="py-2 px-3 text-slate-700">{row.city}</td>
                            <td className="py-2 px-3 text-slate-600">{row.institutionType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setImportFile(null);
                      setImportPreviewRows([]);
                      setImportStats({ total: 0, valid: 0, duplicates: 0, invalid: 0 });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isImporting || importStats.valid === 0}
                    onClick={handleExecuteImport}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-950 text-xs font-black border border-slate-200/90 shadow-sm disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                  >
                    {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Confirm &amp; Ingest {importStats.valid} Colleges</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── HUB 3a: USERS → USER DIRECTORY ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && usersSubTab === 'directory' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="flex-1 flex flex-wrap gap-2 items-center w-full md:w-auto">
              <div className="relative min-w-[220px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, email, institution..."
                  value={userFilters.search || ''}
                  onChange={e => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200/90 focus:outline-none focus:bg-white"
                />
              </div>

              <select
                value={userFilters.role || 'All'}
                onChange={e => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All Roles</option>
                <option value="student">Student</option>
                <option value="academician">Academician / Faculty</option>
                <option value="institution">Institution Admin</option>
                <option value="industry">Industry / Recruiter</option>
                <option value="super_admin">Super Admin</option>
              </select>

              <select
                value={userFilters.status || 'All'}
                onChange={e => setUserFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All Account Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200/90 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-black text-slate-900">
                Registered Platform Accounts ({users.length})
              </span>
            </div>

            {users.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 font-medium">
                No users found matching query.
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[550px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/90">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Affiliation / Entity</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.role === 'student'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : u.role === 'academician'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : u.role === 'industry'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : u.role === 'institution'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {u.institution || u.company || '—'}
                          {u.department && <span className="text-[10px] text-slate-400 block">{u.department}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              u.status === 'Active'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                          </button>
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
      {/* ── HUB 3b: USERS → VERIFICATION CENTER ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && usersSubTab === 'verifications' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">Pending Institution Verifications</h2>
                <p className="text-xs text-slate-500">Colleges awaiting accreditation check &amp; official verification</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                {pendingInstitutions.length} In Queue
              </span>
            </div>

            {pendingInstitutions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No institutions currently awaiting verification.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingInstitutions.map(inst => (
                  <div key={inst.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{inst.officialName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Code: <span className="font-mono font-bold text-slate-700">{inst.code}</span> • {inst.city}, {inst.state} • Type: {inst.institutionType}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Email: {inst.officialEmail} • Web: {inst.website}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveInstitution(inst.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectInstitution(inst.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">Pending Recruiter &amp; Employer Verifications</h2>
                <p className="text-xs text-slate-500">Corporate accounts requesting ability to publish job posts and hire talent</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                {pendingCompanies.length} In Queue
              </span>
            </div>

            {pendingCompanies.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">
                No recruiter accounts currently pending verification.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingCompanies.map(comp => (
                  <div key={comp.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{comp.company || comp.fullName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Contact: {comp.fullName} • Email: <span className="font-mono text-slate-700">{comp.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveCompany(comp.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Approve Partner
                      </button>
                      <button
                        onClick={() => handleRejectCompany(comp.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── HUB 4a: GOVERNANCE → SKILL TAXONOMY ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'governance' && governanceSubTab === 'taxonomy' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-amber-900 text-[10px] font-mono font-bold border border-slate-200/90">
                  AICTE / UGC / NEP 2020 TAXONOMY
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Live Sync Active
                </span>
              </div>
              <h2 className="text-sm font-black text-slate-900 mt-1">National Multi-Disciplinary Skill Taxonomy & Disciplines</h2>
              <p className="text-xs text-slate-500">
                Governs skill standards across Mechanical, Civil, Electrical, Electronics, CS, Chemical, Pharmacy, and Management.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddDomainModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Register Discipline</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (skillDomains.length > 0) {
                    setDomainSkillForm(prev => ({ ...prev, domainId: skillDomains[0].id }));
                  }
                  setShowAddSkillToDomainModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Skill to Domain</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCatModal(true)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
              >
                + Category
              </button>
            </div>
          </div>

          {/* Discipline Selector Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedDomainFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDomainFilter === 'all'
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              All Disciplines ({skillDomains.length})
            </button>
            {skillDomains.map(dom => (
              <button
                key={dom.id}
                onClick={() => setSelectedDomainFilter(dom.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedDomainFilter === dom.id
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{dom.code}</span>
                <span>{dom.name}</span>
              </button>
            ))}
          </div>

          {/* Multi-Disciplinary Domain Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {skillDomains
              .filter(dom => selectedDomainFilter === 'all' || dom.id === selectedDomainFilter)
              .map(dom => {
                const totalSkills = dom.categories.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);
                return (
                  <div key={dom.id} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold">
                              {dom.code}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm">{dom.name}</h3>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{dom.description}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-amber-900 text-[10px] font-bold border border-slate-200/90 shrink-0">
                          {totalSkills} Skills
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400">
                        Mapped Depts: <span className="text-slate-600 font-medium">{dom.associatedDepartments?.join(', ')}</span>
                      </div>

                      {/* Categories & Skills breakdown */}
                      <div className="space-y-2.5 mt-3 pt-3 border-t border-slate-100">
                        {dom.categories.map(cat => (
                          <div key={cat.id} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                              <span>{cat.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{cat.skills?.length || 0} skills</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {cat.skills?.map(skill => {
                                const isCrit = skill.inDemandRating === 'Critical';
                                const isHigh = skill.inDemandRating === 'High';
                                return (
                                  <span
                                    key={skill.id}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex items-center gap-1.5 ${
                                      isCrit
                                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                                        : isHigh
                                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span>{skill.name}</span>
                                    <span className="text-[9px] font-mono opacity-70">({skill.skillType || 'tool'})</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-slate-400">
                        ID: <code className="text-slate-600 font-mono">{dom.id}</code>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setDomainSkillForm({
                            domainId: dom.id,
                            categoryId: dom.categories[0]?.id || '',
                            categoryName: dom.categories[0]?.name || 'Applied Skills',
                            skillName: '',
                            demandRating: 'High',
                            skillType: 'software'
                          });
                          setShowAddSkillToDomainModal(true);
                        }}
                        className="text-amber-800 hover:text-amber-950 font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add skill to this discipline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Legacy Categories Compatibility Section */}
          {taxonomy.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase">Legacy Taxonomy Categories ({taxonomy.length})</h3>
                  <p className="text-[11px] text-slate-500">Backwards-compatible category records synchronized with older modules</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {taxonomy.map(cat => (
                  <div key={cat.id} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-xs">{cat.category_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{cat.domain}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── HUB 4b: GOVERNANCE → QUESTION BANK ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'governance' && governanceSubTab === 'question-bank' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex-1 flex flex-wrap gap-2 items-center w-full md:w-auto">
              <div className="relative min-w-[180px] flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search question text, tools, or concepts..."
                  value={qbSearch}
                  onChange={e => setQbSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200/90 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Multi-Disciplinary Domain Filter */}
              <select
                value={qbFilterDomain}
                onChange={e => setQbFilterDomain(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-bold text-slate-800"
              >
                <option value="All">All Disciplines & Domains</option>
                <option value="mechanical">Mechanical Engineering</option>
                <option value="civil">Civil Engineering</option>
                <option value="electrical">Electrical Engineering</option>
                <option value="ece">Electronics & Communication</option>
                <option value="cs_it">Computer Science & IT</option>
              </select>

              <select
                value={qbFilterLang}
                onChange={e => setQbFilterLang(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All Subjects / Skills</option>
                <option value="SolidWorks">SolidWorks</option>
                <option value="AutoCAD Civil">AutoCAD Civil</option>
                <option value="PLC Programming">PLC Programming</option>
                <option value="Embedded C">Embedded C</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
                <option value="C++">C++</option>
                <option value="SQL">SQL</option>
                <option value="React">React</option>
              </select>

              <select
                value={qbFilterDiff}
                onChange={e => setQbFilterDiff(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200/90 font-medium"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <span className="text-xs font-mono font-bold text-slate-600 shrink-0">
              {filteredQuestions.length} of {ALL_MULTI_DISCIPLINARY_QUESTIONS.length} Questions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredQuestions.slice(0, 24).map((q, idx) => (
              <div key={q.id || idx} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap justify-between items-center text-[10px] gap-1">
                    <span className="font-mono font-bold text-slate-600">ID: {q.id}</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                        {q.domainName || (q.domainId === 'mechanical' ? 'Mechanical' : q.domainId === 'civil' ? 'Civil' : q.domainId === 'electrical' ? 'Electrical' : q.domainId === 'ece' ? 'ECE' : 'CS & IT')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                        {q.skillName || q.programmingLanguage}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          q.difficulty === 'Hard'
                            ? 'bg-rose-50 text-rose-700'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      {q.questionType && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[9px] font-mono uppercase">
                          {q.questionType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Engineering Diagram / Schematic Callout */}
                  {q.diagramDescription && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-800 font-medium flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span><strong>Technical Schematic:</strong> {q.diagramDescription}</span>
                    </div>
                  )}

                  <div className="text-xs font-bold text-slate-900">{q.question}</div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-2">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-1.5 rounded-lg border ${
                        oIdx === q.correctIndex
                          ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                          : 'bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold font-mono">
                      Quality: {q.qualityScore || 98}/100
                    </span>
                    {q.hint && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold" title={q.hint}>
                        Hint Available
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInspectQuestionQuality(q)}
                    className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 font-bold cursor-pointer transition-colors"
                  >
                    Audit Quality Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── HUB 4c: GOVERNANCE → OPPORTUNITIES ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'governance' && governanceSubTab === 'opportunities' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-slate-900">National Opportunities Governance</h2>
              <p className="text-xs text-slate-500">Live recruiter postings across all connected colleges ({opportunities.length})</p>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center text-xs text-slate-400 font-medium">
              No live opportunities currently posted.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map(opp => (
                <div key={opp.id} className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-xs text-slate-900">{opp.title}</div>
                      <div className="text-[10px] font-bold text-amber-800">{opp.company_name}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {opp.opportunity_type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2">{opp.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {opp.required_skills?.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-50 text-[9px] text-slate-600 border border-slate-100 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-500">
                    <span>{opp.location} • {opp.stipend_or_salary}</span>
                    <button
                      onClick={() => showToast(`Opportunity ${opp.title} is active on platform.`)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── HUB 5a: SYSTEM → SECURITY & AUDIT LOGS ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'system' && systemSubTab === 'audit-logs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex justify-between items-center">
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit actions, actors, targets..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200/90 focus:outline-none focus:bg-white"
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              TAMPER-PROOF APPEND-ONLY LEDGER
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 font-medium">
                No audit entries found.
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[600px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/90">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Resource Target</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900">{log.actor_name}</span>
                          <span className="text-[10px] text-slate-400 block">{log.actor_role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/90 font-bold text-slate-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{log.resource_type}</td>
                        <td className="py-3 px-4 text-slate-600 font-sans text-xs">{log.details}</td>
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
      {/* ── HUB 5b: SYSTEM → PLATFORM SETTINGS ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'system' && systemSubTab === 'settings' && config && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h2 className="text-sm font-black text-slate-900">Platform Governance &amp; Feature Flags</h2>
            <p className="text-xs text-slate-500">Central parameters stored in Firestore platformConfig/default</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Platform Toggles</h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium cursor-pointer">
                  <span>Open Student Registration</span>
                  <input
                    type="checkbox"
                    checked={config.featureFlags.publicRegistration}
                    onChange={e => setConfig({
                      ...config,
                      featureFlags: { ...config.featureFlags, publicRegistration: e.target.checked }
                    })}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium cursor-pointer">
                  <span>Auto-Verify Registered Colleges</span>
                  <input
                    type="checkbox"
                    checked={config.featureFlags.autoVerifyInstitutions}
                    onChange={e => setConfig({
                      ...config,
                      featureFlags: { ...config.featureFlags, autoVerifyInstitutions: e.target.checked }
                    })}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium cursor-pointer">
                  <span>Direct Company Signups</span>
                  <input
                    type="checkbox"
                    checked={config.featureFlags.allowDirectCompanyRegistration}
                    onChange={e => setConfig({
                      ...config,
                      featureFlags: { ...config.featureFlags, allowDirectCompanyRegistration: e.target.checked }
                    })}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 text-xs font-medium cursor-pointer">
                  <span>Maintenance Mode</span>
                  <input
                    type="checkbox"
                    checked={config.featureFlags.maintenanceMode}
                    onChange={e => setConfig({
                      ...config,
                      featureFlags: { ...config.featureFlags, maintenanceMode: e.target.checked }
                    })}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Assessment Thresholds</h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Passing Score Percentage ({config.assessmentConfig.passingScorePercentage}%)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={config.assessmentConfig.passingScorePercentage}
                    onChange={e => setConfig({
                      ...config,
                      assessmentConfig: { ...config.assessmentConfig, passingScorePercentage: Number(e.target.value) }
                    })}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Assessment Time Limit (Minutes)</label>
                  <input
                    type="number"
                    value={config.assessmentConfig.timeLimitMinutes}
                    onChange={e => setConfig({
                      ...config,
                      assessmentConfig: { ...config.assessmentConfig, timeLimitMinutes: Number(e.target.value) }
                    })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200/90 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Anti-Cheating / Proctoring Strictness</label>
                  <select
                    value={config.assessmentConfig.proctorStrictness}
                    onChange={e => setConfig({
                      ...config,
                      assessmentConfig: { ...config.assessmentConfig, proctorStrictness: e.target.value as any }
                    })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold"
                  >
                    <option value="Low">Low (Permissive Tab Shifts)</option>
                    <option value="Medium">Medium (Standard Warnings)</option>
                    <option value="High">High (Strict Flagging &amp; Disqualification)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200/90">
            <button
              disabled={isSavingConfig}
              onClick={handleSaveConfig}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-950 text-xs font-black border border-slate-200/90 shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isSavingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: PRE-PUBLISH QUESTION QUALITY AUDIT ── */}
      {validatingQuestion && validationReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-scaleUp">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200/90">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                    ID: {validatingQuestion.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                    validationReport.isValid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {validationReport.isValid ? 'Pre-Publish Validated ✓' : 'Validation Action Required'}
                  </span>
                </div>
                <h2 className="text-base font-black text-slate-900 mt-1">National Question Bank Quality Report</h2>
              </div>
              <button onClick={() => setValidatingQuestion(null)} className="p-1 rounded-xl hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Quality Score Meter */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">MCQ Evaluation Score</div>
                <div className="text-3xl font-black text-slate-900 mt-0.5">
                  {validationReport.qualityScore} <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Evaluates question clarity, distractor plausibility, non-spoiling hint quality, and explanation depth.
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-base border ${
                validationReport.qualityScore >= 85
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                {validationReport.qualityScore}%
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Validation Checklist Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {validationReport.checks.map((c, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                    c.passed ? 'bg-white border-slate-200' : 'bg-rose-50/70 border-rose-200'
                  }`}>
                    <span className="text-xs font-mono font-bold">{c.passed ? '✓' : '✗'}</span>
                    <div>
                      <div className={`font-bold ${c.passed ? 'text-slate-900' : 'text-rose-900'}`}>{c.name}</div>
                      <div className="text-[10px] text-slate-600">{c.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Educational Hint Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-600" />
                <span>Non-Spoiling Pedagogical Hint:</span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">
                {validatingQuestion.hint || 'No hint provided.'}
              </p>
            </div>

            {/* Detailed Explanation Breakdown */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div>
                <div className="font-bold text-slate-900">Correct Option Explanation:</div>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{validatingQuestion.explanation}</p>
              </div>

              {validatingQuestion.learningObjective && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="font-bold text-slate-900">Learning Objective:</div>
                  <p className="text-slate-600 mt-0.5 text-[11px]">{validatingQuestion.learningObjective}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setValidatingQuestion(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD INSTITUTION ── */}
      {showAddInstModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-900">Register New College / Institution</h2>
              <button onClick={() => setShowAddInstModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstitution} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Engineering College, Modasa"
                  value={newInst.officialName}
                  onChange={e => setNewInst({ ...newInst, officialName: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Name</label>
                  <input
                    type="text"
                    placeholder="e.g. GEC Modasa"
                    value={newInst.shortName}
                    onChange={e => setNewInst({ ...newInst, shortName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">College Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GECM"
                    value={newInst.code}
                    onChange={e => setNewInst({ ...newInst, code: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={newInst.institutionType}
                    onChange={e => setNewInst({ ...newInst, institutionType: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  >
                    <option value="Engineering College">Engineering College</option>
                    <option value="University">University</option>
                    <option value="Ayush / Medical">Ayush / Medical</option>
                    <option value="Polytechnic">Polytechnic</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ownership</label>
                  <select
                    value={newInst.ownership}
                    onChange={e => setNewInst({ ...newInst, ownership: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  >
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Autonomous">Autonomous</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newInst.state}
                    onChange={e => setNewInst({ ...newInst, state: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newInst.city}
                    onChange={e => setNewInst({ ...newInst, city: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="admin@gecmodasa.ac.in"
                  value={newInst.officialEmail}
                  onChange={e => setNewInst({ ...newInst, officialEmail: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Departments (Comma-separated)</label>
                <input
                  type="text"
                  value={newInst.departments}
                  onChange={e => setNewInst({ ...newInst, departments: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddInstModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-slate-100 text-slate-950 font-bold"
                >
                  Register College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD SKILL ── */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-900">Add Canonical Skill</h2>
              <button onClick={() => setShowSkillModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Taxonomy Category</label>
                <select
                  value={selectedTaxId}
                  onChange={e => setSelectedTaxId(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                >
                  {taxonomy.map(t => (
                    <option key={t.id} value={t.id}>{t.category_name} ({t.domain})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FastAPI or LangChain"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE CATEGORY ── */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black text-slate-900">Create Taxonomy Category</h2>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Infrastructure & DevOps"
                  value={newCat.name}
                  onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Domain</label>
                <select
                  value={newCat.domain}
                  onChange={e => setNewCat({ ...newCat, domain: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                >
                  <option value="Technical">Technical</option>
                  <option value="Healthcare">Healthcare / Ayush</option>
                  <option value="Soft Skills">Soft Skills &amp; Leadership</option>
                  <option value="Business">Business &amp; Finance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">In-Demand Rating</label>
                <select
                  value={newCat.inDemand}
                  onChange={e => setNewCat({ ...newCat, inDemand: e.target.value as any })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MODAL: REGISTER MULTI-DISCIPLINARY DOMAIN ── */}
      {showAddDomainModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">Register Discipline / Domain</h2>
                <p className="text-[11px] text-slate-500">Add an academic domain to the National Multi-Disciplinary Framework</p>
              </div>
              <button onClick={() => setShowAddDomainModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSkillDomain} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discipline Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aerospace Engineering"
                    value={newDomain.name}
                    onChange={e => setNewDomain({ ...newDomain, name: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domain Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AERO"
                    value={newDomain.code}
                    onChange={e => setNewDomain({ ...newDomain, code: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Core domain scope, principles, and industry standards..."
                  value={newDomain.description}
                  onChange={e => setNewDomain({ ...newDomain, description: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Associated Departments (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Aerospace Engineering, Aeronautical Engineering"
                  value={newDomain.departments}
                  onChange={e => setNewDomain({ ...newDomain, departments: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Flight Dynamics & Aerodynamics"
                    value={newDomain.categoryName}
                    onChange={e => setNewDomain({ ...newDomain, categoryName: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sample Skill</label>
                  <input
                    type="text"
                    placeholder="e.g. ANSYS Fluent / OpenFOAM"
                    value={newDomain.sampleSkill}
                    onChange={e => setNewDomain({ ...newDomain, sampleSkill: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDomainModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Register Discipline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD SKILL TO DISCIPLINE DOMAIN ── */}
      {showAddSkillToDomainModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-black text-slate-900">Add Skill to Discipline</h2>
                <p className="text-[11px] text-slate-500">Attach a tool, software, or core skill to an academic discipline</p>
              </div>
              <button onClick={() => setShowAddSkillToDomainModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkillToDomain} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Discipline / Domain *</label>
                <select
                  value={domainSkillForm.domainId}
                  onChange={e => setDomainSkillForm({ ...domainSkillForm, domainId: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-semibold"
                >
                  {skillDomains.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAD & 3D Modeling / Industrial Automation"
                  value={domainSkillForm.categoryName}
                  onChange={e => setDomainSkillForm({ ...domainSkillForm, categoryName: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill or Tool Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SolidWorks / Siemens S7-1200 / Revit BIM"
                  value={domainSkillForm.skillName}
                  onChange={e => setDomainSkillForm({ ...domainSkillForm, skillName: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Skill Type</label>
                  <select
                    value={domainSkillForm.skillType}
                    onChange={e => setDomainSkillForm({ ...domainSkillForm, skillType: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  >
                    <option value="software">Software / CAD / IDE</option>
                    <option value="tool">Hardware Tool / PLC</option>
                    <option value="method">Methodology / Standard</option>
                    <option value="core_subject">Core Engineering Theory</option>
                    <option value="equipment">Lab Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Industry Demand</label>
                  <select
                    value={domainSkillForm.demandRating}
                    onChange={e => setDomainSkillForm({ ...domainSkillForm, demandRating: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs"
                  >
                    <option value="Critical">Critical Demand</option>
                    <option value="High">High Demand</option>
                    <option value="Medium">Medium Demand</option>
                    <option value="Emerging">Emerging Skill</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSkillToDomainModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Add Skill to Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
