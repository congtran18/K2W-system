/**
 * Advanced Analytics Controller
 * Handles advanced analytics operations including performance monitoring and analytics data
 */

import { Request, Response, NextFunction } from 'express';
import { advancedAnalyticsService } from '../services/advanced-analytics.service';
import { ResponseHandler, ValidationHelper } from '../common/response.handler';

export class AdvancedAnalyticsController {
  /**
   * Get analytics data for content
   */
  async getAnalyticsData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_id, date_range = '30d' } = req.body;

      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['content_id']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      const analytics = await advancedAnalyticsService.getAnalyticsData(content_id, date_range);

      ResponseHandler.success(res, analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get performance metrics for multiple content pieces
   */
  async getPerformanceMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_ids, metrics_to_include = [] } = req.body;

      if (!Array.isArray(content_ids)) {
        ResponseHandler.badRequest(res, 'content_ids must be an array');
        return;
      }

      const metrics = await advancedAnalyticsService.getPerformanceMetrics(content_ids, metrics_to_include);

      ResponseHandler.success(res, metrics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate actionable insights
   */
  async generateActionableInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_id, insight_type = 'all' } = req.body;

      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['content_id']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      const insights = await advancedAnalyticsService.generateActionableInsightsPublic(content_id, insight_type);

      ResponseHandler.success(res, insights);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyze trends for specific metric
   */
  async analyzeTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { metric, period = '30d' } = req.body;

      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['metric']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      const trends = await advancedAnalyticsService.analyzeTrends(metric, period);

      ResponseHandler.success(res, trends);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active performance alerts
   */
  async getActiveAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { severity, status = 'active' } = req.query;

      const alerts = await advancedAnalyticsService.getActiveAlerts(severity as string, status as string);

      ResponseHandler.success(res, alerts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resolve a performance alert
   */
  async resolveAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { alert_id } = req.params;
      const { resolution_notes } = req.body;

      const missingFields = ValidationHelper.validateRequiredFields(req.params, ['alert_id']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
        return;
      }

      const result = await advancedAnalyticsService.resolveAlert(alert_id, resolution_notes);

      ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time analytics data
   */
  async getRealTimeData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const realTimeData = await advancedAnalyticsService.getRealTimeData();

      ResponseHandler.success(res, realTimeData);
    } catch (error) {
      next(error);
    }
  }
}