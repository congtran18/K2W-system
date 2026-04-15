/**
 * Optimized K2W Controllers
 * Clean controller layer using service pattern
 */

import { Request, Response } from 'express';
import { keywordService } from '../services/keyword.service';
import { contentService } from '../services/content.service';
import { analyticsService } from '../services/analytics.service';
import { webhookNotifierService } from '../services/webhook-notifier.service';
import { contentRepository } from '../repositories/k2w-optimized.repository';

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
        data: {
          keywords: result.keywords.map(kw => ({
            id: kw.id,
            keyword: kw.keyword,
            region: kw.region,
            language: kw.language,
            status: this.mapStatusToFrontend(kw.status),
            createdAt: kw.created_at,
            progress: this.getProgressFromStatus(kw.status)
          })),
          total: result.total
        }
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

  /**
   * POST /api/k2w/keywords/submit
   * Submit keyword for processing (Frontend compatibility)
   */
  async submitKeyword(req: Request, res: Response) {
    try {
      const { 
        keyword, 
        region = 'US', 
        language = 'en', 
        project_id 
      } = req.body;

      // Basic validation
      if (!keyword) {
        res.status(400).json({
          success: false,
          error: 'Keyword is required'
        });
        return;
      }

      // Submit single keyword (wrapper around importKeywords)
      const result = await keywordService.importKeywords([keyword], {
        projectId: project_id || 'default',
        language,
        region,
        source: 'manual',
        autoClustering: false
      });

      res.json({
        success: true,
        data: {
          keywordId: result.keywords[0]?.id || `keyword_${Date.now()}`,
          keyword,
          status: 'processing',
          estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }
      });

    } catch (error) {
      console.error('Submit keyword failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit keyword'
      });
    }
  }

  /**
   * Helper method to get progress percentage from keyword status
   */
  private getProgressFromStatus(status: string): number {
    const progressMap: Record<string, number> = {
      'pending': 0,
      'clustering': 10,
      'clustered': 20,
      'queued': 25,
      'generating_text': 50,
      'generating_images': 70,
      'seo_review': 85,
      'ready_to_publish': 95,
      'published': 100,
      'failed': 0,
      'archived': 100
    };
    
    return progressMap[status] || 0;
  }

  private mapStatusToFrontend(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'ready_to_publish' || s === 'published' || s === 'completed') {
      return 'COMPLETED';
    }
    if (s === 'failed') {
      return 'FAILED';
    }
    if (s === 'generating_text' || s === 'generating_images' || s === 'seo_review' || s === 'analyzing_seo' || s === 'checking_grammar' || s === 'checking_plagiarism') {
      return 'GENERATING_TEXT';
    }
    return 'QUEUED';
  }

  /**
   * GET /api/k2w/keywords/:keyword_id/status
   * Get keyword status and results (Frontend compatibility)
   */
  async getKeywordStatus(req: Request, res: Response) {
    try {
      const { keyword_id } = req.params;

      const keyword = await keywordService.getKeywordById(keyword_id);

      if (!keyword) {
        res.status(404).json({
          success: false,
          error: 'Keyword not found'
        });
        return;
      }

      // Fetch real content from content table if keyword is completed
      const isCompleted = ['published', 'ready_to_publish', 'completed'].includes(keyword.status);
      let results = null;
      if (isCompleted) {
        const contentRecord = await contentRepository.findByKeywordId(keyword.id);
        if (contentRecord) {
          results = {
            content: contentRecord.body || contentRecord.body_html || null,
            seo_score: contentRecord.seo_score || null,
            word_count: contentRecord.word_count || null,
            readability_score: contentRecord.readability_score || null,
            images: contentRecord.images || []
          };
        }
      }

      res.json({
        success: true,
        data: {
          id: keyword.id,
          keyword: keyword.keyword,
          region: keyword.region,
          language: keyword.language,
          status: this.mapStatusToFrontend(keyword.status),
          createdAt: keyword.created_at,
          progress: this.getProgressFromStatus(keyword.status),
          results
        }
      });

    } catch (error) {
      console.error('Get keyword status failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get keyword status'
      });
    }
  }

  /**
   * GET /api/k2w/keywords/history
   * Get user's keyword history (Frontend compatibility)
   */
  async getKeywordHistory(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        project_id 
      } = req.query;

      const result = await keywordService.getKeywordHistory({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        projectId: project_id as string
      });

      // Fetch real content for completed keywords in parallel
      const keywords = await Promise.all(
        result.keywords.map(async keyword => {
          const isCompleted = ['published', 'ready_to_publish', 'completed'].includes(keyword.status);
          let results: { content: string | null; seo_score: number | null; word_count: number | null; readability_score: number | null; images: string[] } | undefined = undefined;

          if (isCompleted) {
            const contentRecord = await contentRepository.findByKeywordId(keyword.id);
            if (contentRecord) {
              const images = Array.isArray(contentRecord.images) ? contentRecord.images : [];
              // Clean Pollinations URLs: strip ALL query params (free tier restriction)
              const cleanImages = images.map((url: string) => {
                try {
                  const u = new URL(url);
                  if (u.hostname.includes('pollinations.ai')) {
                    // Pollinations free tier: no query params allowed → HTTP 402
                    return u.origin + u.pathname;
                  }
                  return url;
                } catch { return url; }
              });
              console.log(`[KeywordHistory] Keyword "${keyword.keyword}" (${keyword.id}): content found, images=${cleanImages.length} [${cleanImages.map((i: string) => (i || '').substring(0, 50)).join(', ')}]`);
              results = {
                content: contentRecord.body || contentRecord.body_html || null,
                seo_score: contentRecord.seo_score || null,
                word_count: contentRecord.word_count || null,
                readability_score: contentRecord.readability_score || null,
                images: cleanImages
              };
            } else {
              console.log(`[KeywordHistory] Keyword "${keyword.keyword}" (${keyword.id}): status=${keyword.status} but NO content record found`);
            }
          } else {
            console.log(`[KeywordHistory] Keyword "${keyword.keyword}" (${keyword.id}): status=${keyword.status} (not completed, skip content lookup)`);
          }

          return {
            id: keyword.id,
            keyword: keyword.keyword,
            region: keyword.region,
            language: keyword.language,
            status: this.mapStatusToFrontend(keyword.status),
            createdAt: keyword.created_at,
            progress: this.getProgressFromStatus(keyword.status),
            results
          };
        })
      );

      res.json({
        success: true,
        data: {
          keywords,
          total: result.total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total_pages: Math.ceil(result.total / parseInt(limit as string))
        }
      });

    } catch (error) {
      console.error('Get keyword history failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get keyword history'
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

  /**
   * GET /api/k2w/content/pending-review
   * Get content pending editorial review
   */
  async getPendingReviewContent(req: Request, res: Response) {
    try {
      const { project_id = 'default' } = req.query;
      const content = await contentService.getPendingReviewContent(project_id as string);
      
      res.json({
        success: true,
        data: content
      });
    } catch (error) {
      console.error('Get pending review content failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get pending review content'
      });
    }
  }

  /**
   * POST /api/k2w/content/:content_id/approve
   * Approve content and change status to ready_to_publish
   */
  async approveContent(req: Request, res: Response) {
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

      const updated = await contentService.updateContentStatus(content_id, 'ready_to_publish');
      
      // Trigger Webhook Notification
      await webhookNotifierService.notifySlack('approved', updated);

      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Approve content failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve content'
      });
    }
  }

  /**
   * POST /api/k2w/content/:content_id/reject
   * Reject content and set status back to draft
   */
  async rejectContent(req: Request, res: Response) {
    try {
      const { content_id } = req.params;
      const { feedback } = req.body;
      
      const content = await contentService.getContentById(content_id);
      if (!content) {
        res.status(404).json({
          success: false,
          error: 'Content not found'
        });
        return;
      }

      const updated = await contentService.updateContentStatus(content_id, 'draft');
      
      // Trigger Webhook Notification with feedback
      await webhookNotifierService.notifySlack('rejected', updated, { feedback });

      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Reject content failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reject content'
      });
    }
  }

  /**
   * PUT /api/k2w/content/:content_id/body
   * Update content body HTML directly
   */
  async updateContentBody(req: Request, res: Response) {
    try {
      const { content_id } = req.params;
      const { body_html, title } = req.body;
      
      if (!body_html) {
        res.status(400).json({
          success: false,
          error: 'body_html is required'
        });
        return;
      }

      const updated = await contentService.updateContentBody(content_id, body_html, title);

      res.json({
        success: true,
        data: updated
      });
    } catch (error) {
      console.error('Update content body failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update content body'
      });
    }
  }

  /**
   * GET /api/k2w/content/batches
   * Get content batches (Frontend compatibility)
   */
  async getContentBatches(req: Request, res: Response) {
    try {
      const { project_id, status } = req.query;

      // Get batches from content service
      const batches = await contentService.getContentBatches({
        projectId: project_id as string,
        status: status as string
      });

      res.json({
        success: true,
        data: {
          batches: batches.map(batch => ({
            id: batch.id,
            project_id: batch.project_id,
            status: batch.status,
            total_keywords: batch.total_keywords || 0,
            completed_keywords: batch.completed_keywords || 0,
            created_at: batch.created_at,
            keywords: batch.keywords || []
          }))
        }
      });

    } catch (error) {
      console.error('Get content batches failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get content batches'
      });
    }
  }

  /**
   * GET /api/k2w/content/:content_id/download
   * Download content in various formats (Frontend compatibility)
   */
  async downloadContent(req: Request, res: Response) {
    try {
      const { content_id } = req.params;
      const { format = 'txt' } = req.query;

      const content = await contentService.getContentById(content_id);

      if (!content) {
        res.status(404).json({
          success: false,
          error: 'Content not found'
        });
        return;
      }

      // Generate download URL based on format
      const downloadUrl = await contentService.generateDownloadUrl(content_id, format as string);

      res.json({
        success: true,
        data: {
          download_url: downloadUrl,
          content_id,
          format,
          filename: `content_${content_id}.${format}`,
          size_estimate: content.body_html?.length || 0
        }
      });

    } catch (error) {
      console.error('Download content failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate download URL'
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
      const { project_id, keyword_id } = req.params;

      let metrics;
      if (keyword_id) {
        // Frontend compatibility: /analytics/performance/:keyword_id
        metrics = await analyticsService.getKeywordPerformanceMetrics(keyword_id);
      } else if (project_id) {
        // Project-wide metrics: /analytics/:project_id/performance
        metrics = await analyticsService.getPerformanceMetrics(project_id);
      } else {
        res.status(400).json({
          success: false,
          error: 'Either keyword_id or project_id is required'
        });
        return;
      }

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
   * GET /api/k2w/analytics/detailed
   * Get detailed analytics - Frontend compatibility endpoint
   */
  async getDetailedAnalytics(req: Request, res: Response) {
    try {
      const { projectId, startDate, endDate, metrics } = req.query;
      
      if (!projectId) {
        res.status(400).json({ 
          success: false, 
          error: 'Project ID is required' 
        });
        return;
      }
      
      const analytics = await analyticsService.getDetailedAnalytics(
        projectId as string,
        startDate as string,
        endDate as string,
        metrics as string
      );
      
      res.json({ success: true, data: analytics });
    } catch (error: any) {
      console.error('Get detailed analytics failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get detailed analytics'
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

/**
 * Workflow Controller
 * Handles workflow execution and management
 */
export class WorkflowController {

  /**
   * POST /api/k2w/workflow/execute
   * Execute workflow - Frontend compatibility endpoint
   */
  async executeWorkflow(req: Request, res: Response) {
    try {
      const { projectId, workflowType, config } = req.body;
      
      if (!projectId || !workflowType) {
        res.status(400).json({
          success: false,
          error: 'Project ID and workflow type are required'
        });
        return;
      }

      // Mock workflow execution
      const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate workflow execution
      const workflow = {
        id: workflowId,
        projectId,
        type: workflowType,
        status: 'running',
        startedAt: new Date().toISOString(),
        progress: 0,
        steps: [
          { name: 'Initialize', status: 'completed', progress: 100 },
          { name: 'Process Keywords', status: 'running', progress: 30 },
          { name: 'Generate Content', status: 'pending', progress: 0 },
          { name: 'Finalize', status: 'pending', progress: 0 }
        ]
      };

      res.json({ success: true, data: workflow });
    } catch (error: any) {
      console.error('Execute workflow failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute workflow'
      });
    }
  }

  /**
   * GET /api/k2w/workflow/:id/status
   * Get workflow status - Frontend compatibility endpoint
   */
  async getWorkflowStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock workflow status
      const status = {
        id,
        status: 'running',
        progress: 65,
        currentStep: 'Generate Content',
        startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        estimatedCompletion: new Date(Date.now() + 180000).toISOString(), // 3 minutes from now
        steps: [
          { name: 'Initialize', status: 'completed', progress: 100 },
          { name: 'Process Keywords', status: 'completed', progress: 100 },
          { name: 'Generate Content', status: 'running', progress: 65 },
          { name: 'Finalize', status: 'pending', progress: 0 }
        ],
        results: {
          keywordsProcessed: 25,
          contentGenerated: 12,
          errors: 0
        }
      };

      res.json({ success: true, data: status });
    } catch (error: any) {
      console.error('Get workflow status failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workflow status'
      });
    }
  }

  /**
   * POST /api/k2w/workflow/:id/cancel
   * Cancel workflow - Frontend compatibility endpoint
   */
  async cancelWorkflow(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Mock workflow cancellation
      const result = {
        id,
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        message: 'Workflow cancelled successfully'
      };

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Cancel workflow failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel workflow'
      });
    }
  }

  /**
   * GET /api/k2w/workflow/:project_id/history
   * Get workflow history for project
   */
  async getWorkflowHistory(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Mock workflow history
      const workflows = Array.from({ length: limit }, (_, i) => ({
        id: `wf_${Date.now() - i * 100000}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: project_id,
        type: ['keyword-analysis', 'content-generation', 'full-pipeline'][i % 3],
        status: ['completed', 'failed', 'cancelled'][i % 3],
        startedAt: new Date(Date.now() - i * 86400000).toISOString(), // i days ago
        completedAt: new Date(Date.now() - i * 86400000 + 3600000).toISOString(), // 1 hour later
        duration: '1h 5m',
        results: {
          keywordsProcessed: Math.floor(Math.random() * 50) + 10,
          contentGenerated: Math.floor(Math.random() * 25) + 5,
          errors: Math.floor(Math.random() * 3)
        }
      }));

      res.json({
        success: true,
        data: {
          workflows,
          pagination: {
            page,
            limit,
            total: 50,
            pages: Math.ceil(50 / limit)
          }
        }
      });
    } catch (error: any) {
      console.error('Get workflow history failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get workflow history'
      });
    }
  }

  /**
   * POST /api/k2w/projects/:project_id/workflow/execute
   * Execute project workflow
   */
  async executeProjectWorkflow(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      const { workflowType, config } = req.body;
      
      // Reuse the generic workflow execution with project context
      req.body.projectId = project_id;
      return this.executeWorkflow(req, res);
    } catch (error: any) {
      console.error('Execute project workflow failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute project workflow'
      });
    }
  }

  /**
   * GET /api/k2w/projects/:project_id/workflow/status
   * Get project workflow status
   */
  async getProjectWorkflowStatus(req: Request, res: Response) {
    try {
      const { project_id } = req.params;
      
      // Mock current workflow status for project
      const status = {
        projectId: project_id,
        activeWorkflows: 1,
        lastWorkflow: {
          id: `wf_${Date.now()}_active`,
          status: 'running',
          progress: 75,
          currentStep: 'Finalize',
          startedAt: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
        },
        recentWorkflows: Array.from({ length: 3 }, (_, i) => ({
          id: `wf_${Date.now() - i * 100000}_recent`,
          type: ['keyword-analysis', 'content-generation', 'full-pipeline'][i],
          status: 'completed',
          completedAt: new Date(Date.now() - i * 86400000).toISOString()
        }))
      };

      res.json({ success: true, data: status });
    } catch (error: any) {
      console.error('Get project workflow status failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get project workflow status'
      });
    }
  }
}

// Export controller instances
export const keywordsController = new KeywordsController();
export const contentController = new ContentController();
export const analyticsController = new AnalyticsController();
export const workflowController = new WorkflowController();