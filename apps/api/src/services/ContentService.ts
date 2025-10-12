/**
 * K2W Content Service
 * Business logic layer for AI content generation and management
 */

import { 
  K2WContentRecord, 
  K2WKeywordRecord,
  K2WClusterRecord,
  CreateK2WContent,
  CONTENT_STATUS
} from '@k2w/database';
import { 
  contentRepository, 
  keywordRepository, 
  clusterRepository 
} from '../repositories/K2WRepositoryOptimized';
import { PaginationOptions, FilterOptions } from '../types/common';

export interface ContentGenerationOptions {
  contentType: 'blog_post' | 'product_description' | 'landing_page' | 'article';
  wordCount: number;
  language: string;
  tone: 'professional' | 'casual' | 'technical' | 'friendly';
  includeImages: boolean;
  includeSchema: boolean;
  autoPublish: boolean;
}

export interface ContentGenerationResult {
  contentId: string;
  keywordId: string;
  title: string;
  wordCount: number;
  seoScore: number;
  readabilityScore: number;
  status: string;
  generatedAt: string;
}

export interface ContentOptimizationOptions {
  goals: string[];
  targetKeyword?: string;
  focusAreas?: string[];
}

export interface ContentOptimizationResult {
  optimizedContentId: string;
  improvements: string[];
  seoScoreBefore: number;
  seoScoreAfter: number;
  optimizedAt: string;
}

export class ContentService {

  /**
   * Generate AI content for a specific keyword
   */
  async generateContent(
    keywordId: string,
    options: ContentGenerationOptions
  ): Promise<ContentGenerationResult> {
    // Get keyword and cluster data
    const keyword = await keywordRepository.findById(keywordId);
    if (!keyword) {
      throw new Error('Keyword not found');
    }

    let cluster: K2WClusterRecord | null = null;
    if (keyword.cluster_id) {
      cluster = await clusterRepository.findById(keyword.cluster_id);
    }

    // Update keyword status to generating
    await keywordRepository.update(keywordId, { 
      status: 'generating_text' as any 
    });

    try {
      // Generate content using AI (simplified implementation)
      const generatedContent = await this.generateAIContent(keyword, cluster, options);
      
      // Create content record
    const contentData = {
      title: generatedContent.title,
      body: generatedContent.body,
      body_html: generatedContent.body, // Same as body for now
      meta_title: generatedContent.metaTitle,
      meta_description: generatedContent.metaDescription,
      keyword_id: keyword.id,
      cluster_id: keyword.cluster_id || '',
      project_id: keyword.project_id,
      region: keyword.region,
      content_type: 'article' as any, // Fixed type for now
      language: keyword.language,
      status: CONTENT_STATUS.DRAFT,
      word_count: generatedContent.body.split(' ').length,
      headings: [],
      faqs: [],
      links: [],
      internal_links: [],
      external_links: [],
      images: [],
      seo_score: 0,
      ai_metadata: {
        model_version: 'gpt-4',
        prompt_template_version: '1.0',
        generation_time: new Date().toISOString(),
        revision_count: 0
      }
    };      const content = await contentRepository.create(contentData);

      // Update keyword status
      await keywordRepository.update(keywordId, { 
        status: options.autoPublish ? 'published' as any : 'ready_to_publish' as any
      });

      return {
        contentId: content.id,
        keywordId,
        title: content.title,
        wordCount: content.word_count || 0,
        seoScore: generatedContent.seoScore,
        readabilityScore: generatedContent.readabilityScore,
        status: content.status,
        generatedAt: content.created_at || new Date().toISOString()
      };

    } catch (error) {
      // Update keyword status to failed
      await keywordRepository.update(keywordId, { status: 'failed' as any });
      throw error;
    }
  }

  /**
   * Optimize existing content
   */
  async optimizeContent(
    contentId: string,
    options: ContentOptimizationOptions
  ): Promise<ContentOptimizationResult> {
    const content = await contentRepository.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    const keyword = await keywordRepository.findById(content.keyword_id);
    if (!keyword) {
      throw new Error('Associated keyword not found');
    }

    // Perform AI optimization (simplified)
    const optimizationResult = await this.performAIOptimization(
      content.body,
      options.targetKeyword || keyword.keyword,
      options.goals
    );

    // Update content with optimized version
    const updatedContent = await contentRepository.update(contentId, {
      body: optimizationResult.optimizedContent,
      ai_metadata: {
        model_version: content.ai_metadata.model_version,
        prompt_template_version: content.ai_metadata.prompt_template_version,
        generation_time: content.ai_metadata.generation_time,
        revision_count: content.ai_metadata.revision_count + 1
      }
    });

    return {
      optimizedContentId: updatedContent.id,
      improvements: optimizationResult.improvements,
      seoScoreBefore: 75, // Mock score
      seoScoreAfter: optimizationResult.seoScore,
      optimizedAt: new Date().toISOString()
    };
  }

  /**
   * Get content with filters and pagination
   */
  async getContent(
    projectId: string,
    pagination: PaginationOptions = { page: 1, limit: 10 },
    filters: FilterOptions = {}
  ): Promise<K2WContentRecord[]> {
    return await contentRepository.findByProjectId(projectId, filters.status);
  }

  /**
   * Get content by ID
   */
  async getContentById(contentId: string): Promise<K2WContentRecord | null> {
    return await contentRepository.findById(contentId);
  }

  /**
   * Update content status
   */
  async updateContentStatus(contentId: string, status: string): Promise<K2WContentRecord> {
    return await contentRepository.update(contentId, { status: status as any });
  }

  /**
   * Get content ready for publishing
   */
  async getContentReadyForPublish(projectId: string): Promise<K2WContentRecord[]> {
    return await contentRepository.getReadyToPublish(projectId);
  }

  /**
   * Get published content
   */
  async getPublishedContent(projectId: string): Promise<K2WContentRecord[]> {
    return await contentRepository.findByStatus(CONTENT_STATUS.PUBLISHED, projectId);
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<boolean> {
    throw new Error('Content deletion not implemented in current database service');
  }

  /**
   * Batch generate content for multiple keywords
   */
  async batchGenerateContent(
    keywordIds: string[],
    options: ContentGenerationOptions
  ): Promise<ContentGenerationResult[]> {
    const results: ContentGenerationResult[] = [];
    
    for (const keywordId of keywordIds) {
      try {
        const result = await this.generateContent(keywordId, options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to generate content for keyword ${keywordId}:`, error);
        // Continue with other keywords
      }
    }

    return results;
  }

  // Private helper methods

  private async generateAIContent(
    keyword: K2WKeywordRecord,
    cluster: K2WClusterRecord | null,
    options: ContentGenerationOptions
  ): Promise<{
    title: string;
    body: string;
    bodyHtml: string;
    metaTitle: string;
    metaDescription: string;
    wordCount: number;
    headings: Array<{ level: number; text: string }>;
    faqs: Array<{ question: string; answer: string }>;
    internalLinks: string[];
    externalLinks: string[];
    images: string[];
    seoScore: number;
    readabilityScore: number;
  }> {
    // Simplified AI content generation
    // In production, this would call the OpenAI API
    
    const title = `Complete Guide to ${keyword.keyword}`;
    const body = this.generateBasicContent(keyword.keyword, options.wordCount);
    const bodyHtml = this.convertToHtml(body);
    
    const headings = [
      { level: 2, text: `What is ${keyword.keyword}?` },
      { level: 2, text: `Benefits of ${keyword.keyword}` },
      { level: 2, text: `How to Choose ${keyword.keyword}` },
      { level: 2, text: `Best Practices` },
      { level: 2, text: `Conclusion` }
    ];

    const faqs = [
      {
        question: `What are the main benefits of ${keyword.keyword}?`,
        answer: `${keyword.keyword} offers numerous benefits including improved efficiency and cost savings.`
      },
      {
        question: `How much does ${keyword.keyword} cost?`,
        answer: `The cost of ${keyword.keyword} varies depending on specific requirements and scale.`
      }
    ];

    return {
      title,
      body,
      bodyHtml,
      metaTitle: `${keyword.keyword} - Complete Guide | OSG Global`,
      metaDescription: `Discover everything about ${keyword.keyword}. Expert insights, tips, and solutions from OSG Global.`,
      wordCount: options.wordCount,
      headings,
      faqs,
      internalLinks: [],
      externalLinks: [],
      images: options.includeImages ? [`${keyword.keyword}-image-1.jpg`] : [],
      seoScore: this.calculateSEOScore(body, keyword.keyword),
      readabilityScore: this.calculateReadabilityScore(body)
    };
  }

  private async performAIOptimization(
    content: string,
    targetKeyword: string,
    goals: string[]
  ): Promise<{
    optimizedContent: string;
    improvements: string[];
    seoScore: number;
  }> {
    // Simplified optimization logic
    // In production, this would use AI optimization
    
    const optimizedContent = content.replace(
      /\b(important|good|great)\b/g,
      'excellent'
    );

    const improvements = [
      'Improved keyword density',
      'Enhanced readability',
      'Better heading structure',
      'Added internal links'
    ];

    return {
      optimizedContent,
      improvements,
      seoScore: 85
    };
  }

  private generateBasicContent(keyword: string, wordCount: number): string {
    // Generate basic content structure
    const sections = [
      `# ${keyword}\n\n${keyword} is an important topic that requires comprehensive understanding.`,
      `## What is ${keyword}?\n\n${keyword} refers to a specific concept or product that provides value to users.`,
      `## Benefits of ${keyword}\n\nThe key benefits include:\n- Improved efficiency\n- Cost savings\n- Better results`,
      `## How to Choose ${keyword}\n\nWhen selecting ${keyword}, consider:\n1. Quality requirements\n2. Budget constraints\n3. Long-term goals`,
      `## Best Practices\n\nTo get the most out of ${keyword}:\n- Follow industry standards\n- Regular maintenance\n- Continuous monitoring`,
      `## Conclusion\n\n${keyword} is essential for modern operations. By following this guide, you can make informed decisions.`
    ];

    return sections.join('\n\n');
  }

  private convertToHtml(markdown: string): string {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  private calculateSEOScore(content: string, keyword: string): number {
    let score = 0;
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    
    // Keyword density check (2-4% is good)
    const wordCount = content.split(/\s+/).length;
    const keywordCount = (lowerContent.match(new RegExp(lowerKeyword, 'g')) || []).length;
    const density = (keywordCount / wordCount) * 100;
    
    if (density >= 2 && density <= 4) score += 30;
    else if (density >= 1 && density <= 6) score += 20;
    
    // Length check
    if (wordCount >= 1000) score += 25;
    else if (wordCount >= 500) score += 15;
    
    // Heading structure
    if (content.includes('##')) score += 20;
    if (content.includes('###')) score += 10;
    
    // Content structure
    if (content.includes('Benefits')) score += 10;
    if (content.includes('Conclusion')) score += 5;
    
    return Math.min(100, score);
  }

  private calculateReadabilityScore(content: string): number {
    // Simplified readability calculation
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    let score = 100;
    if (avgWordsPerSentence > 20) score -= 10;
    if (avgWordsPerSentence > 25) score -= 15;
    if (avgWordsPerSentence > 30) score -= 20;
    
    return Math.max(0, score);
  }
}

export const contentService = new ContentService();