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
import { Loader2, Plus, Sparkles } from 'lucide-react';
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
    <Card className="glass-card glow-indigo border-violet-500/15 overflow-hidden">
      <CardHeader className="bg-gradient-to-b from-violet-500/3 dark:from-violet-500/5 to-transparent border-b border-border/40 pb-5">
        <CardTitle className="flex items-center gap-2.5 text-lg font-extrabold text-foreground">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          Submit New Keyword
        </CardTitle>
        <CardDescription className="text-xs mt-1.5 text-slate-600 dark:text-slate-400 font-medium">
          Enter a keyword to initiate real-time AI content generation & SEO optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
         <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 group">
            <Label htmlFor="keyword" className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
              Target Keyword
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-violet-500 transition-colors pointer-events-none">
                <Sparkles className="h-4 w-4" />
              </span>
              <Input
                id="keyword"
                placeholder="e.g., best project management tools"
                value={formData.keyword}
                onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                required
                maxLength={100}
                disabled={disabled}
                className="pl-11 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:focus:ring-violet-500/20 transition-all h-11 pr-4 text-sm rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-550 font-medium shadow-sm"
              />
            </div>
            <p className="text-[10px] text-violet-600 dark:text-violet-300/85 italic font-medium pl-1">
              Be specific - longer keywords often result in higher topical relevance.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region" className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Target Region
              </Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 h-11 rounded-xl text-zinc-900 dark:text-zinc-200 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:focus:ring-violet-500/20 transition-all font-semibold text-sm">
                  <span>{REGIONS.find(r => r.value === formData.region)?.label || formData.region}</span>
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
              <Label htmlFor="language" className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Content Language
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-500 h-11 rounded-xl text-zinc-900 dark:text-zinc-200 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 dark:focus:ring-violet-500/20 transition-all font-semibold text-sm">
                  <span>{LANGUAGES.find(l => l.value === formData.language)?.label || formData.language}</span>
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

          <Separator className="bg-border/40" />

          <div className="text-sm bg-violet-500/5 dark:bg-violet-950/15 border border-violet-500/10 p-5 rounded-2xl space-y-4">
            <p className="font-bold text-violet-600 dark:text-violet-400 flex items-center gap-2 text-[10px] uppercase tracking-widest">
              <span className="flex h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400 animate-pulse" />
              Pipeline Steps
            </p>
            <div className="relative pl-6 space-y-5 border-l border-dashed border-violet-500/20 ml-2.5">
              <div className="relative flex items-start">
                <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-extrabold text-white shadow-md shadow-violet-500/20 ring-4 ring-card">1</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">SEO Analysis</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Competitor research & keyword layout</p>
                </div>
              </div>
              <div className="relative flex items-start">
                <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 ring-4 ring-card">2</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Content Generation</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Drafting outline & writing copy via Gemini</p>
                </div>
              </div>
              <div className="relative flex items-start">
                <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 ring-4 ring-card">3</span>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Readability Guard</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Quality check, grammar validation</p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold tracking-wide shadow-lg shadow-violet-500/10 hover:shadow-xl hover:shadow-violet-500/25 active:scale-[0.98] transition-all duration-300 h-12 rounded-xl text-sm" 
            disabled={isSubmitting || disabled}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-white" />
                Generating SEO Content...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2 text-violet-200" />
                Generate Content
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}