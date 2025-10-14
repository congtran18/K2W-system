/**
 * Advanced Analytics Types
 * Type definitions for advanced analytics service
 */

export interface AdvancedAnalyticsData {
  content_id: string;
  url: string;
  period: string;
  metrics: AnalyticsMetrics;
  trends: AnalyticsTrends;
  competitor_analysis: CompetitorAnalysis;
  actionable_insights: ActionableInsight[];
}

export interface AnalyticsMetrics {
  // Google Analytics 4 metrics
  sessions: number;
  page_views: number;
  unique_page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  conversion_rate: number;
  goal_completions: number;
  revenue: number;
  
  // Search Console metrics
  impressions: number;
  clicks: number;
  ctr: number;
  avg_position: number;
  
  // Custom K2W metrics
  content_engagement_score: number;
  seo_performance_score: number;
  ai_content_quality_score: number;
  multi_language_performance: Record<string, number>;
}

export interface AnalyticsTrends {
  traffic_trend: Array<{ date: string; value: number }>;
  ranking_trend: Array<{ date: string; position: number }>;
  conversion_trend: Array<{ date: string; conversions: number }>;
}

export interface CompetitorAnalysis {
  ranking_comparison: Array<{
    keyword: string;
    our_position: number;
    competitor_positions: Array<{ domain: string; position: number }>;
  }>;
}

export interface ActionableInsight {
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  recommended_action: string;
  impact_score: number;
}

export interface GoogleAnalyticsConfig {
  property_id: string;
  credentials: any;
  measurement_id: string;
}

export interface SearchConsoleConfig {
  site_url: string;
  credentials: any;
}

export interface PerformanceAlert {
  id: string;
  content_id: string;
  alert_type: 'traffic_drop' | 'ranking_drop' | 'conversion_drop' | 'opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metrics: any;
  recommended_actions: string[];
  created_at: string;
}

export interface AnalyticsRequest {
  content_id?: string;
  date_range?: string;
  metrics?: string[];
  include_trends?: boolean;
  include_insights?: boolean;
}

export interface PerformanceMetricsRequest {
  content_ids: string[];
  metrics_to_include?: string[];
  period?: string;
}

export interface TrendAnalysisRequest {
  metric: string;
  period: string;
  content_ids?: string[];
}

export interface AlertsRequest {
  severity?: string;
  status?: string;
  content_id?: string;
  alert_type?: string;
}