/**
 * External SEO Controller
 * Handles external SEO analysis and monitoring operations
 */

import { Request, Response, NextFunction } from 'express';
import { externalSEOAPIService } from '../services/external-seo-api.service';
import { ResponseHandler, ValidationHelper } from '../common/response.handler';

export class ExternalSeoController {
  /**
   * Get comprehensive keyword data from multiple sources
   */
  async getKeywordData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const seed_keywords = req.body.seed_keywords || req.body.keywords;
      const target_country = req.body.target_country || req.body.region || 'US';
      const { include_competitors = true } = req.body;

      if (!seed_keywords || !Array.isArray(seed_keywords)) {
        ResponseHandler.badRequest(res, 'seed_keywords or keywords must be an array');
        return;
      }

      const data = await externalSEOAPIService.getKeywordData(
        seed_keywords, 
        target_country, 
        include_competitors
      );

      ResponseHandler.success(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get keyword suggestions for a topic
   */
  async getKeywordSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = req.body.topic || req.body.seed_keyword;
      const limit = String(req.body.limit || req.body.count || '100');

      if (!topic) {
        ResponseHandler.badRequest(res, 'topic or seed_keyword is required');
        return;
      }

      const suggestions = await externalSEOAPIService.getKeywordSuggestions(topic, limit);

      ResponseHandler.success(res, { suggestions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyze competitors for given keywords
   */
  async analyzeCompetitors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const domain = req.body.domain || 'seo';
      const keywords = req.body.keywords || [domain];
      const competitor_domains = req.body.competitor_domains || req.body.competitors || [];

      if (!Array.isArray(keywords)) {
        ResponseHandler.badRequest(res, 'keywords must be an array');
        return;
      }

      const competitors = await externalSEOAPIService.analyzeCompetitors(keywords, competitor_domains);

      ResponseHandler.success(res, { competitors });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Google Trends data
   */
  async getGoogleTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keywords, timeframe = '12m' } = req.body;
      const geo = req.body.geo || req.body.region || 'US';

      if (!keywords || !Array.isArray(keywords)) {
        ResponseHandler.badRequest(res, 'keywords must be an array');
        return;
      }

      const trends = await externalSEOAPIService.getGoogleTrends(keywords, timeframe, geo);

      ResponseHandler.success(res, trends);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Combine metrics from multiple sources
   */
  async combineKeywordMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keywords } = req.body;

      if (!Array.isArray(keywords)) {
        ResponseHandler.badRequest(res, 'keywords must be an array');
        return;
      }

      const metrics = await externalSEOAPIService.combineKeywordMetrics(keywords);

      ResponseHandler.success(res, metrics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch keyword research with rate limiting
   */
  async batchKeywordResearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keyword_batches, batch_size = 10 } = req.body;

      if (!Array.isArray(keyword_batches)) {
        ResponseHandler.badRequest(res, 'keyword_batches must be an array');
        return;
      }

      const results = await externalSEOAPIService.batchKeywordResearch(keyword_batches, batch_size);

      ResponseHandler.success(res, results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available SEO data sources
   */
  async getAvailableSources(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sources = await externalSEOAPIService.getAvailableSources();

      ResponseHandler.success(res, sources);
    } catch (error) {
      next(error);
    }
  }
}