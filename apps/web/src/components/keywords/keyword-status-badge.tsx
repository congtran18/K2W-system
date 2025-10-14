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
  QUEUED: { label: 'Queued', variant: 'secondary' as const, icon: Clock },
  ANALYZING_SEO: { label: 'Analyzing SEO', variant: 'secondary' as const, icon: Loader2 },
  GENERATING_TEXT: { label: 'Generating Content', variant: 'secondary' as const, icon: Loader2 },
  CHECKING_GRAMMAR: { label: 'Checking Grammar', variant: 'secondary' as const, icon: Loader2 },
  CHECKING_PLAGIARISM: { label: 'Checking Plagiarism', variant: 'secondary' as const, icon: Loader2 },
  COMPLETED: { label: 'Completed', variant: 'default' as const, icon: CheckCircle },
  FAILED: { label: 'Failed', variant: 'destructive' as const, icon: AlertCircle },
};

export function KeywordStatusBadge({ status, size = 'default' }: KeywordStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.QUEUED;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className={size === 'sm' ? 'text-xs' : ''}>
      <Icon className={`mr-1 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${Icon === Loader2 ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}