/**
 * K2W Workflow Engine
 * Implements Section 4.2 - End-to-End Workflow Summary
 * Automates the complete K2W pipeline from keywords to published content
 */

import { k2wDb, 
  K2WKeywordRecord, 
  K2WContentRecord, 
  K2WClusterRecord,
  KEYWORD_STATUS,
  CONTENT_STATUS,
  JOB_STATUS,
  JOB_TYPES,
  SEARCH_INTENT,
  CreateK2WKeyword,
  CreateK2WCluster,
  CreateK2WContent
} from '@k2w/database';

export interface WorkflowJob {
  id: string;
  type: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  metadata: any;
}

export interface KeywordClusteringResult {
  clusters: Array<{
    topic: string;
    keywords: string[];
    primary_keyword: string;
    search_intent: string;
  }>;
  unprocessed: string[];
}

export interface ContentGenerationResult {
  content_id: string;
  keyword_id: string;
  title: string;
  word_count: number;
  seo_score: number;
  readability_score: number;
  generated_at: string;
}

/**
 * Stage 1: Keyword Input & Clustering
 * Validates, deduplicates, and clusters keywords by topic similarity
 */
export class KeywordClusteringStage {
  
  async processKeywordInput(
    keywords: string[],
    projectId: string,
    language: string,
    region: string,
    source: 'manual' | 'csv' | 'ahrefs' | 'semrush' = 'manual'
  ): Promise<K2WKeywordRecord[]> {
    
    // Step 1: Validate and deduplicate keywords
    const uniqueKeywords = [...new Set(keywords.filter(k => k.trim().length > 0))];
    
    const keywordRecords: K2WKeywordRecord[] = [];
    
    for (const keyword of uniqueKeywords) {
      try {
        // Check if keyword already exists
        const existingKeywords = await k2wDb.getKeywordsByProjectId(projectId);
        const exists = existingKeywords.some((k: K2WKeywordRecord) => 
          k.keyword.toLowerCase() === keyword.toLowerCase() && 
          k.region === region && 
          k.language === language
        );
        
        if (!exists) {
          const keywordRecord = await k2wDb.createKeyword({
            keyword: keyword.trim(),
            region,
            language,
            project_id: projectId,
            status: KEYWORD_STATUS.PENDING,
            search_intent: this.detectSearchIntent(keyword),
            metadata: {
              source,
              imported_at: new Date().toISOString(),
              last_updated: new Date().toISOString()
            }
          });
          
          keywordRecords.push(keywordRecord);
        }
      } catch (error) {
        console.error(`Failed to create keyword "${keyword}":`, error);
      }
    }
    
    // Step 2: Queue for clustering
    if (keywordRecords.length > 0) {
      await this.queueForClustering(keywordRecords);
    }
    
    return keywordRecords;
  }
  
  private detectSearchIntent(keyword: string): typeof SEARCH_INTENT[keyof typeof SEARCH_INTENT] {
    const transactionalWords = ['buy', 'purchase', 'order', 'price', 'cost', 'cheap', 'discount'];
    const navigationalWords = ['login', 'contact', 'about', 'homepage'];
    const commercialWords = ['review', 'compare', 'best', 'top', 'vs'];
    
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
  
  private async queueForClustering(keywords: K2WKeywordRecord[]): Promise<void> {
    // Update status to clustering
    const keywordIds = keywords.map(k => k.id);
    await k2wDb.bulkUpdateKeywordStatus(keywordIds, KEYWORD_STATUS.CLUSTERING);
    
    // In a real implementation, this would queue a background job
    // For now, we'll process immediately
    await this.performClustering(keywords);
  }
  
  private async performClustering(keywords: K2WKeywordRecord[]): Promise<void> {
    // Simple clustering by word similarity (in production, use AI clustering)
    const clusters: Map<string, K2WKeywordRecord[]> = new Map();
    
    for (const keyword of keywords) {
      const topic = this.extractTopic(keyword.keyword);
      
      if (!clusters.has(topic)) {
        clusters.set(topic, []);
      }
      
      clusters.get(topic)!.push(keyword);
    }
    
    // Create cluster records
    for (const [topic, clusterKeywords] of clusters.entries()) {
      if (clusterKeywords.length > 0) {
        const primaryKeyword = clusterKeywords[0];
        
        const cluster = await k2wDb.createCluster({
          name: `${topic}-cluster`,
          topic,
          project_id: primaryKeyword.project_id,
          language: primaryKeyword.language,
          region: primaryKeyword.region,
          keyword_count: clusterKeywords.length,
          primary_keyword: primaryKeyword.keyword,
          related_keywords: clusterKeywords.map(k => k.keyword),
          content_structure: {
            suggested_title: `Ultimate Guide to ${topic}`,
            h2_topics: [
              `What is ${topic}?`,
              `Benefits of ${topic}`,
              `How to Choose ${topic}`,
              `${topic} Best Practices`
            ],
            faq_questions: [
              `What are the main benefits of ${topic}?`,
              `How much does ${topic} cost?`,
              `Where can I get ${topic}?`
            ]
          }
        });
        
        // Update keywords with cluster_id
        for (const keyword of clusterKeywords) {
          await k2wDb.updateKeyword(keyword.id, {
            cluster_id: cluster.id,
            status: KEYWORD_STATUS.CLUSTERED
          });
        }
      }
    }
  }
  
  private extractTopic(keyword: string): string {
    // Simple topic extraction (in production, use NLP)
    const words = keyword.toLowerCase().split(' ');
    
    // Remove common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const meaningfulWords = words.filter(word => !stopWords.includes(word));
    
    // Return the first meaningful word as topic
    return meaningfulWords[0] || 'general';
  }
}

/**
 * Stage 2: AI Content Generation
 * Generates SEO-optimized content using AI based on keyword clusters
 */
export class ContentGenerationStage {
  
  async processContentGeneration(
    clusterId: string,
    keywordId: string,
    options: {
      contentType: string;
      wordCount: number;
      language: string;
      autoPublish: boolean;
    }
  ): Promise<ContentGenerationResult> {
    
    // Get cluster and keyword data
    const cluster = await k2wDb.getClusterById(clusterId);
    const keyword = await k2wDb.getKeywordById(keywordId);
    
    if (!cluster || !keyword) {
      throw new Error('Cluster or keyword not found');
    }
    
    // Update keyword status
    await k2wDb.updateKeywordStatus(keywordId, KEYWORD_STATUS.GENERATING_TEXT);
    
    try {
      // Generate content structure
      const contentData: CreateK2WContent = {
        title: cluster.content_structure.suggested_title.replace(cluster.topic, keyword.keyword),
        body: this.generateBasicContent(keyword.keyword, cluster, options.wordCount),
        body_html: this.generateHTMLContent(keyword.keyword, cluster, options.wordCount),
        meta_title: `${keyword.keyword} - Complete Guide`,
        meta_description: `Discover everything about ${keyword.keyword}. Expert insights, tips, and solutions.`,
        keyword_id: keywordId,
        cluster_id: clusterId,
        project_id: keyword.project_id,
        content_type: options.contentType as any,
        language: options.language,
        region: keyword.region,
        status: CONTENT_STATUS.DRAFT,
        word_count: options.wordCount,
        headings: cluster.content_structure.h2_topics.map((topic: string, index: number) => ({
          level: 2,
          text: topic
        })),
        faqs: cluster.content_structure.faq_questions.map((question: string) => ({
          question,
          answer: `This is a comprehensive answer about ${question.toLowerCase()}.`
        })),
        internal_links: [],
        external_links: [],
        images: [],
        ai_metadata: {
          model_version: 'gpt-4',
          prompt_template_version: '1.0',
          generation_time: new Date().toISOString(),
          revision_count: 0
        }
      };
      
      const content = await k2wDb.createContent(contentData);
      
      // Update keyword status
      await k2wDb.updateKeywordStatus(keywordId, KEYWORD_STATUS.GENERATING_IMAGES);
      
      return {
        content_id: content.id,
        keyword_id: keywordId,
        title: content.title,
        word_count: content.word_count || 0,
        seo_score: 75, // Mock score
        readability_score: 80, // Mock score
        generated_at: new Date().toISOString()
      };
      
    } catch (error) {
      await k2wDb.updateKeywordStatus(keywordId, KEYWORD_STATUS.FAILED);
      throw error;
    }
  }
  
  private generateBasicContent(keyword: string, cluster: K2WClusterRecord, wordCount: number): string {
    // This is a placeholder - in production, this would call OpenAI API
    return `
# ${keyword}

${keyword} is an important topic in the ${cluster.topic} industry. This comprehensive guide covers everything you need to know.

## What is ${keyword}?

${keyword} refers to [detailed explanation]. Understanding ${keyword} is crucial for anyone working in this field.

## Benefits of ${keyword}

The key benefits of ${keyword} include:
- Improved efficiency
- Cost savings
- Better results
- Enhanced productivity

## How to Choose ${keyword}

When selecting ${keyword}, consider these factors:
1. Quality requirements
2. Budget constraints
3. Long-term goals
4. Technical specifications

## Best Practices for ${keyword}

To get the most out of ${keyword}, follow these best practices:
- Regular maintenance
- Proper implementation
- Continuous monitoring
- Regular updates

## Conclusion

${keyword} is essential for modern operations. By following this guide, you'll be able to make informed decisions about ${keyword}.
    `.trim();
  }
  
  private generateHTMLContent(keyword: string, cluster: K2WClusterRecord, wordCount: number): string {
    // Convert markdown-like content to HTML
    const content = this.generateBasicContent(keyword, cluster, wordCount);
    
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/<li>/g, '<ul><li>')
      .replace(/<\/li>(?=<p>)/g, '</li></ul>');
  }
}

/**
 * K2W Workflow Orchestrator
 * Coordinates the entire K2W pipeline
 */
export class K2WWorkflowOrchestrator {
  private keywordStage = new KeywordClusteringStage();
  private contentStage = new ContentGenerationStage();
  
  async processKeywordToContent(
    keywords: string[],
    projectId: string,
    options: {
      language: string;
      region: string;
      contentType: string;
      wordCount: number;
      autoPublish: boolean;
      source?: 'manual' | 'csv' | 'ahrefs' | 'semrush';
    }
  ): Promise<{
    keywordsProcessed: number;
    contentGenerated: number;
    clustersCreated: number;
    results: ContentGenerationResult[];
  }> {
    
    // Stage 1: Process keywords and create clusters
    const keywordRecords = await this.keywordStage.processKeywordInput(
      keywords,
      projectId,
      options.language,
      options.region,
      options.source
    );
    
    // Wait for clustering to complete (in production, this would be async)
    await this.waitForClustering(keywordRecords);
    
    // Stage 2: Generate content for each keyword
    const contentResults: ContentGenerationResult[] = [];
    
    for (const keyword of keywordRecords) {
      try {
        if (keyword.cluster_id && keyword.status === KEYWORD_STATUS.CLUSTERED) {
          const result = await this.contentStage.processContentGeneration(
            keyword.cluster_id,
            keyword.id,
            {
              contentType: options.contentType,
              wordCount: options.wordCount,
              language: options.language,
              autoPublish: options.autoPublish
            }
          );
          
          contentResults.push(result);
        }
      } catch (error) {
        console.error(`Failed to generate content for keyword ${keyword.keyword}:`, error);
      }
    }
    
    // Get unique clusters count
    const clusterIds = new Set(keywordRecords.map(k => k.cluster_id).filter(Boolean));
    
    return {
      keywordsProcessed: keywordRecords.length,
      contentGenerated: contentResults.length,
      clustersCreated: clusterIds.size,
      results: contentResults
    };
  }
  
  private async waitForClustering(keywords: K2WKeywordRecord[]): Promise<void> {
    // Simple wait implementation - in production, use proper job queue monitoring
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update keywords from database to get cluster_id
    for (let i = 0; i < keywords.length; i++) {
      const updated = await k2wDb.getKeywordById(keywords[i].id);
      if (updated) {
        keywords[i] = updated;
      }
    }
  }
  
  async getWorkflowStatus(projectId: string): Promise<{
    totalKeywords: number;
    pendingKeywords: number;
    clusteredKeywords: number;
    contentDraft: number;
    contentPublished: number;
  }> {
    const keywords = await k2wDb.getKeywordsByProjectId(projectId);
    const content = await k2wDb.getContentsByProjectId(projectId);
    
    return {
      totalKeywords: keywords.length,
      pendingKeywords: keywords.filter((k: K2WKeywordRecord) => k.status === KEYWORD_STATUS.PENDING).length,
      clusteredKeywords: keywords.filter((k: K2WKeywordRecord) => k.status === KEYWORD_STATUS.CLUSTERED).length,
      contentDraft: content.filter((c: K2WContentRecord) => c.status === CONTENT_STATUS.DRAFT).length,
      contentPublished: content.filter((c: K2WContentRecord) => c.status === CONTENT_STATUS.PUBLISHED).length,
    };
  }
}

export const k2wWorkflow = new K2WWorkflowOrchestrator();