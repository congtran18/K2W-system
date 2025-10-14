/**
 * Cost Optimization Controller
 * Handles API requests for cost optimization functionality
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../common/response.handler';
import { CostOptimizationService } from '../services/cost-optimization.service';
import type {
  TrackUsageDto,
  OptimizePromptDto,
  BatchProcessDto,
  CostAnalyticsDto,
  BudgetConfigDto
} from '../dto/index.dto';

export class CostOptimizationController {
  constructor(
    private readonly costOptimizationService: CostOptimizationService
  ) {}

  /**
   * Track API token usage
   */
  async trackUsage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as TrackUsageDto;
      
      if (!data.endpoint || !data.prompt_tokens || !data.completion_tokens) {
        ResponseHandler.badRequest(res, 'Missing required fields: endpoint, prompt_tokens, completion_tokens');
        return;
      }

      await this.costOptimizationService.trackTokenUsage(
        data.endpoint,
        data.prompt_tokens,
        data.completion_tokens,
        data.model
      );

      ResponseHandler.successMessage(res, 'Token usage tracked successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Optimize prompt for cost efficiency
   */
  async optimizePrompt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as OptimizePromptDto;
      
      if (!data.prompt) {
        ResponseHandler.badRequest(res, 'Missing required field: prompt');
        return;
      }

      const optimizedPrompt = await this.costOptimizationService.optimizePrompt(
        data.prompt,
        data.target_reduction
      );

      ResponseHandler.success(res, optimizedPrompt, 'Prompt optimized successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Process operations in batch for cost efficiency
   */
  async batchProcess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as BatchProcessDto;
      
      if (!data.items || !Array.isArray(data.items)) {
        ResponseHandler.badRequest(res, 'Missing required field: items (array)');
        return;
      }

      // Define a simple processor function for the batch
      const processor = async (batch: Record<string, unknown>[]) => {
        return batch.map(item => ({ ...item, processed: true }));
      };

      const results = await this.costOptimizationService.batchProcess(
        data.items,
        processor,
        data.batch_size,
        data.delay_ms
      );

      ResponseHandler.success(res, results, 'Batch processing completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cost analytics and insights
   */
  async getCostAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as CostAnalyticsDto;

      const analytics = await this.costOptimizationService.getCostAnalytics(
        data.period
      );

      ResponseHandler.success(res, analytics, 'Cost analytics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Configure budget settings
   */
  async configureBudget(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as BudgetConfigDto;
      
      if (!data.monthly_budget_usd || !data.daily_budget_usd) {
        ResponseHandler.badRequest(res, 'Missing required fields: monthly_budget_usd, daily_budget_usd');
        return;
      }

      await this.costOptimizationService.setBudgetConfig({
        monthly_budget_usd: data.monthly_budget_usd,
        daily_budget_usd: data.daily_budget_usd,
        alert_thresholds: data.alert_thresholds,
        auto_throttling: data.auto_throttling
      });

      ResponseHandler.successMessage(res, 'Budget configuration updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get budget status and alerts
   */
  async getBudgetStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await this.costOptimizationService.getBudgetStatus();

      ResponseHandler.success(res, status, 'Budget status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cost optimization recommendations
   */
  async getOptimizationRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recommendations = await this.costOptimizationService.generateOptimizationRecommendations();

      ResponseHandler.success(res, recommendations, 'Optimization recommendations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get cached response if available
   */
  async getCachedResponse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cacheKey } = req.params;

      if (!cacheKey) {
        ResponseHandler.badRequest(res, 'Missing required parameter: cacheKey');
        return;
      }

      const cachedResponse = await this.costOptimizationService.getCachedResponse(
        cacheKey,
        async () => ({ message: 'No cached data available' })
      );

      ResponseHandler.success(res, cachedResponse, 'Cached response retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current cost metrics
   */
  async getCurrentMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period = 'daily' } = req.query;

      const analytics = await this.costOptimizationService.getCostAnalytics(
        period as 'daily' | 'weekly' | 'monthly'
      );

      ResponseHandler.success(res, analytics, 'Current cost metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate cost summary report
   */
  async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { period = 'monthly', include_recommendations = true } = req.body;

      const analytics = await this.costOptimizationService.getCostAnalytics(period);
      const recommendations = include_recommendations 
        ? await this.costOptimizationService.generateOptimizationRecommendations()
        : [];

      const report = {
        analytics,
        recommendations,
        generated_at: new Date().toISOString(),
        period
      };

      ResponseHandler.success(res, report, 'Cost summary report generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const costOptimizationController = new CostOptimizationController(
  new CostOptimizationService()
);