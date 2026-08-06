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

/**
 * Load all saved resumes from LocalStorage
 */
export function getSavedResumes(): SavedResumeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: SavedResumeItem[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
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
export function getActivityLogs(): ActivityLogItem[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
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
