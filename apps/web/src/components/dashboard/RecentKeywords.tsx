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
    <Card className="lg:col-span-2 glass-card hover:border-violet-500/25 transition-all duration-300">
      <CardHeader className="pb-4 border-b border-border/40">
        <CardTitle className="text-base font-extrabold text-foreground">Recent Keywords</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-1.5 font-medium">Latest submissions and their status</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between space-x-4">
                <div className="h-4 bg-secondary/60 rounded w-1/3"></div>
                <div className="h-4 bg-secondary/60 rounded w-1/4"></div>
                <div className="h-6 bg-secondary/60 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : keywords.length > 0 ? (
          <div className="space-y-4">
            {keywords.map((keyword) => (
              <div key={keyword.id} className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-b-0 group transition-all duration-200">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-bold text-foreground text-sm truncate">{keyword.keyword}</h4>
                    <Badge 
                      variant="outline"
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        keyword.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        keyword.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-violet-500/10 text-violet-400 border-violet-500/20 animate-pulse'
                      }`}
                    >
                      {keyword.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mt-2 gap-2">
                    <span className="bg-secondary/60 px-2 py-0.5 rounded border border-border/20">{keyword.region}</span>
                    <span>•</span>
                    <span className="bg-secondary/60 px-2 py-0.5 rounded border border-border/20">{keyword.language}</span>
                    <span>•</span>
                    <span>{new Date(keyword.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {keyword.status === 'COMPLETED' && (
                  <Button variant="outline" size="sm" className="rounded-xl border-border/80 hover:bg-secondary/40 transition-all">
                    <Eye className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    View
                  </Button>
                )}
                
                {!['COMPLETED', 'FAILED'].includes(keyword.status) && (
                  <div className="text-right">
                    <Progress value={50} className="w-24 h-1.5 bg-secondary/80 [&>div]:bg-violet-500 rounded-full" />
                    <p className="text-[10px] font-bold uppercase text-violet-400 tracking-wider mt-1.5 animate-pulse">Processing...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-sm font-bold text-foreground mb-1">No keywords yet</h3>
            <p className="text-xs text-muted-foreground font-medium">Submit your first keyword to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}