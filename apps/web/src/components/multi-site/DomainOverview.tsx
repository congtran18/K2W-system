import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Button } from '@k2w/ui/button';
import { Badge } from '@k2w/ui/badge';

interface Domain {
  id: string;
  name: string;
  description: string;
  status: 'live' | 'development' | 'inactive';
}

interface DomainOverviewProps {
  domains?: Domain[];
}

export function DomainOverview({ domains = [] }: DomainOverviewProps) {
  const activeDomains = domains.filter(d => d.status !== 'inactive').length;
  const liveSites = domains.filter(d => d.status === 'live').length;
  const inDevelopment = domains.filter(d => d.status === 'development').length;

  const sampleDomains = domains.length > 0 ? domains : [
    { id: '1', name: 'example1.com', description: 'Container Office Rental - Melbourne', status: 'live' as const },
    { id: '2', name: 'example2.com', description: 'Modular Homes - Sydney', status: 'development' as const },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Overview</CardTitle>
        <CardDescription>Manage your domain portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-600">{activeDomains || 12}</h3>
            <p className="text-sm text-gray-600">Active Domains</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="text-2xl font-bold text-green-600">{liveSites || 8}</h3>
            <p className="text-sm text-gray-600">Live Sites</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h3 className="text-2xl font-bold text-orange-600">{inDevelopment || 4}</h3>
            <p className="text-sm text-gray-600">In Development</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {sampleDomains.map((domain) => (
            <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{domain.name}</h4>
                <p className="text-sm text-gray-600">{domain.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  className={
                    domain.status === 'live' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {domain.status === 'live' ? 'Live' : 'Development'}
                </Badge>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}