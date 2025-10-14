/**
 * External SEO API Routes
 * Provides endpoints for external SEO analysis and monitoring
 */

import { Router } from 'express';
import { ExternalSeoController } from '../controllers/externalSeoController';

const router: Router = Router();
const externalSeoController = new ExternalSeoController();

/**
 * POST /api/external-seo/keyword-data
 * Get comprehensive keyword data from multiple sources
 */
router.post('/keyword-data', externalSeoController.getKeywordData);

/**
 * POST /api/external-seo/keyword-suggestions
 * Get keyword suggestions for a topic
 */
router.post('/keyword-suggestions', externalSeoController.getKeywordSuggestions);

/**
 * POST /api/external-seo/competitor-analysis
 * Analyze competitors for given keywords
 */
router.post('/competitor-analysis', externalSeoController.analyzeCompetitors);

/**
 * POST /api/external-seo/google-trends
 * Get Google Trends data
 */
router.post('/google-trends', externalSeoController.getGoogleTrends);

/**
 * POST /api/external-seo/combine-metrics
 * Combine metrics from multiple sources
 */
router.post('/combine-metrics', externalSeoController.combineKeywordMetrics);

/**
 * POST /api/external-seo/batch-research
 * Batch keyword research with rate limiting
 */
router.post('/batch-research', externalSeoController.batchKeywordResearch);

/**
 * GET /api/external-seo/sources
 * Get available SEO data sources
 */
router.get('/sources', externalSeoController.getAvailableSources);

export default router;