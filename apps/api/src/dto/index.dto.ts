/**
 * Data Transfer Objects (DTOs)
 * Request/Response DTOs for API validation
 */

// External SEO DTOs
export class KeywordResearchDto {
  seed_keywords!: string[];
  target_country?: string = 'US';
  include_competitors?: boolean = true;
  language?: string = 'en';
  search_engine?: 'google' | 'bing' | 'yahoo' = 'google';
}

export class KeywordSuggestionsDto {
  topic!: string;
  limit?: number = 50;
  country?: string = 'US';
  language?: string = 'en';
}

export class CompetitorAnalysisDto {
  keywords!: string[];
  competitor_domains?: string[] = [];
  analysis_depth?: 'basic' | 'detailed' | 'comprehensive' = 'basic';
}

export class TrendsAnalysisDto {
  keywords!: string[];
  timeframe?: string = '12m';
  geo?: string = 'US';
  category?: string;
}

// Analytics DTOs
export class AnalyticsRequestDto {
  content_id?: string = 'all';
  date_range?: string = '30d';
  metrics?: string[] = ['all'];
  include_trends?: boolean = true;
  include_insights?: boolean = true;
}

export class PerformanceMetricsDto {
  content_ids!: string[];
  metrics_to_include?: string[] = ['all'];
  period?: string = '30d';
}

export class TrendAnalysisDto {
  metric!: string;
  period!: string;
  content_ids?: string[];
}

export class AlertsDto {
  severity?: string;
  status?: string = 'active';
  content_id?: string;
  alert_type?: string;
}

// A/B Testing DTOs
export class CreateTestDto {
  content_id!: string;
  test_name!: string;
  test_type!: 'simple' | 'multivariate' | 'champion_challenger';
  hypothesis!: string;
  primary_metric!: string;
  secondary_metrics?: string[] = [];
  minimum_sample_size?: number = 1000;
  confidence_level?: number = 95;
  max_test_duration_days?: number = 14;
  variants!: any[]; // Will be validated separately
}

export class GenerateVariantsDto {
  content_id!: string;
  variant_types!: Array<'title' | 'meta_description' | 'cta' | 'content'>;
  number_of_variants?: number = 2;
}

export class BatchOptimizationDto {
  content_ids!: string[];
  test_config!: {
    variant_types: Array<'title' | 'meta_description' | 'cta'>;
    test_duration_days: number;
    primary_metric: string;
  };
}

// Cost Optimization DTOs
export class TrackUsageDto {
  endpoint!: string;
  prompt_tokens!: number;
  completion_tokens!: number;
  model?: string = 'gpt-4';
}

export class OptimizePromptDto {
  prompt!: string;
  target_reduction?: number = 20;
}

export class BatchProcessDto {
  items!: any[];
  batch_size?: number = 10;
  delay_ms?: number = 1000;
}

export class CostAnalyticsDto {
  period?: 'daily' | 'weekly' | 'monthly' = 'monthly';
  include_projections?: boolean = true;
  include_recommendations?: boolean = true;
}

export class BudgetConfigDto {
  monthly_budget_usd!: number;
  daily_budget_usd!: number;
  alert_thresholds?: {
    daily_percentage: number;
    monthly_percentage: number;
    token_cost_per_request: number;
  };
  auto_throttling?: {
    enabled: boolean;
    throttle_at_percentage: number;
    stop_at_percentage: number;
  };
}

// Common DTOs
export class PaginationDto {
  page?: number = 1;
  limit?: number = 20;
  sort_by?: string = 'created_at';
  sort_order?: 'asc' | 'desc' = 'desc';
}

export class DateRangeDto {
  start_date!: string; // ISO date string
  end_date!: string; // ISO date string
}

export class SearchDto {
  query?: string;
  filters?: Record<string, any>;
  include_archived?: boolean = false;
}

// Validation decorators (for future use with class-validator)
export const IsRequired = (target: any, propertyKey: string) => {
  // Placeholder for validation decorator
};

export const IsOptional = (target: any, propertyKey: string) => {
  // Placeholder for validation decorator
};

export const IsEmail = (target: any, propertyKey: string) => {
  // Placeholder for email validation decorator
};

export const IsUrl = (target: any, propertyKey: string) => {
  // Placeholder for URL validation decorator
};

export const IsUUID = (target: any, propertyKey: string) => {
  // Placeholder for UUID validation decorator
};

export const Min = (min: number) => (target: any, propertyKey: string) => {
  // Placeholder for min value validation decorator
};

export const Max = (max: number) => (target: any, propertyKey: string) => {
  // Placeholder for max value validation decorator
};

export const IsArray = (target: any, propertyKey: string) => {
  // Placeholder for array validation decorator
};

export const IsString = (target: any, propertyKey: string) => {
  // Placeholder for string validation decorator
};

export const IsNumber = (target: any, propertyKey: string) => {
  // Placeholder for number validation decorator
};

export const IsBoolean = (target: any, propertyKey: string) => {
  // Placeholder for boolean validation decorator
};