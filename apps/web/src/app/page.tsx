'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui/card';
import { Alert, AlertDescription } from '@k2w/ui/alert';
import { Progress } from '@k2w/ui/progress';
import { 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Award,
  TrendingUp,
  AlignLeft
} from 'lucide-react';
import { toast } from 'sonner';

// Import React Query hooks
import { useSubmitKeyword, useKeywordHistory } from '../hooks/use-api';
import { SubmittedKeyword } from '../lib/api-services';

// Import components
import { PageHeader, KeywordSubmissionForm, KeywordList } from '../components';

interface KeywordFormData {
  keyword: string;
  region: string;
  language: string;
}

export default function HomePage() {
  // Local state for time filter and pagination
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedKeyword, setSelectedKeyword] = useState<SubmittedKeyword | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // React Query hooks - Auto-poll every 4s when keywords are still processing
  const { data: keywordHistoryData, refetch: refetchHistory, isLoading: isLoadingHistory } = useKeywordHistory(
    { page: 1, limit: 100 },
    {
      staleTime: 0,
      refetchInterval: (query) => {
        const keywords = query.state.data?.data?.keywords || [];
        const hasActive = keywords.some((k: SubmittedKeyword) =>
          ['QUEUED', 'ANALYZING_SEO', 'GENERATING_TEXT', 'CHECKING_GRAMMAR', 'CHECKING_PLAGIARISM'].includes(k.status)
        );
        return hasActive ? 4000 : false; // Poll every 4s while processing, stop when all done
      },
      refetchOnWindowFocus: true,
    }
  );
  const submitKeywordMutation = useSubmitKeyword();

  const PROCESSING_STATUSES = ['QUEUED', 'ANALYZING_SEO', 'GENERATING_TEXT', 'CHECKING_GRAMMAR', 'CHECKING_PLAGIARISM'];

  // Detect if any keywords are still processing to enable smart auto-polling
  const submittedKeywords = keywordHistoryData?.data?.keywords || [];
  const hasProcessingKeywords = submittedKeywords.some(k => PROCESSING_STATUSES.includes(k.status));
  const quotaUsed = submittedKeywords.length;
  const quotaLimit = 100;

  const handleSubmit = (formData: KeywordFormData) => {
    if (quotaUsed >= quotaLimit) {
      toast.error('You have reached your monthly keyword limit');
      return;
    }

    // Submit using React Query mutation
    submitKeywordMutation.mutate(formData, {
      onSuccess: () => {
        // Refetch history to show new keyword
        refetchHistory();
      },
    });
  };

  const handleTimeFilterChange = (filter: 'all' | 'today' | 'week' | 'month') => {
    setTimeFilter(filter);
    setCurrentPage(1);
  };

  // Filter keywords locally
  const filteredKeywords = submittedKeywords.filter((keyword) => {
    const date = new Date(keyword.createdAt);
    const now = new Date();
    
    if (timeFilter === 'today') {
      return date.toDateString() === now.toDateString();
    }
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= oneWeekAgo;
    }
    if (timeFilter === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= oneMonthAgo;
    }
    return true; // 'all'
  });

  // Paginate filtered keywords
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredKeywords.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  
  const paginatedKeywords = filteredKeywords.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const quotaPercentage = (quotaUsed / quotaLimit) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative radial orbs — dark mode only, light mode uses clean white */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full hidden dark:block bg-violet-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full hidden dark:block bg-cyan-500/8 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[10%] w-[60%] h-[60%] rounded-full hidden dark:block bg-indigo-500/15 blur-[140px] pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <PageHeader 
            title="K2W Content Generator"
            description="Transform target keywords into production-ready, SEO-optimized content automatically."
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Usage Limit & Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quota Display */}
            <Card className="glass-card glow-indigo border-violet-500/15 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Usage Limit</p>
                    <p className="text-base font-bold text-foreground">
                      {quotaUsed} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/ {quotaLimit} keywords</span>
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-400/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    {Math.round(quotaPercentage)}%
                  </div>
                </div>
                <Progress value={quotaPercentage} className="h-1.5 bg-secondary/80 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-indigo-500 rounded-full" />
                {quotaPercentage > 80 && (
                  <Alert className="mt-4 py-2 border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-xs">
                      You&apos;re approaching your monthly limit
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Keyword Submission Form */}
            <KeywordSubmissionForm 
              onSubmit={handleSubmit}
              isSubmitting={submitKeywordMutation.isPending}
              disabled={quotaUsed >= quotaLimit}
            />
          </div>

          {/* Right Column: Recent Submissions */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-border/40 overflow-hidden flex flex-col h-full shadow-lg">
              <CardHeader className="bg-gradient-to-b from-secondary/15 to-transparent border-b border-border/40 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-secondary text-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      Recent Submissions
                      {hasProcessingKeywords && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                          Live updating...
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 text-muted-foreground">
                      Track generation pipeline steps and access final articles
                    </CardDescription>
                  </div>
                  
                  {/* Segmented Time Filter Button Group */}
                  <div className="flex items-center gap-1 bg-secondary/60 dark:bg-slate-900/60 p-1 rounded-xl border border-border/40 self-start sm:self-auto select-none">
                    {(['all', 'today', 'week', 'month'] as const).map((filter) => {
                      const isActive = timeFilter === filter;
                      const labels = {
                        all: 'All Time',
                        today: 'Today',
                        week: 'Week',
                        month: 'Month'
                      };
                      return (
                        <button
                          key={filter}
                          onClick={() => handleTimeFilterChange(filter)}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                          }`}
                        >
                          {labels[filter]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-5 flex flex-col gap-4">
                {/* Scrollable list container */}
                <div className="max-h-[650px] overflow-y-auto pr-1.5 custom-scrollbar min-h-[400px]">
                  <KeywordList 
                    keywords={paginatedKeywords}
                    isLoading={isLoadingHistory}
                    onViewContent={(keyword) => setSelectedKeyword(keyword)}
                  />
                </div>
                
                {/* Pagination Controls */}
                {filteredKeywords.length > itemsPerPage && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground font-semibold text-center sm:text-left">
                      Showing <span className="text-foreground">{(activePage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="text-foreground">
                        {Math.min(activePage * itemsPerPage, filteredKeywords.length)}
                      </span>{' '}
                      of <span className="text-foreground">{filteredKeywords.length}</span> entries
                    </p>
                    
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={activePage === 1}
                        className="p-1.5 rounded-lg border border-border/50 bg-background hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                        title="Previous Page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                          const pageNum = idx + 1;
                          const isCurrent = pageNum === activePage;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`h-7 w-7 rounded-lg text-[10px] font-bold transition-all duration-200 active:scale-90 ${
                                isCurrent
                                  ? 'bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-400'
                                  : 'border border-border/30 hover:border-border/60 hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={activePage === totalPages}
                        className="p-1.5 rounded-lg border border-border/50 bg-background hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95"
                        title="Next Page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Beautiful Premium Article Viewer Modal */}
        {selectedKeyword && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop blur with fade-in */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setSelectedKeyword(null)}
            />
            
            {/* Modal Content with scale-up and shadow */}
            <div className="bg-background border border-border/80 rounded-2xl w-full max-w-3xl shadow-[0_20px_50px_rgba(139,92,246,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header section with gradient */}
              <div className="p-6 pb-5 border-b border-border/40 bg-gradient-to-r from-violet-500/5 via-indigo-500/5 to-transparent relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded-full">
                      Generated Content
                    </span>
                    <h3 className="text-lg font-bold text-foreground tracking-tight mt-1">
                      {selectedKeyword.keyword}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-muted-foreground font-medium">
                      <span>Region: <strong className="text-foreground">{selectedKeyword.region}</strong></span>
                      <span className="h-3 w-[1px] bg-border/60" />
                      <span>Language: <strong className="text-foreground">{selectedKeyword.language}</strong></span>
                      <span className="h-3 w-[1px] bg-border/60" />
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 opacity-70" />
                        {new Date(selectedKeyword.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedKeyword(null)}
                    className="p-1.5 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border/40 shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 p-6 py-4 bg-secondary/20 dark:bg-slate-900/40 border-b border-border/30">
                <div className="bg-card/40 border border-border/30 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
                    <Award className="h-3.5 w-3.5 text-violet-500" />
                    SEO Score
                  </div>
                  <span className="text-lg font-extrabold text-violet-600 dark:text-violet-400">
                    {selectedKeyword.results?.seo_score || 0}/100
                  </span>
                </div>
                
                <div className="bg-card/40 border border-border/30 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
                    <AlignLeft className="h-3.5 w-3.5 text-indigo-500" />
                    Word Count
                  </div>
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                    {selectedKeyword.results?.word_count || 0}
                  </span>
                </div>

                <div className="bg-card/40 border border-border/30 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    Readability
                  </div>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {selectedKeyword.results?.readability_score || 0}/100
                  </span>
                </div>
              </div>

              {/* Article Content Container */}
              <div className="flex-1 overflow-y-auto min-h-[250px] custom-scrollbar bg-card/10">
                {selectedKeyword.results?.content ? (
                  <>
                    {/* Hero Image — only from API, no client-side fallback */}
                    {selectedKeyword.results?.images?.[0] ? (
                      <div className="relative w-full h-56 overflow-hidden bg-secondary/30" id="hero-img-container">
                        <div className="absolute inset-0 flex items-center justify-center bg-secondary/20 text-muted-foreground text-xs">
                          <span className="animate-pulse">Loading image...</span>
                        </div>
                        <img
                          src={selectedKeyword.results.images[0]}
                          alt={`Hero image for ${selectedKeyword.keyword}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          onLoad={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.opacity = '1';
                            const placeholder = img.parentElement?.querySelector('div');
                            if (placeholder) placeholder.style.display = 'none';
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const container = img.parentElement;
                            if (container) container.style.display = 'none';
                          }}
                          style={{ opacity: 0, transition: 'opacity 0.4s ease' }}
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent pointer-events-none" />
                        {/* Top-left: Clean AI badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-medium text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-sm">
                          <svg className="w-3 h-3 text-violet-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                          </svg>
                          AI Image
                        </div>
                      </div>
                    ) : null}
                    {/* HTML Article Content */}
                    <div
                      className="p-6 article-content"
                      dangerouslySetInnerHTML={{ __html: selectedKeyword.results.content }}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground p-6">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-amber-500" />
                    <p className="text-sm font-semibold">No generated content found for this keyword.</p>
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className="p-5 border-t border-border/40 flex items-center justify-end gap-3 bg-secondary/15">
                <button
                  onClick={() => {
                    if (selectedKeyword.results?.content) {
                      navigator.clipboard.writeText(selectedKeyword.results.content);
                      setCopied(true);
                      toast.success('Article copied to clipboard');
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  disabled={!selectedKeyword.results?.content}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow-[0_4px_12px_rgba(139,92,246,0.2)]"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Article'}
                </button>
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="px-4 py-2 border border-border bg-background hover:bg-secondary text-foreground font-semibold rounded-xl text-xs transition-all active:scale-95 shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 border-t border-border/40 pt-16">
          <h2 className="text-xl font-extrabold text-foreground mb-12 text-gradient-primary text-center">
            Powered by Enterprise-Grade AI
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card border border-border/40 p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="bg-blue-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold mb-2">Deep SEO Research</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Automated search intent analysis, competitor tracking, and cluster research utilizing AlsoAsked and SurferSEO.
              </p>
            </div>
            
            <div className="glass-card border border-border/40 p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
              <div className="bg-violet-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold mb-2">High-Context Gemini AI</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Structured article outlines, semantic headings, and high-quality body copy generated using the latest Gemini models.
              </p>
            </div>
            
            <div className="glass-card border border-border/40 p-6 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <div className="bg-emerald-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold mb-2">Advanced Editorial Guard</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Automatic spelling/readability evaluation combined with direct Webflow staging publishing tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
