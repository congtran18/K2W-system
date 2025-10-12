/**
 * Optimized K2W Controllers
 * Clean controller layer using service pattern
 */

import { Request, Response } from 'express';
import { keywordService } from '../services/KeywordService';
import { contentService } from '../services/ContentService';
import { analyticsService } from '../services/AnalyticsService';

/**
 * Keywords Controller - Handles keyword management operations
 */
export class KeywordsController {

  /**
   * POST /api/k2w/keywords/import
   * Import and process keywords for a project
   */
  async importKeywords(req: Request, res: Response) {
    try {
      const { 
        keywords, 
        project_id, 
        language = 'en', 
        region = 'US', 
        source = 'manual',
        auto_clustering = true
      } = req.body;

      // Basic validation
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Keywords array is required and cannot be empty'
        });
        return;
      }

      if (!project_id) {
        res.status(400).json({
          success: false,
          error: 'project_id is required'
        });
        return;
      }

      // Use service to handle business logic
      const result = await keywordService.importKeywords(keywords, {
        projectId: project_id,
        language,
        region,
        source,
        autoClustering: auto_clustering
      });

      res.json({
        success: true,
        data: {
          import_id: `import_${Date.now()}`,
          imported: result.imported,
          duplicates: result.duplicates,
          invalid: result.invalid,
          clustered: result.clustered,
          keywords: result.keywords.slice(0, 10) // Return first 10 for response size
        }
      });

    } catch (error) {
      console.error('Keywords import failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to import keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/k2w/keywords/:project_id
   * Get keywords with pagination and filters
   */
  async getKeywords(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      const { 
        status, 
        cluster_id, 
        search_intent, 
        page = 1, 
        limit = 20 
      } = req.query;

      if (!project_id) {
        res.status(400).json({
          success: false,
          error: 'project_id is required'
        });
        return;
      }

      const filters = {
        ...(status && { status: status as string }),
        ...(cluster_id && { cluster_id: cluster_id as string }),
        ...(search_intent && { search_intent: search_intent as string })
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await keywordService.getKeywords(project_id, pagination, filters);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get keywords failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get keywords'
      });
    }
  }

  /**
   * POST /api/k2w/keywords/cluster
   * Cluster keywords using AI
   */
  async clusterKeywords(req: Request, res: Response) {
    try {
      const { 
        keyword_ids, 
        clustering_method = 'semantic', 
        max_clusters = 10,
        min_cluster_size = 1
      } = req.body;

      if (!keyword_ids || !Array.isArray(keyword_ids)) {
        res.status(400).json({
          success: false,
          error: 'keyword_ids array is required'
        });
        return;
      }

      const result = await keywordService.clusterKeywords(keyword_ids, {
        method: clustering_method,
        maxClusters: max_clusters,
        minClusterSize: min_cluster_size
      });

      res.json({
        success: true,
        data: {
          clustering_id: `cluster_${Date.now()}`,
          clusters_created: result.clustersCreated,
          keywords_clustered: result.keywordsClustered,
          unclustered: result.unclustered,
          clusters: result.clusters
        }
      });

    } catch (error) {
      console.error('Keyword clustering failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cluster keywords',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PUT /api/k2w/keywords/:keyword_id/status
   * Update keyword status
   */
  async updateKeywordStatus(req: Request, res: Response) {
    try {
      const { keyword_id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'status is required'
        });
        return;
      }

      const keyword = await keywordService.updateKeywordStatus(keyword_id, status);

      res.json({
        success: true,
        data: keyword
      });

    } catch (error) {
      console.error('Update keyword status failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update keyword status'
      });
    }
  }

  /**
   * DELETE /api/k2w/keywords/:keyword_id
   * Delete keyword
   */
  async deleteKeyword(req: Request, res: Response) {
    try {
      const { keyword_id } = req.params;

      const success = await keywordService.deleteKeyword(keyword_id);

      if (success) {
        res.json({
          success: true,
          message: 'Keyword deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Keyword not found'
        });
      }

    } catch (error) {
      console.error('Delete keyword failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete keyword'
      });
    }
  }
}

/**
 * Content Controller - Handles content generation and management
 */
export class ContentController {

  /**
   * POST /api/k2w/content/generate
   * Generate AI content for keywords
   */
  async generateContent(req: Request, res: Response) {
    try {
      const {
        keyword_id,
        content_type = 'article',
        word_count = 1500,
        language = 'en',
        tone = 'professional',
        include_images = true,
        include_schema = true,
        auto_publish = false
      } = req.body;

      if (!keyword_id) {
        res.status(400).json({
          success: false,
          error: 'keyword_id is required'
        });
        return;
      }

      const result = await contentService.generateContent(keyword_id, {
        contentType: content_type,
        wordCount: word_count,
        language,
        tone,
        includeImages: include_images,
        includeSchema: include_schema,
        autoPublish: auto_publish
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Content generation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/k2w/content/:project_id
   * Get content with pagination and filters
   */
  async getContent(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      const { 
        status, 
        content_type, 
        keyword_id,
        page = 1, 
        limit = 20 
      } = req.query;

      if (!project_id) {
        res.status(400).json({
          success: false,
          error: 'project_id is required'
        });
        return;
      }

      const filters = {
        ...(status && { status: status as string }),
        ...(content_type && { content_type: content_type as string }),
        ...(keyword_id && { keyword_id: keyword_id as string })
      };

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await contentService.getContent(project_id, pagination, filters);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Get content failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get content'
      });
    }
  }

  /**
   * GET /api/k2w/content/detail/:content_id
   * Get content details by ID
   */
  async getContentById(req: Request, res: Response) {
    try {
      const { content_id } = req.params;

      const content = await contentService.getContentById(content_id);

      if (!content) {
        res.status(404).json({
          success: false,
          error: 'Content not found'
        });
        return;
      }

      res.json({
        success: true,
        data: content
      });

    } catch (error) {
      console.error('Get content by ID failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get content'
      });
    }
  }

  /**
   * PUT /api/k2w/content/:content_id/optimize
   * Optimize content using AI
   */
  async optimizeContent(req: Request, res: Response) {
    try {
      const { content_id } = req.params;
      const { 
        goals = ['seo', 'readability'], 
        target_keyword,
        focus_areas = []
      } = req.body;

      const result = await contentService.optimizeContent(content_id, {
        goals,
        targetKeyword: target_keyword,
        focusAreas: focus_areas
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Content optimization failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to optimize content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/k2w/content/batch-generate
   * Generate content for multiple keywords
   */
  async batchGenerateContent(req: Request, res: Response) {
    try {
      const { keyword_ids, options = {} } = req.body;

      if (!keyword_ids || !Array.isArray(keyword_ids)) {
        res.status(400).json({
          success: false,
          error: 'keyword_ids array is required'
        });
        return;
      }

      const defaultOptions = {
        contentType: 'article',
        wordCount: 1500,
        language: 'en',
        tone: 'professional',
        includeImages: true,
        includeSchema: true,
        autoPublish: false
      };

      const results = await contentService.batchGenerateContent(
        keyword_ids, 
        { ...defaultOptions, ...options }
      );

      res.json({
        success: true,
        data: {
          batch_id: `batch_${Date.now()}`,
          total_requested: keyword_ids.length,
          successful: results.length,
          failed: keyword_ids.length - results.length,
          results
        }
      });

    } catch (error) {
      console.error('Batch content generation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate batch content'
      });
    }
  }

  /**
   * DELETE /api/k2w/content/:content_id
   * Delete content
   */
  async deleteContent(req: Request, res: Response) {
    try {
      const { content_id } = req.params;

      const success = await contentService.deleteContent(content_id);

      if (success) {
        res.json({
          success: true,
          message: 'Content deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Content not found'
        });
      }

    } catch (error) {
      console.error('Delete content failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete content'
      });
    }
  }
}

/**
 * Analytics Controller - Handles analytics and reporting
 */
export class AnalyticsController {

  /**
   * GET /api/k2w/analytics/:project_id/dashboard
   * Get comprehensive project dashboard
   */
  async getProjectDashboard(req: Request, res: Response) {
    try {
      const { project_id } = req.params;

      if (!project_id) {
        res.status(400).json({
          success: false,
          error: 'project_id is required'
        });
        return;
      }

      const dashboard = await analyticsService.getProjectDashboard(project_id);

      res.json({
        success: true,
        data: dashboard
      });

    } catch (error) {
      console.error('Get dashboard failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/k2w/analytics/:project_id/keywords
   * Get keyword analytics
   */
  async getKeywordAnalytics(req: Request, res: Response) {
    try {
      const { project_id } = req.params;

      const analytics = await analyticsService.getKeywordAnalytics(project_id);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get keyword analytics failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get keyword analytics'
      });
    }
  }

  /**
   * GET /api/k2w/analytics/:project_id/content
   * Get content analytics
   */
  async getContentAnalytics(req: Request, res: Response) {
    try {
      const { project_id } = req.params;

      const analytics = await analyticsService.getContentAnalytics(project_id);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get content analytics failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get content analytics'
      });
    }
  }

  /**
   * GET /api/k2w/analytics/:project_id/performance
   * Get performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const { project_id } = req.params;

      const metrics = await analyticsService.getPerformanceMetrics(project_id);

      res.json({
        success: true,
        data: metrics
      });

    } catch (error) {
      console.error('Get performance metrics failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get performance metrics'
      });
    }
  }

  /**
   * GET /api/k2w/analytics/system/overview
   * Get system-wide analytics
   */
  async getSystemAnalytics(req: Request, res: Response) {
    try {
      const analytics = await analyticsService.getSystemAnalytics();

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      console.error('Get system analytics failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system analytics'
      });
    }
  }
}

// Export controller instances
export const keywordsController = new KeywordsController();
export const contentController = new ContentController();
export const analyticsController = new AnalyticsController();