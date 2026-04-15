/**
 * Cost Optimization Controller
 * Handles cost monitoring, optimization, and budget management operations
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHandler, ValidationHelper } from '../common/response.handler';
import { costOptimizationService } from '../services/cost-optimization.service';

export class CostOptimizationController {
  /**
   * Track token usage for cost monitoring
   */
  async trackUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { endpoint, prompt_tokens, completion_tokens, model = 'gpt-4' } = req.body;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['endpoint', 'prompt_tokens', 'completion_tokens']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'endpoint, prompt_tokens, and completion_tokens are required', missingFields);
        return;
      }

      const result = await costOptimizationService.trackTokenUsage(
        endpoint,
        prompt_tokens,
        completion_tokens,
        model
      );

      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Optimize a prompt to reduce token usage
   */
  async optimizePrompt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { prompt, target_reduction = 20 } = req.body;
      
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['prompt']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'prompt is required', missingFields);
        return;
      }

      const optimization = await costOptimizationService.optimizePrompt(prompt, target_reduction);

      ResponseHandler.success(res, optimization);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive cost analytics
   */
  async getCostAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period = 'monthly' } = req.query;
      
      const analytics = await costOptimizationService.getCostAnalytics(period as 'monthly' | 'daily' | 'weekly' | undefined);

      ResponseHandler.success(res, analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cost optimization recommendations
   */
  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recommendations = await costOptimizationService.generateOptimizationRecommendations();

      ResponseHandler.success(res, recommendations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current budget status
   */
  async getBudgetStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgetStatus = await costOptimizationService.getBudgetStatus();

      ResponseHandler.success(res, budgetStatus);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update budget configuration
   */
  async updateBudgetConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const budgetConfig = req.body;
      
      if (!budgetConfig || Object.keys(budgetConfig).length === 0) {
        ResponseHandler.badRequest(res, 'Budget configuration is required');
        return;
      }

      await costOptimizationService.setBudgetConfig(budgetConfig);

      ResponseHandler.success(res, null, 'Budget configuration updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process items in batches to optimize costs
   */
  async batchProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { items, batch_size = 10, delay_ms = 1000 } = req.body;
      
      if (!items || !Array.isArray(items)) {
        ResponseHandler.badRequest(res, 'items array is required');
        return;
      }

      // Mock processor function
      const processor = async (batch: unknown[]) => {
        return batch.map(item => ({ ...item as object, processed: true }));
      };

      const result = await costOptimizationService.batchProcess(
        items,
        processor,
        batch_size,
        delay_ms
      );

      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}