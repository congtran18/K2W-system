/**
 * Dashboard and Analytics Types
 * Type definitions for dashboard components, metrics, and analytics
 */

// Metric Card Types
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  loading?: boolean;
}

// Quick Stats Types
export interface QuickStatsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export interface DashboardStats {
  total_keywords: number;
  active_projects: number;
  content_generated: number;
  total_traffic: number;
  conversion_rate: number;
  avg_ranking: number;
}

// Keywords Types
export interface Keyword {
  id: string;
  keyword: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  search_volume: number;
  difficulty: number;
  position?: number;
  created_at: string;
}

export interface KeywordListProps {
  keywords: Keyword[];
  loading?: boolean;
  onStatusChange?: (keywordId: string, status: string) => void;
}

export interface KeywordStatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  size?: 'sm' | 'md' | 'lg';
}

// Recent Activity Types
export interface RecentKeywordsProps {
  keywords: Keyword[];
  limit?: number;
  loading?: boolean;
}

export interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'keyword_added' | 'content_generated' | 'content_published' | 'rank_change';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// System Status Types
export interface SystemStatusProps {
  status: SystemHealthData;
  loading?: boolean;
}

export interface SystemHealthData {
  overall_status: 'healthy' | 'warning' | 'critical';
  api_status: 'online' | 'offline' | 'degraded';
  database_status: 'connected' | 'disconnected' | 'slow';
  queue_status: 'running' | 'paused' | 'error';
  storage_usage: number;
  memory_usage: number;
  active_users: number;
  response_time: number;
}

export interface HealthStatusCardProps {
  title: string;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
  lastChecked: string;
  isLoading?: boolean;
  isHealthy?: boolean;
  icon?: React.ReactNode;
  uptime?: number;
  additionalInfo?: string;
}

// Performance Types
export interface SystemPerformanceProps {
  metrics: PerformanceMetrics;
  timeRange: '1h' | '24h' | '7d' | '30d';
  loading?: boolean;
}

export interface PerformanceMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: number;
  response_times: Array<{
    timestamp: string;
    value: number;
  }>;
  error_rates: Array<{
    timestamp: string;
    value: number;
  }>;
}

// Budget and Cost Types
export interface BudgetOverviewProps {
  budget: BudgetData;
  loading?: boolean;
}

export interface BudgetData {
  monthly_budget: number;
  current_spend: number;
  projected_spend: number;
  cost_per_keyword: number;
  cost_per_content: number;
  savings: number;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

// Insights Panel Types
export interface InsightsPanelProps {
  insights: DashboardInsight[];
  loading?: boolean;
}

export interface DashboardInsight {
  id: string;
  type: 'optimization' | 'alert' | 'recommendation' | 'achievement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: {
    label: string;
    url: string;
  };
  created_at: string;
}

// Form Types
export interface KeywordFormData {
  keywords: string;
  language: string;
  region: string;
}

export interface KeywordSubmissionFormProps {
  onSubmit: (data: KeywordFormData) => void;
  loading?: boolean;
}