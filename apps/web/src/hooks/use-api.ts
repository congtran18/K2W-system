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