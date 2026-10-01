import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, ExternalLink, Bookmark, BookmarkCheck,
  ChevronRight, Clock, Compass, Code2,
  X, Globe, BookMarked, HelpCircle, Terminal,
  Database, Smartphone, Cpu, Award, CheckCircle2,
  Flame, ArrowUpRight, Wrench, Zap, ShieldCheck,
  Folder, Lock, Sparkles
} from 'lucide-react';
import { careerConnectService } from '../../services/careerConnectService';
import {
  ALL_PROGRAMMING_LANGUAGES,
  LANGUAGE_CATEGORIES
} from '../../data/programmingLanguagesData';
import { BUILTIN_SKILL_DOMAINS } from '../../data/multiDisciplinaryTaxonomy';
import { LanguageLogo } from '../common/LanguageLogo';
import type {
  ProgrammingLanguageItem,
  LanguageModuleItem,
  LanguageTopicItem,
  TopicExternalReference,
  LearningBookmarkItem,
  LearningHistoryItem,
  QuestionDifficulty,
  SubjectSyllabusProgress
} from '../../types/careerConnect';

// Multi-Disciplinary Domain Definitions
export interface KnowledgeDomainInfo {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  description: string;
}

export const KNOWLEDGE_DOMAINS: KnowledgeDomainInfo[] = [
  {
    id: 'mechanical',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    badge: 'CAD, CAM & Thermo',
    description: 'Parametric 3D solid modeling, GD&T tolerancing (ASME Y14.5), CNC G-code machining, thermodynamics, and fluid power automation.'
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    shortName: 'Civil',
    badge: 'BIM & Structures',
    description: 'Building Information Modeling (BIM), Revit, STAAD.Pro structural space frame analysis, NBC building norms, and geomatics surveying.'
  },
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    shortName: 'Electrical',
    badge: 'Automation & Power',
    description: 'PLC ladder logic programming, SCADA telemetry, power system protection, electrical machines, and MATLAB/Simulink.'
  },
  {
    id: 'ece',
    name: 'Electronics & Communication',
    shortName: 'ECE & Systems',
    badge: 'Embedded & VLSI',
    description: 'Low-level Embedded C firmware, ARM Cortex microcontrollers, Verilog HDL digital synthesis, and multi-layer PCB design.'
  },
  {
    id: 'cs_it',
    name: 'Computer Science & Software',
    shortName: 'CS & Software',
    badge: '50+ Languages & Cloud',
    description: '50+ Programming languages, data structures, algorithms, relational database systems, cloud architectures, and full stack web development.'
  },
  {
    id: 'chemical',
    name: 'Chemical Engineering',
    shortName: 'Chemical',
    badge: 'Process & Reaction',
    description: 'Aspen Plus flowsheet simulation, chemical reaction kinetics, unit operations, and industrial plant safety.'
  },
  {
    id: 'management',
    name: 'Management & Commerce',
    shortName: 'Management',
    badge: 'Finance & Analytics',
    description: 'Financial DCF modeling, 3-statement forecasting, business analytics, SQL queries, Advanced Excel, and Power BI dashboards.'
  },
  {
    id: 'biotech',
    name: 'Biotechnology & Life Sciences',
    shortName: 'Biotech',
    badge: 'Genomics & Lab',
    description: 'Bioinformatics sequence alignment (BLAST), molecular docking, Python for genomics, and bioprocess engineering.'
  }
];

export function resolveDomainIdFromDepartment(dept?: string): string {
  if (!dept) return 'cs_it';
  const d = dept.toLowerCase().trim();
  if (d.includes('mech') || d.includes('auto') || d.includes('aero') || d.includes('prod') || d.includes('tool') || d.includes('thermal') || d.includes('mfg') || d.includes('manufactur')) {
    return 'mechanical';
  }
  if (d.includes('civil') || d.includes('struct') || d.includes('construct') || d.includes('infra') || d.includes('build') || d.includes('survey')) {
    return 'civil';
  }
  if (d.includes('electr') && !d.includes('comm') && !d.includes('ece') && !d.includes('electron')) {
    return 'electrical';
  }
  if (d.includes('ece') || d.includes('comm') || d.includes('electron') || d.includes('vlsi') || d.includes('embed') || d.includes('iot')) {
    return 'ece';
  }
  if (d.includes('chem') || d.includes('petro') || d.includes('polymer')) {
    return 'chemical';
  }
  if (d.includes('manage') || d.includes('mba') || d.includes('bba') || d.includes('comm') || d.includes('finan') || d.includes('busin') || d.includes('account')) {
    return 'management';
  }
  if (d.includes('bio') || d.includes('pharma') || d.includes('life')) {
    return 'biotech';
  }
  return 'cs_it';
}

function buildDomainSkills(domainId: string): ProgrammingLanguageItem[] {
  if (domainId === 'cs_it') {
    return ALL_PROGRAMMING_LANGUAGES;
  }

  const domain = BUILTIN_SKILL_DOMAINS.find(d => d.id === domainId);
  if (!domain) return ALL_PROGRAMMING_LANGUAGES;

  const items: ProgrammingLanguageItem[] = [];

  for (const cat of domain.categories) {
    for (const sk of cat.skills) {
      const pseudoItem: ProgrammingLanguageItem = {
        id: sk.id,
        name: sk.name,
        slug: sk.id,
        aliases: sk.aliases || [sk.name.toLowerCase()],
        category: cat.name,
        description: sk.description || `${sk.name} syllabus, engineering blueprints and verified NPTEL documentation.`,
        isPopular: sk.isPopular ?? true,
        searchable: true,
        status: 'active',
        officialDocsUrl: sk.topics[0]?.externalReferences[0]?.resourceUrl,
        modules: [
          {
            id: `${sk.id}-blueprint`,
            title: `${sk.name} Core Blueprint & Standard Workflows`,
            description: `Standard academic and industry syllabus topics for ${sk.name}.`,
            topics: sk.topics.map(t => ({
              id: t.id,
              title: t.title,
              description: t.description,
              externalReferences: (t.externalReferences || []).map(r => ({
                sourceName: r.sourceName,
                referenceTitle: (r as any).resourceTitle || (r as any).referenceTitle || t.title,
                referenceUrl: (r as any).resourceUrl || (r as any).referenceUrl || 'https://nptel.ac.in',
                isPrimary: r.isPrimary ?? false
              }))
            }))
          }
        ]
      };
      items.push(pseudoItem);
    }
  }

  // Cross-disciplinary additions for Engineering domains
  if (domainId === 'mechanical') {
    const matlab = ALL_PROGRAMMING_LANGUAGES.find(l => l.slug === 'matlab');
    if (matlab && !items.some(i => i.slug === 'matlab')) {
      items.push({
        ...matlab,
        category: 'Simulation & Computing',
        description: 'Numerical analysis, matrix computations, dynamic kinematics, and thermal system simulations.'
      });
    }
    const py = ALL_PROGRAMMING_LANGUAGES.find(l => l.slug === 'python');
    if (py && !items.some(i => i.slug === 'python-eng')) {
      items.push({
        ...py,
        id: 'python-eng',
        slug: 'python-eng',
        name: 'Python for Mechanical Engineers',
        category: 'Simulation & Computing',
        description: 'NumPy, SciPy, Matplotlib for thermodynamic modeling, stress-strain plotting, and CAD automation scripts.'
      });
    }
  } else if (domainId === 'electrical') {
    const matlab = ALL_PROGRAMMING_LANGUAGES.find(l => l.slug === 'matlab');
    if (matlab && !items.some(i => i.slug === 'matlab')) {
      items.push({
        ...matlab,
        category: 'Simulation & Computing',
        description: 'Simscape Electrical, motor modeling, control loop PID tuning, and PWM signal analysis.'
      });
    }
  } else if (domainId === 'ece') {
    const cLang = ALL_PROGRAMMING_LANGUAGES.find(l => l.slug === 'c');
    if (cLang && !items.some(i => i.slug === 'c-embedded')) {
      items.push({
        ...cLang,
        id: 'c-embedded',
        slug: 'c-embedded',
        name: 'C for Embedded Firmware',
        category: 'Embedded Systems & Firmware',
        description: 'Pointers, bit manipulation, hardware memory mapping, volatile registers, and bare-metal firmware.'
      });
    }
  }

  return items.length > 0 ? items : ALL_PROGRAMMING_LANGUAGES;
}

interface KnowledgeBaseViewProps {
  onStartTopicPractice: (
    language: string,
    moduleId: string,
    topicId: string,
    difficulty: QuestionDifficulty | 'Mixed',
    topicTitle?: string,
    questionCount?: number
  ) => void;
  onStartFinalCertification?: (subjectId: string) => void;
  initialLanguage?: string;
  department?: string;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  onStartTopicPractice,
  onStartFinalCertification,
  initialLanguage = 'Java',
  department
}) => {
  // Navigation & view states
  const [activeView, setActiveView] = useState<'directory' | 'bookmarks' | 'history'>('directory');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Determine student's enrolled department domain
  const studentDomainId = useMemo(() => resolveDomainIdFromDepartment(department), [department]);

  // Active discipline track state strictly following the student's profile department
  const [activeDomainId, setActiveDomainId] = useState<string>(studentDomainId);

  // Sync activeDomainId immediately when student's profile department changes
  useEffect(() => {
    const resolved = resolveDomainIdFromDepartment(department);
    setActiveDomainId(resolved);
    setSelectedCategory('All');
    const skills = buildDomainSkills(resolved);
    if (skills.length > 0) {
      setSelectedLangSlug(skills[0].slug);
    }
  }, [department]);

  // Skills for active domain
  const activeDomainSkills = useMemo(() => {
    return buildDomainSkills(activeDomainId);
  }, [activeDomainId]);

  // Selected language / skill state
  const [selectedLangSlug, setSelectedLangSlug] = useState<string>(() => {
    const initialSkills = buildDomainSkills(studentDomainId);
    if (initialLanguage) {
      const found = initialSkills.find(
        l => l.name.toLowerCase() === initialLanguage.toLowerCase() || l.slug.toLowerCase() === initialLanguage.toLowerCase() || l.id.toLowerCase() === initialLanguage.toLowerCase()
      );
      if (found) return found.slug;
    }
    return initialSkills[0]?.slug || 'solidworks';
  });

  // Selected topic for external docs modal
  const [activeTopicModal, setActiveTopicModal] = useState<{
    language: ProgrammingLanguageItem;
    module: LanguageModuleItem;
    topic: LanguageTopicItem;
  } | null>(null);

  const [loadedQuestionCount, setLoadedQuestionCount] = useState<number>(0);

  // Preload 2,000 verified MCQs dataset whenever the active skill/language changes
  useEffect(() => {
    let isCancelled = false;
    if (selectedLangSlug) {
      careerConnectService.preloadLanguageMCQs(selectedLangSlug).then(count => {
        if (!isCancelled) {
          setLoadedQuestionCount(count);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [selectedLangSlug]);

  const modalVerifiedCount = useMemo(() => {
    if (!activeTopicModal) return 0;
    return careerConnectService.getAvailableQuestionCount({
      language: activeTopicModal.language.name,
      skillId: activeTopicModal.language.id,
      moduleId: activeTopicModal.module.id,
      topicId: activeTopicModal.topic.id,
      topic: activeTopicModal.topic.title,
      topicTitle: activeTopicModal.topic.title,
      difficulty: 'Mixed'
    });
  }, [activeTopicModal, loadedQuestionCount]);

  // Bookmarks & History from careerConnectService
  const [bookmarks, setBookmarks] = useState<LearningBookmarkItem[]>([]);
  const [history, setHistory] = useState<LearningHistoryItem[]>([]);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [syllabusProgress, setSyllabusProgress] = useState<SubjectSyllabusProgress | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load bookmarks, history, and syllabus progress on mount / language switch
  useEffect(() => {
    const session = careerConnectService.getCurrentSession();
    if (session) {
      setBookmarks(careerConnectService.getLearningBookmarks(session.id));
      setHistory(careerConnectService.getLearningHistory(session.id));
    }
  }, []);

  useEffect(() => {
    const session = careerConnectService.getCurrentSession();
    if (session && selectedLangSlug) {
      const prog = careerConnectService.getSubjectSyllabusProgress(session.id, selectedLangSlug);
      setSyllabusProgress(prog);
    }
  }, [selectedLangSlug]);

  useEffect(() => {
    const handleDataChange = () => {
      const session = careerConnectService.getCurrentSession();
      if (session && selectedLangSlug) {
        setSyllabusProgress(careerConnectService.getSubjectSyllabusProgress(session.id, selectedLangSlug));
      }
    };
    window.addEventListener('novaconnect:data_changed', handleDataChange);
    return () => window.removeEventListener('novaconnect:data_changed', handleDataChange);
  }, [selectedLangSlug]);

  // Handle outside click for search dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Current selected skill / language object
  const currentLanguage = useMemo(() => {
    return activeDomainSkills.find(l => l.slug === selectedLangSlug) || activeDomainSkills[0] || ALL_PROGRAMMING_LANGUAGES[0];
  }, [activeDomainSkills, selectedLangSlug]);

  // Active domain metadata
  const currentDomainInfo = useMemo(() => {
    return KNOWLEDGE_DOMAINS.find(d => d.id === activeDomainId) || KNOWLEDGE_DOMAINS[0];
  }, [activeDomainId]);

  // Categories for the active domain
  const domainCategories = useMemo(() => {
    if (activeDomainId === 'cs_it') {
      return LANGUAGE_CATEGORIES;
    }
    const cats = new Set<string>();
    activeDomainSkills.forEach(s => {
      if (s.category) cats.add(s.category);
    });
    return ['All', ...Array.from(cats)];
  }, [activeDomainId, activeDomainSkills]);

  // Languages filtered by category
  const filteredLanguages = useMemo(() => {
    if (selectedCategory === 'All') return activeDomainSkills;
    return activeDomainSkills.filter(l => l.category === selectedCategory);
  }, [activeDomainSkills, selectedCategory]);

  // Popular items for top pills
  const popularLanguages = useMemo(() => {
    return activeDomainSkills.filter(l => l.isPopular).slice(0, 5);
  }, [activeDomainSkills]);

  // Real-time search matches (scoped strictly to active department domain skills)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { matchedLanguages: [], matchedTopics: [] };
    const rawResults = careerConnectService.searchLanguagesAndTopics(searchQuery);
    const domainSkillSlugs = new Set(activeDomainSkills.map(s => s.slug));
    return {
      matchedLanguages: rawResults.matchedLanguages.filter(l => domainSkillSlugs.has(l.slug)),
      matchedTopics: rawResults.matchedTopics.filter(t => domainSkillSlugs.has(t.language.slug))
    };
  }, [searchQuery, activeDomainSkills]);

  // Helper: check if a topic is bookmarked
  const isTopicBookmarked = (langId: string, topicId: string) => {
    return bookmarks.some(b => (b.languageId === langId || b.languageName.toLowerCase() === langId.toLowerCase()) && b.topicId === topicId);
  };

  // Toggle bookmark handler
  const handleToggleBookmark = async (
    language: ProgrammingLanguageItem,
    module: LanguageModuleItem,
    topic: LanguageTopicItem
  ) => {
    const session = careerConnectService.getCurrentSession();
    if (!session) return;
    setIsBookmarking(true);
    try {
      const primaryRef = topic.externalReferences[0];
      await careerConnectService.toggleLearningBookmark(session.id, {
        studentId: session.id,
        languageId: language.id,
        languageName: language.name,
        moduleId: module.id,
        moduleTitle: module.title,
        topicId: topic.id,
        topicTitle: topic.title,
        referenceTitle: primaryRef?.referenceTitle || topic.title,
        referenceUrl: primaryRef?.referenceUrl || 'https://nptel.ac.in',
        sourceName: primaryRef?.sourceName || 'Verified Reference'
      });

      // Reload fresh list
      setBookmarks(careerConnectService.getLearningBookmarks(session.id));
    } catch (err) {
      console.warn('Bookmark error:', err);
    } finally {
      setIsBookmarking(false);
    }
  };

  // Open external reference with history tracking
  const handleOpenExternalReference = async (
    ref: TopicExternalReference,
    language: ProgrammingLanguageItem,
    module: LanguageModuleItem,
    topic: LanguageTopicItem
  ) => {
    const session = careerConnectService.getCurrentSession();
    if (session) {
      await careerConnectService.recordLearningHistory(session.id, {
        studentId: session.id,
        languageName: language.name,
        moduleTitle: module.title,
        topicTitle: topic.title,
        referenceUrl: ref.referenceUrl,
        sourceName: ref.sourceName
      });
      setHistory(careerConnectService.getLearningHistory(session.id));
    }

    // Open canonical documentation in a safe new tab
    window.open(ref.referenceUrl, '_blank', 'noopener,noreferrer');
  };

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web': return <Globe className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Database / Query': return <Database className="w-3.5 h-3.5 text-amber-600" />;
      case 'Mobile': return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
      case 'Systems / Low-level': return <Cpu className="w-3.5 h-3.5 text-rose-600" />;
      case 'Scripting / Shell': return <Terminal className="w-3.5 h-3.5 text-emerald-600" />;
      case 'CAD & 3D Modeling': return <Wrench className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Manufacturing & Metrology': return <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'Automation & Mechatronics': return <Zap className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Simulation & Computing': return <Cpu className="w-3.5 h-3.5 text-cyan-600" />;
      default: return <Code2 className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-16">
      {/* ── 1. HEADER BANNER WITH SEARCH & VIEW TABS ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 text-[10px] font-mono font-black border border-indigo-200 dark:border-indigo-800 uppercase tracking-wide">
                {currentDomainInfo.name} KNOWLEDGE BASE
              </span>
              {department && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-black border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">
                  Enrolled Dept: {department}
                </span>
              )}
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Official Curriculum &amp; NPTEL Blueprint
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {currentDomainInfo.name} Core Skills &amp; Syllabus
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-2xl mt-0.5 leading-relaxed">
              {currentDomainInfo.description} Practice topic drills and unlock accredited 50-MCQ certification exams.
            </p>
          </div>

          {/* View Switcher: Directory, Bookmarks, History */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 self-start md:self-auto flex-shrink-0">
            <button
              onClick={() => setActiveView('directory')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'directory'
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
            <button
              onClick={() => setActiveView('bookmarks')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'bookmarks'
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks</span>
              {bookmarks.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeView === 'bookmarks' ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                }`}>
                  {bookmarks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'history'
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recent</span>
            </button>
          </div>
        </div>

        {/* Unified Search Input with Floating Dropdown */}
        <div ref={searchContainerRef} className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={`Search ${currentDomainInfo.name} skills, CAD modules, or topics (e.g. SolidWorks Mates, GD&T Datums, Python, PLC)...`}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Overlay */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
              {/* 1. Language & Skill Matches */}
              {searchResults.matchedLanguages.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2 px-2 flex items-center justify-between">
                    <span>Matching Skills &amp; Languages</span>
                    <span className="text-slate-400">{searchResults.matchedLanguages.length} found</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {searchResults.matchedLanguages.map(lang => (
                      <button
                        key={lang.slug}
                        onClick={() => {
                          setSelectedLangSlug(lang.slug);
                          setActiveView('directory');
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors border border-transparent hover:border-slate-200 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                            <LanguageLogo language={lang.name} className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {lang.name}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {lang.category}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lang.modules.reduce((acc, m) => acc + m.topics.length, 0)} topics
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Topic Matches */}
              {searchResults.matchedTopics.length > 0 && (
                <div className="p-3">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2 px-2 flex items-center justify-between">
                    <span>Matching Syllabus Topics</span>
                    <span className="text-slate-400">{searchResults.matchedTopics.length} topics</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.matchedTopics.slice(0, 10).map((match, idx) => (
                      <button
                        key={`${match.language.slug}_${match.topic.id}_${idx}`}
                        onClick={() => {
                          setActiveTopicModal(match);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group border border-transparent hover:border-slate-200 cursor-pointer"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 flex items-center gap-2">
                            <span>{match.topic.title}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-slate-600 border border-slate-200">
                              {match.language.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {match.language.name} &rarr; {match.module.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                          <span>View docs</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.matchedLanguages.length === 0 && searchResults.matchedTopics.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs font-medium">
                  No engineering skill or topic matched &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Pills & Top Skills for Active Domain */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {domainCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Popular Skill Quick Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1 mr-1">
              <Flame className="w-3 h-3 text-amber-500" /> Core Tools:
            </span>
            {popularLanguages.map(lang => (
              <button
                key={lang.slug}
                onClick={() => {
                  setSelectedLangSlug(lang.slug);
                  setActiveView('directory');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedLangSlug === lang.slug && activeView === 'directory'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── VIEW 1: MY BOOKMARKS ── */}
      {activeView === 'bookmarks' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Saved Documentation &amp; Topics
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Your bookmarked canonical references for fast revision and interview prep.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              {bookmarks.length} Saved
            </span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                <Bookmark className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white mb-1">No topics bookmarked yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed font-medium">
                Browse any language or module in the directory, and click the bookmark icon on topic cards to save them here.
              </p>
              <button
                onClick={() => setActiveView('directory')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Directory</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map(b => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                        {b.languageName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                        {b.sourceName}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                      {b.topicTitle}
                    </h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mb-4 font-medium">
                      {b.moduleTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={b.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <span>Open Docs</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        const langObj = ALL_PROGRAMMING_LANGUAGES.find(l => l.id === b.languageId || l.slug === b.languageId);
                        const modObj = langObj?.modules.find(m => m.id === b.moduleId);
                        const topObj = modObj?.topics.find(t => t.id === b.topicId);
                        if (langObj && modObj && topObj) {
                          handleToggleBookmark(langObj, modObj, topObj);
                        } else {
                          setBookmarks(prev => prev.filter(item => item.id !== b.id));
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200/80 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove bookmark"
                    >
                      <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 2: RECENT LEARNING HISTORY ── */}
      {activeView === 'history' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Recent Learning Activity
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                Canonical external topics you recently studied on MDN Web Docs or W3Schools.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              {history.length} Visited
            </span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                <Clock className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white mb-1">No recent activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed font-medium">
                When you click to open external documentation links from topic cards, your recent visits will appear here.
              </p>
              <button
                onClick={() => setActiveView('directory')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Directory</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((h, i) => (
                <div
                  key={`${h.id}_${i}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <LanguageLogo language={h.languageName} className="w-6 h-6" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {h.topicTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                        {h.languageName} • {h.moduleTitle} • via {h.sourceName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                      {new Date(h.visitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <a
                      href={h.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Reopen external documentation"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Open</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 3: SEARCHABLE DIRECTORY (DEFAULT) ── */}
      {activeView === 'directory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── LEFT RAIL: CURRICULUM SKILLS / SUBJECTS LIST ── */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-2 lg:sticky lg:top-4 max-h-[820px] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between px-2 py-1 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>{currentDomainInfo.shortName} Track ({filteredLanguages.length})</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Select to inspect</span>
              </div>

              <div className="space-y-1.5">
                {filteredLanguages.map(lang => {
                  const isSelected = lang.slug === selectedLangSlug;
                  const totalTopics = lang.modules.reduce((acc, m) => acc + m.topics.length, 0);

                  return (
                    <button
                      key={lang.slug}
                      onClick={() => setSelectedLangSlug(lang.slug)}
                      className={`w-full text-left p-3 rounded-2xl transition-all border flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-500 text-indigo-950 dark:text-indigo-200 shadow-2xs ring-1 ring-indigo-300 dark:ring-indigo-700'
                          : 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <LanguageLogo language={lang.name} className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 truncate">
                            <span className={isSelected ? 'text-indigo-950 dark:text-indigo-300 font-black' : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}>
                              {lang.name}
                            </span>
                            {lang.isPopular && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[9px] font-bold border border-amber-200 dark:border-amber-800">
                                Core
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1 font-medium">
                            {getCategoryIcon(lang.category)}
                            <span>{lang.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-2">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold block">
                          {totalTopics} topics
                        </span>
                        <ChevronRight className={`w-4 h-4 ml-auto mt-0.5 transition-transform ${
                          isSelected ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5' : 'text-slate-400 dark:text-slate-500'
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          {/* ── RIGHT PANEL: SELECTED LANGUAGE DETAILS, PROGRESS & MODULES ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Language Overview Hero Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-2xs">
                    <LanguageLogo language={currentLanguage.name} className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                        {currentLanguage.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5">
                        {getCategoryIcon(currentLanguage.category)}
                        {currentLanguage.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{loadedQuestionCount > 0 ? `${loadedQuestionCount.toLocaleString()} Verified MCQs Active` : '2,000 Verified MCQs Active'}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>90% Practical Code Labs</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed font-medium">
                      {currentLanguage.description}
                    </p>
                  </div>
                </div>

                {/* Official Docs Link Button */}
                {currentLanguage.officialDocsUrl && (
                  <a
                    href={currentLanguage.officialDocsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs flex-shrink-0"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Official Docs</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>

              {/* 4 Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
                  <div className="text-base font-black text-slate-900 dark:text-white">{currentLanguage.modules.length}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Modules</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
                  <div className="text-base font-black text-indigo-700 dark:text-indigo-400">
                    2,000+ MCQs
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">90% Practical Labs</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400">W3Schools &amp; MDN</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Verified Docs</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-center">
                  <div className="text-base font-black text-amber-700 dark:text-amber-400">50-MCQ Certified</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5">Accredited Exam</div>
                </div>
              </div>
            </div>

            {/* 2. Syllabus Progress & 50-MCQ Certification Status Card */}
            {syllabusProgress && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {currentLanguage.name} Syllabus Progress
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Practice topic drills (15 MCQs each) to complete syllabus coverage and unlock the 50-MCQ Certification Exam.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {syllabusProgress.completedTopicsCount} / {syllabusProgress.totalTopics} Topics
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                      syllabusProgress.completionPercentage === 100
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    }`}>
                      {syllabusProgress.completionPercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      syllabusProgress.completionPercentage === 100
                        ? 'bg-emerald-600 dark:bg-emerald-500'
                        : 'bg-indigo-600 dark:bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, syllabusProgress.completionPercentage))}%` }}
                  />
                </div>

                {/* Final Certification Exam Status & CTA Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      syllabusProgress.finalCertificationPassed
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : syllabusProgress.isFinalCertificationUnlocked
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600'
                    }`}>
                      {syllabusProgress.finalCertificationPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                      ) : syllabusProgress.isFinalCertificationUnlocked ? (
                        <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                        <span>Official 50-MCQ Final Certification Exam</span>
                        {syllabusProgress.finalCertificationPassed && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                            Certified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-medium">
                        {syllabusProgress.finalCertificationPassed
                          ? `Passed with ${syllabusProgress.finalCertificationScore}%! Your official accredited certificate is active and visible on your profile.`
                          : syllabusProgress.recommendedPreparationNotice ||
                            'Evaluates complete syllabus across all topics (10 Basic, 15 Medium, 15 Hard, 10 Industry).'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex-shrink-0">
                    {syllabusProgress.isFinalCertificationUnlocked ? (
                      <button
                        onClick={() => {
                          if (onStartFinalCertification) {
                            onStartFinalCertification(currentLanguage.slug || currentLanguage.id);
                          } else {
                            onStartTopicPractice(currentLanguage.name, 'All', 'All', 'Mixed');
                          }
                        }}
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{syllabusProgress.finalCertificationPassed ? 'Retake Certification Exam (50 MCQs)' : 'Launch 50-MCQ Certification Exam'}</span>
                      </button>
                    ) : (
                      <div className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked ({syllabusProgress.completedTopicsCount}/{syllabusProgress.totalTopics} Done)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Module & Topic Syllabus Catalogue */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                <span>Syllabus Modules ({currentLanguage.modules.length})</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Click any topic card to view canonical docs &amp; practice</span>
              </div>

              {currentLanguage.modules.map(module => (
                <div
                  key={module.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3"
                >
                  {/* Module Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">
                        {module.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200/90 dark:border-slate-700">
                      {module.topics.length} topics
                    </span>
                  </div>

                  {/* Topic Tiles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {module.topics.map(topic => {
                      const isBookmarked = isTopicBookmarked(currentLanguage.id, topic.id);
                      const primaryRef = topic.externalReferences[0];
                      const topicProg = syllabusProgress?.topicProgress?.[topic.id];
                      const isCompleted = topicProg?.status === 'COMPLETED';
                      const isInProgress = topicProg?.status === 'IN_PROGRESS';
                      const topicScore = topicProg?.bestScorePercentage;

                      return (
                        <div
                          key={topic.id}
                          onClick={() => setActiveTopicModal({
                            language: currentLanguage,
                            module,
                            topic
                          })}
                          className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 hover:border-indigo-400 dark:border-slate-700/80 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {topic.title}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 flex-wrap font-medium">
                              <span className="text-cyan-700 dark:text-cyan-400 font-bold">
                                {primaryRef?.sourceName || 'External Docs'}
                              </span>
                              <span>•</span>
                              <span>Canonical</span>
                              {isCompleted && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Mastered ({topicScore}%)</span>
                                </span>
                              )}
                              {!isCompleted && isInProgress && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[9px] font-bold border border-amber-300 dark:border-amber-800">
                                  {topicScore}%
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {isBookmarked && (
                              <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950/60" />
                            )}
                            <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 group-hover:bg-indigo-600 text-slate-400 dark:text-slate-300 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
        </div>
      )}

      {/* ── EXTERNAL LEARNING & PRACTICE MODAL ── */}
      {activeTopicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white animate-scaleUp">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{activeTopicModal.language.name}</span>
                  <span>/</span>
                  <span className="text-slate-600 dark:text-slate-300">{activeTopicModal.module.title}</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeTopicModal.topic.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveTopicModal(null)}
                className="p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-2.5 font-medium">
              <Compass className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>
                Nova CareerConnect links directly to verified canonical documentation. Review the material or start an assessment test below.
              </span>
            </div>

            {/* External Reference Cards */}
            <div className="space-y-2.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Verified Canonical Documentation
              </div>

              {activeTopicModal.topic.externalReferences.map((ref, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${
                        ref.sourceName === 'MDN Web Docs'
                          ? 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {ref.sourceName}
                      </span>
                      {ref.isPrimary && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">Recommended</span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {ref.referenceTitle}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {ref.referenceUrl}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenExternalReference(
                      ref,
                      activeTopicModal.language,
                      activeTopicModal.module,
                      activeTopicModal.topic
                    )}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs flex-shrink-0 cursor-pointer"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Assessment Practice CTA & Bookmark Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => handleToggleBookmark(
                  activeTopicModal.language,
                  activeTopicModal.module,
                  activeTopicModal.topic
                )}
                disabled={isBookmarking}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isTopicBookmarked(activeTopicModal.language.id, activeTopicModal.topic.id)
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {isTopicBookmarked(activeTopicModal.language.id, activeTopicModal.topic.id) ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Saved in Bookmarks</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Bookmark Topic</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const lang = activeTopicModal.language.name;
                  const modId = activeTopicModal.module.id;
                  const topId = activeTopicModal.topic.id;
                  const topTitle = activeTopicModal.topic.title;
                  const qCount = modalVerifiedCount;
                  setActiveTopicModal(null);
                  onStartTopicPractice(lang, modId, topId, 'Mixed', topTitle, qCount);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>
                  {modalVerifiedCount >= 15
                    ? 'Practice Topic Test (15 MCQs)'
                    : modalVerifiedCount >= 10
                      ? `Practice Topic Test (${modalVerifiedCount} MCQs)`
                      : modalVerifiedCount > 0
                        ? `Practice Topic Test (${modalVerifiedCount} MCQs Available)`
                        : 'Preparing Verified Questions...'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
