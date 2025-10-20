/**
 * React Query Hooks for K2W API
 * Custom hooks using TanStack Query for optimal API state management
 */

import { useMutation, useQuery, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  keywordService,
  contentService,
  analyticsService,
  workflowService,
  healthService,
  imageService,
  translationService,
  publishingService,
  seoService,
  externalSeoService,
  advancedAnalyticsService,
  abTestingService,
  costOptimizationService,
  optimizationService,
  KeywordSubmission,
  SubmittedKeyword,
  ProjectDashboard,
  ContentBatch,
  AnalyticsData,
} from '../lib/api-services';
import { ApiResponse } from '../lib/api-client';

// Query Keys - centralized for cache management
export const queryKeys = {
  // Health checks
  health: ['health'] as const,
  k2wHealth: ['k2w', 'health'] as const,

  // Keywords
  keywords: ['keywords'] as const,
  keywordHistory: (params?: Record<string, unknown>) => ['keywords', 'history', params] as const,
  keywordStatus: (id: string) => ['keywords', 'status', id] as const,

  // Content
  content: ['content'] as const,
  contentBatches: (params?: Record<string, unknown>) => ['content', 'batches', params] as const,
  contentDetail: (id: string) => ['content', 'detail', id] as const,

  // Analytics
  analytics: ['analytics'] as const,
  dashboard: (projectId?: string) => ['analytics', 'dashboard', projectId] as const,
  analyticsData: (params?: Record<string, unknown>) => ['analytics', 'data', params] as const,
  performance: (keywordId: string) => ['analytics', 'performance', keywordId] as const,

  // Workflow
  workflow: ['workflow'] as const,
  workflowStatus: (id: string) => ['workflow', 'status', id] as const,

  // Images
  images: ['images'] as const,
  imageStatus: (id: string) => ['images', 'status', id] as const,

  // Translation
  translation: ['translation'] as const,
  translationStatus: (id: string) => ['translation', 'status', id] as const,
  translationLanguages: ['translation', 'languages'] as const,

  // Publishing
  publishing: ['publishing'] as const,
  publishStatus: (id: string) => ['publishing', 'status', id] as const,

  // SEO
  seo: ['seo'] as const,
  seoAnalysis: (contentId: string) => ['seo', 'analysis', contentId] as const,

  // External SEO
  externalSeo: ['external-seo'] as const,
  seoSources: ['external-seo', 'sources'] as const,

  // Advanced Analytics
  advancedAnalytics: ['advanced-analytics'] as const,
  realTimeMetrics: ['advanced-analytics', 'real-time'] as const,

  // A/B Testing
  abTesting: ['ab-testing'] as const,
  testStatus: (id: string) => ['ab-testing', 'test', id] as const,
  testResults: (id: string) => ['ab-testing', 'results', id] as const,

  // Cost Optimization
  costOptimization: ['cost-optimization'] as const,
  budgetStatus: ['cost-optimization', 'budget'] as const,
  costAnalytics: (params?: Record<string, unknown>) => ['cost-optimization', 'analytics', params] as const,

  // Performance Optimization
  optimization: ['optimization'] as const,
  cacheStats: ['optimization', 'cache'] as const,
  rateLimitStatus: ['optimization', 'ratelimit'] as const,
} as const;

// Health Check Hooks
export function useHealthCheck(options?: UseQueryOptions<ApiResponse<Record<string, unknown>>, Error>) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: healthService.check,
    refetchInterval: 60000, // Check every minute
    ...options,
  });
}

export function useK2WHealthCheck(options?: UseQueryOptions<ApiResponse<Record<string, unknown>>, Error>) {
  return useQuery({
    queryKey: queryKeys.k2wHealth,
    queryFn: healthService.checkK2W,
    refetchInterval: 60000, // Check every minute
    ...options,
  });
}

// Keyword Hooks
export function useKeywordHistory(
  params?: { page?: number; limit?: number; status?: string },
  options?: UseQueryOptions<ApiResponse<{ keywords: SubmittedKeyword[]; total: number }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.keywordHistory(params),
    queryFn: () => keywordService.getHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - fresh data for active monitoring
    ...options,
  });
}

export function useKeywordStatus(
  keywordId: string,
  options?: UseQueryOptions<ApiResponse<SubmittedKeyword>, Error>
) {
  return useQuery({
    queryKey: queryKeys.keywordStatus(keywordId),
    queryFn: () => keywordService.getStatus(keywordId),
    refetchInterval: (query) => {
      // Auto-refresh if still processing
      const status = query.state.data?.data?.status;
      if (status && !['COMPLETED', 'FAILED'].includes(status)) {
        return 5000; // 5 seconds for active workflows
      }
      return false; // Stop refetching when complete
    },
    enabled: !!keywordId,
    ...options,
  });
}

export function useSubmitKeyword(
  options?: UseMutationOptions<ApiResponse<{ keywordId: string }>, Error, KeywordSubmission>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: keywordService.submit,
    onSuccess: (data) => {
      // Invalidate and refetch keyword history
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      
      // Show success notification
      toast.success('Keyword submitted successfully! Processing will begin shortly.');
      
      // Optionally start polling for the new keyword status
      if (data.data?.keywordId) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.keywordStatus(data.data.keywordId),
          queryFn: () => keywordService.getStatus(data.data!.keywordId),
        });
      }
    },
    onError: (error) => {
      toast.error(`Failed to submit keyword: ${error.message}`);
    },
    ...options,
  });
}

export function useImportKeywords(
  options?: UseMutationOptions<ApiResponse<{ batchId: string }>, Error, { keywords: KeywordSubmission[]; project_id?: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: keywordService.importBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      queryClient.invalidateQueries({ queryKey: queryKeys.content });
      toast.success('Keywords imported successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to import keywords: ${error.message}`);
    },
    ...options,
  });
}

// Content Hooks
export function useContentBatches(
  params?: { project_id?: string; status?: string },
  options?: UseQueryOptions<ApiResponse<{ batches: ContentBatch[] }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.contentBatches(params),
    queryFn: () => contentService.getBatches(params),
    ...options,
  });
}

export function useContentDetail(
  contentId: string,
  options?: UseQueryOptions<ApiResponse<{ content: string; metadata: Record<string, unknown> }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.contentDetail(contentId),
    queryFn: () => contentService.getContent(contentId),
    enabled: !!contentId,
    ...options,
  });
}

export function useGenerateContent(
  options?: UseMutationOptions<ApiResponse<{ content_id: string }>, Error, { keyword_id: string; additional_requirements?: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contentService.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content });
      toast.success('Content generation started!');
    },
    onError: (error) => {
      toast.error(`Failed to generate content: ${error.message}`);
    },
    ...options,
  });
}

// Analytics Hooks
export function useDashboard(
  projectId?: string,
  options?: UseQueryOptions<ApiResponse<ProjectDashboard>, Error>
) {
  return useQuery({
    queryKey: queryKeys.dashboard(projectId),
    queryFn: () => analyticsService.getDashboard(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes for dashboard data
    ...options,
  });
}

export function useAnalytics(
  params?: { 
    project_id?: string; 
    start_date?: string; 
    end_date?: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
  },
  options?: UseQueryOptions<ApiResponse<AnalyticsData>, Error>
) {
  return useQuery({
    queryKey: queryKeys.analyticsData(params),
    queryFn: () => analyticsService.getAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes for analytics data
    ...options,
  });
}

export function usePerformanceMetrics(
  keywordId: string,
  options?: UseQueryOptions<ApiResponse<{
    seo_score: number;
    readability: number;
    engagement_prediction: number;
    optimization_suggestions: string[];
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.performance(keywordId),
    queryFn: () => analyticsService.getPerformance(keywordId),
    enabled: !!keywordId,
    ...options,
  });
}

// Workflow Hooks
export function useExecuteWorkflow(
  options?: UseMutationOptions<ApiResponse<{ workflow_id: string }>, Error, {
    keywords: string[];
    settings: {
      region: string;
      language: string;
      content_type: 'blog' | 'article' | 'product' | 'landing';
      seo_focus: 'high' | 'medium' | 'low';
    };
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workflowService.executeWorkflow,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords });
      queryClient.invalidateQueries({ queryKey: queryKeys.content });
      
      toast.success('Workflow started successfully!');
      
      // Start polling for workflow status
      if (data.data?.workflow_id) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.workflowStatus(data.data.workflow_id),
          queryFn: () => workflowService.getWorkflowStatus(data.data!.workflow_id),
        });
      }
    },
    onError: (error) => {
      toast.error(`Failed to start workflow: ${error.message}`);
    },
    ...options,
  });
}

export function useWorkflowStatus(
  workflowId: string,
  options?: UseQueryOptions<ApiResponse<{
    id: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    stages: Array<{
      name: string;
      status: 'pending' | 'running' | 'completed' | 'failed';
      progress: number;
    }>;
    results?: Record<string, unknown>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.workflowStatus(workflowId),
    queryFn: () => workflowService.getWorkflowStatus(workflowId),
    refetchInterval: (query) => {
      // Auto-refresh if still running
      const status = query.state.data?.data?.status;
      if (status && ['running'].includes(status)) {
        return 3000; // 3 seconds for active workflows
      }
      return false; // Stop refetching when complete
    },
    enabled: !!workflowId,
    ...options,
  });
}

export function useCancelWorkflow(
  options?: UseMutationOptions<ApiResponse<{ cancelled: boolean }>, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workflowService.cancelWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflow });
      toast.success('Workflow cancelled successfully');
    },
    onError: (error) => {
      toast.error(`Failed to cancel workflow: ${error.message}`);
    },
    ...options,
  });
}

// ==================== IMAGE GENERATION HOOKS ====================

export function useGenerateImage(
  options?: UseMutationOptions<ApiResponse<{ image_id: string; generation_id: string }>, Error, {
    keyword_id: string;
    content_id?: string;
    image_type: 'featured' | 'inline' | 'thumbnail' | 'banner';
    style?: 'realistic' | 'artistic' | 'minimal' | 'corporate';
    dimensions?: { width: number; height: number };
    prompt_override?: string;
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: imageService.generate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.images });
      toast.success('Image generation started!');
      
      // Start polling for image status
      if (data.data?.image_id) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.imageStatus(data.data.image_id),
          queryFn: () => imageService.getStatus(data.data!.image_id),
        });
      }
    },
    onError: (error) => {
      toast.error(`Failed to generate image: ${error.message}`);
    },
    ...options,
  });
}

export function useBatchGenerateImages(
  options?: UseMutationOptions<ApiResponse<{ batch_id: string; image_ids: string[] }>, Error, {
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
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: imageService.batchGenerate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.images });
      toast.success('Batch image generation started!');
    },
    onError: (error) => {
      toast.error(`Failed to start batch generation: ${error.message}`);
    },
    ...options,
  });
}

export function useImageStatus(
  imageId: string,
  options?: UseQueryOptions<ApiResponse<{
    id: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    image_url?: string;
    thumbnail_url?: string;
    metadata: Record<string, unknown>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.imageStatus(imageId),
    queryFn: () => imageService.getStatus(imageId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status && ['pending', 'generating'].includes(status)) {
        return 3000;
      }
      return false;
    },
    enabled: !!imageId,
    ...options,
  });
}

// ==================== TRANSLATION HOOKS ====================

export function useTranslateContent(
  options?: UseMutationOptions<ApiResponse<{ translation_id: string; languages: string[] }>, Error, {
    content_id: string;
    target_languages: string[];
    preserve_formatting: boolean;
    seo_optimize: boolean;
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: translationService.translate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.translation });
      toast.success('Content translation started!');
      
      if (data.data?.translation_id) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.translationStatus(data.data.translation_id),
          queryFn: () => translationService.getStatus(data.data!.translation_id),
        });
      }
    },
    onError: (error) => {
      toast.error(`Failed to start translation: ${error.message}`);
    },
    ...options,
  });
}

export function useTranslationLanguages(
  options?: UseQueryOptions<ApiResponse<{
    languages: Array<{
      code: string;
      name: string;
      native_name: string;
      supported_features: string[];
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.translationLanguages,
    queryFn: translationService.getLanguages,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    ...options,
  });
}

export function useTranslationStatus(
  translationId: string,
  options?: UseQueryOptions<ApiResponse<{
    id: string;
    status: 'pending' | 'translating' | 'completed' | 'failed';
    languages: Array<{
      code: string;
      status: string;
      content_id?: string;
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.translationStatus(translationId),
    queryFn: () => translationService.getStatus(translationId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status && ['pending', 'translating'].includes(status)) {
        return 4000;
      }
      return false;
    },
    enabled: !!translationId,
    ...options,
  });
}

export function useTranslationUsage(
  options?: UseQueryOptions<ApiResponse<{
    monthly_characters: number;
    monthly_limit: number;
    languages_used: string[];
    cost_breakdown: Record<string, number>;
  }>, Error>
) {
  return useQuery({
    queryKey: [...queryKeys.translation, 'usage'],
    queryFn: translationService.getUsage,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// ==================== PUBLISHING HOOKS ====================

export function usePublishContent(
  options?: UseMutationOptions<ApiResponse<{ publish_id: string; scheduled_jobs: string[] }>, Error, {
    content_id: string;
    platforms: Array<{
      type: 'wordpress' | 'shopify' | 'ghost' | 'custom';
      config: Record<string, unknown>;
      schedule?: string;
    }>;
    seo_optimization: boolean;
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishingService.publish,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publishing });
      toast.success('Content publishing started!');
      
      if (data.data?.publish_id) {
        queryClient.prefetchQuery({
          queryKey: queryKeys.publishStatus(data.data.publish_id),
          queryFn: () => publishingService.getStatus(data.data!.publish_id),
        });
      }
    },
    onError: (error) => {
      toast.error(`Failed to start publishing: ${error.message}`);
    },
    ...options,
  });
}

export function usePublishStatus(
  publishId: string,
  options?: UseQueryOptions<ApiResponse<{
    id: string;
    status: 'pending' | 'publishing' | 'completed' | 'failed';
    platforms: Array<{
      type: string;
      status: string;
      url?: string;
      error?: string;
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.publishStatus(publishId),
    queryFn: () => publishingService.getStatus(publishId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status && ['pending', 'publishing'].includes(status)) {
        return 5000;
      }
      return false;
    },
    enabled: !!publishId,
    ...options,
  });
}

// ==================== SEO HOOKS ====================

export function useOptimizeSEO(
  options?: UseMutationOptions<ApiResponse<{ optimization_id: string; estimated_improvement: number }>, Error, {
    content_id: string;
    target_keywords: string[];
    optimization_level: 'basic' | 'advanced' | 'aggressive';
    preserve_readability: boolean;
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seoService.optimize,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seo });
      queryClient.invalidateQueries({ queryKey: queryKeys.content });
      toast.success('SEO optimization completed!');
    },
    onError: (error) => {
      toast.error(`SEO optimization failed: ${error.message}`);
    },
    ...options,
  });
}

export function useSEOAnalysis(
  contentId: string,
  options?: UseQueryOptions<ApiResponse<{
    seo_score: number;
    keyword_density: Record<string, number>;
    readability_score: number;
    suggestions: Array<{
      type: 'critical' | 'important' | 'minor';
      category: 'keywords' | 'structure' | 'meta' | 'links';
      message: string;
      fix_suggestion: string;
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.seoAnalysis(contentId),
    queryFn: () => seoService.analyze(contentId),
    enabled: !!contentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// ==================== EXTERNAL SEO HOOKS ====================

export function useExternalKeywordData(
  options?: UseMutationOptions<ApiResponse<{
    keywords: Array<{
      keyword: string;
      search_volume: number;
      competition: string;
      cpc: number;
      difficulty: number;
      trends: number[];
    }>;
  }>, Error, {
    keywords: string[];
    sources: ('semrush' | 'ahrefs' | 'google')[];
    region: string;
  }>
) {
  return useMutation({
    mutationFn: externalSeoService.getKeywordData,
    onError: (error) => {
      toast.error(`Failed to fetch keyword data: ${error.message}`);
    },
    ...options,
  });
}

export function useKeywordSuggestions(
  options?: UseMutationOptions<ApiResponse<{
    suggestions: Array<{
      keyword: string;
      relevance_score: number;
      search_volume: number;
      competition: string;
    }>;
  }>, Error, {
    seed_keyword: string;
    count: number;
    sources: string[];
    region: string;
  }>
) {
  return useMutation({
    mutationFn: externalSeoService.getSuggestions,
    onError: (error) => {
      toast.error(`Failed to get keyword suggestions: ${error.message}`);
    },
    ...options,
  });
}

export function useCompetitorAnalysis(
  options?: UseMutationOptions<ApiResponse<{
    analysis: {
      competitor_keywords: Record<string, string[]>;
      content_gaps: string[];
      backlink_opportunities: Array<{
        domain: string;
        authority: number;
        relevance: number;
      }>;
    };
  }>, Error, {
    domain: string;
    competitors: string[];
    analysis_type: 'keywords' | 'content' | 'backlinks' | 'all';
  }>
) {
  return useMutation({
    mutationFn: externalSeoService.analyzeCompetitors,
    onError: (error) => {
      toast.error(`Competitor analysis failed: ${error.message}`);
    },
    ...options,
  });
}

export function useGoogleTrends(
  options?: UseMutationOptions<ApiResponse<{
    trends: Array<{
      keyword: string;
      interest_over_time: Array<{ date: string; value: number }>;
      related_queries: string[];
      seasonal_patterns: Record<string, number>;
    }>;
  }>, Error, {
    keywords: string[];
    timeframe: '7d' | '30d' | '90d' | '12m' | '5y';
    region: string;
  }>
) {
  return useMutation({
    mutationFn: externalSeoService.getTrends,
    onError: (error) => {
      toast.error(`Failed to fetch trends data: ${error.message}`);
    },
    ...options,
  });
}

export function useSEOSources(
  options?: UseQueryOptions<ApiResponse<{
    sources: Array<{
      name: string;
      features: string[];
      rate_limits: Record<string, number>;
      status: 'active' | 'inactive' | 'limited';
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.seoSources,
    queryFn: externalSeoService.getSources,
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
}

// ==================== ADVANCED ANALYTICS HOOKS ====================

export function useAdvancedPerformanceMetrics(
  options?: UseMutationOptions<ApiResponse<{
    metrics: Record<string, {
      traffic: { sessions: number; users: number; pageviews: number };
      engagement: { bounce_rate: number; time_on_page: number; pages_per_session: number };
      conversions: { rate: number; value: number; count: number };
      seo: { rankings: Record<string, number>; clicks: number; impressions: number };
    }>;
  }>, Error, {
    content_ids: string[];
    metrics: ('traffic' | 'engagement' | 'conversions' | 'seo')[];
    date_range: { start: string; end: string };
  }>
) {
  return useMutation({
    mutationFn: advancedAnalyticsService.getPerformanceMetrics,
    onError: (error) => {
      toast.error(`Failed to fetch performance metrics: ${error.message}`);
    },
    ...options,
  });
}

export function useActionableInsights(
  options?: UseMutationOptions<ApiResponse<{
    insights: Array<{
      type: 'opportunity' | 'warning' | 'success';
      category: string;
      title: string;
      description: string;
      impact_score: number;
      effort_required: 'low' | 'medium' | 'high';
      actions: string[];
    }>;
  }>, Error, {
    project_id: string;
    analysis_depth: 'basic' | 'detailed' | 'comprehensive';
    focus_areas: ('content' | 'seo' | 'performance' | 'trends')[];
  }>
) {
  return useMutation({
    mutationFn: advancedAnalyticsService.getInsights,
    onError: (error) => {
      toast.error(`Failed to generate insights: ${error.message}`);
    },
    ...options,
  });
}

export function useTrendAnalysis(
  options?: UseMutationOptions<ApiResponse<{
    analysis: {
      trend_direction: 'up' | 'down' | 'stable';
      growth_rate: number;
      seasonality: Record<string, number>;
      anomalies: Array<{ date: string; severity: number }>;
      forecast?: Array<{ date: string; predicted_value: number; confidence: number }>;
    };
  }>, Error, {
    data_points: Array<{ date: string; value: number; category: string }>;
    analysis_type: 'seasonal' | 'growth' | 'anomaly' | 'forecast';
    prediction_period?: number;
  }>
) {
  return useMutation({
    mutationFn: advancedAnalyticsService.analyzeTrends,
    onError: (error) => {
      toast.error(`Trend analysis failed: ${error.message}`);
    },
    ...options,
  });
}

export function useRealTimeMetrics(
  options?: UseQueryOptions<ApiResponse<{
    current_users: number;
    active_workflows: number;
    processing_queue: number;
    system_performance: {
      cpu_usage: number;
      memory_usage: number;
      response_time: number;
    };
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.realTimeMetrics,
    queryFn: advancedAnalyticsService.getRealTimeMetrics,
    refetchInterval: 10000, // 10 seconds for real-time data
    ...options,
  });
}

// ==================== A/B TESTING HOOKS ====================

export function useCreateABTest(
  options?: UseMutationOptions<ApiResponse<{ test_id: string; variants: string[] }>, Error, {
    name: string;
    content_ids: string[];
    test_type: 'content' | 'seo' | 'layout' | 'cta';
    traffic_split: number[];
    duration_days: number;
    success_metrics: string[];
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: abTestingService.createTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.abTesting });
      toast.success('A/B test created successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to create A/B test: ${error.message}`);
    },
    ...options,
  });
}

export function useStartABTest(
  options?: UseMutationOptions<ApiResponse<{ started: boolean; start_time: string }>, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: abTestingService.startTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.abTesting });
      toast.success('A/B test started!');
    },
    onError: (error) => {
      toast.error(`Failed to start A/B test: ${error.message}`);
    },
    ...options,
  });
}

export function useStopABTest(
  options?: UseMutationOptions<ApiResponse<{ stopped: boolean; final_results: Record<string, unknown> }>, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: abTestingService.stopTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.abTesting });
      toast.success('A/B test stopped');
    },
    onError: (error) => {
      toast.error(`Failed to stop A/B test: ${error.message}`);
    },
    ...options,
  });
}

export function useABTestStatus(
  testId: string,
  options?: UseQueryOptions<ApiResponse<{
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
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.testStatus(testId),
    queryFn: () => abTestingService.getTestStatus(testId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === 'running') {
        return 30000; // 30 seconds for running tests
      }
      return false;
    },
    enabled: !!testId,
    ...options,
  });
}

export function useABTestResults(
  testId: string,
  options?: UseQueryOptions<ApiResponse<{
    test_id: string;
    statistical_significance: number;
    winner: string | null;
    results: Record<string, {
      conversions: number;
      conversion_rate: number;
      confidence_interval: [number, number];
      improvement: number;
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.testResults(testId),
    queryFn: () => abTestingService.getResults(testId),
    enabled: !!testId,
    ...options,
  });
}

export function useGenerateVariants(
  options?: UseMutationOptions<ApiResponse<{ variants: Array<{ id: string; changes: Record<string, unknown> }> }>, Error, {
    base_content_id: string;
    variant_count: number;
    variation_type: 'title' | 'meta' | 'content' | 'cta' | 'all';
    creativity_level: 'conservative' | 'moderate' | 'creative';
  }>
) {
  return useMutation({
    mutationFn: abTestingService.generateVariants,
    onSuccess: () => {
      toast.success('Variants generated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to generate variants: ${error.message}`);
    },
    ...options,
  });
}

// ==================== COST OPTIMIZATION HOOKS ====================

export function useTrackUsage(
  options?: UseMutationOptions<ApiResponse<{ tracked: boolean; current_cost: number }>, Error, {
    service: string;
    operation: string;
    tokens_used?: number;
    api_calls?: number;
    processing_time?: number;
    metadata?: Record<string, unknown>;
  }>
) {
  return useMutation({
    mutationFn: costOptimizationService.trackUsage,
    onError: (error) => {
      console.error('Usage tracking failed:', error.message);
    },
    ...options,
  });
}

export function useOptimizePrompt(
  options?: UseMutationOptions<ApiResponse<{
    optimized_prompt: string;
    token_reduction: number;
    estimated_savings: number;
    quality_score: number;
  }>, Error, {
    original_prompt: string;
    target_reduction: number;
    preserve_quality: boolean;
  }>
) {
  return useMutation({
    mutationFn: costOptimizationService.optimizePrompt,
    onSuccess: () => {
      toast.success('Prompt optimized for cost efficiency!');
    },
    onError: (error) => {
      toast.error(`Prompt optimization failed: ${error.message}`);
    },
    ...options,
  });
}

export function useCostAnalytics(
  params?: {
    period: 'daily' | 'weekly' | 'monthly';
    start_date?: string;
    end_date?: string;
  },
  options?: UseQueryOptions<ApiResponse<{
    total_cost: number;
    cost_breakdown: Record<string, number>;
    usage_trends: Array<{ date: string; cost: number; usage: number }>;
    optimization_opportunities: Array<{
      area: string;
      potential_savings: number;
      effort_required: string;
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.costAnalytics(params),
    queryFn: () => costOptimizationService.getAnalytics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useCostRecommendations(
  options?: UseQueryOptions<ApiResponse<{
    recommendations: Array<{
      type: 'cost_reduction' | 'efficiency' | 'quality';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      estimated_impact: string;
      implementation_effort: string;
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: [...queryKeys.costOptimization, 'recommendations'],
    queryFn: costOptimizationService.getRecommendations,
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

export function useBudgetStatus(
  options?: UseQueryOptions<ApiResponse<{
    current_spend: number;
    monthly_budget: number;
    daily_average: number;
    projected_monthly: number;
    alerts: Array<{
      type: 'warning' | 'critical';
      message: string;
      threshold: number;
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.budgetStatus,
    queryFn: costOptimizationService.getBudgetStatus,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useConfigureBudget(
  options?: UseMutationOptions<ApiResponse<{ configured: boolean; settings: Record<string, unknown> }>, Error, {
    monthly_limit: number;
    daily_limit?: number;
    alert_thresholds: number[];
    auto_stop_at_limit: boolean;
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: costOptimizationService.configureBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetStatus });
      toast.success('Budget configuration updated!');
    },
    onError: (error) => {
      toast.error(`Failed to configure budget: ${error.message}`);
    },
    ...options,
  });
}

// ==================== PERFORMANCE OPTIMIZATION HOOKS ====================

export function useSystemHealth(
  options?: UseQueryOptions<ApiResponse<{
    status: 'healthy' | 'degraded' | 'critical';
    response_time: number;
    throughput: number;
    error_rate: number;
    bottlenecks: string[];
  }>, Error>
) {
  return useQuery({
    queryKey: [...queryKeys.optimization, 'health'],
    queryFn: optimizationService.getHealth,
    refetchInterval: 30000, // 30 seconds
    ...options,
  });
}

export function usePerformanceInsights(
  options?: UseQueryOptions<ApiResponse<{
    insights: Array<{
      category: 'performance' | 'reliability' | 'cost';
      severity: 'info' | 'warning' | 'critical';
      message: string;
      recommendation: string;
    }>;
  }>, Error>
) {
  return useQuery({
    queryKey: [...queryKeys.optimization, 'insights'],
    queryFn: optimizationService.getInsights,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

export function useCacheStats(
  options?: UseQueryOptions<ApiResponse<{
    hit_rate: number;
    miss_rate: number;
    total_requests: number;
    cache_size: number;
    memory_usage: number;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.cacheStats,
    queryFn: optimizationService.getCacheStats,
    refetchInterval: 60000, // 1 minute
    ...options,
  });
}

export function useClearCache(
  options?: UseMutationOptions<ApiResponse<{ cleared: boolean; count: number }>, Error, { keys?: string[]; pattern?: string } | undefined>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => optimizationService.clearCache(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cacheStats });
      toast.success('Cache cleared successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to clear cache: ${error.message}`);
    },
    ...options,
  });
}

export function useWarmupCache(
  options?: UseMutationOptions<ApiResponse<{ warmed: boolean; count: number }>, Error, { endpoints: string[]; priority: 'high' | 'normal' | 'low' }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: optimizationService.warmupCache,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cacheStats });
      toast.success('Cache warmup completed!');
    },
    onError: (error) => {
      toast.error(`Cache warmup failed: ${error.message}`);
    },
    ...options,
  });
}

export function useRateLimitStatus(
  options?: UseQueryOptions<ApiResponse<{
    current_usage: Record<string, number>;
    limits: Record<string, number>;
    reset_times: Record<string, string>;
  }>, Error>
) {
  return useQuery({
    queryKey: queryKeys.rateLimitStatus,
    queryFn: optimizationService.getRateLimitStatus,
    refetchInterval: 60000, // 1 minute
    ...options,
  });
}