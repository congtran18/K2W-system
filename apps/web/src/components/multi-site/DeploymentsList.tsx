import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Badge } from '@k2w/ui/badge';

interface Deployment {
  id: string;
  domain: string;
  deployedAt: string;
  status: 'success' | 'in-progress' | 'failed';
}

interface DeploymentsListProps {
  deployments?: Deployment[];
}

export function DeploymentsList({ deployments = [] }: DeploymentsListProps) {
  const sampleDeployments = deployments.length > 0 ? deployments : [
    { id: '1', domain: 'example1.com', deployedAt: '2 hours ago', status: 'success' as const },
    { id: '2', domain: 'example2.com', deployedAt: 'now', status: 'in-progress' as const },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deployments</CardTitle>
        <CardDescription>Track your site deployments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleDeployments.map((deployment) => (
            <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{deployment.domain}</h4>
                <p className="text-sm text-gray-600">
                  {deployment.status === 'in-progress' ? 'Deploying now...' : `Deployed ${deployment.deployedAt}`}
                </p>
              </div>
              {getStatusBadge(deployment.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}