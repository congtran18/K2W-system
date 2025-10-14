/**
 * Keyword List Component
 * Displays list of keywords with their status
 */

import { Button } from '@k2w/ui/button';
import { Progress } from '@k2w/ui/progress';
import { Eye, FileText } from 'lucide-react';
import { KeywordStatusBadge } from './keyword-status-badge';
import { LoadingCard } from '../ui/loading-skeleton';

interface Keyword {
  id: string;
  keyword: string;
  region: string;
  language: string;
  status: string;
  createdAt: string;
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

export function KeywordList({ keywords, isLoading, showProgress = false, onViewContent }: KeywordListProps) {
  if (isLoading) {
    return <LoadingCard items={5} />;
  }

  if (keywords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No keywords submitted yet</p>
        <p className="text-sm">Submit your first keyword to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keywords.map((keyword) => (
        <div
          key={keyword.id}
          className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
            showProgress ? 'flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0' : ''
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1 text-sm">
                  {keyword.keyword}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{REGIONS.find(r => r.value === keyword.region)?.label}</span>
                  <span>•</span>
                  <span>{LANGUAGES.find(l => l.value === keyword.language)?.label}</span>
                  {!showProgress && (
                    <>
                      <span>•</span>
                      <span>{new Date(keyword.createdAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <KeywordStatusBadge status={keyword.status} size="sm" />
            </div>
            
            {!showProgress && (
              <div className="text-xs text-gray-400">
                Submitted {new Date(keyword.createdAt).toLocaleString()}
              </div>
            )}

            {keyword.status === 'COMPLETED' && onViewContent && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onViewContent(keyword)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Content
              </Button>
            )}
          </div>
          
          {showProgress && !['COMPLETED', 'FAILED'].includes(keyword.status) && (
            <div className="text-right">
              <Progress value={50} className="w-20 h-2" />
              <p className="text-xs text-gray-500 mt-1">Processing...</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}