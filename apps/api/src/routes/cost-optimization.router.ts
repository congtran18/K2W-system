/**
 * Cost Optimization API Routes
 * Provides endpoints for cost monitoring, optimization, and budget management
 */

import { Router } from 'express';
import { CostOptimizationController } from '../controllers/costOptimizationController';

const router: Router = Router();
const costOptimizationController = new CostOptimizationController();

/**
 * POST /api/cost/track-usage
 * Track token usage for cost monitoring
 */
router.post('/track-usage', costOptimizationController.trackUsage);

/**
 * POST /api/cost/optimize-prompt
 * Optimize a prompt to reduce token usage
 */
router.post('/optimize-prompt', costOptimizationController.optimizePrompt);

/**
 * GET /api/cost/analytics
 * Get comprehensive cost analytics
 */
router.get('/analytics', costOptimizationController.getCostAnalytics);

/**
 * GET /api/cost/recommendations
 * Get cost optimization recommendations
 */
router.get('/recommendations', costOptimizationController.getRecommendations);

/**
 * GET /api/cost/budget/status
 * Get current budget status
 */
router.get('/budget/status', costOptimizationController.getBudgetStatus);

/**
 * PUT /api/cost/budget/config
 * Update budget configuration
 */
router.put('/budget/config', costOptimizationController.updateBudgetConfig);

/**
 * POST /api/cost/batch-process
 * Process items in batches to optimize costs
 */
router.post('/batch-process', costOptimizationController.batchProcess);

export default router;