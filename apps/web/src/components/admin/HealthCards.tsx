import { Card, CardContent, CardHeader, CardTitle } from '@k2w/ui/card';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import type { HealthStatusCardProps } from '@/types/dashboard';

export function HealthStatusCard({ 
  title, 
  isLoading, 
  isHealthy, 
  icon, 
  uptime, 
  additionalInfo 
}: HealthStatusCardProps) {
  const formatUptime = (uptimeSeconds: number) => {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
          {icon}
          {title}
        </CardTitle>
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
        {additionalInfo && (
          <p className="text-xs text-gray-500 mt-1">{additionalInfo}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
}

export function MetricCard({ title, value, description, icon, isLoading }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
          ) : (
            value
          )}
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}