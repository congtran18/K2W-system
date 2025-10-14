import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Progress } from '@k2w/ui/progress';
import { Database } from 'lucide-react';

interface SystemPerformanceProps {
  memoryData?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

export function SystemPerformance({ memoryData }: SystemPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Performance</CardTitle>
        <CardDescription>Memory and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        {memoryData ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span>{Math.round(memoryData.heapUsed / 1024 / 1024)}MB</span>
              </div>
              <Progress 
                value={(memoryData.heapUsed / memoryData.heapTotal) * 100} 
                className="h-2" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Heap Total</p>
                <p className="font-medium">{Math.round(memoryData.heapTotal / 1024 / 1024)}MB</p>
              </div>
              <div>
                <p className="text-gray-500">External</p>
                <p className="font-medium">{Math.round(memoryData.external / 1024 / 1024)}MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Database className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">Performance data unavailable</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}