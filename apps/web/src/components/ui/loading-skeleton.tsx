/**
 * Loading Skeleton Component
 * Reusable loading skeleton for better UX
 */

import type { LoadingSkeletonProps } from '@/types/ui';

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-secondary/80 dark:bg-slate-800/80 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-secondary/60 dark:bg-slate-800/60 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
 
export function LoadingCard({ title, items = 5 }: { title?: string; items?: number }) {
  return (
    <div className="space-y-4">
      {title && (
        <div className="animate-pulse">
          <div className="h-6 bg-secondary/80 dark:bg-slate-800/80 rounded w-1/3 mb-2"></div>
        </div>
      )}
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="glass-card border border-border/30 rounded-xl p-5 relative overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              {/* Icon placeholder */}
              <div className="w-10 h-10 rounded-xl bg-secondary/80 dark:bg-slate-800/80 shrink-0"></div>
              
              {/* Content text lines */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="h-4 bg-secondary/80 dark:bg-slate-800/80 rounded w-2/3 sm:w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-secondary/50 dark:bg-slate-800/50 rounded-full w-20"></div>
                  <div className="h-5 bg-secondary/50 dark:bg-slate-800/50 rounded-full w-16"></div>
                  <div className="h-5 bg-secondary/30 dark:bg-slate-800/30 rounded w-24"></div>
                </div>
              </div>
            </div>
            
            {/* Status badge placeholder on the right */}
            <div className="shrink-0 self-start sm:self-auto w-24 h-7 bg-secondary/80 dark:bg-slate-800/80 rounded-full"></div>
          </div>
          
          {/* Divider line and footer placeholder */}
          <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border/30">
            <div className="w-40 h-3 bg-secondary/40 dark:bg-slate-800/40 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}