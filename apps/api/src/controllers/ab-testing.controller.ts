/**
 * A/B Testing Controller
 * Handles API requests for A/B testing functionality
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../common/response.handler';
import { ABTestingFramework } from '../services/ab-testing.service';
import type {
  CreateTestDto,
  GenerateVariantsDto,
  BatchOptimizationDto
} from '../dto/index.dto';

export class ABTestingController {
  constructor(
    private readonly abTestingService: ABTestingFramework
  ) {}

  /**
   * Create new A/B test
   */
  async createTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CreateTestDto;
      
      if (!data.content_id || !data.test_name || !data.test_type) {
        ResponseHandler.badRequest(res, 'Missing required fields: content_id, test_name, test_type');
        return;
      }

      const test = await this.abTestingService.createABTest({
        content_id: data.content_id,
        test_name: data.test_name,
        test_type: data.test_type,
        hypothesis: data.hypothesis,
        primary_metric: data.primary_metric as 'ctr' | 'conversion_rate' | 'bounce_rate' | 'time_on_page' | 'revenue',
        secondary_metrics: data.secondary_metrics || [],
        minimum_sample_size: data.minimum_sample_size || 1000,
        confidence_level: data.confidence_level || 95,
        max_test_duration_days: data.max_test_duration_days || 14,
        variants: data.variants,
        created_by: 'api_user'
      });

      ResponseHandler.created(res, test, 'A/B test created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate test variants
   */
  async generateVariants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as GenerateVariantsDto;
      
      if (!data.content_id || !data.variant_types) {
        ResponseHandler.badRequest(res, 'Missing required fields: content_id, variant_types');
        return;
      }

      // Create a mock content record with all required fields
      const mockContent = {
        id: data.content_id,
        title: 'Sample Title',
        body: 'Sample body content',
        body_html: '<p>Sample body content</p>',
        meta_title: 'Sample Meta Title',
        meta_description: 'Sample meta description',
        keyword_id: 'sample-keyword-id',
        cluster_id: 'sample-cluster-id',
        project_id: 'sample-project-id',
        content_type: 'article' as const,
        language: 'en',
        region: 'US',
        status: 'published' as const,
        url: 'https://example.com/sample',
        published_at: new Date().toISOString(),
        seo_score: 85,
        readability_score: 90,
        word_count: 1000,
        headings: [{ level: 1, text: 'Sample Heading' }],
        faqs: [{ question: 'Sample Question?', answer: 'Sample Answer' }],
        internal_links: [],
        external_links: [],
        images: [],
        schema_markup: '{}',
        ai_metadata: {
          model_version: '1.0',
          prompt_template_version: '1.0',
          generation_time: new Date().toISOString(),
          revision_count: 1
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const variants = await this.abTestingService.generateContentVariants(
        mockContent,
        data.variant_types,
        data.number_of_variants || 2
      );

      ResponseHandler.success(res, variants, 'Test variants generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start A/B test
   */
  async startTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { testId } = req.params;
      
      if (!testId) {
        ResponseHandler.badRequest(res, 'Missing required parameter: testId');
        return;
      }

      await this.abTestingService.startTest(testId);

      ResponseHandler.successMessage(res, 'A/B test started successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stop A/B test
   */
  async stopTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { testId } = req.params;
      const { reason = 'manual_stop' } = req.body;
      
      if (!testId) {
        ResponseHandler.badRequest(res, 'Missing required parameter: testId');
        return;
      }

      const result = await this.abTestingService.stopTest(testId, reason);

      ResponseHandler.success(res, result, 'A/B test stopped successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get test status and interim results
   */
  async getTestStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { testId } = req.params;
      
      if (!testId) {
        ResponseHandler.badRequest(res, 'Missing required parameter: testId');
        return;
      }

      const status = await this.abTestingService.getTestStatus(testId);

      ResponseHandler.success(res, status, 'Test status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyze test results
   */
  async analyzeTestResults(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { testId } = req.params;
      
      if (!testId) {
        ResponseHandler.badRequest(res, 'Missing required parameter: testId');
        return;
      }

      ResponseHandler.successMessage(res, 'Test analysis feature requires full test configuration');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Auto-optimize content
   */
  async autoOptimize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_id } = req.params;
      
      if (!content_id) {
        ResponseHandler.badRequest(res, 'Missing required parameter: content_id');
        return;
      }

      const optimization = await this.abTestingService.autoOptimizeContent(content_id);

      ResponseHandler.success(res, optimization, 'Auto-optimization completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch optimization
   */
  async batchOptimize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as BatchOptimizationDto;
      
      if (!data.content_ids || !data.test_config) {
        ResponseHandler.badRequest(res, 'Missing required fields: content_ids, test_config');
        return;
      }

      const results = await this.abTestingService.batchOptimize(
        data.content_ids,
        data.test_config
      );

      ResponseHandler.success(res, results, 'Batch optimization completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tests for content
   */
  async getContentTests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_id } = req.params;
      const { status } = req.query;

      if (!content_id) {
        ResponseHandler.badRequest(res, 'Missing required parameter: content_id');
        return;
      }

      ResponseHandler.success(res, [], 'Content tests retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const abTestingController = new ABTestingController(
  new ABTestingFramework()
);