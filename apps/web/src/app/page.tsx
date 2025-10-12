'use client';

import { useState } from 'react';
import { Button } from '@k2w/ui/button';
import { Input } from '@k2w/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@k2w/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Label } from '@k2w/ui/label';
import { Badge } from '@k2w/ui/badge';
import { Alert, AlertDescription } from '@k2w/ui/alert';
import { Progress } from '@k2w/ui/progress';
import { Separator } from '@k2w/ui/separator';
import { Loader2, Plus, Search, TrendingUp, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface KeywordSubmission {
  keyword: string;
  region: string;
  language: string;
}

interface SubmittedKeyword extends KeywordSubmission {
  id: string;
  status: string;
  createdAt: string;
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

const STATUS_CONFIG = {
  QUEUED: { label: 'Queued', color: 'bg-gray-500', icon: null },
  ANALYZING_SEO: { label: 'Analyzing SEO', color: 'bg-blue-500', icon: Search },
  GENERATING_TEXT: { label: 'Generating Content', color: 'bg-purple-500', icon: FileText },
  CHECKING_GRAMMAR: { label: 'Checking Grammar', color: 'bg-orange-500', icon: TrendingUp },
  CHECKING_PLAGIARISM: { label: 'Checking Plagiarism', color: 'bg-yellow-500', icon: Search },
  COMPLETED: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  FAILED: { label: 'Failed', color: 'bg-red-500', icon: AlertCircle },
};

export default function HomePage() {
  const [formData, setFormData] = useState<KeywordSubmission>({
    keyword: '',
    region: 'US',
    language: 'en',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedKeywords, setSubmittedKeywords] = useState<SubmittedKeyword[]>([]);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaLimit] = useState(100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    if (quotaUsed >= quotaLimit) {
      toast.error('You have reached your monthly keyword limit');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/keywords/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit keyword');
      }

      // Add to submitted keywords list
      const newKeyword: SubmittedKeyword = {
        id: result.data.keywordId,
        keyword: formData.keyword,
        region: formData.region,
        language: formData.language,
        status: 'QUEUED',
        createdAt: new Date().toISOString(),
      };

      setSubmittedKeywords(prev => [newKeyword, ...prev]);
      setQuotaUsed(prev => prev + 1);

      // Reset form
      setFormData(prev => ({ ...prev, keyword: '' }));

      toast.success('Keyword submitted successfully! Processing will begin shortly.');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit keyword');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.QUEUED;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {config.label}
      </Badge>
    );
  };

  const quotaPercentage = (quotaUsed / quotaLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            K2W Content Generator
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Transform keywords into high-quality, SEO-optimized content with AI
          </p>
          
          {/* Quota Display */}
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Monthly Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Keywords used</span>
                  <span>{quotaUsed} / {quotaLimit}</span>
                </div>
                <Progress value={quotaPercentage} className="h-2" />
                {quotaPercentage > 80 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You&apos;re approaching your monthly limit
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Keyword Submission Form */}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                    required
                    maxLength={100}
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
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, region: value }))}
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
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, language: value }))}
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
                  disabled={isSubmitting || quotaUsed >= quotaLimit}
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

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Track the progress of your content generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submittedKeywords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No keywords submitted yet</p>
                  <p className="text-sm">Submit your first keyword to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submittedKeywords.map((keyword) => (
                    <div
                      key={keyword.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {keyword.keyword}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{REGIONS.find(r => r.value === keyword.region)?.label}</span>
                            <span>•</span>
                            <span>{LANGUAGES.find(l => l.value === keyword.language)?.label}</span>
                          </div>
                        </div>
                        {getStatusBadge(keyword.status)}
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        Submitted {new Date(keyword.createdAt).toLocaleString()}
                      </div>

                      {keyword.status === 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            // TODO: Navigate to content details page
                            toast.info('Content view will be available soon');
                          }}
                        >
                          View Content
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Powered by Advanced AI
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SEO Research</h3>
              <p className="text-gray-600">
                Deep competitor analysis and keyword research using AlsoAsked and SurferSEO
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Content</h3>
              <p className="text-gray-600">
                High-quality, engaging content generated by GPT-4 with perfect SEO optimization
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-gray-600">
                Grammar checking with Grammarly and plagiarism detection with Copyscape
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
