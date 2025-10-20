'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui';
import { Button } from '@k2w/ui';
import { Badge } from '@k2w/ui';
import { Progress } from '@k2w/ui';
import { Separator } from '@k2w/ui';
import { Alert, AlertDescription } from '@k2w/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Target,
  Cpu,
  HardDrive,
  Timer
} from 'lucide-react';
import {
  useRealTimeMetrics,
  useBudgetStatus,
  useSystemHealth,
  useCacheStats,
  usePerformanceInsights,
  useCostRecommendations,
  useActionableInsights
} from '@/hooks/use-api';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ title, value, change, icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`text-xs flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface SystemStatusProps {
  status: 'healthy' | 'degraded' | 'critical';
  metrics: {
    response_time: number;
    throughput: number;
    error_rate: number;
    bottlenecks: string[];
  };
}

function SystemStatus({ status, metrics }: SystemStatusProps) {
  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    critical: 'bg-red-500'
  };

  const statusIcons = {
    healthy: <CheckCircle className="w-4 h-4" />,
    degraded: <AlertTriangle className="w-4 h-4" />,
    critical: <AlertTriangle className="w-4 h-4" />
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
          System Health
          {statusIcons[status]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Response Time</div>
            <div className="text-lg font-semibold">{metrics.response_time}ms</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Throughput</div>
            <div className="text-lg font-semibold">{metrics.throughput}/min</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Error Rate</div>
            <div className="text-lg font-semibold">{(metrics.error_rate * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Bottlenecks</div>
            <div className="text-lg font-semibold">{metrics.bottlenecks.length}</div>
          </div>
        </div>
        
        {metrics.bottlenecks.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Current Bottlenecks:</div>
            <div className="space-y-1">
              {metrics.bottlenecks.map((bottleneck, index) => (
                <Badge key={index} variant="destructive" className="mr-1">
                  {bottleneck}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BudgetOverviewProps {
  budgetData: {
    current_spend: number;
    monthly_budget: number;
    daily_average: number;
    projected_monthly: number;
    alerts: Array<{
      type: 'warning' | 'critical';
      message: string;
      threshold: number;
    }>;
  };
}

function BudgetOverview({ budgetData }: BudgetOverviewProps) {
  const spendPercentage = (budgetData.current_spend / budgetData.monthly_budget) * 100;
  const projectionPercentage = (budgetData.projected_monthly / budgetData.monthly_budget) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Spend</span>
            <span>${budgetData.current_spend.toFixed(2)} / ${budgetData.monthly_budget.toFixed(2)}</span>
          </div>
          <Progress value={spendPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {spendPercentage.toFixed(1)}% of monthly budget used
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Daily Average</div>
            <div className="font-semibold">${budgetData.daily_average.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Projected Month</div>
            <div className={`font-semibold ${projectionPercentage > 100 ? 'text-red-600' : 'text-green-600'}`}>
              ${budgetData.projected_monthly.toFixed(2)}
            </div>
          </div>
        </div>

        {budgetData.alerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Budget Alerts</div>
            {budgetData.alerts.map((alert, index) => (
              <Alert key={index} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InsightsPanelProps {
  insights: Array<{
    type: 'opportunity' | 'warning' | 'success';
    category: string;
    title: string;
    description: string;
    impact_score: number;
    effort_required: 'low' | 'medium' | 'high';
    actions: string[];
  }>;
}

function InsightsPanel({ insights }: InsightsPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Actionable Insights
        </CardTitle>
        <CardDescription>
          AI-powered recommendations for optimization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {insights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-medium">{insight.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getEffortColor(insight.effort_required)}>
                    {insight.effort_required} effort
                  </Badge>
                  <Badge variant="secondary">
                    Impact: {insight.impact_score}/10
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              
              {insight.actions.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Recommended Actions:</div>
                  <ul className="text-xs space-y-1">
                    {insight.actions.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start gap-1">
                        <span className="text-muted-foreground">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdvancedDashboard() {
  const [projectId] = useState('default');
  
  // Real-time data hooks
  const { data: realTimeData } = useRealTimeMetrics();
  const { data: budgetData } = useBudgetStatus();
  const { data: systemHealth } = useSystemHealth();
  const { data: cacheStats } = useCacheStats();
  const { data: performanceInsights } = usePerformanceInsights();
  const { data: costRecommendations } = useCostRecommendations();

  // Advanced insights
  const { mutate: getInsights, data: insightsData, isPending: insightsLoading } = useActionableInsights();

  const handleGetInsights = () => {
    getInsights({
      project_id: projectId,
      analysis_depth: 'comprehensive',
      focus_areas: ['content', 'seo', 'performance', 'trends']
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Advanced Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and system performance monitoring
          </p>
        </div>
        <Button onClick={handleGetInsights} disabled={insightsLoading}>
          {insightsLoading ? 'Analyzing...' : 'Get AI Insights'}
        </Button>
      </div>

      {/* Real-time Metrics */}
      {realTimeData?.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Users"
            value={realTimeData.data.current_users}
            icon={<Users className="w-4 h-4 text-blue-500" />}
            description="Currently online"
          />
          <MetricCard
            title="Active Workflows"
            value={realTimeData.data.active_workflows}
            icon={<Activity className="w-4 h-4 text-green-500" />}
            description="Processing now"
          />
          <MetricCard
            title="Queue Length"
            value={realTimeData.data.processing_queue}
            icon={<Clock className="w-4 h-4 text-orange-500" />}
            description="Jobs waiting"
          />
          <MetricCard
            title="Response Time"
            value={`${realTimeData.data.system_performance.response_time}ms`}
            icon={<Timer className="w-4 h-4 text-purple-500" />}
            description="Average response"
          />
        </div>
      )}

      {/* System Performance */}
      {systemHealth?.data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SystemStatus 
            status={systemHealth.data.status}
            metrics={{
              response_time: systemHealth.data.response_time,
              throughput: systemHealth.data.throughput,
              error_rate: systemHealth.data.error_rate,
              bottlenecks: systemHealth.data.bottlenecks
            }}
          />
          
          {budgetData?.data && (
            <BudgetOverview budgetData={budgetData.data} />
          )}
        </div>
      )}

      {/* Cache & Performance Stats */}
      {cacheStats?.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Cache Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Hit Rate</div>
                <div className="text-lg font-semibold text-green-600">
                  {(cacheStats.data.hit_rate * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Miss Rate</div>
                <div className="text-lg font-semibold text-red-600">
                  {(cacheStats.data.miss_rate * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
                <div className="text-lg font-semibold">{cacheStats.data.total_requests.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Cache Size</div>
                <div className="text-lg font-semibold">{(cacheStats.data.cache_size / 1024 / 1024).toFixed(1)}MB</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Memory Usage</div>
                <div className="text-lg font-semibold">{(cacheStats.data.memory_usage / 1024 / 1024).toFixed(1)}MB</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      {performanceInsights?.data && performanceInsights.data.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceInsights.data.insights.map((insight, index) => (
                <Alert key={index} variant={insight.severity === 'critical' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">{insight.message}</div>
                    <div className="text-sm mt-1">{insight.recommendation}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {insightsData?.data && (
        <InsightsPanel insights={insightsData.data.insights} />
      )}

      {/* Cost Recommendations */}
      {costRecommendations?.data && costRecommendations.data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cost Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {costRecommendations.data.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{rec.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="outline">{rec.type}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex justify-between text-xs">
                    <span><strong>Impact:</strong> {rec.estimated_impact}</span>
                    <span><strong>Effort:</strong> {rec.implementation_effort}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}