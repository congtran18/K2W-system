/**
 * Multi-site Management Types
 * Type definitions for domain management, deployments, and analytics
 */

// Domain Types
export interface Domain {
  id: string;
  domain: string;
  status: 'active' | 'inactive' | 'pending';
  ssl_status: 'valid' | 'invalid' | 'pending';
  last_deployment: string;
}

export interface DomainOverviewProps {
  domains: Domain[];
  loading?: boolean;
}

// Deployment Types
export interface Deployment {
  id: string;
  domain: string;
  status: 'pending' | 'building' | 'deployed' | 'failed';
  deployed_at: string;
  build_time?: number;
}

export interface DeploymentsListProps {
  deployments: Deployment[];
  loading?: boolean;
}

// Analytics Types
export interface AnalyticsData {
  visitors: number;
  pageviews: number;
  bounce_rate: number;
  avg_session_duration: number;
}

export interface PerformanceAnalyticsProps {
  data: AnalyticsData;
  timeRange: '24h' | '7d' | '30d' | '90d';
  loading?: boolean;
}

// Site Configuration Types
export interface SiteConfig {
  id: string;
  domain: string;
  title: string;
  description: string;
  language: string;
  theme: string;
  custom_css?: string;
  analytics_id?: string;
  seo_settings: {
    meta_title_template: string;
    meta_description_template: string;
    canonical_url: string;
  };
}

// Content Distribution Types
export interface ContentDistribution {
  id: string;
  content_id: string;
  target_domains: string[];
  distribution_rules: {
    auto_publish: boolean;
    publish_delay: number;
    localization_required: boolean;
  };
  status: 'pending' | 'distributing' | 'completed' | 'failed';
}

// Multi-site Analytics
export interface MultiSiteAnalytics {
  total_sites: number;
  active_deployments: number;
  total_traffic: number;
  conversion_rate: number;
  site_performance: Array<{
    domain: string;
    visitors: number;
    conversion_rate: number;
    revenue: number;
    ranking_score: number;
  }>;
}

// CDN and Performance
export interface CDNConfig {
  provider: 'cloudflare' | 'cloudfront' | 'fastly';
  enabled: boolean;
  cache_settings: {
    browser_cache_ttl: number;
    edge_cache_ttl: number;
    development_mode: boolean;
  };
}

export interface PerformanceOptimization {
  image_optimization: boolean;
  minification: boolean;
  compression: boolean;
  lazy_loading: boolean;
  critical_css: boolean;
}