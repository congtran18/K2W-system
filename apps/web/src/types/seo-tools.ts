/**
 * SEO Tools Types
 * Type definitions for SEO analysis, keyword research, and external tool integrations
 */

// Keyword Data Types
export interface KeywordData {
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  trend: 'rising' | 'stable' | 'declining';
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
}

export interface KeywordSuggestion {
  keyword: string;
  relevance_score: number;
  opportunity_score: number;
  suggested_content_type: string;
}

// Tool Integration Types
export interface SEOToolConfig {
  tool_name: 'semrush' | 'ahrefs' | 'moz' | 'keyword_planner';
  api_key: string;
  is_active: boolean;
  daily_quota: number;
  used_quota: number;
}

export interface ExternalSEORequest {
  tool: 'semrush' | 'ahrefs' | 'moz' | 'keyword_planner';
  query_type: 'keyword_research' | 'competitor_analysis' | 'backlink_analysis' | 'rank_tracking';
  parameters: Record<string, unknown>;
}

// Competitor Analysis Types
export interface CompetitorData {
  domain: string;
  authority_score: number;
  organic_keywords: number;
  organic_traffic: number;
  paid_keywords: number;
  paid_traffic: number;
  backlinks: number;
  referring_domains: number;
}

export interface CompetitorKeyword {
  keyword: string;
  position: number;
  search_volume: number;
  url: string;
  difficulty: number;
}

// Backlink Analysis Types
export interface BacklinkData {
  source_url: string;
  target_url: string;
  anchor_text: string;
  authority_score: number;
  link_type: 'follow' | 'nofollow';
  discovered_date: string;
}

export interface BacklinkProfile {
  total_backlinks: number;
  referring_domains: number;
  authority_score: number;
  spam_score: number;
  top_backlinks: BacklinkData[];
}

// Rank Tracking Types
export interface RankTrackingKeyword {
  keyword: string;
  current_position: number;
  previous_position: number;
  best_position: number;
  url: string;
  search_engine: 'google' | 'bing' | 'yahoo';
  location: string;
  device: 'desktop' | 'mobile';
}

export interface RankTrackingReport {
  date: string;
  total_keywords: number;
  average_position: number;
  keywords_improved: number;
  keywords_declined: number;
  visibility_score: number;
  keywords: RankTrackingKeyword[];
}

// SEO Analysis Types
export interface SEOAnalysisResult {
  content_id: string;
  url?: string;
  title_seo_score: number;
  meta_description_score: number;
  content_score: number;
  technical_score: number;
  overall_score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: 'title' | 'meta' | 'content' | 'technical';
    message: string;
    suggestion: string;
  }>;
  opportunities: Array<{
    category: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
  }>;
}

// Content Gap Analysis
export interface ContentGap {
  keyword: string;
  search_volume: number;
  difficulty: number;
  competitor_coverage: number;
  our_coverage: number;
  opportunity_score: number;
  suggested_content_type: string;
}

export interface ContentGapAnalysis {
  total_gaps: number;
  high_opportunity_gaps: ContentGap[];
  competitor_domains: string[];
  analysis_date: string;
}