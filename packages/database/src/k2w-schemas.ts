// K2W System Complete Database Schemas
// Based on Section 5.2 - Core Database Schema from K2W Specifications

export const TABLE_NAMES = {
  USERS: 'users',
  PROJECTS: 'projects', 
  KEYWORDS: 'keywords',
  CLUSTERS: 'clusters',
  CONTENT: 'content',
  MEDIA_STORAGE: 'media_storage',
  ANALYTICS_DATA: 'analytics_data',
  SEO_AUDIT_LOG: 'seo_audit_log',
  PUBLISH_LOG: 'publish_log',
  FEEDBACK_DB: 'feedback_db',
  SYSTEM_LOG: 'system_log'
} as const;

export const KEYWORD_STATUS = {
  PENDING: 'pending',
  CLUSTERING: 'clustering',
  CLUSTERED: 'clustered',
  QUEUED: 'queued',
  GENERATING_TEXT: 'generating_text',
  GENERATING_IMAGES: 'generating_images',
  SEO_REVIEW: 'seo_review',
  READY_TO_PUBLISH: 'ready_to_publish',
  PUBLISHED: 'published',
  FAILED: 'failed',
  ARCHIVED: 'archived'
} as const;

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  REVIEWING: 'reviewing',
  APPROVED: 'approved',
  OPTIMIZING: 'optimizing',
  READY_TO_PUBLISH: 'ready_to_publish',
  PUBLISHED: 'published',
  UPDATING: 'updating',
  ARCHIVED: 'archived'
} as const;

export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export const JOB_TYPES = {
  KEYWORD_CLUSTERING: 'keyword_clustering',
  CONTENT_GENERATION: 'content_generation',
  IMAGE_GENERATION: 'image_generation',
  SEO_OPTIMIZATION: 'seo_optimization',
  CONTENT_PUBLISHING: 'content_publishing',
  ANALYTICS_SYNC: 'analytics_sync',
  CONTENT_REFRESH: 'content_refresh',
  TRANSLATION: 'translation'
} as const;

export const SEARCH_INTENT = {
  INFORMATIONAL: 'informational',
  TRANSACTIONAL: 'transactional',
  NAVIGATIONAL: 'navigational',
  COMMERCIAL: 'commercial'
} as const;

export const CONTENT_TYPE = {
  ARTICLE: 'article',
  BLOG: 'blog',
  PRODUCT_PAGE: 'product_page',
  LANDING_PAGE: 'landing_page',
  FAQ: 'faq',
  GUIDE: 'guide'
} as const;

export const PUBLISH_STATUS = {
  QUEUED: 'queued',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
  UPDATED: 'updated'
} as const;

// Type definitions for K2W database records
export interface K2WUserRecord {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  project_ids: string[];
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface K2WProjectRecord {
  id: string;
  name: string;
  description?: string;
  domain: string;
  language: string;
  region: string;
  owner_id: string;
  settings: {
    auto_publish: boolean;
    seo_threshold: number;
    image_generation: boolean;
    content_approval_required: boolean;
    target_audience: string;
    brand_tone: string;
    internal_links: string[];
    cta_template: string;
  };
  created_at: string;
  updated_at: string;
}

export interface K2WKeywordRecord {
  id: string;
  keyword: string;
  region: string;
  language: string;
  project_id: string;
  cluster_id?: string;
  search_intent?: typeof SEARCH_INTENT[keyof typeof SEARCH_INTENT];
  volume?: number;
  difficulty?: number;
  cpc?: number;
  competition?: string;
  status: typeof KEYWORD_STATUS[keyof typeof KEYWORD_STATUS];
  metadata: {
    source: 'manual' | 'csv' | 'ahrefs' | 'semrush';
    imported_at: string;
    last_updated: string;
  };
  created_at: string;
  updated_at: string;
}

export interface K2WClusterRecord {
  id: string;
  name: string;
  topic: string;
  project_id: string;
  language: string;
  region: string;
  keyword_count: number;
  primary_keyword: string;
  related_keywords: string[];
  content_structure: {
    suggested_title: string;
    h2_topics: string[];
    faq_questions: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface K2WContentRecord {
  id: string;
  title: string;
  body: string;
  body_html: string;
  meta_title?: string;
  meta_description?: string;
  keyword_id: string;
  cluster_id: string;
  project_id: string;
  content_type: typeof CONTENT_TYPE[keyof typeof CONTENT_TYPE];
  language: string;
  region: string;
  status: typeof CONTENT_STATUS[keyof typeof CONTENT_STATUS];
  url?: string;
  published_at?: string;
  seo_score?: number;
  readability_score?: number;
  word_count?: number;
  headings: Array<{
    level: number;
    text: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  internal_links: string[];
  external_links: string[];
  images: string[];
  schema_markup?: string;
  ai_metadata: {
    model_version: string;
    prompt_template_version: string;
    generation_time: string;
    revision_count: number;
  };
  created_at: string;
  updated_at: string;
}

export interface K2WMediaStorageRecord {
  id: string;
  content_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  caption?: string;
  prompt_used?: string;
  ai_generated: boolean;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    source: 'dalle' | 'midjourney' | 'upload' | 'stock';
  };
  created_at: string;
}

export interface K2WAnalyticsDataRecord {
  id: string;
  content_id: string;
  url: string;
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  bounce_rate?: number;
  session_duration?: number;
  conversions?: number;
  revenue?: number;
  source: 'gsc' | 'ga4' | 'ahrefs';
  collected_at: string;
}

export interface K2WSEOAuditLogRecord {
  id: string;
  content_id: string;
  audit_type: 'automated' | 'manual';
  results: {
    keyword_density: number;
    readability_score: number;
    meta_completeness: boolean;
    internal_link_count: number;
    image_alt_completeness: boolean;
    schema_markup_present: boolean;
    suggestions: string[];
  };
  score: number;
  passed: boolean;
  audited_at: string;
}

export interface K2WPublishLogRecord {
  id: string;
  content_id: string;
  target_url: string;
  platform: 'wordpress' | 'firebase' | 'replit' | 'static';
  status: typeof PUBLISH_STATUS[keyof typeof PUBLISH_STATUS];
  response_data?: any;
  error_message?: string;
  published_at?: string;
  retry_count: number;
  metadata: {
    deployment_id?: string;
    cms_post_id?: string;
    domain: string;
  };
}

export interface K2WFeedbackRecord {
  id: string;
  content_id: string;
  feedback_type: 'performance' | 'quality' | 'user';
  metrics: {
    performance_score?: number;
    quality_score?: number;
    user_rating?: number;
  };
  suggestions: string[];
  auto_generated: boolean;
  applied: boolean;
  created_at: string;
}

export interface K2WSystemLogRecord {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

// Create types for inserts (optional fields)
export type CreateK2WUser = Omit<K2WUserRecord, 'id' | 'created_at' | 'updated_at'>;
export type CreateK2WProject = Omit<K2WProjectRecord, 'id' | 'created_at' | 'updated_at'>;
export type CreateK2WKeyword = Omit<K2WKeywordRecord, 'id' | 'created_at' | 'updated_at'>;
export type CreateK2WCluster = Omit<K2WClusterRecord, 'id' | 'created_at' | 'updated_at'>;
export type CreateK2WContent = Omit<K2WContentRecord, 'id' | 'created_at' | 'updated_at'>;
export type CreateK2WMediaStorage = Omit<K2WMediaStorageRecord, 'id' | 'created_at'>;
export type CreateK2WAnalyticsData = Omit<K2WAnalyticsDataRecord, 'id'>;
export type CreateK2WSEOAuditLog = Omit<K2WSEOAuditLogRecord, 'id'>;
export type CreateK2WPublishLog = Omit<K2WPublishLogRecord, 'id'>;
export type CreateK2WFeedback = Omit<K2WFeedbackRecord, 'id' | 'created_at'>;
export type CreateK2WSystemLog = Omit<K2WSystemLogRecord, 'id'>;

// Update types for partial updates
export type UpdateK2WUser = Partial<CreateK2WUser>;
export type UpdateK2WProject = Partial<CreateK2WProject>;
export type UpdateK2WKeyword = Partial<CreateK2WKeyword>;
export type UpdateK2WCluster = Partial<CreateK2WCluster>;
export type UpdateK2WContent = Partial<CreateK2WContent>;
export type UpdateK2WAnalyticsData = Partial<CreateK2WAnalyticsData>;
export type UpdateK2WSEOAuditLog = Partial<CreateK2WSEOAuditLog>;
export type UpdateK2WPublishLog = Partial<CreateK2WPublishLog>;
export type UpdateK2WFeedback = Partial<CreateK2WFeedback>;