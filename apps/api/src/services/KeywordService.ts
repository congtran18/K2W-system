/**
 * K2W Keyword Service
 * Business logic layer for keyword management
 */

import { 
  K2WKeywordRecord, 
  K2WClusterRecord,
  CreateK2WKeyword,
  CreateK2WCluster,
  KEYWORD_STATUS,
  SEARCH_INTENT
} from '@k2w/database';
import { keywordRepository, clusterRepository } from '../repositories/K2WRepositoryOptimized';
import { PaginationOptions, FilterOptions } from '../types/common';

export interface KeywordImportOptions {
  projectId: string;
  language: string;
  region: string;
  source: 'manual' | 'csv' | 'ahrefs' | 'semrush';
  autoClustering: boolean;
}

export interface KeywordImportResult {
  imported: number;
  duplicates: number;
  invalid: number;
  clustered: number;
  keywords: K2WKeywordRecord[];
}

export interface KeywordClusteringOptions {
  method: 'semantic' | 'topical' | 'intent-based';
  maxClusters?: number;
  minClusterSize?: number;
}

export interface KeywordClusteringResult {
  clustersCreated: number;
  keywordsClustered: number;
  unclustered: number;
  clusters: K2WClusterRecord[];
}

export class KeywordService {
  
  /**
   * Import and validate keywords
   */
  async importKeywords(
    keywords: string[], 
    options: KeywordImportOptions
  ): Promise<KeywordImportResult> {
    const result: KeywordImportResult = {
      imported: 0,
      duplicates: 0,
      invalid: 0,
      clustered: 0,
      keywords: []
    };

    // Validate and deduplicate keywords
    const uniqueKeywords = [...new Set(keywords.filter(k => this.validateKeyword(k)))];
    result.invalid = keywords.length - uniqueKeywords.length;

    // Check for existing keywords
    const existingKeywords = await keywordRepository.findByProjectId(options.projectId);
    const existingKeywordTexts = new Set(
      existingKeywords.map(k => `${k.keyword}_${k.language}_${k.region}`)
    );

    // Filter out duplicates
    const newKeywords = uniqueKeywords.filter(keyword => {
      const key = `${keyword}_${options.language}_${options.region}`;
      return !existingKeywordTexts.has(key);
    });

    result.duplicates = uniqueKeywords.length - newKeywords.length;

    // Create keyword records
    const keywordData: CreateK2WKeyword[] = newKeywords.map(keyword => ({
      keyword: keyword.trim(),
      project_id: options.projectId,
      language: options.language,
      region: options.region,
      status: KEYWORD_STATUS.PENDING,
      search_intent: this.detectSearchIntent(keyword),
      metadata: {
        source: options.source,
        imported_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }
    }));

    if (keywordData.length > 0) {
      result.keywords = await keywordRepository.bulkCreate(keywordData);
      result.imported = result.keywords.length;

      // Auto-clustering if enabled
      if (options.autoClustering) {
        const clusteringResult = await this.clusterKeywords(
          result.keywords.map(k => k.id),
          { method: 'semantic' }
        );
        result.clustered = clusteringResult.keywordsClustered;
      }
    }

    return result;
  }

  /**
   * Cluster keywords using various methods
   */
  async clusterKeywords(
    keywordIds: string[],
    options: KeywordClusteringOptions
  ): Promise<KeywordClusteringResult> {
    const keywords = await Promise.all(
      keywordIds.map(id => keywordRepository.findById(id))
    );
    const validKeywords = keywords.filter(Boolean) as K2WKeywordRecord[];

    if (validKeywords.length === 0) {
      throw new Error('No valid keywords found for clustering');
    }

    const result: KeywordClusteringResult = {
      clustersCreated: 0,
      keywordsClustered: 0,
      unclustered: 0,
      clusters: []
    };

    // Simple clustering algorithm (in production, use AI-based clustering)
    const clusters = this.performBasicClustering(validKeywords, options);

    // Create cluster records
    for (const clusterData of clusters) {
      const cluster = await clusterRepository.create({
        name: clusterData.name,
        topic: clusterData.topic,
        project_id: validKeywords[0].project_id,
        language: validKeywords[0].language,
        region: validKeywords[0].region,
        keyword_count: clusterData.keywords.length,
        primary_keyword: clusterData.primaryKeyword,
        related_keywords: clusterData.keywords.map(k => k.keyword),
        content_structure: this.generateContentStructure(clusterData.topic, clusterData.keywords)
      });

      result.clusters.push(cluster);
      result.clustersCreated++;

      // Update keywords with cluster_id
      for (const keyword of clusterData.keywords) {
        await keywordRepository.update(keyword.id, {
          cluster_id: cluster.id,
          status: KEYWORD_STATUS.CLUSTERED
        });
        result.keywordsClustered++;
      }
    }

    return result;
  }

  /**
   * Get keywords with filters and pagination
   */
  async getKeywords(
    projectId: string,
    pagination: PaginationOptions = { page: 1, limit: 10 },
    filters: FilterOptions = {}
  ): Promise<{ keywords: K2WKeywordRecord[]; total: number }> {
    const keywords = await keywordRepository.findByProjectId(projectId, filters.status);
    const total = await keywordRepository.count(projectId);
    
    // Apply pagination manually
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    
    return {
      keywords: keywords.slice(start, end),
      total
    };
  }

  /**
   * Update keyword status
   */
  async updateKeywordStatus(keywordId: string, status: string): Promise<K2WKeywordRecord> {
    return await keywordRepository.updateStatus(keywordId, status);
  }

  /**
   * Bulk update keyword status
   */
  async bulkUpdateKeywordStatus(keywordIds: string[], status: string): Promise<void> {
    await keywordRepository.bulkUpdateStatus(keywordIds, status);
  }

  /**
   * Get keywords ready for content generation
   */
  async getKeywordsReadyForGeneration(projectId: string): Promise<K2WKeywordRecord[]> {
    return await keywordRepository.findByStatus(KEYWORD_STATUS.CLUSTERED, projectId);
  }

  /**
   * Delete keyword
   */
  async deleteKeyword(keywordId: string): Promise<boolean> {
    throw new Error('Keyword deletion not implemented in current database service');
  }

  // Private helper methods

  private validateKeyword(keyword: string): boolean {
    if (!keyword || keyword.trim().length === 0) return false;
    if (keyword.length > 100) return false;
    if (keyword.length < 2) return false;
    
    // Check for valid characters (letters, numbers, spaces, hyphens)
    const validPattern = /^[a-zA-Z0-9\s\-_.]+$/;
    return validPattern.test(keyword);
  }

  private detectSearchIntent(keyword: string): typeof SEARCH_INTENT[keyof typeof SEARCH_INTENT] {
    const transactionalWords = ['buy', 'purchase', 'order', 'price', 'cost', 'cheap', 'discount', 'sale'];
    const navigationalWords = ['login', 'contact', 'about', 'homepage', 'website'];
    const commercialWords = ['review', 'compare', 'best', 'top', 'vs', 'versus', 'alternative'];
    
    const lowerKeyword = keyword.toLowerCase();
    
    if (transactionalWords.some(word => lowerKeyword.includes(word))) {
      return SEARCH_INTENT.TRANSACTIONAL;
    }
    
    if (navigationalWords.some(word => lowerKeyword.includes(word))) {
      return SEARCH_INTENT.NAVIGATIONAL;
    }
    
    if (commercialWords.some(word => lowerKeyword.includes(word))) {
      return SEARCH_INTENT.COMMERCIAL;
    }
    
    return SEARCH_INTENT.INFORMATIONAL;
  }

  private performBasicClustering(
    keywords: K2WKeywordRecord[], 
    options: KeywordClusteringOptions
  ): Array<{
    name: string;
    topic: string;
    keywords: K2WKeywordRecord[];
    primaryKeyword: string;
  }> {
    // Simple clustering by word similarity and search intent
    const clusters: Map<string, K2WKeywordRecord[]> = new Map();
    
    for (const keyword of keywords) {
      let clusterKey = this.extractClusterKey(keyword.keyword, options.method);
      
      // Include search intent in clustering for intent-based method
      if (options.method === 'intent-based') {
        clusterKey = `${clusterKey}_${keyword.search_intent}`;
      }
      
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      
      clusters.get(clusterKey)!.push(keyword);
    }
    
    // Convert to result format and filter small clusters
    const minSize = options.minClusterSize || 1;
    const result: Array<{
      name: string;
      topic: string;
      keywords: K2WKeywordRecord[];
      primaryKeyword: string;
    }> = [];
    
    for (const [clusterKey, clusterKeywords] of clusters.entries()) {
      if (clusterKeywords.length >= minSize) {
        const topic = clusterKey.split('_')[0];
        const primaryKeyword = this.selectPrimaryKeyword(clusterKeywords);
        
        result.push({
          name: `${topic}-cluster`,
          topic,
          keywords: clusterKeywords,
          primaryKeyword: primaryKeyword.keyword
        });
      }
    }
    
    // Limit number of clusters if specified
    if (options.maxClusters && result.length > options.maxClusters) {
      // Sort by cluster size and take largest clusters
      result.sort((a, b) => b.keywords.length - a.keywords.length);
      return result.slice(0, options.maxClusters);
    }
    
    return result;
  }

  private extractClusterKey(keyword: string, method: string): string {
    const words = keyword.toLowerCase().split(' ');
    
    // Remove common stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const meaningfulWords = words.filter(word => !stopWords.includes(word));
    
    switch (method) {
      case 'semantic':
        // Use the most common meaningful word
        return meaningfulWords[0] || words[0] || 'general';
        
      case 'topical':
        // Use combination of first two meaningful words
        return meaningfulWords.slice(0, 2).join('-') || words.slice(0, 2).join('-') || 'general';
        
      case 'intent-based':
        // Group by root word + intent will be added later
        return meaningfulWords[0] || words[0] || 'general';
        
      default:
        return meaningfulWords[0] || words[0] || 'general';
    }
  }

  private selectPrimaryKeyword(keywords: K2WKeywordRecord[]): K2WKeywordRecord {
    // Select the keyword with highest potential (for now, just return first)
    // In production, consider search volume, competition, etc.
    return keywords[0];
  }

  private generateContentStructure(topic: string, keywords: K2WKeywordRecord[]): any {
    const primaryKeyword = keywords[0].keyword;
    
    return {
      suggested_title: `Complete Guide to ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
      h2_topics: [
        `What is ${primaryKeyword}?`,
        `Benefits of ${primaryKeyword}`,
        `How to Choose ${primaryKeyword}`,
        `${primaryKeyword} Best Practices`,
        `Conclusion`
      ],
      faq_questions: [
        `What are the main benefits of ${primaryKeyword}?`,
        `How much does ${primaryKeyword} cost?`,
        `Where can I get ${primaryKeyword}?`,
        `Is ${primaryKeyword} right for my needs?`
      ],
      internal_links: [],
      related_terms: keywords.slice(1).map(k => k.keyword)
    };
  }
}

export const keywordService = new KeywordService();