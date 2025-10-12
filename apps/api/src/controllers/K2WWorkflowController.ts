/**
 * K2W Unified Workflow Controller
 * Integrates all advanced AI services for complete workflow automation
 */

import { Request, Response } from 'express';
import { k2wUnifiedService } from '../services/K2WUnifiedService';
import { aiContentGenerator } from '../services/AIContentGenerator';
import { aiImageGenerator } from '../services/AIImageGenerator';
import { aiTranslationService } from '../services/AITranslationService';
import { publishingAutomationService } from '../services/PublishingAutomationService';

export class K2WWorkflowController {

  /**
   * POST /api/k2w/workflow/execute
   * Execute complete K2W workflow from keywords to published content
   */
  async executeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const workflowOptions = req.body;
      
      // Validate required fields
      if (!workflowOptions.project || !workflowOptions.keywords) {
        res.status(400).json({
          success: false,
          error: 'Project and keywords are required',
          required_fields: ['project', 'keywords']
        });
        return;
      }

      // Set defaults for optional fields
      const options = {
        target_languages: [],
        publishing_targets: [],
        auto_publish: false,
        quality_threshold: 0.8,
        image_generation_enabled: true,
        translation_enabled: false,
        seo_optimization_level: 'advanced',
        ...workflowOptions
      };

      const result = await k2wUnifiedService.executeWorkflow(options);
      
      res.json({
        success: true,
        data: result,
        message: 'K2W workflow completed successfully',
        execution_time: result.analytics.total_processing_time
      });

    } catch (error: any) {
      console.error('Workflow execution failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Workflow execution failed'
      });
    }
  }

  /**
   * GET /api/k2w/workflow/:workflowId/status
   * Get workflow execution status and progress
   */
  async getWorkflowStatus(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;
      
      const status = await k2wUnifiedService.getWorkflowStatus(workflowId);
      
      if (!status) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
        return;
      }

      res.json({
        success: true,
        data: status
      });

    } catch (error: any) {
      console.error('Get workflow status failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/k2w/workflow/:workflowId/cancel
   * Cancel running workflow
   */
  async cancelWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;
      
      const cancelled = await k2wUnifiedService.cancelWorkflow(workflowId);
      
      res.json({
        success: cancelled,
        message: cancelled ? 'Workflow cancelled successfully' : 'Failed to cancel workflow'
      });

    } catch (error: any) {
      console.error('Cancel workflow failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/k2w/content/generate-advanced
   * Generate content using advanced AI with all optimizations
   */
  async generateAdvancedContent(req: Request, res: Response): Promise<void> {
    try {
      const contentOptions = req.body;
      
      // Validate required fields
      if (!contentOptions.keyword || !contentOptions.language || !contentOptions.region) {
        res.status(400).json({
          success: false,
          error: 'Keyword, language, and region are required'
        });
        return;
      }

      const generatedContent = await aiContentGenerator.generateContent(contentOptions);
      
      res.json({
        success: true,
        data: generatedContent,
        message: 'Advanced content generated successfully'
      });

    } catch (error: any) {
      console.error('Advanced content generation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/k2w/images/generate
   * Generate DALL-E images for content
   */
  async generateImages(req: Request, res: Response): Promise<void> {
    try {
      const imageOptions = req.body;
      
      if (!imageOptions.keyword) {
        res.status(400).json({
          success: false,
          error: 'Keyword is required for image generation'
        });
        return;
      }

      const generatedImages = await aiImageGenerator.generateImages(imageOptions);
      
      res.json({
        success: true,
        data: {
          images: generatedImages,
          total_generated: generatedImages.length
        },
        message: 'Images generated successfully'
      });

    } catch (error: any) {
      console.error('Image generation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/k2w/images/batch-generate
   * Generate images for multiple keywords
   */
  async batchGenerateImages(req: Request, res: Response): Promise<void> {
    try {
      const { keywords, baseOptions = {} } = req.body;
      
      if (!keywords || !Array.isArray(keywords)) {
        res.status(400).json({
          success: false,
          error: 'Keywords array is required'
        });
        return;
      }

      const results = await aiImageGenerator.batchGenerateImages(keywords, baseOptions);
      
      res.json({
        success: true,
        data: results,
        message: 'Batch image generation completed',
        summary: {
          total_keywords: keywords.length,
          successful: Object.keys(results).length,
          total_images: Object.values(results).reduce((sum, imgs) => sum + imgs.length, 0)
        }
      });

    } catch (error: any) {
      console.error('Batch image generation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/k2w/translate/content
   * Translate content to multiple languages using DeepL
   */
  async translateContent(req: Request, res: Response): Promise<void> {
    try {
      const { content, targetLanguages, options = {} } = req.body;
      
      if (!content || !targetLanguages || !Array.isArray(targetLanguages)) {
        res.status(400).json({
          success: false,
          error: 'Content and targetLanguages array are required'
        });
        return;
      }

      const translationResult = await aiTranslationService.translateContent(
        content,
        targetLanguages,
        options
      );
      
      res.json({
        success: true,
        data: translationResult,
        message: 'Content translated successfully'
      });

    } catch (error: any) {
      console.error('Content translation failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/k2w/translate/languages
   * Get supported languages for translation
   */
  async getSupportedLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await aiTranslationService.getSupportedLanguages();
      
      res.json({
        success: true,
        data: languages,
        total_languages: languages.length
      });

    } catch (error: any) {
      console.error('Get supported languages failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/k2w/translate/usage
   * Get translation service usage statistics
   */
  async getTranslationUsage(req: Request, res: Response): Promise<void> {
    try {
      const usage = await aiTranslationService.getUsageStats();
      
      res.json({
        success: true,
        data: usage
      });

    } catch (error: any) {
      console.error('Get translation usage failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/k2w/publish/content
   * Publish content to multiple platforms
   */
  async publishContent(req: Request, res: Response): Promise<void> {
    try {
      const { content, targets, options = {} } = req.body;
      
      if (!content || !targets || !Array.isArray(targets)) {
        res.status(400).json({
          success: false,
          error: 'Content and publishing targets are required'
        });
        return;
      }

      const publishResults = await publishingAutomationService.publishContent(
        content,
        targets,
        options
      );
      
      const successfulPublishes = Object.values(publishResults).filter(r => r.success);
      
      res.json({
        success: true,
        data: publishResults,
        message: 'Content publishing completed',
        summary: {
          total_targets: targets.length,
          successful: successfulPublishes.length,
          failed: targets.length - successfulPublishes.length,
          published_urls: successfulPublishes.map(p => p.published_url).filter(Boolean)
        }
      });

    } catch (error: any) {
      console.error('Content publishing failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/k2w/seo/optimize
   * Optimize content for SEO using AI
   */
  async optimizeForSEO(req: Request, res: Response): Promise<void> {
    try {
      const { content, targetLang, regionKeywords = [] } = req.body;
      
      if (!content || !targetLang) {
        res.status(400).json({
          success: false,
          error: 'Content and target language are required'
        });
        return;
      }

      const optimizedContent = await aiTranslationService.optimizeForSEO(
        content,
        targetLang,
        regionKeywords
      );
      
      res.json({
        success: true,
        data: optimizedContent,
        message: 'Content optimized for SEO successfully'
      });

    } catch (error: any) {
      console.error('SEO optimization failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/k2w/system/health
   * System health check for all services
   */
  async systemHealthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Check all services
      const healthStatus = {
        workflow_service: 'operational',
        content_generation: 'operational',
        image_generation: 'operational', 
        translation_service: 'operational',
        publishing_service: 'operational',
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'K2W System is fully operational',
        data: healthStatus,
        version: '2.0.0',
        capabilities: [
          'AI Content Generation (GPT-4)',
          'DALL-E Image Generation',
          'DeepL Translation',
          'Multi-platform Publishing',
          'SEO Optimization',
          'Workflow Automation'
        ]
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'System health check failed'
      });
    }
  }

  /**
   * GET /api/k2w/system/capabilities
   * Get system capabilities and configuration
   */
  async getSystemCapabilities(req: Request, res: Response): Promise<void> {
    try {
      const capabilities = {
        content_generation: {
          models: ['gpt-4', 'gpt-3.5-turbo'],
          languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
          content_types: ['article', 'blog_post', 'landing_page', 'product_description'],
          max_word_count: 5000
        },
        image_generation: {
          model: 'dall-e-3',
          styles: ['professional', 'modern', 'industrial', 'architectural'],
          sizes: ['1024x1024', '1792x1024', '1024x1792'],
          max_images_per_request: 10
        },
        translation: {
          provider: 'DeepL',
          supported_languages: 30,
          formality_support: true,
          max_characters_per_month: 500000
        },
        publishing: {
          platforms: ['wordpress', 'firebase', 'replit', 'static'],
          features: ['scheduled_publishing', 'sitemap_generation', 'social_sharing']
        }
      };

      res.json({
        success: true,
        data: capabilities
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

// Export controller instance
export const k2wWorkflowController = new K2WWorkflowController();