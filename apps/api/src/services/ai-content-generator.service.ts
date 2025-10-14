/**
 * AI Content Generation Service
 * Implements GPT-based content generation according to K2W specs Section 6
 */

import { createOpenAIService } from '@k2w/ai';

export interface ContentGenerationOptions {
  keyword: string;
  language: string;
  region: string;
  targetAudience: string;
  wordCount: number;
  contentType: 'article' | 'blog_post' | 'landing_page' | 'product_description';
  internalLinks?: string[];
  tone: 'professional' | 'casual' | 'technical' | 'marketing';
}

export interface GeneratedContent {
  title: string;
  meta_title: string;
  meta_description: string;
  body_html: string;
  headings: string[];
  faqs: Array<{ question: string; answer: string }>;
  cta: string;
  word_count: number;
  readability_score: number;
  keyword_density: number;
  json_ld_schema: object;
}

export class AIContentGenerator {
  private openai = createOpenAIService();
  
  /**
   * Generate SEO-optimized content using GPT
   * Implements prompt template from Section 6.2
   */
  async generateContent(options: ContentGenerationOptions): Promise<GeneratedContent> {
    const prompt = this.buildContentPrompt(options);
    
    try {
      const messages = [
        {
          role: 'system',
          content: this.getSystemPrompt(options.language, options.region)
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await this.openai.createChatCompletion(messages, {
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        temperature: 0.7,
        max_tokens: this.calculateMaxTokens(options.wordCount)
      });

      const content = JSON.parse(response);
      
      // Validate and enhance the generated content
      const validatedContent = await this.validateAndEnhanceContent(content, options);
      
      return validatedContent;
      
    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error(`AI content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build content generation prompt template
   */
  private buildContentPrompt(options: ContentGenerationOptions): string {
    const { keyword, language, region, targetAudience, wordCount, contentType, tone } = options;
    
    return `
TASK: Generate an SEO-optimized ${contentType} in ${language} for ${region} market.

INPUT VARIABLES:
- Keyword: "${keyword}"
- Target Audience: ${targetAudience}
- Word Count: ${wordCount} words
- Tone: ${tone}
- Region: ${region}
- Content Type: ${contentType}

REQUIREMENTS:
1. Create a comprehensive ${contentType} titled with "${keyword}"
2. Structure:
   • H1 (Main title with keyword)
   • 4-6 H2/H3 sub-topics
   • Meta Title (≤ 60 chars, include keyword)
   • Meta Description (≤ 155 chars, compelling)
   • 3-4 FAQs with detailed answers
   • Strong call-to-action for OSG products/services
   
3. SEO Optimization:
   • Keyword density: 2-3%
   • Readability score: > 60 (Flesch)
   • Include semantic keywords
   • Proper heading hierarchy
   
4. Content Quality:
   • Authoritative and trustworthy tone
   • Solution-oriented approach
   • Include relevant statistics/facts
   • Professional ${tone} writing style

5. Output Format (JSON):
{
  "title": "H1 title with keyword",
  "meta_title": "SEO-optimized meta title",
  "meta_description": "Compelling meta description",
  "body_html": "Full HTML content with proper headings",
  "headings": ["List of all H2/H3 headings"],
  "faqs": [{"question": "FAQ question", "answer": "Detailed answer"}],
  "cta": "Call-to-action paragraph",
  "keywords_used": ["primary", "semantic", "keywords"],
  "internal_link_suggestions": ["suggested internal link topics"]
}

Focus on creating valuable, engaging content that serves user intent while promoting OSG's expertise in container solutions.
    `.trim();
  }

  /**
   * Get system prompt based on language and region
   */
  private getSystemPrompt(language: string, region: string): string {
    const regionContext = this.getRegionContext(region);
    
    return `
You are an expert SEO copywriter and content strategist for OSG Global, specializing in container solutions, modular construction, and portable buildings.

BRAND CONTEXT:
- OSG Global is a leading provider of container offices, modular homes, container pools, and portable buildings
- Focus on quality, innovation, and customer solutions
- Target markets include commercial, residential, and industrial sectors

LANGUAGE & REGION:
- Write in: ${language}
- Target region: ${region}
- Regional context: ${regionContext}

WRITING GUIDELINES:
- Authoritative yet approachable tone
- Focus on benefits and solutions
- Include specific technical details when relevant
- Maintain professional credibility
- Use natural language that reads well to humans
- Optimize for search engines without keyword stuffing

OUTPUT REQUIREMENTS:
- Always return valid JSON format
- Include all required fields
- Ensure content is factually accurate
- Make content locally relevant for ${region}
    `.trim();
  }

  /**
   * Get region-specific context
   */
  private getRegionContext(region: string): string {
    const contexts: Record<string, string> = {
      'US': 'Focus on American building codes, climate considerations, and business practices',
      'AU': 'Consider Australian standards, bushfire regulations, and climate zones',
      'SG': 'Address tropical climate, space constraints, and Singapore building regulations',
      'UK': 'Include British building standards, weather considerations, and local terminology',
      'JP': 'Consider Japanese aesthetics, earthquake resistance, and space efficiency',
      'DE': 'Focus on German engineering standards and environmental regulations'
    };
    
    return contexts[region] || 'Adapt content for local market conditions and regulations';
  }

  /**
   * Calculate max tokens based on word count
   */
  private calculateMaxTokens(wordCount: number): number {
    // Roughly 4 characters per token, plus buffer for JSON structure
    return Math.ceil((wordCount * 4) / 3) + 500;
  }

  /**
   * Validate and enhance generated content
   */
  private async validateAndEnhanceContent(
    content: any, 
    options: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    // Ensure all required fields exist
    const validated: GeneratedContent = {
      title: content.title || `Professional ${options.keyword} Solutions`,
      meta_title: content.meta_title || content.title?.substring(0, 60) || '',
      meta_description: content.meta_description || '',
      body_html: content.body_html || '',
      headings: content.headings || [],
      faqs: content.faqs || [],
      cta: content.cta || this.getDefaultCTA(options.region),
      word_count: this.calculateWordCount(content.body_html || ''),
      readability_score: await this.calculateReadabilityScore(content.body_html || ''),
      keyword_density: this.calculateKeywordDensity(content.body_html || '', options.keyword),
      json_ld_schema: this.generateJSONLD(content, options)
    };

    // Quality checks
    if (validated.word_count < options.wordCount * 0.8) {
      console.warn(`Content word count (${validated.word_count}) below target (${options.wordCount})`);
    }

    if (validated.keyword_density < 1 || validated.keyword_density > 4) {
      console.warn(`Keyword density (${validated.keyword_density}%) outside optimal range (1-4%)`);
    }

    return validated;
  }

  /**
   * Get default CTA based on region
   */
  private getDefaultCTA(region: string): string {
    return `Ready to explore innovative container solutions? Contact OSG Global today for expert consultation and customized designs that meet your specific needs. Our team of specialists is standing by to help you transform your vision into reality.`;
  }

  /**
   * Calculate word count from HTML content
   */
  private calculateWordCount(html: string): number {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate readability score (simplified Flesch formula)
   */
  private async calculateReadabilityScore(html: string): Promise<number> {
    const text = html.replace(/<[^>]*>/g, '');
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word (simplified)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 1;
    
    if (word.endsWith('e')) count--;
    if (word.endsWith('le') && word.length > 2) count++;
    
    return Math.max(1, count);
  }

  /**
   * Calculate keyword density
   */
  private calculateKeywordDensity(html: string, keyword: string): number {
    const text = html.replace(/<[^>]*>/g, '').toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const keywordCount = text.split(keyword.toLowerCase()).length - 1;
    
    return words.length > 0 ? (keywordCount / words.length) * 100 : 0;
  }

  /**
   * Generate JSON-LD schema markup
   */
  private generateJSONLD(content: any, options: ContentGenerationOptions): object {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": content.title,
      "description": content.meta_description,
      "author": {
        "@type": "Organization",
        "name": "OSG Global",
        "url": "https://osgglobal.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "OSG Global"
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://osgglobal.com/${options.keyword.replace(/\s+/g, '-').toLowerCase()}`
      }
    };

    // Add FAQ schema if FAQs exist
    if (content.faqs && content.faqs.length > 0) {
      (schema as any).mainEntity = {
        "@type": "FAQPage",
        "mainEntity": content.faqs.map((faq: any) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
    }

    return schema;
  }

  /**
   * Generate content variations for A/B testing
   */
  async generateContentVariations(
    options: ContentGenerationOptions,
    variations: number = 2
  ): Promise<GeneratedContent[]> {
    const results: GeneratedContent[] = [];
    
    for (let i = 0; i < variations; i++) {
      const variantOptions = {
        ...options,
        tone: i === 0 ? 'professional' : 'marketing' as any
      };
      
      const content = await this.generateContent(variantOptions);
      results.push(content);
    }
    
    return results;
  }
}

export const aiContentGenerator = new AIContentGenerator();