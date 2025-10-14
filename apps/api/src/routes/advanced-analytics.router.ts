/**
 * Advanced Analytics API Routes
 * Provides endpoints for advanced analytics operations
 */

import { Router } from 'express';
import { AdvancedAnalyticsController } from '../controllers/advancedAnalyticsController';

const router: Router = Router();
const advancedAnalyticsController = new AdvancedAnalyticsController();

/**
 * POST /api/advanced-analytics/analytics-data
 * Get analytics data for content
 */
router.post('/analytics-data', advancedAnalyticsController.getAnalyticsData);

/**
 * POST /api/advanced-analytics/performance-metrics
 * Get performance metrics for multiple content pieces
 */
router.post('/performance-metrics', advancedAnalyticsController.getPerformanceMetrics);

/**
 * POST /api/advanced-analytics/actionable-insights
 * Generate actionable insights
 */
router.post('/actionable-insights', advancedAnalyticsController.generateActionableInsights);

/**
 * POST /api/advanced-analytics/analyze-trends
 * Analyze trends for specific metric
 */
router.post('/analyze-trends', advancedAnalyticsController.analyzeTrends);

/**
 * GET /api/advanced-analytics/alerts
 * Get active performance alerts
 */
router.get('/alerts', advancedAnalyticsController.getActiveAlerts);

/**
 * POST /api/advanced-analytics/alerts/:alert_id/resolve
 * Resolve a performance alert
 */
router.post('/alerts/:alert_id/resolve', advancedAnalyticsController.resolveAlert);

/**
 * GET /api/advanced-analytics/real-time
 * Get real-time analytics data
 */
router.get('/real-time', advancedAnalyticsController.getRealTimeData);

export default router;