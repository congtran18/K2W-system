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
export { ExternalSeoController } from './externalSeoController';
export { AdvancedAnalyticsController } from './advancedAnalyticsController';
export { AbTestingController } from './abTestingController';
export { CostOptimizationController } from './costOptimizationController';
export { AiController } from './aiController';