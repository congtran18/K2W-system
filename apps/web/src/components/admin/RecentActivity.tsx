import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Badge } from '@k2w/ui/badge';

interface RecentActivityProps {
  keywords: Array<{
    id: string;
    keyword: string;
    status: string;
    createdAt: string;
  }>;
  isLoading: boolean;
}

export function RecentActivity({ keywords, isLoading }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Keywords</CardTitle>
        <CardDescription>Latest keyword submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : keywords?.length ? (
          <div className="space-y-3">
            {keywords.slice(0, 5).map((keyword) => (
              <div key={keyword.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{keyword.keyword}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(keyword.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge 
                  variant={keyword.status === 'COMPLETED' ? 'default' : 'secondary'}
                >
                  {keyword.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent keywords</p>
        )}
      </CardContent>
    </Card>
  );
}