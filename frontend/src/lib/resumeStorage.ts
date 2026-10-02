import type { ResumeData } from './resumeTypes';

export type ResumeStatus = 'draft' | 'in_progress' | 'ready' | 'published' | 'archived';

export interface SavedResumeItem {
  id: string;
  title: string;
  targetRole?: string;
  status: ResumeStatus;
  completionPercentage: number;
  templateId: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isPinned: boolean;
  atsScore?: number;
}

export interface ActivityLogItem {
  id: string;
  type: 'import' | 'template_change' | 'pdf_download' | 'portfolio_generated' | 'cover_letter' | 'updated' | 'created';
  description: string;
  timestamp: string;
}

const STORAGE_KEY = 'nova_user_resumes';
const ACTIVITY_KEY = 'nova_activity_log';

/**
 * Calculates completion percentage of a resume based on filled fields
 */
export function calculateCompletionPercentage(data: ResumeData): number {
  if (!data) return 0;
  let score = 0;
  let maxScore = 0;

  // Personal Info (30%)
  maxScore += 30;
  if (data.fullName?.trim()) score += 10;
  if (data.email?.trim()) score += 5;
  if (data.phone?.trim()) score += 5;
  if (data.location?.trim()) score += 5;
  if (data.title?.trim()) score += 5;

  // Summary (15%)
  maxScore += 15;
  if (data.summary?.trim() || data.objective?.trim()) score += 15;

  // Experience (25%)
  maxScore += 25;
  if (Array.isArray(data.experience) && data.experience.length > 0) {
    score += Math.min(25, data.experience.length * 12.5);
  }

  // Education (15%)
  maxScore += 15;
  if (Array.isArray(data.education) && data.education.length > 0) {
    score += Math.min(15, data.education.length * 7.5);
  }

  // Skills (15%)
  maxScore += 15;
  if (typeof data.skills === 'string' && data.skills.trim().length > 5) {
    score += 15;
  } else if (Array.isArray(data.skills) && data.skills.length > 0) {
    score += 15;
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Gets automatic smart status based on completion percentage and publication
 */
export function getSmartStatus(completion: number, explicitStatus?: ResumeStatus): ResumeStatus {
  if (explicitStatus === 'published' || explicitStatus === 'archived') {
    return explicitStatus;
  }
  if (completion >= 90) return 'ready';
  if (completion >= 40) return 'in_progress';
  return 'draft';
}

const DEFAULT_SAVED_RESUMES: SavedResumeItem[] = [
  {
    id: 'res_default_1',
    title: "Alex Vance's Resume",
    targetRole: 'Senior AI & Systems Engineer',
    status: 'ready',
    completionPercentage: 93,
    templateId: 'modern-emerald',
    data: {
      fullName: 'Alex Vance',
      title: 'Senior AI & Systems Engineer',
      email: 'alex.vance@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      summary: 'Senior AI Engineer with 6+ years of experience designing scalable LLM pipelines, RAG vector architectures, and high-performance FastAPI backends.',
      experience: [
        { role: 'Lead AI Engineer', company: 'NeuralTech AI', dates: '2022 - Present', bullets: 'Architected enterprise RAG document retrieval engines, scaling query throughput by 300%.' }
      ],
      education: [
        { degree: 'B.S. in Computer Science', school: 'UC Berkeley', year: '2019', gpa: '3.9 GPA' }
      ],
      projects: [],
      skills: 'Python, FastAPI, PyTorch, LangChain, React, TypeScript, Docker, Kubernetes',
      customSections: []
    },
    createdAt: '2026-10-21T08:00:00Z',
    updatedAt: '2026-10-21T10:44:00Z',
    isFavorite: false,
    isPinned: false,
    atsScore: 93
  },
  {
    id: 'res_default_2',
    title: "Alex Vance's Resume",
    targetRole: 'Senior AI & Systems Engineer',
    status: 'ready',
    completionPercentage: 93,
    templateId: 'ats-teal',
    data: {
      fullName: 'Alex Vance',
      title: 'Senior AI & Systems Engineer',
      email: 'alex.vance@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      summary: 'Senior AI Engineer specializing in distributed system design, vector search engines, and real-time cloud microservices.',
      experience: [
        { role: 'Software Engineer', company: 'DataFlow Systems', dates: '2019 - 2022', bullets: 'Developed React & TypeScript dashboards for real-time model monitoring.' }
      ],
      education: [
        { degree: 'B.S. in Computer Science', school: 'UC Berkeley', year: '2019', gpa: '3.9 GPA' }
      ],
      projects: [],
      skills: 'Python, FastAPI, React, PostgreSQL, Docker, AWS, Git',
      customSections: []
    },
    createdAt: '2026-10-21T07:30:00Z',
    updatedAt: '2026-10-21T09:15:00Z',
    isFavorite: false,
    isPinned: false,
    atsScore: 93
  },
  {
    id: 'res_default_3',
    title: "Alex Vance's Resume",
    targetRole: 'Senior AI & Systems Engineer',
    status: 'ready',
    completionPercentage: 93,
    templateId: 'executive-lead',
    data: {
      fullName: 'Alex Vance',
      title: 'Senior AI & Systems Engineer',
      email: 'alex.vance@example.com',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      summary: 'Senior AI Engineer with extensive experience in enterprise LLM deployments and cloud infrastructure.',
      experience: [
        { role: 'Backend Systems Engineer', company: 'Stripe', dates: '2018 - 2021', bullets: 'Optimized high-throughput transaction pipelines processing 1M+ queries daily.' }
      ],
      education: [
        { degree: 'B.S. in Computer Science', school: 'UC Berkeley', year: '2019', gpa: '3.9 GPA' }
      ],
      projects: [],
      skills: 'Python, Go, Distributed Systems, Kubernetes, Kafka',
      customSections: []
    },
    createdAt: '2026-09-26T06:00:00Z',
    updatedAt: '2026-09-26T14:20:00Z',
    isFavorite: false,
    isPinned: false,
    atsScore: 93
  }
];

/**
 * Load all saved resumes from LocalStorage
 */
export function getSavedResumes(): SavedResumeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SAVED_RESUMES;
    const list: SavedResumeItem[] = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_SAVED_RESUMES;
  } catch {
    return DEFAULT_SAVED_RESUMES;
  }
}

/**
 * Save or update a resume in LocalStorage
 */
export function saveResumeItem(
  data: ResumeData,
  templateId: string,
  existingId?: string,
  title?: string,
  explicitStatus?: ResumeStatus
): SavedResumeItem {
  const resumes = getSavedResumes();
  const now = new Date().toISOString();
  const completion = calculateCompletionPercentage(data);
  const status = getSmartStatus(completion, explicitStatus);
  const resumeTitle = title || data.fullName ? `${data.fullName}'s Resume` : 'Untitled Resume';

  let item: SavedResumeItem;

  if (existingId) {
    const idx = resumes.findIndex((r) => r.id === existingId);
    if (idx !== -1) {
      item = {
        ...resumes[idx],
        title: title || resumes[idx].title || resumeTitle,
        targetRole: data.title || resumes[idx].targetRole,
        status,
        completionPercentage: completion,
        templateId,
        data,
        updatedAt: now,
      };
      resumes[idx] = item;
    } else {
      item = {
        id: existingId,
        title: resumeTitle,
        targetRole: data.title || 'Professional',
        status,
        completionPercentage: completion,
        templateId,
        data,
        createdAt: now,
        updatedAt: now,
        isFavorite: false,
        isPinned: false,
        atsScore: Math.floor(85 + Math.random() * 14),
      };
      resumes.unshift(item);
    }
  } else {
    const newId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    item = {
      id: newId,
      title: resumeTitle,
      targetRole: data.title || 'Professional',
      status,
      completionPercentage: completion,
      templateId,
      data,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      isPinned: false,
      atsScore: Math.floor(85 + Math.random() * 14),
    };
    resumes.unshift(item);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  } catch (e) {
    console.error('Failed to save resumes to localStorage:', e);
  }

  return item;
}

/**
 * Delete a resume by ID
 */
export function deleteResumeItem(id: string): SavedResumeItem[] {
  const resumes = getSavedResumes().filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  } catch {}
  return resumes;
}

/**
 * Duplicate a resume
 */
export function duplicateResumeItem(id: string): SavedResumeItem | null {
  const resumes = getSavedResumes();
  const original = resumes.find((r) => r.id === id);
  if (!original) return null;

  const now = new Date().toISOString();
  const copy: SavedResumeItem = {
    ...original,
    id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
  };

  resumes.unshift(copy);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
    addActivityLog('created', `Duplicated resume "${original.title}"`);
  } catch {}
  return copy;
}

/**
 * Toggle favorite
 */
export function toggleFavoriteResume(id: string): SavedResumeItem[] {
  const resumes = getSavedResumes().map((r) => {
    if (r.id === id) return { ...r, isFavorite: !r.isFavorite };
    return r;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  } catch {}
  return resumes;
}

/**
 * Toggle pinned
 */
export function togglePinResume(id: string): SavedResumeItem[] {
  const resumes = getSavedResumes().map((r) => {
    if (r.id === id) return { ...r, isPinned: !r.isPinned };
    return r;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
  } catch {}
  return resumes;
}

/**
 * Activity Logging
 */
const DEFAULT_ACTIVITY_LOGS: ActivityLogItem[] = [
  { id: 'act_1', type: 'template_change', description: 'Switched template to "Modern Emerald"', timestamp: '2026-10-21T08:44:00Z' },
  { id: 'act_2', type: 'template_change', description: 'Switched template to "Modern Emerald"', timestamp: '2026-10-21T15:59:00Z' },
  { id: 'act_3', type: 'template_change', description: 'Switched template to "ATS Teal"', timestamp: '2026-10-21T13:44:00Z' },
  { id: 'act_4', type: 'pdf_download', description: 'Downloaded PDF for "Alex Vance"', timestamp: '2026-10-21T13:06:00Z' },
  { id: 'act_5', type: 'pdf_download', description: 'Downloaded PDF for "Alex Vance"', timestamp: '2026-10-21T13:06:00Z' },
];

export function getActivityLogs(): ActivityLogItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return DEFAULT_ACTIVITY_LOGS;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_ACTIVITY_LOGS;
  } catch {
    return DEFAULT_ACTIVITY_LOGS;
  }
}

export function addActivityLog(
  type: ActivityLogItem['type'],
  description: string
): void {
  const logs = getActivityLogs();
  const newItem: ActivityLogItem = {
    id: `log_${Date.now()}`,
    type,
    description,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newItem);
  const trimmed = logs.slice(0, 50); // Keep last 50 logs
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));
  } catch {}
}
