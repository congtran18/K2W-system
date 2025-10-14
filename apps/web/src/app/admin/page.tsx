'use client';

import { useState } from 'react';
import { Button } from '@k2w/ui/button';
import { RefreshCw, Activity, Users } from 'lucide-react';
import { toast } from 'sonner';

// Import React Query hooks
import { useHealthCheck, useK2WHealthCheck, useKeywordHistory } from '../../hooks/use-api';

// Import components
import { 
  PageHeader,
  AdminHealthCard, 
  AdminMetricCard,
  RecentActivity,
  SystemPerformance,
  TabNavigation 
} from '../../components';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'costs' | 'apis' | 'monitoring'>('overview');

  // React Query hooks for real-time data
  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useHealthCheck();
  const { data: k2wHealthData, isLoading: k2wHealthLoading, refetch: refetchK2WHealth } = useK2WHealthCheck();
  const { data: keywordHistoryData, isLoading: keywordLoading } = useKeywordHistory({ page: 1, limit: 5 });

  const handleRefreshHealth = () => {
    refetchHealth();
    refetchK2WHealth();
    toast.success('Health status refreshed');
  };

  const adminTabs = [
    { id: 'overview', label: 'System Overview' },
    { id: 'users', label: 'User Management' },
    { id: 'costs', label: 'Cost Tracking' },
    { id: 'apis', label: 'API Configuration' },
    { id: 'monitoring', label: 'Monitoring' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <PageHeader 
        title="K2W Admin Panel"
        description="System monitoring, user management, and configuration"
      />

      {/* Navigation Tabs */}
      <TabNavigation
        activeTab={activeTab}
        tabs={adminTabs}
        onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
      />

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">System Overview</h2>
              <Button onClick={handleRefreshHealth} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Health Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <AdminHealthCard
                title="Main API"
                isLoading={healthLoading}
                isHealthy={healthData?.success || false}
                uptime={typeof healthData?.data?.uptime === 'number' ? healthData.data.uptime : undefined}
              />

              <AdminHealthCard
                title="K2W Service"
                isLoading={k2wHealthLoading}
                isHealthy={k2wHealthData?.success || false}
              />

              <AdminMetricCard
                title="Total Keywords"
                value={keywordHistoryData?.data?.total || 0}
                description="Processed keywords"
                icon={<Users className="h-4 w-4 inline mr-1" />}
                isLoading={keywordLoading}
              />

              <AdminMetricCard
                title="Active Jobs"
                value={keywordHistoryData?.data?.keywords?.filter(k => !['COMPLETED', 'FAILED'].includes(k.status)).length || 0}
                description="In progress"
                icon={<Activity className="h-4 w-4 inline mr-1" />}
                isLoading={keywordLoading}
              />
            </div>

            {/* System Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity 
                keywords={keywordHistoryData?.data?.keywords || []}
                isLoading={keywordLoading}
              />

              <SystemPerformance 
                memoryData={
                  healthData?.data?.memory && typeof healthData.data.memory === 'object' 
                    ? healthData.data.memory as { heapUsed: number; heapTotal: number; external: number }
                    : undefined
                }
              />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <p className="text-gray-600">Manage user accounts and quotas.</p>
          </div>
        )}

        {activeTab === 'costs' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Cost Tracking</h2>
            <p className="text-gray-600">Monitor API costs and usage.</p>
          </div>
        )}

        {activeTab === 'apis' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <p className="text-gray-600">Configure API keys and settings.</p>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">System Monitoring</h2>
            <p className="text-gray-600">View system health and performance metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}