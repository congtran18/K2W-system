/**
 * AI Translation Service using DeepL
 * Implements multi-language translation according to K2W specs Section 6.4
 */

import axios from 'axios';
import { K2WContentRecord } from '@k2w/database';

export interface TranslationOptions {
  targetLanguage: string;
  sourceLanguage?: string;
  preserveFormatting: boolean;
  glossary?: string;
  formality: 'default' | 'more' | 'less';
  model: 'quality' | 'speed';
}

export interface TranslationResult {
  text: string;
  detected_source_language: string;
  target_language: string;
  confidence_score: number;
  alternatives?: string[];
  formality: string;
  metadata: {
    character_count: number;
    translation_time: string;
    model_used: string;
    preserve_formatting: boolean;
  };
}

export interface SupportedLanguage {
  code: string;
  name: string;
  supports_formality: boolean;
}

export interface ContentTranslation {
  original_content: K2WContentRecord;
  translations: Record<string, K2WContentRecord>;
  translation_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  quality_scores: Record<string, number>;
}

export class AITranslationService {
  private apiKey: string;
  private baseUrl: string = 'https://api-free.deepl.com/v2';

  constructor() {
    this.apiKey = process.env.DEEPL_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('DEEPL_API_KEY is required');
    }
    
    // Use pro endpoint if using pro key
    if (this.apiKey.endsWith(':fx')) {
      this.baseUrl = 'https://api.deepl.com/v2';
    }
  }

  /**
   * Translate text using DeepL API
   */
  async translateText(
    text: string, 
    targetLang: string, 
    options: Partial<TranslationOptions> = {}
  ): Promise<TranslationResult> {
    const defaultOptions: TranslationOptions = {
      targetLanguage: targetLang.toUpperCase(),
      preserveFormatting: true,
      formality: 'default',
      model: 'quality',
      ...options
    };

    try {
      const requestData = {
        text: [text],
        target_lang: defaultOptions.targetLanguage,
        source_lang: defaultOptions.sourceLanguage,
        preserve_formatting: defaultOptions.preserveFormatting ? '1' : '0',
        formality: defaultOptions.formality,
        tag_handling: 'html'
      };

      const response = await axios.post(
        `${this.baseUrl}/translate`,
        new URLSearchParams(requestData as any),
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );

      const translation = response.data.translations[0];
      
      return {
        text: translation.text,
        detected_source_language: translation.detected_source_language,
        target_language: defaultOptions.targetLanguage,
        confidence_score: this.calculateConfidenceScore(text, translation.text),
        formality: defaultOptions.formality,
        metadata: {
          character_count: text.length,
          translation_time: new Date().toISOString(),
          model_used: defaultOptions.model,
          preserve_formatting: defaultOptions.preserveFormatting
        }
      };

    } catch (error: any) {
      console.error('Translation failed:', error);
      throw new Error(`Translation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Translate entire content including metadata
   */
  async translateContent(
    content: K2WContentRecord,
    targetLanguages: string[],
    options: Partial<TranslationOptions> = {}
  ): Promise<ContentTranslation> {
    const translations: Record<string, K2WContentRecord> = {};
    const qualityScores: Record<string, number> = {};

    for (const targetLang of targetLanguages) {
      try {
        const translatedContent = await this.translateContentRecord(
          content,
          targetLang,
          options
        );
        
        translations[targetLang] = translatedContent;
        qualityScores[targetLang] = await this.assessTranslationQuality(
          content,
          translatedContent
        );

        // Add delay to respect rate limits
        await this.delay(100);

      } catch (error) {
        console.error(`Content translation failed for ${targetLang}:`, error);
        qualityScores[targetLang] = 0;
      }
    }

    return {
      original_content: content,
      translations,
      translation_status: Object.keys(translations).length > 0 ? 'completed' : 'failed',
      quality_scores: qualityScores
    };
  }

  /**
   * Translate individual content record
   */
  private async translateContentRecord(
    content: K2WContentRecord,
    targetLang: string,
    options: Partial<TranslationOptions> = {}
  ): Promise<K2WContentRecord> {
    const titleResult = await this.translateText(content.title, targetLang, options);
    const descriptionResult = content.meta_description 
      ? await this.translateText(content.meta_description, targetLang, options)
      : null;
    const contentResult = await this.translateText(content.body, targetLang, {
      ...options,
      preserveFormatting: true
    });

    // Translate FAQs if present
    const translatedFaqs = await this.translateFaqs(content.faqs, targetLang);

    return {
      ...content,
      id: `${content.id}_${targetLang.toLowerCase()}`,
      title: titleResult.text,
      meta_description: descriptionResult?.text || undefined,
      body: contentResult.text,
      body_html: contentResult.text, // Update both body fields
      faqs: translatedFaqs,
      language: targetLang.toLowerCase(),
      url: content.url ? `${content.url}/${targetLang.toLowerCase()}` : undefined,
      // Add translation metadata as extended property
      translation_metadata: {
        source_language: content.language || 'en',
        target_language: targetLang.toLowerCase(),
        translated_at: new Date().toISOString(),
        confidence_scores: {
          title: titleResult.confidence_score,
          description: descriptionResult?.confidence_score || 0,
          content: contentResult.confidence_score
        },
        character_counts: {
          title: titleResult.metadata.character_count,
          description: descriptionResult?.metadata.character_count || 0,
          content: contentResult.metadata.character_count
        }
      }
    } as K2WContentRecord & { translation_metadata: any };
  }

  /**
   * Translate array of keywords
   */
  private async translateKeywords(
    keywords: string[], 
    targetLang: string
  ): Promise<string[]> {
    const translatedKeywords: string[] = [];

    for (const keyword of keywords) {
      try {
        const result = await this.translateText(keyword.trim(), targetLang, {
          targetLanguage: targetLang,
          preserveFormatting: false,
          formality: 'default',
          model: 'quality'
        });
        
        translatedKeywords.push(result.text);
        await this.delay(50); // Small delay between keyword translations

      } catch (error) {
        console.error(`Keyword translation failed for "${keyword}":`, error);
        translatedKeywords.push(keyword); // Keep original if translation fails
      }
    }

    return translatedKeywords;
  }

  /**
   * Translate FAQ array
   */
  private async translateFaqs(
    faqs: Array<{ question: string; answer: string }>,
    targetLang: string
  ): Promise<Array<{ question: string; answer: string }>> {
    const translatedFaqs: Array<{ question: string; answer: string }> = [];

    for (const faq of faqs) {
      try {
        const questionResult = await this.translateText(faq.question, targetLang);
        const answerResult = await this.translateText(faq.answer, targetLang);
        
        translatedFaqs.push({
          question: questionResult.text,
          answer: answerResult.text
        });

        await this.delay(100); // Small delay between FAQ translations

      } catch (error) {
        console.error(`FAQ translation failed:`, error);
        translatedFaqs.push(faq); // Keep original if translation fails
      }
    }

    return translatedFaqs;
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<SupportedLanguage[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/languages`, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`
        },
        params: {
          type: 'target'
        }
      });

      return response.data.map((lang: any) => ({
        code: lang.language,
        name: lang.name,
        supports_formality: lang.supports_formality || false
      }));

    } catch (error) {
      console.error('Failed to get supported languages:', error);
      return this.getDefaultSupportedLanguages();
    }
  }

  /**
   * Get default supported languages for fallback
   */
  private getDefaultSupportedLanguages(): SupportedLanguage[] {
    return [
      { code: 'DE', name: 'German', supports_formality: true },
      { code: 'ES', name: 'Spanish', supports_formality: true },
      { code: 'FR', name: 'French', supports_formality: true },
      { code: 'IT', name: 'Italian', supports_formality: true },
      { code: 'JA', name: 'Japanese', supports_formality: false },
      { code: 'KO', name: 'Korean', supports_formality: false },
      { code: 'PT', name: 'Portuguese', supports_formality: true },
      { code: 'RU', name: 'Russian', supports_formality: true },
      { code: 'ZH', name: 'Chinese', supports_formality: false }
    ];
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(
    texts: string[],
    targetLang: string,
    options: Partial<TranslationOptions> = {}
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];

    // Process in chunks to respect API limits
    const chunkSize = 10;
    for (let i = 0; i < texts.length; i += chunkSize) {
      const chunk = texts.slice(i, i + chunkSize);
      
      for (const text of chunk) {
        try {
          const result = await this.translateText(text, targetLang, options);
          results.push(result);
          await this.delay(100);
        } catch (error) {
          console.error(`Batch translation failed for text: ${text.substring(0, 50)}...`, error);
          // Add failed result with original text
          results.push({
            text: text,
            detected_source_language: 'unknown',
            target_language: targetLang,
            confidence_score: 0,
            formality: options.formality || 'default',
            metadata: {
              character_count: text.length,
              translation_time: new Date().toISOString(),
              model_used: options.model || 'quality',
              preserve_formatting: options.preserveFormatting || true
            }
          });
        }
      }
    }

    return results;
  }

  /**
   * Calculate confidence score based on translation quality
   */
  private calculateConfidenceScore(original: string, translated: string): number {
    // Simple heuristics for confidence scoring
    const lengthRatio = translated.length / original.length;
    const lengthScore = Math.max(0, 1 - Math.abs(1 - lengthRatio));
    
    // Check for common translation issues
    const hasSpecialChars = /[^\w\s]/.test(original);
    const preservedSpecialChars = hasSpecialChars ? /[^\w\s]/.test(translated) : true;
    
    const baseScore = 0.8; // Base confidence for DeepL
    const lengthWeight = 0.1;
    const formatWeight = 0.1;
    
    return Math.min(1.0, 
      baseScore + 
      (lengthScore * lengthWeight) + 
      (preservedSpecialChars ? formatWeight : 0)
    );
  }

  /**
   * Assess translation quality
   */
  private async assessTranslationQuality(
    original: K2WContentRecord,
    translated: K2WContentRecord
  ): Promise<number> {
    let totalScore = 0;
    let components = 0;

    // Title quality
    if (original.title && translated.title) {
      totalScore += this.calculateConfidenceScore(original.title, translated.title);
      components++;
    }

    // Content quality (sample)
    if (original.body && translated.body) {
      const originalSample = original.body.substring(0, 500);
      const translatedSample = translated.body.substring(0, 500);
      totalScore += this.calculateConfidenceScore(originalSample, translatedSample);
      components++;
    }

    // FAQs quality
    if (original.faqs?.length && translated.faqs?.length) {
      if (original.faqs.length === translated.faqs.length) {
        totalScore += 0.8; // Bonus for maintaining FAQ count
      } else {
        totalScore += 0.5;
      }
      components++;
    }

    return components > 0 ? totalScore / components : 0;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<{
    character_count: number;
    character_limit: number;
    usage_percentage: number;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/usage`, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`
        }
      });

      const usage = response.data;
      return {
        character_count: usage.character_count,
        character_limit: usage.character_limit,
        usage_percentage: (usage.character_count / usage.character_limit) * 100
      };

    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return {
        character_count: 0,
        character_limit: 500000, // Default free tier limit
        usage_percentage: 0
      };
    }
  }

  /**
   * Optimize translation for SEO
   */
  async optimizeForSEO(
    content: K2WContentRecord,
    targetLang: string,
    regionKeywords: string[]
  ): Promise<K2WContentRecord> {
    const translatedContent = await this.translateContentRecord(content, targetLang);
    
    // Optimize title with regional keywords
    const optimizedTitle = await this.optimizeTitle(
      translatedContent.title,
      regionKeywords,
      targetLang
    );

    // Optimize meta description
    const optimizedDescription = translatedContent.meta_description
      ? await this.optimizeMetaDescription(
          translatedContent.meta_description,
          regionKeywords,
          targetLang
        )
      : null;

    return {
      ...translatedContent,
      title: optimizedTitle,
      meta_description: optimizedDescription || undefined,
      seo_optimized: true,
      optimization_metadata: {
        region_keywords: regionKeywords,
        optimization_date: new Date().toISOString(),
        target_language: targetLang
      }
    } as K2WContentRecord & { 
      seo_optimized: boolean; 
      optimization_metadata: any; 
    };
  }

  /**
   * Optimize title with regional keywords
   */
  private async optimizeTitle(
    title: string,
    regionKeywords: string[],
    targetLang: string
  ): Promise<string> {
    if (regionKeywords.length === 0) return title;

    const primaryKeyword = regionKeywords[0];
    const translatedKeyword = await this.translateText(primaryKeyword, targetLang);
    
    // Insert keyword naturally if not present
    if (!title.toLowerCase().includes(translatedKeyword.text.toLowerCase())) {
      return `${translatedKeyword.text} - ${title}`;
    }

    return title;
  }

  /**
   * Optimize meta description with keywords
   */
  private async optimizeMetaDescription(
    description: string,
    regionKeywords: string[],
    targetLang: string
  ): Promise<string> {
    if (regionKeywords.length === 0) return description;

    const keyword = regionKeywords[0];
    const translatedKeyword = await this.translateText(keyword, targetLang);
    
    // Ensure description includes primary keyword
    if (!description.toLowerCase().includes(translatedKeyword.text.toLowerCase())) {
      const maxLength = 150;
      const keywordAddition = ` featuring ${translatedKeyword.text}`;
      
      if (description.length + keywordAddition.length <= maxLength) {
        return description + keywordAddition;
      } else {
        const truncated = description.substring(0, maxLength - keywordAddition.length - 3);
        return truncated + '...' + keywordAddition;
      }
    }

    return description;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const aiTranslationService = new AITranslationService();