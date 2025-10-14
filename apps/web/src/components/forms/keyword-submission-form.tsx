/**
 * Keyword Submission Form Component
 * Form for submitting new keywords
 */

import { useState } from 'react';
import { Button } from '@k2w/ui/button';
import { Input } from '@k2w/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@k2w/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Label } from '@k2w/ui/label';
import { Separator } from '@k2w/ui/separator';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface KeywordFormData {
  keyword: string;
  region: string;
  language: string;
}

interface KeywordSubmissionFormProps {
  onSubmit: (data: KeywordFormData) => void;
  isSubmitting: boolean;
  disabled?: boolean;
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

export function KeywordSubmissionForm({ onSubmit, isSubmitting, disabled = false }: KeywordSubmissionFormProps) {
  const [formData, setFormData] = useState<KeywordFormData>({
    keyword: '',
    region: 'US',
    language: 'en',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    onSubmit(formData);
    
    // Reset form after successful submission
    setFormData(prev => ({ ...prev, keyword: '' }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Submit New Keyword
        </CardTitle>
        <CardDescription>
          Enter a keyword to generate SEO-optimized content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword *</Label>
            <Input
              id="keyword"
              placeholder="e.g., best project management tools"
              value={formData.keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
              required
              maxLength={100}
              disabled={disabled}
            />
            <p className="text-sm text-gray-500">
              Be specific - longer keywords often perform better
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Target Region</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Content Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <p className="font-medium mb-1">What happens next:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>SEO analysis with competitor research</li>
              <li>AI content generation with GPT-4</li>
              <li>Grammar and readability optimization</li>
              <li>Plagiarism checking</li>
              <li>Ready-to-publish content delivered</li>
            </ol>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || disabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}