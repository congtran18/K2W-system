// ===== K2W COMPREHENSIVE TYPE DEFINITIONS =====
// Fix tất cả type any trong codebase

// ===== ERROR HANDLING TYPES =====
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: unknown;
}

// ===== REQUEST/RESPONSE TYPES =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== ANALYTICS TYPES =====
export interface AnalyticsCredentials {
  google: {
    project_id: string;
    client_email: string;
    private_key: string;
    property_id: string;
  };
}

export interface GA4Credentials {
  project_id: string;
  client_email: string;
  private_key: string;
  property_id: string;
}

export interface SearchConsoleCredentials {
  project_id: string;
  client_email: string;
  private_key: string;
  site_url: string;
}

export interface AnalyticsMetrics {
  sessions: number;
  users: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  conversion_rate: number;
  goal_completions: number;
}

export interface GA4Data {
  sessions: number;
  users: number;
  page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  events: Array<{
    event_name: string;
    event_count: number;
  }>;
}

export interface SearchConsoleData {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  queries: Array<{
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }>;
}

export interface ContentPerformanceData {
  url: string;
  title: string;
  page_views: number;
  unique_visitors: number;
  bounce_rate: number;
  avg_time_on_page: number;
  goal_completions: number;
  seo_score: number;
}

// ===== A/B TESTING TYPES =====
export interface TestResult {
  variant_id: string;
  conversions: number;
  conversion_rate: number;
  confidence_interval: [number, number];
  improvement: number;
  statistical_significance: number;
  sample_size: number;
}

export interface TestVariant {
  id: string;
  name: string;
  content_id: string;
  traffic_percentage: number;
  conversions: number;
  visitors: number;
  conversion_rate: number;
}

export interface ABTestResults {
  test_id: string;
  winner?: string;
  statistical_significance: number;
  results: Record<string, TestResult>;
  recommendations: string[];
  created_at: string;
  completed_at?: string;
}

// ===== CONTENT TYPES =====
export interface ContentData {
  id: string;
  title: string;
  body: string;
  meta_title?: string;
  meta_description?: string;
  keyword_id: string;
  content_type: string;
  language: string;
  status: string;
  url?: string;
  seo_score?: number;
  word_count?: number;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface DomainData {
  id: string;
  domain: string;
  type: string;
  status: string;
  ssl_enabled: boolean;
  monthly_cost: number;
  traffic_estimate: number;
  last_deployed?: string;
}

// ===== AI SERVICE TYPES =====
export interface OpenAIParams {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ImageGenerationParams {
  model: string;
  prompt: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  response_format?: 'url' | 'b64_json';
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

// ===== EXTERNAL SEO TYPES =====
export interface SEMrushResponse {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  trends: number[];
}

export interface AhrefsResponse {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competition: string;
  serp_features: string[];
}

export interface GoogleTrendsData {
  timeline: Array<{
    date: string;
    value: number;
  }>;
  related_queries: {
    top: Array<{
      query: string;
      value: number;
    }>;
    rising: Array<{
      query: string;
      value: number;
    }>;
  };
  geo_distribution: Array<{
    location: string;
    value: number;
  }>;
}

// ===== DATABASE TYPES =====
export interface DatabaseQueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
  command: string;
  fields: Array<{
    name: string;
    dataTypeID: number;
  }>;
}

export interface QueryParams {
  query: string;
  params: unknown[];
}

export interface CacheEntry<T = unknown> {
  result: T;
  timestamp: number;
  ttl: number;
}

// ===== WORKFLOW TYPES =====
export interface WorkflowJob {
  id: string;
  type: string;
  data: unknown;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  result?: unknown;
}

export interface WorkflowProgress {
  workflow_id: string;
  current_step: string;
  progress_percentage: number;
  estimated_completion: string;
  steps_completed: number;
  total_steps: number;
}

export interface WorkflowResult {
  workflow_id: string;
  status: 'completed' | 'failed';
  result?: unknown;
  error?: string;
  duration: number;
  steps_executed: number;
}

// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  actions?: Array<{
    text: string;
    action: string;
    data?: unknown;
  }>;
}

// ===== CACHE TYPES =====
export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  compress?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  memory_usage: number;
  hit_ratio: number;
}

// ===== RATE LIMITER TYPES =====
export interface RateLimiterResponse {
  allowed: boolean;
  remaining: number;
  reset_time: number;
  retry_after?: number;
}

// ===== COST OPTIMIZATION TYPES =====
export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface CostBreakdown {
  service: string;
  cost: number;
  usage_details: Record<string, unknown>;
}

export interface OptimizationRecommendation {
  type: 'token_optimization' | 'api_optimization' | 'infrastructure_optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potential_savings: number;
  implementation_effort: 'low' | 'medium' | 'high';
  action_required: string;
}

// ===== PUBLISHING TYPES =====
export interface PublishingPlatform {
  type: 'wordpress' | 'shopify' | 'ghost' | 'custom';
  config: Record<string, unknown>;
  schedule?: string;
}

export interface PublishingResult {
  platform: string;
  success: boolean;
  published_url?: string;
  error?: string;
  published_at: string;
}

// ===== SCHEMA MARKUP TYPES =====
export interface SchemaMarkup {
  '@context': string;
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  mainEntity?: unknown;
  [key: string]: unknown;
}

// ===== PROJECT SETTINGS TYPES =====
export interface ProjectSettings {
  seo_optimization: boolean;
  auto_publish: boolean;
  content_language: string;
  target_region: string;
  publishing_platforms: string[];
  ai_model_preferences: {
    content_generation: string;
    image_generation: string;
    translation: string;
  };
  budget_limits: {
    monthly_limit: number;
    daily_limit: number;
    alert_thresholds: number[];
  };
}

// ===== DECORATOR TYPES (for DTO validation) =====
export type DecoratorFunction = (target: unknown, propertyKey: string) => void;
export type ConditionalDecoratorFunction = (condition: unknown) => DecoratorFunction;

// ===== UTILITY TYPES =====
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ===== EXPORT ALL =====
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
export interface JSONArray extends Array<JSONValue> {}

// Generic unknown type for legacy any usage
export type UnknownRecord = Record<string, unknown>;
export type UnknownArray = unknown[];
export type UnknownFunction = (...args: unknown[]) => unknown;