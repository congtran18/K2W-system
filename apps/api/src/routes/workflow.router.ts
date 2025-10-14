/**
 * K2W Workflow Routes
 * Advanced AI-powered workflow automation endpoints
 */

import { Router, IRouter } from 'express';
import { k2wWorkflowController } from '../controllers/k2w-workflow.controller';

const router: IRouter = Router();

// Workflow Management Routes
router.post('/workflow/execute', k2wWorkflowController.executeWorkflow);
router.get('/workflow/:workflowId/status', k2wWorkflowController.getWorkflowStatus);
router.post('/workflow/:workflowId/cancel', k2wWorkflowController.cancelWorkflow);

// Advanced Content Generation Routes
router.post('/content/generate-advanced', k2wWorkflowController.generateAdvancedContent);

// Image Generation Routes
router.post('/images/generate', k2wWorkflowController.generateImages);
router.post('/images/batch-generate', k2wWorkflowController.batchGenerateImages);

// Translation Routes
router.post('/translate/content', k2wWorkflowController.translateContent);
router.get('/translate/languages', k2wWorkflowController.getSupportedLanguages);
router.get('/translate/usage', k2wWorkflowController.getTranslationUsage);

// Publishing Routes
router.post('/publish/content', k2wWorkflowController.publishContent);

// SEO Optimization Routes
router.post('/seo/optimize', k2wWorkflowController.optimizeForSEO);

// System Routes
router.get('/system/health', k2wWorkflowController.systemHealthCheck);
router.get('/system/capabilities', k2wWorkflowController.getSystemCapabilities);

export default router;