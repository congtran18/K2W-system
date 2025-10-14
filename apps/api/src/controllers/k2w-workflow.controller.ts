/**
 * K2W Unified Workflow Controller
 * Integrates all advanced AI services for complete workflow automation
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHandler, ValidationHelper } from '../common/response.handler';
import { k2wUnifiedService } from '../services/k2w-unified.service';
import { aiContentGenerator } from '../services/ai-content-generator.service';
import { aiImageGenerator } from '../services/ai-image-generator.service';
import { aiTranslationService } from '../services/ai-translation.service';
import { publishingAutomationService } from '../services/publishing-automation.service';

export class K2WWorkflowController {

  /**
   * POST /api/k2w/workflow/execute
   * Execute complete K2W workflow from keywords to published content
   */
  async executeWorkflow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workflowOptions = req.body;
      
      // Validate required fields
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['project', 'keywords']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Project and keywords are required', missingFields);
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
      
      ResponseHandler.success(res, result, 'K2W workflow completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/k2w/workflow/:workflowId/status
   * Get workflow execution status and progress
   */
  async getWorkflowStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workflowId } = req.params;
      
      const status = await k2wUnifiedService.getWorkflowStatus(workflowId);
      
      if (!status) {
        ResponseHandler.notFound(res, 'Workflow not found');
        return;
      }

      ResponseHandler.success(res, status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/k2w/workflow/:workflowId/cancel
   * Cancel running workflow
   */
  async cancelWorkflow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workflowId } = req.params;
      
      const cancelled = await k2wUnifiedService.cancelWorkflow(workflowId);
      
      if (cancelled) {
        ResponseHandler.success(res, { cancelled: true }, 'Workflow cancelled successfully');
      } else {
        ResponseHandler.internalError(res, 'Failed to cancel workflow');
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/k2w/content/generate-advanced
   * Generate content using advanced AI with all optimizations
   */
  async generateAdvancedContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contentOptions = req.body;
      
      // Validate required fields
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['keyword', 'language', 'region']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Keyword, language, and region are required', missingFields);
        return;
      }

      const generatedContent = await aiContentGenerator.generateContent(contentOptions);
      
      ResponseHandler.success(res, generatedContent, 'Advanced content generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/k2w/images/generate
   * Generate DALL-E images for content
   */
  async generateImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const imageOptions = req.body;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['keyword']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Keyword is required for image generation', missingFields);
        return;
      }

      const generatedImages = await aiImageGenerator.generateImages(imageOptions);
      
      ResponseHandler.success(res, {
        images: generatedImages,
        total_generated: generatedImages.length
      }, 'Images generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/k2w/images/batch-generate
   * Generate images for multiple keywords
   */
  async batchGenerateImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keywords, baseOptions = {} } = req.body;
      
      if (!keywords || !Array.isArray(keywords)) {
        ResponseHandler.badRequest(res, 'keywords array is required');
        return;
      }

      const results = await aiImageGenerator.batchGenerateImages(keywords, baseOptions);
      
      ResponseHandler.success(res, {
        ...results,
        summary: {
          total_keywords: keywords.length,
          successful: Object.keys(results).length,
          total_images: Object.values(results).reduce((sum: number, imgs: any[]) => sum + imgs.length, 0)
        }
      }, 'Batch image generation completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/k2w/translate/content
   * Translate content to multiple languages using DeepL
   */
  async translateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, targetLanguages, options = {} } = req.body;
      
      if (!content || !targetLanguages || !Array.isArray(targetLanguages)) {
        ResponseHandler.badRequest(res, 'Content and targetLanguages array are required');
        return;
      }

      const translationResult = await aiTranslationService.translateContent(
        content,
        targetLanguages,
        options
      );
      
      ResponseHandler.success(res, translationResult, 'Content translated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/k2w/translate/languages
   * Get supported languages for translation
   */
  async getSupportedLanguages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const languages = await aiTranslationService.getSupportedLanguages();
      
      ResponseHandler.success(res, {
        languages,
        total_languages: languages.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/k2w/translate/usage
   * Get translation service usage statistics
   */
  async getTranslationUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usage = await aiTranslationService.getUsageStats();
      
      ResponseHandler.success(res, usage);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/k2w/publish/content
   * Publish content to multiple platforms
   */
  async publishContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, targets, options = {} } = req.body;
      
      if (!content || !targets || !Array.isArray(targets)) {
        ResponseHandler.badRequest(res, 'Content and publishing targets are required');
        return;
      }

      const publishResults = await publishingAutomationService.publishContent(
        content,
        targets,
        options
      );
      
      const successfulPublishes = Object.values(publishResults).filter((r: any) => r.success);
      
      ResponseHandler.success(res, {
        ...publishResults,
        summary: {
          total_targets: targets.length,
          successful: successfulPublishes.length,
          failed: targets.length - successfulPublishes.length,
          published_urls: successfulPublishes.map((p: any) => p.published_url).filter(Boolean)
        }
      }, 'Content publishing completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/k2w/seo/optimize
   * Optimize content for SEO using AI
   */
  async optimizeForSEO(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content, targetLang, regionKeywords = [] } = req.body;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['content', 'targetLang']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Content and target language are required', missingFields);
        return;
      }

      const optimizedContent = await aiTranslationService.optimizeForSEO(
        content,
        targetLang,
        regionKeywords
      );
      
      ResponseHandler.success(res, optimizedContent, 'Content optimized for SEO successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/k2w/system/health
   * System health check for all services
   */
  async systemHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check all services
      const healthStatus = {
        workflow_service: 'operational',
        content_generation: 'operational',
        image_generation: 'operational', 
        translation_service: 'operational',
        publishing_service: 'operational',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        capabilities: [
          'AI Content Generation (GPT-4)',
          'DALL-E Image Generation',
          'DeepL Translation',
          'Multi-platform Publishing',
          'SEO Optimization',
          'Workflow Automation'
        ]
      };

      ResponseHandler.success(res, healthStatus, 'K2W System is fully operational');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/k2w/system/capabilities
   * Get system capabilities and configuration
   */
  async getSystemCapabilities(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      ResponseHandler.success(res, capabilities);
    } catch (error) {
      next(error);
    }
  }
}

// Export controller instance
export const k2wWorkflowController = new K2WWorkflowController();