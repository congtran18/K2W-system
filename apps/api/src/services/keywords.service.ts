/**
 * Keywords Service
 * Handles keyword research, processing, and storage
 */

import { externalSEOAPIService } from './external-seo-api.service';

export interface KeywordData {
  id: string;
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  search_intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  trend_data: number[];
  related_keywords: string[];
  questions: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  target_language: string;
  region: string;
  created_at: string;
  updated_at: string;
}

export interface KeywordProcessingResult {
  processing_id: string;
  submitted_keywords: string[];
  target_language: string;
  region: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  processed_count: number;
  total_count: number;
  results: KeywordData[];
  created_at: string;
}

export class KeywordsService {
  private processingJobs: Map<string, KeywordProcessingResult> = new Map();

  /**
   * Submit keywords for processing
   */
  async submitKeywords(
    keywords: string[],
    target_language: string = 'en',
    region: string = 'US'
  ): Promise<KeywordProcessingResult> {
    const processing_id = 'proc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const processingResult: KeywordProcessingResult = {
      processing_id,
      submitted_keywords: keywords,
      target_language,
      region,
      status: 'queued',
      processed_count: 0,
      total_count: keywords.length,
      results: [],
      created_at: new Date().toISOString()
    };

    this.processingJobs.set(processing_id, processingResult);

    // Start processing in background
    this.processKeywordsInBackground(processing_id);

    return processingResult;
  }

  /**
   * Get keyword by ID
   */
  async getKeyword(id: string): Promise<KeywordData | null> {
    try {
      // In production, this would query from database
      // const query = 'SELECT * FROM keywords WHERE id = $1';
      // const result = await db.query(query, [id]);
      // return result.rows[0] || null;

      // For now, search in processing results
      for (const job of this.processingJobs.values()) {
        const keyword = job.results.find(k => k.id === id);
        if (keyword) return keyword;
      }

      return null;
    } catch (error) {
      console.error('Error getting keyword:', error);
      return null;
    }
  }

  /**
   * List keywords with filters
   */
  async listKeywords(options: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty_min?: number;
    difficulty_max?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    keywords: KeywordData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      difficulty_min,
      difficulty_max,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = options;

    try {
      // In production, this would be a proper database query with filters
      let allKeywords: KeywordData[] = [];
      
      // Collect keywords from all processing jobs
      for (const job of this.processingJobs.values()) {
        allKeywords.push(...job.results);
      }

      // Apply filters
      let filteredKeywords = allKeywords;

      if (search) {
        const searchLower = search.toLowerCase();
        filteredKeywords = filteredKeywords.filter(k => 
          k.keyword.toLowerCase().includes(searchLower)
        );
      }

      if (difficulty_min !== undefined) {
        filteredKeywords = filteredKeywords.filter(k => k.difficulty >= difficulty_min);
      }

      if (difficulty_max !== undefined) {
        filteredKeywords = filteredKeywords.filter(k => k.difficulty <= difficulty_max);
      }

      // Sort
      filteredKeywords.sort((a, b) => {
        let aVal: any = a[sort_by as keyof KeywordData];
        let bVal: any = b[sort_by as keyof KeywordData];

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (sort_order === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });

      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedKeywords = filteredKeywords.slice(startIndex, endIndex);

      return {
        keywords: paginatedKeywords,
        pagination: {
          page,
          limit,
          total: filteredKeywords.length,
          total_pages: Math.ceil(filteredKeywords.length / limit)
        }
      };

    } catch (error) {
      console.error('Error listing keywords:', error);
      return {
        keywords: [],
        pagination: { page, limit, total: 0, total_pages: 0 }
      };
    }
  }

  /**
   * Update keyword data
   */
  async updateKeyword(id: string, updateData: Partial<KeywordData>): Promise<KeywordData | null> {
    try {
      // In production, this would update the database
      // const query = 'UPDATE keywords SET ... WHERE id = $1 RETURNING *';
      // const result = await db.query(query, [id, ...values]);
      // return result.rows[0] || null;

      // For now, update in memory
      for (const job of this.processingJobs.values()) {
        const keywordIndex = job.results.findIndex(k => k.id === id);
        if (keywordIndex !== -1) {
          job.results[keywordIndex] = {
            ...job.results[keywordIndex],
            ...updateData,
            updated_at: new Date().toISOString()
          };
          return job.results[keywordIndex];
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating keyword:', error);
      return null;
    }
  }

  /**
   * Delete keyword
   */
  async deleteKeyword(id: string): Promise<boolean> {
    try {
      // In production, this would delete from database
      // const query = 'DELETE FROM keywords WHERE id = $1';
      // const result = await db.query(query, [id]);
      // return result.rowCount > 0;

      // For now, remove from memory
      for (const job of this.processingJobs.values()) {
        const keywordIndex = job.results.findIndex(k => k.id === id);
        if (keywordIndex !== -1) {
          job.results.splice(keywordIndex, 1);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error deleting keyword:', error);
      return false;
    }
  }

  /**
   * Get processing status
   */
  async getProcessingStatus(processing_id: string): Promise<KeywordProcessingResult | null> {
    return this.processingJobs.get(processing_id) || null;
  }

  /**
   * Process keywords in background
   */
  private async processKeywordsInBackground(processing_id: string): Promise<void> {
    const job = this.processingJobs.get(processing_id);
    if (!job) return;

    try {
      job.status = 'processing';
      
      for (let i = 0; i < job.submitted_keywords.length; i++) {
        const keyword = job.submitted_keywords[i];
        
        try {
          // Get comprehensive keyword data from external APIs
          const keywordMetrics = await externalSEOAPIService.getKeywordMetrics(
            keyword,
            job.region,
            job.target_language
          );

          const keywordData: KeywordData = {
            id: `kw_${Date.now()}_${i}`,
            keyword: keywordMetrics.keyword,
            search_volume: keywordMetrics.search_volume,
            difficulty: keywordMetrics.keyword_difficulty,
            cpc: keywordMetrics.cpc,
            competition: keywordMetrics.competition,
            search_intent: keywordMetrics.search_intent,
            trend_data: keywordMetrics.trend_data,
            related_keywords: keywordMetrics.related_keywords,
            questions: keywordMetrics.questions,
            status: 'completed',
            target_language: job.target_language,
            region: job.region,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          job.results.push(keywordData);
          job.processed_count++;

          // In production, save to database here
          // await this.saveKeywordToDatabase(keywordData);

        } catch (error) {
          console.error(`Error processing keyword "${keyword}":`, error);
          
          // Add failed keyword entry
          const failedKeyword: KeywordData = {
            id: `kw_${Date.now()}_${i}_failed`,
            keyword,
            search_volume: 0,
            difficulty: 0,
            cpc: 0,
            competition: 'low',
            search_intent: 'informational',
            trend_data: [],
            related_keywords: [],
            questions: [],
            status: 'failed',
            target_language: job.target_language,
            region: job.region,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          job.results.push(failedKeyword);
          job.processed_count++;
        }

        // Add delay to respect API rate limits
        if (i < job.submitted_keywords.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      job.status = 'completed';
      
    } catch (error) {
      console.error('Error in background processing:', error);
      job.status = 'failed';
    }
  }
}

export const keywordsService = new KeywordsService();