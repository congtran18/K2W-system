/**
 * A/B Testing Types
 * Type definitions for A/B testing framework
 */

export interface ABTestVariant {
  id: string;
  name: string;
  content_id: string;
  variant_type: 'title' | 'meta_description' | 'content' | 'cta' | 'images' | 'full_page';
  changes: VariantChanges;
  traffic_allocation: number; // Percentage of traffic (0-100)
  status: 'draft' | 'running' | 'paused' | 'completed' | 'winner';
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface VariantChanges {
  title?: string;
  meta_title?: string;
  meta_description?: string;
  body_html?: string;
  cta?: string;
  images?: string[];
  headings?: Array<{ level: number; text: string }>;
}

export interface ABTestConfig {
  test_id: string;
  content_id: string;
  test_name: string;
  test_type: 'simple' | 'multivariate' | 'champion_challenger';
  hypothesis: string;
  primary_metric: 'ctr' | 'conversion_rate' | 'bounce_rate' | 'time_on_page' | 'revenue';
  secondary_metrics: string[];
  minimum_sample_size: number;
  confidence_level: number; // 90, 95, or 99
  max_test_duration_days: number;
  variants: ABTestVariant[];
  status: 'setup' | 'running' | 'analyzing' | 'completed';
  created_by: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface ABTestResults {
  test_id: string;
  test_name: string;
  status: 'running' | 'completed' | 'inconclusive';
  duration_days: number;
  total_visitors: number;
  statistical_significance: boolean;
  confidence_level: number;
  primary_metric_results: PrimaryMetricResults;
  secondary_metrics: SecondaryMetricResult[];
  recommendations: string[];
  created_at: string;
  completed_at?: string;
}

export interface PrimaryMetricResults {
  metric_name: string;
  control_value: number;
  variants: VariantResult[];
  winner: WinnerResult | null;
}

export interface VariantResult {
  variant_id: string;
  variant_name: string;
  value: number;
  lift: number; // Percentage improvement over control
  p_value: number;
  is_significant: boolean;
}

export interface WinnerResult {
  variant_id: string;
  variant_name: string;
  improvement: number;
}

export interface SecondaryMetricResult {
  metric_name: string;
  control_value: number;
  variants: Array<{
    variant_id: string;
    value: number;
    lift: number;
  }>;
}

export interface TestMetrics {
  visitors: number;
  conversions: number;
  conversion_rate: number;
  ctr: number;
  bounce_rate: number;
  avg_time_on_page: number;
  revenue: number;
  engagement_score: number;
}

export interface CreateTestRequest {
  content_id: string;
  test_name: string;
  test_type: 'simple' | 'multivariate' | 'champion_challenger';
  hypothesis: string;
  primary_metric: string;
  secondary_metrics?: string[];
  minimum_sample_size?: number;
  confidence_level?: number;
  max_test_duration_days?: number;
  variants: ABTestVariant[];
}

export interface GenerateVariantsRequest {
  content_id: string;
  variant_types: Array<'title' | 'meta_description' | 'cta' | 'content'>;
  number_of_variants?: number;
}

export interface BatchOptimizationRequest {
  content_ids: string[];
  test_config: {
    variant_types: Array<'title' | 'meta_description' | 'cta'>;
    test_duration_days: number;
    primary_metric: string;
  };
}