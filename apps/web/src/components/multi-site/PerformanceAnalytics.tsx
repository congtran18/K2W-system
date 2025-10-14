import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';

interface AnalyticsData {
  totalVisitors: number;
  conversionRate: number;
}

interface PerformanceAnalyticsProps {
  analyticsData?: AnalyticsData;
}

export function PerformanceAnalytics({ analyticsData }: PerformanceAnalyticsProps) {
  const defaultData = {
    totalVisitors: 24567,
    conversionRate: 67
  };

  const data = analyticsData || defaultData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
        <CardDescription>Monitor your site performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-3xl font-bold text-blue-600">
              {data.totalVisitors.toLocaleString()}
            </h3>
            <p className="text-sm text-gray-600">Total Visitors</p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-3xl font-bold text-green-600">{data.conversionRate}%</h3>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}