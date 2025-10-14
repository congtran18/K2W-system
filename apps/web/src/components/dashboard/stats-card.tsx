/**
 * Stats Card Component
 * Reusable stats card for dashboards
 */

import { Card, CardContent, CardHeader, CardTitle } from '@k2w/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const colorMap = {
  blue: 'text-blue-600',
  green: 'text-green-600', 
  orange: 'text-orange-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
};

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  isLoading, 
  color = 'blue' 
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorMap[color]}`}>
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
          ) : (
            value
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}