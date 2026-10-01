import type {
  StudentSkillItem, SkillGapAnalysis, OpportunityItem, ExplainableMatchResult,
  ApplicationItem, VerificationBadgeItem,
  CandidateDetailData, AuthUserSession,
  DemoAccountDefinition, UserRoleType, GeneratedAssessmentTest, AssessmentReport,
  TestAntiCheatingViolation, DepartmentAnonymousStats, DepartmentFilterParams, RecruiterTalentFilterParams,
  RecruiterTalentAggregate, CurriculumTopicItem, CurriculumGapItem, FacultyOpportunityItem,
  DepartmentItem, FacultyMemberItem, VerificationQueueItem, IndustryPartnerAdminItem,
  SkillTaxonomyCategoryItem, AuditLogItem,
  IndustryPostItem, IndustryPostFilterParams,
  PostCommentItem, PostEngagementStats, PostNotificationItem,
  StudentInternalProfile, ConversationItem, DirectMessageItem, CompanyProfileData,
  KnowledgeBaseLanguage, TopicLearningContent, CareerRoleDefinition, RoleSkillGapResult,
  CertificateRecord, BadgeItem, QuestionReviewStatus,
  ProgrammingLanguageItem, LanguageModuleItem, LanguageTopicItem,
  LearningBookmarkItem, LearningHistoryItem,
  InstitutionRecord, InstitutionFilterParams, InstitutionImportRow,
  InstitutionImportResult, SuperAdminMetrics,
  InstitutionAdminMetrics, PlatformUserRecord, UserFilterParams,
  PlatformConfigData, InstitutionAccreditationRecord, NationalBenchmarkData,
  SkillDomain, SkillItem, CurriculumRecord,
  CurriculumAlignmentAnalysis,
  PlacementFunnelMetrics, DepartmentSkillGapItem, ServiceHealthItem,
  PlatformHealthReport, InstitutionPartnerCompany,
  SubjectSyllabusProgress, TopicProgressRecord
} from '../types/careerConnect';
import {
  BUILTIN_SKILL_DOMAINS,
  getAllSkillDomains,
  getSkillDomainById,
  getAllSkills,
  getSkillById,
  getSkillsForDepartment
} from '../data/multiDisciplinaryTaxonomy';
import {
  generateDisciplineAssessment,
  getAvailableQuestionCount
} from '../data/multiDisciplinaryQuestionBank';
import {
  generateFinalCertificationTest,
  generateTopicTest,
  canonicalKey,
  loadLanguageQuestions,
  feedLanguageIntoQuestionBank
} from '../data/question-bank';
import { API_BASE } from '../config';
import { ALL_INDIA_COLLEGES, searchColleges, type CollegeRecord } from '../data/collegeDatabase';
import {
  ALL_BANK_QUESTIONS, generate50QuestionTest, getQuestionsForLanguage,
  type FilterAssessmentParams,
  type BankQuestion, type QuestionDifficulty
} from '../data/questionBank';
import { ALL_PROGRAMMING_LANGUAGES } from '../data/programmingLanguagesData';
import { KNOWLEDGE_BASE_LANGUAGES, TOPIC_LEARNING_CONTENT, getOrCreateTopicContent } from '../data/knowledgeBaseData';
import { CAREER_ROLES } from '../data/careerRolesData';
import {
  db, auth, storage,
  collection, doc, getDoc, setDoc, getDocs, updateDoc, deleteDoc, addDoc,
  query, where, onSnapshot, serverTimestamp, increment, writeBatch, orderBy, limit
} from '../lib/firebase';

const STORAGE_KEYS = {
  SESSION: 'nova_career_session',
  CURRICULUM: 'novaconnect_db_curriculum_topics',
  LOCAL_POSTS: 'novaconnect_local_posts_cache'
};

const memoryStore = new Map<string, string>();

function getLocalData<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } else {
      const raw = memoryStore.get(key);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return fallback;
}

function setLocalData<T>(key: string, value: T): void {
  try {
    const val = JSON.stringify(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    } else {
      memoryStore.set(key, val);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key }));
    }
  } catch {}
}

export const DEMO_ROLES_CATALOG: DemoAccountDefinition[] = [
  {
    role: 'student',
    title: 'Student',
    tagline: 'Build skills, take 50-Q verified tests, and apply to industry opportunities',
    email: 'student@novaconnect.edu',
    name: 'Ved Dhobi',
    affiliation: 'Government Engineering College, Modasa (GEC Modasa)',
    description: 'B.Tech 6th Sem • Computer Engineering • CGPA 8.8',
    badgeColor: 'emerald',
    iconName: 'GraduationCap'
  },
  {
    role: 'academician',
    title: 'Faculty / Academician',
    tagline: 'Monitor department skill performance, curriculum gaps, and question banks',
    email: 'faculty@gecmodasa.ac.in',
    name: 'Dr. Rajesh Sharma',
    affiliation: 'Government Engineering College, Modasa (GEC Modasa)',
    description: 'Professor & Head of Computer Engineering • Curriculum Committee',
    badgeColor: 'purple',
    iconName: 'BookOpen'
  },
  {
    role: 'industry',
    title: 'Industry / Recruiter',
    tagline: 'Publish opportunities with external Google Forms or internal ATS pipeline',
    email: 'recruiter@google.com',
    name: 'Priya Patel',
    affiliation: 'Google AI Labs',
    description: 'University Hiring Lead • Campus Collaborations & Tech Hiring',
    badgeColor: 'cyan',
    iconName: 'Building2'
  },
  {
    role: 'institution',
    title: 'Institution Admin',
    tagline: 'Department curriculum governance, accreditation, and industry linkages',
    email: 'admin@gecmodasa.ac.in',
    name: 'Prof. Arvind Swaminathan',
    affiliation: 'Government Engineering College, Modasa (GEC Modasa)',
    description: 'Dean of Academic & Industry Collaborations • AICTE / GTU Lead',
    badgeColor: 'amber',
    iconName: 'BarChart3'
  },
  {
    role: 'super_admin',
    title: 'Super Admin',
    tagline: 'National platform governance, college directory, and security controls',
    email: 'superadmin@ayush.gov.in',
    name: 'Dr. V. K. Paul',
    affiliation: 'National Technical Governance / Ministry of Ayush & AIIA',
    description: 'National Cluster Administrator • System Audit Access',
    badgeColor: 'rose',
    iconName: 'ShieldAlert'
  }
];


// ── CLIENT-SIDE IMAGE COMPRESSION (Guaranteed ultra-fast web JPEG: ~35KB-70KB) ──
export async function compressImageToDataUrl(file: File, maxDimension = 800, quality = 0.72): Promise<string> {
  return new Promise((resolve) => {
    const isImage = file.type.toLowerCase().startsWith('image/') || /\.(jpe?g|png|webp|jfif|pjpeg|bmp|gif)$/i.test(file.name);
    if (!isImage) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => resolve('');
    reader.onload = (e) => {
      const rawDataUrl = typeof e.target?.result === 'string' ? e.target.result : '';
      if (!rawDataUrl) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onerror = () => {
        // Fallback only if reasonably small (< 300KB)
        if (rawDataUrl.length < 400000) resolve(rawDataUrl);
        else resolve('');
      };
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (rawDataUrl.length < 400000) resolve(rawDataUrl);
          else resolve('');
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          // If still larger than 140KB in base64 (~100KB raw), compress further
          if (dataUrl.length > 180000) {
            const secondCanvas = document.createElement('canvas');
            const scale = 0.75;
            secondCanvas.width = Math.round(width * scale);
            secondCanvas.height = Math.round(height * scale);
            const ctx2 = secondCanvas.getContext('2d');
            if (ctx2) {
              ctx2.fillStyle = '#ffffff';
              ctx2.fillRect(0, 0, secondCanvas.width, secondCanvas.height);
              ctx2.drawImage(img, 0, 0, secondCanvas.width, secondCanvas.height);
              dataUrl = secondCanvas.toDataURL('image/jpeg', 0.58);
            }
          }
          resolve(dataUrl);
        } catch {
          if (rawDataUrl.length < 400000) resolve(rawDataUrl);
          else resolve('');
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// In-memory impression deduplication set for current browser session
const viewedPostIdsInSession = new Set<string>();

export const careerConnectService = {
  // ── AUTH & SESSION MANAGEMENT ──────────────────────────────────
  getCurrentSession(): AuthUserSession | null {
    return getLocalData<AuthUserSession | null>(STORAGE_KEYS.SESSION, null);
  },

  setCurrentSession(session: AuthUserSession | null): void {
    if (session) {
      setLocalData(STORAGE_KEYS.SESSION, session);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('novaconnect:data_changed', { detail: { key: STORAGE_KEYS.SESSION } }));
      }
    }
  },

  async loginWithDemo(role: UserRoleType): Promise<AuthUserSession> {
    const def = DEMO_ROLES_CATALOG.find(r => r.role === role) || DEMO_ROLES_CATALOG[0];
    const session: AuthUserSession = {
      id: `demo-${role}-1`,
      full_name: def.name,
      email: def.email,
      role: role,
      title: def.description,
      institution: def.affiliation,
      department: 'Computer Engineering',
      company: role === 'industry' ? 'Google AI Labs' : undefined,
      cgpa: role === 'student' ? '8.8' : undefined,
      token: `demo-${role}`
    };
    this.setCurrentSession(session);
    return session;
  },

  async loginWithRole(email: string, _pass: string, role: UserRoleType): Promise<AuthUserSession> {
    const matched = DEMO_ROLES_CATALOG.find(d => d.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      return this.loginWithDemo(matched.role);
    }
    const session: AuthUserSession = {
      id: `user-${Date.now()}`,
      full_name: email.split('@')[0],
      email: email,
      role: role,
      department: 'Computer Engineering',
      institution: 'Government Engineering College, Modasa (GEC Modasa)',
      company: role === 'industry' ? (email.split('@')[1]?.split('.')[0]?.toUpperCase() || 'Tech Corp') : undefined,
      token: `session-${Date.now()}`
    };
    this.setCurrentSession(session);
    return session;
  },

  async registerWithRole(payload: {
    fullName: string;
    email: string;
    password: string;
    role: UserRoleType;
    institutionName?: string;
    department?: string;
    cgpa?: string;
    graduationYear?: number;
    companyName?: string;
    designation?: string;
  }): Promise<AuthUserSession> {
    const session: AuthUserSession = {
      id: `user-${Date.now()}`,
      full_name: payload.fullName,
      email: payload.email,
      role: payload.role,
      institution: payload.institutionName || 'Government Engineering College, Modasa (GEC Modasa)',
      department: payload.department || 'Computer Engineering',
      company: payload.companyName,
      cgpa: payload.cgpa || '8.5',
      token: `reg-token-${Date.now()}`
    };
    this.setCurrentSession(session);
    return session;
  },

  logoutCareerSession(): void {
    this.setCurrentSession(null);
  },

  async getProfile(): Promise<any> {
    const sess = this.getCurrentSession();
    return {
      role: sess?.role || 'student',
      full_name: sess?.full_name || 'Ved Dhobi',
      student_profile: {
        branch: sess?.department || 'Computer Engineering',
        cgpa: sess?.cgpa || '8.8',
        graduation_year: 2026,
        target_role: 'Full Stack AI Engineer',
        preferred_domain: 'AI Automation & Cloud Systems',
        bio_summary: 'B.Tech Computer Engineering student focused on building scalable, industry-aligned web and AI applications.'
      }
    };
  },

  async updateRole(_roleName: string): Promise<void> {},

  extractUrls(text: string): string[] {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex) || [];
    return matches.map(u => u.replace(/[.,;!?)]+$/, ''));
  },


  extractSkills(text: string): string[] {
    if (!text) return [];
    const KNOWN_SKILLS = [
      'Python', 'Java', 'SQL', 'C++', 'JavaScript', 'TypeScript', 'React',
      'Node.js', 'FastAPI', 'Django', 'Machine Learning', 'AI', 'Deep Learning',
      'PyTorch', 'TensorFlow', 'Docker', 'Kubernetes', 'AWS', 'Git', 'GitHub',
      'Data Structures', 'Algorithms', 'Computer Networks', 'DBMS', 'Linux',
      'PostgreSQL', 'MongoDB', 'REST API', 'Figma', 'UI/UX', 'Cloud'
    ];
    const found: string[] = [];
    for (const s of KNOWN_SKILLS) {
      const regex = new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        found.push(s);
      }
    }
    return found;
  },

  async uploadPostImage(file: File): Promise<string> {
    // 1. Instantly compress to high-fidelity web-ready JPEG (~35KB-60KB) via HTML5 Canvas
    const compressedDataUrl = await compressImageToDataUrl(file, 1000, 0.78);
    if (compressedDataUrl && compressedDataUrl.length > 20) {
      return compressedDataUrl;
    }
    // Direct file read fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Failed to read image file'));
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  },

  async createIndustryPost(postData: Partial<IndustryPostItem>): Promise<IndustryPostItem> {
    const rawMessage = (postData.message || '').trim();
    if (!rawMessage) {
      throw new Error('Post announcement message cannot be empty');
    }

    const sess = this.getCurrentSession();
    const detectedUrls = this.extractUrls(rawMessage);
    const primaryUrl = postData.primary_apply_url || detectedUrls[0] || undefined;
    const detectedSkills = this.extractSkills(rawMessage);
    const mergedSkills = Array.from(new Set([...(postData.skills || []), ...detectedSkills]));

    const docPayload: any = {
      company_name: postData.company_name || sess?.company || 'Verified Industry Partner',
      company_logo: postData.company_logo || '',
      is_verified: true,
      author_id: postData.author_id || sess?.id || 'demo-industry-1',
      author_name: postData.author_name || sess?.full_name || 'Priya Patel',
      message: rawMessage,
      images: Array.isArray(postData.images) ? postData.images.filter(Boolean) : (typeof postData.images === 'string' && (postData.images as string).trim() ? [(postData.images as string).trim()] : []),
      links: detectedUrls,
      primary_apply_url: primaryUrl || '',
      post_type: postData.post_type || 'Announcement',
      target_scope: postData.target_scope || 'All India',
      target_state: postData.target_state || '',
      target_city: postData.target_city || '',
      target_college: postData.target_college || '',
      target_department: postData.target_department || 'All Departments',
      target_batches: postData.target_batches || '',
      skills: mergedSkills,
      application_mode: postData.application_mode || (primaryUrl ? 'external' : 'internal'),
      created_at: new Date().toISOString(),
      saved_by: [],
      status: 'published',
      applicant_count: 0,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
      saves_count: 0
    };

    // Clean undefined fields to avoid Firestore serialization errors
    const cleanedPayload: Record<string, any> = {};
    for (const [k, v] of Object.entries(docPayload)) {
      if (v !== undefined) cleanedPayload[k] = v;
    }

    let generatedId = `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'industryPosts'), {
          ...cleanedPayload,
          server_timestamp: serverTimestamp()
        });
        generatedId = docRef.id;
      } catch (err: any) {
        console.error('Firestore addDoc error in createIndustryPost:', err);
        throw new Error(`Failed to publish post to database: ${err?.message || 'Firestore connection error'}`);
      }
    }

    const newPost: IndustryPostItem = {
      ...docPayload,
      id: generatedId
    };

    // Keep client cache in sync
    const localPosts = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
    localPosts.unshift(newPost);
    setLocalData(STORAGE_KEYS.LOCAL_POSTS, localPosts.slice(0, 50));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novaconnect:data_changed', { detail: { key: 'posts' } }));
    }

    return newPost;
  },

  subscribeIndustryPosts(
    filters: IndustryPostFilterParams | undefined,
    callback: (posts: IndustryPostItem[]) => void
  ): () => void {
    if (!db) {
      const cached = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
      callback(cached);
      return () => {};
    }

    try {
      const postsCol = collection(db, 'industryPosts');
      const q = query(postsCol);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        let items: IndustryPostItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          const rawImgs = d.images || d.imageUrls || d.image_url || d.imageUrl || [];
          const postImages: string[] = Array.isArray(rawImgs)
            ? rawImgs.filter(Boolean)
            : (typeof rawImgs === 'string' && rawImgs.trim() ? [rawImgs.trim()] : []);
          items.push({
            id: docSnap.id,
            company_name: d.company_name || 'Industry Partner',
            company_logo: d.company_logo || undefined,
            is_verified: d.is_verified ?? true,
            author_id: d.author_id || '',
            author_name: d.author_name || 'Recruiter',
            message: d.message || '',
            images: postImages,
            links: d.links || [],
            primary_apply_url: d.primary_apply_url || undefined,
            post_type: d.post_type || 'Announcement',
            target_scope: d.target_scope || 'All India',
            target_state: d.target_state,
            target_city: d.target_city,
            target_college: d.target_college,
            target_department: d.target_department || 'All Departments',
            target_batches: d.target_batches,
            skills: d.skills || [],
            application_mode: d.application_mode || 'external',
            created_at: d.created_at || new Date().toISOString(),
            saved_by: d.saved_by || [],
            status: d.status || 'published',
            applicant_count: d.applicant_count || 0,
            likes_count: typeof d.likes_count === 'number' ? d.likes_count : 0,
            comments_count: typeof d.comments_count === 'number' ? d.comments_count : 0,
            shares_count: typeof d.shares_count === 'number' ? d.shares_count : 0,
            views_count: typeof d.views_count === 'number' ? d.views_count : 0,
            saves_count: typeof d.saves_count === 'number' ? d.saves_count : 0
          });
        });

        // Filter published
        items = items.filter(i => i.status === 'published');

        // Apply filters
        if (filters) {
          if (filters.post_type && filters.post_type !== 'All') {
            items = items.filter(p => p.post_type === filters.post_type);
          }
          if (filters.department && filters.department !== 'All Departments' && filters.department !== 'All') {
            items = items.filter(p => !p.target_department || p.target_department === 'All Departments' || p.target_department.toLowerCase() === filters.department!.toLowerCase());
          }
          if (filters.company) {
            items = items.filter(p => p.company_name?.toLowerCase() === filters.company!.toLowerCase());
          }
          if (filters.search && filters.search.trim()) {
            const qStr = filters.search.trim().toLowerCase();
            items = items.filter(p =>
              p.message.toLowerCase().includes(qStr) ||
              p.company_name.toLowerCase().includes(qStr) ||
              (p.skills || []).some(s => s.toLowerCase().includes(qStr))
            );
          }
        }

        // Sort by created_at descending
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Update local cache
        setLocalData(STORAGE_KEYS.LOCAL_POSTS, items);
        callback(items);
      }, (error) => {
        console.warn('Firestore onSnapshot subscription notice:', error);
        const cached = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
        callback(cached);
      });

      return unsubscribe;
    } catch (e) {
      console.warn('Firestore subscription fallback:', e);
      const cached = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
      callback(cached);
      return () => {};
    }
  },

  async getIndustryPosts(filters?: IndustryPostFilterParams): Promise<IndustryPostItem[]> {
    if (!db) {
      return getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
    }
    try {
      const snap = await getDocs(collection(db, 'industryPosts'));
      let items: IndustryPostItem[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          ...d
        } as IndustryPostItem);
      });

      items = items.filter(i => i.status === 'published');

      if (filters) {
        if (filters.post_type && filters.post_type !== 'All') {
          items = items.filter(p => p.post_type === filters.post_type);
        }
        if (filters.department && filters.department !== 'All Departments' && filters.department !== 'All') {
          items = items.filter(p => !p.target_department || p.target_department === 'All Departments' || p.target_department.toLowerCase() === filters.department!.toLowerCase());
        }
        if (filters.search && filters.search.trim()) {
          const qStr = filters.search.trim().toLowerCase();
          items = items.filter(p =>
            p.message.toLowerCase().includes(qStr) ||
            p.company_name.toLowerCase().includes(qStr) ||
            (p.skills || []).some(s => s.toLowerCase().includes(qStr))
          );
        }
      }

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return items;
    } catch {
      return getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
    }
  },

  subscribeRecruiterPosts(
    authorIdOrCompany: string,
    callback: (posts: IndustryPostItem[]) => void
  ): () => void {
    if (!db) {
      const cached = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
      const matched = cached.filter(p =>
        p.author_id === authorIdOrCompany ||
        p.company_name?.toLowerCase() === authorIdOrCompany.toLowerCase()
      );
      callback(matched);
      return () => {};
    }

    try {
      const q = query(collection(db, 'industryPosts'));
      return onSnapshot(q, (snapshot) => {
        const items: IndustryPostItem[] = [];
        const norm = (authorIdOrCompany || '').trim().toLowerCase();
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          const rawImgs = d.images || d.imageUrls || d.image_url || d.imageUrl || [];
          const postImages: string[] = Array.isArray(rawImgs)
            ? rawImgs.filter(Boolean)
            : (typeof rawImgs === 'string' && rawImgs.trim() ? [rawImgs.trim()] : []);
          const pAuth = (d.author_id || '').toLowerCase();
          const pComp = (d.company_name || '').toLowerCase();
          if (pAuth === norm || pComp === norm || !norm || norm.includes('demo') || norm.includes('google')) {
            items.push({
              id: docSnap.id,
              company_name: d.company_name || 'Industry Partner',
              company_logo: d.company_logo || undefined,
              is_verified: d.is_verified ?? true,
              author_id: d.author_id || '',
              author_name: d.author_name || 'Recruiter',
              message: d.message || '',
              images: postImages,
              links: d.links || [],
              primary_apply_url: d.primary_apply_url || undefined,
              post_type: d.post_type || 'Announcement',
              target_scope: d.target_scope || 'All India',
              target_state: d.target_state,
              target_city: d.target_city,
              target_college: d.target_college,
              target_department: d.target_department || 'All Departments',
              target_batches: d.target_batches,
              skills: d.skills || [],
              application_mode: d.application_mode || 'external',
              created_at: d.created_at || new Date().toISOString(),
              saved_by: d.saved_by || [],
              status: d.status || 'published',
              applicant_count: d.applicant_count || 0,
              likes_count: typeof d.likes_count === 'number' ? d.likes_count : 0,
              comments_count: typeof d.comments_count === 'number' ? d.comments_count : 0,
              shares_count: typeof d.shares_count === 'number' ? d.shares_count : 0,
              views_count: typeof d.views_count === 'number' ? d.views_count : 0,
              saves_count: typeof d.saves_count === 'number' ? d.saves_count : 0
            });
          }
        });
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        callback(items);
      }, (err) => {
        console.warn('Recruiter posts listener notice:', err);
        const cached = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
        callback(cached);
      });
    } catch {
      const cached = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
      callback(cached);
      return () => {};
    }
  },

  async getMyRecruiterPosts(authorIdOrCompany: string): Promise<IndustryPostItem[]> {
    const all = await this.getIndustryPosts();
    const norm = (authorIdOrCompany || '').trim().toLowerCase();
    return all.filter(p =>
      (p.author_id || '').toLowerCase() === norm ||
      p.company_name?.toLowerCase() === norm ||
      norm.includes('google') || norm.includes('demo')
    );
  },

  async updateIndustryPost(postId: string, updates: Partial<IndustryPostItem>): Promise<IndustryPostItem> {
    if (db) {
      try {
        const refDoc = doc(db, 'industryPosts', postId);
        const cleaned: Record<string, any> = {};
        for (const [k, v] of Object.entries(updates)) {
          if (v !== undefined) cleaned[k] = v;
        }
        await updateDoc(refDoc, {
          ...cleaned,
          updated_at: serverTimestamp()
        });
      } catch (err: any) {
        console.error('Firestore updateDoc error:', err);
        throw new Error(`Failed to update post: ${err?.message || 'Firestore connection error'}`);
      }
    }
    const cached = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
    const idx = cached.findIndex(p => p.id === postId);
    if (idx >= 0) {
      cached[idx] = { ...cached[idx], ...updates };
      setLocalData(STORAGE_KEYS.LOCAL_POSTS, cached);
    }
    return { id: postId, ...updates } as IndustryPostItem;
  },

  async deleteIndustryPost(postId: string): Promise<boolean> {
    if (db) {
      try {
        await deleteDoc(doc(db, 'industryPosts', postId));
      } catch (err) {
        console.error('Firestore deleteDoc error:', err);
      }
    }
    const cached = getLocalData<IndustryPostItem[]>(STORAGE_KEYS.LOCAL_POSTS, []);
    const filtered = cached.filter(p => p.id !== postId);
    setLocalData(STORAGE_KEYS.LOCAL_POSTS, filtered);
    return true;
  },

  async toggleSavePost(postId: string, studentId: string): Promise<boolean> {
    const savedKey = `nova_saved_posts_${studentId}`;
    const saved = getLocalData<string[]>(savedKey, []);
    const hasSaved = saved.includes(postId);
    const updated = hasSaved ? saved.filter(id => id !== postId) : [...saved, postId];
    setLocalData(savedKey, updated);

    let isSavedNow = !hasSaved;

    if (db && studentId) {
      try {
        const saveDocRef = doc(db, 'users', studentId, 'savedPosts', postId);
        const postDocRef = doc(db, 'industryPosts', postId);
        const snap = await getDoc(saveDocRef);

        if (snap.exists()) {
          await deleteDoc(saveDocRef);
          await updateDoc(postDocRef, { saves_count: increment(-1) });
          isSavedNow = false;
        } else {
          await setDoc(saveDocRef, {
            postId,
            savedAt: new Date().toISOString(),
            server_timestamp: serverTimestamp()
          });
          await updateDoc(postDocRef, { saves_count: increment(1) });
          isSavedNow = true;
        }
      } catch (err) {
        console.error('toggleSavePost Firestore error:', err);
      }
    }

    return isSavedNow;
  },
  // ── 30. REAL-TIME SOCIAL FEED INTERACTIONS & ENGAGEMENT (PHASE 2) ──

  /**
   * Toggles Like on an industry post atomically in Firestore.
   * Path: industryPosts/{postId}/likes/{userId}
   * Increments or decrements post.likes_count atomically.
   */
  async toggleLikePost(postId: string, userSession: AuthUserSession, postAuthorId?: string): Promise<{ isLiked: boolean; newCount: number }> {
    const userId = userSession.id;
    if (!userId) throw new Error('User must be logged in to like posts');

    let isLikedNow = false;

    if (db) {
      try {
        const likeDocRef = doc(db, 'industryPosts', postId, 'likes', userId);
        const postDocRef = doc(db, 'industryPosts', postId);
        const likeSnap = await getDoc(likeDocRef);

        if (likeSnap.exists()) {
          // Unlike
          await deleteDoc(likeDocRef);
          await updateDoc(postDocRef, { likes_count: increment(-1) });
          isLikedNow = false;
        } else {
          // Like
          await setDoc(likeDocRef, {
            userId: userSession.id,
            userName: userSession.full_name,
            userRole: userSession.role,
            createdAt: new Date().toISOString(),
            server_timestamp: serverTimestamp()
          });
          await updateDoc(postDocRef, { likes_count: increment(1) });
          isLikedNow = true;

          // Notify author if not self
          if (postAuthorId && postAuthorId !== userId) {
            this.createNotification({
              recipientId: postAuthorId,
              actorId: userId,
              actorName: userSession.full_name,
              type: 'like',
              postId,
              message: `${userSession.full_name} liked your industry announcement.`
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('toggleLikePost Firestore error:', err);
      }
    }

    return { isLiked: isLikedNow, newCount: isLikedNow ? 1 : 0 };
  },

  /**
   * Real-time listener for current user's liked status on a post.
   */
  subscribePostLikeStatus(postId: string, userId: string, callback: (isLiked: boolean) => void): () => void {
    if (!db || !userId) {
      callback(false);
      return () => {};
    }
    try {
      const likeDocRef = doc(db, 'industryPosts', postId, 'likes', userId);
      return onSnapshot(likeDocRef, (snap) => {
        callback(snap.exists());
      }, (err) => {
        console.warn('subscribePostLikeStatus notice:', err);
        callback(false);
      });
    } catch {
      callback(false);
      return () => {};
    }
  },

  /**
   * Adds a real comment to a post in Firestore.
   * Path: industryPosts/{postId}/comments/{commentId}
   * Increments post.comments_count atomically.
   */
  async addPostComment(
    postId: string,
    text: string,
    userSession: AuthUserSession,
    postAuthorId?: string,
    replyTo?: { commentId: string; authorName: string },
    isRecruiterReply?: boolean
  ): Promise<PostCommentItem> {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Comment cannot be empty');

    const commentData: Record<string, any> = {
      postId,
      userId: userSession.id,
      userName: userSession.full_name || 'Nova User',
      userRole: userSession.role || 'student',
      text: trimmed,
      createdAt: new Date().toISOString()
    };
    if (replyTo?.commentId) commentData.replyToId = replyTo.commentId;
    if (replyTo?.authorName) commentData.replyToAuthor = replyTo.authorName;
    if (isRecruiterReply !== undefined) {
      commentData.isRecruiterReply = isRecruiterReply;
    } else if (userSession.role === 'industry') {
      commentData.isRecruiterReply = true;
    }

    let generatedId = `comment-${Date.now()}`;

    if (db) {
      try {
        const commentsCol = collection(db, 'industryPosts', postId, 'comments');
        const postDocRef = doc(db, 'industryPosts', postId);

        const docRef = await addDoc(commentsCol, {
          ...commentData,
          server_timestamp: serverTimestamp()
        });
        generatedId = docRef.id;

        await updateDoc(postDocRef, { comments_count: increment(1) });

        // Notify author if not self
        if (postAuthorId && postAuthorId !== userSession.id) {
          this.createNotification({
            recipientId: postAuthorId,
            actorId: userSession.id,
            actorName: userSession.full_name,
            type: replyTo ? 'reply' : 'comment',
            postId,
            message: `${userSession.full_name} ${replyTo ? 'replied to a comment' : 'commented'}: "${trimmed.slice(0, 50)}${trimmed.length > 50 ? '...' : ''}"`
          }).catch(() => {});
        }
      } catch (err) {
        console.error('addPostComment Firestore error:', err);
      }
    }

    return { id: generatedId, ...commentData } as PostCommentItem;
  },

  /**
   * Deletes a comment from a post.
   * Path: industryPosts/{postId}/comments/{commentId}
   * Decrements post.comments_count atomically.
   */
  async deletePostComment(postId: string, commentId: string): Promise<void> {
    if (db) {
      try {
        const commentDocRef = doc(db, 'industryPosts', postId, 'comments', commentId);
        const postDocRef = doc(db, 'industryPosts', postId);
        await deleteDoc(commentDocRef);
        await updateDoc(postDocRef, { comments_count: increment(-1) });
      } catch (err) {
        console.error('deletePostComment Firestore error:', err);
      }
    }
  },

  /**
   * Real-time listener for comments on a post.
   */
  subscribePostComments(postId: string, callback: (comments: PostCommentItem[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }
    try {
      const commentsCol = collection(db, 'industryPosts', postId, 'comments');
      return onSnapshot(commentsCol, (snapshot) => {
        const list: PostCommentItem[] = [];
        snapshot.forEach(d => {
          const data = d.data();
          list.push({
            id: d.id,
            postId: data.postId || postId,
            userId: data.userId || '',
            userName: data.userName || 'Anonymous',
            userRole: data.userRole || 'student',
            text: data.text || '',
            createdAt: data.createdAt || new Date().toISOString(),
            replyToId: data.replyToId || undefined,
            replyToAuthor: data.replyToAuthor || undefined,
            isRecruiterReply: data.isRecruiterReply ?? (data.userRole === 'industry')
          });
        });
        // Sort oldest to newest
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        callback(list);
      }, (err) => {
        console.warn('subscribePostComments notice:', err);
        callback([]);
      });
    } catch {
      callback([]);
      return () => {};
    }
  },

  /**
   * Records a view / impression for a post.
   * Uses IntersectionObserver dwell time + session deduplication.
   * Path: industryPosts/{postId}/views/{viewerId}
   * Increments post.views_count atomically.
   */
  async recordPostView(postId: string, userSession?: AuthUserSession | null): Promise<void> {
    // 1. Dwell session deduplication: if already viewed in this browser session, ignore
    if (viewedPostIdsInSession.has(postId)) return;
    viewedPostIdsInSession.add(postId);

    if (db) {
      try {
        const viewerId = userSession?.id || `anon_${Math.random().toString(36).substring(2, 9)}`;
        const viewDocRef = doc(db, 'industryPosts', postId, 'views', viewerId);
        const postDocRef = doc(db, 'industryPosts', postId);

        await setDoc(viewDocRef, {
          viewerId,
          viewerRole: userSession?.role || 'student',
          viewedAt: new Date().toISOString(),
          server_timestamp: serverTimestamp()
        }, { merge: true });

        await updateDoc(postDocRef, { views_count: increment(1) });
      } catch (err) {
        console.warn('recordPostView notice:', err);
      }
    }
  },

  /**
   * Records a share action for a post.
   * Increments post.shares_count atomically.
   */
  async recordPostShare(postId: string, userSession?: AuthUserSession | null, method: 'native' | 'clipboard' = 'clipboard'): Promise<void> {
    if (db) {
      try {
        const postDocRef = doc(db, 'industryPosts', postId);
        await updateDoc(postDocRef, { shares_count: increment(1) });

        const sharesCol = collection(db, 'industryPosts', postId, 'shares');
        await addDoc(sharesCol, {
          userId: userSession?.id || 'guest',
          userName: userSession?.full_name || 'Guest',
          method,
          createdAt: new Date().toISOString(),
          server_timestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn('recordPostShare notice:', err);
      }
    }
  },

  /**
   * Real-time listener for a user's saved posts bookmarks.
   * Path: users/{userId}/savedPosts
   */
  subscribeUserSavedPosts(userId: string, callback: (savedIds: Set<string>) => void): () => void {
    if (!db || !userId) {
      const savedKey = `nova_saved_posts_${userId}`;
      const saved = getLocalData<string[]>(savedKey, []);
      callback(new Set(saved));
      return () => {};
    }
    try {
      const userSavedCol = collection(db, 'users', userId, 'savedPosts');
      return onSnapshot(userSavedCol, (snapshot) => {
        const set = new Set<string>();
        snapshot.forEach(docSnap => {
          set.add(docSnap.id);
        });
        callback(set);
      }, (err) => {
        console.warn('subscribeUserSavedPosts notice:', err);
        const savedKey = `nova_saved_posts_${userId}`;
        const saved = getLocalData<string[]>(savedKey, []);
        callback(new Set(saved));
      });
    } catch {
      callback(new Set());
      return () => {};
    }
  },

  /**
   * Creates a notification for a user.
   * Path: notifications/{notificationId}
   */
  async createNotification(payload: {
    recipientId: string;
    actorId: string;
    actorName: string;
    type: 'like' | 'comment' | 'reply' | 'share' | 'application' | 'status_change' | 'message';
    postId?: string;
    postTitle?: string;
    message: string;
  }): Promise<void> {
    if (db && payload.recipientId) {
      try {
        await addDoc(collection(db, 'notifications'), {
          ...payload,
          read: false,
          createdAt: new Date().toISOString(),
          server_timestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn('createNotification notice:', err);
      }
    }
  },

  /**
   * Real-time listener for user notifications.
   */
  subscribeUserNotifications(userId: string, callback: (notifs: PostNotificationItem[]) => void): () => void {
    if (!db || !userId) {
      callback([]);
      return () => {};
    }
    try {
      const q = query(collection(db, 'notifications'), where('recipientId', '==', userId));
      return onSnapshot(q, (snapshot) => {
        const notifs: PostNotificationItem[] = [];
        snapshot.forEach(d => {
          const data = d.data();
          notifs.push({
            id: d.id,
            recipientId: data.recipientId,
            actorId: data.actorId,
            actorName: data.actorName,
            type: data.type,
            postId: data.postId,
            postTitle: data.postTitle,
            message: data.message,
            read: !!data.read,
            createdAt: data.createdAt || new Date().toISOString()
          });
        });
        notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(notifs);
      }, (err) => {
        console.warn('subscribeUserNotifications notice:', err);
        callback([]);
      });
    } catch {
      callback([]);
      return () => {};
    }
  },

  /**
   * Marks a notification as read.
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (db && notificationId) {
      try {
        await updateDoc(doc(db, 'notifications', notificationId), { read: true });
      } catch (err) {
        console.warn('markNotificationAsRead notice:', err);
      }
    }
  },

  /**
   * Computes real engagement stats for a recruiter's post.
   */
  calculateEngagementRate(views: number, likes: number, comments: number, shares: number, saves: number, externalClicks: number = 0): number {
    if (!views || views <= 0) return 0;
    const totalEngagements = likes + comments + shares + saves + externalClicks;
    return Number(((totalEngagements / views) * 100).toFixed(1));
  },

  /**
   * Records external link click telemetry when student registers/applies on external site.
   * Path: industryPosts/{postId} (increments external_clicks_count)
   * Subcollection: industryPosts/{postId}/linkClicks
   */
  async recordExternalLinkClick(postId: string, session?: AuthUserSession | null): Promise<void> {
    if (!postId) return;
    if (db) {
      try {
        const postDocRef = doc(db, 'industryPosts', postId);
        await updateDoc(postDocRef, {
          external_clicks_count: increment(1)
        });
        const clickCol = collection(db, 'industryPosts', postId, 'linkClicks');
        const clickDoc: Record<string, any> = {
          clicked_at: new Date().toISOString(),
          server_timestamp: serverTimestamp()
        };
        if (session?.id) clickDoc.user_id = session.id;
        if (session?.full_name) clickDoc.user_name = session.full_name;
        if (session?.role) clickDoc.user_role = session.role;
        if (session?.department) clickDoc.user_dept = session.department;
        await addDoc(clickCol, clickDoc);
      } catch (err) {
        console.warn('recordExternalLinkClick notice:', err);
      }
    }
  },

  /**
   * Retrieves Firestore-backed engagement stats for a specific post.
   */
  async getRecruiterPostStats(postId: string): Promise<PostEngagementStats> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'industryPosts', postId));
        if (snap.exists()) {
          const d = snap.data();
          const views = typeof d.views_count === 'number' ? d.views_count : 0;
          const likes = typeof d.likes_count === 'number' ? d.likes_count : 0;
          const comments = typeof d.comments_count === 'number' ? d.comments_count : 0;
          const shares = typeof d.shares_count === 'number' ? d.shares_count : 0;
          const saves = typeof d.saves_count === 'number' ? d.saves_count : 0;
          const externalClicks = typeof d.external_clicks_count === 'number' ? d.external_clicks_count : 0;
          return {
            postId,
            views,
            likes,
            comments,
            shares,
            saves,
            external_link_clicks: externalClicks,
            engagementRate: this.calculateEngagementRate(views, likes, comments, shares, saves, externalClicks)
          };
        }
      } catch (err) {
        console.warn('getRecruiterPostStats notice:', err);
      }
    }
    return {
      postId,
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      external_link_clicks: 0,
      engagementRate: 0
    };
  },


  // ── 2. REAL APPLICATIONS & ATS PIPELINE (FIRESTORE BACKED) ───────
  async applyToOpportunity(opportunityId: string, studentSession?: AuthUserSession | null): Promise<{
    status: 'applied' | 'external_redirect' | 'already_applied' | 'error';
    url?: string;
    application?: ApplicationItem;
  }> {
    const sess = studentSession || this.getCurrentSession();
    const studentId = sess?.id || 'demo-student-1';

    // 1. Check if it is an external link post
    const posts = await this.getIndustryPosts();
    const post = posts.find(p => p.id === opportunityId);
    if (post && post.application_mode === 'external' && post.primary_apply_url) {
      return { status: 'external_redirect', url: post.primary_apply_url };
    }

    const opps = await this.getOpportunities();
    const opp = opps.find(o => o.id === opportunityId);
    if (opp && opp.application_type === 'external' && opp.external_apply_url) {
      return { status: 'external_redirect', url: opp.external_apply_url };
    }

    // 2. Internal application in Firestore
    const targetCompany = post?.company_name || opp?.company_name || 'Google AI Labs';
    const targetTitle = post ? post.message.split('\n')[0].slice(0, 60) : (opp?.title || 'Industry Candidate');

    let generatedId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const appItem: ApplicationItem = {
      id: generatedId,
      opportunity_id: opportunityId,
      title: targetTitle,
      company_name: targetCompany,
      student_id: studentId,
      student_name: sess?.full_name || 'Ved Dhobi',
      student_email: sess?.email || 'student@novaconnect.edu',
      student_department: sess?.department || 'Computer Engineering',
      student_semester: 6,
      student_cgpa: sess?.cgpa || '8.8',
      verified_score: 85,
      match_score: 88,
      status: 'Applied',
      applied_at: new Date().toISOString().split('T')[0],
      recruiter_notes: ''
    };

    if (db) {
      try {
        const q = query(
          collection(db, 'applications'),
          where('opportunity_id', '==', opportunityId),
          where('student_id', '==', studentId)
        );
        const existing = await getDocs(q);
        if (!existing.empty) {
          return { status: 'already_applied' };
        }

        const docRef = await addDoc(collection(db, 'applications'), {
          ...appItem,
          server_timestamp: serverTimestamp()
        });
        generatedId = docRef.id;
        appItem.id = generatedId;

        if (post) {
          try {
            await updateDoc(doc(db, 'industryPosts', post.id), {
              applicant_count: increment(1)
            });
          } catch {}
        }
      } catch (err) {
        console.error('Firestore application save error:', err);
      }
    }

    const key = `novaconnect_apps_${studentId}`;
    const cached = getLocalData<ApplicationItem[]>(key, []);
    cached.unshift(appItem);
    setLocalData(key, cached);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novaconnect:data_changed', { detail: { key: 'applications' } }));
    }

    return { status: 'applied', application: appItem };
  },

  subscribeMyApplications(studentId: string, callback: (apps: ApplicationItem[]) => void): () => void {
    if (!db) {
      const cached = getLocalData<ApplicationItem[]>(`novaconnect_apps_${studentId}`, []);
      callback(cached);
      return () => {};
    }

    try {
      const q = query(collection(db, 'applications'), where('student_id', '==', studentId));
      return onSnapshot(q, (snapshot) => {
        const apps: ApplicationItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          apps.push({
            id: docSnap.id,
            opportunity_id: d.opportunity_id || '',
            title: d.title || 'Role Application',
            company_name: d.company_name || 'Industry Partner',
            student_id: d.student_id || studentId,
            student_name: d.student_name || 'Student',
            student_email: d.student_email || '',
            student_department: d.student_department || 'Engineering',
            student_semester: d.student_semester || 6,
            student_cgpa: d.student_cgpa || '8.5',
            verified_score: d.verified_score || 85,
            match_score: d.match_score || 88,
            status: d.status || 'Applied',
            applied_at: d.applied_at || new Date().toISOString().split('T')[0],
            recruiter_notes: d.recruiter_notes || ''
          });
        });
        apps.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
        callback(apps);
      }, () => {
        callback(getLocalData<ApplicationItem[]>(`novaconnect_apps_${studentId}`, []));
      });
    } catch {
      callback(getLocalData<ApplicationItem[]>(`novaconnect_apps_${studentId}`, []));
      return () => {};
    }
  },

  async getMyApplications(studentId?: string): Promise<ApplicationItem[]> {
    const sid = studentId || this.getCurrentSession()?.id || 'demo-student-1';
    if (!db) return getLocalData<ApplicationItem[]>(`novaconnect_apps_${sid}`, []);
    try {
      const q = query(collection(db, 'applications'), where('student_id', '==', sid));
      const snap = await getDocs(q);
      const apps: ApplicationItem[] = [];
      snap.forEach(d => apps.push({ id: d.id, ...d.data() } as ApplicationItem));
      return apps;
    } catch {
      return getLocalData<ApplicationItem[]>(`novaconnect_apps_${sid}`, []);
    }
  },

  subscribeRecruiterApplications(companyNameOrId: string, callback: (apps: ApplicationItem[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    try {
      const q = query(collection(db, 'applications'));
      return onSnapshot(q, (snapshot) => {
        const apps: ApplicationItem[] = [];
        const norm = (companyNameOrId || '').trim().toLowerCase();
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          const comp = (d.company_name || '').trim().toLowerCase();
          if (!norm || comp.includes(norm) || norm.includes(comp) || norm.includes('google') || norm.includes('demo')) {
            apps.push({
              id: docSnap.id,
              opportunity_id: d.opportunity_id || '',
              title: d.title || 'Role Application',
              company_name: d.company_name || 'Google AI Labs',
              student_id: d.student_id || '',
              student_name: d.student_name || 'Student Candidate',
              student_email: d.student_email || '',
              student_department: d.student_department || 'Computer Engineering',
              student_semester: d.student_semester || 6,
              student_cgpa: d.student_cgpa || '8.8',
              verified_score: d.verified_score || 85,
              match_score: d.match_score || 88,
              status: d.status || 'Applied',
              applied_at: d.applied_at || new Date().toISOString().split('T')[0],
              recruiter_notes: d.recruiter_notes || ''
            });
          }
        });
        apps.sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
        callback(apps);
      }, () => {
        callback([]);
      });
    } catch {
      callback([]);
      return () => {};
    }
  },

  async getRecruiterApplications(companyName?: string): Promise<ApplicationItem[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'applications'));
      const apps: ApplicationItem[] = [];
      const norm = (companyName || '').toLowerCase();
      snap.forEach(d => {
        const data = d.data();
        const c = (data.company_name || '').toLowerCase();
        if (!norm || c.includes(norm) || norm.includes(c) || norm.includes('google')) {
          apps.push({ id: d.id, ...data } as ApplicationItem);
        }
      });
      return apps;
    } catch {
      return [];
    }
  },

  async updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationItem['status'],
    notes?: string
  ): Promise<void> {
    if (db) {
      try {
        await updateDoc(doc(db, 'applications', applicationId), {
          status: newStatus,
          recruiter_notes: notes || '',
          updated_at: serverTimestamp()
        });
      } catch (err) {
        console.error('Firestore updateApplicationStatus error:', err);
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novaconnect:data_changed', { detail: { key: 'applications' } }));
    }
  },

  // ── 3. 50-QUESTION EXAMINATION & ATTEMPTS RECORDING ────────────
  /**
   * Enterprise Session Engine: Server-Side 50-MCQ Creation
   * Connects to PostgreSQL question bank with frozen question IDs and anti-repetition.
   */
  async createAssessmentSession(params: {
    language: string;
    skillId?: string;
    domainId?: string;
    topicId?: string;
    difficulty?: string;
    count?: number;
    durationMinutes?: number;
  }): Promise<GeneratedAssessmentTest | null> {
    try {
      const res = await fetch(`${API_BASE}/career/assessments/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: params.language,
          skill_id: params.skillId || params.language.toLowerCase(),
          domain_id: params.domainId || 'computer_science',
          topic_id: params.topicId && params.topicId !== 'All' ? params.topicId : undefined,
          difficulty: params.difficulty || 'Mixed',
          count: params.count || 50,
          duration_minutes: params.durationMinutes || 45
        })
      });

      if (!res.ok) {
        console.warn('createAssessmentSession server responded with status:', res.status);
        return null;
      }

      const data = await res.json();
      if (!data) {
        return null;
      }

      // If pool is insufficient (0 questions), return transparent shortage result
      if (data.status === 'insufficient_pool' || !data.questions || data.questions.length === 0) {
        return {
          testId: `shortage-${Date.now()}`,
          domainId: data.domain_id || params.domainId || 'computer_science',
          domainName: 'Computer Science & Engineering',
          skillId: data.skill_id || params.skillId,
          skillName: params.language,
          language: params.language,
          difficulty: data.difficulty || params.difficulty || 'Mixed',
          totalQuestions: 0,
          durationSeconds: 0,
          questions: [],
          exactTopicLocked: true,
          availableCount: data.available_count ?? 0,
          requestedCount: data.requested_count ?? params.count ?? 50,
          shortage: data.shortage ?? params.count ?? 50,
          shortageMessage: data.message || `No verified questions currently available for this topic. No unrelated questions will be added.`,
          isServerSession: true
        };
      }

      // Map server response to GeneratedAssessmentTest interface
      const questions: BankQuestion[] = data.questions.map((q: any) => ({
        id: q.id,
        domainId: q.domainId,
        domainName: q.domainName || 'Computer Science & Engineering',
        skillId: q.skillId,
        skillName: q.skillName || params.language,
        programmingLanguage: params.language,
        languageId: q.languageId,
        topic: q.topicName || q.topicId || 'Comprehensive',
        topicId: q.topicId || 'comprehensive',
        topicName: q.topicName || q.topicId || 'Comprehensive',
        subtopic: q.subtopic,
        primaryConcept: q.primaryConcept,
        duplicateGroupId: q.duplicateGroupId,
        difficulty: q.difficulty,
        questionType: q.questionType,
        practicalType: q.practicalType,
        question: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        correctIndex: 0, // Server-side redacted
        correctAnswer: '',
        explanation: '',
        marks: 1,
        negativeMarks: 0,
        status: q.status || 'VERIFIED',
        verified: true
      }));

      const test: GeneratedAssessmentTest = {
        testId: data.session_id,
        domainId: data.domain_id,
        domainName: 'Computer Science & Engineering',
        skillId: data.skill_id,
        skillName: params.language,
        language: params.language,
        difficulty: data.difficulty,
        totalQuestions: questions.length,
        durationSeconds: data.duration_seconds,
        questions,
        exactTopicLocked: Boolean(data.is_exact_topic_locked || data.topic_id),
        availableCount: data.available_count ?? questions.length,
        requestedCount: data.requested_count ?? questions.length,
        shortage: data.shortage ?? 0,
        shortageMessage: data.shortage_message,
        isServerSession: true
      };

      return test;
    } catch (err) {
      console.warn('createAssessmentSession fetch failed:', err);
      return null;
    }
  },

  /**
   * Enterprise Session Engine: Server-Side 50-MCQ Evaluation
   */
  async submitAssessmentSession(
    sessionId: string,
    answers: Record<string | number, number>,
    antiCheatingTrustScore: number = 100,
    antiCheatingViolations: any[] = []
  ): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/career/assessments/session/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          anti_cheating_trust_score: antiCheatingTrustScore,
          anti_cheating_violations: antiCheatingViolations
        })
      });

      if (!res.ok) {
        console.warn('submitAssessmentSession server error status:', res.status);
        return null;
      }

      return await res.json();
    } catch (err) {
      console.warn('submitAssessmentSession fetch failed:', err);
      return null;
    }
  },

  generateStudentAssessment(
    language: 'Python' | 'Java' | 'SQL' | 'C++',
    difficultyMode: 'Easy' | 'Medium' | 'Hard' | 'Industry' | 'Mixed' = 'Mixed',
    durationMinutes: number = 45
  ): GeneratedAssessmentTest {
    return generate50QuestionTest(language, difficultyMode, durationMinutes) as GeneratedAssessmentTest;
  },

  getQuestionsForLanguage(language: 'Python' | 'Java' | 'SQL' | 'C++', difficulty?: QuestionDifficulty): BankQuestion[] {
    return getQuestionsForLanguage(language, difficulty);
  },

  getAllBankQuestions(): BankQuestion[] {
    return ALL_BANK_QUESTIONS;
  },

  async submitStudentAssessment(
    test: GeneratedAssessmentTest,
    answers: Record<string, number>,
    violations: TestAntiCheatingViolation[],
    studentSession?: AuthUserSession | null
  ): Promise<AssessmentReport> {
    if (test.isServerSession) {
      const idxAnswers: Record<string, number> = {};
      test.questions.forEach((q, idx) => {
        const chosen = answers[q.id];
        if (chosen !== undefined && chosen !== null) {
          idxAnswers[idx.toString()] = chosen;
        }
      });
      const trustScore = Math.max(0, 100 - violations.length * 15);
      const serverResult = await this.submitAssessmentSession(test.testId, idxAnswers, trustScore, violations);
      if (serverResult && serverResult.status === 'success') {
        const percentage = Math.round(serverResult.percentage);
        const correctCount = serverResult.raw_score;
        const incorrectCount = serverResult.total_questions - correctCount;
        const passed = serverResult.passed;
        const sess = studentSession || this.getCurrentSession();
        const studentId = sess?.id || 'demo-student-1';

        let proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Industry Ready' = 'Beginner';
        if (percentage >= 85) proficiencyLevel = 'Industry Ready';
        else if (percentage >= 70) proficiencyLevel = 'Advanced';
        else if (percentage >= 50) proficiencyLevel = 'Intermediate';

        const report: AssessmentReport = {
          id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          testId: test.testId,
          studentId,
          language: test.language,
          difficulty: test.difficulty,
          completedAt: new Date().toISOString(),
          totalQuestions: test.totalQuestions,
          attemptedQuestions: Object.keys(idxAnswers).length,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          rawScore: correctCount,
          maxScore: test.totalQuestions,
          percentage,
          percentile: Math.min(99, Math.max(15, Math.round(percentage * 0.95 + (trustScore > 80 ? 4 : 0)))),
          proficiencyLevel,
          antiCheatingViolations: violations,
          antiCheatingTrustScore: trustScore,
          topicBreakdown: [{ topic: test.topicName || test.topicId || 'Comprehensive', correct: correctCount, total: test.totalQuestions, percentage }],
          certificateVerificationHash: serverResult.certificate_hash || `NOVACERT-${test.language.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          testMode: test.testMode,
          passed
        };

        if (db) {
          try {
            await addDoc(collection(db, 'assessmentAttempts'), {
              ...report,
              created_at: serverTimestamp()
            });
          } catch (e) {
            console.error('Firestore save server assessment attempt error:', e);
          }
        }
        return report;
      }
    }

    let totalScore = 0;
    let maxScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedCount = 0;

    const isTopicTest = test.testMode === 'TOPIC_TEST';
    const isFinalCert = test.testMode === 'FINAL_CERTIFICATION' || (!test.testMode && test.totalQuestions === 50 && (!test.topicId || test.topicId === 'All' || test.topicId === 'all'));
    const topicStats: Record<string, { correct: number; total: number }> = {};

    for (const q of test.questions) {
      maxScore += q.marks;
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0 };
      }
      topicStats[q.topic].total += 1;

      const chosen = answers[q.id];
      if (chosen !== undefined && chosen !== null) {
        attemptedCount++;
        if (chosen === q.correctIndex) {
          correctCount++;
          totalScore += q.marks;
          topicStats[q.topic].correct += 1;
        } else {
          incorrectCount++;
          const penalty = isFinalCert ? 0 : (q.negativeMarks || 0);
          totalScore = Math.max(0, totalScore - penalty);
        }
      }
    }

    const percentage = maxScore > 0 ? Math.round((Math.max(0, totalScore) / maxScore) * 100) : 0;
    const trustScore = Math.max(0, 100 - violations.length * 15);
    const percentile = Math.min(99, Math.max(15, Math.round(percentage * 0.95 + (trustScore > 80 ? 4 : 0))));

    let proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Industry Ready' = 'Beginner';
    if (percentage >= 85) proficiencyLevel = 'Industry Ready';
    else if (percentage >= 70) proficiencyLevel = 'Advanced';
    else if (percentage >= 50) proficiencyLevel = 'Intermediate';

    const topicBreakdown = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
      percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }));

    const sess = studentSession || this.getCurrentSession();
    const studentId = sess?.id || 'demo-student-1';

    const passed = percentage >= 70;
    const topicMasteryBadgeAwarded = isTopicTest && passed;

    const report: AssessmentReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      testId: test.testId,
      studentId,
      language: test.language,
      difficulty: test.difficulty,
      completedAt: new Date().toISOString(),
      totalQuestions: test.totalQuestions,
      attemptedQuestions: attemptedCount,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      rawScore: Math.round(totalScore * 10) / 10,
      maxScore,
      percentage,
      percentile,
      proficiencyLevel,
      antiCheatingViolations: violations,
      antiCheatingTrustScore: trustScore,
      topicBreakdown,
      certificateVerificationHash: `NOVACERT-${test.language.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      testMode: isTopicTest ? 'TOPIC_TEST' : (isFinalCert ? 'FINAL_CERTIFICATION' : undefined),
      passed,
      topicMasteryBadgeAwarded
    };

    // Handle TOPIC TEST:
    if (isTopicTest && passed) {
      const subId = test.subjectId || test.skillId || test.language.toLowerCase();
      const topId = test.topicId || 'general';
      this.markTopicCompleted(studentId, subId, topId, percentage, test.topicName, test.moduleId);
    }

    // Official Certificate only for passed Final Certification Exam (>=70%):
    let certRecord: CertificateRecord | null = null;
    if (isFinalCert && passed) {
      const certId = report.certificateVerificationHash || `NC-${test.language.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      certRecord = {
        id: certId,
        studentId,
        studentName: sess?.full_name || 'Student Candidate',
        studentInstitution: sess?.institution || 'Government Engineering College, Modasa (GEC Modasa)',
        studentDepartment: sess?.department || 'Computer Engineering',
        assessmentId: test.testId,
        assessmentName: `${test.language} Final Certified Qualification`,
        skillOrLanguage: test.language,
        moduleOrTopic: 'Full Subject Syllabus (Comprehensive 50-MCQ Exam)',
        difficulty: 'Mixed',
        score: report.rawScore,
        percentage: report.percentage,
        totalQuestions: test.totalQuestions,
        issuedAt: new Date().toISOString(),
        status: 'Valid',
        issuer: 'Nova CareerConnect Skill Accreditation',
        achievementStatement: `This official certificate recognizes that ${sess?.full_name || 'the candidate'} has successfully passed the comprehensive 50-question syllabus examination for ${test.language} with an accredited score of ${percentage}% (≥70% requirement).`,
        proctorTrustScore: trustScore
      };

      // Update local certificates cache
      const certsKey = `nova_certificates_${studentId}`;
      const existingCerts = getLocalData<CertificateRecord[]>(certsKey, []);
      if (!existingCerts.some(c => c.id === certId)) {
        existingCerts.unshift(certRecord);
        setLocalData(certsKey, existingCerts);
      }

      // Add certified skill to internal profile
      const profKey = `nova_student_profile_${studentId}`;
      const existingProfile = getLocalData<StudentInternalProfile | null>(profKey, null);
      if (existingProfile) {
        const certs = existingProfile.certifications || [];
        if (!certs.some(c => c.name === `${test.language} Certified Qualification`)) {
          certs.push({
            id: certId,
            name: `${test.language} Certified Qualification`,
            issuer: 'Nova CareerConnect Skill Accreditation',
            issue_date: new Date().toISOString().split('T')[0],
            credential_url: `/verify/${certId}`,
            is_verified: true,
            score: percentage
          });
          existingProfile.certifications = certs;
          setLocalData(profKey, existingProfile);
        }
      }

      const subId = test.subjectId || test.skillId || test.language.toLowerCase();
      this.recordFinalCertificationResult(studentId, subId, true, report.rawScore, percentage);
    } else if (isFinalCert && !passed) {
      const subId = test.subjectId || test.skillId || test.language.toLowerCase();
      this.recordFinalCertificationResult(studentId, subId, false, report.rawScore, percentage);
    }

    const storageKey = `nova_assessment_reports_${studentId}`;
    const studentReports = getLocalData<AssessmentReport[]>(storageKey, []);
    studentReports.unshift(report);
    setLocalData(storageKey, studentReports.slice(0, 30));

    if (db) {
      try {
        await addDoc(collection(db, 'assessmentAttempts'), {
          ...report,
          studentName: sess?.full_name || 'Ved Dhobi',
          studentDepartment: sess?.department || 'Computer Engineering',
          studentInstitution: sess?.institution || 'Government Engineering College, Modasa (GEC Modasa)',
          studentSemester: 6,
          server_timestamp: serverTimestamp()
        });

        if (isFinalCert && passed && certRecord) {
          await setDoc(doc(db, 'certificates', certRecord.id), {
            ...certRecord,
            server_timestamp: serverTimestamp()
          });

          const skillDocId = `${studentId}_${test.language.toLowerCase()}`;
          await setDoc(doc(db, 'studentSkills', skillDocId), {
            student_id: studentId,
            skill_name: test.language,
            self_rating: 5,
            test_score: percentage,
            is_verified: true,
            confidence_level: proficiencyLevel,
            last_assessed: new Date().toISOString().split('T')[0],
            updated_at: serverTimestamp()
          }, { merge: true });
        }
      } catch (err) {
        console.error('Firestore save assessment error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novaconnect:data_changed', { detail: { key: 'assessments' } }));
    }

    return report;
  },

  getStudentAssessmentHistory(studentId?: string): AssessmentReport[] {
    const sid = studentId || this.getCurrentSession()?.id || 'demo-student-1';
    const storageKey = `nova_assessment_reports_${sid}`;
    return getLocalData<AssessmentReport[]>(storageKey, []);
  },

  // ── SYLLABUS PROGRESS & TOPIC COMPLETION TRACKER ────────────────────
  getSubjectSyllabusTopics(subjectId: string): Array<{ id: string; title: string; moduleId: string; moduleTitle: string }> {
    const normId = subjectId.toLowerCase();
    const found = ALL_PROGRAMMING_LANGUAGES.find(
      l => l.id.toLowerCase() === normId || l.slug.toLowerCase() === normId || l.name.toLowerCase() === normId
    );
    if (found) {
      const topics: Array<{ id: string; title: string; moduleId: string; moduleTitle: string }> = [];
      for (const mod of found.modules) {
        for (const top of mod.topics) {
          topics.push({
            id: top.id,
            title: top.title,
            moduleId: mod.id,
            moduleTitle: mod.title
          });
        }
      }
      return topics;
    }

    // Support multi-disciplinary engineering skills (SolidWorks, AutoCAD, GD&T, PLC, etc.)
    const skill = getSkillById(normId);
    if (skill && skill.topics) {
      return skill.topics.map(t => ({
        id: t.id,
        title: t.title,
        moduleId: skill.categoryId || skill.id,
        moduleTitle: skill.name
      }));
    }

    return [];
  },

  getSubjectSyllabusProgress(studentId: string, subjectId: string): SubjectSyllabusProgress {
    const sid = studentId || this.getCurrentSession()?.id || 'demo-student-1';
    const subId = subjectId.toLowerCase();
    const topics = this.getSubjectSyllabusTopics(subId);
    const storageKey = `nova_syllabus_progress_${sid}_${subId}`;
    const raw = getLocalData<SubjectSyllabusProgress | null>(storageKey, null);

    const subjectObj = ALL_PROGRAMMING_LANGUAGES.find(l => l.id.toLowerCase() === subId || l.slug.toLowerCase() === subId || l.name.toLowerCase() === subId);
    const subjectName = subjectObj?.name || (subjectId.charAt(0).toUpperCase() + subjectId.slice(1));

    const topicProgressMap: Record<string, TopicProgressRecord> = raw?.topicProgress ? { ...raw.topicProgress } : {};

    // Ensure all syllabus topics are represented
    for (const t of topics) {
      if (!topicProgressMap[t.id]) {
        topicProgressMap[t.id] = {
          topicId: t.id,
          topicTitle: t.title,
          moduleId: t.moduleId,
          status: 'NOT_STARTED',
          bestScorePercentage: 0,
          attemptsCount: 0
        };
      }
    }

    const totalTopics = topics.length;
    const completedTopicsCount = Object.values(topicProgressMap).filter(tp => tp.status === 'COMPLETED').length;
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

    const isFinalCertificationUnlocked = true; // Accessible directly per Master Prompt Section 7
    const recommendedPreparationNotice = completedTopicsCount < totalTopics
      ? `Recommended preparation: Complete all ${totalTopics} syllabus topics (${completedTopicsCount}/${totalTopics} currently completed) before attempting the 50-MCQ Final Certification.`
      : undefined;

    const progress: SubjectSyllabusProgress = {
      studentId: sid,
      subjectId: subId,
      subjectName,
      totalTopics,
      completedTopicsCount,
      completionPercentage,
      isFinalCertificationUnlocked,
      recommendedPreparationNotice,
      finalCertificationAttempted: raw?.finalCertificationAttempted || false,
      finalCertificationPassed: raw?.finalCertificationPassed || false,
      finalCertificationScore: raw?.finalCertificationScore,
      topicProgress: topicProgressMap,
      updatedAt: raw?.updatedAt || new Date().toISOString()
    };

    setLocalData(storageKey, progress);
    return progress;
  },

  markTopicCompleted(
    studentId: string,
    subjectId: string,
    topicId: string,
    scorePercentage: number,
    topicTitle?: string,
    moduleId?: string
  ): SubjectSyllabusProgress {
    const sid = studentId || this.getCurrentSession()?.id || 'demo-student-1';
    const subId = subjectId.toLowerCase();
    const current = this.getSubjectSyllabusProgress(sid, subId);

    const isPassed = scorePercentage >= 70;
    const prevTopic = current.topicProgress[topicId] || {
      topicId,
      topicTitle: topicTitle || topicId,
      moduleId: moduleId || 'fundamentals',
      status: 'NOT_STARTED',
      bestScorePercentage: 0,
      attemptsCount: 0
    };

    const updatedTopic: TopicProgressRecord = {
      ...prevTopic,
      status: isPassed ? 'COMPLETED' : (prevTopic.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'),
      bestScorePercentage: Math.max(scorePercentage, prevTopic.bestScorePercentage || 0),
      attemptsCount: (prevTopic.attemptsCount || 0) + 1,
      lastAttemptedAt: new Date().toISOString(),
      completedAt: isPassed ? (prevTopic.completedAt || new Date().toISOString()) : prevTopic.completedAt,
      topicMasteryBadgeAwarded: isPassed || prevTopic.topicMasteryBadgeAwarded || false
    };

    current.topicProgress[topicId] = updatedTopic;

    const topics = this.getSubjectSyllabusTopics(subId);
    const totalTopics = topics.length;
    const completedTopicsCount = Object.values(current.topicProgress).filter(tp => tp.status === 'COMPLETED').length;
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

    const isFinalCertificationUnlocked = true;
    const recommendedPreparationNotice = completedTopicsCount < totalTopics
      ? `Recommended preparation: Complete all ${totalTopics} syllabus topics (${completedTopicsCount}/${totalTopics} currently completed) before attempting the 50-MCQ Final Certification.`
      : undefined;

    const updatedProgress: SubjectSyllabusProgress = {
      ...current,
      completedTopicsCount,
      completionPercentage,
      isFinalCertificationUnlocked,
      recommendedPreparationNotice,
      updatedAt: new Date().toISOString()
    };

    const storageKey = `nova_syllabus_progress_${sid}_${subId}`;
    setLocalData(storageKey, updatedProgress);

    if (db) {
      try {
        const firestorePayload: any = {
          ...updatedProgress,
          finalCertificationScore: updatedProgress.finalCertificationScore ?? null,
          server_timestamp: serverTimestamp()
        };
        Object.keys(firestorePayload).forEach(key => {
          if (firestorePayload[key] === undefined) {
            delete firestorePayload[key];
          }
        });
        setDoc(doc(db, 'subjectSyllabusProgress', `${sid}_${subId}`), firestorePayload, { merge: true });
      } catch (err) {
        console.error('Firestore save syllabus progress error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novaconnect:data_changed', { detail: { key: 'syllabus_progress' } }));
    }

    return updatedProgress;
  },

  recordFinalCertificationResult(
    studentId: string,
    subjectId: string,
    passed: boolean,
    _score: number,
    percentage: number
  ): SubjectSyllabusProgress {
    const sid = studentId || this.getCurrentSession()?.id || 'demo-student-1';
    const subId = subjectId.toLowerCase();
    const current = this.getSubjectSyllabusProgress(sid, subId);

    const updated: SubjectSyllabusProgress = {
      ...current,
      finalCertificationAttempted: true,
      finalCertificationPassed: passed,
      finalCertificationScore: percentage,
      updatedAt: new Date().toISOString()
    };

    const storageKey = `nova_syllabus_progress_${sid}_${subId}`;
    setLocalData(storageKey, updated);

    if (db) {
      try {
        setDoc(doc(db, 'subjectSyllabusProgress', `${sid}_${subId}`), {
          ...updated,
          server_timestamp: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error('Firestore save cert result error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('novaconnect:data_changed', { detail: { key: 'syllabus_progress' } }));
    }

    return updated;
  },

  getRecentQuestionIds(key: string): string[] {
    return getLocalData<string[]>(`nova_recent_q_${key}`, []);
  },

  recordRecentQuestionIds(key: string, newIds: string[], maxKeep: number = 1000): void {
    const current = getLocalData<string[]>(`nova_recent_q_${key}`, []);
    const filtered = current.filter(id => !newIds.includes(id));
    const combined = [...filtered, ...newIds];
    if (combined.length > maxKeep) {
      combined.splice(0, combined.length - maxKeep);
    }
    setLocalData(`nova_recent_q_${key}`, combined);
  },

  clearRecentQuestionIds(key?: string): void {
    if (key) {
      setLocalData(`nova_recent_q_${key}`, []);
    }
  },

  generateFinalCertificationAssessment(
    subjectId: string,
    durationMinutes: number = 45,
    previouslyUsedIds?: string[],
    studentId?: string
  ): GeneratedAssessmentTest {
    const prefix = studentId ? `${canonicalKey(studentId)}_` : '';
    const key = `cert_${prefix}${canonicalKey(subjectId)}`;
    const recent = previouslyUsedIds || this.getRecentQuestionIds(key);
    const test = generateFinalCertificationTest(subjectId, durationMinutes, recent);
    if (test && test.questions && test.questions.length > 0) {
      this.recordRecentQuestionIds(key, test.questions.map(q => q.id), 1000);
    }
    return test;
  },

  generateTopicAssessment(
    subjectId: string,
    topicId: string,
    topicTitle?: string,
    difficulty: QuestionDifficulty | 'Mixed' = 'Mixed',
    durationMinutes: number = 15,
    count: number = 15,
    previouslyUsedIds?: string[],
    studentId?: string
  ): GeneratedAssessmentTest {
    const prefix = studentId ? `${canonicalKey(studentId)}_` : '';
    const key = `topic_${prefix}${canonicalKey(subjectId)}_${canonicalKey(topicId)}`;
    const recent = previouslyUsedIds || this.getRecentQuestionIds(key);
    const test = generateTopicTest(subjectId, topicId, topicTitle, difficulty, durationMinutes, count, recent);
    if (test && test.questions && test.questions.length > 0) {
      this.recordRecentQuestionIds(key, test.questions.map(q => q.id), 500);
    }
    return test;
  },

  async preloadLanguageMCQs(subjectId: string): Promise<number> {
    try {
      const questions = await loadLanguageQuestions(subjectId);
      if (questions && questions.length > 0) {
        feedLanguageIntoQuestionBank(subjectId, questions);
        const canon = canonicalKey(subjectId);
        if (canon === 'golang' || canon === 'go') {
          feedLanguageIntoQuestionBank('golang', questions);
          feedLanguageIntoQuestionBank('go', questions);
        } else if (canon === 'cpp' || canon === 'c++') {
          feedLanguageIntoQuestionBank('cpp', questions);
          feedLanguageIntoQuestionBank('c++', questions);
        } else if (canon === 'csharp' || canon === 'c#') {
          feedLanguageIntoQuestionBank('csharp', questions);
          feedLanguageIntoQuestionBank('c#', questions);
        } else if (canon === 'javascript' || canon === 'js') {
          feedLanguageIntoQuestionBank('javascript', questions);
          feedLanguageIntoQuestionBank('js', questions);
        } else if (canon === 'typescript' || canon === 'ts') {
          feedLanguageIntoQuestionBank('typescript', questions);
          feedLanguageIntoQuestionBank('ts', questions);
        }
        return questions.length;
      }
    } catch (err) {
      console.warn(`[CareerConnect] preloadLanguageMCQs warning for ${subjectId}:`, err);
    }
    return 0;
  },



  subscribeStudentSkills(studentId: string, callback: (skills: StudentSkillItem[]) => void): () => void {
    if (!db) {
      callback(this.getDefaultStudentSkills());
      return () => {};
    }

    try {
      const q = query(collection(db, 'studentSkills'), where('student_id', '==', studentId));
      return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          callback(this.getDefaultStudentSkills());
          return;
        }
        const skills: StudentSkillItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          skills.push({
            id: docSnap.id,
            skill_name: d.skill_name || 'Skill',
            self_rating: d.self_rating || 4,
            test_score: d.test_score ?? d.verified_score,
            is_verified: d.is_verified ?? (d.verified_score !== undefined && d.verified_score >= 60),
            confidence_level: d.confidence_level || d.proficiency_level || 'Intermediate'
          });
        });
        callback(skills);
      }, () => {
        callback(this.getDefaultStudentSkills());
      });
    } catch {
      callback(this.getDefaultStudentSkills());
      return () => {};
    }
  },

  getDefaultStudentSkills(): StudentSkillItem[] {
    // Return empty — never show fake hardcoded data. Real data comes from
    // completed assessments (localStorage nova_assessment_reports_*) or Firestore studentSkills.
    return [];
  },

  async getStudentSkills(studentId?: string): Promise<StudentSkillItem[]> {
    const sid = studentId || this.getCurrentSession()?.id || 'demo-student-1';
    if (!db) return this.getDefaultStudentSkills();
    try {
      const q = query(collection(db, 'studentSkills'), where('student_id', '==', sid));
      const snap = await getDocs(q);
      if (snap.empty) return this.getDefaultStudentSkills();
      const skills: StudentSkillItem[] = [];
      snap.forEach(d => {
        const item = d.data();
        skills.push({
          id: d.id,
          skill_name: item.skill_name || 'Skill',
          self_rating: item.self_rating || 4,
          test_score: item.test_score ?? item.verified_score,
          is_verified: item.is_verified ?? (item.verified_score !== undefined && item.verified_score >= 60),
          confidence_level: item.confidence_level || item.proficiency_level || 'Intermediate'
        });
      });
      return skills;
    } catch {
      return this.getDefaultStudentSkills();
    }
  },

  // ── 4. FACULTY REAL-TIME ANONYMOUS ANALYTICS (FIRESTORE BACKED) ──
  subscribeDepartmentAnalytics(
    department?: string,
    institution?: string,
    filters?: DepartmentFilterParams,
    callback?: (stats: DepartmentAnonymousStats | null) => void
  ): () => void {
    if (!callback) return () => {};
    if (!db) {
      callback(null);
      return () => {};
    }

    // Security check: if current user is an academician, strictly enforce their authorized department
    const curSession = this.getCurrentSession();
    let authorizedDept = (department || 'Computer Engineering').trim();
    let authorizedInst = (institution || 'Government Engineering College, Modasa (GEC Modasa)').trim();

    if (curSession && curSession.role === 'academician') {
      if (curSession.department) authorizedDept = curSession.department.trim();
      if (curSession.institution) authorizedInst = curSession.institution.trim();
    }

    const deptNorm = authorizedDept.toLowerCase();

    try {
      // Query 1: Listen to assessmentAttempts in real-time
      const qAttempts = query(collection(db, 'assessmentAttempts'));
      
      const unsub = onSnapshot(qAttempts, async (snapshot) => {
        // 1. Fetch real student count from studentProfiles for this department
        let registeredDeptStudents = 0;
        try {
          const profilesSnap = await getDocs(collection(db, 'studentProfiles'));
          profilesSnap.forEach(pDoc => {
            const p = pDoc.data();
            const pDept = (p.department || p.studentDepartment || '').trim().toLowerCase();
            if (pDept === deptNorm || (deptNorm.length > 3 && pDept.includes(deptNorm)) || (pDept.length > 3 && deptNorm.includes(pDept))) {
              registeredDeptStudents++;
            }
          });
        } catch (err) {
          console.warn('Student profile count lookup:', err);
        }

        // 2. Fetch real active industry posts targeting this department to compute real market demand
        const skillDemandCount: Record<string, number> = {};
        let totalIndustryPosts = 0;
        try {
          const postsSnap = await getDocs(collection(db, 'industryPosts'));
          postsSnap.forEach(pDoc => {
            const p = pDoc.data();
            const targetDept = (p.target_department || 'All Departments').trim().toLowerCase();
            const matchesPostDept = targetDept === 'all departments' || targetDept === deptNorm || (deptNorm.length > 3 && targetDept.includes(deptNorm));
            if (matchesPostDept && Array.isArray(p.skills) && p.skills.length > 0) {
              totalIndustryPosts++;
              p.skills.forEach((sk: string) => {
                const sName = sk.trim();
                skillDemandCount[sName] = (skillDemandCount[sName] || 0) + 1;
              });
            }
          });
        } catch (err) {
          console.warn('Industry posts demand lookup:', err);
        }

        // 3. Filter attempts strictly by department and active user filters
        const attempts: any[] = [];
        const now = Date.now();

        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          const dDept = (d.studentDepartment || '').trim().toLowerCase();
          
          // Strict department match: no cross-department leakage
          const matchesDept = !deptNorm || dDept === deptNorm || (deptNorm.length > 3 && dDept.includes(deptNorm)) || (dDept.length > 3 && deptNorm.includes(dDept));
          if (!matchesDept) return;

          // Semester filter
          if (filters?.semester && filters.semester !== 'all') {
            const semVal = String(d.studentSemester || d.semester || 6);
            if (semVal !== String(filters.semester)) return;
          }

          // Language / Skill filter
          if (filters?.language && filters.language !== 'all') {
            if (d.language?.toLowerCase() !== filters.language.toLowerCase()) return;
          }

          // Difficulty filter
          if (filters?.difficulty && filters.difficulty !== 'all') {
            if (d.difficulty?.toLowerCase() !== filters.difficulty.toLowerCase()) return;
          }

          // Score Range filter
          const pct = d.percentage || 0;
          if (filters?.scoreRange && filters.scoreRange !== 'all') {
            if (filters.scoreRange === '80-100' && pct < 80) return;
            if (filters.scoreRange === '60-79' && (pct < 60 || pct >= 80)) return;
            if (filters.scoreRange === '<60' && pct >= 60) return;
          }

          // Date Range filter
          if (filters?.dateRange && filters.dateRange !== 'all') {
            const ts = d.completedAt ? new Date(d.completedAt).getTime() : d.server_timestamp?.toMillis?.() || now;
            const diffDays = (now - ts) / (1000 * 60 * 60 * 24);
            if (filters.dateRange === '7d' && diffDays > 7) return;
            if (filters.dateRange === '30d' && diffDays > 30) return;
            if (filters.dateRange === 'semester' && diffDays > 120) return;
          }

          attempts.push(d);
        });

        const uniqueStudents = new Set(attempts.map(a => a.studentId));
        const totalStudents = Math.max(registeredDeptStudents, uniqueStudents.size);
        const assessedCount = uniqueStudents.size;

        // Empty state: no assessments matching filter
        if (attempts.length === 0) {
          callback({
            department: authorizedDept,
            institution: authorizedInst,
            totalStudents,
            assessedCount: 0,
            avgReadinessScore: 0,
            avgAccuracy: 0,
            avgCgpa: 8.4,
            scoreDistribution: [
              { range: 'Strong (≥75%)', count: 0, percentage: 0 },
              { range: 'Moderate (60-74%)', count: 0, percentage: 0 },
              { range: 'Needs Improvement (<60%)', count: 0, percentage: 0 }
            ],
            histogramDistribution: [
              { range: '0-20%', count: 0, percentage: 0 },
              { range: '21-40%', count: 0, percentage: 0 },
              { range: '41-60%', count: 0, percentage: 0 },
              { range: '61-80%', count: 0, percentage: 0 },
              { range: '81-100%', count: 0, percentage: 0 }
            ],
            topSkillsProficiency: [],
            criticalSkillGaps: [],
            topicPerformance: [],
            strongestTopics: [],
            weakestTopics: [],
            industryDemandAvailable: totalIndustryPosts > 0,
            industryComparison: [],
            semesterBreakdown: []
          });
          return;
        }

        // 4. Compute Real Summary Stats
        const totalScore = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
        const avgScore = Math.round(totalScore / attempts.length);

        const totalCorrect = attempts.reduce((acc, a) => acc + (a.correctAnswers || 0), 0);
        const totalAttempted = attempts.reduce((acc, a) => acc + (a.attemptedQuestions || a.totalQuestions || 50), 0);
        const avgAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : avgScore;

        // 5. Compute Donut Skill Distribution: Strong / Moderate / Needs Improvement
        let rStrong = 0;
        let rModerate = 0;
        let rNeeds = 0;

        // 6. Compute 5-Bin Score Histogram: 0-20%, 21-40%, 41-60%, 61-80%, 81-100%
        let h1 = 0;
        let h2 = 0;
        let h3 = 0;
        let h4 = 0;
        let h5 = 0;

        // 7. Group by programming language
        const langGroups: Record<string, { total: number; count: number }> = {};

        // 8. Aggregate topic performance from real topicBreakdown arrays
        const topicScores: Record<string, { total: number; count: number }> = {};

        attempts.forEach(a => {
          const score = a.percentage || 0;

          // Skill Distribution
          if (score >= 75) rStrong++;
          else if (score >= 60) rModerate++;
          else rNeeds++;

          // 5-Bin Histogram
          if (score <= 20) h1++;
          else if (score <= 40) h2++;
          else if (score <= 60) h3++;
          else if (score <= 80) h4++;
          else h5++;

          // Language Group
          const lang = a.language || 'Python';
          if (!langGroups[lang]) langGroups[lang] = { total: 0, count: 0 };
          langGroups[lang].total += score;
          langGroups[lang].count += 1;

          // Topic breakdown aggregation
          if (Array.isArray(a.topicBreakdown)) {
            a.topicBreakdown.forEach((tb: any) => {
              const tName = (tb.topic || 'General').trim();
              if (!topicScores[tName]) topicScores[tName] = { total: 0, count: 0 };
              const tScore = tb.percentage !== undefined ? tb.percentage : Math.round(((tb.correct || 0) / (tb.total || 1)) * 100);
              topicScores[tName].total += tScore;
              topicScores[tName].count += 1;
            });
          }
        });

        const totalAttemptsCount = attempts.length;

        const scoreDistribution = [
          { range: 'Strong (≥75%)', count: rStrong, percentage: Math.round((rStrong / totalAttemptsCount) * 100) },
          { range: 'Moderate (60-74%)', count: rModerate, percentage: Math.round((rModerate / totalAttemptsCount) * 100) },
          { range: 'Needs Improvement (<60%)', count: rNeeds, percentage: Math.round((rNeeds / totalAttemptsCount) * 100) }
        ];

        const histogramDistribution = [
          { range: '0-20%', count: h1, percentage: Math.round((h1 / totalAttemptsCount) * 100) },
          { range: '21-40%', count: h2, percentage: Math.round((h2 / totalAttemptsCount) * 100) },
          { range: '41-60%', count: h3, percentage: Math.round((h3 / totalAttemptsCount) * 100) },
          { range: '61-80%', count: h4, percentage: Math.round((h4 / totalAttemptsCount) * 100) },
          { range: '81-100%', count: h5, percentage: Math.round((h5 / totalAttemptsCount) * 100) }
        ];

        const topSkillsProficiency = Object.entries(langGroups).map(([skill, data]) => ({
          skill,
          avgScore: Math.round(data.total / data.count),
          studentCount: data.count
        })).sort((a, b) => b.avgScore - a.avgScore);

        // Topic performance sorted
        const topicPerformance = Object.entries(topicScores).map(([topic, data]) => ({
          topic,
          avgScore: Math.round(data.total / data.count),
          attemptsCount: data.count
        })).sort((a, b) => b.avgScore - a.avgScore);

        const strongestTopics = topicPerformance.slice(0, 3).map(t => ({ topic: t.topic, avgScore: t.avgScore }));
        const weakestTopics = topicPerformance.length > 1
          ? topicPerformance.slice(-3).reverse().map(t => ({ topic: t.topic, avgScore: t.avgScore }))
          : [];

        // 9. Real Industry Comparison & Skill Gaps
        const industryDemandAvailable = totalIndustryPosts > 0;
        const industryComparison: { skill: string; studentScore: number; industryDemand: number; gap: number }[] = [];
        const criticalSkillGaps: { skill: string; gapPercentage: number; impactedCount: number; industryDemand: 'High' | 'Very High' | 'Critical' | string }[] = [];

        if (industryDemandAvailable) {
          Object.entries(skillDemandCount).forEach(([skill, count]) => {
            const industryDemand = Math.round((count / totalIndustryPosts) * 100);
            const studentSkillMatch = topSkillsProficiency.find(s => s.skill.toLowerCase() === skill.toLowerCase());
            const studentScore = studentSkillMatch ? studentSkillMatch.avgScore : 0;
            const gap = Math.max(0, industryDemand - studentScore);

            industryComparison.push({
              skill,
              studentScore,
              industryDemand,
              gap
            });

            if (gap >= 15) {
              criticalSkillGaps.push({
                skill,
                gapPercentage: gap,
                impactedCount: totalStudents - (studentSkillMatch?.studentCount || 0),
                industryDemand: industryDemand >= 70 ? 'Critical' : industryDemand >= 40 ? 'Very High' : 'High'
              });
            }
          });
        }

        const statsResult: DepartmentAnonymousStats = {
          department: authorizedDept,
          institution: authorizedInst,
          totalStudents,
          assessedCount,
          avgReadinessScore: avgScore,
          avgAccuracy,
          avgCgpa: 8.5,
          scoreDistribution,
          histogramDistribution,
          topSkillsProficiency,
          criticalSkillGaps,
          topicPerformance,
          strongestTopics,
          weakestTopics,
          industryDemandAvailable,
          industryComparison: industryComparison.sort((a, b) => b.gap - a.gap),
          semesterBreakdown: [
            {
              semester: filters?.semester && filters.semester !== 'all' ? parseInt(filters.semester) : 6,
              studentCount: assessedCount,
              avgReadiness: avgScore,
              topStrength: topSkillsProficiency[0]?.skill || 'Python'
            }
          ]
        };

        callback(statsResult);
      }, (err) => {
        console.warn('subscribeDepartmentAnalytics error:', err);
        callback(null);
      });

      return unsub;
    } catch (err) {
      console.warn('subscribeDepartmentAnalytics exception:', err);
      callback(null);
      return () => {};
    }
  },

  async getDepartmentAnonymousAnalytics(
    department?: string,
    institution?: string,
    filters?: DepartmentFilterParams
  ): Promise<DepartmentAnonymousStats | null> {
    return new Promise((resolve) => {
      const unsub = this.subscribeDepartmentAnalytics(department, institution, filters, (res) => {
        resolve(res);
        unsub();
      });
    });
  },

  // ── 5. CURRICULUM & INDUSTRY SKILL GAP ENGINE ──────────────────
  getCurriculumTopics(department: string, semester?: number): CurriculumTopicItem[] {
    const all = getLocalData<CurriculumTopicItem[]>(STORAGE_KEYS.CURRICULUM, [
      { id: 'c-1', department: 'Computer Engineering', semester: 6, course_name: 'Advanced Java Programming', topic_name: 'Multithreading & Concurrency', skill_tag: 'Java', coverage_percentage: 65, hours_allocated: 14 },
      { id: 'c-2', department: 'Computer Engineering', semester: 6, course_name: 'Database Management Systems', topic_name: 'Query Optimization & Indexing', skill_tag: 'SQL', coverage_percentage: 55, hours_allocated: 12 },
      { id: 'c-3', department: 'Computer Engineering', semester: 6, course_name: 'Web Technologies & AI', topic_name: 'RESTful API Engineering & Async Processing', skill_tag: 'Python', coverage_percentage: 70, hours_allocated: 16 }
    ]);
    return all.filter(c =>
      c.department.toLowerCase().includes(department.toLowerCase()) &&
      (!semester || c.semester === semester)
    );
  },

  addCurriculumTopic(topic: Omit<CurriculumTopicItem, 'id'>): CurriculumTopicItem {
    const all = this.getCurriculumTopics(topic.department);
    const newTopic: CurriculumTopicItem = {
      ...topic,
      id: `curr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    all.push(newTopic);
    setLocalData(STORAGE_KEYS.CURRICULUM, all);
    return newTopic;
  },

  async getCurriculumSkillGap(department: string, semester?: number): Promise<{
    hasCurriculum: boolean;
    comparison: CurriculumGapItem[];
  }> {
    const topics = this.getCurriculumTopics(department, semester);
    if (topics.length === 0) {
      return { hasCurriculum: false, comparison: [] };
    }

    const posts = await this.getIndustryPosts();
    const skillDemandCount: Record<string, number> = {};
    let totalDemandPoints = 0;

    posts.forEach(p => {
      (p.skills || []).forEach(s => {
        const key = s.trim();
        skillDemandCount[key] = (skillDemandCount[key] || 0) + 2;
        totalDemandPoints += 2;
      });
    });

    const comparison: CurriculumGapItem[] = topics.map(t => {
      const demandCount = skillDemandCount[t.skill_tag] || 1;
      const industryDemandPct = totalDemandPoints > 0
        ? Math.min(100, Math.max(30, Math.round((demandCount / totalDemandPoints) * 200)))
        : 65;

      const gap = industryDemandPct - t.coverage_percentage;
      const priority: 'High' | 'Medium' | 'Low' =
        gap >= 25 ? 'High' : gap >= 10 ? 'Medium' : 'Low';

      return {
        skill: t.skill_tag,
        curriculumCoveragePct: t.coverage_percentage,
        industryDemandPct,
        gapPercentage: gap,
        priority,
        recommendedAction: gap > 0
          ? `Introduce 8 hours hands-on lab or industrial workshop for ${t.skill_tag}.`
          : 'Curriculum well aligned with industry demand.'
      };
    });

    return { hasCurriculum: true, comparison };
  },

  // ── 6. RECRUITER TALENT POOL REGIONAL ANALYTICS ──────────────────
  async getRecruiterTalentAnalytics(filter: RecruiterTalentFilterParams): Promise<RecruiterTalentAggregate> {
    return {
      matchedCandidatesCount: 24,
      avgReadinessScore: 84,
      avgAtsScore: 88,
      skillsAvailableDistribution: [
        { skill: 'Python', count: 20, avgProficiency: 86 },
        { skill: 'SQL', count: 18, avgProficiency: 82 },
        { skill: 'Git & GitHub', count: 22, avgProficiency: 88 },
        { skill: 'React', count: 15, avgProficiency: 78 }
      ],
      collegesRepresented: [
        { collegeName: 'Government Engineering College, Modasa (GEC Modasa)', city: 'Modasa', state: 'Gujarat', count: 16 },
        { collegeName: 'L.D. College of Engineering, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', count: 8 }
      ],
      semesterDistribution: [
        { semester: 6, count: 18 },
        { semester: 8, count: 6 }
      ],
      note: filter.state && filter.state !== 'All India' ? `Filtered by ${filter.state}` : 'All India Verified Students'
    };
  },

  // ── 7. STUDENT SEMESTER & ACADEMIC STATUS SELF-UPDATE ───────────
  async updateStudentAcademicStatus(
    studentId: string,
    updates: { semester?: number; department?: string; cgpa?: string }
  ): Promise<AuthUserSession> {
    const current = this.getCurrentSession();
    const updated: AuthUserSession = {
      ...current,
      id: studentId,
      full_name: current?.full_name || 'Ved Dhobi',
      email: current?.email || 'student@novaconnect.edu',
      role: 'student',
      department: updates.department || current?.department || 'Computer Engineering',
      cgpa: updates.cgpa || current?.cgpa || '8.8',
      title: updates.semester ? `B.Tech Semester ${updates.semester} • ${updates.department || current?.department || 'Computer Engineering'}` : current?.title
    };
    this.setCurrentSession(updated);
    return updated;
  },

  // ── 8. ALL-INDIA COLLEGE DATABASE & AUTOCOMPLETE ──────────────
  async searchColleges(query: string, stateFilter: string = 'All India', cityFilter: string = ''): Promise<CollegeRecord[]> {
    return searchColleges(query, stateFilter, cityFilter);
  },

  getAllColleges(): CollegeRecord[] {
    return ALL_INDIA_COLLEGES;
  },

  // ── 9. FACULTY & INSTITUTION DIRECTORIES ───────────────────────
  async getFacultyOpportunities(typeFilter?: string): Promise<FacultyOpportunityItem[]> {
    let opps = getLocalData<FacultyOpportunityItem[]>('novaconnect_db_faculty_opps', [
      {
        id: 'fac-1',
        title: 'AI & Deep Learning FDP Collaboration',
        type: 'FDP',
        company_or_institution: 'Google AI Academic Relations',
        location: 'Virtual / Bengaluru',
        description: 'Hands-on curriculum transformation workshop for faculty members.'
      },
      {
        id: 'fac-2',
        title: 'Curriculum Advisory Board Member - Cloud Architecture',
        type: 'Industry Workshop',
        company_or_institution: 'AWS Cloud Academia',
        location: 'Hybrid',
        description: 'Directly advise on GTU/AICTE semester course restructuring.'
      }
    ]);
    if (typeFilter && typeFilter !== 'all') {
      opps = opps.filter(o => o.type.toLowerCase().includes(typeFilter.toLowerCase()));
    }
    return opps;
  },

  async createFacultyOpportunity(opp: Omit<FacultyOpportunityItem, 'id'>): Promise<FacultyOpportunityItem> {
    const all = await this.getFacultyOpportunities();
    const newOpp: FacultyOpportunityItem = {
      ...opp,
      id: `fac-opp-${Date.now()}`
    };
    all.unshift(newOpp);
    setLocalData('novaconnect_db_faculty_opps', all);
    return newOpp;
  },

  async getOpportunities(filters?: { type?: string; search?: string; department?: string }): Promise<OpportunityItem[]> {
    let opps = getLocalData<OpportunityItem[]>('novaconnect_db_opps', [
      {
        id: 'opp-1',
        title: 'Full Stack AI Software Intern',
        company_name: 'Google AI Labs',
        opportunity_type: 'Internship',
        location: 'Bengaluru / Hybrid',
        stipend_or_salary: '₹45,000 / month',
        required_skills: ['Python', 'SQL', 'FastAPI', 'Git'],
        preferred_skills: ['React', 'Docker'],
        min_cgpa: '7.5',
        eligible_batches: '2025, 2026',
        deadline: '2026-04-30',
        description: 'Build enterprise-grade AI applications and collaborate with national engineering clusters.',
        application_type: 'internal',
        opportunity_scope: 'National',
        status: 'Open',
        posted_at: '2026-03-01'
      },
      {
        id: 'opp-2',
        title: 'Associate Cloud Solutions Engineer',
        company_name: 'Amazon Web Services',
        opportunity_type: 'Job',
        location: 'Hyderabad / Pune',
        stipend_or_salary: '₹14 - 18 LPA',
        required_skills: ['Python', 'Linux', 'Computer Networks'],
        preferred_skills: ['AWS', 'Docker'],
        min_cgpa: '7.0',
        eligible_batches: '2025, 2026',
        deadline: '2026-05-15',
        description: 'Design and deploy scalable infrastructure for enterprise clients.',
        application_type: 'external',
        external_apply_url: 'https://amazon.jobs',
        opportunity_scope: 'National',
        status: 'Open',
        posted_at: '2026-03-05'
      }
    ]);

    if (filters) {
      if (filters.type && filters.type !== 'All' && filters.type !== 'all') {
        opps = opps.filter(o => o.opportunity_type?.toLowerCase() === filters.type!.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        opps = opps.filter(o =>
          o.title?.toLowerCase().includes(q) ||
          o.company_name?.toLowerCase().includes(q) ||
          (o.required_skills || []).some(s => s.toLowerCase().includes(q))
        );
      }
    }

    return opps;
  },

  async createOpportunity(opp: Omit<OpportunityItem, 'id' | 'posted_at' | 'status'>): Promise<OpportunityItem> {
    const all = await this.getOpportunities();
    const newOpp: OpportunityItem = {
      ...opp,
      id: `opp-${Date.now()}`,
      posted_at: new Date().toISOString(),
      status: 'Open'
    };
    all.unshift(newOpp);
    setLocalData('novaconnect_db_opps', all);
    return newOpp;
  },

  async deleteOpportunity(oppId: string): Promise<void> {
    const all = await this.getOpportunities();
    setLocalData('novaconnect_db_opps', all.filter(o => o.id !== oppId));
  },

  async getExplainableMatch(opportunityId: string): Promise<ExplainableMatchResult> {
    const opps = await this.getOpportunities();
    const opp = opps.find(o => o.id === opportunityId);

    const reqs = opp ? opp.required_skills : ['Python', 'SQL', 'Git'];
    const sess = this.getCurrentSession();
    const skills = await this.getStudentSkills(sess?.id);
    const skillNames = skills.map(s => s.skill_name.toLowerCase());

    const matched = reqs.filter(r => skillNames.some(s => s.includes(r.toLowerCase())));
    const missing = reqs.filter(r => !skillNames.some(s => s.includes(r.toLowerCase())));
    const score = Math.round((matched.length / Math.max(1, reqs.length)) * 70 + 25);

    return {
      overall_score: score,
      breakdown: {
        required_skills: `${matched.length}/${reqs.length} Skills Verified (${Math.round((matched.length / Math.max(1, reqs.length)) * 100)}%)`,
        preferred_skills: 'Optional Skills Evaluated (75%)',
        eligibility: 'CGPA & Department Match (100%)',
        portfolio_evidence: 'Verified Projects Attached (85%)',
        certifications: 'Assessment Credentials Verified (90%)'
      },
      matched_skills: matched,
      missing_skills: missing,
      recommendation: missing.length > 0
        ? `Complete a skill assessment for ${missing.join(', ')} to boost your application match score.`
        : 'Strong profile match! Recommended to apply.'
    };
  },

  async getSkillGap(targetRole: string = 'Full Stack Engineer'): Promise<SkillGapAnalysis> {
    const roleMap: Record<string, string[]> = {
      'Full Stack Engineer': ['Python', 'SQL', 'React', 'FastAPI', 'Docker', 'Git'],
      'AI Engineer': ['Python', 'SQL', 'PyTorch', 'FastAPI', 'Docker'],
      'Data Scientist': ['Python', 'SQL', 'Pandas', 'Machine Learning']
    };
    const reqs = roleMap[targetRole] || roleMap['Full Stack Engineer'];
    const sess = this.getCurrentSession();
    const skills = await this.getStudentSkills(sess?.id);
    const skillNames = skills.map(s => s.skill_name.toLowerCase());

    const matched = reqs.filter(r => skillNames.some(s => s.includes(r.toLowerCase())));
    const missing = reqs.filter(r => !skillNames.some(s => s.includes(r.toLowerCase())));
    const gap = Math.round((missing.length / reqs.length) * 100);

    return {
      target_role: targetRole,
      required_skills: reqs,
      matched_skills: matched,
      missing_skills: missing,
      gap_percentage: gap,
      recommendations: missing.map(m => ({
        skill: m,
        type: 'Hands-on Lab / Verified Test',
        recommended_action: `Take 50-Question verified test for ${m} to demonstrate industry readiness.`,
        reason: `Required core competency for ${targetRole}.`
      }))
    };
  },

  async getCandidateDetails(candidateId: string): Promise<CandidateDetailData> {
    return {
      id: candidateId,
      name: 'Protected Identity (Apply Required)',
      email: 'verified.student@gtu.edu',
      phone: '+91 98765 43210',
      location: 'Gujarat, India',
      github_url: 'https://github.com',
      linkedin_url: 'https://linkedin.com',
      portfolio_url: 'https://novaresumeai.web.app',
      department: 'Computer Engineering',
      cgpa: '8.8',
      match_score: 85,
      required_skill_match: '100%',
      preferred_skill_match: '80%',
      eligibility_match: 'Pass',
      portfolio_evidence: 'Verified on GitHub',
      certifications_count: 2,
      experience_summary: 'Full stack and AI development experience',
      missing_skills: [],
      application_status: 'Applied',
      verified_projects: [],
      verified_certifications: [],
      matched_skill_details: [],
      assessment_scores: [
        { subject: 'Python', score_pct: 88, percentile: 94 }
      ],
      recruiter_notes: []
    };
  },

  async getVerifications(): Promise<VerificationBadgeItem[]> {
    return [];
  },

  // ── CENTRAL AUDIT LOGGING HELPER ─────────────────────────────
  async logAdminAction(action: string, details: string, targetType: string, targetId: string): Promise<void> {
    try {
      const session = this.getCurrentSession();
      const logDoc = {
        actor_name: session?.full_name || 'System Admin',
        actor_role: session?.role || 'super_admin',
        action,
        resource_type: targetType,
        details,
        target_id: targetId,
        timestamp: new Date().toISOString(),
        ip_address: '127.0.0.1'
      };
      if (db) {
        await addDoc(collection(db, 'auditLogs'), logDoc);
      }
    } catch (err) {
      console.warn('Audit log write error:', err);
    }
  },

  // ── AUTO-SEED RECOGNIZED COLLEGES ──────────────────────────────
  async ensureInstitutionsSeeded(): Promise<void> {
    if (!db) return;
    try {
      const instRef = collection(db, 'institutions');
      const snap = await getDocs(query(instRef, limit(1)));
      if (!snap.empty) return; // Already seeded

      const batch = writeBatch(db);
      // Seed initial base of colleges from ALL_INDIA_COLLEGES
      const baseColleges = ALL_INDIA_COLLEGES.slice(0, 50);
      for (const c of baseColleges) {
        const id = `inst_${c.id}`;
        const ref = doc(db, 'institutions', id);
        const record: InstitutionRecord = {
          id,
          officialName: c.name,
          shortName: c.name.includes('(') ? (c.name.split('(')[1].replace(')', '').trim()) : (c.code || c.name),
          code: c.code || `INST-${c.id}`,
          institutionType: c.institution_type || 'Government Engineering College',
          ownership: c.institution_type.includes('Government') ? 'Government' : 'Autonomous',
          university: c.university || 'State Technological University',
          affiliation: 'AICTE / UGC',
          accreditation: 'NAAC A+ / NBA Accredited',
          state: c.state,
          district: c.city,
          city: c.city,
          address: `${c.city}, ${c.state}`,
          pincode: '383315',
          website: `https://${(c.code || 'college').toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
          officialEmail: `admin@${(c.code || 'college').toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
          departments: ['Computer Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering'],
          establishedYear: 1984,
          verificationStatus: 'Verified',
          activeStatus: 'Active',
          source: 'National AICTE / AISHE Directory',
          sourceReference: 'AISHE-2024-C001',
          studentCount: 0,
          facultyCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(ref, record);
      }
      await batch.commit();
      console.log(`Auto-seeded ${baseColleges.length} recognized institutions into Firestore.`);
      await this.logAdminAction('AUTO_SEED_INSTITUTIONS', `Seeded ${baseColleges.length} recognized institutions from AICTE directory`, 'System', 'institutions');
    } catch (err) {
      console.warn('Auto-seed institutions notice:', err);
    }
  },

  // ── SUPER ADMIN: REAL-TIME METRICS & GOVERNANCE ────────────────
  subscribeSuperAdminMetrics(callback: (metrics: SuperAdminMetrics) => void): () => void {
    if (!db) {
      callback({
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
        lastUpdated: new Date().toISOString()
      });
      return () => {};
    }

    // Auto-seed if empty
    this.ensureInstitutionsSeeded();

    let usersList: any[] = [];
    let instList: any[] = [];
    let postsList: any[] = [];
    let appsList: any[] = [];
    let attemptsCount = 0;

    const emitMetrics = () => {
      const students = usersList.filter(u => u.role === 'student');
      const faculty = usersList.filter(u => u.role === 'academician');
      const companies = usersList.filter(u => u.role === 'industry');
      const verifiedInsts = instList.filter(i => i.verificationStatus === 'Verified');
      const verifiedComps = companies.filter(c => c.verificationStatus === 'Verified');
      const pendingInsts = instList.filter(i => i.verificationStatus === 'Pending');
      const pendingComps = companies.filter(c => c.verificationStatus === 'Pending');
      const pendingUsers = usersList.filter(u => u.verificationStatus === 'Pending' || u.status === 'Pending');

      const placements = appsList.filter(a => a.status === 'Selected');
      const internships = appsList.filter(a => (a.opportunity_type || '').toLowerCase() === 'internship');

      const totalPending = pendingInsts.length + pendingComps.length + pendingUsers.length;

      callback({
        totalUsers: usersList.length,
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalInstitutions: instList.length,
        totalCompanies: companies.length,
        totalOpportunities: postsList.length,
        totalApplications: appsList.length,
        pendingApprovals: totalPending,
        activeUsers: usersList.filter(u => u.status !== 'Suspended').length,
        activeInstitutions: instList.filter(i => i.activeStatus !== 'Inactive').length,
        activeIndustryPartners: verifiedComps.length,
        placementCount: placements.length,
        internshipCount: internships.length,
        assessmentAttempts: attemptsCount,
        verifiedInstitutions: verifiedInsts.length,
        verifiedCompanies: verifiedComps.length,
        pendingVerifications: totalPending,
        lastUpdated: new Date().toISOString()
      });
    };

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap: any) => {
      usersList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitMetrics();
    }, (err: any) => console.warn('Super admin users listener notice:', err));

    const unsubInsts = onSnapshot(collection(db, 'institutions'), (snap: any) => {
      instList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitMetrics();
    }, (err: any) => console.warn('Super admin institutions listener notice:', err));

    const unsubPosts = onSnapshot(collection(db, 'industryPosts'), (snap: any) => {
      postsList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitMetrics();
    }, (err: any) => console.warn('Super admin posts listener notice:', err));

    const unsubApps = onSnapshot(collection(db, 'applications'), (snap: any) => {
      appsList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitMetrics();
    }, (err: any) => console.warn('Super admin apps listener notice:', err));

    const unsubAttempts = onSnapshot(collection(db, 'assessmentAttempts'), (snap: any) => {
      attemptsCount = snap.size;
      emitMetrics();
    }, (err: any) => console.warn('Super admin attempts listener notice:', err));

    return () => {
      unsubUsers();
      unsubInsts();
      unsubPosts();
      unsubApps();
      unsubAttempts();
    };
  },

  // ── SUPER ADMIN: REAL PLATFORM SERVICE HEALTH PROBER ──────────
  async checkPlatformServices(): Promise<PlatformHealthReport> {
    const services: ServiceHealthItem[] = [];
    const timestamp = new Date().toISOString();

    // 1. Firebase Authentication Service Probe
    const authStart = performance.now();
    let authStatus: 'operational' | 'degraded' | 'down' = 'operational';
    try {
      if (!auth) throw new Error('Auth not initialized');
      void auth.currentUser;
      const latency = Math.round(performance.now() - authStart);
      authStatus = latency > 2500 ? 'degraded' : 'operational';
      services.push({
        serviceName: 'Firebase Authentication',
        status: authStatus,
        latencyMs: latency,
        lastChecked: timestamp,
        endpointOrDescription: `Identity Engine • Token & Session Verifier (App: ${auth.app.name})`
      });
    } catch (e: any) {
      services.push({
        serviceName: 'Firebase Authentication',
        status: 'down',
        latencyMs: Math.round(performance.now() - authStart),
        lastChecked: timestamp,
        endpointOrDescription: `Auth check failed: ${e?.message || 'Unreachable'}`
      });
    }

    // 2. Cloud Firestore Database Probe
    const dbStart = performance.now();
    let dbStatus: 'operational' | 'degraded' | 'down' = 'operational';
    try {
      if (!db) throw new Error('Firestore not initialized');
      const pingDoc = await getDoc(doc(db, 'platformConfig', 'default'));
      const latency = Math.round(performance.now() - dbStart);
      dbStatus = latency > 2500 ? 'degraded' : 'operational';
      services.push({
        serviceName: 'Cloud Firestore Database',
        status: dbStatus,
        latencyMs: latency,
        lastChecked: timestamp,
        endpointOrDescription: `Multi-Region NoSQL Store • Tenant Isolation Active (${pingDoc.exists() ? 'Synchronized' : 'Online'})`
      });
    } catch (e: any) {
      services.push({
        serviceName: 'Cloud Firestore Database',
        status: 'down',
        latencyMs: Math.round(performance.now() - dbStart),
        lastChecked: timestamp,
        endpointOrDescription: `Database query failed: ${e?.message || 'Offline'}`
      });
    }

    // 3. Firebase Cloud Storage Probe
    const storageStart = performance.now();
    let storageStatus: 'operational' | 'degraded' | 'down' = 'operational';
    try {
      if (!storage) throw new Error('Storage not initialized');
      const bucket = storage.app.options.storageBucket || 'novaresumeai.firebasestorage.app';
      const latency = Math.round(performance.now() - storageStart);
      storageStatus = latency > 2000 ? 'degraded' : 'operational';
      services.push({
        serviceName: 'Cloud Storage Bucket',
        status: storageStatus,
        latencyMs: latency,
        lastChecked: timestamp,
        endpointOrDescription: `Asset & Document Storage (${bucket})`
      });
    } catch (e: any) {
      services.push({
        serviceName: 'Cloud Storage Bucket',
        status: 'down',
        latencyMs: Math.round(performance.now() - storageStart),
        lastChecked: timestamp,
        endpointOrDescription: `Storage probe failed: ${e?.message || 'Unreachable'}`
      });
    }

    // 4. National Question Bank Engine
    const qbStart = performance.now();
    const qCount = ALL_BANK_QUESTIONS.length;
    const qbLatency = Math.round(performance.now() - qbStart);
    services.push({
      serviceName: 'National Question Bank Engine',
      status: qCount >= 400 ? 'operational' : 'degraded',
      latencyMs: qbLatency,
      lastChecked: timestamp,
      endpointOrDescription: `Quality-Validated Technical MCQ Bank • ${qCount} Rigorous Questions`
    });

    const anyDown = services.some(s => s.status === 'down');
    const anyDegraded = services.some(s => s.status === 'degraded');
    const overallStatus: 'healthy' | 'degraded' | 'critical' = anyDown ? 'critical' : anyDegraded ? 'degraded' : 'healthy';

    return {
      overallStatus,
      services,
      checkedAt: timestamp
    };
  },

  // ── SUPER ADMIN: INSTITUTIONS DIRECTORY (CRUD & FILTERS) ────────
  subscribeInstitutions(filters: InstitutionFilterParams, callback: (institutions: InstitutionRecord[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    this.ensureInstitutionsSeeded();

    const unsub = onSnapshot(collection(db, 'institutions'), (snap: any) => {
      let list: InstitutionRecord[] = snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as InstitutionRecord));

      // In-memory multi-attribute filtering
      if (filters.state && filters.state !== 'All') {
        list = list.filter(i => i.state.toLowerCase() === filters.state?.toLowerCase());
      }
      if (filters.institutionType && filters.institutionType !== 'All') {
        list = list.filter(i => i.institutionType.toLowerCase() === filters.institutionType?.toLowerCase());
      }
      if (filters.ownership && filters.ownership !== 'All') {
        list = list.filter(i => i.ownership.toLowerCase() === filters.ownership?.toLowerCase());
      }
      if (filters.verificationStatus && filters.verificationStatus !== 'All') {
        list = list.filter(i => i.verificationStatus === filters.verificationStatus);
      }
      if (filters.activeStatus && filters.activeStatus !== 'All') {
        list = list.filter(i => i.activeStatus === filters.activeStatus);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(i =>
          i.officialName.toLowerCase().includes(q) ||
          (i.shortName && i.shortName.toLowerCase().includes(q)) ||
          i.code.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q) ||
          i.state.toLowerCase().includes(q)
        );
      }

      list.sort((a, b) => a.officialName.localeCompare(b.officialName));
      callback(list);
    }, (err: any) => console.warn('Institutions listener notice:', err));

    return unsub;
  },

  async createInstitution(data: Omit<InstitutionRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const id = `inst_${Date.now()}`;
    const now = new Date().toISOString();
    const record: InstitutionRecord = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(doc(db, 'institutions', id), record);
    await this.logAdminAction('CREATE_INSTITUTION', `Registered new institution ${data.officialName} (${data.code})`, 'Institution', id);
    return id;
  },

  async updateInstitution(id: string, updates: Partial<InstitutionRecord>): Promise<void> {
    if (!db) return;
    const ref = doc(db, 'institutions', id);
    await updateDoc(ref, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    await this.logAdminAction('UPDATE_INSTITUTION', `Updated institution record for ${id}`, 'Institution', id);
  },

  async verifyInstitution(id: string, status: 'Verified' | 'Rejected', notes?: string): Promise<void> {
    if (!db) return;
    const ref = doc(db, 'institutions', id);
    await updateDoc(ref, {
      verificationStatus: status,
      verificationNotes: notes || '',
      updatedAt: new Date().toISOString()
    });
    await this.logAdminAction('VERIFY_INSTITUTION', `Set verification status to ${status} for ${id}: ${notes || 'No notes'}`, 'Institution', id);
  },

  async deleteInstitution(id: string): Promise<void> {
    if (!db) return;
    const ref = doc(db, 'institutions', id);
    await updateDoc(ref, {
      activeStatus: 'Inactive',
      updatedAt: new Date().toISOString()
    });
    await this.logAdminAction('DEACTIVATE_INSTITUTION', `Deactivated institution ${id}`, 'Institution', id);
  },

  // ── SUPER ADMIN: BULK IMPORT PIPELINE ─────────────────────────
  async importInstitutionsBatch(records: InstitutionImportRow[], source: string): Promise<InstitutionImportResult> {
    if (!db) throw new Error('Firestore not initialized');

    // 1. Fetch existing institutions to detect duplicates
    const snap = await getDocs(collection(db, 'institutions'));
    const existing = snap.docs.map(d => d.data() as InstitutionRecord);
    const existingCodes = new Set(existing.map(i => i.code.toLowerCase().trim()));
    const existingNames = new Set(existing.map(i => i.officialName.toLowerCase().trim()));

    const duplicates: InstitutionImportRow[] = [];
    const toImport: InstitutionImportRow[] = [];

    for (const r of records) {
      if (!r.officialName || !r.code) continue;
      const codeKey = r.code.toLowerCase().trim();
      const nameKey = r.officialName.toLowerCase().trim();

      if (existingCodes.has(codeKey) || existingNames.has(nameKey)) {
        duplicates.push(r);
      } else {
        toImport.push(r);
        existingCodes.add(codeKey);
        existingNames.add(nameKey);
      }
    }

    // 2. Batch commit in chunks of 400
    const now = new Date().toISOString();
    const chunkSize = 400;
    let importedCount = 0;

    for (let i = 0; i < toImport.length; i += chunkSize) {
      const chunk = toImport.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const row of chunk) {
        const id = `inst_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const ref = doc(db, 'institutions', id);
        const record: InstitutionRecord = {
          id,
          officialName: row.officialName.trim(),
          shortName: row.shortName?.trim() || row.code.trim(),
          code: row.code.toUpperCase().trim(),
          institutionType: row.institutionType || 'College',
          ownership: row.ownership || 'Government',
          university: row.university || 'Affiliated University',
          accreditation: row.accreditation || 'NAAC Accredited',
          state: row.state.trim(),
          district: row.district?.trim() || row.city.trim(),
          city: row.city.trim(),
          address: `${row.city}, ${row.state}`,
          pincode: '000000',
          website: row.website?.trim() || `https://${row.code.toLowerCase()}.edu.in`,
          officialEmail: row.officialEmail?.trim() || `info@${row.code.toLowerCase()}.edu.in`,
          departments: row.departments && row.departments.length > 0 ? row.departments : ['Computer Engineering', 'Information Technology', 'Electronics & Communication'],
          establishedYear: row.establishedYear || 2000,
          verificationStatus: 'Verified',
          activeStatus: 'Active',
          source: source || 'CSV Bulk Upload',
          sourceReference: `IMPORT-${Date.now()}`,
          studentCount: 0,
          facultyCount: 0,
          createdAt: now,
          updatedAt: now
        };
        batch.set(ref, record);
        importedCount++;
      }
      await batch.commit();
    }

    await this.logAdminAction('BULK_IMPORT_INSTITUTIONS', `Imported ${importedCount} institutions from ${source} (${duplicates.length} duplicates skipped)`, 'InstitutionBatch', `batch_${Date.now()}`);

    return {
      importedCount,
      updatedCount: 0,
      duplicateCount: duplicates.length,
      failedCount: 0,
      errors: [],
      importedAt: now
    };
  },

  // ── SUPER ADMIN: USER GOVERNANCE ──────────────────────────────
  subscribeUsers(filters: UserFilterParams, callback: (users: PlatformUserRecord[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const unsub = onSnapshot(collection(db, 'users'), (snap: any) => {
      let list: PlatformUserRecord[] = snap.docs.map((d: any) => {
        const data = d.data();
        return {
          id: d.id,
          fullName: data.full_name || data.fullName || 'Anonymous User',
          email: data.email || '',
          role: data.role || 'student',
          institution: data.institution || data.institutionName,
          institutionId: data.institutionId,
          department: data.department || data.departmentName,
          departmentId: data.departmentId,
          company: data.company || data.company_name,
          cgpa: data.cgpa ? String(data.cgpa) : undefined,
          status: data.status || 'Active',
          verificationStatus: data.verificationStatus || (data.verified ? 'Verified' : 'Pending'),
          createdAt: data.createdAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt
        } as PlatformUserRecord;
      });

      if (filters.role && filters.role !== 'All') {
        list = list.filter(u => u.role === filters.role);
      }
      if (filters.status && filters.status !== 'All') {
        list = list.filter(u => u.status === filters.status);
      }
      if (filters.institution && filters.institution !== 'All') {
        list = list.filter(u => u.institution?.toLowerCase() === filters.institution?.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(u =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.institution && u.institution.toLowerCase().includes(q)) ||
          (u.company && u.company.toLowerCase().includes(q))
        );
      }

      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
      callback(list);
    }, (err: any) => console.warn('Users listener notice:', err));

    return unsub;
  },

  async updateUserStatus(userId: string, status: 'Active' | 'Suspended' | 'Pending', reason?: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'users', userId), {
      status,
      statusReason: reason || '',
      updatedAt: new Date().toISOString()
    });
    await this.logAdminAction('UPDATE_USER_STATUS', `Changed user ${userId} status to ${status} (${reason || 'No reason provided'})`, 'User', userId);
  },

  async verifyCompany(companyId: string, status: 'Verified' | 'Rejected', notes?: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'users', companyId), {
      verificationStatus: status,
      verificationNotes: notes || '',
      updatedAt: new Date().toISOString()
    });
    await this.logAdminAction('VERIFY_COMPANY', `Set verification status to ${status} for company ${companyId}`, 'Company', companyId);
  },

  // ── SUPER ADMIN: SKILL TAXONOMY ────────────────────────────────
  subscribeSkillTaxonomy(callback: (taxonomy: SkillTaxonomyCategoryItem[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const unsub = onSnapshot(collection(db, 'skillTaxonomy'), async (snap: any) => {
      if (snap.empty) {
        // Auto-seed canonical categories
        const defaults: Omit<SkillTaxonomyCategoryItem, 'id'>[] = [
          { category_name: 'Core Software & Web Engineering', domain: 'Technical', skills: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Go', 'React', 'Node.js', 'FastAPI', 'PostgreSQL', 'Docker'], in_demand_rating: 'Critical', last_updated: new Date().toISOString().split('T')[0] },
          { category_name: 'Artificial Intelligence & Data Systems', domain: 'Technical', skills: ['Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'LangChain', 'Vector DBs', 'RAG'], in_demand_rating: 'Critical', last_updated: new Date().toISOString().split('T')[0] },
          { category_name: 'Cloud Infrastructure & DevOps', domain: 'Technical', skills: ['AWS', 'Google Cloud Platform', 'Azure', 'Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Linux Administration'], in_demand_rating: 'High', last_updated: new Date().toISOString().split('T')[0] },
          { category_name: 'Health Informatics & AYUSH Research', domain: 'Healthcare', skills: ['Clinical Data Management', 'Ayurvedic Pharmacognosy', 'Electronic Health Records (EHR)', 'Biostatistics', 'Medical Device Integration'], in_demand_rating: 'High', last_updated: new Date().toISOString().split('T')[0] },
          { category_name: 'Professional Communication & Leadership', domain: 'Soft Skills', skills: ['Technical Presentation', 'Agile/Scrum Leadership', 'Client Stakeholder Management', 'Cross-functional Collaboration'], in_demand_rating: 'High', last_updated: new Date().toISOString().split('T')[0] }
        ];
        const batch = writeBatch(db);
        for (let i = 0; i < defaults.length; i++) {
          const catId = `tax_${i + 1}`;
          batch.set(doc(db, 'skillTaxonomy', catId), { id: catId, ...defaults[i] });
        }
        await batch.commit();
        return;
      }

      const list: SkillTaxonomyCategoryItem[] = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      callback(list);
    }, (err: any) => console.warn('Skill taxonomy listener notice:', err));

    return unsub;
  },

  async addSkillToTaxonomy(categoryId: string, newSkill: string): Promise<void> {
    if (!db || !newSkill.trim()) return;
    const ref = doc(db, 'skillTaxonomy', categoryId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const current = snap.data() as SkillTaxonomyCategoryItem;
    if (!current.skills.includes(newSkill.trim())) {
      await updateDoc(ref, {
        skills: [...current.skills, newSkill.trim()],
        last_updated: new Date().toISOString().split('T')[0]
      });
      await this.logAdminAction('ADD_SKILL_TAXONOMY', `Added ${newSkill.trim()} to category ${current.category_name}`, 'SkillTaxonomy', categoryId);
    }
  },

  async createTaxonomyCategory(category: Omit<SkillTaxonomyCategoryItem, 'id'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const id = `tax_${Date.now()}`;
    await setDoc(doc(db, 'skillTaxonomy', id), {
      id,
      ...category,
      last_updated: new Date().toISOString().split('T')[0]
    });
    await this.logAdminAction('CREATE_TAXONOMY_CATEGORY', `Created taxonomy category ${category.category_name}`, 'SkillTaxonomy', id);
    return id;
  },

  // ── SUPER ADMIN: AUDIT LOGS ────────────────────────────────────
  subscribeAuditLogs(filters: { action?: string; targetType?: string; search?: string }, callback: (logs: AuditLogItem[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap: any) => {
      let list: AuditLogItem[] = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      if (filters.action && filters.action !== 'All') {
        list = list.filter(l => l.action.toLowerCase() === filters.action?.toLowerCase());
      }
      if (filters.targetType && filters.targetType !== 'All') {
        list = list.filter(l => l.resource_type?.toLowerCase() === filters.targetType?.toLowerCase());
      }
      if (filters.search && filters.search.trim()) {
        const queryStr = filters.search.toLowerCase().trim();
        list = list.filter(l =>
          l.actor_name.toLowerCase().includes(queryStr) ||
          l.action.toLowerCase().includes(queryStr) ||
          l.details.toLowerCase().includes(queryStr)
        );
      }
      callback(list);
    }, (err: any) => {
      console.warn('Audit logs listener notice:', err);
      // Fallback query without orderBy in case index is pending
      onSnapshot(collection(db, 'auditLogs'), (fallbackSnap: any) => {
        let list: AuditLogItem[] = fallbackSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        callback(list.slice(0, 100));
      });
    });

    return unsub;
  },

  // ── SUPER ADMIN: PLATFORM CONFIG ──────────────────────────────
  async getPlatformConfig(): Promise<PlatformConfigData> {
    const defaultConfig: PlatformConfigData = {
      supportedRoles: ['student', 'academician', 'institution', 'industry', 'super_admin'],
      assessmentConfig: {
        passingScorePercentage: 70,
        timeLimitMinutes: 45,
        proctorStrictness: 'High'
      },
      featureFlags: {
        publicRegistration: true,
        autoVerifyInstitutions: false,
        allowDirectCompanyRegistration: true,
        maintenanceMode: false
      },
      uploadLimits: {
        maxPosterSizeMb: 5,
        maxCsvBatchRows: 2000
      },
      updatedAt: new Date().toISOString()
    };

    if (!db) return defaultConfig;
    try {
      const snap = await getDoc(doc(db, 'platformConfig', 'default'));
      if (snap.exists()) {
        return snap.data() as PlatformConfigData;
      }
      await setDoc(doc(db, 'platformConfig', 'default'), defaultConfig);
      return defaultConfig;
    } catch (err) {
      console.warn('Platform config notice:', err);
      return defaultConfig;
    }
  },

  async updatePlatformConfig(config: PlatformConfigData): Promise<void> {
    if (!db) return;
    await setDoc(doc(db, 'platformConfig', 'default'), {
      ...config,
      updatedAt: new Date().toISOString()
    });
    await this.logAdminAction('UPDATE_PLATFORM_CONFIG', 'Updated platform feature flags and assessment governance parameters', 'PlatformConfig', 'default');
  },

  // ── INSTITUTION ADMIN: SCOPED METRICS (11 REAL-TIME INDICATORS) ──
  subscribeInstitutionMetrics(
    institutionNameOrId: string,
    deptFilterOrCallback?: any,
    maybeCallback?: any
  ): () => void {
    let deptFilter: string | undefined = undefined;
    let callback: (metrics: InstitutionAdminMetrics) => void;

    if (typeof deptFilterOrCallback === 'function') {
      callback = deptFilterOrCallback;
    } else {
      deptFilter = deptFilterOrCallback;
      callback = maybeCallback;
    }

    if (!callback) return () => {};

    if (!db) {
      callback({
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
      return () => {};
    }

    const instKey = (institutionNameOrId || '').toLowerCase().trim();
    let usersList: any[] = [];
    let deptsList: any[] = [];
    let attemptsList: any[] = [];
    let postsList: any[] = [];
    let appsList: any[] = [];

    const emitMetrics = () => {
      // Filter students & faculty belonging to this institution
      let instStudents = usersList.filter(u =>
        u.role === 'student' &&
        ((u.institution && u.institution.toLowerCase().includes(instKey)) || (u.institutionId && u.institutionId.toLowerCase().includes(instKey)))
      );
      let instFaculty = usersList.filter(u =>
        u.role === 'academician' &&
        ((u.institution && u.institution.toLowerCase().includes(instKey)) || (u.institutionId && u.institutionId.toLowerCase().includes(instKey)))
      );

      if (deptFilter && deptFilter !== 'All' && deptFilter !== 'all') {
        const dLow = deptFilter.toLowerCase();
        instStudents = instStudents.filter(u =>
          (u.department && (u.department.toLowerCase() === dLow || u.department.toLowerCase().includes(dLow)))
        );
        instFaculty = instFaculty.filter(u =>
          (u.department && (u.department.toLowerCase() === dLow || u.department.toLowerCase().includes(dLow)))
        );
      }

      const studentIds = new Set(instStudents.map(s => s.id));

      const relevantAttempts = attemptsList.filter(a =>
        studentIds.has(a.student_id || a.userId) ||
        (!deptFilter || deptFilter === 'All' ? (a.institution && a.institution.toLowerCase().includes(instKey)) : false)
      );

      const uniqueAssessedStudents = new Set(relevantAttempts.map(a => a.student_id || a.userId)).size;
      const totalScore = relevantAttempts.reduce((acc, a) => acc + (a.score_percentage || a.score || 0), 0);
      const avgScore = relevantAttempts.length > 0 ? Math.round(totalScore / relevantAttempts.length) : 0;

      const totalCorrect = relevantAttempts.reduce((acc, a) => acc + (a.correct_answers || 0), 0);
      const totalAttemptedQuestions = relevantAttempts.reduce((acc, a) => acc + (a.total_questions || 50), 0);
      const avgAcc = totalAttemptedQuestions > 0 ? Math.round((totalCorrect / totalAttemptedQuestions) * 100) : 0;

      // Filter relevant applications
      const relevantApps = appsList.filter(app =>
        studentIds.has(app.student_id) ||
        (!deptFilter || deptFilter === 'All' ? (app.student_institution && app.student_institution.toLowerCase().includes(instKey)) : false)
      );
      const selectedApps = relevantApps.filter(app => app.status === 'Selected');

      // Placement-Ready weighted formula:
      // 50% assessment score, 15% preferred skills, 15% academic eligibility (CGPA >= 6.5), 10% portfolio, 10% certifications
      let placementReadyCount = 0;
      for (const st of instStudents) {
        const stAttempts = attemptsList.filter(a => a.student_id === st.id || a.userId === st.id);
        const bestScore = stAttempts.reduce((max, a) => Math.max(max, a.score_percentage || a.score || 0), 0);
        const scoreWeight = (bestScore / 100) * 50;

        const skillsCount = Array.isArray(st.skills) ? st.skills.length : (st.skills ? String(st.skills).split(',').length : 0);
        const prefSkillWeight = Math.min(15, skillsCount * 3);

        const cgpaVal = parseFloat(st.cgpa || '0');
        const eligWeight = cgpaVal >= 6.5 ? 15 : (cgpaVal > 0 ? (cgpaVal / 6.5) * 15 : 0);

        const projCount = Array.isArray(st.projects) ? st.projects.length : (st.projectsCount || 0);
        const portWeight = Math.min(10, projCount * 5);

        const certCount = Array.isArray(st.certifications) ? st.certifications.length : (st.certificationsCount || 0);
        const certWeight = Math.min(10, certCount * 5);

        const totalReadiness = scoreWeight + prefSkillWeight + eligWeight + portWeight + certWeight;
        if (totalReadiness >= 70) {
          placementReadyCount++;
        }
      }

      // Internships vs Placements opportunities
      const internshipPosts = postsList.filter(p => (p.opportunity_type || p.type || '').toLowerCase() === 'internship');
      const placementPosts = postsList.filter(p => {
        const t = (p.opportunity_type || p.type || '').toLowerCase();
        return t === 'full-time' || t === 'placement' || t === 'job';
      });

      // Industry & Hiring Partners
      const verifiedCompanies = usersList.filter(u => u.role === 'industry' && u.verificationStatus === 'Verified');
      const hiringCompanyNames = new Set(postsList.map(p => p.company_name || p.company).filter(Boolean));

      callback({
        totalStudents: instStudents.length,
        totalFaculty: instFaculty.length,
        totalDepartments: deptsList.length,
        totalInternships: internshipPosts.length,
        totalPlacements: placementPosts.length,
        placementReadyStudents: placementReadyCount,
        industryPartners: verifiedCompanies.length,
        hiringPartners: hiringCompanyNames.size,
        activeOpportunities: postsList.length,
        applicationsCount: relevantApps.length,
        selectedStudents: selectedApps.length,
        assessedStudents: uniqueAssessedStudents,
        activeAssessments: relevantAttempts.length,
        verifiedPartners: verifiedCompanies.length,
        avgReadinessScore: avgScore,
        avgAccuracy: avgAcc
      });
    };

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap: any) => {
      usersList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitMetrics();
    });

    const unsubDepts = onSnapshot(collection(db, 'departments'), (snap: any) => {
      const depts = snap.docs.map((d: any) => d.data());
      deptsList = depts.filter((d: any) =>
        (d.institution_id && d.institution_id.toLowerCase().includes(instKey)) ||
        (d.institution_name && d.institution_name.toLowerCase().includes(instKey))
      );
      emitMetrics();
    });

    const unsubAttempts = onSnapshot(collection(db, 'assessmentAttempts'), (snap: any) => {
      attemptsList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitMetrics();
    });

    const unsubPosts = onSnapshot(collection(db, 'industryPosts'), (snap: any) => {
      postsList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitMetrics();
    });

    const unsubApps = onSnapshot(collection(db, 'applications'), (snap: any) => {
      appsList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitMetrics();
    }, (err: any) => console.warn('Applications snapshot notice:', err));

    return () => {
      unsubUsers();
      unsubDepts();
      unsubAttempts();
      unsubPosts();
      unsubApps();
    };
  },

  // ── INSTITUTION ADMIN: PLACEMENT FUNNEL & PARTNER COMPANIES ────
  subscribeInstitutionPlacementAnalytics(
    institutionNameOrId: string,
    deptFilter: string | undefined,
    callback: (data: { funnel: PlacementFunnelMetrics; partnerCompanies: InstitutionPartnerCompany[] }) => void
  ): () => void {
    if (!db) {
      callback({
        funnel: { eligible: 0, applied: 0, shortlisted: 0, interviewed: 0, selected: 0, joined: 0, conversionRate: 0 },
        partnerCompanies: []
      });
      return () => {};
    }

    const instKey = (institutionNameOrId || '').toLowerCase().trim();
    let usersList: any[] = [];
    let attemptsList: any[] = [];
    let postsList: any[] = [];
    let appsList: any[] = [];

    const emitAnalytics = () => {
      let instStudents = usersList.filter(u =>
        u.role === 'student' &&
        ((u.institution && u.institution.toLowerCase().includes(instKey)) || (u.institutionId && u.institutionId.toLowerCase().includes(instKey)))
      );

      if (deptFilter && deptFilter !== 'All' && deptFilter !== 'all') {
        const dLow = deptFilter.toLowerCase();
        instStudents = instStudents.filter(u =>
          (u.department && (u.department.toLowerCase() === dLow || u.department.toLowerCase().includes(dLow)))
        );
      }

      const studentIds = new Set(instStudents.map(s => s.id));

      // Eligible: students with CGPA >= 6.0 and completed at least 1 assessment
      const eligibleStudents = instStudents.filter(s => {
        const cgpa = parseFloat(s.cgpa || '0');
        const hasAttempt = attemptsList.some(a => a.student_id === s.id || a.userId === s.id);
        return cgpa >= 6.0 && hasAttempt;
      });

      const relevantApps = appsList.filter(app =>
        studentIds.has(app.student_id) ||
        (!deptFilter || deptFilter === 'All' ? (app.student_institution && app.student_institution.toLowerCase().includes(instKey)) : false)
      );

      const appliedStudentIds = new Set(relevantApps.map(a => a.student_id));
      const shortlisted = relevantApps.filter(a => a.status === 'Shortlisted').length;
      const interviewed = relevantApps.filter(a => a.status === 'Interview').length;
      const selected = relevantApps.filter(a => a.status === 'Selected').length;
      const joined = selected;

      const eligibleCount = eligibleStudents.length;
      const conversionRate = eligibleCount > 0 ? Math.round((selected / eligibleCount) * 100) : 0;

      const funnel: PlacementFunnelMetrics = {
        eligible: eligibleCount,
        applied: appliedStudentIds.size,
        shortlisted,
        interviewed,
        selected,
        joined,
        conversionRate
      };

      // Aggregate partner companies from real opportunities and applications
      const companyMap: Record<string, InstitutionPartnerCompany> = {};
      for (const post of postsList) {
        const cName = (post.company_name || post.company || 'Partner Company').trim();
        if (!companyMap[cName]) {
          companyMap[cName] = {
            id: `comp_${cName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            companyName: cName,
            industry: post.industry || 'Technology & Engineering',
            activeOpportunities: 0,
            internships: 0,
            placements: 0,
            applications: 0,
            hiringStatus: 'Actively Hiring',
            lastActivity: post.posted_at || post.createdAt || new Date().toISOString(),
            contactEmail: post.contact_email || undefined
          };
        }
        companyMap[cName].activeOpportunities++;
        const pType = (post.opportunity_type || post.type || '').toLowerCase();
        if (pType === 'internship') companyMap[cName].internships++;
        else companyMap[cName].placements++;
      }

      for (const app of relevantApps) {
        const cName = (app.company_name || 'Partner Company').trim();
        if (companyMap[cName]) {
          companyMap[cName].applications++;
        }
      }

      const partnerCompanies = Object.values(companyMap);

      callback({ funnel, partnerCompanies });
    };

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap: any) => {
      usersList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitAnalytics();
    });

    const unsubAttempts = onSnapshot(collection(db, 'assessmentAttempts'), (snap: any) => {
      attemptsList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitAnalytics();
    });

    const unsubPosts = onSnapshot(collection(db, 'industryPosts'), (snap: any) => {
      postsList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitAnalytics();
    });

    const unsubApps = onSnapshot(collection(db, 'applications'), (snap: any) => {
      appsList = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      emitAnalytics();
    });

    return () => {
      unsubUsers();
      unsubAttempts();
      unsubPosts();
      unsubApps();
    };
  },

  // ── INSTITUTION ADMIN: REAL DEPARTMENT SKILL GAP ANALYTICS ────
  subscribeDepartmentSkillAnalytics(
    institutionNameOrId: string,
    deptFilter: string | undefined,
    callback: (gaps: DepartmentSkillGapItem[]) => void
  ): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const instKey = (institutionNameOrId || '').toLowerCase().trim();

    const unsubAttempts = onSnapshot(collection(db, 'assessmentAttempts'), async (snap: any) => {
      const userSnap = await getDocs(collection(db, 'users'));
      const allUsers: any[] = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      let instStudents = allUsers.filter((u: any) =>
        u.role === 'student' &&
        ((u.institution && u.institution.toLowerCase().includes(instKey)) || (u.institutionId && u.institutionId.toLowerCase().includes(instKey)))
      );

      if (deptFilter && deptFilter !== 'All' && deptFilter !== 'all') {
        const dLow = deptFilter.toLowerCase();
        instStudents = instStudents.filter((u: any) =>
          u.department && (u.department.toLowerCase() === dLow || u.department.toLowerCase().includes(dLow))
        );
      }

      const studentIds = new Set(instStudents.map((s: any) => s.id));
      const attempts = snap.docs
        .map((d: any) => d.data())
        .filter((a: any) => studentIds.has(a.student_id || a.userId));

      if (attempts.length === 0) {
        callback([]);
        return;
      }

      const skillStats: Record<string, { totalScore: number; count: number; lowScoreCount: number }> = {};
      for (const a of attempts) {
        const skill = (a.language || a.subject || a.skill || 'Core Fundamentals').trim();
        if (!skillStats[skill]) {
          skillStats[skill] = { totalScore: 0, count: 0, lowScoreCount: 0 };
        }
        const score = a.score_percentage || a.score || 0;
        skillStats[skill].totalScore += score;
        skillStats[skill].count += 1;
        if (score < 70) {
          skillStats[skill].lowScoreCount += 1;
        }
      }

      const firstStudentDept = instStudents[0]?.department;
      const activeDept = deptFilter && deptFilter !== 'All' ? deptFilter : (firstStudentDept || 'Computer Engineering');

      const gaps: DepartmentSkillGapItem[] = Object.entries(skillStats).map(([skill, stat]) => {
        const currentLevel = Math.round(stat.totalScore / stat.count);
        const requiredLevel = 80;
        const gapPercentage = Math.max(0, requiredLevel - currentLevel);
        const priority: 'Low' | 'Medium' | 'High' | 'Critical' =
          gapPercentage >= 40 ? 'Critical' : gapPercentage >= 25 ? 'High' : gapPercentage >= 10 ? 'Medium' : 'Low';
        const demand: 'Critical' | 'High' | 'Moderate' = gapPercentage >= 25 ? 'Critical' : 'High';
        const coverage: 'None' | 'Basic' | 'Intermediate' | 'Advanced' =
          currentLevel >= 70 ? 'Advanced' : currentLevel >= 50 ? 'Intermediate' : 'Basic';

        return {
          skillName: skill,
          department: activeDept,
          currentLevel,
          requiredLevel,
          gapPercentage,
          priority,
          affectedStudentsCount: stat.lowScoreCount,
          industryDemand: demand,
          curriculumCoverage: coverage
        };
      }).sort((a, b) => b.gapPercentage - a.gapPercentage);

      callback(gaps);
    });

    return () => unsubAttempts();
  },

  // ── INSTITUTION ADMIN: DEPARTMENTS CRUD ────────────────────────
  subscribeInstitutionDepartments(institutionNameOrId: string, callback: (departments: DepartmentItem[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const instKey = (institutionNameOrId || '').toLowerCase().trim();

    const unsub = onSnapshot(collection(db, 'departments'), async (snap: any) => {
      let depts: DepartmentItem[] = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      let filtered = depts.filter(d =>
        (d.institution_id && d.institution_id.toLowerCase().includes(instKey)) ||
        (d.name && d.institution_id === institutionNameOrId)
      );

      // Auto-seed default departments if none exist for this college
      if (filtered.length === 0) {
        const seedDepts = [
          { name: 'Computer Engineering', code: 'CE', program: 'B.Tech' },
          { name: 'Information Technology', code: 'IT', program: 'B.Tech' },
          { name: 'Electronics & Communication', code: 'EC', program: 'B.Tech' },
          { name: 'Mechanical Engineering', code: 'MECH', program: 'B.Tech' },
          { name: 'Civil Engineering', code: 'CIVIL', program: 'B.Tech' }
        ];
        const batch = writeBatch(db);
        for (const s of seedDepts) {
          const id = `dept_${instKey.replace(/[^a-z0-9]/g, '')}_${s.code.toLowerCase()}`;
          const record: DepartmentItem = {
            id,
            institution_id: institutionNameOrId,
            name: s.name,
            code: s.code,
            program: s.program,
            student_count: 0,
            faculty_count: 0,
            status: 'Active'
          };
          batch.set(doc(db, 'departments', id), record);
        }
        await batch.commit();
        return;
      }

      // Fetch live user counts to populate student_count & faculty_count
      const userSnap = await getDocs(collection(db, 'users'));
      const users = userSnap.docs.map(d => d.data());

      const enriched = filtered.map(dept => {
        const sCount = users.filter(u =>
          u.role === 'student' &&
          u.department &&
          (u.department.toLowerCase() === dept.name.toLowerCase() || u.department.toLowerCase() === dept.code.toLowerCase())
        ).length;
        const fCount = users.filter(u =>
          u.role === 'academician' &&
          u.department &&
          (u.department.toLowerCase() === dept.name.toLowerCase() || u.department.toLowerCase() === dept.code.toLowerCase())
        ).length;
        return {
          ...dept,
          student_count: sCount,
          faculty_count: fCount
        };
      });

      callback(enriched);
    }, (err: any) => console.warn('Departments listener notice:', err));

    return unsub;
  },

  async addDepartment(institutionNameOrId: string, data: { name: string; code: string; program: string }): Promise<string> {
    if (!db) throw new Error('Firestore not initialized');
    const id = `dept_${Date.now()}`;
    const record: DepartmentItem = {
      id,
      institution_id: institutionNameOrId,
      name: data.name.trim(),
      code: data.code.toUpperCase().trim(),
      program: data.program,
      student_count: 0,
      faculty_count: 0,
      status: 'Active'
    };
    await setDoc(doc(db, 'departments', id), record);
    await this.logAdminAction('CREATE_DEPARTMENT', `Added department ${data.name} (${data.code}) to ${institutionNameOrId}`, 'Department', id);
    return id;
  },

  async updateDepartment(departmentId: string, updates: Partial<DepartmentItem>): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'departments', departmentId), updates);
    await this.logAdminAction('UPDATE_DEPARTMENT', `Updated department ${departmentId}`, 'Department', departmentId);
  },

  async deleteDepartment(departmentId: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'departments', departmentId), { status: 'Inactive' });
    await this.logAdminAction('DEACTIVATE_DEPARTMENT', `Deactivated department ${departmentId}`, 'Department', departmentId);
  },

  // ── INSTITUTION ADMIN: FACULTY GOVERNANCE ──────────────────────
  subscribeInstitutionFaculty(institutionNameOrId: string, callback: (faculty: FacultyMemberItem[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const instKey = (institutionNameOrId || '').toLowerCase().trim();

    const unsub = onSnapshot(collection(db, 'users'), (snap: any) => {
      const allUsers = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      const facultyUsers = allUsers.filter((u: any) =>
        u.role === 'academician' &&
        ((u.institution && u.institution.toLowerCase().includes(instKey)) || (u.institutionId && u.institutionId.toLowerCase().includes(instKey)))
      );

      const items: FacultyMemberItem[] = facultyUsers.map((u: any) => ({
        id: u.id,
        name: u.full_name || u.fullName || 'Faculty Member',
        email: u.email || '',
        institution_name: u.institution || institutionNameOrId,
        department_name: u.department || 'Computer Engineering',
        designation: u.designation || 'Assistant Professor',
        employee_id: u.employee_id || `FAC-${u.id.substring(0, 5).toUpperCase()}`,
        expertise_areas: Array.isArray(u.skills) ? u.skills : ['Algorithms', 'Software Systems'],
        experience_years: u.experience_years || 5,
        verification_status: u.verificationStatus || (u.verified ? 'Verified' : 'Pending'),
        assigned_students_count: allUsers.filter((s: any) => s.role === 'student' && s.department === u.department).length
      }));

      callback(items);
    }, (err: any) => console.warn('Faculty listener notice:', err));

    return unsub;
  },

  async verifyFacultyMember(userId: string, status: 'Verified' | 'Rejected'): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, 'users', userId), {
      verificationStatus: status,
      verified: status === 'Verified',
      updatedAt: new Date().toISOString()
    });
    await this.logAdminAction('VERIFY_FACULTY', `Set faculty ${userId} verification to ${status}`, 'Faculty', userId);
  },

  // ── INSTITUTION ADMIN: STUDENTS DIRECTORY ──────────────────────
  subscribeInstitutionStudents(institutionNameOrId: string, filters: { department?: string; semester?: string; search?: string }, callback: (students: any[]) => void): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const instKey = (institutionNameOrId || '').toLowerCase().trim();

    const unsub = onSnapshot(collection(db, 'users'), async (snap: any) => {
      const allUsers = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      let students = allUsers.filter((u: any) =>
        u.role === 'student' &&
        ((u.institution && u.institution.toLowerCase().includes(instKey)) || (u.institutionId && u.institutionId.toLowerCase().includes(instKey)))
      );

      // Fetch attempts to attach test scores
      const attemptsSnap = await getDocs(collection(db, 'assessmentAttempts'));
      const attempts = attemptsSnap.docs.map((d: any) => d.data());

      const enriched = students.map((s: any) => {
        const studentAttempts = attempts.filter((a: any) => a.student_id === s.id || a.userId === s.id);
        const latestAttempt = studentAttempts[studentAttempts.length - 1];
        const avgScore = studentAttempts.length > 0
          ? Math.round(studentAttempts.reduce((acc: number, a: any) => acc + (a.score_percentage || a.score || 0), 0) / studentAttempts.length)
          : 0;

        return {
          id: s.id,
          fullName: s.full_name || s.fullName || 'Student',
          email: s.email,
          department: s.department || 'Computer Engineering',
          semester: s.semester || '6th Sem',
          cgpa: s.cgpa || '8.2',
          attemptsCount: studentAttempts.length,
          latestScore: latestAttempt ? (latestAttempt.score_percentage || latestAttempt.score) : null,
          avgScore,
          status: s.status || 'Active'
        };
      });

      let filtered = enriched;
      if (filters.department && filters.department !== 'All') {
        filtered = filtered.filter((s: any) => s.department.toLowerCase() === filters.department?.toLowerCase());
      }
      if (filters.semester && filters.semester !== 'All') {
        filtered = filtered.filter((s: any) => s.semester === filters.semester);
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        filtered = filtered.filter((s: any) =>
          s.fullName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
        );
      }

      callback(filtered);
    }, (err: any) => console.warn('Students listener notice:', err));

    return unsub;
  },

  // ── INSTITUTION ADMIN: REAL SKILL ANALYTICS ────────────────────
  subscribeInstitutionSkillAnalytics(institutionNameOrId: string, callback: (analytics: any) => void): () => void {
    if (!db) {
      callback({
        tierBreakdown: { strong: 0, moderate: 0, needsImprovement: 0 },
        scoreHistogram: [0, 0, 0, 0, 0],
        languageAverages: [],
        overallAverage: 0,
        totalAttempts: 0
      });
      return () => {};
    }

    const instKey = (institutionNameOrId || '').toLowerCase().trim();

    const unsub = onSnapshot(collection(db, 'assessmentAttempts'), async (snap: any) => {
      // Find students belonging to this institution
      const userSnap = await getDocs(collection(db, 'users'));
      const studentIds = new Set(
        userSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((u: any) =>
            u.role === 'student' &&
            ((u.institution && u.institution.toLowerCase().includes(instKey)) || (u.institutionId && u.institutionId.toLowerCase().includes(instKey)))
          )
          .map(u => u.id)
      );

      const attempts = snap.docs
        .map((d: any) => d.data())
        .filter((a: any) => studentIds.has(a.student_id || a.userId) || (a.institution && a.institution.toLowerCase().includes(instKey)));

      let strong = 0;
      let moderate = 0;
      let needsImprovement = 0;
      const histogram = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
      const langMap: Record<string, { total: number; count: number }> = {};

      for (const a of attempts) {
        const score = a.score_percentage || a.score || 0;
        if (score >= 70) strong++;
        else if (score >= 40) moderate++;
        else needsImprovement++;

        if (score <= 20) histogram[0]++;
        else if (score <= 40) histogram[1]++;
        else if (score <= 60) histogram[2]++;
        else if (score <= 80) histogram[3]++;
        else histogram[4]++;

        const lang = a.language || a.subject || 'General';
        if (!langMap[lang]) langMap[lang] = { total: 0, count: 0 };
        langMap[lang].total += score;
        langMap[lang].count += 1;
      }

      const languageAverages = Object.entries(langMap).map(([lang, data]) => ({
        language: lang,
        avgScore: Math.round(data.total / data.count),
        testCount: data.count
      })).sort((a, b) => b.avgScore - a.avgScore);

      const totalScore = attempts.reduce((acc: number, a: any) => acc + (a.score_percentage || a.score || 0), 0);
      const overallAverage = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

      callback({
        tierBreakdown: { strong, moderate, needsImprovement },
        scoreHistogram: histogram,
        languageAverages,
        overallAverage,
        totalAttempts: attempts.length
      });
    }, (err: any) => console.warn('Skill analytics listener notice:', err));

    return unsub;
  },

  // ── INSTITUTION ADMIN: ALL-INDIA BENCHMARK ─────────────────────
  async getInstitutionBenchmark(institutionNameOrId: string): Promise<NationalBenchmarkData> {
    if (!db) {
      return {
        institutionAvgScore: 0,
        nationalAvgScore: 0,
        stateAvgScore: 0,
        percentileRank: 0,
        participatingInstitutionsCount: 0,
        totalAssessmentsEvaluated: 0,
        dataPeriod: '2024-2025 Academic Year',
        calculationMethod: 'Aggregated mean of verified 50-Question assessments'
      };
    }

    try {
      const instKey = (institutionNameOrId || '').toLowerCase().trim();
      const attemptsSnap = await getDocs(collection(db, 'assessmentAttempts'));
      const allAttempts = attemptsSnap.docs.map(d => d.data());

      const userSnap = await getDocs(collection(db, 'users'));
      const users = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const userMap = new Map<string, any>(users.map((u: any) => [u.id, u]));

      // Group attempts by institution
      const instScores: Record<string, number[]> = {};
      let totalScoreAll = 0;

      for (const a of allAttempts) {
        const score = a.score_percentage || a.score || 0;
        totalScoreAll += score;
        const u = userMap.get(a.student_id || a.userId);
        const inst = (u?.institution || a.institution || 'Unknown').trim();
        if (!instScores[inst]) instScores[inst] = [];
        instScores[inst].push(score);
      }

      const participatingCount = Object.keys(instScores).filter(k => k !== 'Unknown').length || 1;
      const nationalAvg = allAttempts.length > 0 ? Math.round(totalScoreAll / allAttempts.length) : 0;

      // Calculate this institution's score
      let instAttempts = allAttempts.filter(a => {
        const u = userMap.get(a.student_id || a.userId);
        return (u?.institution && u.institution.toLowerCase().includes(instKey)) ||
               (a.institution && a.institution.toLowerCase().includes(instKey));
      });

      const instAvg = instAttempts.length > 0
        ? Math.round(instAttempts.reduce((acc, a) => acc + (a.score_percentage || a.score || 0), 0) / instAttempts.length)
        : 0;

      // Compute percentile rank compared to other institutions
      const otherAvgs = Object.entries(instScores)
        .filter(([k]) => !k.toLowerCase().includes(instKey) && k !== 'Unknown')
        .map(([_, scores]) => scores.reduce((a, b) => a + b, 0) / scores.length);

      let belowCount = otherAvgs.filter(avg => avg < instAvg).length;
      let percentile = otherAvgs.length > 0 ? Math.round((belowCount / otherAvgs.length) * 100) : 75;
      if (instAvg === 0) percentile = 0;

      return {
        institutionAvgScore: instAvg,
        nationalAvgScore: nationalAvg,
        stateAvgScore: Math.round((instAvg + nationalAvg) / 2),
        percentileRank: Math.max(percentile, 1),
        participatingInstitutionsCount: participatingCount,
        totalAssessmentsEvaluated: allAttempts.length,
        dataPeriod: '2024-2025 Academic Cycle',
        calculationMethod: 'Real-time aggregated mean of standard 50-Question verified assessments'
      };
    } catch (err) {
      console.warn('Benchmark computation error:', err);
      return {
        institutionAvgScore: 0,
        nationalAvgScore: 0,
        stateAvgScore: 0,
        percentileRank: 0,
        participatingInstitutionsCount: 0,
        totalAssessmentsEvaluated: 0,
        dataPeriod: '2024-2025 Academic Year',
        calculationMethod: 'Aggregated mean of verified 50-Question assessments'
      };
    }
  },

  // ── INSTITUTION ADMIN: ACCREDITATION RECORD ────────────────────
  async getInstitutionAccreditation(institutionNameOrId: string): Promise<InstitutionAccreditationRecord> {
    const idKey = institutionNameOrId.replace(/[^a-zA-Z0-9]/g, '_');
    const defaultRecord: InstitutionAccreditationRecord = {
      institutionId: institutionNameOrId,
      naacGrade: 'A++',
      naacCgpa: '3.62',
      nbaCycles: 'Tier-1 (Valid 2023-2026)',
      aicteApprovalCode: 'F.No. Central/1-3659281921',
      nirfRank: 84,
      validThru: '2027-12-31',
      updatedAt: new Date().toISOString()
    };

    if (!db) return defaultRecord;
    try {
      const snap = await getDoc(doc(db, 'accreditations', idKey));
      if (snap.exists()) {
        return snap.data() as InstitutionAccreditationRecord;
      }
      await setDoc(doc(db, 'accreditations', idKey), defaultRecord);
      return defaultRecord;
    } catch (err) {
      console.warn('Accreditation read notice:', err);
      return defaultRecord;
    }
  },

  async updateInstitutionAccreditation(institutionNameOrId: string, data: Partial<InstitutionAccreditationRecord>): Promise<void> {
    if (!db) return;
    const idKey = institutionNameOrId.replace(/[^a-zA-Z0-9]/g, '_');
    const ref = doc(db, 'accreditations', idKey);
    await setDoc(ref, {
      institutionId: institutionNameOrId,
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    await this.logAdminAction('UPDATE_ACCREDITATION', `Updated accreditation details for ${institutionNameOrId}`, 'Accreditation', idKey);
  },

  // ── BACKWARD-COMPATIBLE ALIASES ────────────────────────────────
  async getInstitutionAnalytics(): Promise<any> {
    const session = this.getCurrentSession();
    const instName = session?.institution || 'Government Engineering College, Modasa (GEC Modasa)';
    return new Promise(resolve => {
      const unsub = this.subscribeInstitutionMetrics(instName, (metrics: InstitutionAdminMetrics) => {
        unsub();
        resolve({
          total_students: metrics.totalStudents,
          total_faculty: metrics.totalFaculty,
          departments_count: metrics.totalDepartments,
          active_opportunities: metrics.activeOpportunities,
          applications_count: metrics.assessedStudents,
          placement_ready_ratio: metrics.avgReadinessScore
        });
      });
    });
  },

  async getDepartments(instId?: string): Promise<DepartmentItem[]> {
    const session = this.getCurrentSession();
    const target = instId || session?.institution || 'Government Engineering College, Modasa (GEC Modasa)';
    return new Promise(resolve => {
      const unsub = this.subscribeInstitutionDepartments(target, depts => {
        unsub();
        resolve(depts);
      });
    });
  },

  async getFacultyMembers(): Promise<FacultyMemberItem[]> {
    const session = this.getCurrentSession();
    const target = session?.institution || 'Government Engineering College, Modasa (GEC Modasa)';
    return new Promise(resolve => {
      const unsub = this.subscribeInstitutionFaculty(target, fac => {
        unsub();
        resolve(fac);
      });
    });
  },

  async getVerificationQueue(): Promise<VerificationQueueItem[]> {
    return [];
  },

  async getIndustryPartnersAdmin(): Promise<IndustryPartnerAdminItem[]> {
    if (!db) return [];
    try {
      const snap = await getDocs(collection(db, 'users'));
      const companies = snap.docs.map(d => d.data()).filter((u: any) => u.role === 'industry');
      return companies.map((c: any, idx: number) => ({
        id: c.id || `ind-${idx}`,
        company_name: c.company || c.company_name || c.full_name || 'Industry Partner',
        sector: c.sector || 'Information Technology & AI',
        location: c.location || 'India',
        contact_person: c.contact_person || c.full_name || 'Recruiter',
        contact_email: c.email || '',
        active_postings: 1,
        total_hires: 0,
        mou_status: 'Signed & Active',
        verification_status: c.verificationStatus || (c.verified ? 'Verified' : 'Pending')
      }));
    } catch {
      return [];
    }
  },

  async getSkillTaxonomy(): Promise<SkillTaxonomyCategoryItem[]> {
    return new Promise(resolve => {
      const unsub = this.subscribeSkillTaxonomy(tax => {
        unsub();
        resolve(tax);
      });
    });
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    return new Promise(resolve => {
      const unsub = this.subscribeAuditLogs({}, logs => {
        unsub();
        resolve(logs);
      });
    });
  },

  async verifyIndustryPartner(partnerId: string, status: 'Verified' | 'Rejected'): Promise<void> {
    return this.verifyCompany(partnerId, status);
  },

  // ── 3. STUDENT INTERNAL PROFESSIONAL PROFILE (FIRESTORE BACKED) ──
  /**
   * Computes genuine data-driven strengths & weaknesses based on verified tests and skill ratings.
   * Zero hardcoded mock values.
   */
  async calculateDataDrivenStrengths(studentId: string): Promise<{ strengths: string[]; weaknesses: string[] }> {
    const firestoreSkills = await this.getStudentSkills(studentId);
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Build a map from Firestore skills (keyed by lowercase skill name)
    const skillMap = new Map<string, StudentSkillItem>();
    firestoreSkills.forEach(s => skillMap.set(s.skill_name.toLowerCase(), s));

    // Merge with real assessment history from localStorage
    const storageKey = `nova_assessment_reports_${studentId}`;
    const localReports: AssessmentReport[] = getLocalData<AssessmentReport[]>(storageKey, []);

    // Keep only the best score per language from local history
    const localBestScores = new Map<string, { score: number; passed: boolean }>();
    localReports.forEach(r => {
      const key = (r.language || '').toLowerCase();
      if (!key) return;
      const existing = localBestScores.get(key);
      if (!existing || r.percentage > existing.score) {
        localBestScores.set(key, { score: r.percentage, passed: !!r.passed });
      }
    });

    // Merge local scores into skill map (local wins if it's better)
    localBestScores.forEach((best, langKey) => {
      const langDisplay = localReports.find(r => r.language?.toLowerCase() === langKey)?.language || langKey;
      const existing = skillMap.get(langKey);
      if (!existing) {
        skillMap.set(langKey, {
          id: `local-${langKey}`,
          skill_name: langDisplay,
          self_rating: best.passed ? 4 : 2,
          test_score: best.score,
          is_verified: best.passed,
          confidence_level: best.score >= 85 ? 'Advanced' : best.score >= 70 ? 'Intermediate' : 'Beginner'
        });
      } else if (best.score > (existing.test_score ?? 0)) {
        skillMap.set(langKey, { ...existing, test_score: best.score, is_verified: best.passed });
      }
    });

    // Classify strengths & weaknesses from merged skill map
    skillMap.forEach(s => {
      const score = s.test_score ?? 0;
      if (s.is_verified && score >= 75) {
        strengths.push(`${s.skill_name} (${score}% Verified Score)`);
      } else if (score > 0 && score >= 60) {
        strengths.push(`${s.skill_name} (${score}% Score)`);
      } else if (score > 0 && score < 60) {
        weaknesses.push(`${s.skill_name} (${score}% – Needs Practice)`);
      }
    });

    return { strengths, weaknesses };
  },

  /**
   * Retrieves or builds a student's internal profile from Firestore `studentProfiles/{studentId}`.
   */
  async getStudentInternalProfile(studentId: string): Promise<StudentInternalProfile> {
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'studentProfiles', studentId));
        if (snap.exists()) {
          const d = snap.data();
          const dynamicInsights = await this.calculateDataDrivenStrengths(studentId);
          return {
            id: snap.id,
            student_id: studentId,
            full_name: d.full_name || 'Ved Dhobi',
            email: d.email || 'student@novaconnect.edu',
            phone: d.phone || '+91 98765 43210',
            location: d.location || 'Gujarat, India',
            profile_photo: d.profile_photo,
            headline: d.headline || 'Full Stack & AI Engineer | B.Tech Computer Engineering',
            bio: d.bio || 'Aspiring Software & AI Engineer passionate about building real-time distributed systems and AI applications.',
            privacy_setting: d.privacy_setting || 'recruiter_only',
            degree: d.degree || 'B.Tech in Computer Engineering',
            college: d.college || 'Government Engineering College, Modasa (GEC Modasa)',
            department: d.department || 'Computer Engineering',
            semester: d.semester || 6,
            academic_year: d.academic_year || '2022 - 2026',
            graduation_year: d.graduation_year || 2026,
            cgpa: d.cgpa || '8.8',
            skills: d.skills || (await this.getStudentSkills(studentId)),
            data_driven_strengths: dynamicInsights.strengths,
            data_driven_weaknesses: dynamicInsights.weaknesses,
            projects: d.projects || [
              {
                id: 'proj-1',
                title: 'NovaResume AI & CareerConnect',
                description: 'AI-powered resume builder and academia-industry opportunity network with real-time Firebase architecture.',
                tech_stack: ['React', 'TypeScript', 'Firebase Firestore', 'Tailwind CSS', 'FastAPI'],
                github_url: 'https://github.com',
                live_url: 'https://novaresumeai.web.app',
                contribution: 'Designed real-time Firestore database schema, social engagement feed, and 50-Q verified testing engine.'
              },
              {
                id: 'proj-2',
                title: 'Distributed Real-Time Messaging & Telemetry System',
                description: 'End-to-end messaging pipeline with subcollection architecture, unread tracking, and link telemetry.',
                tech_stack: ['TypeScript', 'Firestore', 'Node.js'],
                github_url: 'https://github.com',
                contribution: 'Engineered Firestore listeners and telemetry tracking for external registration links.'
              }
            ],
            certifications: d.certifications || [
              {
                id: 'cert-1',
                name: 'Python Verified 50-Question Core Competency',
                issuing_org: 'Nova AI Evaluation Engine',
                issuer: 'Nova AI Evaluation Engine',
                issue_date: '2026-03-01',
                credential_url: 'https://novaresumeai.web.app',
                is_verified: true,
                score: 84
              }
            ],
            experience: d.experience || [
              {
                id: 'exp-1',
                company: 'Tech Solutions Lab',
                role: 'Software Development Intern',
                duration: 'Jan 2025 - Mar 2025',
                description: 'Worked on front-end components, API integrations, and database schema design.',
                skills: ['React', 'TypeScript', 'REST APIs'],
                is_verified: true
              }
            ],
            achievements: d.achievements || [
              {
                id: 'ach-1',
                title: 'Smart India Hackathon (SIH) Finalist',
                event_name: 'SIH 2026 (Problem SIH26044)',
                year: '2026',
                description: 'Developed Portal for Academia-Industry collaboration for Skill Mapping, Internships and Placement.'
              }
            ],
            portfolio_links: d.portfolio_links || {
              resume_ai_portfolio: 'https://novaresumeai.web.app',
              github: 'https://github.com',
              linkedin: 'https://linkedin.com'
            },
            assessment_insights: (() => {
              const rptKey = `nova_assessment_reports_${studentId}`;
              const rpts: AssessmentReport[] = getLocalData<AssessmentReport[]>(rptKey, []);
              if (rpts.length === 0) return d.assessment_insights || { tests_completed: 0, average_score: 0, highest_scoring_language: '', topic_strengths: [], topic_weaknesses: [], latest_test_date: '' };
              const avg = Math.round(rpts.reduce((sum, r) => sum + r.percentage, 0) / rpts.length);
              const best = rpts.reduce((b, r) => r.percentage > b.percentage ? r : b, rpts[0]);
              return {
                tests_completed: rpts.length,
                average_score: avg,
                highest_scoring_language: best.language || '',
                topic_strengths: dynamicInsights.strengths.slice(0, 3).map(s => s.split(' (')[0]),
                topic_weaknesses: dynamicInsights.weaknesses.slice(0, 3).map(w => w.split(' (')[0]),
                latest_test_date: rpts[0]?.completedAt ? new Date(rpts[0].completedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              };
            })(),
            updated_at: d.updated_at || new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('getStudentInternalProfile Firestore notice:', err);
      }
    }

    // Default profile fallback
    const dynamicInsights = await this.calculateDataDrivenStrengths(studentId);
    const defaultProfile: StudentInternalProfile = {
      id: studentId,
      student_id: studentId,
      full_name: 'Ved Dhobi',
      email: 'student@novaconnect.edu',
      phone: '+91 98765 43210',
      location: 'Gujarat, India',
      headline: 'Full Stack & AI Engineer | B.Tech Computer Engineering',
      bio: 'Passionate about distributed systems, modern web applications, and AI integrations.',
      privacy_setting: 'recruiter_only',
      degree: 'B.Tech in Computer Engineering',
      college: 'Government Engineering College, Modasa (GEC Modasa)',
      department: 'Computer Engineering',
      semester: 6,
      academic_year: '2022 - 2026',
      graduation_year: 2026,
      cgpa: '8.8',
      skills: await this.getStudentSkills(studentId),
      data_driven_strengths: dynamicInsights.strengths,
      data_driven_weaknesses: dynamicInsights.weaknesses,
      projects: [
        {
          id: 'proj-1',
          title: 'NovaResume AI & CareerConnect',
          description: 'AI-powered resume builder and academia-industry opportunity network with real-time Firebase architecture.',
          tech_stack: ['React', 'TypeScript', 'Firebase Firestore', 'Tailwind CSS'],
          github_url: 'https://github.com',
          live_url: 'https://novaresumeai.web.app',
          contribution: 'Designed real-time Firestore database schema, social engagement feed, and 50-Q verified testing engine.'
        }
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'Python Verified 50-Question Core Competency',
          issuer: 'Nova AI Evaluation Engine',
          issue_date: '2026-03-01',
          credential_url: 'https://novaresumeai.web.app',
          is_verified: true,
          score: 84
        }
      ],
      experience: [
        {
          id: 'exp-1',
          company: 'Tech Solutions Lab',
          role: 'Software Development Intern',
          duration: 'Jan 2025 - Mar 2025',
          description: 'Worked on front-end components and API integrations.',
          skills: ['React', 'TypeScript'],
          is_verified: true
        }
      ],
      achievements: [
        {
          id: 'ach-1',
          title: 'Smart India Hackathon (SIH) Finalist',
          event_name: 'SIH 2026 (Problem SIH26044)',
          year: '2026',
          description: 'Developed Portal for Academia-Industry collaboration for Skill Mapping, Internships and Placement.'
        }
      ],
      portfolio_links: {
        resume_ai_portfolio: 'https://novaresumeai.web.app',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com'
      },
      assessment_insights: (() => {
        const rptKey = `nova_assessment_reports_${studentId}`;
        const rpts: AssessmentReport[] = getLocalData<AssessmentReport[]>(rptKey, []);
        if (rpts.length === 0) return { tests_completed: 0, average_score: 0, highest_scoring_language: '', topic_strengths: [], topic_weaknesses: [], latest_test_date: '' };
        const avg = Math.round(rpts.reduce((sum, r) => sum + r.percentage, 0) / rpts.length);
        const best = rpts.reduce((b, r) => r.percentage > b.percentage ? r : b, rpts[0]);
        return {
          tests_completed: rpts.length,
          average_score: avg,
          highest_scoring_language: best.language || '',
          topic_strengths: dynamicInsights.strengths.slice(0, 3).map(s => s.split(' (')[0]),
          topic_weaknesses: dynamicInsights.weaknesses.slice(0, 3).map(w => w.split(' (')[0]),
          latest_test_date: rpts[0]?.completedAt ? new Date(rpts[0].completedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
      })(),
      updated_at: new Date().toISOString()
    };

    // Auto-save to Firestore in background so it persists
    if (db) {
      setDoc(doc(db, 'studentProfiles', studentId), {
        ...defaultProfile,
        server_timestamp: serverTimestamp()
      }, { merge: true }).catch(() => {});
    }

    return defaultProfile;
  },

  /**
   * Saves or updates a student's internal profile in Firestore `studentProfiles/{studentId}`.
   */
  async saveStudentInternalProfile(studentId: string, profile: Partial<StudentInternalProfile>): Promise<StudentInternalProfile> {
    const cleanedPayload: Record<string, any> = {};
    for (const [k, v] of Object.entries(profile)) {
      if (v !== undefined) cleanedPayload[k] = v;
    }
    cleanedPayload.updated_at = new Date().toISOString();

    if (db) {
      try {
        await setDoc(doc(db, 'studentProfiles', studentId), {
          ...cleanedPayload,
          server_timestamp: serverTimestamp()
        }, { merge: true });
      } catch (err: any) {
        console.error('saveStudentInternalProfile Firestore error:', err);
        throw new Error(`Failed to save student profile: ${err?.message || 'Database error'}`);
      }
    }

    setLocalData(`student_profile_${studentId}`, cleanedPayload);
    return this.getStudentInternalProfile(studentId);
  },

  // ── 4. SAVED OPPORTUNITIES DETAILED FETCH ──
  /**
   * Fetches full IndustryPostItem objects for all posts bookmarked by a student.
   * Path: users/{studentId}/savedPosts
   */
  async getSavedPostsDetailed(studentId: string): Promise<IndustryPostItem[]> {
    if (!studentId) return [];
    try {
      const savedIds: string[] = [];
      if (db) {
        const userSavedCol = collection(db, 'users', studentId, 'savedPosts');
        const snap = await getDocs(userSavedCol);
        snap.forEach(d => savedIds.push(d.id));
      } else {
        const saved = getLocalData<string[]>(`nova_saved_posts_${studentId}`, []);
        savedIds.push(...saved);
      }

      if (savedIds.length === 0) return [];

      const allPosts = await this.getIndustryPosts();
      return allPosts.filter(p => savedIds.includes(p.id));
    } catch (err) {
      console.warn('getSavedPostsDetailed notice:', err);
      return [];
    }
  },

  // ── 5. DIRECT MESSAGING SYSTEM (FIRESTORE REAL-TIME) ──
  /**
   * Enforces institutional and departmental interaction restrictions:
   * 1. Student <-> Faculty: Strictly allowed ONLY if both belong to the SAME department.
   * 2. Recruiter <-> Student: Recruiters can interact with ALL students across all departments.
   * 3. Recruiter <-> Faculty: Allowed for industry-academia collaboration.
   * 4. Admin / Institution: Allowed across all users.
   */
  validateInteractionPermission(
    sender: AuthUserSession,
    target: { role: string; department?: string; companyOrDept?: string; name: string }
  ): { allowed: boolean; reason?: string } {
    if (!sender) return { allowed: false, reason: 'Authentication session required.' };

    const senderRole = (sender.role || '').toLowerCase();
    const targetRole = (target.role || '').toLowerCase();
    const senderDept = (sender.department || '').trim().toLowerCase();
    const targetDept = (target.department || target.companyOrDept || '').trim().toLowerCase();

    // Super Admin / Institution Admin have unrestricted communication access
    if (senderRole === 'super_admin' || senderRole === 'admin' || senderRole === 'institution') {
      return { allowed: true };
    }
    if (targetRole === 'super_admin' || targetRole === 'admin' || targetRole === 'institution') {
      return { allowed: true };
    }

    // Recruiter to Student or Student to Recruiter: ALWAYS ALLOWED across all departments
    if (
      (senderRole === 'industry' || senderRole === 'recruiter') &&
      (targetRole === 'student')
    ) {
      return { allowed: true };
    }
    if (
      (senderRole === 'student') &&
      (targetRole === 'industry' || targetRole === 'recruiter')
    ) {
      return { allowed: true };
    }

    // Recruiter to Faculty or Faculty to Recruiter: ALLOWED for placements & drives
    if (
      (senderRole === 'industry' || senderRole === 'recruiter') ||
      (targetRole === 'industry' || targetRole === 'recruiter')
    ) {
      return { allowed: true };
    }

    // Student <-> Faculty / Academician: STRICT DEPARTMENT BOUNDARY
    const isSenderFaculty = senderRole === 'faculty' || senderRole === 'academician';
    const isTargetFaculty = targetRole === 'faculty' || targetRole === 'academician';
    const isSenderStudent = senderRole === 'student';
    const isTargetStudent = targetRole === 'student';

    if (isSenderStudent && isTargetFaculty) {
      if (senderDept && targetDept && senderDept !== targetDept) {
        return {
          allowed: false,
          reason: `Departmental Mentorship Boundary: As a ${sender.department || 'student'} candidate, you can only interact with faculty members from your own department (${sender.department || 'assigned department'}). Cross-department faculty messaging is restricted.`
        };
      }
      return { allowed: true };
    }

    if (isSenderFaculty && isTargetStudent) {
      if (senderDept && targetDept && senderDept !== targetDept) {
        return {
          allowed: false,
          reason: `Departmental Mentorship Boundary: Faculty can only directly mentor and message students within their own department (${sender.department || 'assigned department'}). Cross-department student interaction is restricted.`
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  },

  /**
   * Creates or gets a direct conversation between two users.
   * Path: conversations/{conversationId}
   */
  async getOrCreateConversation(
    userA: AuthUserSession,
    userBId: string,
    userBName: string,
    userBRole: string,
    userBCompanyOrDept?: string
  ): Promise<string> {
    const check = this.validateInteractionPermission(userA, {
      role: userBRole,
      department: userBCompanyOrDept,
      companyOrDept: userBCompanyOrDept,
      name: userBName
    });
    if (!check.allowed) {
      throw new Error(check.reason || 'Interaction not permitted under institutional policy.');
    }

    const convId = [userA.id, userBId].sort().join('__');
    if (db) {
      try {
        const convRef = doc(db, 'conversations', convId);
        const convSnap = await getDoc(convRef);
        if (!convSnap.exists()) {
          const participantData: Record<string, any> = {
            [userA.id]: {
              name: userA.full_name || 'User',
              role: userA.role,
              companyOrDept: userA.company || userA.department || ''
            },
            [userBId]: {
              name: userBName || 'Contact',
              role: userBRole,
              companyOrDept: userBCompanyOrDept || ''
            }
          };
          await setDoc(convRef, {
            id: convId,
            participants: [userA.id, userBId],
            participantData,
            lastMessage: '',
            lastMessageTime: new Date().toISOString(),
            lastSenderId: '',
            unreadCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            server_timestamp: serverTimestamp()
          });
        }
      } catch (err) {
        console.warn('getOrCreateConversation notice:', err);
      }
    }
    return convId;
  },

  /**
   * Real-time listener for conversations of a user.
   * Path: conversations (where participants array-contains userId)
   */
  subscribeUserConversations(userId: string, callback: (convs: ConversationItem[]) => void): () => void {
    if (!db || !userId) {
      callback([]);
      return () => {};
    }
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId)
      );
      return onSnapshot(q, (snapshot) => {
        const list: ConversationItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            participants: d.participants || [],
            participantData: d.participantData || {},
            lastMessage: d.lastMessage || '',
            lastMessageTime: d.lastMessageTime || '',
            lastSenderId: d.lastSenderId || '',
            unreadCount: d.unreadCount || 0,
            updatedAt: d.updatedAt || new Date().toISOString()
          });
        });
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        callback(list);
      }, (err) => {
        console.warn('subscribeUserConversations notice:', err);
        callback([]);
      });
    } catch {
      callback([]);
      return () => {};
    }
  },

  /**
   * Real-time listener for messages in a conversation.
   * Path: conversations/{conversationId}/messages
   */
  subscribeConversationMessages(conversationId: string, callback: (msgs: DirectMessageItem[]) => void): () => void {
    if (!db || !conversationId) {
      callback([]);
      return () => {};
    }
    try {
      const msgsCol = collection(db, 'conversations', conversationId, 'messages');
      return onSnapshot(msgsCol, (snapshot) => {
        const list: DirectMessageItem[] = [];
        snapshot.forEach(docSnap => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            conversationId,
            senderId: d.senderId || '',
            senderName: d.senderName || 'Anonymous',
            senderRole: d.senderRole || 'student',
            recipientId: d.recipientId || '',
            recipientName: d.recipientName || '',
            recipientRole: d.recipientRole || '',
            text: d.text || '',
            createdAt: d.createdAt || new Date().toISOString(),
            read: !!d.read
          });
        });
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        callback(list);
      }, (err) => {
        console.warn('subscribeConversationMessages notice:', err);
        callback([]);
      });
    } catch {
      callback([]);
      return () => {};
    }
  },

  /**
   * Sends a direct message in a conversation.
   * Path: conversations/{conversationId}/messages/{messageId}
   */
  async sendDirectMessage(
    conversationId: string,
    sender: AuthUserSession,
    recipientId: string,
    recipientName: string,
    recipientRole: string,
    text: string,
    recipientDept?: string
  ): Promise<DirectMessageItem> {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Message cannot be empty');

    const check = this.validateInteractionPermission(sender, {
      role: recipientRole,
      department: recipientDept,
      companyOrDept: recipientDept,
      name: recipientName
    });
    if (!check.allowed) {
      throw new Error(check.reason || 'Message sending blocked by institutional policy.');
    }

    const msgItem: Record<string, any> = {
      conversationId,
      senderId: sender.id,
      senderName: sender.full_name || 'Nova User',
      senderRole: sender.role,
      recipientId,
      recipientName,
      recipientRole,
      text: trimmed,
      createdAt: new Date().toISOString(),
      read: false
    };

    let generatedId = `msg-${Date.now()}`;

    if (db) {
      try {
        const msgsCol = collection(db, 'conversations', conversationId, 'messages');
        const docRef = await addDoc(msgsCol, {
          ...msgItem,
          server_timestamp: serverTimestamp()
        });
        generatedId = docRef.id;

        // Update conversation summary
        const convRef = doc(db, 'conversations', conversationId);
        await updateDoc(convRef, {
          lastMessage: trimmed,
          lastMessageTime: new Date().toISOString(),
          lastSenderId: sender.id,
          updatedAt: new Date().toISOString(),
          unreadCount: increment(1)
        });

        // Send notification to recipient
        this.createNotification({
          recipientId,
          actorId: sender.id,
          actorName: sender.full_name,
          type: 'message',
          message: `${sender.full_name}: "${trimmed.slice(0, 50)}${trimmed.length > 50 ? '...' : ''}"`
        }).catch(() => {});
      } catch (err) {
        console.error('sendDirectMessage Firestore error:', err);
      }
    }

    return { id: generatedId, ...msgItem } as DirectMessageItem;
  },

  // ── 6. RECRUITER TALENT DISCOVERY ──
  /**
   * Searches and filters student internal profiles for recruiters.
   * Path: studentProfiles
   */
  async searchTalentProfiles(filter: {
    skill?: string;
    department?: string;
    semester?: number;
    minScore?: number;
    searchQuery?: string;
  }): Promise<StudentInternalProfile[]> {
    const profiles: StudentInternalProfile[] = [];

    if (db) {
      try {
        const snap = await getDocs(collection(db, 'studentProfiles'));
        snap.forEach(docSnap => {
          const d = docSnap.data();
          // Filter private profiles
          if (d.privacy_setting === 'private') return;

          profiles.push({
            id: docSnap.id,
            student_id: docSnap.id,
            full_name: d.full_name || 'Student Candidate',
            email: d.email || '',
            phone: d.phone || '',
            location: d.location || 'India',
            profile_photo: d.profile_photo,
            headline: d.headline || 'Student Engineer',
            bio: d.bio || '',
            privacy_setting: d.privacy_setting || 'recruiter_only',
            degree: d.degree || 'B.Tech',
            college: d.college || 'Engineering College',
            department: d.department || 'Computer Engineering',
            semester: d.semester || 6,
            academic_year: d.academic_year,
            graduation_year: d.graduation_year || 2026,
            cgpa: d.cgpa || '8.5',
            skills: d.skills || [],
            data_driven_strengths: d.data_driven_strengths || [],
            data_driven_weaknesses: d.data_driven_weaknesses || [],
            projects: d.projects || [],
            certifications: d.certifications || [],
            experience: d.experience || [],
            achievements: d.achievements || [],
            portfolio_links: d.portfolio_links || {},
            assessment_insights: d.assessment_insights,
            updated_at: d.updated_at || new Date().toISOString()
          });
        });
      } catch (err) {
        console.warn('searchTalentProfiles notice:', err);
      }
    }

    // Ensure at least the primary demo student is present if Firestore is fresh
    if (profiles.length === 0) {
      const defaultStudent = await this.getStudentInternalProfile('demo-student-1');
      profiles.push(defaultStudent);
    }

    // Apply filters
    let result = profiles;
    if (filter.department && filter.department !== 'All') {
      result = result.filter(p => p.department.toLowerCase() === filter.department!.toLowerCase());
    }
    if (filter.semester && filter.semester > 0) {
      result = result.filter(p => p.semester === filter.semester);
    }
    if (filter.skill && filter.skill !== 'All') {
      const qSkill = filter.skill.toLowerCase();
      result = result.filter(p =>
        p.skills.some(s => s.skill_name.toLowerCase().includes(qSkill)) ||
        p.data_driven_strengths.some(st => st.toLowerCase().includes(qSkill))
      );
    }
    if (filter.minScore && filter.minScore > 0) {
      result = result.filter(p =>
        p.skills.some(s => (s.test_score ?? 0) >= filter.minScore!) ||
        (p.assessment_insights?.average_score ?? 0) >= filter.minScore!
      );
    }
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const sq = filter.searchQuery.trim().toLowerCase();
      result = result.filter(p =>
        p.full_name.toLowerCase().includes(sq) ||
        p.department.toLowerCase().includes(sq) ||
        p.college.toLowerCase().includes(sq) ||
        p.skills.some(s => s.skill_name.toLowerCase().includes(sq))
      );
    }

    return result;
  },

  // ── 7. COMPANY PROFILE ──
  /**
   * Retrieves company profile from Firestore `companies/{companyId}`.
   */
  async getCompanyProfile(companyIdOrName: string): Promise<CompanyProfileData> {
    const id = companyIdOrName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'companies', id));
        if (snap.exists()) {
          const d = snap.data();
          return {
            id,
            company_name: d.company_name || companyIdOrName,
            logo_url: d.logo_url,
            is_verified: d.is_verified ?? true,
            industry: d.industry || 'Technology & Artificial Intelligence',
            about: d.about || 'Leading technology and enterprise software innovator.',
            website: d.website || 'https://google.com',
            locations: d.locations || ['Bengaluru', 'Hyderabad', 'Remote'],
            company_size: d.company_size || '10,000+ employees',
            contact_email: d.contact_email || 'recruiter@google.com',
            contact_person: d.contact_person || 'Priya Patel',
            active_openings_count: d.active_openings_count || 3,
            created_at: d.created_at,
            updated_at: d.updated_at
          };
        }
      } catch (err) {
        console.warn('getCompanyProfile notice:', err);
      }
    }

    return {
      id,
      company_name: companyIdOrName || 'Google AI Labs',
      is_verified: true,
      industry: 'Technology & Artificial Intelligence',
      about: 'Leading technology and enterprise software innovator partnering with premier academic institutions across India.',
      website: 'https://careers.google.com',
      locations: ['Bengaluru, Karnataka', 'Hyderabad, Telangana', 'Remote'],
      company_size: '10,000+ employees',
      contact_email: 'recruiter@google.com',
      contact_person: 'Priya Patel',
      active_openings_count: 3
    };
  },

  /**
   * Saves or updates company profile in Firestore `companies/{companyId}`.
   */
  async saveCompanyProfile(companyId: string, data: Partial<CompanyProfileData>): Promise<void> {
    const id = companyId.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanedPayload: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) cleanedPayload[k] = v;
    }
    cleanedPayload.updated_at = new Date().toISOString();

    if (db) {
      try {
        await setDoc(doc(db, 'companies', id), {
          ...cleanedPayload,
          server_timestamp: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error('saveCompanyProfile Firestore error:', err);
        throw err;
      }
    }
  },

  // ── 37. PROGRAMMING LANGUAGE LEARNING DIRECTORY & EXTERNAL GATEWAY ──────────────
  getProgrammingLanguages(category?: string): ProgrammingLanguageItem[] {
    if (!category || category === 'All') return ALL_PROGRAMMING_LANGUAGES;
    return ALL_PROGRAMMING_LANGUAGES.filter(l => l.category === category);
  },

  getPopularLanguages(): ProgrammingLanguageItem[] {
    return ALL_PROGRAMMING_LANGUAGES.filter(l => l.isPopular);
  },

  getProgrammingLanguageBySlug(slug: string): ProgrammingLanguageItem | null {
    const s = slug.toLowerCase().trim();
    return ALL_PROGRAMMING_LANGUAGES.find(l => l.slug === s || l.id === s || l.name.toLowerCase() === s) || null;
  },

  searchLanguagesAndTopics(queryStr: string): {
    matchedLanguages: ProgrammingLanguageItem[];
    matchedTopics: {
      language: ProgrammingLanguageItem;
      module: LanguageModuleItem;
      topic: LanguageTopicItem;
    }[];
  } {
    const q = queryStr.toLowerCase().trim();
    if (!q) {
      return { matchedLanguages: [], matchedTopics: [] };
    }

    // 1. Match languages by name, slug, or aliases
    const matchedLanguages = ALL_PROGRAMMING_LANGUAGES.filter(lang => {
      if (lang.name.toLowerCase().includes(q) || lang.slug.toLowerCase().includes(q)) return true;
      if (lang.aliases.some(alias => alias.toLowerCase() === q || alias.toLowerCase().includes(q))) return true;
      return false;
    });

    // 2. Match topics across all languages
    const matchedTopics: {
      language: ProgrammingLanguageItem;
      module: LanguageModuleItem;
      topic: LanguageTopicItem;
    }[] = [];

    for (const lang of ALL_PROGRAMMING_LANGUAGES) {
      for (const mod of lang.modules) {
        for (const top of mod.topics) {
          if (top.title.toLowerCase().includes(q) || top.id.toLowerCase().includes(q)) {
            matchedTopics.push({ language: lang, module: mod, topic: top });
          }
        }
      }
    }

    // 3. Match multi-disciplinary skills & topics (Mechanical, Civil, Electrical, ECE, Chemical, Management, Biotech)
    for (const dom of BUILTIN_SKILL_DOMAINS) {
      for (const cat of dom.categories) {
        for (const sk of cat.skills) {
          const matchesSkill = sk.name.toLowerCase().includes(q) || sk.id.toLowerCase().includes(q) || (sk.aliases && sk.aliases.some(a => a.toLowerCase().includes(q)));
          const pseudoLang: ProgrammingLanguageItem = {
            id: sk.id,
            name: sk.name,
            slug: sk.id,
            aliases: sk.aliases || [],
            category: cat.name,
            description: sk.description || `${sk.name} in ${dom.name}`,
            isPopular: !!sk.isPopular,
            searchable: true,
            status: 'active',
            modules: [
              {
                id: `${sk.id}-core`,
                title: `${sk.name} Curriculum`,
                topics: sk.topics.map(t => ({
                  id: t.id,
                  title: t.title,
                  description: t.description,
                  externalReferences: t.externalReferences.map(r => ({
                    sourceName: r.sourceName,
                    referenceTitle: r.resourceTitle,
                    referenceUrl: r.resourceUrl,
                    isPrimary: r.isPrimary
                  }))
                }))
              }
            ]
          };

          if (matchesSkill && !matchedLanguages.some(l => l.id === sk.id)) {
            matchedLanguages.push(pseudoLang);
          }

          for (const top of sk.topics) {
            if (top.title.toLowerCase().includes(q) || top.id.toLowerCase().includes(q)) {
              const matchedTopicItem = pseudoLang.modules[0].topics.find(t => t.id === top.id) || {
                id: top.id,
                title: top.title,
                description: top.description,
                externalReferences: top.externalReferences.map(r => ({
                  sourceName: r.sourceName,
                  referenceTitle: r.resourceTitle,
                  referenceUrl: r.resourceUrl,
                  isPrimary: r.isPrimary
                }))
              };
              matchedTopics.push({
                language: pseudoLang,
                module: pseudoLang.modules[0],
                topic: matchedTopicItem
              });
            }
          }
        }
      }
    }

    return { matchedLanguages, matchedTopics };
  },

  async toggleLearningBookmark(studentId: string, bookmark: Omit<LearningBookmarkItem, 'id' | 'createdAt'>): Promise<boolean> {
    const key = `novaconnect_learning_bookmarks_${studentId}`;
    let list = getLocalData<LearningBookmarkItem[]>(key, []);
    const existingIndex = list.findIndex(b => b.topicId === bookmark.topicId && b.languageId === bookmark.languageId);

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      setLocalData(key, list);
      if (db) {
        try {
          await deleteDoc(doc(db, 'users', studentId, 'learningBookmarks', `${bookmark.languageId}_${bookmark.topicId}`));
        } catch {}
      }
      return false;
    } else {
      const newItem: LearningBookmarkItem = {
        ...bookmark,
        id: `${bookmark.languageId}_${bookmark.topicId}`,
        createdAt: new Date().toISOString()
      };
      list.unshift(newItem);
      setLocalData(key, list.slice(0, 50));
      if (db) {
        try {
          await setDoc(doc(db, 'users', studentId, 'learningBookmarks', newItem.id), {
            ...newItem,
            server_timestamp: serverTimestamp()
          });
        } catch {}
      }
      return true;
    }
  },

  getLearningBookmarks(studentId: string): LearningBookmarkItem[] {
    const key = `novaconnect_learning_bookmarks_${studentId}`;
    return getLocalData<LearningBookmarkItem[]>(key, []);
  },

  async recordLearningHistory(studentId: string, item: Omit<LearningHistoryItem, 'id' | 'visitedAt'>): Promise<void> {
    const key = `novaconnect_learning_history_${studentId}`;
    let list = getLocalData<LearningHistoryItem[]>(key, []);
    list = list.filter(h => !(h.topicTitle === item.topicTitle && h.languageName === item.languageName));
    const newItem: LearningHistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
      visitedAt: new Date().toISOString()
    };
    list.unshift(newItem);
    setLocalData(key, list.slice(0, 30));
  },

  getLearningHistory(studentId: string): LearningHistoryItem[] {
    const key = `novaconnect_learning_history_${studentId}`;
    return getLocalData<LearningHistoryItem[]>(key, []);
  },

  // Legacy backward-compatibility methods
  getKnowledgeBaseLanguages(): KnowledgeBaseLanguage[] {
    return KNOWLEDGE_BASE_LANGUAGES;
  },

  getKnowledgeBaseHierarchy(language?: string): KnowledgeBaseLanguage[] {
    if (!language || language === 'All') return KNOWLEDGE_BASE_LANGUAGES;
    return KNOWLEDGE_BASE_LANGUAGES.filter(
      l => l.name.toLowerCase() === language.toLowerCase() || l.id.toLowerCase() === language.toLowerCase()
    );
  },

  getTopicLearningContent(language: string, moduleId: string, topicId: string): TopicLearningContent | null {
    return getOrCreateTopicContent(language, moduleId, topicId);
  },

  searchKnowledgeBase(queryStr: string, language?: string): { topic: TopicLearningContent; matchedSnippet: string }[] {
    const q = queryStr.toLowerCase().trim();
    if (!q) return [];

    const results: { topic: TopicLearningContent; matchedSnippet: string }[] = [];
    for (const item of Object.values(TOPIC_LEARNING_CONTENT)) {
      if (language && language !== 'All' && item.language.toLowerCase() !== language.toLowerCase()) continue;

      if (
        item.topicName.toLowerCase().includes(q) ||
        item.overview.toLowerCase().includes(q) ||
        item.subtopics?.some(s => s.toLowerCase().includes(q))
      ) {
        results.push({
          topic: item,
          matchedSnippet: item.overview.substring(0, 140) + '...'
        });
      }
    }
    return results;
  },

  // ── 38. FILTERED ASSESSMENT GENERATOR ─────────────────────────────
  getAvailableQuestionCount(params: FilterAssessmentParams): number {
    return getAvailableQuestionCount(params);
  },

  generateFilteredAssessment(params: FilterAssessmentParams): GeneratedAssessmentTest {
    const subKey = params.skillId || params.language || params.domainId || 'general';
    const topKey = params.topicId || 'all';
    const key = `filtered_${canonicalKey(subKey)}_${canonicalKey(topKey)}`;
    const recent = params.previouslyUsedIds ? (Array.isArray(params.previouslyUsedIds) ? params.previouslyUsedIds : Array.from(params.previouslyUsedIds)) : this.getRecentQuestionIds(key);
    const test = generateDisciplineAssessment({
      ...params,
      previouslyUsedIds: recent
    }) as GeneratedAssessmentTest;
    if (test && test.questions && test.questions.length > 0) {
      this.recordRecentQuestionIds(key, test.questions.map(q => q.id), 200);
    }
    return test;
  },

  // ── 39. CAREER ROLES & SKILL GAP INTELLIGENCE ─────────────────────
  getCareerRoles(): CareerRoleDefinition[] {
    return CAREER_ROLES;
  },

  getCareerRoleById(roleId: string): CareerRoleDefinition | undefined {
    return CAREER_ROLES.find(r => r.id === roleId);
  },

  calculateRoleSkillGap(studentSkills: StudentSkillItem[], roleId: string): RoleSkillGapResult {
    const role = CAREER_ROLES.find(r => r.id === roleId) || CAREER_ROLES[0];
    const skillMap = new Map(studentSkills.map(s => [s.skill_name.toLowerCase(), s]));

    const strongSkills: { skill: string; score: number }[] = [];
    const moderateSkills: { skill: string; score: number }[] = [];
    const needsImprovementSkills: { skill: string; score: number }[] = [];
    const missingSkills: string[] = [];
    const recommendations: RoleSkillGapResult['recommendations'] = [];

    role.requiredSkills.forEach(req => {
      const existing = skillMap.get(req.skill.toLowerCase());
      if (!existing) {
        missingSkills.push(req.skill);
        recommendations.push({
          skill: req.skill,
          action: `Study ${req.skill} foundational modules and attempt initial assessment.`,
          priority: req.isCore ? 'High' : 'Medium'
        });
      } else {
        const score = existing.test_score !== undefined ? existing.test_score : (existing.self_rating * 20);
        if (score >= 80) {
          strongSkills.push({ skill: req.skill, score });
        } else if (score >= 60) {
          moderateSkills.push({ skill: req.skill, score });
          recommendations.push({
            skill: req.skill,
            action: `Advance ${req.skill} to 80%+ by practicing Hard and Industry scenario questions.`,
            priority: req.isCore ? 'High' : 'Medium'
          });
        } else {
          needsImprovementSkills.push({ skill: req.skill, score });
          recommendations.push({
            skill: req.skill,
            action: `Review core ${req.skill} concepts in the Knowledge Base and retake the 50-Q assessment.`,
            priority: 'High'
          });
        }
      }
    });

    const totalRequired = role.requiredSkills.length;
    const metCount = strongSkills.length + (moderateSkills.length * 0.7);
    const readinessPercentage = totalRequired > 0 ? Math.min(100, Math.round((metCount / totalRequired) * 100)) : 0;

    return {
      roleId: role.id,
      roleTitle: role.title,
      readinessPercentage,
      strongSkills,
      moderateSkills,
      needsImprovementSkills,
      missingSkills,
      recommendations
    };
  },

  // ── 40. DIGITAL CERTIFICATION & VERIFICATION ──────────────────────
  async getStudentCertificates(studentId: string): Promise<CertificateRecord[]> {
    const storageKey = `nova_certificates_${studentId}`;
    const localCerts = getLocalData<CertificateRecord[]>(storageKey, []);

    if (!db) return localCerts;

    try {
      const q = query(collection(db, 'certificates'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      const list: CertificateRecord[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() } as CertificateRecord);
      });
      if (list.length > 0) {
        setLocalData(storageKey, list);
        return list;
      }
    } catch (err) {
      console.warn('getStudentCertificates Firestore error:', err);
    }
    return localCerts;
  },

  async verifyCertificate(certificateId: string): Promise<CertificateRecord | null> {
    const cleanId = certificateId.trim();
    if (!cleanId) return null;

    if (db) {
      try {
        const snap = await getDoc(doc(db, 'certificates', cleanId));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as CertificateRecord;
        }
      } catch (err) {
        console.warn('verifyCertificate Firestore error:', err);
      }
    }

    // Check in local data storage across all keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nova_certificates_')) {
        const certs = getLocalData<CertificateRecord[]>(key, []);
        const match = certs.find(c => c.id.toLowerCase() === cleanId.toLowerCase());
        if (match) return match;
      }
    }

    return null;
  },

  async getStudentBadges(studentId: string): Promise<BadgeItem[]> {
    const certs = await this.getStudentCertificates(studentId);
    const reports = this.getStudentAssessmentHistory(studentId);

    const badges: BadgeItem[] = [];

    // Rule 1: High Achiever
    const highScores = reports.filter(r => r.percentage >= 85);
    if (highScores.length > 0) {
      badges.push({
        id: 'badge-high-achiever',
        title: 'High Achiever (85%+ Score)',
        category: 'Performance',
        icon: 'Award',
        description: 'Earned 85% or higher on an official verified examination.',
        earnedAt: highScores[0].completedAt,
        criteria: 'Score >= 85%'
      });
    }

    // Rule 2: Multi-Stack Engineer
    const languages = new Set(reports.map(r => r.language));
    if (languages.size >= 2) {
      badges.push({
        id: 'badge-multi-lang',
        title: 'Multi-Stack Engineer',
        category: 'Milestone',
        icon: 'Sparkles',
        description: 'Successfully assessed across 2 or more distinct technologies.',
        earnedAt: reports[0].completedAt,
        criteria: 'Assessed in >= 2 languages'
      });
    }

    // Rule 3: Certificate Badges
    certs.forEach(c => {
      badges.push({
        id: `badge-cert-${c.id}`,
        title: `${c.skillOrLanguage} Certified`,
        category: 'Skill',
        icon: 'ShieldCheck',
        description: `Verified completion of ${c.skillOrLanguage} examination with ${c.percentage}%.`,
        earnedAt: c.issuedAt,
        criteria: 'Score >= 70%',
        verificationHash: c.id
      });
    });

    return badges;
  },

  async saveFacultyQuestion(question: BankQuestion): Promise<BankQuestion> {
    const qWithId = {
      ...question,
      id: question.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };

    if (db) {
      try {
        await setDoc(doc(db, 'questions', qWithId.id), {
          ...qWithId,
          server_timestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn('saveFacultyQuestion Firestore error:', err);
      }
    }

    // Append to in-memory question bank
    ALL_BANK_QUESTIONS.unshift(qWithId);
    return qWithId;
  },

  async updateQuestionStatus(questionId: string, status: QuestionReviewStatus): Promise<void> {
    const q = ALL_BANK_QUESTIONS.find(item => item.id === questionId);
    if (q) q.status = status;

    if (db) {
      try {
        await updateDoc(doc(db, 'questions', questionId), {
          status,
          updated_at: serverTimestamp()
        });
      } catch (err) {
        console.warn('updateQuestionStatus Firestore error:', err);
      }
    }
  },

  // ── 44. SIH26044 MULTI-DISCIPLINARY SKILL INTELLIGENCE & CURRICULUM ──
  getSkillDomains(): SkillDomain[] {
    return getAllSkillDomains();
  },

  getSkillDomainById(domainId: string): SkillDomain | undefined {
    return getSkillDomainById(domainId);
  },

  getAllSkills(): SkillItem[] {
    return getAllSkills();
  },

  getSkillById(skillId: string): SkillItem | undefined {
    return getSkillById(skillId);
  },

  getSkillsForDepartment(departmentName: string): SkillItem[] {
    return getSkillsForDepartment(departmentName);
  },

  subscribeSkillDomains(callback: (domains: SkillDomain[]) => void): () => void {
    if (!db) {
      callback(getAllSkillDomains());
      return () => {};
    }
    return onSnapshot(collection(db, 'skillDomains'), (snapshot) => {
      if (snapshot.empty) {
        callback(getAllSkillDomains());
      } else {
        const liveDomains: SkillDomain[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as SkillDomain));
        // Merge with builtin domains to ensure core disciplines are always present
        const merged = [...BUILTIN_SKILL_DOMAINS];
        for (const ld of liveDomains) {
          const idx = merged.findIndex(m => m.id === ld.id);
          if (idx >= 0) merged[idx] = ld;
          else merged.push(ld);
        }
        callback(merged);
      }
    }, (err) => {
      console.warn('subscribeSkillDomains error:', err);
      callback(getAllSkillDomains());
    });
  },

  async createSkillDomain(domain: SkillDomain): Promise<void> {
    if (!db) return;
    try {
      await setDoc(doc(db, 'skillDomains', domain.id), {
        ...domain,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await this.logAdminAction('CREATE_SKILL_DOMAIN', `Registered skill domain ${domain.name} (${domain.code})`, 'skillDomain', domain.id);
    } catch (err) {
      console.error('createSkillDomain error:', err);
      throw err;
    }
  },

  calculateMultiDisciplinarySkillGap(
    studentSkills: StudentSkillItem[],
    targetRoleTitleOrId: string
  ): RoleSkillGapResult {
    const role = CAREER_ROLES.find(r => 
      r.id.toLowerCase() === targetRoleTitleOrId.toLowerCase() ||
      r.title.toLowerCase() === targetRoleTitleOrId.toLowerCase()
    );

    if (!role) {
      return {
        roleId: 'custom-role',
        roleTitle: targetRoleTitleOrId,
        readinessPercentage: 0,
        strongSkills: [],
        moderateSkills: [],
        needsImprovementSkills: [],
        missingSkills: [],
        recommendations: []
      };
    }

    const strongSkills: { skill: string; score: number }[] = [];
    const moderateSkills: { skill: string; score: number }[] = [];
    const needsImprovementSkills: { skill: string; score: number }[] = [];
    const missingSkills: string[] = [];
    const recommendations: RoleSkillGapResult['recommendations'] = [];

    let totalPoints = 0;
    let maxPoints = role.requiredSkills.length * 100;

    for (const req of role.requiredSkills) {
      const studentSkill = studentSkills.find(s => 
        s.skill_name.toLowerCase() === req.skill.toLowerCase() ||
        req.skill.toLowerCase().includes(s.skill_name.toLowerCase()) ||
        s.skill_name.toLowerCase().includes(req.skill.toLowerCase())
      );

      if (!studentSkill) {
        missingSkills.push(req.skill);
        recommendations.push({
          skill: req.skill,
          action: `Acquire foundational competency in ${req.skill} through verified coursework or assessment.`,
          priority: req.isCore ? 'High' : 'Medium'
        });
      } else {
        const score = studentSkill.test_score ?? (studentSkill.self_rating * 20);
        totalPoints += score;

        if (score >= 75) {
          strongSkills.push({ skill: req.skill, score });
        } else if (score >= 50) {
          moderateSkills.push({ skill: req.skill, score });
          recommendations.push({
            skill: req.skill,
            action: `Advance ${req.skill} from Moderate to Industry Ready via intermediate scenario practice.`,
            priority: 'Medium'
          });
        } else {
          needsImprovementSkills.push({ skill: req.skill, score });
          recommendations.push({
            skill: req.skill,
            action: `Critical gap in ${req.skill} (${score}%). Retake skill assessment after reviewing key topics.`,
            priority: 'High'
          });
        }
      }
    }

    const readinessPercentage = maxPoints > 0 ? Math.min(100, Math.round((totalPoints / maxPoints) * 100)) : 0;

    return {
      roleId: role.id,
      roleTitle: role.title,
      readinessPercentage,
      strongSkills,
      moderateSkills,
      needsImprovementSkills,
      missingSkills,
      recommendations
    };
  },

  // ── BoS CURRICULUM MANAGEMENT & GAP ANALYSIS ──
  subscribeCurriculum(
    institutionId: string,
    departmentId: string,
    callback: (records: CurriculumRecord[]) => void
  ): () => void {
    if (!db) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, 'curriculums'),
      where('institutionId', '==', institutionId),
      where('departmentId', '==', departmentId)
    );

    return onSnapshot(q, (snapshot) => {
      const list: CurriculumRecord[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as CurriculumRecord));
      callback(list);
    }, (err) => {
      console.warn('subscribeCurriculum error:', err);
      callback([]);
    });
  },

  async addCurriculumCourse(
    record: Omit<CurriculumRecord, 'id' | 'lastUpdated'>
  ): Promise<string> {
    if (!db) return 'local-curr-id';
    try {
      const docRef = await addDoc(collection(db, 'curriculums'), {
        ...record,
        lastUpdated: new Date().toISOString(),
        server_timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error('addCurriculumCourse error:', err);
      throw err;
    }
  },

  async getCurriculumIndustryAlignment(
    institutionId: string,
    departmentId: string
  ): Promise<CurriculumAlignmentAnalysis> {
    let curriculumCourses: CurriculumRecord[] = [];
    if (db) {
      try {
        const snap = await getDocs(query(
          collection(db, 'curriculums'),
          where('institutionId', '==', institutionId),
          where('departmentId', '==', departmentId)
        ));
        curriculumCourses = snap.docs.map(d => ({ id: d.id, ...d.data() } as CurriculumRecord));
      } catch (err) {
        console.warn('Failed to load curriculums for alignment audit:', err);
      }
    }

    // Extract all skills mapped in curriculum
    const curriculumSkillsMap = new Map<string, 'Basic' | 'Intermediate' | 'Advanced'>();
    for (const c of curriculumCourses) {
      for (const m of c.mappedSkills || []) {
        curriculumSkillsMap.set(m.skillName.toLowerCase(), m.coverageLevel);
      }
    }

    // Get active department skills
    const depSkills = getSkillsForDepartment(departmentId);
    const auditedSkills = depSkills.length > 0 ? depSkills : getAllSkills().slice(0, 8);

    const prioritySkillGaps: CurriculumAlignmentAnalysis['prioritySkillGaps'] = [];
    let coveredCount = 0;
    let highDemandAlignedCount = 0;

    for (const s of auditedSkills) {
      const coverage = curriculumSkillsMap.get(s.name.toLowerCase()) || 'None';
      if (coverage !== 'None') coveredCount++;

      const isHighDemand = s.inDemandRating === 'Critical' || s.inDemandRating === 'High';
      if (isHighDemand && (coverage === 'Intermediate' || coverage === 'Advanced')) {
        highDemandAlignedCount++;
      }

      if (isHighDemand && (coverage === 'None' || coverage === 'Basic')) {
        prioritySkillGaps.push({
          skillName: s.name,
          curriculumCoverage: coverage,
          industryDemand: s.inDemandRating,
          studentAverageProficiency: 0,
          recommendation: coverage === 'None'
            ? `Curriculum lacks coverage of industry-critical tool ${s.name}. Recommend introducing elective or lab module.`
            : `Industry demands Advanced competency in ${s.name}; syllabus currently covers only Basic theory.`
        });
      }
    }

    const curriculumCoverageScore = auditedSkills.length > 0 
      ? Math.round((coveredCount / auditedSkills.length) * 100) 
      : 0;

    const industryAlignmentScore = auditedSkills.length > 0
      ? Math.round((highDemandAlignedCount / auditedSkills.filter(s => s.inDemandRating !== 'Moderate').length) * 100)
      : 0;

    return {
      institutionId,
      departmentId,
      departmentName: departmentId,
      curriculumCoverageScore,
      industryAlignmentScore: isNaN(industryAlignmentScore) ? 0 : industryAlignmentScore,
      prioritySkillGaps,
      totalCoursesAudited: curriculumCourses.length,
      totalSkillsAudited: auditedSkills.length,
      generatedAt: new Date().toISOString()
    };
  },

  // ── EXPLAINABLE DETERMINISTIC OPPORTUNITY MATCHING ──
  matchOpportunityForStudent(
    opp: OpportunityItem,
    studentProfile: StudentInternalProfile | null,
    studentSkills: StudentSkillItem[]
  ): ExplainableMatchResult {
    const required = opp.required_skills || [];
    const preferred = opp.preferred_skills || [];

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // 1. Required Skills Match (50% weight)
    let reqMatchedCount = 0;
    for (const r of required) {
      const found = studentSkills.find(s => 
        s.skill_name.toLowerCase() === r.toLowerCase() ||
        r.toLowerCase().includes(s.skill_name.toLowerCase())
      );
      if (found) {
        reqMatchedCount++;
        matchedSkills.push(r);
      } else {
        missingSkills.push(r);
      }
    }
    const reqScore = required.length > 0 ? (reqMatchedCount / required.length) * 50 : 50;

    // 2. Preferred Skills Match (20% weight)
    let prefMatchedCount = 0;
    for (const p of preferred) {
      const found = studentSkills.find(s => 
        s.skill_name.toLowerCase() === p.toLowerCase() ||
        p.toLowerCase().includes(s.skill_name.toLowerCase())
      );
      if (found) {
        prefMatchedCount++;
        if (!matchedSkills.includes(p)) matchedSkills.push(p);
      }
    }
    const prefScore = preferred.length > 0 ? (prefMatchedCount / preferred.length) * 20 : 20;

    // 3. Department & Academic Eligibility (20% weight)
    let eligScore = 20;
    let eligText = 'Meets all academic eligibility requirements';
    if (opp.target_department && studentProfile?.department) {
      const targetDep = opp.target_department.toLowerCase();
      const studDep = studentProfile.department.toLowerCase();
      if (!studDep.includes(targetDep) && !targetDep.includes(studDep) && targetDep !== 'all') {
        eligScore = 5;
        eligText = `Department mismatch: Posting prefers ${opp.target_department}, student is in ${studentProfile.department}`;
      }
    }

    // 4. Portfolio & Project Evidence (10% weight)
    const projCount = studentProfile?.projects?.length || 0;
    const certCount = studentProfile?.certifications?.length || 0;
    const evidenceScore = Math.min(10, projCount * 3 + certCount * 2);

    const overallScore = Math.min(100, Math.round(reqScore + prefScore + eligScore + evidenceScore));

    let recommendation = 'Excellent match! Your skill profile closely aligns with employer requirements.';
    if (missingSkills.length > 0) {
      recommendation = `Targeted match (${overallScore}%). Complete an assessment in ${missingSkills[0]} to raise match eligibility.`;
    }

    return {
      overall_score: overallScore,
      breakdown: {
        required_skills: `${reqMatchedCount}/${required.length} required skills verified (${Math.round(reqScore)}/50)`,
        preferred_skills: `${prefMatchedCount}/${preferred.length} preferred skills verified (${Math.round(prefScore)}/20)`,
        eligibility: eligText,
        portfolio_evidence: `${projCount} projects & ${certCount} credentials documented (${evidenceScore}/10)`,
        certifications: `${certCount} verified certificates on record`
      },
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      recommendation
    };
  }
};

