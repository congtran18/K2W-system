// Database table names constants
export const TABLE_NAMES = {
  USERS: 'users',
  KEYWORDS: 'keywords', 
  CLUSTERS: 'clusters',
  CONTENT: 'content',
  MEDIA_STORAGE: 'media_storage',
  SEO_AUDIT_LOG: 'seo_audit_log',
  PUBLISH_LOG: 'publish_log',
  ANALYTICS: 'analytics_data',
  FEEDBACK: 'feedback_data',
  SYSTEM_LOG: 'system_log',
  PROJECTS: 'projects',
  DOMAINS: 'domains'
} as const;

// Status constants  
export const KEYWORD_STATUS = {
  PENDING: 'pending',
  CLUSTERED: 'clustered', 
  PROCESSING: 'processing',
  CONTENT_GENERATED: 'content_generated',
  IMAGES_GENERATED: 'images_generated',
  SEO_OPTIMIZED: 'seo_optimized',
  READY_TO_PUBLISH: 'ready_to_publish',
  PUBLISHED: 'published',
  FAILED: 'failed'
} as const;

export const CONTENT_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  SEO_OPTIMIZED: 'seo_optimized', 
  IMAGES_ADDED: 'images_added',
  READY_TO_PUBLISH: 'ready_to_publish',
  PUBLISHED: 'published',
  FAILED: 'failed',
  NEEDS_REVIEW: 'needs_review'
} as const;

export const JOB_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing', 
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

export const JOB_TYPES = {
  CONTENT_GENERATION: 'content_generation',
  IMAGE_GENERATION: 'image_generation',
  SEO_OPTIMIZATION: 'seo_optimization',
  TRANSLATION: 'translation',
  ANALYTICS_SYNC: 'analytics_sync',
  PUBLISHING: 'publishing'
} as const;

// Language and region constants
export const LANGUAGES = {
  EN: 'en-US',
  ZH_TW: 'zh-TW',
  ZH_CN: 'zh-CN', 
  JA: 'ja-JP',
  KO: 'ko-KR',
  VI: 'vi-VN',
  TH: 'th-TH',
  FR: 'fr-FR',
  DE: 'de-DE',
  ES: 'es-ES'
} as const;

export const REGIONS = {
  US: 'US',
  AU: 'AU', 
  SG: 'SG',
  TW: 'TW',
  CN: 'CN',
  JP: 'JP',
  KR: 'KR',
  VN: 'VN',
  TH: 'TH',
  FR: 'FR',
  DE: 'DE',
  ES: 'ES'
} as const;

// Content types
export const CONTENT_TYPES = {
  ARTICLE: 'article',
  BLOG: 'blog',
  PRODUCT: 'product', 
  LANDING: 'landing',
  FAQ: 'faq',
  SERVICE: 'service'
} as const;

// Search intent types
export const SEARCH_INTENT = {
  INFORMATIONAL: 'informational',
  TRANSACTIONAL: 'transactional',
  NAVIGATIONAL: 'navigational',
  COMMERCIAL: 'commercial'
} as const;

// Publishing platforms
export const PUBLISH_PLATFORMS = {
  WORDPRESS: 'wordpress',
  FIREBASE: 'firebase',
  REPLIT: 'replit',
  STATIC: 'static'
} as const;

// SEO metrics thresholds
export const SEO_THRESHOLDS = {
  MIN_KEYWORD_DENSITY: 2,
  MAX_KEYWORD_DENSITY: 3,
  MIN_READABILITY_SCORE: 60,
  MAX_META_TITLE_LENGTH: 60,
  MAX_META_DESCRIPTION_LENGTH: 155,
  MIN_WORD_COUNT: 800,
  MAX_WORD_COUNT: 2000
} as const;