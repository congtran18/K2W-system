/**
 * Keyword Status Badge Component
 * Displays keyword processing status
 */

import { Badge } from '@k2w/ui/badge';
import { CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface KeywordStatusBadgeProps {
  status: string;
  size?: 'sm' | 'default';
}

const STATUS_CONFIG = {
  QUEUED: { 
    label: 'Queued', 
    variant: 'secondary' as const, 
    icon: Clock,
    className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20' 
  },
  ANALYZING_SEO: { 
    label: 'Analyzing SEO', 
    variant: 'secondary' as const, 
    icon: Loader2,
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20' 
  },
  GENERATING_TEXT: { 
    label: 'Generating Content', 
    variant: 'secondary' as const, 
    icon: Loader2,
    className: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 animate-pulse' 
  },
  CHECKING_GRAMMAR: { 
    label: 'Checking Grammar', 
    variant: 'secondary' as const, 
    icon: Loader2,
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20' 
  },
  CHECKING_PLAGIARISM: { 
    label: 'Checking Plagiarism', 
    variant: 'secondary' as const, 
    icon: Loader2,
    className: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-500/20' 
  },
  COMPLETED: { 
    label: 'Completed', 
    variant: 'default' as const, 
    icon: CheckCircle,
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20' 
  },
  FAILED: { 
    label: 'Failed', 
    variant: 'destructive' as const, 
    icon: AlertCircle,
    className: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20' 
  },
};

export function KeywordStatusBadge({ status, size = 'default' }: KeywordStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.QUEUED;
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center w-fit select-none font-semibold shadow-none rounded-full transition-all duration-300 ${config.className} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <Icon className={`mr-1.5 ${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${Icon === Loader2 ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}