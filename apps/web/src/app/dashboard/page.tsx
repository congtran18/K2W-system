'use client';

import { Button } from '@k2w/ui/button';
import { TrendingUp, FileText, Clock, BarChart3, Filter, Download } from 'lucide-react';

// Import React Query hooks
import { useKeywordHistory, useAnalytics } from '../../hooks/use-api';

// Import components
import { 
  PageHeader,
  DashboardMetricCard,
  RecentKeywords,
  QuickStats 
} from '../../components';

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
          description="Monitor your content generation performance and analytics"
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
