import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Badge } from '@k2w/ui/badge';
import { Button } from '@k2w/ui/button';
import { Progress } from '@k2w/ui/progress';
import { FileText, Eye } from 'lucide-react';

interface Keyword {
  id: string;
  keyword: string;
  status: string;
  region: string;
  language: string;
  createdAt: string;
}

interface RecentKeywordsProps {
  keywords: Keyword[];
  isLoading: boolean;
}

export function RecentKeywords({ keywords, isLoading }: RecentKeywordsProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Keywords</CardTitle>
        <CardDescription>Latest submissions and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : keywords.length > 0 ? (
          <div className="space-y-4">
            {keywords.map((keyword) => (
              <div key={keyword.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900 text-sm">{keyword.keyword}</h4>
                    <Badge 
                      variant={
                        keyword.status === 'COMPLETED' ? 'default' : 
                        keyword.status === 'FAILED' ? 'destructive' : 
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {keyword.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>{keyword.region}</span>
                    <span className="mx-2">•</span>
                    <span>{keyword.language}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(keyword.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {keyword.status === 'COMPLETED' && (
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                )}
                
                {!['COMPLETED', 'FAILED'].includes(keyword.status) && (
                  <div className="text-right">
                    <Progress value={50} className="w-20 h-2" />
                    <p className="text-xs text-gray-500 mt-1">Processing...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No keywords yet</h3>
            <p className="text-gray-500">Submit your first keyword to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}