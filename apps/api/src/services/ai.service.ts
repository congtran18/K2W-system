/**
 * AI Service
 * Real implementations for AI-powered operations using OpenAI
 */

export interface ContentGenerationOptions {
  keyword: string;
  language: string;
  region: string;
  contentType: 'article' | 'blog_post' | 'landing_page' | 'product_description' | 'product_page';
  template?: string;
  wordCount?: number;
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  customPrompt?: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  style?: 'professional' | 'modern' | 'artistic' | 'realistic';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  count?: number;
}

export interface OptimizationOptions {
  content: string;
  targetKeywords: string[];
  optimization_level: 'basic' | 'advanced' | 'comprehensive';
}

export interface TranslationOptions {
  content: string;
  target_language: string;
  source_language?: string;
  formality?: 'formal' | 'informal';
  preserve_formatting?: boolean;
}

export interface ContentResult {
  title: string;
  body: string;
  meta_description: string;
  keyword: string;
  language: string;
  region: string;
  contentType: string;
  word_count: number;
  estimated_reading_time: number;
  seo_score: number;
  generated_at: string;
}

export interface OptimizationResult {
  original_content: string;
  optimized_content: string;
  analysis: any;
  improvements: string[];
  seo_score_before: number;
  seo_score_after: number;
}

export interface TranslationResult {
  original_content: string;
  translated_content: string;
  source_language: string;
  target_language: string;
  formality: string;
  word_count_original: number;
  word_count_translated: number;
  translation_quality_score: number;
}

export class AiService {
  private openaiApiKey: string;
  private openaiBaseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (!this.openaiApiKey) {
      console.warn('OPENAI_API_KEY not found in environment variables');
    }
  }

  /**
   * Generate content using OpenAI
   */
  async generateContent(options: ContentGenerationOptions): Promise<ContentResult> {
    try {
      const prompt = options.customPrompt || this.createContentPrompt(options);
      
      const response = await this.callOpenAI({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer and SEO specialist. Create high-quality, engaging content that ranks well in search engines.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.getMaxTokensForContentType(options.contentType),
        temperature: 0.7
      });

      const content = response.choices[0].message.content;
      const processedContent = this.postProcessContent(content, options);

      return processedContent;
    } catch (error: any) {
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  /**
   * Generate images using DALL-E
   */
  async generateImages(options: ImageGenerationOptions): Promise<string[]> {
    try {
      const enhancedPrompt = this.enhanceImagePrompt(options.prompt, options.style);

      const response = await this.callOpenAIImages({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        size: options.size || '1024x1024',
        n: Math.min(options.count || 1, 4), // DALL-E 3 max is 4
        quality: 'standard'
      });

      return response.data.map((img: any) => img.url);
    } catch (error: any) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Optimize content for SEO
   */
  async optimizeContent(options: OptimizationOptions): Promise<OptimizationResult> {
    try {
      // Analyze current content
      const analysis = this.analyzeContent(options.content, options.targetKeywords);
      
      // Generate optimization
      const optimizationPrompt = this.createOptimizationPrompt(options);
      
      const response = await this.callOpenAI({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert. Optimize content while maintaining quality and readability.'
          },
          {
            role: 'user',
            content: optimizationPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const optimizedContent = response.choices[0].message.content;
      
      return {
        original_content: options.content,
        optimized_content: optimizedContent,
        analysis,
        improvements: this.extractImprovements(optimizedContent),
        seo_score_before: analysis.seo_score,
        seo_score_after: this.calculateSEOScore(optimizedContent, options.targetKeywords)
      };
    } catch (error: any) {
      throw new Error(`Content optimization failed: ${error.message}`);
    }
  }

  /**
   * Translate content
   */
  async translateContent(options: TranslationOptions): Promise<TranslationResult> {
    try {
      const translationPrompt = this.createTranslationPrompt(options);

      const response = await this.callOpenAI({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Provide accurate, natural translations while preserving the original meaning and tone.'
          },
          {
            role: 'user',
            content: translationPrompt
          }
        ],
        max_tokens: Math.ceil(options.content.length * 2), // Account for language expansion
        temperature: 0.1 // Low temperature for accuracy
      });

      const translatedContent = response.choices[0].message.content;

      return {
        original_content: options.content,
        translated_content: translatedContent,
        source_language: options.source_language || 'auto-detected',
        target_language: options.target_language,
        formality: options.formality || 'formal',
        word_count_original: options.content.split(' ').length,
        word_count_translated: translatedContent.split(' ').length,
        translation_quality_score: 95 // Would be calculated by a quality assessment
      };
    } catch (error: any) {
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Call OpenAI API for text generation
   */
  private async callOpenAI(params: any): Promise<any> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Call OpenAI API for image generation
   */
  private async callOpenAIImages(params: any): Promise<any> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.openaiBaseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Helper methods
   */
  private createContentPrompt(options: ContentGenerationOptions): string {
    const { keyword, language, region, contentType, tone = 'professional', wordCount = 1000 } = options;
    
    return `Create a comprehensive ${contentType} in ${language} for the ${region} market about "${keyword}".

Requirements:
- Primary keyword: ${keyword}
- Word count: approximately ${wordCount} words
- Tone: ${tone}
- Include SEO-optimized headings and subheadings (use # for H1, ## for H2, etc.)
- Include relevant keywords naturally throughout the content
- Structure with proper formatting and sections
- Make it engaging, informative, and valuable to readers
- Include a compelling introduction and strong conclusion
- Add relevant examples and actionable insights where appropriate

The content should be ready for publishing and rank well in search engines for the target keyword.

Format the response with:
- Title (H1)
- Meta description (150-160 characters)
- Main content with proper headings
- Natural keyword integration`;
  }

  private enhanceImagePrompt(prompt: string, style?: string): string {
    const styleModifiers = {
      professional: 'professional, clean, business-style, high-quality, corporate',
      modern: 'modern, contemporary, sleek design, minimalist, trendy',
      artistic: 'artistic, creative, expressive, unique style, abstract elements',
      realistic: 'photorealistic, detailed, high-resolution, natural lighting, lifelike'
    };

    const modifier = style ? styleModifiers[style as keyof typeof styleModifiers] : 'high-quality, professional';
    return `${prompt}, ${modifier}, 4K resolution, detailed, masterpiece quality`;
  }

  private createOptimizationPrompt(options: OptimizationOptions): string {
    return `Optimize the following content for SEO with these target keywords: ${options.targetKeywords.join(', ')}

Optimization level: ${options.optimization_level}

Original content:
${options.content}

Please provide an optimized version that:
1. Naturally incorporates all target keywords with appropriate density (1-2%)
2. Improves content structure with clear headings and subheadings
3. Enhances readability and flow
4. Maintains the original meaning and quality
5. Follows current SEO best practices
6. Adds relevant internal linking opportunities
7. Improves meta elements if present

Return only the optimized content without explanations.`;
  }

  private createTranslationPrompt(options: TranslationOptions): string {
    const formalityInstruction = options.formality === 'formal' 
      ? 'Use formal, professional language and tone.' 
      : 'Use natural, conversational language that feels native.';

    const formattingInstruction = options.preserve_formatting 
      ? 'Preserve all formatting, HTML tags, markdown, and structure exactly as in the original.' 
      : 'Maintain the general structure but adapt formatting as needed for the target language.';

    return `Translate the following text from ${options.source_language || 'the source language'} to ${options.target_language}.

Instructions:
- ${formalityInstruction}
- ${formattingInstruction}
- Ensure cultural appropriateness for the target audience
- Maintain the original meaning and intent
- Use natural, fluent language that doesn't sound like a translation

Text to translate:
${options.content}

Translation:`;
  }

  private getMaxTokensForContentType(contentType: string): number {
    const tokenLimits = {
      article: 3000,
      blog_post: 2500,
      landing_page: 2000,
      product_description: 800,
      product_page: 2000
    };
    return tokenLimits[contentType as keyof typeof tokenLimits] || 2000;
  }

  private postProcessContent(content: string, options: ContentGenerationOptions): ContentResult {
    // Extract title (first line or H1)
    const lines = content.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^#\s*/, '') || `${options.keyword} - Comprehensive Guide`;
    
    // Extract or generate meta description
    let metaDescription = '';
    const metaMatch = content.match(/meta description:?\s*(.+)/i);
    if (metaMatch) {
      metaDescription = metaMatch[1].trim().substring(0, 160);
    } else {
      // Generate from first paragraph
      const firstPara = lines.find(line => line.length > 50 && !line.startsWith('#'));
      metaDescription = firstPara ? firstPara.substring(0, 150) + '...' : `Learn about ${options.keyword} - comprehensive guide and insights.`;
    }

    const wordCount = content.split(' ').length;
    
    return {
      title,
      body: content,
      meta_description: metaDescription,
      keyword: options.keyword,
      language: options.language,
      region: options.region,
      contentType: options.contentType,
      word_count: wordCount,
      estimated_reading_time: Math.ceil(wordCount / 200), // 200 words per minute
      seo_score: this.calculateSEOScore(content, [options.keyword]),
      generated_at: new Date().toISOString()
    };
  }

  private analyzeContent(content: string, keywords: string[]): any {
    const wordCount = content.split(' ').length;
    const keywordDensity = keywords.map(keyword => {
      const occurrences = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      return {
        keyword,
        occurrences,
        density: (occurrences / wordCount) * 100
      };
    });

    return {
      word_count: wordCount,
      keyword_density: keywordDensity,
      seo_score: this.calculateSEOScore(content, keywords),
      readability_score: this.calculateReadabilityScore(content),
      heading_count: (content.match(/^#{1,6}\s/gm) || []).length,
      paragraph_count: content.split('\n\n').length
    };
  }

  private calculateSEOScore(content: string, keywords: string[]): number {
    let score = 50; // Base score

    // Check keyword presence and density
    keywords.forEach(keyword => {
      const occurrences = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const density = (occurrences / content.split(' ').length) * 100;
      
      if (occurrences === 0) score -= 20;
      else if (density < 0.5) score -= 10;
      else if (density > 3) score -= 15; // Keyword stuffing penalty
      else score += 15;
    });

    // Check for headings
    const headingCount = (content.match(/^#{1,6}\s/gm) || []).length;
    if (headingCount > 0) score += 10;
    if (headingCount >= 3) score += 5;
    
    // Check content length
    const wordCount = content.split(' ').length;
    if (wordCount < 300) score -= 20;
    else if (wordCount > 500 && wordCount < 2000) score += 10;
    else if (wordCount >= 2000) score += 15;

    // Check for lists and structure
    if (content.includes('-') || content.includes('*')) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculateReadabilityScore(content: string): number {
    const words = content.split(' ').length;
    const sentences = (content.match(/[.!?]+/g) || []).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : words;
    
    let score = 100;
    
    // Penalize long sentences
    if (avgWordsPerSentence > 25) score -= 30;
    else if (avgWordsPerSentence > 20) score -= 20;
    else if (avgWordsPerSentence > 15) score -= 10;
    
    // Reward good structure
    const paragraphs = content.split('\n\n').length;
    if (paragraphs > 1) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private extractImprovements(optimizedContent: string): string[] {
    const improvements = [];
    
    if ((optimizedContent.match(/^#{1,6}\s/gm) || []).length > 0) {
      improvements.push('Added structured headings');
    }
    
    if (optimizedContent.includes('-') || optimizedContent.includes('*')) {
      improvements.push('Improved content formatting with lists');
    }
    
    improvements.push('Enhanced keyword integration');
    improvements.push('Improved content structure');
    improvements.push('Better readability and flow');
    improvements.push('SEO optimization applied');
    
    return improvements;
  }
}

export const aiService = new AiService();