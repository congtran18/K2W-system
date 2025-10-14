/**
 * Service exports for K2W System
 * Centralized export of all services for easy importing
 */

export { ExternalSEOAPIService } from './external-seo-api.service';
export { AdvancedAnalyticsService } from './advanced-analytics.service';
export { ABTestingFramework } from './ab-testing.service';
export { CostOptimizationService } from './cost-optimization.service';

// Initialize and export service instances
export { externalSEOAPIService } from './external-seo-api.service';
export { advancedAnalyticsService } from './advanced-analytics.service';
export { abTestingFramework } from './ab-testing.service';
export { costOptimizationService } from './cost-optimization.service';

// Type exports
export type {
  KeywordMetrics
} from '../types/external-seo.types';

export type {
  AdvancedAnalyticsData
} from '../types/analytics.types';

export type {
  ABTestVariant,
  ABTestConfig,
  ABTestResults,
  TestMetrics
} from '../types/ab-testing.types';

export type {
  CostMetrics,
  CostAlert,
  OptimizationRecommendation,
  BudgetConfig,
  TokenUsagePattern
} from '../types/cost-optimization.types';