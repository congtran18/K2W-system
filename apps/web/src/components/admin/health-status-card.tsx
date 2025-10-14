/**
 * Health Status Card Component
 * Shows system health status with real-time updates
 */

import { Card, CardContent, CardHeader, CardTitle } from '@k2w/ui/card';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface HealthStatusCardProps {
  title: string;
  isLoading: boolean;
  isHealthy: boolean;
  uptime?: number;
}

export function HealthStatusCard({ title, isLoading, isHealthy, uptime }: HealthStatusCardProps) {
  const formatUptime = (uptimeSeconds: number) => {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : isHealthy ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">
            {isLoading ? 'Checking...' : isHealthy ? 'Healthy' : 'Unhealthy'}
          </span>
        </div>
        {uptime && (
          <p className="text-xs text-gray-500 mt-1">
            Uptime: {formatUptime(uptime)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}