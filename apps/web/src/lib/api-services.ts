/**
 * K2W API Services
 * Typed API services for all K2W backend endpoints
 */

import { apiRequest, ApiResponse } from './api-client';

// Types
export interface KeywordSubmission {
  keyword: string;
  region: string;
  language: string;
  project_id?: string;
}

export interface SubmittedKeyword {
  id: string;
  keyword: string;
  region: string;
  language: string;
  status: string;
  createdAt: string;
  progress?: number;
  results?: {
    content?: string;
    seo_score?: number;
    word_count?: number;
    readability_score?: number;
  };
}

export interface ProjectDashboard {
  id: string;
  name: string;
  keywords_count: number;
  content_generated: number;
  success_rate: number;
  created_at: string;
  recent_keywords: SubmittedKeyword[];
}

export interface ContentBatch {
  id: string;
  project_id: string;
  status: string;
  total_keywords: number;
  completed_keywords: number;
  created_at: string;
  keywords: SubmittedKeyword[];
}

export interface AnalyticsData {
  overview: {
    total_keywords: number;
    content_generated: number;
    success_rate: number;
    avg_processing_time: number;
  };
  trends: {
    daily_submissions: Array<{ date: string; count: number }>;
    success_rates: Array<{ date: string; rate: number }>;
  };
  top_performers: {
    keywords: Array<{ keyword: string; score: number; traffic: number }>;
    regions: Array<{ region: string; count: number; success_rate: number }>;
  };
}

// Keyword Services
export const keywordService = {
  // Submit keyword for processing
  submit: (data: KeywordSubmission): Promise<ApiResponse<{ keywordId: string }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/keywords/submit',
      data,
    }),

  // Get keyword status and results
  getStatus: (keywordId: string): Promise<ApiResponse<SubmittedKeyword>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/keywords/${keywordId}/status`,
    }),

  // Get user's keyword history
  getHistory: (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ keywords: SubmittedKeyword[]; total: number }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/keywords/history',
      params,
    }),

  // Import keywords in batch
  importBatch: (data: { keywords: KeywordSubmission[]; project_id?: string }): Promise<ApiResponse<{ batchId: string }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/keywords/import',
      data,
    }),
};

// Content Services
export const contentService = {
  // Generate content for keyword
  generate: (data: { keyword_id: string; additional_requirements?: string }): Promise<ApiResponse<{ content_id: string }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/content/generate',
      data,
    }),

  // Get generated content
  getContent: (contentId: string): Promise<ApiResponse<{ content: string; metadata: Record<string, unknown> }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/content/${contentId}`,
    }),

  // Get content batches
  getBatches: (params?: { project_id?: string; status?: string }): Promise<ApiResponse<{ batches: ContentBatch[] }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/content/batches',
      params,
    }),

  // Download content as file
  downloadContent: (contentId: string, format: 'txt' | 'docx' | 'pdf' = 'txt'): Promise<ApiResponse<{ download_url: string }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/content/${contentId}/download`,
      params: { format },
    }),
};

// Analytics Services  
export const analyticsService = {
  // Get dashboard analytics
  getDashboard: (projectId?: string): Promise<ApiResponse<ProjectDashboard>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/analytics/${projectId || 'default'}/dashboard`,
    }),

  // Get detailed analytics
  getAnalytics: (params?: { 
    project_id?: string; 
    start_date?: string; 
    end_date?: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
  }): Promise<ApiResponse<AnalyticsData>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/analytics/detailed',
      params,
    }),

  // Get performance metrics
  getPerformance: (keywordId: string): Promise<ApiResponse<{
    seo_score: number;
    readability: number;
    engagement_prediction: number;
    optimization_suggestions: string[];
  }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/analytics/performance/${keywordId}`,
    }),
};

// Workflow Services
export const workflowService = {
  // Execute complete K2W workflow
  executeWorkflow: (data: {
    keywords: string[];
    settings: {
      region: string;
      language: string;
      content_type: 'blog' | 'article' | 'product' | 'landing';
      seo_focus: 'high' | 'medium' | 'low';
    };
  }): Promise<ApiResponse<{ workflow_id: string }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/workflow/execute',
      data,
    }),

  // Get workflow status
  getWorkflowStatus: (workflowId: string): Promise<ApiResponse<{
    id: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    stages: Array<{
      name: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      progress: number;
    }>;
    results?: Record<string, unknown>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/workflow/${workflowId}/status`,
    }),

  // Cancel workflow
  cancelWorkflow: (workflowId: string): Promise<ApiResponse<{ cancelled: boolean }>> =>
    apiRequest({
      method: 'POST',
      url: `/api/k2w/workflow/${workflowId}/cancel`,
    }),
};

// Image Generation Services
export const imageService = {
  // Generate images for content
  generate: (data: {
    keyword_id: string;
    content_id?: string;
    image_type: 'featured' | 'inline' | 'thumbnail' | 'banner';
    style?: 'realistic' | 'artistic' | 'minimal' | 'corporate';
    dimensions?: { width: number; height: number };
    prompt_override?: string;
  }): Promise<ApiResponse<{ image_id: string; generation_id: string }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/images/generate',
      data,
    }),

  // Batch generate images
  batchGenerate: (data: {
    requests: Array<{
      keyword_id: string;
      content_id?: string;
      image_type: 'featured' | 'inline' | 'thumbnail' | 'banner';
      style?: 'realistic' | 'artistic' | 'minimal' | 'corporate';
    }>;
    settings: {
      dimensions?: { width: number; height: number };
      style_consistency: boolean;
    };
  }): Promise<ApiResponse<{ batch_id: string; image_ids: string[] }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/images/batch-generate',
      data,
    }),

  // Get image generation status
  getStatus: (imageId: string): Promise<ApiResponse<{
    id: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    image_url?: string;
    thumbnail_url?: string;
    metadata: Record<string, unknown>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/images/${imageId}/status`,
    }),
};

// Translation Services
export const translationService = {
  // Translate content
  translate: (data: {
    content_id: string;
    target_languages: string[];
    preserve_formatting: boolean;
    seo_optimize: boolean;
  }): Promise<ApiResponse<{ translation_id: string; languages: string[] }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/translate/content',
      data,
    }),

  // Get available languages
  getLanguages: (): Promise<ApiResponse<{
    languages: Array<{
      code: string;
      name: string;
      native_name: string;
      supported_features: string[];
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/translate/languages',
    }),

  // Get translation usage stats
  getUsage: (): Promise<ApiResponse<{
    monthly_characters: number;
    monthly_limit: number;
    languages_used: string[];
    cost_breakdown: Record<string, number>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/translate/usage',
    }),

  // Get translation status
  getStatus: (translationId: string): Promise<ApiResponse<{
    id: string;
    status: 'pending' | 'translating' | 'completed' | 'failed';
    languages: Array<{
      code: string;
      status: string;
      content_id?: string;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/translate/${translationId}/status`,
    }),
};

// Publishing Services
export const publishingService = {
  // Publish content to platforms
  publish: (data: {
    content_id: string;
    platforms: Array<{
      type: 'wordpress' | 'shopify' | 'ghost' | 'custom';
      config: Record<string, unknown>;
      schedule?: string;
    }>;
    seo_optimization: boolean;
  }): Promise<ApiResponse<{ publish_id: string; scheduled_jobs: string[] }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/publish/content',
      data,
    }),

  // Get publishing status
  getStatus: (publishId: string): Promise<ApiResponse<{
    id: string;
    status: 'pending' | 'publishing' | 'completed' | 'failed';
    platforms: Array<{
      type: string;
      status: string;
      url?: string;
      error?: string;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/publish/${publishId}/status`,
    }),
};

// SEO Optimization Services
export const seoService = {
  // Optimize content for SEO
  optimize: (data: {
    content_id: string;
    target_keywords: string[];
    optimization_level: 'basic' | 'advanced' | 'aggressive';
    preserve_readability: boolean;
  }): Promise<ApiResponse<{ optimization_id: string; estimated_improvement: number }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/seo/optimize',
      data,
    }),

  // Get SEO analysis
  analyze: (contentId: string): Promise<ApiResponse<{
    seo_score: number;
    keyword_density: Record<string, number>;
    readability_score: number;
    suggestions: Array<{
      type: 'critical' | 'important' | 'minor';
      category: 'keywords' | 'structure' | 'meta' | 'links';
      message: string;
      fix_suggestion: string;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/seo/analyze/${contentId}`,
    }),
};

// External SEO Services
export const externalSeoService = {
  // Get keyword data from external sources
  getKeywordData: (data: {
    keywords: string[];
    sources: ('semrush' | 'ahrefs' | 'google')[];
    region: string;
  }): Promise<ApiResponse<{
    keywords: Array<{
      keyword: string;
      search_volume: number;
      competition: string;
      cpc: number;
      difficulty: number;
      trends: number[];
    }>;
  }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/seo-external/keyword-data',
      data,
    }),

  // Get keyword suggestions
  getSuggestions: (data: {
    seed_keyword: string;
    count: number;
    sources: string[];
    region: string;
  }): Promise<ApiResponse<{
    suggestions: Array<{
      keyword: string;
      relevance_score: number;
      search_volume: number;
      competition: string;
    }>;
  }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/seo-external/keyword-suggestions',
      data,
    }),

  // Competitor analysis
  analyzeCompetitors: (data: {
    domain: string;
    competitors: string[];
    analysis_type: 'keywords' | 'content' | 'backlinks' | 'all';
  }): Promise<ApiResponse<{
    analysis: {
      competitor_keywords: Record<string, string[]>;
      content_gaps: string[];
      backlink_opportunities: Array<{
        domain: string;
        authority: number;
        relevance: number;
      }>;
    };
  }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/seo-external/competitor-analysis',
      data,
    }),

  // Google Trends data
  getTrends: (data: {
    keywords: string[];
    timeframe: '7d' | '30d' | '90d' | '12m' | '5y';
    region: string;
  }): Promise<ApiResponse<{
    trends: Array<{
      keyword: string;
      interest_over_time: Array<{ date: string; value: number }>;
      related_queries: string[];
      seasonal_patterns: Record<string, number>;
    }>;
  }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/seo-external/google-trends',
      data,
    }),

  // Get available sources
  getSources: (): Promise<ApiResponse<{
    sources: Array<{
      name: string;
      features: string[];
      rate_limits: Record<string, number>;
      status: 'active' | 'inactive' | 'limited';
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/seo-external/sources',
    }),
};

// Advanced Analytics Services
export const advancedAnalyticsService = {
  // Get performance metrics
  getPerformanceMetrics: (data: {
    content_ids: string[];
    metrics: ('traffic' | 'engagement' | 'conversions' | 'seo')[];
    date_range: { start: string; end: string };
  }): Promise<ApiResponse<{
    metrics: Record<string, {
      traffic: { sessions: number; users: number; pageviews: number };
      engagement: { bounce_rate: number; time_on_page: number; pages_per_session: number };
      conversions: { rate: number; value: number; count: number };
      seo: { rankings: Record<string, number>; clicks: number; impressions: number };
    }>;
  }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/analytics-advanced/performance-metrics',
      data,
    }),

  // Get actionable insights
  getInsights: (data: {
    project_id: string;
    analysis_depth: 'basic' | 'detailed' | 'comprehensive';
    focus_areas: ('content' | 'seo' | 'performance' | 'trends')[];
  }): Promise<ApiResponse<{
    insights: Array<{
      type: 'opportunity' | 'warning' | 'success';
      category: string;
      title: string;
      description: string;
      impact_score: number;
      effort_required: 'low' | 'medium' | 'high';
      actions: string[];
    }>;
  }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/analytics-advanced/actionable-insights',
      data,
    }),

  // Analyze trends
  analyzeTrends: (data: {
    data_points: Array<{ date: string; value: number; category: string }>;
    analysis_type: 'seasonal' | 'growth' | 'anomaly' | 'forecast';
    prediction_period?: number;
  }): Promise<ApiResponse<{
    analysis: {
      trend_direction: 'up' | 'down' | 'stable';
      growth_rate: number;
      seasonality: Record<string, number>;
      anomalies: Array<{ date: string; severity: number }>;
      forecast?: Array<{ date: string; predicted_value: number; confidence: number }>;
    };
  }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/analytics-advanced/analyze-trends',
      data,
    }),

  // Get real-time metrics
  getRealTimeMetrics: (): Promise<ApiResponse<{
    current_users: number;
    active_workflows: number;
    processing_queue: number;
    system_performance: {
      cpu_usage: number;
      memory_usage: number;
      response_time: number;
    };
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/analytics-advanced/real-time',
    }),
};

// A/B Testing Services
export const abTestingService = {
  // Create A/B test
  createTest: (data: {
    name: string;
    content_ids: string[];
    test_type: 'content' | 'seo' | 'layout' | 'cta';
    traffic_split: number[];
    duration_days: number;
    success_metrics: string[];
  }): Promise<ApiResponse<{ test_id: string; variants: string[] }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/ab-testing/tests',
      data,
    }),

  // Start test
  startTest: (testId: string): Promise<ApiResponse<{ started: boolean; start_time: string }>> =>
    apiRequest({
      method: 'POST',
      url: `/api/k2w/ab-testing/tests/${testId}/start`,
    }),

  // Stop test
  stopTest: (testId: string): Promise<ApiResponse<{ stopped: boolean; final_results: Record<string, unknown> }>> =>
    apiRequest({
      method: 'POST',
      url: `/api/k2w/ab-testing/tests/${testId}/stop`,
    }),

  // Get test status
  getTestStatus: (testId: string): Promise<ApiResponse<{
    id: string;
    name: string;
    status: 'draft' | 'running' | 'completed' | 'stopped';
    progress: number;
    variants: Array<{
      id: string;
      name: string;
      traffic_percentage: number;
      conversions: number;
      visitors: number;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/ab-testing/tests/${testId}/status`,
    }),

  // Get test results
  getResults: (testId: string): Promise<ApiResponse<{
    test_id: string;
    statistical_significance: number;
    winner: string | null;
    results: Record<string, {
      conversions: number;
      conversion_rate: number;
      confidence_interval: [number, number];
      improvement: number;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: `/api/k2w/ab-testing/tests/${testId}/results`,
    }),

  // Generate variants automatically
  generateVariants: (data: {
    base_content_id: string;
    variant_count: number;
    variation_type: 'title' | 'meta' | 'content' | 'cta' | 'all';
    creativity_level: 'conservative' | 'moderate' | 'creative';
  }): Promise<ApiResponse<{ variants: Array<{ id: string; changes: Record<string, unknown> }> }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/ab-testing/variants/generate',
      data,
    }),
};

// Cost Optimization Services
export const costOptimizationService = {
  // Track usage and costs
  trackUsage: (data: {
    service: string;
    operation: string;
    tokens_used?: number;
    api_calls?: number;
    processing_time?: number;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<{ tracked: boolean; current_cost: number }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/cost-optimization/track-usage',
      data,
    }),

  // Optimize prompts for cost efficiency
  optimizePrompt: (data: {
    original_prompt: string;
    target_reduction: number;
    preserve_quality: boolean;
  }): Promise<ApiResponse<{
    optimized_prompt: string;
    token_reduction: number;
    estimated_savings: number;
    quality_score: number;
  }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/k2w/cost-optimization/optimize-prompt',
      data,
    }),

  // Get cost analytics
  getAnalytics: (params?: {
    period: 'daily' | 'weekly' | 'monthly';
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<{
    total_cost: number;
    cost_breakdown: Record<string, number>;
    usage_trends: Array<{ date: string; cost: number; usage: number }>;
    optimization_opportunities: Array<{
      area: string;
      potential_savings: number;
      effort_required: string;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/cost-optimization/analytics',
      params,
    }),

  // Get recommendations
  getRecommendations: (): Promise<ApiResponse<{
    recommendations: Array<{
      type: 'cost_reduction' | 'efficiency' | 'quality';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      estimated_impact: string;
      implementation_effort: string;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/cost-optimization/recommendations',
    }),

  // Get budget status
  getBudgetStatus: (): Promise<ApiResponse<{
    current_spend: number;
    monthly_budget: number;
    daily_average: number;
    projected_monthly: number;
    alerts: Array<{
      type: 'warning' | 'critical';
      message: string;
      threshold: number;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/cost-optimization/budget/status',
    }),

  // Configure budget
  configureBudget: (data: {
    monthly_limit: number;
    daily_limit?: number;
    alert_thresholds: number[];
    auto_stop_at_limit: boolean;
  }): Promise<ApiResponse<{ configured: boolean; settings: Record<string, unknown> }>> =>
    apiRequest({
      method: 'PUT',
      url: '/api/k2w/cost-optimization/budget/config',
      data,
    }),
};

// Performance Optimization Services
export const optimizationService = {
  // Get system health
  getHealth: (): Promise<ApiResponse<{
    status: 'healthy' | 'degraded' | 'critical';
    response_time: number;
    throughput: number;
    error_rate: number;
    bottlenecks: string[];
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/optimize/health',
    }),

  // Get performance insights
  getInsights: (): Promise<ApiResponse<{
    insights: Array<{
      category: 'performance' | 'reliability' | 'cost';
      severity: 'info' | 'warning' | 'critical';
      message: string;
      recommendation: string;
    }>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/optimize/insights',
    }),

  // Cache management
  getCacheStats: (): Promise<ApiResponse<{
    hit_rate: number;
    miss_rate: number;
    total_requests: number;
    cache_size: number;
    memory_usage: number;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/optimize/cache/stats',
    }),

  clearCache: (data?: { keys?: string[]; pattern?: string }): Promise<ApiResponse<{ cleared: boolean; count: number }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/optimize/cache/clear',
      data,
    }),

  warmupCache: (data: { endpoints: string[]; priority: 'high' | 'normal' | 'low' }): Promise<ApiResponse<{ warmed: boolean; count: number }>> =>
    apiRequest({
      method: 'POST',
      url: '/api/optimize/cache/warmup',
      data,
    }),

  // Rate limiting
  getRateLimitStatus: (): Promise<ApiResponse<{
    current_usage: Record<string, number>;
    limits: Record<string, number>;
    reset_times: Record<string, string>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/optimize/ratelimit/status',
    }),
};

// Health check service
export const healthService = {
  check: (): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    service: string;
    version: string;
    environment: string;
    uptime: number;
    memory: Record<string, number>;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/health',
    }),

  checkK2W: (): Promise<ApiResponse<{
    status: string;
    service: string;
    timestamp: string;
    version: string;
  }>> =>
    apiRequest({
      method: 'GET',
      url: '/api/k2w/health',
    }),
};