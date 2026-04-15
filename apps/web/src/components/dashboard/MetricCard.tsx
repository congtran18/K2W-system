import { Card, CardContent, CardHeader, CardTitle } from '@k2w/ui/card';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  color?: string;
}

export function DashboardMetricCard({ 
  title, 
  value, 
  description, 
  icon, 
  isLoading, 
  color = 'text-blue-600' 
}: MetricCardProps) {
  return (
    <Card className="glass-card hover:border-violet-500/25 transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <span className={`${color} p-1 rounded bg-secondary/60`}>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-black tracking-tight ${color}`}>
          {isLoading ? (
            <div className="animate-pulse bg-secondary/60 h-8 w-16 rounded-lg"></div>
          ) : (
            typeof value === 'number' ? value.toLocaleString() : value
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}