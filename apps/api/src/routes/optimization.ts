/**
 * Phase 1 Optimization Routes
 * Easy integration of performance enhancements into existing K2W system
 */

import { Router, Express } from 'express';
import {
  optimizedHealthCheck,
  performanceInsights,
  cacheManagement,
  rateLimitManagement,
  createSmartCache
} from '../middleware/optimization-integration.middleware';

const router: Router = Router();

// === Health & Monitoring Endpoints ===

/**
 * Enhanced health check with optimization status
 * GET /api/optimize/health
 */
router.get('/health', optimizedHealthCheck);

/**
 * Performance insights and recommendations
 * GET /api/optimize/insights
 */
router.get('/insights', performanceInsights);

// === Cache Management Endpoints ===

/**
 * Get cache statistics and performance metrics
 * GET /api/optimize/cache/stats
 */
router.get('/cache/stats', cacheManagement.getStats);

/**
 * Clear all cache entries (admin only)
 * POST /api/optimize/cache/clear
 */
router.post('/cache/clear', cacheManagement.clearAll);

/**
 * Warm up cache with critical data
 * POST /api/optimize/cache/warmup
 * Body: { endpoints: string[] }
 */
router.post('/cache/warmup', cacheManagement.warmup);

// === Rate Limiting Management ===

/**
 * Get current rate limit status for user
 * GET /api/optimize/ratelimit/status
 */
router.get('/ratelimit/status', rateLimitManagement.getStatus);

// === Smart Cache Middleware Helpers ===

/**
 * Apply smart caching to existing routes
 */
export const cacheMiddleware = {
  // Analytics data - cache for 5 minutes
  analytics: createSmartCache('analytics', 300),
  
  // Content searches - cache for 10 minutes  
  content: createSmartCache('content', 600),
  
  // Keyword suggestions - cache for 30 minutes
  keywords: createSmartCache('keywords', 1800),
  
  // AI responses - cache for 2 hours
  ai: createSmartCache('ai', 7200),
  
  // Database queries - cache for 5 minutes
  database: createSmartCache('database', 300)
};

// === Integration Helper ===

/**
 * Easy integration function for existing controllers
 * Usage: 
 * import { addOptimizations } from './routes/optimization';
 * addOptimizations(app);
 */
export function addOptimizationsToExistingRoutes(app: Express): void {
  console.log('🔧 Integrating Phase 1 optimizations with existing routes...');
  
  // Add optimization routes
  app.use('/api/optimize', router);
  
  // Apply caching to existing endpoints
  if (app._router) {
    // Analytics endpoints
    app.use('/api/analytics', cacheMiddleware.analytics);
    
    // Content endpoints
    app.use('/api/content/search', cacheMiddleware.content);
    app.use('/api/content/suggestions', cacheMiddleware.content);
    
    // Keyword endpoints  
    app.use('/api/keywords/analyze', cacheMiddleware.ai); // AI-powered, longer cache
    app.use('/api/keywords/suggestions', cacheMiddleware.keywords);
    
    console.log('✅ Cache middleware applied to existing endpoints');
  }
  
  console.log('🚀 Phase 1 optimizations integrated successfully!');
  console.log('📊 Monitor performance at: /api/optimize/health');
  console.log('📈 View insights at: /api/optimize/insights');
}

export default router;

// === Usage Examples ===

/**
 * Example 1: Apply to entire Express app
 * ```typescript
 * import { applyPhase1Optimizations } from './middleware/phase1-integration.middleware';
 * import optimizationRoutes, { addOptimizationsToExistingRoutes } from './routes/optimization';
 * 
 * // Apply all optimizations
 * applyPhase1Optimizations(app);
 * 
 * // Add management routes
 * addOptimizationsToExistingRoutes(app);
 * ```
 * 
 * Example 2: Apply specific cache to individual routes
 * ```typescript
 * import { cacheMiddleware } from './routes/optimization';
 * 
 * router.get('/expensive-analytics', 
 *   cacheMiddleware.analytics,
 *   analyticsController.getExpensiveData
 * );
 * ```
 * 
 * Example 3: Monitor performance
 * ```bash
 * curl http://localhost:3000/api/optimize/health
 * curl http://localhost:3000/api/optimize/insights
 * curl http://localhost:3000/api/optimize/cache/stats
 * ```
 */