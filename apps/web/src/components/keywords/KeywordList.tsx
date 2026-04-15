/**
 * Keyword List Component
 * Displays list of keywords with their status
 */

import { Button } from '@k2w/ui/button';
import { Progress } from '@k2w/ui/progress';
import { Eye, FileText } from 'lucide-react';
import { KeywordStatusBadge } from './KeywordStatusBadge';
import { LoadingCard } from '../ui/loading-skeleton';

interface Keyword {
  id: string;
  keyword: string;
  region: string;
  language: string;
  status: string;
  createdAt: string;
  results?: {
    content?: string;
    seo_score?: number;
    word_count?: number;
    readability_score?: number;
  };
}

interface KeywordListProps {
  keywords: Keyword[];
  isLoading: boolean;
  showProgress?: boolean;
  onViewContent?: (keyword: Keyword) => void;
}

const REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'BR', label: 'Brazil' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

import { Globe, Calendar, Sparkles } from 'lucide-react';

export function KeywordList({ keywords, isLoading, showProgress = false, onViewContent }: KeywordListProps) {
  if (isLoading) {
    return <LoadingCard items={5} />;
  }

  if (keywords.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-secondary/10 dark:bg-slate-900/20 border border-dashed border-border/60 rounded-xl">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-40 text-violet-500" />
        <p className="font-bold text-sm text-foreground">No keywords submitted yet</p>
        <p className="text-xs text-muted-foreground mt-1">Submit your first keyword to start generating SEO-optimized content</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keywords.map((keyword) => {
        const isProcessing = ['QUEUED', 'ANALYZING_SEO', 'GENERATING_TEXT', 'CHECKING_GRAMMAR', 'CHECKING_PLAGIARISM'].includes(keyword.status);
        const pulseClass = isProcessing 
          ? 'border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.08)] dark:shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-pulse' 
          : 'border-border/40 hover:border-violet-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.15)]';

        const regionName = REGIONS.find(r => r.value === keyword.region)?.label || keyword.region;
        const langName = LANGUAGES.find(l => l.value === keyword.language)?.label || keyword.language;

        return (
          <div
            key={keyword.id}
            className={`glass-card border rounded-xl p-5 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group ${pulseClass} ${
              showProgress ? 'flex items-center justify-between gap-4 py-4' : ''
            }`}
          >
            {/* Ambient border gradient on hover */}
            <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300 border border-violet-500/10 shrink-0 mt-0.5">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground text-sm tracking-tight truncate max-w-[280px] sm:max-w-[380px] md:max-w-[480px]">
                      {keyword.keyword}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/5 dark:bg-violet-950/40 px-2.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300 border border-violet-500/10 dark:border-violet-500/20">
                        <Globe className="h-3 w-3 opacity-70" />
                        {regionName}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/5 dark:bg-indigo-950/40 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20">
                        <Sparkles className="h-3 w-3 opacity-70" />
                        {langName}
                      </span>
                      {!showProgress && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium ml-1">
                          <Calendar className="h-3 w-3 opacity-70" />
                          {new Date(keyword.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="shrink-0 self-start sm:self-auto flex sm:block justify-end w-full sm:w-auto">
                  <KeywordStatusBadge status={keyword.status} size="sm" />
                </div>
              </div>
              
              {!showProgress && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-3.5 border-t border-border/30">
                  <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1.5 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500/60" />
                    Submitted {new Date(keyword.createdAt).toLocaleString(undefined, { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit', 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>

                  {keyword.status === 'COMPLETED' && onViewContent && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-violet-600 dark:bg-violet-600 hover:bg-violet-700 dark:hover:bg-violet-500 text-white dark:text-white text-xs font-bold border border-violet-600 dark:border-violet-500 hover:border-violet-700 dark:hover:border-violet-500 rounded-lg transition-all duration-200 flex items-center gap-1.5 py-1.5 h-8 shadow-sm hover:scale-[1.02] active:scale-95 px-3.5"
                      onClick={() => onViewContent(keyword)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Content
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {showProgress && !['COMPLETED', 'FAILED'].includes(keyword.status) && (
              <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                <Progress value={keyword.status === 'QUEUED' ? 20 : 65} className="w-20 h-1 bg-secondary/80 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-indigo-500 rounded-full" />
                <p className="text-[9px] font-bold text-violet-600 dark:text-violet-400 animate-pulse uppercase tracking-wider">
                  {keyword.status === 'QUEUED' ? 'Queued' : 'Processing...'}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}