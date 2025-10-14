/**
 * A/B Testing API Routes
 * Provides endpoints for creating, managing, and analyzing A/B tests
 */

import { Router } from 'express';
import { AbTestingController } from '../controllers/abTestingController';

const router: Router = Router();
const abTestingController = new AbTestingController();

/**
 * POST /api/ab-testing/tests
 * Create a new A/B test
 */
router.post('/tests', abTestingController.createTest);

/**
 * POST /api/ab-testing/tests/:testId/start
 * Start an A/B test
 */
router.post('/tests/:testId/start', abTestingController.startTest);

/**
 * POST /api/ab-testing/tests/:testId/stop
 * Stop an A/B test
 */
router.post('/tests/:testId/stop', abTestingController.stopTest);

/**
 * GET /api/ab-testing/tests/:testId/status
 * Get test status and interim results
 */
router.get('/tests/:testId/status', abTestingController.getTestStatus);

/**
 * GET /api/ab-testing/tests/:testId/results
 * Get test results and analysis
 */
router.get('/tests/:testId/results', abTestingController.getTestResults);

/**
 * POST /api/ab-testing/variants/generate
 * Generate content variants using AI
 */
router.post('/variants/generate', abTestingController.generateVariants);

/**
 * POST /api/ab-testing/optimize/auto
 * Auto-optimize content using A/B testing
 */
router.post('/optimize/auto', abTestingController.autoOptimize);

/**
 * POST /api/ab-testing/optimize/batch
 * Batch optimize multiple content pieces
 */
router.post('/optimize/batch', abTestingController.batchOptimize);

export default router;