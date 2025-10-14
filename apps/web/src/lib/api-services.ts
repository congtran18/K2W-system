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