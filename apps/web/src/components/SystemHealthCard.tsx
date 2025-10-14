import { Card, CardContent, CardHeader, CardTitle } from '@k2w/ui/card';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface SystemHealthCardProps {
  title: string;
  status: 'loading' | 'healthy' | 'unhealthy';
  uptime?: number;
  additionalInfo?: string;
}

export function SystemHealthCard({ title, status, uptime, additionalInfo }: SystemHealthCardProps) {
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
          {status === 'loading' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : status === 'healthy' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">
            {status === 'loading' ? 'Checking...' : 
             status === 'healthy' ? 'Healthy' : 'Unhealthy'}
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