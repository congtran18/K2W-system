import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  created_at: z.date(),
  updated_at: z.date(),
});

// User Profile schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  full_name: z.string().optional(),
  company: z.string().optional(),
  role: z.enum(['user', 'admin', 'manager']).default('user'),
  default_language: z.string().default('en-US'),
  default_region: z.string().default('US'),
  timezone: z.string().default('UTC'),
  monthly_keyword_limit: z.number().int().default(100),
  keywords_used_this_month: z.number().int().default(0),
  created_at: z.date(),
  updated_at: z.date(),
});

// Language schema
export const LanguageSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(2).max(3),
  name: z.string(),
  region: z.string().min(2).max(3),
  locale: z.string(),
  is_active: z.boolean().default(true),
  created_at: z.date(),
});

// Keyword schema
export const KeywordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  keyword_text: z.string().min(1),
  status: z.enum(['QUEUED', 'ANALYZING_SEO', 'GENERATING_TEXT', 'CHECKING_GRAMMAR', 'CHECKING_PLAGIARISM', 'COMPLETED', 'FAILED']).default('QUEUED'),
  error_message: z.string().optional(),
  region: z.string().default('US'),
  language: z.string().default('en'),
  search_volume: z.number().int().min(0).optional(),
  difficulty: z.number().min(0).max(100).optional(),
  cluster_id: z.string().uuid().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Content schema
export const ContentSchema = z.object({
  id: z.string().uuid(),
  keyword_id: z.string().uuid(),
  title: z.string().min(1),
  body_html: z.string().min(1),
  meta_description: z.string().optional(),
  meta_title: z.string().optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).default([]),
  headings: z.array(z.object({
    level: z.number().int().min(1).max(6),
    text: z.string(),
  })).default([]),
  plagiarism_report_url: z.string().url().optional(),
  performance_score: z.number().min(0).max(100).optional(),
  readability_score: z.number().min(0).max(100).optional(),
  seo_score: z.number().min(0).max(100).optional(),
  preview_url: z.string().url().optional(),
  published_url: z.string().url().optional(),
  status: z.enum(['draft', 'reviewing', 'approved', 'published', 'rejected']).default('draft'),
  created_at: z.date(),
  updated_at: z.date(),
  published_at: z.date().optional(),
});

// Analytics schema
export const AnalyticsSchema = z.object({
  id: z.string().uuid(),
  content_id: z.string().uuid(),
  date: z.date(),
  impressions: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  ctr: z.number().min(0).max(1).default(0),
  average_position: z.number().min(0).default(0),
  bounce_rate: z.number().min(0).max(1).optional(),
  time_on_page: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).default(0),
  created_at: z.date(),
});

// Job schema for background tasks
export const JobSchema = z.object({
  id: z.string().uuid(),
  keyword_id: z.string().uuid().optional(),
  type: z.enum(['content_generation', 'image_generation', 'seo_optimization', 'translation', 'plagiarism_check', 'grammar_check']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  payload: z.record(z.any()).default({}),
  result: z.record(z.any()).optional(),
  error_message: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  estimated_time: z.number().min(0).optional(),
  created_at: z.date(),
  updated_at: z.date(),
  completed_at: z.date().optional(),
});

// Create input schemas (without auto-generated fields)
export const CreateKeywordSchema = KeywordSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const CreateContentSchema = ContentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  published_at: true,
});

export const CreateJobSchema = JobSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  completed_at: true,
});

export const CreateUserProfileSchema = UserProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Update schemas (partial updates)
export const UpdateKeywordSchema = CreateKeywordSchema.partial();
export const UpdateContentSchema = CreateContentSchema.partial();
export const UpdateJobSchema = CreateJobSchema.partial();
export const UpdateUserProfileSchema = CreateUserProfileSchema.partial();

// Export types
export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Keyword = z.infer<typeof KeywordSchema>;
export type Content = z.infer<typeof ContentSchema>;
export type Analytics = z.infer<typeof AnalyticsSchema>;
export type Job = z.infer<typeof JobSchema>;

export type CreateKeyword = z.infer<typeof CreateKeywordSchema>;
export type CreateContent = z.infer<typeof CreateContentSchema>;
export type CreateJob = z.infer<typeof CreateJobSchema>;
export type CreateUserProfile = z.infer<typeof CreateUserProfileSchema>;

export type UpdateKeyword = z.infer<typeof UpdateKeywordSchema>;
export type UpdateContent = z.infer<typeof UpdateContentSchema>;
export type UpdateJob = z.infer<typeof UpdateJobSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;

// Database table names
export const TABLE_NAMES = {
  USERS: 'auth.users',
  USER_PROFILES: 'user_profiles',
  LANGUAGES: 'languages',
  KEYWORDS: 'keywords',
  CONTENT: 'content',
  ANALYTICS: 'analytics',
  JOBS: 'jobs',
} as const;

// Status enums for easy reference
export const KEYWORD_STATUS = {
  QUEUED: 'QUEUED',
  ANALYZING_SEO: 'ANALYZING_SEO', 
  GENERATING_TEXT: 'GENERATING_TEXT',
  CHECKING_GRAMMAR: 'CHECKING_GRAMMAR',
  CHECKING_PLAGIARISM: 'CHECKING_PLAGIARISM',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
} as const;

export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const JOB_TYPES = {
  CONTENT_GENERATION: 'content_generation',
  IMAGE_GENERATION: 'image_generation',
  SEO_OPTIMIZATION: 'seo_optimization',
  TRANSLATION: 'translation',
  PLAGIARISM_CHECK: 'plagiarism_check',
  GRAMMAR_CHECK: 'grammar_check',
} as const;