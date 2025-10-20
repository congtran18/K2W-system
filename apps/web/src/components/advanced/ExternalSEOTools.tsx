'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@k2w/ui';
import { Button } from '@k2w/ui';
import { Badge } from '@k2w/ui';
import { Input } from '@k2w/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@k2w/ui';
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Target,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  useExternalKeywordData,
  useKeywordSuggestions,
  useCompetitorAnalysis,
  useGoogleTrends,
  useSEOSources
} from '@/hooks/use-api';

interface KeywordData {
  keyword: string;
  search_volume: number;
  competition: string;
  cpc: number;
  difficulty: number;
  trends: number[];
}

interface KeywordSuggestion {
  keyword: string;
  relevance_score: number;
  search_volume: number;
  competition: string;
}

function KeywordResearchPanel() {
  const [keywords, setKeywords] = useState('');
  const [region, setRegion] = useState('US');
  const [sources, setSources] = useState<string[]>(['google']);
  
  const { mutate: getKeywordData, data: keywordData, isPending: keywordLoading } = useExternalKeywordData();
  const { mutate: getSuggestions, data: suggestionsData, isPending: suggestionsLoading } = useKeywordSuggestions();

  const handleKeywordResearch = () => {
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywordList.length === 0) return;

    getKeywordData({
      keywords: keywordList,
      sources: sources as ('semrush' | 'ahrefs' | 'google')[],
      region
    });
  };

  const handleGetSuggestions = () => {
    const seedKeyword = keywords.split(',')[0]?.trim();
    if (!seedKeyword) return;

    getSuggestions({
      seed_keyword: seedKeyword,
      count: 50,
      sources,
      region
    });
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return 'text-green-600';
    if (difficulty <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Keyword Research
        </CardTitle>
        <CardDescription>
          Analyze keywords using external SEO tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords (comma-separated)</label>
            <Input
              placeholder="keyword1, keyword2, keyword3"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Region</label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
                <SelectItem value="BR">Brazil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Sources</label>
            <Select value={sources[0]} onValueChange={(value) => setSources([value])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="semrush">SEMrush</SelectItem>
                <SelectItem value="ahrefs">Ahrefs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleKeywordResearch} 
            disabled={keywordLoading || !keywords.trim()}
            className="flex items-center gap-2"
          >
            {keywordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            Analyze Keywords
          </Button>
          <Button 
            variant="outline"
            onClick={handleGetSuggestions} 
            disabled={suggestionsLoading || !keywords.trim()}
            className="flex items-center gap-2"
          >
            {suggestionsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
            Get Suggestions
          </Button>
        </div>

        {/* Keywords Data Results */}
        {keywordData?.data && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Keyword Analysis Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Keyword</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Search Volume</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Competition</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">CPC</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Difficulty</th>
                    <th className="border border-gray-200 px-4 py-2 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {keywordData.data.keywords.map((keyword: KeywordData, index: number) => {
                    const lastTrend = keyword.trends[keyword.trends.length - 1];
                    const prevTrend = keyword.trends[keyword.trends.length - 2];
                    const trendDirection = lastTrend > prevTrend ? 'up' : lastTrend < prevTrend ? 'down' : 'stable';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 font-medium">{keyword.keyword}</td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          {keyword.search_volume.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          <Badge className={getCompetitionColor(keyword.competition)}>
                            {keyword.competition}
                          </Badge>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          ${keyword.cpc.toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          <span className={getDifficultyColor(keyword.difficulty)}>
                            {keyword.difficulty}/100
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          {trendDirection === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500 mx-auto" />}
                          {trendDirection === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500 mx-auto" />}
                          {trendDirection === 'stable' && <Minus className="w-4 h-4 text-gray-500 mx-auto" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suggestions Results */}
        {suggestionsData?.data && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Keyword Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestionsData.data.suggestions.map((suggestion: KeywordSuggestion, index: number) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="font-medium">{suggestion.keyword}</div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Volume: {suggestion.search_volume.toLocaleString()}</span>
                      <span>Score: {suggestion.relevance_score}/10</span>
                    </div>
                    <Badge className={getCompetitionColor(suggestion.competition)}>
                      {suggestion.competition}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompetitorAnalysisPanel() {
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [analysisType, setAnalysisType] = useState<'keywords' | 'content' | 'backlinks' | 'all'>('all');
  
  const { mutate: analyzeCompetitors, data: competitorData, isPending: loading } = useCompetitorAnalysis();

  const handleAnalysis = () => {
    if (!domain.trim()) return;
    
    const competitorList = competitors.split(',').map(c => c.trim()).filter(c => c);
    
    analyzeCompetitors({
      domain: domain.trim(),
      competitors: competitorList,
      analysis_type: analysisType
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Competitor Analysis
        </CardTitle>
        <CardDescription>
          Analyze your competitors&apos; SEO strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Domain</label>
            <Input
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Competitors (comma-separated)</label>
            <Input
              placeholder="competitor1.com, competitor2.com"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <Select value={analysisType} onValueChange={(value) => setAnalysisType(value as typeof analysisType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Complete Analysis</SelectItem>
                <SelectItem value="keywords">Keywords Only</SelectItem>
                <SelectItem value="content">Content Gaps</SelectItem>
                <SelectItem value="backlinks">Backlink Opportunities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleAnalysis} 
          disabled={loading || !domain.trim()}
          className="flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Analyze Competitors
        </Button>

        {/* Results */}
        {competitorData?.data && (
          <div className="space-y-6">
            {/* Competitor Keywords */}
            {competitorData.data.analysis.competitor_keywords && Object.keys(competitorData.data.analysis.competitor_keywords).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Competitor Keywords</h3>
                <div className="space-y-4">
                  {Object.entries(competitorData.data.analysis.competitor_keywords).map(([competitor, keywords]) => (
                    <Card key={competitor} className="p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        {competitor}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(keywords as string[]).slice(0, 20).map((keyword, index) => (
                          <Badge key={index} variant="outline">{keyword}</Badge>
                        ))}
                        {(keywords as string[]).length > 20 && (
                          <Badge variant="secondary">+{(keywords as string[]).length - 20} more</Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Content Gaps */}
            {competitorData.data.analysis.content_gaps && competitorData.data.analysis.content_gaps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Content Gap Opportunities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {competitorData.data.analysis.content_gaps.map((gap, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{gap}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Backlink Opportunities */}
            {competitorData.data.analysis.backlink_opportunities && competitorData.data.analysis.backlink_opportunities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Backlink Opportunities</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Domain</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">Authority</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">Relevance</th>
                        <th className="border border-gray-200 px-4 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorData.data.analysis.backlink_opportunities.map((opportunity, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 font-medium">{opportunity.domain}</td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            <Badge variant={opportunity.authority > 70 ? 'default' : opportunity.authority > 40 ? 'secondary' : 'outline'}>
                              {opportunity.authority}/100
                            </Badge>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            <span className={opportunity.relevance > 7 ? 'text-green-600' : opportunity.relevance > 5 ? 'text-yellow-600' : 'text-red-600'}>
                              {opportunity.relevance}/10
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`https://${opportunity.domain}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Visit
                              </a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrendsAnalysisPanel() {
  const [keywords, setKeywords] = useState('');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '12m' | '5y'>('12m');
  const [region, setRegion] = useState('US');
  
  const { mutate: getTrends, data: trendsData, isPending: loading } = useGoogleTrends();

  const handleGetTrends = () => {
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywordList.length === 0) return;

    getTrends({
      keywords: keywordList,
      timeframe,
      region
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Google Trends Analysis
        </CardTitle>
        <CardDescription>
          Analyze keyword trends and seasonal patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords</label>
            <Input
              placeholder="keyword1, keyword2, keyword3"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Timeframe</label>
            <Select value={timeframe} onValueChange={(value) => setTimeframe(value as typeof timeframe)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
                <SelectItem value="5y">Last 5 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Region</label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleGetTrends} 
          disabled={loading || !keywords.trim()}
          className="flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          Analyze Trends
        </Button>

        {/* Results */}
        {trendsData?.data && (
          <div className="space-y-6">
            {trendsData.data.trends.map((trend, index) => (
              <Card key={index} className="p-4">
                <h3 className="text-lg font-semibold mb-4">{trend.keyword}</h3>
                
                {/* Related Queries */}
                {trend.related_queries.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Related Queries</h4>
                    <div className="flex flex-wrap gap-2">
                      {trend.related_queries.slice(0, 10).map((query, queryIndex) => (
                        <Badge key={queryIndex} variant="outline">{query}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seasonal Patterns */}
                {Object.keys(trend.seasonal_patterns).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Seasonal Patterns</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
                      {Object.entries(trend.seasonal_patterns).map(([month, value]) => (
                        <div key={month} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>{month}</span>
                          <span className="font-medium">{(value as number).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ExternalSEOTools() {
  const { data: sourcesData } = useSEOSources();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">External SEO Tools</h1>
        <p className="text-muted-foreground">
          Leverage external SEO data sources for comprehensive keyword research
        </p>
      </div>

      {/* Available Sources Status */}
      {sourcesData?.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Available Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sourcesData.data.sources.map((source, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{source.name}</h3>
                    <Badge variant={source.status === 'active' ? 'default' : source.status === 'limited' ? 'secondary' : 'destructive'}>
                      {source.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Features: {source.features.join(', ')}
                  </div>
                  {Object.keys(source.rate_limits).length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Rate limits: {Object.entries(source.rate_limits).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tools */}
      <div className="grid grid-cols-1 gap-6">
        <KeywordResearchPanel />
        <CompetitorAnalysisPanel />
        <TrendsAnalysisPanel />
      </div>
    </div>
  );
}