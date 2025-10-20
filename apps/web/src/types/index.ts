/**
 * Type Definitions Index
 * Centralized exports for all type definitions
 */

// Core types
export * from './common';
export * from './ui';

// Feature-specific types
export * from './ab-testing';
export * from './content-enhancement';
export * from './dashboard';
export * from './multi-site';
export * from './seo-tools';

// Re-export commonly used types
export type {
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  FormState,
  FilterParams,
  SortParams,
  DateRange
} from './common';

export type {
  ABTestData,
  ABTestFormData,
  ABTestResults,
  ABTestVariant
} from './ab-testing';

export type {
  ContentToolsProps,
  ImageGenerationFormData,
  TranslationFormData,
  PublishingFormData
} from './content-enhancement';

export type {
  DashboardStats,
  Keyword,
  MetricCardProps,
  SystemHealthData
} from './dashboard';

export type {
  Domain,
  Deployment,
  AnalyticsData,
  SiteConfig
} from './multi-site';

export type {
  KeywordData,
  CompetitorData,
  SEOAnalysisResult,
  ContentGap
} from './seo-tools';

export type {
  LoadingSkeletonProps,
  StatsCardProps,
  PageHeaderProps,
  DataTableProps,
  ModalProps
} from './ui';