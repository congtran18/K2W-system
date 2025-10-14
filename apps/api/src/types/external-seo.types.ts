/**
 * External SEO API Types
 * Type definitions for external SEO service integration
 */

export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  search_intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  trend_data: number[];
  related_keywords: string[];
  questions: string[];
  serp_features: string[];
}

export interface AhrefsKeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  clicks: number;
  traffic_potential: number;
  parent_topic: string;
  related_terms: string[];
}

export interface SEMrushKeywordData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  trend: number[];
  phrase_match_keywords: string[];
  related_keywords: string[];
  intent: string;
}

export interface GoogleTrendsData {
  keyword: string;
  interest_over_time: Array<{ date: string; value: number }>;
  related_queries: {
    top: Array<{ query: string; value: number }>;
    rising: Array<{ query: string; value: number }>;
  };
  geo_distribution: Array<{ location: string; value: number }>;
}

export interface SEOApiConfig {
  ahrefs: {
    api_key: string;
    base_url: string;
    rate_limit: number;
  };
  semrush: {
    api_key: string;
    base_url: string;
    rate_limit: number;
  };
  google_trends: {
    enabled: boolean;
    rate_limit: number;
  };
}

export interface CompetitorData {
  domain: string;
  organic_keywords: number;
  organic_traffic: number;
  paid_keywords: number;
  backlinks: number;
  domain_rating: number;
  top_keywords: string[];
}

export interface KeywordResearchRequest {
  seed_keywords: string[];
  target_country?: string;
  include_competitors?: boolean;
  language?: string;
  search_engine?: 'google' | 'bing' | 'yahoo';
}

export interface KeywordSuggestionsRequest {
  topic: string;
  limit?: number;
  country?: string;
  language?: string;
}

export interface CompetitorAnalysisRequest {
  keywords: string[];
  competitor_domains?: string[];
  analysis_depth?: 'basic' | 'detailed' | 'comprehensive';
}

export interface TrendsAnalysisRequest {
  keywords: string[];
  timeframe?: string;
  geo?: string;
  category?: string;
}

export interface BatchKeywordRequest {
  keyword_batches: string[][];
  batch_size?: number;
  priority?: 'low' | 'medium' | 'high';
}