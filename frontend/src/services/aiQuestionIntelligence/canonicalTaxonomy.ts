import { ALL_PROGRAMMING_LANGUAGES } from '../../data/programmingLanguagesData';
import { BUILTIN_SKILL_DOMAINS } from '../../data/multiDisciplinaryTaxonomy';
import type { CanonicalIdentity } from './types';

/**
 * Normalizes an identifier string for deterministic exact-key lookups.
 */
export function canonicalKey(val?: string | null): string {
  if (!val) return '';
  const s = val.toLowerCase().trim();
  if (s === 'c#' || s === 'csharp' || s === 'cs') return 'csharp';
  if (s === 'c++' || s === 'cpp') return 'cpp';
  if (s === 'golang' || s === 'go') return 'golang';
  if (s === 'typescript' || s === 'ts') return 'typescript';
  if (s === 'javascript' || s === 'js') return 'javascript';
  return s.replace(/[^a-z0-9]/g, '');
}

/**
 * Pre-computed lookup dictionary for all syllabus programming languages and topics
 */
interface TopicLookupEntry {
  domainId: string;
  domainName: string;
  subjectId: string;
  subjectName: string;
  skillId: string;
  skillName: string;
  moduleId: string;
  moduleName: string;
  topicId: string;
  topicName: string;
  canonicalKey: string;
}

const TOPIC_REGISTRY = new Map<string, TopicLookupEntry>();
const SUBJECT_REGISTRY = new Map<string, { domainId: string; domainName: string; subjectId: string; subjectName: string }>();

// 1. Build exhaustive registry from ALL_PROGRAMMING_LANGUAGES
ALL_PROGRAMMING_LANGUAGES.forEach(lang => {
  const sKey = canonicalKey(lang.slug || lang.id || lang.name);
  const subjectInfo = {
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    subjectId: lang.slug || lang.id,
    subjectName: lang.name
  };
  SUBJECT_REGISTRY.set(sKey, subjectInfo);
  SUBJECT_REGISTRY.set(canonicalKey(lang.name), subjectInfo);
  SUBJECT_REGISTRY.set(canonicalKey(lang.id), subjectInfo);
  if (lang.aliases) {
    lang.aliases.forEach(a => SUBJECT_REGISTRY.set(canonicalKey(a), subjectInfo));
  }

  lang.modules.forEach(mod => {
    mod.topics.forEach(top => {
      const entry: TopicLookupEntry = {
        domainId: subjectInfo.domainId,
        domainName: subjectInfo.domainName,
        subjectId: subjectInfo.subjectId,
        subjectName: subjectInfo.subjectName,
        skillId: subjectInfo.subjectId,
        skillName: subjectInfo.subjectName,
        moduleId: mod.id,
        moduleName: mod.title,
        topicId: top.id,
        topicName: top.title,
        canonicalKey: `${canonicalKey(subjectInfo.subjectId)}_${canonicalKey(top.id)}`
      };

      // Register under scoped compound keys (Subject::Topic)
      TOPIC_REGISTRY.set(`${sKey}::${canonicalKey(top.id)}`, entry);
      TOPIC_REGISTRY.set(`${sKey}::${canonicalKey(top.title)}`, entry);
      if (!TOPIC_REGISTRY.has(canonicalKey(top.id))) {
        TOPIC_REGISTRY.set(canonicalKey(top.id), entry);
      }
      if (!TOPIC_REGISTRY.has(canonicalKey(top.title))) {
        TOPIC_REGISTRY.set(canonicalKey(top.title), entry);
      }
    });
  });
});

// 2. Build exhaustive registry from BUILTIN_SKILL_DOMAINS (Engineering, CAD, Embedded, etc.)
BUILTIN_SKILL_DOMAINS.forEach(domain => {
  domain.categories.forEach(cat => {
    cat.skills.forEach(skill => {
      const sKey = canonicalKey(skill.id || skill.name);
      const subjectInfo = {
        domainId: domain.id,
        domainName: domain.name,
        subjectId: skill.id,
        subjectName: skill.name
      };

      SUBJECT_REGISTRY.set(sKey, subjectInfo);
      SUBJECT_REGISTRY.set(canonicalKey(skill.name), subjectInfo);
      SUBJECT_REGISTRY.set(canonicalKey(skill.id), subjectInfo);
      if (skill.code) SUBJECT_REGISTRY.set(canonicalKey(skill.code), subjectInfo);
      if (skill.aliases) {
        skill.aliases.forEach(a => SUBJECT_REGISTRY.set(canonicalKey(a), subjectInfo));
      }

      skill.topics.forEach(top => {
        const entry: TopicLookupEntry = {
          domainId: domain.id,
          domainName: domain.name,
          subjectId: skill.id,
          subjectName: skill.name,
          skillId: skill.id,
          skillName: skill.name,
          moduleId: cat.id,
          moduleName: cat.name,
          topicId: top.id,
          topicName: top.title,
          canonicalKey: `${canonicalKey(skill.id)}_${canonicalKey(top.id)}`
        };

        TOPIC_REGISTRY.set(`${sKey}::${canonicalKey(top.id)}`, entry);
        TOPIC_REGISTRY.set(`${sKey}::${canonicalKey(top.title)}`, entry);
        if (!TOPIC_REGISTRY.has(canonicalKey(top.id))) {
          TOPIC_REGISTRY.set(canonicalKey(top.id), entry);
        }
        if (!TOPIC_REGISTRY.has(canonicalKey(top.title))) {
          TOPIC_REGISTRY.set(canonicalKey(top.title), entry);
        }
      });
    });
  });
});

/**
 * Deterministic 1-to-1 canonical aliases for topic variations
 */
const TOPIC_ALIASES: Record<string, string> = {
  // Python 1-to-1 exact aliases
  'python::syntax': 'syntax-intro',
  'python::introsyntax': 'syntax-intro',
  'python::variablescastingscope': 'variables',
  'python::builtindatatypes': 'datatypes',
  'python::builtindatatypesintfloatstrlistdictsettuple': 'datatypes',
  'python::datatypes': 'datatypes',
  'python::operatorsarithmeticlogicalbitwise': 'operators',
  'python::listslistcomprehensions': 'lists',
  'python::tuplesimmutability': 'tuples',
  'python::setssetoperations': 'sets',
  'python::dictionarieskeyvaluelookup': 'dictionaries',
  'python::ifelifelseconditions': 'conditions',
  'python::whileforloops': 'loops',
  'python::functionsargskwargs': 'functions',
  'python::lambdafunctionshigherorderfunctions': 'lambda',
  'python::classesobjects': 'classes-objects',
  'python::classesobjects__init__self': 'classes-objects',
  'python::classesobjectsinitself': 'classes-objects',
  'python::inheritancesuper': 'inheritance',
  'python::iteratorsgenerators': 'iterators',
  'python::iteratorsgenerators__iter____next__': 'iterators',
  'python::iteratorsgeneratorsiternext': 'iterators',
  'python::polymorphismducktyping': 'polymorphism',
  'python::exceptionhandlingtryexceptfinallyraise': 'exceptions',
  'python::exceptionhandling': 'exceptions',
  'python::modulespackages': 'modules',
  'python::filehandlingopenwithreadwrite': 'file-io',
  'python::filehandling': 'file-io',
  'python::fileio': 'file-io',
  'python::pippackagemanagervirtualenvironments': 'pip',
  'python::pippackagemanager': 'pip',
  'python::virtualenvironments': 'pip',

  // SolidWorks Aliases
  'solidworks::2dsketchingrelationsconstraints': 'sw-sketching',
  'solidworks::sketching': 'sw-sketching',
  'solidworks::3dpartmodelingadvancedfeatures': 'sw-features',
  'solidworks::features': 'sw-features',
  'solidworks::bottomuptopdownassemblies': 'sw-assemblies',
  'solidworks::assemblies': 'sw-assemblies',
  'solidworks::2dengineeringdrawingsbillofmaterialsbom': 'sw-drafting',
  'solidworks::drafting': 'sw-drafting',

  // Civil Structural Analysis Aliases
  'structuralanalysis::structuralgeometrymemberconnectivityrelease': 'staad-modeling',
  'structuralanalysis::deadlivewindseismicloadcombinations': 'staad-loading',
  'structuralanalysis::linearelasticbendingmomentshearforceenvelopes': 'staad-analysis',
  'structuralanalysis::rccsteelsectiondesignis456is800': 'staad-design',

  // Electrical PLC Aliases
  'plc::plchardwareioaddressingscancycles': 'plc-architecture',
  'plc::ladderlogicprogramming': 'plc-ladder',
  'plc::timerstontofcounterscutctd': 'plc-timers',
  'plc::timers': 'plc-timers',
  'plc::analogscalingcomparisoninstructions': 'plc-analog',

  // Electronics Microcontrollers Aliases
  'microcontrollers::armcortexm8051architecturalfundamentals': 'mcu-architecture',
  'microcontrollers::gpioconfigurationregisterlevelprogramming': 'mcu-gpio',
  'microcontrollers::hardwareinterruptsnvictimersubsystems': 'mcu-interrupts',
  'microcontrollers::uartspii2cserialcommunications': 'mcu-protocols'
};

/**
 * Universal Canonical Identity Resolver
 * Resolves raw subject/topic parameters into standard CanonicalIdentity.
 */
export function resolveCanonicalTaxonomy(
  rawSubject?: string | null,
  rawTopicId?: string | null,
  rawTopicTitle?: string | null
): CanonicalIdentity {
  const cleanSubject = canonicalKey(rawSubject);
  let cleanTopicId = canonicalKey(rawTopicId);
  const cleanTopicTitle = canonicalKey(rawTopicTitle);

  // Check alias override first
  const aliasKey = `${cleanSubject}::${cleanTopicId}`;
  if (TOPIC_ALIASES[aliasKey]) {
    cleanTopicId = canonicalKey(TOPIC_ALIASES[aliasKey]);
  } else if (cleanTopicTitle && TOPIC_ALIASES[`${cleanSubject}::${cleanTopicTitle}`]) {
    cleanTopicId = canonicalKey(TOPIC_ALIASES[`${cleanSubject}::${cleanTopicTitle}`]);
  }

  // 1. Try compound lookup first: subject::topicId
  let entry = TOPIC_REGISTRY.get(`${cleanSubject}::${cleanTopicId}`);
  if (!entry && cleanTopicTitle) {
    entry = TOPIC_REGISTRY.get(`${cleanSubject}::${cleanTopicTitle}`);
  }
  if (!entry) {
    entry = TOPIC_REGISTRY.get(cleanTopicId) || TOPIC_REGISTRY.get(cleanTopicTitle);
  }

  if (entry) {
    const subInfo = cleanSubject ? (SUBJECT_REGISTRY.get(cleanSubject) || {
      domainId: entry.domainId,
      domainName: entry.domainName,
      subjectId: cleanSubject,
      subjectName: cleanSubject.charAt(0).toUpperCase() + cleanSubject.slice(1)
    }) : null;

    const finalSubjectId = subInfo ? subInfo.subjectId : entry.subjectId;
    const finalSubjectName = subInfo ? subInfo.subjectName : entry.subjectName;

    return {
      domainId: subInfo ? subInfo.domainId : entry.domainId,
      domainName: subInfo ? subInfo.domainName : entry.domainName,
      subjectId: finalSubjectId,
      subjectName: finalSubjectName,
      skillId: finalSubjectId,
      skillName: finalSubjectName,
      topicId: entry.topicId,
      topicName: entry.topicName,
      canonicalKey: `${canonicalKey(finalSubjectId)}_${canonicalKey(entry.topicId)}`
    };
  }

  // 2. Subject-only lookup fallback
  const subInfo = SUBJECT_REGISTRY.get(cleanSubject) || {
    domainId: 'programming',
    domainName: 'Computer Science & Engineering',
    subjectId: rawSubject || 'general',
    subjectName: (rawSubject || 'General').toUpperCase()
  };

  const topId = rawTopicId || rawTopicTitle || 'fundamentals';
  const topName = rawTopicTitle || rawTopicId || 'Fundamentals';

  return {
    domainId: subInfo.domainId,
    domainName: subInfo.domainName,
    subjectId: subInfo.subjectId,
    subjectName: subInfo.subjectName,
    skillId: subInfo.subjectId,
    skillName: subInfo.subjectName,
    topicId: topId,
    topicName: topName,
    canonicalKey: `${canonicalKey(subInfo.subjectId)}_${canonicalKey(topId)}`
  };
}

/**
 * Returns all recognized canonical topics for a subject
 */
export function getCanonicalTopicsForSubject(subjectId: string): { id: string; title: string; moduleId: string }[] {
  const sKey = canonicalKey(subjectId);
  const lang = ALL_PROGRAMMING_LANGUAGES.find(l => canonicalKey(l.slug) === sKey || canonicalKey(l.name) === sKey || canonicalKey(l.id) === sKey);
  if (lang) {
    return lang.modules.flatMap(m => m.topics.map(t => ({ id: t.id, title: t.title, moduleId: m.id })));
  }

  for (const domain of BUILTIN_SKILL_DOMAINS) {
    for (const cat of domain.categories) {
      for (const skill of cat.skills) {
        if (canonicalKey(skill.id) === sKey || canonicalKey(skill.name) === sKey || canonicalKey(skill.code) === sKey) {
          return skill.topics.map(t => ({ id: t.id, title: t.title, moduleId: cat.id }));
        }
      }
    }
  }

  return [];
}

/**
 * Returns all canonical topics across the ENTIRE Knowledge Base
 * (Both programming languages and engineering/multi-disciplinary domains).
 */
export function getAllKnowledgeBaseTaxonomyTopics(): Array<{
  domainId: string;
  domainName: string;
  subjectId: string;
  subjectName: string;
  skillId: string;
  skillName: string;
  moduleId: string;
  moduleName: string;
  topicId: string;
  topicTitle: string;
}> {
  const all: Array<{
    domainId: string;
    domainName: string;
    subjectId: string;
    subjectName: string;
    skillId: string;
    skillName: string;
    moduleId: string;
    moduleName: string;
    topicId: string;
    topicTitle: string;
  }> = [];

  // 1. Programming Languages
  for (const lang of ALL_PROGRAMMING_LANGUAGES) {
    for (const mod of lang.modules) {
      for (const top of mod.topics) {
        all.push({
          domainId: 'programming',
          domainName: 'Computer Science & Engineering',
          subjectId: lang.id,
          subjectName: lang.name,
          skillId: lang.id,
          skillName: lang.name,
          moduleId: mod.id,
          moduleName: mod.title,
          topicId: top.id,
          topicTitle: top.title
        });
      }
    }
  }

  // 2. Multi-disciplinary Engineering Domains
  for (const domain of BUILTIN_SKILL_DOMAINS) {
    if (domain.id === 'programming' || domain.id === 'cs_it') continue;
    for (const cat of domain.categories) {
      for (const skill of cat.skills) {
        for (const top of skill.topics) {
          all.push({
            domainId: domain.id,
            domainName: domain.name,
            subjectId: skill.id,
            subjectName: skill.name,
            skillId: skill.id,
            skillName: skill.name,
            moduleId: cat.id,
            moduleName: cat.name,
            topicId: top.id,
            topicTitle: top.title
          });
        }
      }
    }
  }

  return all;
}

