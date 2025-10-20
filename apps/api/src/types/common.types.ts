// Common Types for API Responses
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// A/B Testing Result Types
export interface ABTestVariantResult {
  conversions: number;
  conversion_rate: number;
  confidence_interval: [number, number];
  improvement: number;
  visitors?: number;
  revenue?: number;
}

export interface ABTestResults {
  results: Record<string, ABTestVariantResult>;
  statistical_significance: number;
  winner?: string;
  confidence_level: number;
  sample_size: number;
  duration_days: number;
}

// Analytics Data Types
export interface AnalyticsRow {
  impressions: number;
  clicks: number;
  position: number;
  query: string;
  url: string;
  ctr: number;
  date: string;
}

export interface SearchConsoleQuery {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface ContentAnalytics {
  total_impressions: number;
  total_clicks: number;
  average_position: number;
  click_through_rate: number;
  queries: SearchConsoleQuery[];
}

// Content Types
export interface FAQ {
  question: string;
  answer: string;
}

export interface ContentData {
  title: string;
  body: string;
  meta_title?: string;
  meta_description?: string;
  content_type: string;
  language: string;
  faqs?: FAQ[];
  headings?: Array<{ level: number; text: string }>;
  word_count?: number;
  seo_score?: number;
  readability_score?: number;
}

// Domain Configuration Types
export interface DomainConfig {
  url: string;
  platform: 'wordpress' | 'shopify' | 'firebase' | 'static';
  credentials: {
    username?: string;
    password?: string;
    api_key?: string;
    token?: string;
  };
  deployment_config?: Record<string, unknown>;
  monthly_cost?: number;
}

// Cache Types
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
}

export interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  serialize?: boolean;
}

// Workflow Types
export interface WorkflowJob {
  id: string;
  type: string;
  data: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
  progress?: number;
  error?: string;
  result?: Record<string, unknown>;
}

export interface WorkflowProgress {
  workflow_id: string;
  step: string;
  progress: number;
  message?: string;
  data?: Record<string, unknown>;
}

// External API Response Types
export interface SemrushKeywordData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  trends: number[];
}

export interface GoogleTrendsData {
  interest_over_time: Array<{ date: string; value: number }>;
  related_queries: {
    top: Array<{ query: string; value: number }>;
    rising: Array<{ query: string; value: number }>;
  };
  geo_distribution: Array<{ location: string; value: number }>;
}

// Database Query Types
export interface QueryFilters {
  status?: string[];
  content_type?: string[];
  language?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

// AI Service Types
export interface ContentGenerationOptions {
  keyword: string;
  language: string;
  region: string;
  content_type: string;
  word_count?: number;
  tone?: string;
  target_audience?: string;
  custom_prompt?: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  dimensions?: { width: number; height: number };
  quality?: 'standard' | 'hd';
  count?: number;
}

export interface TranslationOptions {
  content: string;
  target_languages: string[];
  preserve_formatting?: boolean;
  seo_optimize?: boolean;
}

// Response Wrapper Types
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    has_more?: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Socket Message Types
export interface SocketMessage {
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
  user_id?: string;
}

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  actions?: Array<{
    text: string;
    action: string;
    data?: Record<string, unknown>;
  }>;
}

// Request Handler Types
import { Request } from 'express';

export interface AuthenticatedRequest extends Omit<Request, 'cache'> {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  cache?: {
    get: (key: string) => Promise<unknown>;
    set: (key: string, data: unknown, ttl?: number) => Promise<void>;
  };
}

// Validation Types
export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'uuid';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: Record<string, unknown>;
}