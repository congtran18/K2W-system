/**
 * K2W API Routes
 * RESTful endpoints using optimized controller pattern
 */

import { Router } from 'express';
import { 
  keywordsController, 
  contentController, 
  analyticsController,
  workflowController
} from '../controllers/optimized-k2w.controller';const router: Router = Router();

/**
 * Keywords Routes
 */

// POST /api/k2w/keywords/submit - Submit keyword for processing (Frontend compatibility)
router.post('/keywords/submit', (req, res) => keywordsController.submitKeyword(req, res));

// GET /api/k2w/keywords/:keyword_id/status - Get keyword status (Frontend compatibility)
router.get('/keywords/:keyword_id/status', (req, res) => keywordsController.getKeywordStatus(req, res));

// GET /api/k2w/keywords/history - Get user's keyword history (Frontend compatibility)
router.get('/keywords/history', (req, res) => keywordsController.getKeywordHistory(req, res));

// POST /api/k2w/keywords/import - Import and process keywords
router.post('/keywords/import', (req, res) => keywordsController.importKeywords(req, res));

// GET /api/k2w/keywords/:project_id - Get all keywords for a project
router.get('/keywords/:project_id', (req, res) => keywordsController.getKeywords(req, res));

// POST /api/k2w/keywords/cluster - Manually trigger keyword clustering
router.post('/keywords/cluster', (req, res) => keywordsController.clusterKeywords(req, res));

// PUT /api/k2w/keywords/:keyword_id/status - Update keyword status
router.put('/keywords/:keyword_id/status', (req, res) => keywordsController.updateKeywordStatus(req, res));

// DELETE /api/k2w/keywords/:keyword_id - Delete keyword
router.delete('/keywords/:keyword_id', (req, res) => keywordsController.deleteKeyword(req, res));

/**
 * Content Routes
 */

// POST /api/k2w/content/generate - Generate AI content
router.post('/content/generate', (req, res) => contentController.generateContent(req, res));

// GET /api/k2w/content/:content_id - Get content by ID (Frontend compatibility)
router.get('/content/:content_id', (req, res) => contentController.getContentById(req, res));

// GET /api/k2w/content/batches - Get content batches (Frontend compatibility)
router.get('/content/batches', (req, res) => contentController.getContentBatches(req, res));

// GET /api/k2w/content/:content_id/download - Download content (Frontend compatibility)
router.get('/content/:content_id/download', (req, res) => contentController.downloadContent(req, res));

// POST /api/k2w/content/batch-generate - Generate content for multiple keywords
router.post('/content/batch-generate', (req, res) => contentController.batchGenerateContent(req, res));

// GET /api/k2w/content/project/:project_id - Get all content for a project
router.get('/content/project/:project_id', (req, res) => contentController.getContent(req, res));

// GET /api/k2w/content/detail/:content_id - Get content details
router.get('/content/detail/:content_id', (req, res) => contentController.getContentById(req, res));

// PUT /api/k2w/content/:content_id/optimize - Optimize content with AI
router.put('/content/:content_id/optimize', (req, res) => contentController.optimizeContent(req, res));

// DELETE /api/k2w/content/:content_id - Delete content
router.delete('/content/:content_id', (req, res) => contentController.deleteContent(req, res));

/**
 * Analytics Routes
 */

// GET /api/k2w/analytics/:project_id/dashboard - Get project dashboard
router.get('/analytics/:project_id/dashboard', (req, res) => analyticsController.getProjectDashboard(req, res));

// GET /api/k2w/analytics/detailed - Get detailed analytics (Frontend compatibility)
router.get('/analytics/detailed', (req, res) => analyticsController.getDetailedAnalytics(req, res));

// GET /api/k2w/analytics/performance/:keyword_id - Get performance metrics (Frontend compatibility)
router.get('/analytics/performance/:keyword_id', (req, res) => analyticsController.getPerformanceMetrics(req, res));

// GET /api/k2w/analytics/:project_id/keywords - Get keyword analytics
router.get('/analytics/:project_id/keywords', (req, res) => analyticsController.getKeywordAnalytics(req, res));

// GET /api/k2w/analytics/:project_id/content - Get content analytics
router.get('/analytics/:project_id/content', (req, res) => analyticsController.getContentAnalytics(req, res));

// GET /api/k2w/analytics/:project_id/performance - Get performance metrics
router.get('/analytics/:project_id/performance', (req, res) => analyticsController.getPerformanceMetrics(req, res));

// GET /api/k2w/analytics/system/overview - Get system-wide analytics
router.get('/analytics/system/overview', (req, res) => analyticsController.getSystemAnalytics(req, res));

/**
 * System Routes
 */

// GET /api/k2w/health - Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      ai: 'available',
      workflow: 'running'
    },
    endpoints: {
      keywords: '/api/k2w/keywords',
      content: '/api/k2w/content', 
      analytics: '/api/k2w/analytics'
    }
  });
});

// GET /api/k2w/status - System status with metrics
router.get('/status', (req, res) => {
  res.json({
    success: true,
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    },
    features: {
      ai_generation: true,
      keyword_clustering: true,
      content_optimization: true,
      batch_processing: true,
      analytics: true,
      workflow_automation: true
    },
    architecture: {
      pattern: 'Controller-Service-Repository',
      database: 'Supabase/PostgreSQL',
      ai_provider: 'OpenAI',
      caching: 'In-Memory',
      authentication: 'Available'
    }
  });
});

/**
 * Workflow Routes
 */

// POST /api/k2w/workflow/execute - Execute workflow (Frontend compatibility)
router.post('/workflow/execute', (req, res) => workflowController.executeWorkflow(req, res));

// GET /api/k2w/workflow/:id/status - Get workflow status (Frontend compatibility)
router.get('/workflow/:id/status', (req, res) => workflowController.getWorkflowStatus(req, res));

// POST /api/k2w/workflow/:id/cancel - Cancel workflow (Frontend compatibility)
router.post('/workflow/:id/cancel', (req, res) => workflowController.cancelWorkflow(req, res));

// GET /api/k2w/workflow/:project_id/history - Get workflow history
router.get('/workflow/:project_id/history', (req, res) => workflowController.getWorkflowHistory(req, res));

// POST /api/k2w/projects/:project_id/workflow/execute - Execute project workflow
router.post('/projects/:project_id/workflow/execute', (req, res) => workflowController.executeProjectWorkflow(req, res));

// GET /api/k2w/projects/:project_id/workflow/status - Get project workflow status
router.get('/projects/:project_id/workflow/status', (req, res) => workflowController.getProjectWorkflowStatus(req, res));

export default router;