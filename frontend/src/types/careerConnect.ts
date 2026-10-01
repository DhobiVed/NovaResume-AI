export type UserRoleType = 'student' | 'academician' | 'industry' | 'institution' | 'super_admin';

export interface AuthUserSession {
  id: string;
  full_name: string;
  email: string;
  role: UserRoleType;
  title?: string;
  institution?: string;
  department?: string;
  company?: string;
  cgpa?: string;
  token?: string;
}

export interface DemoAccountDefinition {
  role: UserRoleType;
  title: string;
  tagline: string;
  email: string;
  name: string;
  affiliation: string;
  description: string;
  badgeColor: string;
  iconName: string;
}

export interface StudentSkillItem {
  id: string;
  skill_name: string;
  domain_id?: string;
  domain_name?: string;
  category_name?: string;
  self_rating: number; // 1-5
  test_score?: number; // 0-100
  is_verified: boolean;
  confidence_level: string; // Beginner, Intermediate, Advanced, Expert
  verified_at?: string;
}

export interface SkillGapRecommendation {
  skill: string;
  type: string;
  recommended_action: string;
  reason: string;
}

export interface SkillGapAnalysis {
  target_role: string;
  required_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  gap_percentage: number;
  recommendations: SkillGapRecommendation[];
}

export interface OpportunityItem {
  id: string;
  company_name: string;
  company_logo?: string;
  title: string;
  opportunity_type: 'Internship' | 'Job' | 'Industry Project' | 'Workshop / Event' | 'Announcement' | string;
  description: string;
  required_skills: string[];
  preferred_skills?: string[];
  min_cgpa?: string | null;
  eligible_batches?: string | null;
  target_department?: string;
  target_college?: string;
  target_state?: string;
  target_city?: string;
  location: string;
  work_mode?: 'Remote' | 'Hybrid' | 'On-site';
  stipend_or_salary?: string | null;
  duration?: string | null;
  deadline?: string | null;
  posted_at?: string;
  posted_by?: string;
  application_type?: 'internal' | 'external';
  external_apply_url?: string;
  opportunity_scope?: string;
  selection_process?: string;
  contact_info?: string;
  status: 'Open' | 'Closed';
}

export interface ExplainableMatchResult {
  overall_score: number; // 0-100
  breakdown: {
    required_skills: string;
    preferred_skills: string;
    eligibility: string;
    portfolio_evidence: string;
    certifications: string;
  };
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
}

export interface ApplicationItem {
  id: string;
  opportunity_id: string;
  title: string;
  company_name: string;
  company_logo?: string;
  student_id?: string;
  student_name?: string;
  student_email?: string;
  student_department?: string;
  student_semester?: number;
  student_cgpa?: string;
  verified_score?: number;
  match_score?: number;
  status: 'Saved' | 'Applied' | 'Screening' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  applied_at: string;
  recruiter_notes?: string;
  external_apply_url?: string;
}

export interface CurriculumTopicItem {
  id: string;
  course_name: string;
  topic_name: string;
  skill_tag: string;
  department: string;
  semester: number;
  hours_allocated: number;
  coverage_percentage: number;
}

export interface CurriculumGapItem {
  skill: string;
  curriculumCoveragePct: number;
  industryDemandPct: number;
  gapPercentage: number;
  priority: 'High' | 'Medium' | 'Low';
  recommendedAction?: string;
}

export interface FacultyOpportunityItem {
  id: string;
  title: string;
  type: 'FDP' | 'Industry Workshop' | 'Faculty Internship' | 'Industry Project' | 'Research & Consultancy' | 'Guest Lecture';
  company_or_institution: string;
  location: string;
  stipend_or_funding?: string;
  deadline?: string;
  apply_url?: string;
  description: string;
}

export interface VerificationBadgeItem {
  id: string;
  item_type: string;
  item_title: string;
  verifier_entity: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  verified_at: string;
}

export interface QuestionItem {
  question: string;
  options: string[];
  correct_index: number;
  skill: string;
}

export interface AssessmentTest {
  id: string;
  title: string;
  domain: string;
  time_limit_mins: number;
  questions: QuestionItem[];
}

export interface MentorshipSessionItem {
  id: string;
  mentor_name: string;
  designation: string;
  organization: string;
  expertise_areas: string[];
  next_slot: string;
  rating: number;
  total_mentored: number;
}

export interface InnovationChallengeItem {
  id: string;
  title: string;
  sponsor?: string;
  organizer?: string;
  prize?: string;
  prize_pool?: string;
  theme?: string;
  deadline: string;
  problem_statement?: string;
  eligible_tracks?: string[];
  participants_count?: number;
  tags?: string[];
}

export interface DocumentRecordItem {
  id: string;
  title: string;
  category?: 'Resume' | 'Certificate' | 'Internship Report' | 'Academic Record';
  doc_type?: 'Resume' | 'Internship Report' | 'Certificate' | 'Academic Record';
  file_type?: string;
  uploaded_at: string;
  is_verified?: boolean;
  verifier?: string;
  verified_by?: string | null;
  status: 'Verified' | 'Under Review';
  file_size: string;
}

// ── INSTITUTION & FACULTY ECOSYSTEM TYPES ──────────────────────────
export interface InstitutionItem {
  id: string;
  name: string;
  institution_type: string;
  location: string;
  official_domain: string;
  verification_status: 'Verified' | 'Pending';
}

export interface DepartmentItem {
  id: string;
  institution_id: string;
  name: string;
  code: string;
  program: string;
  student_count: number;
  faculty_count: number;
  status: 'Active' | 'Inactive';
}

export interface FacultyMemberItem {
  id: string;
  name: string;
  email: string;
  institution_name: string;
  department_name: string;
  designation: string;
  employee_id: string;
  expertise_areas: string[];
  experience_years: number;
  verification_status: 'Pending' | 'Under_Review' | 'Verified' | 'Rejected' | 'Suspended';
  assigned_students_count: number;
}

export interface DepartmentStudentItem {
  id: string;
  name: string;
  email: string;
  department: string;
  semester: number;
  batch: string;
  cgpa: string;
  skill_readiness: number; // 0-100
  internship_status: 'Not Started' | 'Applied' | 'Screening' | 'Interning' | 'Completed';
  placement_readiness: 'High' | 'Moderate' | 'Needs Improvement';
  mentor_status: 'Assigned' | 'Unassigned';
  mentor_name?: string;
  target_role: string;
  top_skills: string[];
  critical_gaps: string[];
}

export interface MentorshipGoalItem {
  id: string;
  assignment_id: string;
  title: string;
  target_skill: string;
  target_date: string;
  status: 'Not_Started' | 'In_Progress' | 'Achieved';
}

export interface MentorshipNoteItem {
  id: string;
  assignment_id: string;
  faculty_name: string;
  note_type: 'Session_Note' | 'Progress_Feedback' | 'Action_Item';
  content: string;
  action_items?: string;
  created_at: string;
}

export interface FacultyCollaborationItem {
  id: string;
  company_name: string;
  title: string;
  opportunity_type: 'FDP' | 'Industrial Training' | 'Consultancy' | 'Research Collaboration' | 'Guest Lecture' | 'Innovation Challenge';
  description: string;
  domain_areas: string[];
  location: string;
  duration: string;
  honorarium_or_grant: string;
  deadline: string;
  status: 'Open' | 'Closed';
}

export interface AssessmentDetailedResult {
  total_score: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  time_taken_seconds: number;
  section_scores: { section: string; score: number; max_score: number; percentage: number }[];
  skill_scores: { skill: string; percentage: number; status: 'Proficient' | 'Developing' | 'Gap' }[];
  strengths: string[];
  weaknesses: string[];
  priority_gaps: string[];
  improvement_suggestions: string[];
}

export interface CandidateRecommendationItem {
  id: string;
  name: string;
  email: string;
  department: string;
  cgpa: string;
  match_score: number;
  required_skill_match: string;
  preferred_skill_match: string;
  eligibility_match: string;
  portfolio_evidence: string;
  certifications_count: number;
  experience_summary: string;
  matched_skills?: string[];
  missing_skills: string[];
  application_status: 'Saved' | 'Applied' | 'Screening' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
}

export interface VerificationQueueItem {
  id: string;
  user_name: string;
  user_role: 'student' | 'faculty';
  department: string;
  item_type: 'Certificate' | 'Skill' | 'Project' | 'Internship' | 'Faculty Registration';
  item_title: string;
  verifier_entity: string;
  evidence_url?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs_Revision';
  requested_at: string;
}

export interface AuditLogItem {
  id: string;
  actor_name: string;
  actor_role: 'student' | 'faculty' | 'institution_admin' | 'recruiter' | 'super_admin';
  action: string;
  resource_type: string;
  details: string;
  timestamp: string;
  ip_address: string;
}

export interface IndustryPartnerAdminItem {
  id: string;
  company_name: string;
  sector: string;
  location: string;
  contact_person: string;
  contact_email: string;
  active_postings: number;
  total_hires: number;
  mou_status: 'Signed & Active' | 'Under Review' | 'Draft';
  verification_status: 'Verified' | 'Pending' | 'Rejected';
}

export interface SkillTaxonomyCategoryItem {
  id: string;
  category_name: string;
  domain: string;
  skills: string[];
  in_demand_rating: 'High' | 'Very High' | 'Critical';
  last_updated: string;
}

export interface CandidateDetailData extends CandidateRecommendationItem {
  phone: string;
  location: string;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  verified_projects: {
    title: string;
    description: string;
    technologies: string[];
    github_link: string;
    verified_by: string;
  }[];
  verified_certifications: {
    title: string;
    issuer: string;
    date: string;
    credential_id: string;
  }[];
  matched_skill_details: {
    skill: string;
    proficiency: 'Proficient' | 'Advanced' | 'Expert';
    verified_source: string;
  }[];
  assessment_scores: {
    subject: string;
    score_pct: number;
    percentile: number;
  }[];
  recruiter_notes: {
    author: string;
    date: string;
    note: string;
    rating: number;
  }[];
}

// ── ASSESSMENT & ANTI-CHEATING TYPES ─────────────────────────────────
export interface TestAntiCheatingViolation {
  timestamp: string;
  type: 'tab_switch' | 'fullscreen_exit' | 'copy_paste' | 'blur' | 'time_warning';
  message: string;
}

export interface GeneratedAssessmentTest {
  testId: string;
  domainId?: string;
  domainName?: string;
  skillId?: string;
  skillName?: string;
  language: string; // backwards compatible alias
  moduleId?: string;
  moduleName?: string;
  topicId?: string;
  topicName?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Industry' | 'Mixed';
  totalQuestions: number;
  durationSeconds: number;
  exactTopicLocked?: boolean;
  availableCount?: number;
  requestedCount?: number;
  shortage?: number;
  shortageMessage?: string;
  testMode?: 'TOPIC_TEST' | 'FINAL_CERTIFICATION';
  subjectId?: string;
  syllabusVersion?: string;
  isServerSession?: boolean;
  questions: BankQuestion[];
}

export interface AssessmentReport {
  id: string;
  testId: string;
  studentId: string;
  domainId?: string;
  domainName?: string;
  skillId?: string;
  skillName?: string;
  language: string;
  difficulty: string;
  completedAt: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  rawScore: number;
  maxScore: number;
  percentage: number;
  percentile: number;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Industry Ready';
  antiCheatingViolations: TestAntiCheatingViolation[];
  antiCheatingTrustScore: number; // 0-100 (100 = clean)
  topicBreakdown: {
    topic: string;
    correct: number;
    total: number;
    percentage: number;
  }[];
  certificateVerificationHash?: string;
  testMode?: 'TOPIC_TEST' | 'FINAL_CERTIFICATION';
  passed?: boolean;
  topicMasteryBadgeAwarded?: boolean;
}

export type AssessmentTestMode = 'TOPIC_TEST' | 'FINAL_CERTIFICATION';

export interface TopicProgressRecord {
  topicId: string;
  topicTitle: string;
  moduleId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  bestScorePercentage: number;
  attemptsCount: number;
  lastAttemptedAt?: string;
  completedAt?: string;
  topicMasteryBadgeAwarded?: boolean;
}

export interface SubjectSyllabusProgress {
  studentId: string;
  subjectId: string; // e.g. 'python'
  subjectName: string; // e.g. 'Python'
  totalTopics: number;
  completedTopicsCount: number;
  completionPercentage: number; // 0-100
  isFinalCertificationUnlocked: boolean;
  recommendedPreparationNotice?: string;
  finalCertificationAttempted: boolean;
  finalCertificationPassed: boolean;
  finalCertificationScore?: number;
  topicProgress: Record<string, TopicProgressRecord>;
  updatedAt: string;
}

export interface FinalCertificationResult {
  passed: boolean;
  score: number;
  totalQuestions: number;
  percentage: number;
  certificateId?: string;
  message: string;
}


export interface DepartmentFilterParams {
  semester?: string;
  academicYear?: string;
  graduationYear?: string;
  language?: string;
  difficulty?: string;
  scoreRange?: string;
  dateRange?: string;
}

// ── ANONYMOUS ANALYTICS (ZERO INDIVIDUAL NAMES) ──────────────────────
export interface DepartmentAnonymousStats {
  department: string;
  institution: string;
  totalStudents: number;
  assessedCount: number;
  avgReadinessScore: number;
  avgAccuracy: number;
  avgCgpa: number;
  scoreDistribution: {
    range: string; // "Strong (≥75%)", "Moderate (60-74%)", "Needs Improvement (<60%)"
    count: number;
    percentage: number;
  }[];
  histogramDistribution: {
    range: string; // "0-20%", "21-40%", "41-60%", "61-80%", "81-100%"
    count: number;
    percentage: number;
  }[];
  topSkillsProficiency: {
    skill: string;
    avgScore: number;
    studentCount: number;
  }[];
  criticalSkillGaps: {
    skill: string;
    gapPercentage: number;
    impactedCount: number;
    industryDemand: 'High' | 'Very High' | 'Critical' | string;
  }[];
  topicPerformance: {
    topic: string;
    avgScore: number;
    attemptsCount: number;
  }[];
  strongestTopics: {
    topic: string;
    avgScore: number;
  }[];
  weakestTopics: {
    topic: string;
    avgScore: number;
  }[];
  industryDemandAvailable: boolean;
  industryComparison: {
    skill: string;
    studentScore: number;
    industryDemand: number;
    gap: number;
  }[];
  semesterBreakdown: {
    semester: number;
    studentCount: number;
    avgReadiness: number;
    topStrength: string;
  }[];
}

export interface RecruiterTalentFilterParams {
  state?: string;
  city?: string;
  collegeId?: string;
  collegeName?: string;
  department?: string;
  minSemester?: number;
  maxSemester?: number;
  requiredSkills?: string[];
  minReadinessScore?: number;
}

export interface RecruiterTalentAggregate {
  matchedCandidatesCount: number;
  avgReadinessScore: number;
  avgAtsScore: number;
  skillsAvailableDistribution: {
    skill: string;
    count: number;
    avgProficiency: number;
  }[];
  collegesRepresented: {
    collegeName: string;
    city: string;
    state: string;
    count: number;
  }[];
  semesterDistribution: {
    semester: number;
    count: number;
  }[];
  note: string; // Explains: "Identities revealed only when candidate explicitly applies"
}

// ── 30. INDUSTRY SOCIAL-STYLE POST SYSTEM (SIH26044) ────────────
export type IndustryPostType = 
  | 'Internship' 
  | 'Job' 
  | 'Placement Drive' 
  | 'Industry Project' 
  | 'Workshop' 
  | 'Training'
  | 'FDP'
  | 'Mentorship'
  | 'Guest Lecture'
  | 'Event' 
  | 'Research Opportunity'
  | 'Consultancy'
  | 'Announcement';

export interface IndustryPostItem {
  id: string;
  company_name: string;
  company_logo?: string;
  is_verified?: boolean;
  author_id?: string;
  author_name?: string;
  message: string; // Natural multi-line message composed by recruiter
  images?: string[]; // Array of base64 or secure image URLs (JPG, PNG, WebP)
  links?: string[]; // Auto-detected HTTPS URLs in text
  primary_apply_url?: string; // Explicit or extracted primary external URL
  post_type: IndustryPostType;
  target_scope?: 'All India' | 'State' | 'City' | 'College' | 'Department';
  target_state?: string;
  target_city?: string;
  target_college?: string;
  target_department?: string;
  target_batches?: string; // e.g. "2024-2026", "Final Year"
  skills?: string[]; // Technical skills/tags
  application_mode: 'external' | 'internal'; // 'external' (default if URL present)
  created_at: string; // ISO format
  saved_by?: string[]; // Student IDs who bookmarked the post
  status: 'published' | 'draft' | 'archived';
  external_clicks_count?: number; // Real external link clicks telemetry
  applicant_count?: number; // Legacy or external click count
  likes_count?: number; // Atomic count of real user likes
  comments_count?: number; // Atomic count of real user comments
  shares_count?: number; // Atomic count of real share actions
  views_count?: number; // Real impression count via IntersectionObserver
  saves_count?: number; // Atomic count of bookmarks
}

export interface PostCommentItem {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userRole: string;
  text: string;
  createdAt: string;
  replyToId?: string;
  replyToAuthor?: string;
  isRecruiterReply?: boolean;
  server_timestamp?: any;
}

export interface PostLikeItem {
  userId: string;
  userName?: string;
  userRole?: string;
  createdAt: string;
}

export interface PostViewItem {
  viewerId: string;
  viewerRole?: string;
  viewedAt: string;
}

export interface PostEngagementStats {
  postId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  external_link_clicks: number;
  applications?: number;
  engagementRate: number; // percentage e.g. 12.5
}

export interface PostNotificationItem {
  id: string;
  recipientId: string;
  actorId: string;
  actorName: string;
  type: 'like' | 'comment' | 'reply' | 'share' | 'message';
  postId?: string;
  postTitle?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface IndustryPostFilterParams {
  post_type?: string;
  department?: string;
  search?: string;
  company?: string;
}

// ── 31. PROFESSIONAL DIRECT MESSAGING (SIH26044) ────────────────
export interface ConversationItem {
  id: string;
  participants: string[]; // [userAId, userBId]
  participantDetails?: Record<string, {
    name: string;
    role: string;
    email?: string;
    company?: string;
    department?: string;
    avatar?: string;
  }>;
  participantData?: Record<string, any>;
  lastMessage: string;
  lastMessageTimestamp?: string;
  lastMessageTime?: string;
  lastSenderId?: string;
  unreadCount?: number | Record<string, number>;
  updatedAt: string;
  createdAt?: string;
}

export interface DirectMessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientName?: string;
  recipientRole?: string;
  text: string;
  createdAt: string;
  read: boolean;
}

// ── 32. STUDENT INTERNAL PROFESSIONAL PROFILE (SIH26044) ────────
export interface StudentProjectItem {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  live_url?: string;
  contribution?: string;
}

export interface StudentCertificationItem {
  id: string;
  name: string;
  issuing_org?: string;
  issuer?: string;
  issue_date?: string;
  credential_url?: string;
  is_verified?: boolean;
  score?: number;
}

export interface StudentExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  skills: string[];
  is_verified?: boolean;
}

export interface StudentAchievementItem {
  id: string;
  title: string;
  event_name: string;
  year: string;
  description: string;
}

export interface StudentInternalProfile {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  phone?: string;
  location: string;
  profile_photo?: string;
  headline?: string;
  bio?: string;
  privacy_setting: 'public' | 'recruiter_only' | 'private';

  // Academic Profile
  discipline?: string; // e.g. Mechanical Engineering, Civil Engineering, Electrical, Computer Science, etc.
  degree: string;
  program?: string; // B.Tech, B.E., M.Tech, Diploma, etc.
  college: string;
  department: string;
  semester: number;
  academic_year?: string;
  graduation_year?: number;
  cgpa?: string;

  // Technical Skills across Disciplines
  skills: StudentSkillItem[];

  // Data-Driven Insights (Derived from assessment scores & skill gap)
  data_driven_strengths: string[];
  data_driven_weaknesses: string[];

  // Projects, Certs, Experience, Achievements
  projects: StudentProjectItem[];
  certifications: StudentCertificationItem[];
  experience: StudentExperienceItem[];
  achievements: StudentAchievementItem[];

  // Portfolio & External Links (multi-disciplinary)
  portfolio_links: {
    resume_ai_portfolio?: string;
    github?: string;
    linkedin?: string;
    website?: string;
    codeforces?: string;
    leetcode?: string;
    cad_portfolio?: string; // CAD / 3D model link (GrabCAD, Autodesk Viewer, etc.)
    behance?: string;
    research_gate?: string;
  };

  // Career Interests & Roles
  target_role?: string;
  target_roles?: string[];

  // Earned Certificates & Badges
  earned_certificates?: CertificateRecord[];
  earned_badges?: BadgeItem[];

  // Assessment Telemetry
  assessment_insights?: {
    tests_completed: number;
    average_score: number;
    highest_scoring_language?: string;
    highest_scoring_skill?: string;
    highest_scoring_domain?: string;
    topic_strengths?: string[];
    topic_weaknesses?: string[];
    latest_test_date?: string;
  };

  updated_at: string;
}

export interface CompanyProfileData {
  id: string;
  company_name: string;
  logo_url?: string;
  is_verified: boolean;
  industry: string;
  about: string;
  website: string;
  locations: string[];
  company_size?: string;
  contact_email?: string;
  contact_person?: string;
  active_openings_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ── 33. QUESTION BANK & FACULTY QUALITY CONTROL ──────────────────
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Industry';
export type QuestionReviewStatus = 'Draft' | 'Review' | 'Approved' | 'Published' | 'Archived' | 'VERIFIED' | 'LEGACY' | 'REVIEW_REQUIRED' | 'DRAFT' | 'REJECTED';
export type QuestionType = 'conceptual' | 'code_output' | 'debugging' | 'scenario' | 'numerical' | 'interview' | 'practical' | 'complexity';

export interface BankQuestion {
  id: string;
  // Multi-disciplinary hierarchy
  domainId?: string; // e.g. 'mechanical', 'civil', 'electrical', 'ece', 'programming', 'cs_it', etc.
  domainName?: string; // 'Mechanical Engineering', etc.
  categoryId?: string; // 'cad_cam', 'programming', etc.
  categoryName?: string;
  skillId?: string; // 'solidworks', 'autocad', 'plc', 'python', etc.
  skillName?: string; // 'SolidWorks', 'PLC Programming', etc.
  // Backward compatibility alias for programming assessments
  programmingLanguage?: 'Python' | 'Java' | 'SQL' | 'C++' | 'JavaScript' | 'TypeScript' | 'C' | 'Go' | 'Rust' | 'Bash' | string;
  languageId?: string;
  module?: string;
  topic: string;
  topicId?: string;
  topicName?: string;
  subtopic?: string | null;
  primaryConcept?: string;
  duplicateGroupId?: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  practicalType?: 'debugging' | 'troubleshooting' | 'calculation' | 'design' | 'scenario' | 'complexity' | 'edge_cases' | 'general' | string;
  question: string;
  codeSnippet?: string | null;
  figureUrl?: string | null;
  diagramDescription?: string | null;
  options: string[];
  correctIndex: number;
  correctAnswer?: string;
  hint?: string;
  explanation: string;
  incorrectOptionExplanations?: Record<number, string> | string[];
  learningObjective?: string;
  tags?: string[];
  marks: number;
  negativeMarks: number;
  estimatedTimeSeconds?: number | null;
  sourceRef?: string | null;
  status: QuestionReviewStatus;
  verified?: boolean;
  reviewStatus?: string;
  version?: number;
  qualityScore?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  subjectId?: string;
  sourceType?: 'syllabus_blueprint' | 'ai_generated' | 'faculty_authored' | 'legacy';
  generatorModel?: string;
  reviewModel?: string;
  duplicateHash?: string;
  codeValidationOutput?: string;
  validationResults?: Record<string, boolean | string | number>;
}

export interface SkillQuestionBank {
  skillId: string;
  skillName: string;
  domainId: string;
  domainName?: string;
  version: string | number;
  questions: BankQuestion[];
}

// ── 34. PROGRAMMING LANGUAGE LEARNING DIRECTORY & EXTERNAL GATEWAY ──
export interface TopicExternalReference {
  sourceName: 'MDN Web Docs' | 'W3Schools' | 'Official Documentation' | string;
  referenceTitle: string;
  referenceUrl: string;
  isPrimary?: boolean;
}

export interface LanguageTopicItem {
  id: string;
  title: string;
  description?: string;
  externalReferences: TopicExternalReference[];
}

export interface LanguageModuleItem {
  id: string;
  title: string;
  description?: string;
  topics: LanguageTopicItem[];
}

export interface ProgrammingLanguageItem {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  category: 'General-purpose' | 'Systems / Low-level' | 'Scripting / Shell' | 'Web' | 'Database / Query' | 'Mobile' | 'Specialized / Modern' | string;
  description: string;
  isPopular?: boolean;
  officialDocsUrl?: string;
  searchable: boolean;
  status: 'active';
  modules: LanguageModuleItem[];
}

export interface LearningBookmarkItem {
  id: string;
  studentId: string;
  languageId: string;
  languageName: string;
  moduleId: string;
  moduleTitle: string;
  topicId: string;
  topicTitle: string;
  referenceTitle: string;
  referenceUrl: string;
  sourceName: string;
  createdAt: string;
}

export interface LearningHistoryItem {
  id: string;
  studentId: string;
  languageName: string;
  moduleTitle: string;
  topicTitle: string;
  referenceUrl: string;
  sourceName: string;
  visitedAt: string;
}

// Legacy backward-compatibility types
export interface ReferenceItem {
  title: string;
  url: string;
  type: 'official_docs' | 'mdn' | 'standard' | 'tutorial' | 'book';
}

export interface CodeExampleItem {
  title: string;
  language: string;
  code: string;
  explanation?: string;
}

export interface TopicLearningContent {
  id: string;
  language: string;
  moduleId: string;
  moduleName: string;
  topicId: string;
  topicName: string;
  overview: string;
  objectives: string[];
  concepts: { title: string; explanation: string }[];
  syntax?: string;
  codeExamples: CodeExampleItem[];
  commonMistakes: { mistake: string; fix: string; explanation: string }[];
  interviewPoints: string[];
  practicalExamples?: string[];
  references: ReferenceItem[];
  subtopics?: string[];
}

export interface KnowledgeTopic {
  id: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  difficulty: QuestionDifficulty;
  questionCount?: number;
  subtopics?: string[];
}

export interface KnowledgeModule {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  topics: KnowledgeTopic[];
}

export interface KnowledgeBaseLanguage {
  id: string;
  name: string;
  category: 'Programming' | 'Database' | 'Systems' | 'Web' | 'DevOps' | string;
  description: string;
  modules: KnowledgeModule[];
}

// ── 35. CAREER ROLES & SKILL ROADMAP INTELLIGENCE ────────────────
export interface RoleSkillRequirement {
  skill: string;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Industry-Ready';
  category: 'Language' | 'Framework' | 'Database' | 'Tool' | 'Concept' | 'Frontend' | 'Backend' | 'DevOps' | 'AI' | 'ORM' | 'OS' | 'Container' | 'Orchestration' | 'IaC' | 'Automation' | 'Big Data' | 'Pipeline' | 'Security' | 'Platform' | string;
  isCore: boolean;
}

export interface CareerRoleDefinition {
  id: string;
  title: string;
  category: 'Development' | 'Data & AI' | 'Cloud & DevOps' | 'Security & Systems' | 'Quality' | 'AI / Data' | 'Enterprise' | 'Infrastructure' | 'Systems' | 'Security' | 'Architecture' | string;
  shortDescription: string;
  overview: string;
  basicRequirements: string[];
  intermediateRequirements: string[];
  advancedRequirements: string[];
  industryReadyRequirements: string[];
  recommendedLanguages: string[];
  recommendedTechnologies: string[];
  commonCombinations: { combo: string; description: string }[];
  requiredSkills: RoleSkillRequirement[];
  learningPathModules: { language: string; module: string; topic: string }[];
}

export interface RoleSkillGapResult {
  roleId: string;
  roleTitle: string;
  readinessPercentage: number;
  strongSkills: { skill: string; score: number }[];
  moderateSkills: { skill: string; score: number }[];
  needsImprovementSkills: { skill: string; score: number }[];
  missingSkills: string[];
  recommendations: {
    skill: string;
    action: string;
    language?: string;
    module?: string;
    topic?: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

// ── 36. DIGITAL CERTIFICATION & BADGES ───────────────────────────
export interface CertificateRecord {
  id: string; // NC-JAVA-XXXXXXXX
  studentId: string;
  studentName: string;
  studentInstitution?: string;
  studentDepartment?: string;
  assessmentId: string;
  assessmentName: string;
  skillOrLanguage: string;
  moduleOrTopic?: string;
  difficulty: string;
  score: number;
  percentage: number;
  totalQuestions: number;
  issuedAt: string;
  status: 'Valid' | 'Revoked';
  verificationUrl?: string;
  issuer: 'Nova CareerConnect Skill Accreditation';
  achievementStatement: string;
  proctorTrustScore: number;
}

export interface BadgeItem {
  id: string;
  title: string;
  category: 'Skill' | 'Milestone' | 'Performance' | 'Streak';
  icon: string;
  description: string;
  earnedAt: string;
  criteria: string;
  verificationHash?: string;
}

// ── 37. SUPER ADMIN & INSTITUTION ADMIN OVERHAUL TYPES ───────────────────
export interface InstitutionRecord {
  id: string;
  officialName: string;
  shortName?: string;
  code: string;
  institutionType:
    | 'Government Engineering College'
    | 'National Institute (IIT/NIT/IIIT)'
    | 'Autonomous University'
    | 'State University'
    | 'Private University'
    | 'Deemed University'
    | 'Ayush & Medical Institute'
    | 'Affiliated Engineering College'
    | string;
  ownership: 'Government' | 'Private' | 'Autonomous' | 'Public-Private' | string;
  university?: string;
  affiliation?: string;
  accreditation?: string;
  state: string;
  district?: string;
  city: string;
  address?: string;
  pincode?: string;
  website?: string;
  officialEmail?: string;
  departments: string[];
  establishedYear?: number;
  verificationStatus: 'Pending' | 'Under Review' | 'Verified' | 'Rejected' | 'Suspended';
  activeStatus: 'Active' | 'Suspended' | 'Inactive';
  source?: string;
  sourceReference?: string;
  createdAt: string;
  updatedAt?: string;
  studentCount?: number;
  facultyCount?: number;
}

export interface InstitutionFilterParams {
  state?: string;
  district?: string;
  city?: string;
  institutionType?: string;
  ownership?: string;
  verificationStatus?: string;
  activeStatus?: string;
  search?: string;
}

export interface InstitutionImportRow {
  officialName: string;
  shortName?: string;
  code: string;
  institutionType: string;
  ownership: string;
  university?: string;
  accreditation?: string;
  state: string;
  district?: string;
  city: string;
  website?: string;
  officialEmail?: string;
  departments?: string[];
  establishedYear?: number;
}

export interface InstitutionImportPreview {
  totalRows: number;
  validRows: InstitutionImportRow[];
  duplicateRows: { row: InstitutionImportRow; reason: string }[];
  invalidRows: { row: any; errors: string[] }[];
}

export interface InstitutionImportResult {
  importedCount: number;
  updatedCount: number;
  duplicateCount: number;
  failedCount: number;
  errors: string[];
  importedAt: string;
}

export interface SuperAdminMetrics {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalInstitutions: number;
  totalCompanies: number;
  totalOpportunities: number;
  totalApplications: number;
  pendingApprovals: number;
  activeUsers: number;
  activeInstitutions: number;
  activeIndustryPartners: number;
  placementCount: number;
  internshipCount: number;
  assessmentAttempts: number;
  verifiedInstitutions: number;
  verifiedCompanies: number;
  pendingVerifications: number;
  lastUpdated: string;
}

export interface InstitutionAdminMetrics {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalInternships: number;
  totalPlacements: number;
  placementReadyStudents: number;
  industryPartners: number;
  hiringPartners: number;
  activeOpportunities: number;
  applicationsCount: number;
  selectedStudents: number;
  assessedStudents: number;
  activeAssessments: number;
  verifiedPartners: number;
  avgReadinessScore: number;
  avgAccuracy: number;
}

export interface PlacementFunnelMetrics {
  eligible: number;
  applied: number;
  shortlisted: number;
  interviewed: number;
  selected: number;
  joined: number;
  conversionRate: number; // percentage
}

export interface DepartmentSkillGapItem {
  skillName: string;
  department: string;
  currentLevel: number; // 0-100%
  requiredLevel: number; // 0-100%
  gapPercentage: number; // 0-100%
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedStudentsCount: number;
  industryDemand: 'Critical' | 'High' | 'Moderate';
  curriculumCoverage: 'None' | 'Basic' | 'Intermediate' | 'Advanced';
}

export interface ServiceHealthItem {
  serviceName: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number;
  lastChecked: string;
  endpointOrDescription: string;
}

export interface PlatformHealthReport {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  services: ServiceHealthItem[];
  checkedAt: string;
}

export interface InstitutionPartnerCompany {
  id: string;
  companyName: string;
  industry: string;
  activeOpportunities: number;
  internships: number;
  placements: number;
  applications: number;
  hiringStatus: 'Actively Hiring' | 'Paused' | 'Past Partner';
  lastActivity: string;
  contactEmail?: string;
}

export interface PlatformUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: UserRoleType;
  institution?: string;
  institutionId?: string;
  department?: string;
  departmentId?: string;
  company?: string;
  cgpa?: string;
  status: 'Active' | 'Suspended' | 'Pending';
  verificationStatus?: 'Verified' | 'Pending' | 'Rejected';
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserFilterParams {
  role?: string;
  status?: string;
  institution?: string;
  department?: string;
  search?: string;
}

export interface PlatformConfigData {
  supportedRoles: UserRoleType[];
  assessmentConfig: {
    passingScorePercentage: number;
    timeLimitMinutes: number;
    proctorStrictness: 'Low' | 'Medium' | 'High';
  };
  featureFlags: {
    publicRegistration: boolean;
    autoVerifyInstitutions: boolean;
    allowDirectCompanyRegistration: boolean;
    maintenanceMode: boolean;
  };
  uploadLimits: {
    maxPosterSizeMb: number;
    maxCsvBatchRows: number;
  };
  updatedAt?: string;
}

export interface InstitutionAccreditationRecord {
  institutionId: string;
  naacGrade?: string;
  naacCgpa?: string;
  nbaCycles?: string;
  aicteApprovalCode?: string;
  nirfRank?: number;
  validThru?: string;
  updatedAt: string;
}

export interface NationalBenchmarkData {
  institutionAvgScore: number;
  nationalAvgScore: number;
  stateAvgScore: number;
  percentileRank: number;
  participatingInstitutionsCount: number;
  totalAssessmentsEvaluated: number;
  dataPeriod: string;
  calculationMethod: string;
}

// ── 39. MULTI-DISCIPLINARY SKILL DOMAIN & TAXONOMY ARCHITECTURE ──
export type MultiDisciplinaryDomainId =
  | 'mechanical'
  | 'civil'
  | 'electrical'
  | 'ece'
  | 'cs_it'
  | 'chemical'
  | 'pharmacy'
  | 'management'
  | 'biotech'
  | string;

export interface SkillExternalResource {
  sourceName: string;
  resourceTitle: string;
  resourceUrl: string;
  isPrimary?: boolean;
}

export interface SkillTopic {
  id: string;
  title: string;
  description?: string;
  externalReferences: SkillExternalResource[];
}

export interface SkillItem {
  id: string;
  domainId: string;
  categoryId: string;
  name: string;
  code: string;
  description?: string;
  inDemandRating: 'Critical' | 'High' | 'Moderate';
  aliases?: string[];
  coreDisciplines: string[];
  topics: SkillTopic[];
  isPopular?: boolean;
  status: 'active' | 'archived';
  skillType?: string;
  minPracticalHours?: number;
}

export interface SkillCategory {
  id: string;
  domainId: string;
  name: string;
  code: string;
  description?: string;
  skills: SkillItem[];
}

export interface SkillDomain {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  categories: SkillCategory[];
  isCore: boolean;
  displayOrder: number;
  status: 'active' | 'inactive';
  associatedDepartments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ── 40. CURRICULUM MAPPING & BoS (BOARD OF STUDIES) GAP RECORDS ──
export interface CurriculumSkillMapping {
  skillId: string;
  skillName: string;
  coverageLevel: 'Basic' | 'Intermediate' | 'Advanced';
  semesterIntroduced?: number;
  hoursAllocated?: number;
}

export interface CurriculumRecord {
  id: string;
  institutionId: string;
  institutionName: string;
  departmentId: string;
  departmentName: string;
  program: string;
  academicYear: string;
  courseCode: string;
  courseTitle: string;
  semester: number;
  mappedSkills: CurriculumSkillMapping[];
  bosApproved: boolean;
  approvedBy?: string;
  lastUpdated: string;
}

// ── 41. INDUSTRY SKILL DEMAND RECORDS ──
export interface IndustryDemandRecord {
  id: string;
  domainId: string;
  domainName: string;
  skillId: string;
  skillName: string;
  demandLevel: 'Critical' | 'High' | 'Moderate';
  openPositionsCount: number;
  averagePackageLPA?: string;
  targetDepartments: string[];
  topRecruitingSectors: string[];
  updatedAt: string;
}

// ── 42. CURRICULUM VS INDUSTRY ALIGNMENT AUDIT RESULT ──
export interface CurriculumAlignmentAnalysis {
  institutionId: string;
  departmentId: string;
  departmentName: string;
  curriculumCoverageScore: number; // 0-100
  industryAlignmentScore: number; // 0-100
  prioritySkillGaps: Array<{
    skillName: string;
    curriculumCoverage: 'None' | 'Basic' | 'Intermediate' | 'Advanced' | 'Low' | 'Medium' | 'High';
    industryDemand: 'Critical' | 'High' | 'Moderate';
    studentAverageProficiency: number; // 0-100
    recommendation: string;
  }>;
  totalCoursesAudited: number;
  totalSkillsAudited: number;
  generatedAt: string;
}

