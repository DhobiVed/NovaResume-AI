import type { IndustryPostItem, AuthUserSession } from '../types/careerConnect';

export type DiscoveryMode = 'smart' | 'trending' | 'department' | 'recruiter' | 'latest';

export interface ScoredFeedItem {
  post: IndustryPostItem;
  feedKey: string;
  score: number;
  isResurfaced: boolean;
  resurfacedReason?: string;
}

/**
 * Scalable Social Feed & Search Engine
 * Implements an Instagram Reels / LinkedIn Discovery ranking algorithm:
 * - Dynamic composite scoring (Recency + Engagement + Department Relevance + Serendipity Jitter)
 * - Safe cyclic re-surfacing of high-value recruiter posts without consecutive duplicates
 * - Full-text search indexing across 1,000+ posts
 */
export const feedAlgorithmService = {
  calculateEngagementScore(post: IndustryPostItem): number {
    const likes = post.likes_count || 0;
    const comments = post.comments_count || 0;
    const saves = post.saves_count || 0;
    const views = post.views_count || 0;
    return (likes * 3) + (comments * 5) + (saves * 4) + (views * 0.15);
  },

  calculateRecencyFactor(isoDate: string): number {
    try {
      const postTime = new Date(isoDate).getTime();
      const now = Date.now();
      const ageHours = Math.max(0, (now - postTime) / (1000 * 60 * 60));
      return Math.exp(-ageHours / 72);
    } catch {
      return 0.5;
    }
  },

  calculateRelevanceBoost(post: IndustryPostItem, session: AuthUserSession | null): number {
    let boost = 0;
    const candidateDept = (session?.department || '').trim().toLowerCase();
    const postDept = (post.target_department || '').trim().toLowerCase();

    // Universal recruiter broadcast: always visible to all students
    if (!postDept || postDept === 'all departments' || postDept === 'all engineering') {
      boost += 25;
    } else if (candidateDept && postDept === candidateDept) {
      boost += 45; // High relevance boost for student's own department
    }

    // Recruiter / Verified company boost
    if (post.is_verified) boost += 15;
    if (post.primary_apply_url) boost += 10;
    if (post.post_type === 'Job' || post.post_type === 'Internship' || post.post_type === 'Placement Drive') {
      boost += 20;
    }

    return boost;
  },

  scorePost(post: IndustryPostItem, session: AuthUserSession | null, seedJitter: number = 0): number {
    const recency = this.calculateRecencyFactor(post.created_at) * 40;
    const rawEng = this.calculateEngagementScore(post);
    const engagement = Math.min(120, Math.log2(1 + rawEng) * 15);
    const relevance = this.calculateRelevanceBoost(post, session);
    return recency + engagement + relevance + seedJitter;
  },

  searchPosts(posts: IndustryPostItem[], query: string): IndustryPostItem[] {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return posts;

    const tokens = trimmed.split(/\s+/).filter(Boolean);

    return posts.filter(p => {
      const searchableText = [
        p.company_name,
        p.author_name,
        p.message,
        p.post_type,
        p.target_department,
        p.target_college,
        p.target_city,
        ...(p.skills || [])
      ].join(' ').toLowerCase();

      return tokens.every(tok => searchableText.includes(tok));
    });
  },

  buildDiscoveryFeed(
    posts: IndustryPostItem[],
    sessionOrOptions?: AuthUserSession | null | {
      mode?: DiscoveryMode;
      session?: AuthUserSession | null;
      userDepartment?: string;
      allowResurfacing?: boolean;
      enableResurfacing?: boolean;
      minDistance?: number;
      minResurfaceGap?: number;
      maxTotalItems?: number;
    },
    modeArg: DiscoveryMode = 'smart',
    optionsArg?: { enableResurfacing?: boolean; minResurfaceGap?: number }
  ): ScoredFeedItem[] {
    if (!posts || posts.length === 0) return [];

    let session: AuthUserSession | null = null;
    let mode: DiscoveryMode = modeArg;
    let enableResurfacing: boolean = optionsArg?.enableResurfacing ?? true;
    let minGap: number = optionsArg?.minResurfaceGap ?? 12;

    if (sessionOrOptions && ('mode' in sessionOrOptions || 'userDepartment' in sessionOrOptions || 'allowResurfacing' in sessionOrOptions || 'enableResurfacing' in sessionOrOptions)) {
      const opts = sessionOrOptions as any;
      mode = opts.mode || 'smart';
      enableResurfacing = opts.allowResurfacing ?? opts.enableResurfacing ?? true;
      minGap = opts.minDistance ?? opts.minResurfaceGap ?? 12;
      session = opts.session || (opts.userDepartment ? { department: opts.userDepartment } as any : null);
    } else {
      session = (sessionOrOptions as AuthUserSession) || null;
      enableResurfacing = optionsArg?.enableResurfacing ?? (posts.length >= 8);
    }

    let scored: ScoredFeedItem[] = [];

    switch (mode) {
      case 'latest':
        scored = [...posts]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map(p => ({
            post: p,
            feedKey: p.id,
            score: 0,
            isResurfaced: false
          }));
        break;

      case 'trending':
        scored = [...posts]
          .map(p => ({
            post: p,
            feedKey: p.id,
            score: this.calculateEngagementScore(p),
            isResurfaced: false
          }))
          .sort((a, b) => b.score - a.score);
        break;

      case 'department':
        scored = [...posts]
          .map(p => {
            const userDept = (session?.department || '').toLowerCase();
            const pDept = (p.target_department || '').toLowerCase();
            const isMatch = userDept && (pDept === userDept || pDept.includes(userDept));
            const score = isMatch ? 100 : (pDept === 'all departments' ? 60 : 10);
            return {
              post: p,
              feedKey: p.id,
              score,
              isResurfaced: false
            };
          })
          .sort((a, b) => b.score - a.score);
        break;

      case 'recruiter':
        scored = posts
          .filter(p => p.company_name || p.is_verified || ['Job', 'Internship', 'Placement Drive', 'Industry Project', 'Workshop', 'Announcement'].includes(p.post_type))
          .map(p => ({
            post: p,
            feedKey: p.id,
            score: this.calculateEngagementScore(p) + (p.is_verified ? 30 : 0),
            isResurfaced: false
          }))
          .sort((a, b) => b.score - a.score);
        break;

      case 'smart':
      default:
        scored = posts.map((p) => {
          const hash = p.id.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
          const jitter = (Math.abs(hash % 30) - 10);
          const score = this.scorePost(p, session, jitter);
          return {
            post: p,
            feedKey: p.id,
            score,
            isResurfaced: false
          };
        }).sort((a, b) => b.score - a.score);
        break;
    }

    if (!enableResurfacing || mode === 'latest' || scored.length < 12) {
      return scored;
    }

    const topPerformers = scored
      .filter(item => {
        const eng = this.calculateEngagementScore(item.post);
        return eng >= 2 || item.post.is_verified;
      })
      .slice(0, Math.min(20, Math.floor(scored.length * 0.25)));

    if (topPerformers.length === 0) return scored;

    const result: ScoredFeedItem[] = [];
    const lastSeenIndexMap = new Map();

    let topIndex = 0;
    for (let i = 0; i < scored.length; i++) {
      const current = scored[i];
      result.push(current);
      lastSeenIndexMap.set(current.post.id, result.length - 1);

      if (i > 0 && i % minGap === 0 && topPerformers.length > 0) {
        const candidate = topPerformers[topIndex % topPerformers.length];
        topIndex++;

        const lastPos = lastSeenIndexMap.get(candidate.post.id);
        if (lastPos === undefined || (result.length - lastPos) >= minGap) {
          result.push({
            post: candidate.post,
            feedKey: `${candidate.post.id}__resurfaced_${result.length}`,
            score: candidate.score * 0.85,
            isResurfaced: true,
            resurfacedReason: (candidate.post.likes_count || 0) > 3
              ? 'Trending Opportunity'
              : 'Recommended for You • Re-surfaced'
          });
          lastSeenIndexMap.set(candidate.post.id, result.length - 1);
        }
      }
    }

    return result;
  }
};
