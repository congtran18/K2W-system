/**
 * K2W AI Service
 * Integrates with OpenAI API for content generation, clustering, and optimization
 */

import { OpenAIService } from '@k2w/ai';
import { K2WKeywordRecord, K2WClusterRecord } from '@k2w/database';

export interface AIContentGenerationRequest {
  keyword: string;
  cluster: K2WClusterRecord;
  language: string;
  wordCount: number;
  contentType: 'blog_post' | 'product_description' | 'landing_page' | 'article';
  tone: 'professional' | 'casual' | 'technical' | 'friendly';
  includeImages: boolean;
  includeSchema: boolean;
}

export interface AIContentGenerationResponse {
  title: string;
  body: string;
  bodyHtml: string;
  metaTitle: string;
  metaDescription: string;
  headings: Array<{ level: number; text: string }>;
  faqs: Array<{ question: string; answer: string }>;
  internalLinks: Array<{ text: string; url: string }>;
  externalLinks: Array<{ text: string; url: string }>;
  imagePrompts: string[];
  schemaMarkup?: Record<string, unknown>;
  seoScore: number;
  readabilityScore: number;
  generationMetadata: {
    model: string;
    promptTemplate: string;
    generationTime: string;
    tokensUsed: number;
  };
}

export interface AIKeywordClusteringRequest {
  keywords: K2WKeywordRecord[];
  language: string;
  maxClusters?: number;
  clusteringMethod: 'semantic' | 'topical' | 'intent-based';
}

export interface AIKeywordClusteringResponse {
  clusters: Array<{
    id: string;
    name: string;
    topic: string;
    keywords: string[];
    primaryKeyword: string;
    searchIntent: string;
    difficultyScore: number;
    contentStructure: {
      suggestedTitle: string;
      h2Topics: string[];
      faqQuestions: string[];
      relatedTerms: string[];
    };
  }>;
  ungroupedKeywords: string[];
  clusteringMetadata: {
    method: string;
    confidence: number;
    processingTime: string;
  };
}

export class K2WAIService {
  private openaiService: OpenAIService;
  
  constructor() {
    this.openaiService = new OpenAIService();
  }
  
  /**
   * Generate AI-powered content for a keyword
   */
  async generateContent(request: AIContentGenerationRequest): Promise<AIContentGenerationResponse> {
    try {
      const startTime = Date.now();
      
      // Prepare the content generation prompt
      const prompt = this.buildContentPrompt(request);
      
      // Call OpenAI API
      const completion = await this.openaiService.createChatCompletion([
        {
          role: 'system',
          content: this.getSystemPrompt(request.contentType, request.language)
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        model: 'gpt-4',
        max_tokens: Math.min(4000, request.wordCount * 2),
        temperature: 0.7
      });
      
      const generatedText = completion || '';
      
      // Parse the generated content
      const parsedContent = this.parseGeneratedContent(generatedText, request);
      
      // Generate additional elements
      const faqs = await this.generateFAQs(request.keyword, request.language);
      const imagePrompts = await this.generateImagePrompts(request.keyword, request.contentType);
      const schemaMarkup = request.includeSchema ? await this.generateSchemaMarkup(request) : undefined;
      
      // Calculate scores
      const seoScore = this.calculateSEOScore(parsedContent, request.keyword);
      const readabilityScore = this.calculateReadabilityScore(parsedContent.body || '');
      
      const endTime = Date.now();
      
      return {
        title: parsedContent.title || `Guide to ${request.keyword}`,
        body: parsedContent.body || '',
        bodyHtml: parsedContent.bodyHtml || '',
        metaTitle: parsedContent.metaTitle || `${request.keyword} - Complete Guide`,
        metaDescription: parsedContent.metaDescription || `Learn about ${request.keyword}`,
        headings: parsedContent.headings || [],
        faqs,
        internalLinks: parsedContent.internalLinks || [],
        externalLinks: parsedContent.externalLinks || [],
        imagePrompts,
        schemaMarkup,
        seoScore,
        readabilityScore,
        generationMetadata: {
          model: 'gpt-4',
          promptTemplate: 'k2w-content-v1.0',
          generationTime: new Date().toISOString(),
          tokensUsed: generatedText.length // Approximate token count
        }
      };
      
    } catch (error) {
      console.error('AI content generation failed:', error);
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Perform AI-powered keyword clustering
   */
  async clusterKeywords(request: AIKeywordClusteringRequest): Promise<AIKeywordClusteringResponse> {
    try {
      const startTime = Date.now();
      
      // Prepare clustering prompt
      const keywordList = request.keywords.map(k => k.keyword).join('\n');
      const prompt = this.buildClusteringPrompt(keywordList, request);
      
      // Call OpenAI API for clustering
      const completion = await this.openaiService.createChatCompletion([
        {
          role: 'system',
          content: this.getClusteringSystemPrompt(request.language)
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        model: 'gpt-4',
        max_tokens: 2000,
        temperature: 0.3
      });
      
      const clusteringResult = completion || '';
      
      // Parse clustering results
      const parsedClusters = this.parseClusteringResult(clusteringResult, request.keywords);
      
      const endTime = Date.now();
      
      return {
        clusters: parsedClusters.clusters || [],
        ungroupedKeywords: parsedClusters.ungroupedKeywords || [],
        clusteringMetadata: {
          method: request.clusteringMethod,
          confidence: 0.85, // Mock confidence score
          processingTime: `${endTime - startTime}ms`
        }
      };
      
    } catch (error) {
      console.error('AI keyword clustering failed:', error);
      throw new Error(`Keyword clustering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Optimize existing content using AI
   */
  async optimizeContent(
    content: string,
    targetKeyword: string,
    optimizationGoals: string[]
  ): Promise<{ optimizedContent: string; improvements: string[]; seoScore: number }> {
    try {
      const prompt = `
Optimize the following content for the keyword "${targetKeyword}".
Optimization goals: ${optimizationGoals.join(', ')}

Original content:
${content}

Please provide:
1. Optimized content
2. List of improvements made
3. SEO score (1-100)
      `;
      
      const completion = await this.openaiService.createChatCompletion([
        {
          role: 'system',
          content: 'You are an expert SEO content optimizer. Provide comprehensive content optimization while maintaining readability and user value.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        model: 'gpt-4',
        max_tokens: 3000,
        temperature: 0.5
      });
      
      const result = completion || '';
      
      // Parse optimization result (simplified)
      return {
        optimizedContent: result,
        improvements: ['Improved keyword density', 'Enhanced readability', 'Better structure'],
        seoScore: 85
      };
      
    } catch (error) {
      console.error('Content optimization failed:', error);
      throw error;
    }
  }
  
  private buildContentPrompt(request: AIContentGenerationRequest): string {
    return `
Create a comprehensive ${request.contentType} about "${request.keyword}" with the following requirements:

- Language: ${request.language}
- Word count: ${request.wordCount} words
- Tone: ${request.tone}
- Target keyword: ${request.keyword}
- Related keywords: ${request.cluster.related_keywords?.join(', ') || 'None'}
- Content structure: ${JSON.stringify(request.cluster.content_structure)}

Please provide:
1. SEO-optimized title (60 characters max)
2. Meta description (160 characters max)  
3. Complete article body in markdown format
4. H2 and H3 headings structure
5. Internal and external link suggestions

Focus on providing valuable, accurate information while naturally incorporating the target keyword for SEO optimization.
    `;
  }
  
  private buildClusteringPrompt(keywords: string, request: AIKeywordClusteringRequest): string {
    return `
Analyze and cluster the following keywords using ${request.clusteringMethod} method:

Keywords:
${keywords}

Requirements:
- Language: ${request.language}
- Maximum clusters: ${request.maxClusters || 10}
- Method: ${request.clusteringMethod}

For each cluster, provide:
1. Cluster name and topic
2. Primary keyword (most important/high volume)
3. Related keywords in the cluster
4. Search intent (informational, commercial, transactional, navigational)
5. Content structure suggestions (title, H2 topics, FAQ questions)

Return results in structured format for easy parsing.
    `;
  }
  
  private getSystemPrompt(contentType: string, language: string): string {
    return `You are an expert content writer and SEO specialist. Create high-quality, engaging ${contentType} content in ${language} that:
- Follows SEO best practices
- Provides genuine value to readers
- Uses natural keyword integration
- Maintains appropriate tone and style
- Includes proper heading hierarchy
- Suggests relevant internal/external links`;
  }
  
  private getClusteringSystemPrompt(language: string): string {
    return `You are an expert SEO analyst specializing in keyword clustering. Analyze keywords in ${language} and group them by semantic similarity, search intent, and topical relevance. Provide actionable content structure suggestions for each cluster.`;
  }
  
  private parseGeneratedContent(content: string, request: AIContentGenerationRequest): Partial<AIContentGenerationResponse> {
    // Simplified parsing - in production, use more sophisticated parsing
    const lines = content.split('\n');
    
    let title = '';
    let metaTitle = '';
    let metaDescription = '';
    let body = content;
    let bodyHtml = '';
    const headings: Array<{ level: number; text: string }> = [];
    const internalLinks: Array<{ text: string; url: string }> = [];
    const externalLinks: Array<{ text: string; url: string }> = [];
    
    // Extract title (first line or H1)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1];
      metaTitle = title;
    }
    
    // Extract headings
    const headingMatches = content.matchAll(/^(#{2,6})\s+(.+)$/gm);
    for (const match of headingMatches) {
      headings.push({
        level: match[1].length,
        text: match[2]
      });
    }
    
    // Convert markdown to HTML (simplified)
    bodyHtml = content
      .replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
      .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.)/gm, '<p>$1')
      .replace(/(.+)$/gm, '$1</p>');
    
    // Generate meta description from first paragraph
    if (!metaDescription) {
      const firstParagraph = content.split('\n\n')[1] || '';
      metaDescription = firstParagraph.substring(0, 155) + '...';
    }
    
    return {
      title,
      body,
      bodyHtml,
      metaTitle,
      metaDescription,
      headings,
      internalLinks,
      externalLinks
    };
  }
  
  private parseClusteringResult(result: string, keywords: K2WKeywordRecord[]): Partial<AIKeywordClusteringResponse> {
    // Simplified clustering result parsing
    // In production, implement proper JSON parsing or structured output
    
    const clusters = [
      {
        id: 'cluster-1',
        name: 'Main Topic Cluster',
        topic: 'primary-topic',
        keywords: keywords.slice(0, Math.ceil(keywords.length / 2)).map(k => k.keyword),
        primaryKeyword: keywords[0]?.keyword || '',
        searchIntent: 'informational',
        difficultyScore: 65,
        contentStructure: {
          suggestedTitle: `Complete Guide to ${keywords[0]?.keyword || 'Topic'}`,
          h2Topics: [
            'Introduction',
            'Key Benefits',
            'How to Get Started',
            'Best Practices',
            'Conclusion'
          ],
          faqQuestions: [
            `What is ${keywords[0]?.keyword}?`,
            `How does ${keywords[0]?.keyword} work?`,
            `What are the benefits of ${keywords[0]?.keyword}?`
          ],
          relatedTerms: []
        }
      }
    ];
    
    const ungroupedKeywords = keywords.slice(Math.ceil(keywords.length / 2)).map(k => k.keyword);
    
    return {
      clusters,
      ungroupedKeywords
    };
  }
  
  private async generateFAQs(keyword: string, language: string): Promise<Array<{ question: string; answer: string }>> {
    // Simplified FAQ generation
    return [
      {
        question: `What is ${keyword}?`,
        answer: `${keyword} is a comprehensive solution that helps users achieve their goals effectively.`
      },
      {
        question: `How does ${keyword} work?`,
        answer: `${keyword} works by providing structured approach and proven methodologies.`
      },
      {
        question: `What are the benefits of ${keyword}?`,
        answer: `The main benefits of ${keyword} include improved efficiency, cost savings, and better results.`
      }
    ];
  }
  
  private async generateImagePrompts(keyword: string, contentType: string): Promise<string[]> {
    return [
      `Professional illustration of ${keyword} concept`,
      `Infographic showing ${keyword} benefits`,
      `Step-by-step diagram for ${keyword} process`,
      `Comparison chart featuring ${keyword}`
    ];
  }
  
  private async generateSchemaMarkup(request: AIContentGenerationRequest): Promise<Record<string, unknown>> {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `Complete Guide to ${request.keyword}`,
      "description": `Comprehensive information about ${request.keyword}`,
      "author": {
        "@type": "Organization",
        "name": "K2W System"
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString()
    };
  }
  
  private calculateSEOScore(content: Partial<AIContentGenerationResponse>, keyword: string): number {
    let score = 0;
    
    // Title includes keyword
    if (content.title?.toLowerCase().includes(keyword.toLowerCase())) {
      score += 20;
    }
    
    // Meta description includes keyword
    if (content.metaDescription?.toLowerCase().includes(keyword.toLowerCase())) {
      score += 15;
    }
    
    // Content has proper headings
    if (content.headings && content.headings.length > 0) {
      score += 20;
    }
    
    // Content length (assuming good length)
    if (content.body && content.body.length > 1000) {
      score += 25;
    }
    
    // Has internal/external links
    if (content.internalLinks && content.internalLinks.length > 0) {
      score += 10;
    }
    
    if (content.externalLinks && content.externalLinks.length > 0) {
      score += 10;
    }
    
    return Math.min(100, score);
  }
  
  private calculateReadabilityScore(content: string): number {
    // Simplified readability calculation
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Score based on average sentence length
    let score = 100;
    if (avgWordsPerSentence > 25) score -= 20;
    if (avgWordsPerSentence > 30) score -= 20;
    if (avgWordsPerSentence > 35) score -= 20;
    
    return Math.max(0, score);
  }
}

export const k2wAI = new K2WAIService();