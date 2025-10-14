/**
 * Cost Optimization Types
 * Type definitions for cost optimization service
 */

export interface CostMetrics {
  period: string; // ISO date string
  openai_tokens: OpenAITokenMetrics;
  google_apis: GoogleAPIMetrics;
  external_apis: ExternalAPIMetrics;
  infrastructure: InfrastructureMetrics;
  total_cost_usd: number;
  content_pieces_generated: number;
  cost_per_content_piece: number;
  roi_estimate: number; // Revenue generated vs costs
}

export interface OpenAITokenMetrics {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface GoogleAPIMetrics {
  search_console_requests: number;
  analytics_requests: number;
  trends_requests: number;
  cost_usd: number;
}

export interface ExternalAPIMetrics {
  ahrefs_requests: number;
  semrush_requests: number;
  cost_usd: number;
}

export interface InfrastructureMetrics {
  compute_hours: number;
  storage_gb: number;
  bandwidth_gb: number;
  cost_usd: number;
}

export interface CostAlert {
  id: string;
  type: 'threshold_exceeded' | 'unusual_spending' | 'budget_limit' | 'optimization_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  current_value: number;
  threshold_value: number;
  suggested_actions: string[];
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
}

export interface OptimizationRecommendation {
  id: string;
  category: 'token_usage' | 'api_efficiency' | 'caching' | 'batch_processing' | 'infrastructure';
  title: string;
  description: string;
  estimated_savings_usd: number;
  estimated_savings_percentage: number;
  implementation_effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation_steps: string[];
  expected_impact: string;
  created_at: string;
  implemented: boolean;
  implemented_at?: string;
}

export interface BudgetConfig {
  monthly_budget_usd: number;
  daily_budget_usd: number;
  alert_thresholds: AlertThresholds;
  auto_throttling: AutoThrottlingConfig;
}

export interface AlertThresholds {
  daily_percentage: number; // Alert when daily spend exceeds X% of daily budget
  monthly_percentage: number; // Alert when monthly spend exceeds X% of monthly budget
  token_cost_per_request: number; // Alert when token cost per request exceeds threshold
}

export interface AutoThrottlingConfig {
  enabled: boolean;
  throttle_at_percentage: number; // Start throttling at X% of budget
  stop_at_percentage: number; // Stop processing at X% of budget
}

export interface TokenUsagePattern {
  endpoint: string;
  average_prompt_tokens: number;
  average_completion_tokens: number;
  average_cost_per_request: number;
  request_count: number;
  total_cost: number;
  efficiency_score: number; // 0-100, higher is better
  optimization_potential: number; // Estimated savings in USD
}

export interface TrackUsageRequest {
  endpoint: string;
  prompt_tokens: number;
  completion_tokens: number;
  model?: string;
}

export interface OptimizePromptRequest {
  prompt: string;
  target_reduction?: number;
}

export interface BatchProcessRequest {
  items: any[];
  batch_size?: number;
  delay_ms?: number;
}

export interface CostAnalyticsRequest {
  period?: 'daily' | 'weekly' | 'monthly';
  include_projections?: boolean;
  include_recommendations?: boolean;
}

export interface BudgetStatusResponse {
  daily: BudgetStatus;
  monthly: BudgetStatus;
  throttling_active: boolean;
  processing_stopped: boolean;
}

export interface BudgetStatus {
  spent: number;
  budget: number;
  remaining: number;
  percentage: number;
}

export interface PromptOptimizationResult {
  optimized_prompt: string;
  original_tokens: number;
  optimized_tokens: number;
  token_reduction: number;
  estimated_savings: number;
}

export interface UsageTrackingResult {
  cost: number;
  should_throttle: boolean;
  should_stop: boolean;
}