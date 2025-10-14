/**
 * A/B Testing Controller
 * Handles A/B test creation, management, and analysis operations
 */

import { Request, Response, NextFunction } from 'express';
import { abTestingFramework } from '../services/ab-testing.service';
import { ResponseHandler, ValidationHelper } from '../common/response.handler';

export class AbTestingController {
  /**
   * Create a new A/B test
   */
  async createTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const testConfig = req.body;
      
      if (!testConfig || Object.keys(testConfig).length === 0) {
        ResponseHandler.badRequest(res, 'Test configuration is required');
        return;
      }

      const createdTest = await abTestingFramework.createABTest(testConfig);

      ResponseHandler.created(res, createdTest);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start an A/B test
   */
  async startTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { testId } = req.params;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.params, ['testId']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      await abTestingFramework.startTest(testId);

      ResponseHandler.successMessage(res, 'Test started successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stop an A/B test
   */
  async stopTest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { testId } = req.params;
      const { reason = 'completed' } = req.body;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.params, ['testId']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      const results = await abTestingFramework.stopTest(testId, reason);

      ResponseHandler.success(res, results);
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
      
      const missingFields = ValidationHelper.validateRequiredFields(req.params, ['testId']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      const status = await abTestingFramework.getTestStatus(testId);

      ResponseHandler.success(res, status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get test results and analysis
   */
  async getTestResults(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { testId } = req.params;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.params, ['testId']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      // Get test config first to analyze results
      const { config } = await abTestingFramework.getTestStatus(testId);
      const results = await abTestingFramework.analyzeTestResults(config);

      ResponseHandler.success(res, results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate content variants using AI
   */
  async generateVariants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_id, variant_types, number_of_variants = 2 } = req.body;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['content_id']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      // Mock content retrieval for now
      const baseContent = {
        id: content_id,
        title: 'Sample Content Title',
        body_html: '<p>Sample content body</p>',
        meta_description: 'Sample meta description'
      };

      const variants = await abTestingFramework.generateContentVariants(
        baseContent as any,
        variant_types,
        number_of_variants
      );

      ResponseHandler.success(res, variants);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Auto-optimize content using A/B testing
   */
  async autoOptimize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_id } = req.body;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['content_id']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      const optimization = await abTestingFramework.autoOptimizeContent(content_id);

      ResponseHandler.success(res, optimization);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch optimize multiple content pieces
   */
  async batchOptimize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_ids, test_config } = req.body;
      
      if (!Array.isArray(content_ids)) {
        ResponseHandler.badRequest(res, 'content_ids must be an array');
        return;
      }

      const results = await abTestingFramework.batchOptimize(content_ids, test_config);

      ResponseHandler.success(res, results);
    } catch (error) {
      next(error);
    }
  }
}