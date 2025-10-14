/**
 * Analytics Controller
 * Handles analytics operations with real data
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseHandler, ValidationHelper } from '../common/response.handler';
import { realAnalyticsService } from '../services/real-analytics.service';

export class AnalyticsController {
  /**
   * Get analytics data
   */
  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        period = '30d',
        metrics = ['content', 'keywords', 'seo_score'],
        content_type,
        language
      } = req.query;

      const analyticsData = await realAnalyticsService.getAnalyticsData(
        period as string,
        Array.isArray(metrics) ? metrics as string[] : [metrics as string],
        {
          content_type: content_type as string,
          language: language as string
        }
      );

      ResponseHandler.success(res, { analytics: analyticsData });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Optimize analytics
   */
  async optimizeAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        optimization_type = 'performance',
        target_metrics = [],
        time_range = '7d'
      } = req.body;

      const optimization_id = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate real optimization recommendations
      const recommendations = await realAnalyticsService.generateOptimizationRecommendations(
        target_metrics,
        time_range
      );

      const optimizationResult = {
        optimization_id,
        optimization_type,
        target_metrics,
        time_range,
        status: 'completed',
        estimated_completion: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        recommendations,
        summary: {
          total_recommendations: recommendations.length,
          high_priority: recommendations.filter(r => r.priority === 'high').length,
          estimated_total_impact: recommendations.reduce((sum, r) => sum + r.impact_score, 0),
          effort_distribution: {
            low: recommendations.filter(r => r.effort_required === 'low').length,
            medium: recommendations.filter(r => r.effort_required === 'medium').length,
            high: recommendations.filter(r => r.effort_required === 'high').length
          }
        }
      };

      ResponseHandler.success(res, optimizationResult, 'Analytics optimization completed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get analytics reports
   */
  async getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        report_type = 'summary',
        period = '30d',
        format = 'json'
      } = req.query;

      // Get real analytics data for the report
      const analyticsData = await realAnalyticsService.getAnalyticsData(period as string);
      
      const report = {
        report_id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        report_type,
        period,
        generated_at: new Date().toISOString(),
        summary: {
          total_content_pieces: analyticsData.metrics.content.total,
          total_keywords_tracked: analyticsData.metrics.keywords.total,
          average_seo_score: analyticsData.avgSeoScore,
          traffic_growth: `${analyticsData.trends.traffic_growth > 0 ? '+' : ''}${analyticsData.trends.traffic_growth}%`,
          ranking_improvements: analyticsData.metrics.keywords.ranking_top_10,
          conversion_rate: analyticsData.traffic.conversion_rate
        },
        details: {
          content_performance: {
            published: analyticsData.metrics.content.published,
            draft: analyticsData.metrics.content.draft,
            by_type: analyticsData.metrics.content.by_type,
            avg_seo_score: analyticsData.metrics.performance.avg_seo_score,
            total_organic_traffic: analyticsData.metrics.performance.total_organic_traffic
          },
          keyword_performance: {
            total_tracked: analyticsData.metrics.keywords.tracking,
            top_10_rankings: analyticsData.metrics.keywords.ranking_top_10,
            top_3_rankings: analyticsData.metrics.keywords.ranking_top_3,
            avg_position: analyticsData.metrics.keywords.avg_position
          },
          traffic_analysis: {
            total_sessions: analyticsData.traffic.total_sessions,
            unique_visitors: analyticsData.traffic.unique_visitors,
            bounce_rate: analyticsData.traffic.bounce_rate,
            avg_session_duration: analyticsData.traffic.avg_session_duration,
            traffic_sources: analyticsData.traffic.sources
          },
          trends: analyticsData.trends
        }
      };

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}.csv"`);
        
        // Convert to actual CSV format
        const csvData = this.convertReportToCSV(report);
        res.send(csvData);
      } else {
        ResponseHandler.success(res, report);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const realTimeData = await realAnalyticsService.getRealTimeData();
      
      ResponseHandler.success(res, realTimeData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get optimization status
   */
  async getOptimizationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { optimization_id } = req.params;

      const missingFields = ValidationHelper.validateRequiredFields(req.params, ['optimization_id']);
      if (missingFields.length > 0) {
        ResponseHandler.badRequest(res, 'Optimization ID is required', missingFields);
        return;
      }

      // In production, this would query the database for optimization status
      const status = {
        optimization_id,
        status: 'completed',
        progress: 100,
        started_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        completed_at: new Date().toISOString(),
        results: {
          improvements_identified: 8,
          actions_recommended: 15,
          estimated_impact: '+25% overall performance'
        }
      };

      ResponseHandler.success(res, status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get performance benchmarks
   */
  async getPerformanceBenchmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { industry, content_type } = req.query;

      // Get current performance data
      const currentData = await realAnalyticsService.getAnalyticsData('30d');

      // Industry benchmarks (in production, these would come from a benchmarking service)
      const benchmarks = {
        industry: industry || 'content_marketing',
        content_type: content_type || 'all',
        benchmarks: {
          avg_seo_score: 75,
          avg_page_speed: 80,
          avg_bounce_rate: 55,
          avg_session_duration: 150,
          avg_conversion_rate: 2.5,
          avg_organic_traffic_growth: 15
        },
        your_performance: {
          seo_score: currentData.avgSeoScore,
          page_speed: currentData.metrics.performance.avg_page_speed,
          bounce_rate: currentData.traffic.bounce_rate,
          session_duration: currentData.traffic.avg_session_duration,
          conversion_rate: currentData.traffic.conversion_rate,
          traffic_growth: currentData.trends.traffic_growth
        },
        performance_gaps: {
          seo_score_gap: currentData.avgSeoScore - 75,
          page_speed_gap: currentData.metrics.performance.avg_page_speed - 80,
          bounce_rate_gap: 55 - currentData.traffic.bounce_rate, // Lower is better
          session_duration_gap: currentData.traffic.avg_session_duration - 150,
          conversion_rate_gap: currentData.traffic.conversion_rate - 2.5,
          traffic_growth_gap: currentData.trends.traffic_growth - 15
        }
      };

      ResponseHandler.success(res, benchmarks);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper method to convert report to CSV
   */
  private convertReportToCSV(report: any): string {
    const rows = [
      ['Metric', 'Value', 'Period'],
      ['Total Content', report.summary.total_content_pieces, report.period],
      ['Total Keywords', report.summary.total_keywords_tracked, report.period],
      ['Average SEO Score', report.summary.average_seo_score, report.period],
      ['Traffic Growth', report.summary.traffic_growth, report.period],
      ['Ranking Improvements', report.summary.ranking_improvements, report.period],
      ['Conversion Rate', report.summary.conversion_rate, report.period],
      ['', '', ''], // Empty row
      ['Content Type', 'Count', ''],
      ...Object.entries(report.details.content_performance.by_type).map(([type, count]) => [type, count, '']),
      ['', '', ''], // Empty row
      ['Traffic Source', 'Percentage', ''],
      ...Object.entries(report.details.traffic_analysis.traffic_sources).map(([source, percent]) => [source, `${percent}%`, ''])
    ];

    return rows.map(row => row.join(',')).join('\n');
  }
}