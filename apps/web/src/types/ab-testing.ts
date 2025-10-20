/**
 * A/B Testing Types
 * Type definitions for A/B testing functionality
 */

export interface ABTestVariantResult {
  conversions: number;
  conversion_rate: number;
  confidence_interval: [number, number];
  improvement: number;
  visitors?: number;
  revenue?: number;
}

export interface ABTestResults {
  test_id: string;
  results: Record<string, ABTestVariantResult>;
  statistical_significance: number;
  winner?: string | null;
  confidence_level?: number;
  sample_size?: number;
  duration_days?: number;
}

export interface ABTestVariant {
  id: string;
  name: string;
  traffic_percentage: number;
  visitors: number;
  conversions: number;
  changes: Record<string, unknown>;
}

export interface ABTestData {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'stopped';
  progress: number;
  variants: ABTestVariant[];
}

export interface GeneratedVariant {
  id: string;
  changes: Record<string, unknown>;
}

export interface ABTestFormData {
  name: string;
  content_ids: string[];
  test_type: 'content' | 'seo' | 'layout' | 'cta';
  traffic_split: number[];
  duration_days: number;
  success_metrics: string[];
}

export interface TestDetailsProps {
  testId: string;
}

// API Response Types
export interface ABTestApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export type CreateABTestRequest = ABTestFormData;

export interface GenerateVariantsRequest {
  base_content_id: string;
  variant_count: number;
  variation_type: 'title' | 'content' | 'meta' | 'all';
  creativity_level: 'conservative' | 'moderate' | 'creative';
}

export interface GenerateVariantsResponse {
  variants: GeneratedVariant[];
  base_content_id: string;
  generation_metadata: {
    model_used: string;
    generation_time: string;
    creativity_level: string;
  };
}