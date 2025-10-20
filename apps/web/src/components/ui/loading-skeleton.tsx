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
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        </div>
      )}
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center space-x-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  );
}