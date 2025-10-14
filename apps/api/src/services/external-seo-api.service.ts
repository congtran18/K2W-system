/**
 * External SEO API Integration Service
 * Integrates with Ahrefs, SEMrush, and Google Trends for keyword research
 */

import axios from 'axios';

export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  keyword_difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  search_intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  trend_data: number[];
  related_keywords: string[];
  questions: string[];
  serp_features: string[];
}

export interface AhrefsKeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  clicks: number;
  traffic_potential: number;
  parent_topic: string;
  related_terms: string[];
}

export interface SEMrushKeywordData {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  trend: number[];
  phrase_match_keywords: string[];
  related_keywords: string[];
  intent: string;
}

export interface GoogleTrendsData {
  keyword: string;
  interest_over_time: Array<{ date: string; value: number }>;
  related_queries: {
    top: Array<{ query: string; value: number }>;
    rising: Array<{ query: string; value: number }>;
  };
  geo_distribution: Array<{ location: string; value: number }>;
}

export class ExternalSEOAPIService {
  private ahrefsApiKey: string;
  private semrushApiKey: string;
  private googleTrendsEnabled: boolean;
  private config: any;

  constructor() {
    this.ahrefsApiKey = process.env.AHREFS_API_KEY || '';
    this.semrushApiKey = process.env.SEMRUSH_API_KEY || '';
    this.googleTrendsEnabled = process.env.GOOGLE_TRENDS_ENABLED === 'true';
    this.config = {
      ahrefs: { api_key: this.ahrefsApiKey },
      semrush: { api_key: this.semrushApiKey }
    };
  }

  /**
   * Get comprehensive keyword data from multiple sources
   */
  async getKeywordData(
    seedKeywords: string[],
    targetCountry: string = 'US',
    includeCompetitors: boolean = true
  ): Promise<KeywordMetrics[]> {
    const results: KeywordMetrics[] = [];

    for (const keyword of seedKeywords) {
      const metrics = await this.getKeywordMetrics(keyword, targetCountry);
      if (includeCompetitors) {
        const competitors = await this.analyzeCompetitors([keyword]);
        metrics.related_keywords = [...metrics.related_keywords, ...competitors.slice(0, 5)];
      }
      results.push(metrics);
    }

    return results;
  }

  /**
   * Get keyword suggestions for a topic
   */
  async getKeywordSuggestions(topic: string, limit: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Get suggestions from multiple sources
    const ahrefsSuggestions = await this.getAhrefsKeywordSuggestions(topic);
    const semrushSuggestions = await this.getSEMrushKeywordSuggestions(topic);
    
    suggestions.push(...ahrefsSuggestions.slice(0, parseInt(limit) / 2));
    suggestions.push(...semrushSuggestions.slice(0, parseInt(limit) / 2));
    
    return [...new Set(suggestions)].slice(0, parseInt(limit));
  }

  /**
   * Analyze competitors for given keywords
   */
  async analyzeCompetitors(keywords: string[], competitorDomains: string[] = []): Promise<string[]> {
    const competitors: string[] = [];
    
    for (const keyword of keywords) {
      const keywordCompetitors = await this.getKeywordCompetitors(keyword);
      competitors.push(...keywordCompetitors);
    }
    
    return [...new Set(competitors)];
  }

  /**
   * Get Google Trends data
   */
  async getGoogleTrends(
    keywords: string[],
    timeframe: string = '12m',
    geo: string = 'US'
  ): Promise<GoogleTrendsData[]> {
    const trendsData: GoogleTrendsData[] = [];
    
    for (const keyword of keywords) {
      const data = await this.getGoogleTrendsForKeyword(keyword, timeframe, geo);
      trendsData.push(data);
    }
    
    return trendsData;
  }

  /**
   * Combine metrics from multiple sources
   */
  async combineKeywordMetrics(keywords: string[]): Promise<KeywordMetrics[]> {
    const combinedMetrics: KeywordMetrics[] = [];
    
    for (const keyword of keywords) {
      const metrics = await this.getKeywordMetrics(keyword);
      combinedMetrics.push(metrics);
    }
    
    return combinedMetrics;
  }

  /**
   * Batch keyword research with rate limiting
   */
  async batchKeywordResearch(
    keywordBatches: string[][],
    batchSize: number = 10
  ): Promise<KeywordMetrics[][]> {
    const results: KeywordMetrics[][] = [];
    
    for (let i = 0; i < keywordBatches.length; i += batchSize) {
      const batch = keywordBatches.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(keywords => this.getKeywordData(keywords))
      );
      results.push(...batchResults);
      
      // Rate limiting delay
      if (i + batchSize < keywordBatches.length) {
        await this.delay(1000);
      }
    }
    
    return results;
  }

  /**
   * Get available SEO data sources
   */
  async getAvailableSources(): Promise<Array<{ name: string; status: string; api_limit: number }>> {
    return [
      {
        name: 'Ahrefs',
        status: this.config.ahrefs.api_key ? 'active' : 'inactive',
        api_limit: 1000
      },
      {
        name: 'SEMrush',
        status: this.config.semrush.api_key ? 'active' : 'inactive',
        api_limit: 10000
      },
      {
        name: 'Google Trends',
        status: 'active',
        api_limit: 1500
      }
    ];
  }

  /**
   * Helper methods for API integrations
   */
  private async getAhrefsKeywordSuggestions(topic: string): Promise<string[]> {
    if (!this.ahrefsApiKey) {
      console.warn('Ahrefs API key not configured');
      return [];
    }

    try {
      const response = await axios.get('https://apiv2.ahrefs.com', {
        params: {
          token: this.ahrefsApiKey,
          target: topic,
          mode: 'phrase',
          output: 'json',
          limit: 100
        },
        timeout: 10000
      });

      return response.data.keywords?.map((item: any) => item.keyword) || [];
    } catch (error: any) {
      console.error('Ahrefs keyword suggestions error:', error.message);
      return [];
    }
  }

  private async getSEMrushKeywordSuggestions(topic: string): Promise<string[]> {
    if (!this.semrushApiKey) {
      console.warn('SEMrush API key not configured');
      return [];
    }

    try {
      const response = await axios.get('https://api.semrush.com', {
        params: {
          type: 'phrase_related',
          key: this.semrushApiKey,
          phrase: topic,
          database: 'us',
          export_columns: 'Ph',
          export_limit: 100
        },
        timeout: 10000
      });

      const lines = response.data.split('\n').slice(1); // Skip header
      return lines.map((line: string) => line.split(';')[0]).filter(Boolean);
    } catch (error: any) {
      console.error('SEMrush keyword suggestions error:', error.message);
      return [];
    }
  }

  private async getKeywordCompetitors(keyword: string): Promise<string[]> {
    if (!this.ahrefsApiKey && !this.semrushApiKey) {
      console.warn('No SEO API keys configured for competitor analysis');
      return [];
    }

    const competitors: string[] = [];

    try {
      // Try Ahrefs first
      if (this.ahrefsApiKey) {
        const ahrefsResponse = await axios.get('https://apiv2.ahrefs.com', {
          params: {
            token: this.ahrefsApiKey,
            target: keyword,
            mode: 'exact',
            output: 'json'
          },
          timeout: 10000
        });

        const ahrefsCompetitors = ahrefsResponse.data.competitors?.map((c: any) => c.domain) || [];
        competitors.push(...ahrefsCompetitors);
      }

      // Try SEMrush if Ahrefs didn't work or as backup
      if (this.semrushApiKey && competitors.length === 0) {
        const semrushResponse = await axios.get('https://api.semrush.com', {
          params: {
            type: 'phrase_organic',
            key: this.semrushApiKey,
            phrase: keyword,
            database: 'us',
            export_columns: 'Dn',
            export_limit: 10
          },
          timeout: 10000
        });

        const lines = semrushResponse.data.split('\n').slice(1);
        const semrushCompetitors = lines.map((line: string) => line.split(';')[0]).filter(Boolean);
        competitors.push(...semrushCompetitors);
      }

    } catch (error: any) {
      console.error('Competitor analysis error:', error.message);
    }

    return [...new Set(competitors)].slice(0, 10);
  }

  private async getGoogleTrendsForKeyword(
    keyword: string,
    timeframe: string,
    geo: string
  ): Promise<GoogleTrendsData> {
    if (!this.googleTrendsEnabled) {
      console.warn('Google Trends not enabled');
      return this.getEmptyTrendsData(keyword);
    }

    try {
      // Using google-trends-api package or similar
      const gtrendsAPI = require('google-trends-api');
      
      const interestOverTimeResponse = await gtrendsAPI.interestOverTime({
        keyword,
        startTime: this.getStartTimeFromPeriod(timeframe),
        geo: geo.toUpperCase()
      });

      const relatedQueriesResponse = await gtrendsAPI.relatedQueries({
        keyword,
        startTime: this.getStartTimeFromPeriod(timeframe),
        geo: geo.toUpperCase()
      });

      const interestByRegionResponse = await gtrendsAPI.interestByRegion({
        keyword,
        startTime: this.getStartTimeFromPeriod(timeframe),
        geo: geo.toUpperCase()
      });

      return {
        keyword,
        interest_over_time: this.parseInterestOverTime(JSON.parse(interestOverTimeResponse)),
        related_queries: this.parseRelatedQueries(JSON.parse(relatedQueriesResponse)),
        geo_distribution: this.parseGeoDistribution(JSON.parse(interestByRegionResponse))
      };

    } catch (error: any) {
      console.error('Google Trends API error:', error.message);
      return this.getEmptyTrendsData(keyword);
    }
  }
  async getKeywordMetrics(
    keyword: string,
    region: string = 'US',
    language: string = 'en'
  ): Promise<KeywordMetrics> {
    const [ahrefsData, semrushData, trendsData] = await Promise.allSettled([
      this.getAhrefsData(keyword, region),
      this.getSEMrushData(keyword, region),
      this.getGoogleTrendsData(keyword)
    ]);

    // Combine data from all sources
    const combinedMetrics = this.combineKeywordData(
      keyword,
      ahrefsData.status === 'fulfilled' ? ahrefsData.value : null,
      semrushData.status === 'fulfilled' ? semrushData.value : null,
      trendsData.status === 'fulfilled' ? trendsData.value : null
    );

    return combinedMetrics;
  }

  /**
   * Fetch keyword data from Ahrefs API
   */
  private async getAhrefsData(keyword: string, region: string): Promise<AhrefsKeywordData | null> {
    if (!this.ahrefsApiKey) {
      console.warn('Ahrefs API key not configured');
      return null;
    }

    try {
      const response = await axios.get('https://apiv2.ahrefs.com', {
        params: {
          token: this.ahrefsApiKey,
          target: keyword,
          mode: 'exact',
          country: region.toLowerCase(),
          output: 'json'
        },
        timeout: 10000
      });

      const data = response.data;
      
      return {
        keyword,
        volume: data.volume || 0,
        difficulty: data.difficulty || 0,
        cpc: data.cpc || 0,
        clicks: data.clicks || 0,
        traffic_potential: data.traffic_potential || 0,
        parent_topic: data.parent_topic || '',
        related_terms: data.related_terms || []
      };

    } catch (error: any) {
      console.error('Ahrefs API error:', error.message);
      return null;
    }
  }

  /**
   * Fetch keyword data from SEMrush API
   */
  private async getSEMrushData(keyword: string, region: string): Promise<SEMrushKeywordData | null> {
    if (!this.semrushApiKey) {
      console.warn('SEMrush API key not configured');
      return null;
    }

    try {
      const response = await axios.get('https://api.semrush.com', {
        params: {
          type: 'phrase_this',
          key: this.semrushApiKey,
          phrase: keyword,
          database: region.toLowerCase(),
          export_columns: 'Ph,Nq,Cp,Co,Nr,Td'
        },
        timeout: 10000
      });

      const data = this.parseSEMrushResponse(response.data);
      
      return {
        keyword,
        volume: data.volume || 0,
        cpc: data.cpc || 0,
        competition: data.competition || 0,
        trend: data.trend || [],
        phrase_match_keywords: data.phrase_match || [],
        related_keywords: data.related || [],
        intent: this.determineSearchIntent(keyword)
      };

    } catch (error: any) {
      console.error('SEMrush API error:', error.message);
      return null;
    }
  }

  /**
   * Fetch trending data from Google Trends
   */
  private async getGoogleTrendsData(keyword: string): Promise<GoogleTrendsData | null> {
    if (!this.googleTrendsEnabled) {
      console.warn('Google Trends not enabled');
      return null;
    }

    try {
      // Using unofficial Google Trends API or implementing pytrends equivalent
      const response = await axios.get('https://trends.google.com/trends/api/explore', {
        params: {
          hl: 'en-US',
          tz: -420,
          req: JSON.stringify({
            comparisonItem: [{ keyword, geo: '', time: 'today 12-m' }],
            category: 0,
            property: ''
          })
        }
      });

      // Parse Google Trends response (simplified)
      return {
        keyword,
        interest_over_time: this.parseInterestOverTime(response.data),
        related_queries: this.parseRelatedQueries(response.data),
        geo_distribution: this.parseGeoDistribution(response.data)
      };

    } catch (error: any) {
      console.error('Google Trends API error:', error.message);
      return null;
    }
  }

  /**
   * Combine data from multiple sources into unified metrics
   */
  private combineKeywordData(
    keyword: string,
    ahrefs: AhrefsKeywordData | null,
    semrush: SEMrushKeywordData | null,
    trends: GoogleTrendsData | null
  ): KeywordMetrics {
    // Use average or most reliable source for each metric
    const volume = this.getAverageVolume(ahrefs?.volume, semrush?.volume);
    const difficulty = ahrefs?.difficulty || semrush?.competition || 50;
    const cpc = this.getAverageCPC(ahrefs?.cpc, semrush?.cpc);
    
    return {
      keyword,
      search_volume: volume,
      keyword_difficulty: difficulty,
      cpc,
      competition: this.categorizeCompetition(difficulty),
      search_intent: this.determineSearchIntent(keyword),
      trend_data: trends?.interest_over_time.map(d => d.value) || [],
      related_keywords: [
        ...(ahrefs?.related_terms || []),
        ...(semrush?.related_keywords || [])
      ].slice(0, 20),
      questions: this.generateQuestions(keyword),
      serp_features: this.identifySERPFeatures(keyword)
    };
  }

  /**
   * Batch process multiple keywords
   */
  async batchGetKeywordMetrics(
    keywords: string[],
    region: string = 'US',
    language: string = 'en'
  ): Promise<Record<string, KeywordMetrics>> {
    const results: Record<string, KeywordMetrics> = {};
    const batchSize = 10; // Process in batches to respect rate limits

    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (keyword) => {
        try {
          const metrics = await this.getKeywordMetrics(keyword, region, language);
          return { keyword, metrics };
        } catch (error) {
          console.error(`Failed to get metrics for keyword: ${keyword}`, error);
          return { keyword, metrics: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ keyword, metrics }) => {
        if (metrics) {
          results[keyword] = metrics;
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < keywords.length) {
        await this.delay(2000);
      }
    }

    return results;
  }

  /**
   * Get keyword suggestions based on seed keyword (original method)
   */
  async getKeywordSuggestionsOriginal(
    seedKeyword: string,
    region: string = 'US',
    limit: number = 100
  ): Promise<string[]> {
    const suggestions: Set<string> = new Set();

    try {
      // Get suggestions from Ahrefs
      if (this.ahrefsApiKey) {
        const ahrefsSuggestions = await this.getAhrefsSuggestions(seedKeyword, region, limit);
        ahrefsSuggestions.forEach(s => suggestions.add(s));
      }

      // Get suggestions from SEMrush
      if (this.semrushApiKey) {
        const semrushSuggestions = await this.getSEMrushSuggestions(seedKeyword, region, limit);
        semrushSuggestions.forEach(s => suggestions.add(s));
      }

      // Generate additional suggestions using patterns
      const patternSuggestions = this.generateKeywordPatterns(seedKeyword);
      patternSuggestions.forEach(s => suggestions.add(s));

    } catch (error) {
      console.error('Error getting keyword suggestions:', error);
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Helper methods
   */
  private getAverageVolume(vol1?: number, vol2?: number): number {
    if (vol1 && vol2) return Math.round((vol1 + vol2) / 2);
    return vol1 || vol2 || 0;
  }

  private getAverageCPC(cpc1?: number, cpc2?: number): number {
    if (cpc1 && cpc2) return Math.round((cpc1 + cpc2) / 2 * 100) / 100;
    return cpc1 || cpc2 || 0;
  }

  private categorizeCompetition(difficulty: number): 'low' | 'medium' | 'high' {
    if (difficulty < 30) return 'low';
    if (difficulty < 60) return 'medium';
    return 'high';
  }

  private determineSearchIntent(keyword: string): 'informational' | 'transactional' | 'navigational' | 'commercial' {
    const transactionalWords = ['buy', 'purchase', 'order', 'cheap', 'discount', 'deal'];
    const informationalWords = ['what', 'how', 'why', 'guide', 'tutorial', 'tips'];
    const commercialWords = ['best', 'top', 'review', 'compare', 'vs'];

    const lowerKeyword = keyword.toLowerCase();

    if (transactionalWords.some(word => lowerKeyword.includes(word))) {
      return 'transactional';
    }
    if (informationalWords.some(word => lowerKeyword.includes(word))) {
      return 'informational';
    }
    if (commercialWords.some(word => lowerKeyword.includes(word))) {
      return 'commercial';
    }

    return 'informational'; // Default
  }

  private generateQuestions(keyword: string): string[] {
    const questionStarters = [
      'What is',
      'How to',
      'Why does',
      'Where can I',
      'When should',
      'Which is best'
    ];

    return questionStarters.map(starter => `${starter} ${keyword}?`);
  }

  private identifySERPFeatures(keyword: string): string[] {
    // This would be enhanced with actual SERP analysis
    return ['featured_snippet', 'people_also_ask', 'local_pack', 'image_pack'];
  }

  private async getAhrefsSuggestions(seed: string, region: string, limit: number): Promise<string[]> {
    // Implementation for Ahrefs keyword suggestions
    return [];
  }

  private async getSEMrushSuggestions(seed: string, region: string, limit: number): Promise<string[]> {
    // Implementation for SEMrush keyword suggestions
    return [];
  }

  private generateKeywordPatterns(seed: string): string[] {
    const patterns = [
      `${seed} guide`,
      `${seed} tips`,
      `${seed} review`,
      `best ${seed}`,
      `${seed} for beginners`,
      `${seed} vs`,
      `how to use ${seed}`,
      `${seed} benefits`,
      `${seed} cost`,
      `${seed} comparison`
    ];

    return patterns;
  }

  private parseSEMrushResponse(data: string): any {
    // Parse SEMrush CSV response format
    const lines = data.split('\n');
    const headers = lines[0].split(';');
    const values = lines[1]?.split(';') || [];

    const parsed: any = {};
    headers.forEach((header, index) => {
      parsed[header] = values[index];
    });

    return {
      volume: parseInt(parsed.Nq) || 0,
      cpc: parseFloat(parsed.Cp) || 0,
      competition: parseFloat(parsed.Co) || 0
    };
  }

  private parseInterestOverTime(data: any): Array<{ date: string; value: number }> {
    try {
      const timeline = data.default?.timelineData || [];
      return timeline.map((item: any) => ({
        date: new Date(item.time * 1000).toISOString().slice(0, 7), // YYYY-MM format
        value: item.value?.[0] || 0
      }));
    } catch (error) {
      console.error('Error parsing interest over time data:', error);
      return [];
    }
  }

  private parseRelatedQueries(data: any): { top: Array<{ query: string; value: number }>; rising: Array<{ query: string; value: number }> } {
    try {
      const relatedQueries = data.default?.rankedList || [];
      const top = relatedQueries.find((list: any) => list.rankedKeyword)?.rankedKeyword || [];
      const rising = relatedQueries.find((list: any) => list.rankedKeyword)?.rankedKeyword || [];

      return {
        top: top.slice(0, 10).map((item: any) => ({
          query: item.topic?.title || '',
          value: item.value || 0
        })),
        rising: rising.slice(0, 10).map((item: any) => ({
          query: item.topic?.title || '',
          value: item.value || 0
        }))
      };
    } catch (error) {
      console.error('Error parsing related queries data:', error);
      return { top: [], rising: [] };
    }
  }

  private parseGeoDistribution(data: any): Array<{ location: string; value: number }> {
    try {
      const geoMap = data.default?.geoMapData || [];
      return geoMap.slice(0, 10).map((item: any) => ({
        location: item.geoName || '',
        value: item.value?.[0] || 0
      }));
    } catch (error) {
      console.error('Error parsing geo distribution data:', error);
      return [];
    }
  }

  private getEmptyTrendsData(keyword: string): GoogleTrendsData {
    return {
      keyword,
      interest_over_time: [],
      related_queries: { top: [], rising: [] },
      geo_distribution: []
    };
  }

  private getStartTimeFromPeriod(timeframe: string): Date {
    const now = new Date();
    const timeMap: { [key: string]: number } = {
      '1h': 1,
      '4h': 4,
      '1d': 24,
      '7d': 24 * 7,
      '1m': 24 * 30,
      '3m': 24 * 90,
      '12m': 24 * 365,
      '5y': 24 * 365 * 5
    };

    const hours = timeMap[timeframe] || 24 * 365; // Default to 1 year
    return new Date(now.getTime() - hours * 60 * 60 * 1000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get API usage statistics
   */
  async getAPIUsageStats(): Promise<{
    ahrefs: { requests_used: number; requests_limit: number };
    semrush: { requests_used: number; requests_limit: number };
    status: string;
  }> {
    return {
      ahrefs: { requests_used: 0, requests_limit: 1000 },
      semrush: { requests_used: 0, requests_limit: 10000 },
      status: 'operational'
    };
  }
}

export const externalSEOAPIService = new ExternalSEOAPIService();