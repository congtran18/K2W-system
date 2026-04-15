'use client';

import { Button } from '@k2w/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui';
import { Badge } from '@k2w/ui';
import { TrendingUp, FileText, Clock, BarChart3, Filter, Download, Zap, TestTube, DollarSign, Search, Image as ImageIcon, Globe, Eye, Settings, CheckCircle } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      <Card className="glass-card hover:border-blue-500/30 transition-all duration-300 cursor-pointer overflow-hidden group">
        <Link href="/dashboard/advanced">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-all duration-300">
                <Eye className="w-5 h-5" />
              </div>
              Advanced Dashboard
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-medium">Real-time metrics and AI insights</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">System monitoring</span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">Live</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
 
      <Card className="glass-card hover:border-green-500/30 transition-all duration-300 cursor-pointer overflow-hidden group">
        <Link href="/dashboard/seo-tools">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
              <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400 group-hover:scale-110 transition-all duration-300">
                <Search className="w-5 h-5" />
              </div>
              External SEO Tools
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-medium">Keyword research and competitor analysis</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Research tools</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full">Pro</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
 
      <Card className="glass-card hover:border-purple-500/30 transition-all duration-300 cursor-pointer overflow-hidden group">
        <Link href="/dashboard/ab-testing">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-all duration-300">
                <TestTube className="w-5 h-5" />
              </div>
              A/B Testing
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-medium">Optimize content performance</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Test variants</span>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full">Beta</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
 
      <Card className="glass-card hover:border-yellow-500/30 transition-all duration-300 cursor-pointer overflow-hidden group">
        <Link href="/dashboard/cost-optimization">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
              <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:scale-110 transition-all duration-300">
                <DollarSign className="w-5 h-5" />
              </div>
              Cost Optimization
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-medium">Monitor and reduce spending</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Budget control</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2.5 py-0.5 rounded-full">Smart</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
 
      <Card className="glass-card hover:border-red-500/30 transition-all duration-300 cursor-pointer overflow-hidden group">
        <Link href="/dashboard/content-tools">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-all duration-300">
                <ImageIcon className="w-5 h-5" />
              </div>
              Content Tools
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-medium">Images, translation, publishing</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Enhancement suite</span>
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full">AI</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
 
      <Card className="glass-card hover:border-emerald-500/30 transition-all duration-300 cursor-pointer overflow-hidden group">
        <Link href="/dashboard/approval">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-all duration-300">
                <CheckCircle className="w-5 h-5" />
              </div>
              Editorial Approval
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-medium">Review drafts, edit, and publish to Webflow</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Editorial quality workflow</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">New</Badge>
            </div>
          </CardContent>
        </Link>
      </Card>
 
      <Card className="glass-card hover:border-indigo-500/30 transition-all duration-300 cursor-pointer overflow-hidden group">
        <Link href="/dashboard/multi-site">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-all duration-300">
                <Globe className="w-5 h-5" />
              </div>
              Multi-Site Manager
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 font-medium">Manage multiple websites</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Scale operations</span>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">Enterprise</Badge>
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
    <Card className="glass-card glow-indigo border-violet-500/15 mb-8">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="flex items-center gap-2.5 text-base font-extrabold text-foreground">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 animate-pulse">
            <Zap className="w-4 h-4" />
          </div>
          Live System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {realTimeData?.data && (
            <>
              <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
                <div className="text-3xl font-extrabold text-emerald-500 group-hover:scale-105 transition-all duration-200">{realTimeData.data.current_users}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1.5">Active Users</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500" />
                <div className="text-3xl font-extrabold text-sky-500 group-hover:scale-105 transition-all duration-200">{realTimeData.data.active_workflows}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1.5">Running Workflows</div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500" />
                <div className="text-3xl font-extrabold text-orange-500 group-hover:scale-105 transition-all duration-200">{realTimeData.data.processing_queue}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1.5">Queue Length</div>
              </div>
            </>
          )}
          {budgetData?.data && (
            <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-violet-500" />
              <div className="text-3xl font-extrabold text-violet-400 group-hover:scale-105 transition-all duration-200">${budgetData.data.current_spend.toFixed(0)}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1.5">Monthly Spend</div>
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
      <PageHeader 
        title="K2W Dashboard"
        description="Monitor your content generation performance and explore advanced features"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="rounded-xl border-border/80 hover:bg-secondary/40 text-xs font-semibold">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl border-border/80 hover:bg-secondary/40 text-xs font-semibold">
              <Download className="h-4 w-4 mr-2 text-muted-foreground" />
              Export
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-md shadow-violet-500/10 text-xs font-semibold" asChild>
              <Link href="/dashboard/advanced">
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </Link>
            </Button>
          </div>
        }
      />
 
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
