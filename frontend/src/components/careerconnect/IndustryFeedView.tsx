import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search, ExternalLink, Bookmark, BookmarkCheck,
  Share2, Building2, ShieldCheck, Sparkles,
  Tag, ChevronDown, ChevronUp, ArrowUpRight,
  X, Heart, MessageSquare, Eye, Send,
  Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Clock, MapPin, Flame, SlidersHorizontal, ArrowDown
} from 'lucide-react';
import { careerConnectService } from '../../services/careerConnectService';
import { feedAlgorithmService, type DiscoveryMode } from '../../services/feedAlgorithmService';
import type {
  IndustryPostItem, AuthUserSession, IndustryPostType,
  PostCommentItem
} from '../../types/careerConnect';

interface Props {
  session: AuthUserSession | null;
  onApplyInternal?: (postId: string) => void;
  appliedPostIds?: Set<string>;
  onOpenDirectMessage?: (contact: { id: string; name: string; role: string; companyOrDept?: string }) => void;
}

const POST_TYPES: (IndustryPostType | 'All')[] = [
  'All',
  'Internship',
  'Job',
  'Placement Drive',
  'Industry Project',
  'Workshop',
  'Event',
  'Announcement'
];

const DEPARTMENTS = [
  'All Departments',
  'Computer Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Electrical Engineering'
];

// Helper to format relative time
const getRelativeTime = (isoString: string) => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

const getBadgeColor = (type: string) => {
  switch (type) {
    case 'Internship': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'Job': return 'bg-blue-100 text-blue-900 border-blue-300';
    case 'Placement Drive': return 'bg-purple-100 text-purple-900 border-purple-300';
    case 'Workshop': return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'Industry Project': return 'bg-teal-100 text-teal-900 border-teal-300';
    case 'Event': return 'bg-rose-100 text-rose-900 border-rose-300';
    default: return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FEED POST CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface FeedPostCardProps {
  post: IndustryPostItem;
  session: AuthUserSession | null;
  isSaved: boolean;
  isInternalApplied?: boolean;
  isResurfaced?: boolean;
  resurfacedReason?: string;
  onToggleSave: (postId: string) => void;
  onApplyInternal?: (postId: string) => void;
  onOpenLightbox: (images: string[], initialIndex: number) => void;
  onOpenCompanyProfile: (post: IndustryPostItem) => void;
  onOpenDirectMessage?: (contact: { id: string; name: string; role: string; companyOrDept?: string }) => void;
  showToast: (msg: string) => void;
}

const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  session,
  isSaved,
  isResurfaced,
  resurfacedReason,
  onToggleSave,
  onOpenLightbox,
  onOpenCompanyProfile,
  onOpenDirectMessage,
  showToast
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState<number>(post.comments_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostCommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: string; authorName: string } | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const cardRef = useRef<HTMLElement>(null);
  const viewLoggedRef = useRef(false);

  // Keep counts in sync with parent snapshot
  useEffect(() => {
    setLikesCount(post.likes_count || 0);
    setCommentsCount(post.comments_count || 0);
  }, [post.likes_count, post.comments_count]);

  // Real-time listener for current user's liked status on this post
  useEffect(() => {
    if (!session?.id) {
      setIsLiked(false);
      return;
    }
    const unsub = careerConnectService.subscribePostLikeStatus(post.id, session.id, (liked) => {
      setIsLiked(liked);
    });
    return () => unsub();
  }, [post.id, session?.id]);

  // Real-time listener for comments (active only when comment section is open)
  useEffect(() => {
    if (!showComments) return;
    const unsub = careerConnectService.subscribePostComments(post.id, (list) => {
      setComments(list);
      setCommentsCount(list.length);
    });
    return () => unsub();
  }, [post.id, showComments]);

  // IntersectionObserver for Real View / Impression Tracking (60% visible for >= 1.2s)
  useEffect(() => {
    if (viewLoggedRef.current) return;
    const el = cardRef.current;
    if (!el) return;

    let timer: any = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !viewLoggedRef.current) {
          timer = setTimeout(() => {
            if (!viewLoggedRef.current) {
              viewLoggedRef.current = true;
              careerConnectService.recordPostView(post.id, session);
            }
          }, 1200);
        } else {
          if (timer) clearTimeout(timer);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [post.id, session]);

  // Handle Like Toggle
  const handleLike = async () => {
    if (!session?.id) {
      showToast('Please log in to like posts');
      return;
    }

    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 400);

    // Optimistic UI toggle
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      await careerConnectService.toggleLikePost(post.id, session, post.author_id);
    } catch (err) {
      // Revert on error
      setIsLiked(!nextLiked);
      setLikesCount(prev => !nextLiked ? prev + 1 : Math.max(0, prev - 1));
      showToast('Failed to update like status');
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.id) {
      showToast('Please log in to post comments');
      return;
    }
    const text = commentText.trim();
    if (!text) return;

    setIsSubmittingComment(true);
    try {
      const isRecruiter = session?.role === 'industry' && (post.author_id === session.id || post.company_name?.toLowerCase() === session.company?.toLowerCase());
      await careerConnectService.addPostComment(
        post.id,
        text,
        session,
        post.author_id,
        replyTo || undefined,
        isRecruiter
      );
      setCommentText('');
      setReplyTo(null);
      showToast(replyTo ? 'Reply posted successfully' : 'Comment posted successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await careerConnectService.deletePostComment(post.id, commentId);
      showToast('Comment deleted');
    } catch {
      showToast('Failed to delete comment');
    }
  };

  // Handle Share Post
  const handleShare = async () => {
    const postUrl = `${window.location.origin}/#post-${post.id}`;
    const shareTitle = `${post.company_name} — ${post.post_type}`;
    const shareText = post.message.slice(0, 100) + '...';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: postUrl
        });
        await careerConnectService.recordPostShare(post.id, session, 'native');
        showToast('Shared successfully!');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Clipboard copy
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(post.primary_apply_url || postUrl);
      await careerConnectService.recordPostShare(post.id, session, 'clipboard');
      showToast('Post application link copied to clipboard!');
    }
  };

  // Helper to render text with auto-clickable URLs
  const renderFormattedMessage = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-amber-900 hover:text-amber-700 font-bold underline inline-flex items-center gap-1 break-all cursor-pointer transition-colors"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
      }
      return <span key={i} className="whitespace-pre-line">{part}</span>;
    });
  };

  const isLongMessage = post.message.length > 280;
  const displayedMessage = isLongMessage && !isExpanded
    ? post.message.slice(0, 280) + '...'
    : post.message;

  // Robust multi-key image array resolution (array of base64 or storage URLs)
  const rawImages = (post as any).images || (post as any).imageUrls || (post as any).image_url || (post as any).imageUrl || [];
  const images: string[] = Array.isArray(rawImages)
    ? rawImages.filter(Boolean)
    : (typeof rawImages === 'string' && rawImages.trim() ? [rawImages.trim()] : []);

  // Strict role-based telemetry: views are hidden from students, visible only to faculty/recruiters/admins
  const isStudent = !session || session.role === 'student';
  const canSeeViews = !isStudent && (
    session?.role === 'academician' ||
    session?.role === 'industry' ||
    session?.role === 'institution' ||
    session?.role === 'super_admin'
  );

  return (
    <article
      ref={cardRef}
      id={`post-${post.id}`}
      className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-xs hover:border-slate-300 transition-colors space-y-4 overflow-hidden"
    >
      {/* ── RE-SURFACED DISCOVERY BANNER ── */}
      {isResurfaced && (
        <div className="-mx-5 -mt-5 md:-mx-6 md:-mt-6 mb-3 px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>{resurfacedReason || 'Trending Opportunity • Suggested for You'}</span>
          </div>
          <span className="text-[9px] font-mono text-slate-600 font-semibold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
            Discovery
          </span>
        </div>
      )}

      {/* ── CARD HEADER: COMPANY IDENTITY ── */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onOpenCompanyProfile(post)}
        >
          {post.company_logo ? (
            <img
              src={post.company_logo}
              alt={post.company_name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200/90 flex-shrink-0 group-hover:border-amber-400 transition-colors"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-900 font-black text-sm flex-shrink-0 shadow-2xs group-hover:bg-slate-100 transition-colors">
              {post.company_name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm md:text-base font-black text-slate-900 group-hover:text-amber-900 transition-colors">
                {post.company_name}
              </h3>
              {post.is_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeColor(post.post_type)}`}>
                {post.post_type}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {getRelativeTime(post.created_at)}
              </span>
              {post.target_department && post.target_department !== 'All Departments' && (
                <>
                  <span>•</span>
                  <span className="text-slate-600 font-semibold">{post.target_department}</span>
                </>
              )}
              {post.target_state && post.target_state !== 'All India' && (
                <>
                  <span>•</span>
                  <span className="text-slate-600 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {post.target_state}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Bookmark Button */}
        <button
          type="button"
          onClick={() => onToggleSave(post.id)}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isSaved
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : 'bg-slate-50 hover:bg-slate-50 border-slate-200/90 text-slate-500'
          }`}
          title={isSaved ? 'Remove Bookmark' : 'Save Post'}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* ── CARD BODY: NATURAL MESSAGE ── */}
      <div className="text-xs md:text-sm text-slate-800 leading-relaxed font-normal">
        {renderFormattedMessage(displayedMessage)}
        {isLongMessage && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-800 hover:text-amber-900 font-bold ml-1 inline-flex items-center gap-0.5 cursor-pointer"
          >
            {isExpanded ? (
              <><span>Show Less</span><ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <><span>Read More</span><ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        )}
      </div>

      {/* ── RESPONSIVE MULTI-IMAGE GALLERY ── */}
      {images.length > 0 && (
        <div className="pt-1">
          {images.length === 1 && (
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 max-h-[420px] flex items-center justify-center">
              <img
                src={images[0]}
                alt="Poster 1"
                onClick={() => onOpenLightbox(images, 0)}
                className="w-full max-h-[420px] object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
              />
            </div>
          )}

          {images.length === 2 && (
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
              {images.map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 h-56">
                  <img
                    src={img}
                    alt={`Poster ${i + 1}`}
                    onClick={() => onOpenLightbox(images, i)}
                    className="w-full h-full object-cover cursor-zoom-in hover:scale-102 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}

          {images.length === 3 && (
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              <div className="col-span-2 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 h-64">
                <img
                  src={images[0]}
                  alt="Poster 1"
                  onClick={() => onOpenLightbox(images, 0)}
                  className="w-full h-full object-cover cursor-zoom-in hover:scale-102 transition-transform duration-200"
                />
              </div>
              <div className="grid grid-rows-2 gap-2 h-64">
                {images.slice(1, 3).map((img, i) => (
                  <div key={i + 1} className="rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 h-[124px]">
                    <img
                      src={img}
                      alt={`Poster ${i + 2}`}
                      onClick={() => onOpenLightbox(images, i + 1)}
                      className="w-full h-full object-cover cursor-zoom-in hover:scale-102 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {images.length >= 4 && (
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
              {images.slice(0, 3).map((img, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 h-44">
                  <img
                    src={img}
                    alt={`Poster ${i + 1}`}
                    onClick={() => onOpenLightbox(images, i)}
                    className="w-full h-full object-cover cursor-zoom-in hover:scale-102 transition-transform duration-200"
                  />
                </div>
              ))}
              <div
                className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 h-44 cursor-zoom-in group"
                onClick={() => onOpenLightbox(images, 3)}
              >
                <img
                  src={images[3]}
                  alt="Poster 4"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                />
                {images.length > 4 && (
                  <div className="absolute inset-0 bg-slate-950/65 flex items-center justify-center text-white font-black text-lg backdrop-blur-2xs">
                    +{images.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TECHNICAL SKILLS / TAGS ── */}
      {post.skills && post.skills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Tag className="w-3 h-3 text-slate-400 mr-1" />
          {post.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200/90 text-slate-700 text-[10px] font-bold"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* ── REAL SOCIAL COUNTER METRICS ROW (STRICT ZERO FAKE DATA) ── */}
      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Heart className={`w-3.5 h-3.5 ${likesCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
            <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-slate-700" onClick={() => setShowComments(!showComments)}>
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{post.shares_count || 0} Shares</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {canSeeViews && (
            <span className="flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200" title="Faculty & Recruiter Impression Telemetry">
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>{post.views_count || 0} Views</span>
            </span>
          )}
          {typeof post.saves_count === 'number' && post.saves_count > 0 && (
            <span className="flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              <span>{post.saves_count} Saves</span>
            </span>
          )}
        </div>
      </div>

      {/* ── ACTION BAR (LIKE, COMMENT, SHARE, APPLY) ── */}
      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Like Button with Animation */}
          <button
            type="button"
            onClick={handleLike}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              isLiked
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-slate-50 hover:bg-slate-50 border-slate-200/90 text-slate-700'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                isLiked ? 'text-rose-600 fill-rose-600' : 'text-slate-500'
              } ${isLikeAnimating ? 'scale-130' : 'scale-100'}`}
            />
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Comment Accordion Toggle Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              showComments
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-slate-50 hover:bg-slate-50 border-slate-200/90 text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Comment</span>
            {commentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-[10px] text-slate-800">
                {commentsCount}
              </span>
            )}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-50 border border-slate-200/90 text-xs font-black text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            <span>Share</span>
          </button>
        </div>

        {/* Apply / Register Actions & Telemetry */}
        <div className="flex items-center gap-2 flex-wrap">
          {post.primary_apply_url ? (
            <button
              type="button"
              onClick={() => {
                careerConnectService.recordExternalLinkClick(post.id, session);
                window.open(post.primary_apply_url, '_blank', 'noopener,noreferrer');
              }}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-2xs border border-slate-200/90 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Register / Apply on External Website</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium px-3 py-1 bg-slate-100 rounded-xl border border-slate-200">
              Official Opportunity Notice
            </span>
          )}

          {/* Message Company / Recruiter CTA */}
          {post.author_id && post.author_id !== session?.id && onOpenDirectMessage && (
            <button
              type="button"
              onClick={() => {
                if (!post.author_id) return;
                onOpenDirectMessage({
                  id: post.author_id,
                  name: post.author_name || post.company_name,
                  role: 'industry',
                  companyOrDept: post.company_name
                });
              }}
              className="px-3 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200/90 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              title="Message recruiter directly regarding this opportunity"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Message Recruiter</span>
            </button>
          )}
        </div>
      </div>

      {/* ── REAL-TIME COMMENTS ACCORDION ── */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-200/90 space-y-3 animate-fadeIn">
          {/* Reply Context Indicator */}
          {replyTo && (
            <div className="flex items-center justify-between px-3 py-1 bg-amber-100 rounded-lg text-xs text-amber-900">
              <span>Replying to <span className="font-bold">@{replyTo.authorName}</span></span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-amber-800 hover:text-amber-950 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-900 font-black text-xs flex-shrink-0">
              {(session?.full_name || 'U').slice(0, 1).toUpperCase()}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyTo ? `Reply to @${replyTo.authorName}...` : "Write a professional comment or query..."}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSubmittingComment || !commentText.trim()}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{replyTo ? 'Reply' : 'Post'}</span>
            </button>
          </form>

          {/* Comment List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-center py-3 text-xs text-slate-500 font-medium">
                No comments yet. Start the conversation!
              </p>
            ) : (
              comments.map(c => {
                const canDelete = session?.id && (c.userId === session.id || post.author_id === session.id);
                return (
                  <div key={c.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0 mt-0.5">
                        {c.userName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{c.userName}</span>
                          <span className="px-1.5 py-0.2 rounded-md bg-white border border-slate-200/90 text-[9px] font-bold text-slate-500 uppercase">
                            {c.userRole}
                          </span>
                          {c.isRecruiterReply && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black uppercase">
                              Recruiter Response
                            </span>
                          )}
                          {c.replyToAuthor && (
                            <span className="text-[10px] text-amber-800 font-semibold">
                              replying to @{c.replyToAuthor}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{getRelativeTime(c.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap">{c.text}</p>
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTo({ commentId: c.id, authorName: c.userName });
                              setCommentText(`@${c.userName} `);
                            }}
                            className="text-[10px] font-bold text-slate-500 hover:text-amber-800 transition-colors cursor-pointer"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer flex-shrink-0"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN INDUSTRY FEED VIEW
// ─────────────────────────────────────────────────────────────────────────────
export const IndustryFeedView: React.FC<Props> = ({
  session,
  onApplyInternal: _onApplyInternal,
  appliedPostIds: _appliedPostIds = new Set(),
  onOpenDirectMessage
}) => {
  const [posts, setPosts] = useState<IndustryPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lightbox Modal State
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxZoom, setLightboxZoom] = useState<boolean>(false);

  // Company Profile Modal State
  const [selectedCompanyPost, setSelectedCompanyPost] = useState<IndustryPostItem | null>(null);

  // Algorithmic discovery & batch pagination state
  const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('smart');
  const [displayedBatch, setDisplayedBatch] = useState<number>(15);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset pagination batch when filters or discovery mode change
  useEffect(() => {
    setDisplayedBatch(15);
  }, [activeCategory, selectedDepartment, searchQuery, discoveryMode]);

  // Real-time Firestore subscription for all published Industry Posts
  useEffect(() => {
    setLoading(true);
    const unsubscribe = careerConnectService.subscribeIndustryPosts(undefined, (data) => {
      setPosts(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // High-performance memoized algorithmic feed processing (Smart ranking, decay, resurfacing)
  const processedFeed = useMemo(() => {
    // 1. Multi-token text search across message, company, skills, and department
    const searched = searchQuery.trim()
      ? feedAlgorithmService.searchPosts(posts, searchQuery)
      : posts;

    // 2. Department & category filtering (broadcast posts with 'All Departments' are visible to all)
    const filtered = searched.filter(post => {
      const matchCat = activeCategory === 'All' || post.post_type === activeCategory;
      const matchDept = selectedDepartment === 'All Departments' ||
        !post.target_department ||
        post.target_department === 'All Departments' ||
        post.target_department.toLowerCase() === selectedDepartment.toLowerCase();
      return matchCat && matchDept;
    });

    // 3. Run algorithmic discovery & re-surfacing engine
    return feedAlgorithmService.buildDiscoveryFeed(filtered, {
      mode: discoveryMode,
      userDepartment: session?.department,
      allowResurfacing: discoveryMode === 'smart',
      minDistance: 12,
      maxTotalItems: 2000
    });
  }, [posts, searchQuery, activeCategory, selectedDepartment, discoveryMode, session?.department]);

  // Sliced batch for 60fps lightweight DOM rendering (even with 1000+ items)
  const visibleFeedItems = useMemo(() => {
    return processedFeed.slice(0, displayedBatch);
  }, [processedFeed, displayedBatch]);

  // Real-time Firestore listener for user's bookmarks
  useEffect(() => {
    if (!session?.id) {
      setSavedPostIds(new Set());
      return;
    }
    const unsubSaved = careerConnectService.subscribeUserSavedPosts(session.id, (savedIds) => {
      setSavedPostIds(savedIds);
    });
    return () => unsubSaved();
  }, [session?.id]);

  // Handle Save Bookmark
  const handleToggleSave = async (postId: string) => {
    if (!session?.id) {
      showToast('Please log in as student to bookmark posts');
      return;
    }
    const isNowSaved = await careerConnectService.toggleSavePost(postId, session.id);
    showToast(isNowSaved ? 'Post saved to your bookmarks' : 'Post removed from bookmarks');
  };

  // Lightbox Helpers
  const handleOpenLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxZoom(false);
  };

  const handleCloseLightbox = () => {
    setLightboxImages([]);
    setLightboxIndex(0);
    setLightboxZoom(false);
  };

  const handleNextLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    setLightboxZoom(false);
  }, [lightboxImages.length]);

  const handlePrevLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    setLightboxZoom(false);
  }, [lightboxImages.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxImages.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      else if (e.key === 'ArrowRight') handleNextLightbox();
      else if (e.key === 'ArrowLeft') handlePrevLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImages.length, handleNextLightbox, handlePrevLightbox]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-slideIn">
          <Sparkles className="w-4 h-4 text-[#6366F1]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── FEED HEADER & SEARCH TOOLBAR ── */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-amber-900 text-[10px] font-mono font-black border border-slate-200/90">
                REAL INDUSTRY SOCIAL FEED
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {posts.length} {posts.length === 1 ? 'Announcement' : 'Announcements'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              Industry Announcements & Opportunities
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Verified corporate hiring, internships, placement drives, live views, and direct recruiter links.
            </p>
          </div>

          {/* Department Filter Dropdown */}
          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer w-full md:w-auto"
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, skill (e.g. Python, SQL), or keyword..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {POST_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setActiveCategory(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === type
                  ? 'bg-indigo-600 text-white border border-slate-200/90 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/90'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Discovery Mode Switcher Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Mode:
            </span>
            <button
              type="button"
              onClick={() => setDiscoveryMode('smart')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                discoveryMode === 'smart'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Smart algorithmic ranking with recency decay, engagement scoring, and safe re-surfacing"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Discovery</span>
            </button>
            <button
              type="button"
              onClick={() => setDiscoveryMode('trending')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                discoveryMode === 'trending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Highest engagement: most liked, commented, saved, and viewed"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Trending</span>
            </button>
            <button
              type="button"
              onClick={() => setDiscoveryMode('department')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                discoveryMode === 'department'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Prioritizing opportunities aligned with your department"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>My Department</span>
            </button>
            <button
              type="button"
              onClick={() => setDiscoveryMode('recruiter')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                discoveryMode === 'recruiter'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Universal broadcast opportunities from verified industry recruiters"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Recruiter Universal</span>
            </button>
            <button
              type="button"
              onClick={() => setDiscoveryMode('latest')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                discoveryMode === 'latest'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Chronological timeline of latest published posts"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Latest</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 flex-shrink-0 self-end sm:self-auto">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
              Showing {visibleFeedItems.length} of {processedFeed.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── FEED LIST / EMPTY STATE ── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-3xl p-6 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
              <div className="h-16 bg-slate-100 rounded-2xl" />
              <div className="h-48 bg-slate-200 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : processedFeed.length === 0 ? (
        /* STRICT ZERO FAKE DATA EMPTY STATE */
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 md:p-14 text-center shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200/90 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-amber-800" />
          </div>
          <h3 className="text-base md:text-lg font-black text-slate-900">
            No Industry Posts Found
          </h3>
          <p className="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Industry posts will appear here when verified recruiters publish opportunities. No demo or fabricated posts are shown.
          </p>
          {(activeCategory !== 'All' || selectedDepartment !== 'All Departments' || searchQuery || discoveryMode !== 'smart') && (
            <button
              onClick={() => {
                setActiveCategory('All');
                setSelectedDepartment('All Departments');
                setSearchQuery('');
                setDiscoveryMode('smart');
              }}
              className="mt-2 px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-amber-900 text-xs font-bold border border-slate-200/90 transition-colors cursor-pointer"
            >
              Reset Filters & Discovery Mode
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {visibleFeedItems.map(({ post, feedKey, isResurfaced, resurfacedReason }) => (
            <FeedPostCard
              key={feedKey}
              post={post}
              session={session}
              isSaved={savedPostIds.has(post.id)}
              isResurfaced={isResurfaced}
              resurfacedReason={resurfacedReason}
              onToggleSave={handleToggleSave}
              onOpenLightbox={handleOpenLightbox}
              onOpenCompanyProfile={(p) => setSelectedCompanyPost(p)}
              onOpenDirectMessage={onOpenDirectMessage}
              showToast={showToast}
            />
          ))}

          {/* Progressive Infinite Batching / Load More */}
          {visibleFeedItems.length < processedFeed.length && (
            <div className="pt-4 pb-8 flex flex-col items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDisplayedBatch(prev => prev + 15)}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 text-amber-600" />
                <span>Load More Opportunities ({processedFeed.length - visibleFeedItems.length} remaining)</span>
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                Algorithmic batching active • {posts.length} verified opportunities indexed
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── INTERACTIVE LIGHTBOX MODAL ── */}
      {lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={handleCloseLightbox}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
              <button
                type="button"
                onClick={() => setLightboxZoom(!lightboxZoom)}
                className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Toggle Zoom"
              >
                {lightboxZoom ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={handleCloseLightbox}
                className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Buttons */}
            {lightboxImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevLightbox}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextLightbox}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="w-full max-h-[80vh] flex items-center justify-center overflow-auto rounded-2xl">
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`Viewer poster ${lightboxIndex + 1}`}
                className={`max-h-[80vh] object-contain rounded-2xl transition-transform duration-200 ${
                  lightboxZoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setLightboxZoom(!lightboxZoom)}
              />
            </div>

            {/* Bottom Status Counter */}
            {lightboxImages.length > 1 && (
              <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/80 text-white text-xs font-bold">
                Image {lightboxIndex + 1} of {lightboxImages.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPANY PROFILE MODAL ── */}
      {selectedCompanyPost && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedCompanyPost(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200/90 max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCompanyPost(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {selectedCompanyPost.company_logo ? (
                <img
                  src={selectedCompanyPost.company_logo}
                  alt={selectedCompanyPost.company_name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200/90"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-center text-amber-900 font-black text-xl">
                  {selectedCompanyPost.company_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{selectedCompanyPost.company_name}</h3>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Verified Industry Partner • Nova CareerConnect</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Departments:</span>
                <span className="font-bold text-slate-900">{selectedCompanyPost.target_department || 'All Engineering'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recruitment Scope:</span>
                <span className="font-bold text-slate-900">{selectedCompanyPost.target_scope || 'All India'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Post Type:</span>
                <span className="font-bold text-slate-900">{selectedCompanyPost.post_type}</span>
              </div>
            </div>

            {selectedCompanyPost.primary_apply_url && (
              <a
                href={selectedCompanyPost.primary_apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Visit Company Application Portal</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
