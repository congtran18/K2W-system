/**
 * External SEO Controller
 * Handles external SEO API requests with proper error handling
 */

import { Request, Response } from 'express';
import { ResponseHandler, ValidationHelper } from '../common/response.handler';
import { externalSEOAPIService } from '../services/external-seo-api.service';
import { 
  KeywordResearchDto, 
  KeywordSuggestionsDto, 
  CompetitorAnalysisDto,
  TrendsAnalysisDto 
} from '../dto/index.dto';
import { 
  KeywordResearchRequest,
  KeywordSuggestionsRequest,
  CompetitorAnalysisRequest,
  TrendsAnalysisRequest 
} from '../types/external-seo.types';

export class ExternalSeoController {
  /**
   * POST /api/k2w/seo-external/keywords/research
   * Perform comprehensive keyword research
   */
  async researchKeywords(req: Request, res: Response): Promise<Response> {
    try {
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['seed_keywords']);
      if (missingFields.length > 0) {
        return ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
      }

      const { seed_keywords, target_country = 'US', include_competitors = true } = req.body as KeywordResearchRequest;

      if (!Array.isArray(seed_keywords) || seed_keywords.length === 0) {
        return ResponseHandler.badRequest(res, 'seed_keywords must be a non-empty array');
      }

      const keywordData = await externalSEOAPIService.getKeywordData(
        seed_keywords,
        target_country,
        include_competitors
      );

      return ResponseHandler.success(res, keywordData, 'Keyword research completed successfully');

    } catch (error: any) {
      console.error('Keyword research error:', error);
      return ResponseHandler.internalError(res, 'Failed to perform keyword research');
    }
  }

  /**
   * GET /api/k2w/seo-external/keywords/suggestions
   * Get keyword suggestions for a topic
   */
  async getKeywordSuggestions(req: Request, res: Response): Promise<Response> {
    try {
      const { topic, limit = '50' } = req.query;

      if (!topic) {
        return ResponseHandler.badRequest(res, 'Topic parameter is required', ['topic']);
      }

      const suggestions = await externalSEOAPIService.getKeywordSuggestions(
        topic as string,
        limit as string
      );

      return ResponseHandler.success(res, suggestions, 'Keyword suggestions retrieved successfully');

    } catch (error: any) {
      console.error('Keyword suggestions error:', error);
      return ResponseHandler.internalError(res, 'Failed to get keyword suggestions');
    }
  }

  /**
   * POST /api/k2w/seo-external/competitors/analyze
   * Analyze competitors for given keywords
   */
  async analyzeCompetitors(req: Request, res: Response): Promise<Response> {
    try {
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['keywords']);
      if (missingFields.length > 0) {
        return ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
      }

      const { keywords, competitor_domains = [] } = req.body as CompetitorAnalysisRequest;

      if (!Array.isArray(keywords) || keywords.length === 0) {
        return ResponseHandler.badRequest(res, 'keywords must be a non-empty array');
      }

      const analysis = await externalSEOAPIService.analyzeCompetitors(
        keywords,
        competitor_domains
      );

      return ResponseHandler.success(res, analysis, 'Competitor analysis completed successfully');

    } catch (error: any) {
      console.error('Competitor analysis error:', error);
      return ResponseHandler.internalError(res, 'Failed to analyze competitors');
    }
  }

  /**
   * GET /api/k2w/seo-external/trends/google
   * Get Google Trends data for keywords
   */
  async getGoogleTrends(req: Request, res: Response): Promise<Response> {
    try {
      const { keywords, timeframe = '12m', geo = 'US' } = req.query;

      if (!keywords) {
        return ResponseHandler.badRequest(res, 'Keywords parameter is required', ['keywords']);
      }

      const keywordList = typeof keywords === 'string' ? keywords.split(',') : [];
      
      if (keywordList.length === 0) {
        return ResponseHandler.badRequest(res, 'At least one keyword is required');
      }

      const trendsData = await externalSEOAPIService.getGoogleTrends(
        keywordList,
        timeframe as string,
        geo as string
      );

      return ResponseHandler.success(res, trendsData, 'Google Trends data retrieved successfully');

    } catch (error: any) {
      console.error('Google Trends error:', error);
      return ResponseHandler.internalError(res, 'Failed to get Google Trends data');
    }
  }

  /**
   * POST /api/k2w/seo-external/keywords/combine-metrics
   * Combine metrics from multiple SEO tools
   */
  async combineKeywordMetrics(req: Request, res: Response): Promise<Response> {
    try {
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['keywords']);
      if (missingFields.length > 0) {
        return ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
      }

      const { keywords } = req.body;

      if (!Array.isArray(keywords) || keywords.length === 0) {
        return ResponseHandler.badRequest(res, 'keywords must be a non-empty array');
      }

      const combinedMetrics = await externalSEOAPIService.combineKeywordMetrics(keywords);

      return ResponseHandler.success(res, combinedMetrics, 'Keyword metrics combined successfully');

    } catch (error: any) {
      console.error('Combine metrics error:', error);
      return ResponseHandler.internalError(res, 'Failed to combine keyword metrics');
    }
  }

  /**
   * POST /api/k2w/seo-external/keywords/batch-research
   * Perform batch keyword research with rate limiting
   */
  async batchKeywordResearch(req: Request, res: Response): Promise<Response> {
    try {
      const missingFields = ValidationHelper.validateRequiredFields(req.body, ['keyword_batches']);
      if (missingFields.length > 0) {
        return ResponseHandler.badRequest(res, 'Missing required fields', missingFields);
      }

      const { keyword_batches, batch_size = 10 } = req.body;

      if (!Array.isArray(keyword_batches) || keyword_batches.length === 0) {
        return ResponseHandler.badRequest(res, 'keyword_batches must be a non-empty array');
      }

      const results = await externalSEOAPIService.batchKeywordResearch(
        keyword_batches,
        batch_size
      );

      return ResponseHandler.success(res, results, 'Batch keyword research completed successfully');

    } catch (error: any) {
      console.error('Batch research error:', error);
      return ResponseHandler.internalError(res, 'Failed to perform batch keyword research');
    }
  }

  /**
   * GET /api/k2w/seo-external/config/sources
   * Get available SEO data sources and their status
   */
  async getAvailableSources(req: Request, res: Response): Promise<Response> {
    try {
      const sources = await externalSEOAPIService.getAvailableSources();

      return ResponseHandler.success(res, sources, 'Available sources retrieved successfully');

    } catch (error: any) {
      console.error('Get sources error:', error);
      return ResponseHandler.internalError(res, 'Failed to get available sources');
    }
  }
}

export const externalSeoController = new ExternalSeoController();