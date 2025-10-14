/**
 * K2W Unified Router
 * Combines all K2W functionality under a single router
 */

import express, { Router } from 'express';
import k2wRoutes from './optimized-k2w.router';

// Import new advanced routes
import externalSeoRoutes from './external-seo.router';
import advancedAnalyticsRoutes from './advanced-analytics.router';
import abTestingRoutes from './ab-testing.router';
import costOptimizationRoutes from './cost-optimization.router';

const router: Router = express.Router();

// Health check for K2W API
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'K2W Workflow API',
    version: '2.0.0',
    capabilities: [
      'keyword-research',
      'content-generation',
      'seo-optimization',
      'multi-site-publishing',
      'analytics-integration',
      'ab-testing',
      'cost-optimization',
      'external-seo-apis'
    ],
    timestamp: new Date().toISOString()
  });
});

// Core K2W routes (existing optimized routes)
router.use('/', k2wRoutes);

// Advanced features routes
router.use('/seo-external', externalSeoRoutes);
router.use('/analytics-advanced', advancedAnalyticsRoutes);
router.use('/ab-testing', abTestingRoutes);
router.use('/cost-optimization', costOptimizationRoutes);

export { router as k2wRouter };