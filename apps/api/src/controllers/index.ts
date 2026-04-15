/**
 * Controllers Index
 * Exports all controllers for easy importing
 */

// Main optimized controllers (currently active)
export { 
  KeywordsController, 
  ContentController, 
  AnalyticsController,
  WorkflowController
} from './optimized-k2w.controller';

// Advanced feature controllers
export { ExternalSeoController } from './external-seo.controller';
export { AdvancedAnalyticsController } from './advanced-analytics.controller';
export { AbTestingController } from './ab-testing.controller';
export { CostOptimizationController } from './cost-optimization.controller';
export { AiController } from './ai.controller';