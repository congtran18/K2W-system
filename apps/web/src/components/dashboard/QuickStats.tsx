import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Progress } from '@k2w/ui/progress';

interface QuickStatsProps {
  isLoading: boolean;
}

export function QuickStats({ isLoading }: QuickStatsProps) {
  return (
    <Card className="glass-card hover:border-violet-500/25 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-base font-extrabold text-foreground">Quick Stats</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1.5 font-medium">Performance overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-secondary/60 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-secondary/60 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-muted-foreground">Today&apos;s Progress</span>
                <span className="font-bold text-foreground">75%</span>
              </div>
              <Progress value={75} className="h-1.5 bg-secondary/80 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-indigo-500 rounded-full" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-muted-foreground">Content Quality</span>
                <span className="font-bold text-foreground">92%</span>
              </div>
              <Progress value={92} className="h-1.5 bg-secondary/80 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-indigo-500 rounded-full" />
            </div>
            
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-muted-foreground">Processing Speed</span>
                <span className="font-bold text-foreground">88%</span>
              </div>
              <Progress value={88} className="h-1.5 bg-secondary/80 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-indigo-500 rounded-full" />
            </div>
          </>
        )}

        <div className="pt-4 border-t border-border/40 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Average SEO Score</span>
            <span className="font-bold text-emerald-400">8.5/10</span>
          </div>
          
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Processing Time</span>
            <span className="font-bold text-foreground">~3.2 min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}