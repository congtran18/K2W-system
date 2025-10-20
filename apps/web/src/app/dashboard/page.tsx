'use client';

import { Button } from '@k2w/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui';
import { Badge } from '@k2w/ui';
import { TrendingUp, FileText, Clock, BarChart3, Filter, Download, Zap, TestTube, DollarSign, Search, Image as ImageIcon, Globe, Eye, Settings } from 'lucide-react';
import Link from 'next/link';

// Import React Query hooks
import { useKeywordHistory, useAnalytics, useRealTimeMetrics, useBudgetStatus } from '../../hooks/use-api';

// Import components
import { 
  PageHeader,
  DashboardMetricCard,
  RecentKeywords,
  QuickStats 
} from '../../components';

function AdvancedFeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <Link href="/dashboard/advanced">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-blue-500" />
              Advanced Dashboard
            </CardTitle>
            <CardDescription>Real-time metrics and AI insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">System monitoring</span>
              <Badge variant="secondary">Live</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <Link href="/dashboard/seo-tools">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5 text-green-500" />
              External SEO Tools
            </CardTitle>
            <CardDescription>Keyword research and competitor analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Research tools</span>
              <Badge variant="outline">Pro</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <Link href="/dashboard/ab-testing">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TestTube className="w-5 h-5 text-purple-500" />
              A/B Testing
            </CardTitle>
            <CardDescription>Optimize content performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Test variants</span>
              <Badge variant="secondary">Beta</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <Link href="/dashboard/cost-optimization">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Cost Optimization
            </CardTitle>
            <CardDescription>Monitor and reduce spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Budget control</span>
              <Badge variant="outline">Smart</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <Link href="/dashboard/content-tools">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="w-5 h-5 text-red-500" />
              Content Tools
            </CardTitle>
            <CardDescription>Images, translation, publishing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enhancement suite</span>
              <Badge variant="secondary">AI</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <Link href="/multi-site">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-indigo-500" />
              Multi-Site Manager
            </CardTitle>
            <CardDescription>Manage multiple websites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Scale operations</span>
              <Badge variant="default">Enterprise</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}

function LiveMetrics() {
  const { data: realTimeData } = useRealTimeMetrics();
  const { data: budgetData } = useBudgetStatus();

  if (!realTimeData?.data && !budgetData?.data) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Live System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {realTimeData?.data && (
            <>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeData.data.current_users}</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeData.data.active_workflows}</div>
                <div className="text-xs text-muted-foreground">Running Workflows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{realTimeData.data.processing_queue}</div>
                <div className="text-xs text-muted-foreground">Queue Length</div>
              </div>
            </>
          )}
          {budgetData?.data && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${budgetData.data.current_spend.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Monthly Spend</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  // React Query hooks for real-time data
  const { data: keywordHistoryData, isLoading: keywordLoading } = useKeywordHistory({ 
    page: 1, 
    limit: 10 
  });
  const { isLoading: analyticsLoading } = useAnalytics({
    granularity: 'daily'
  });

  const recentKeywords = keywordHistoryData?.data?.keywords || [];
  const totalKeywords = keywordHistoryData?.data?.total || 0;
  const completedKeywords = recentKeywords.filter(k => k.status === 'COMPLETED').length;
  const processingKeywords = recentKeywords.filter(k => !['COMPLETED', 'FAILED'].includes(k.status)).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader 
          title="K2W Dashboard"
          description="Monitor your content generation performance and explore advanced features"
        />
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/advanced">
              <Settings className="h-4 w-4 mr-2" />
              Advanced
            </Link>
          </Button>
        </div>
      </div>

      {/* Live Metrics */}
      <LiveMetrics />

      {/* Advanced Features Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Advanced Features</h2>
        <AdvancedFeaturesGrid />
      </div>

      {/* Key Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Core Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardMetricCard
            title="Total Keywords"
            value={totalKeywords}
            description="All time submissions"
            icon={<FileText className="h-4 w-4 mr-2" />}
            isLoading={keywordLoading}
            color="text-blue-600"
          />

          <DashboardMetricCard
            title="Generated Content"
            value={completedKeywords}
            description="Successfully completed"
            icon={<TrendingUp className="h-4 w-4 mr-2" />}
            isLoading={keywordLoading}
            color="text-green-600"
          />

          <DashboardMetricCard
            title="Processing"
            value={processingKeywords}
            description="Currently in progress"
            icon={<Clock className="h-4 w-4 mr-2" />}
            isLoading={keywordLoading}
            color="text-orange-600"
          />

          <DashboardMetricCard
            title="Success Rate"
            value={`${totalKeywords > 0 ? Math.round((completedKeywords / totalKeywords) * 100) : 0}%`}
            description="Completion rate"
            icon={<BarChart3 className="h-4 w-4 mr-2" />}
            isLoading={keywordLoading}
            color="text-purple-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <RecentKeywords 
          keywords={recentKeywords}
          isLoading={keywordLoading}
        />

        {/* Quick Stats */}
        <QuickStats 
          isLoading={analyticsLoading}
        />
      </div>
    </div>
  );
}
