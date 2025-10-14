/**
 * Advanced Analytics Controller
 * Handles API requests for advanced analytics features
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../common/response.handler';
import { AdvancedAnalyticsService } from '../services/advanced-analytics.service';
import type {
  AnalyticsRequestDto,
  PerformanceMetricsDto,
  TrendAnalysisDto,
  AlertsDto
} from '../dto/index.dto';

export class AdvancedAnalyticsController {
  constructor(
    private readonly analyticsService: AdvancedAnalyticsService
  ) {}

  /**
   * Get analytics data
   */
  async getAnalyticsData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as AnalyticsRequestDto;
      
      if (!data.content_id || !data.date_range) {
        ResponseHandler.badRequest(res, 'Missing required fields: content_id and date_range');
        return;
      }

      const insights = await this.analyticsService.getAnalyticsData(
        data.content_id,
        data.date_range
      );

      ResponseHandler.success(res, insights, 'Analytics data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as PerformanceMetricsDto;
      
      if (!data.content_ids || !Array.isArray(data.content_ids)) {
        ResponseHandler.badRequest(res, 'Missing required field: content_ids (array)');
        return;
      }

      const metrics = await this.analyticsService.getPerformanceMetrics(
        data.content_ids,
        data.metrics_to_include || ['all']
      );

      ResponseHandler.success(res, metrics, 'Performance metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate actionable insights
   */
  async generateInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { content_id, date_range } = req.body;
      
      if (!content_id || !date_range) {
        ResponseHandler.badRequest(res, 'Missing required fields: content_id and date_range');
        return;
      }

      const insights = await this.analyticsService.generateActionableInsightsPublic(
        content_id,
        date_range
      );

      ResponseHandler.success(res, insights, 'Actionable insights generated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyze trends
   */
  async analyzeTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as TrendAnalysisDto;
      
      if (!data.metric || !data.period) {
        ResponseHandler.badRequest(res, 'Missing required fields: metric and period');
        return;
      }

      const trends = await this.analyticsService.analyzeTrends(
        data.metric,
        data.period
      );

      ResponseHandler.success(res, trends, 'Trend analysis completed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active alerts
   */
  async getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as AlertsDto;

      const alerts = await this.analyticsService.getActiveAlerts(
        data.severity,
        data.status || 'active'
      );

      ResponseHandler.success(res, alerts, 'Alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { alertId, resolutionNotes } = req.body;

      if (!alertId || !resolutionNotes) {
        ResponseHandler.badRequest(res, 'Missing required fields: alertId and resolutionNotes');
        return;
      }

      const result = await this.analyticsService.resolveAlert(alertId, resolutionNotes);

      ResponseHandler.success(res, result, 'Alert resolved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time data
   */
  async getRealTimeData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const realTimeData = await this.analyticsService.getRealTimeData();

      ResponseHandler.success(res, realTimeData, 'Real-time data retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get advanced analytics
   */
  async getAdvancedAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { url, dateRange, includeInsights = true } = req.body;

      if (!url || !dateRange) {
        ResponseHandler.badRequest(res, 'Missing required fields: url and dateRange');
        return;
      }

      const analytics = await this.analyticsService.getAdvancedAnalytics(
        url,
        dateRange,
        includeInsights
      );

      ResponseHandler.success(res, analytics, 'Advanced analytics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Monitor performance
   */
  async monitorPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await this.analyticsService.monitorPerformance();

      ResponseHandler.success(res, alerts, 'Performance monitoring completed successfully');
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const advancedAnalyticsController = new AdvancedAnalyticsController(
  new AdvancedAnalyticsService()
);