/**
 * AI Content Generation Service (Trigger reload of compiled packages)
 * Primary: Gemini API (Google AI Studio - free tier, no billing needed)
 * Fallback: High-quality structured mock content
 */

import { createGeminiService } from '@k2w/ai';

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
  private gemini = createGeminiService();

  /**
   * Generate SEO-optimized content using Gemini.
   */
  async generateContent(options: ContentGenerationOptions): Promise<GeneratedContent> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'placeholder-gemini-key') {
      throw new Error('[AIContentGenerator] Gemini API key is missing or not configured.');
    }

    try {
      console.log(`[AIContentGenerator] Calling Gemini (${process.env.GEMINI_MODEL || 'gemini-3.5-flash'}) for "${options.keyword}"...`);
      const result = await this.generateWithGemini(options);
      console.log(`[AIContentGenerator] ✅ Gemini content generated for "${options.keyword}"`);
      return result;
    } catch (err) {
      console.error('[AIContentGenerator] ❌ Gemini content generation failed:', err);
      throw err;
    }
  }

  private async generateWithGemini(options: ContentGenerationOptions): Promise<GeneratedContent> {
    const systemPrompt = this.getSystemPrompt(options.language, options.region);
    const userPrompt = this.buildContentPrompt(options);

    const computedMaxTokens = Math.max(8192, this.calculateMaxTokens(options.wordCount || 1000));
    console.log(`[AIContentGenerator] Generating content for keyword: "${options.keyword}", wordCount limit request: ${options.wordCount}, computed max_tokens: ${computedMaxTokens}`);

    const response = await this.gemini.createChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
        temperature: 0.7,
        max_tokens: computedMaxTokens,
        responseMimeType: 'application/json',
      }
    );

    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    
    try {
      const parsed = this.cleanAndParseJSON(jsonStr);
      return this.normalizeContent(parsed, options);
    } catch (err) {
      console.error('[AIContentGenerator] ❌ Content extraction failed entirely.');
      throw err;
    }
  }

  private cleanAndParseJSON(jsonStr: string): any {
    const trimmed = jsonStr.trim();
    
    // 1. Try standard parse first
    try {
      return JSON.parse(trimmed);
    } catch (firstErr) {
      const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      console.warn('[AIContentGenerator] ⚠️ Standard JSON.parse failed. Attempting resilient auto-fix...', errMsg);
    }

    // 2. Resilient cleanup: Remove trailing commas in arrays/objects
    let cleaned = trimmed.replace(/,\s*([\]}])/g, '$1');

    // 3. Fix duplicate or stuttering text at the end of properties
    // Specifically target the duplicate suffix issue seen: "cta": "..."\nefficiency!"\n}
    cleaned = cleaned.replace(/"cta"\s*:\s*"([\s\S]*?)"\s*[\s\S]*?}\s*$/, '"cta": "$1"\n}');

    // 4. Ensure balanced braces if response was slightly truncated
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    if (openBraces > closeBraces) {
      cleaned += '\n' + '}'.repeat(openBraces - closeBraces);
    }

    // 5. Try parsing the cleaned version
    try {
      return JSON.parse(cleaned);
    } catch (secondErr) {
      const errMsg = secondErr instanceof Error ? secondErr.message : String(secondErr);
      console.warn('[AIContentGenerator] ⚠️ Resilient auto-fix failed. Falling back to regex field extraction.', errMsg);
      
      // Log details for debugging
      console.error('[AIContentGenerator] Raw JSON text length:', trimmed.length);
      console.error('[AIContentGenerator] Raw JSON snippet (first 1000 chars):', trimmed.substring(0, 1000));
      if (trimmed.length > 1000) {
        console.error('[AIContentGenerator] Raw JSON end (last 1000 chars):', trimmed.substring(trimmed.length - 1000));
      }

      // 6. Last resort: Regex-based field extraction
      return this.extractFieldsByRegex(trimmed);
    }
  }

  private extractFieldsByRegex(rawText: string): any {
    const result: any = {
      title: '',
      meta_title: '',
      meta_description: '',
      body_html: '',
      headings: [],
      faqs: [],
      cta: ''
    };

    // Extract basic string properties with a lookahead that looks for valid next keys or end of JSON
    const keysLookahead = '(?:title|meta_title|metaTitle|meta_description|metaDescription|body_html|bodyHtml|body|headings|faqs|cta)';
    
    const extractString = (key: string): string => {
      const regex = new RegExp(
        `"${key}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,\\s*"${keysLookahead}"\\s*:|\\s*\\}\\s*[\\s\\S]*$)`,
        'i'
      );
      const match = rawText.match(regex);
      if (match) {
        return match[1]
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t');
      }
      return '';
    };

    result.title = extractString('title');
    result.meta_title = extractString('meta_title') || extractString('metaTitle');
    result.meta_description = extractString('meta_description') || extractString('metaDescription');
    result.cta = extractString('cta');

    // Extract body_html safely by matching everything until the next valid key or end
    const bodyRegex = new RegExp(
      `"(body_html|bodyHtml|body)"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,\\s*"${keysLookahead}"\\s*:|\\s*\\}\\s*[\\s\\S]*$)`,
      'i'
    );
    const fallbackRegex = /"(?:body_html|bodyHtml|body)"\s*:\s*"([\s\S]*)$/i;

    const bodyMatch = rawText.match(bodyRegex);
    if (bodyMatch) {
      const body = bodyMatch[2];
      result.body_html = body.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    } else {
      const fallbackMatch = rawText.match(fallbackRegex);
      if (fallbackMatch) {
        let body = fallbackMatch[1];
        // Clean up trailing quote/braces if matched via the to-the-end fallback
        body = body.replace(new RegExp(`"\\s*,\\s*"${keysLookahead}"\\s*:[\\s\\S]*$`), '');
        body = body.replace(/"\s*\}\s*$/, '');
        body = body.replace(/"$/, '');
        result.body_html = body.replace(/\\"/g, '"').replace(/\\n/g, '\n');
      }
    }

    // Extract FAQs array of objects
    const faqRegex = /\{\s*"question"\s*:\s*"([\s\S]*?)"\s*,\s*"answer"\s*:\s*"([\s\S]*?)"\s*\}/g;
    let faqMatch;
    while ((faqMatch = faqRegex.exec(rawText)) !== null) {
      result.faqs.push({
        question: faqMatch[1].replace(/\\"/g, '"'),
        answer: faqMatch[2].replace(/\\"/g, '"')
      });
    }

    // Extract headings string array
    const headingRegex = /"headings"\s*:\s*\[([\s\S]*?)\]/;
    const headingMatch = rawText.match(headingRegex);
    if (headingMatch) {
      const items = headingMatch[1].match(/"([\s\S]*?)"/g);
      if (items) {
        result.headings = items.map(item => item.slice(1, -1).replace(/\\"/g, '"'));
      }
    }

    console.log('[AIContentGenerator] Successfully recovered fields via regex fallback:', {
      title: result.title,
      headingsCount: result.headings.length,
      faqsCount: result.faqs.length,
      hasCta: !!result.cta,
      bodyLength: result.body_html.length
    });

    return result;
  }

  private normalizeContent(content: any, options: ContentGenerationOptions): GeneratedContent {
    const { keyword, region } = options;
    const kw = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    const rawHtml: string = content.body_html || content.body || '';
    const normalized: string = rawHtml.replace(/<[^>]*>/g, '');
    const computedWordCount = normalized.split(/\s+/).filter(Boolean).length;

    return {
      title: content.title || `${kw} Solutions | OSG Global`,
      meta_title: (content.meta_title || content.title || `${kw} | OSG Global`).substring(0, 60),
      meta_description: (content.meta_description || `Discover ${keyword} solutions from OSG Global.`).substring(0, 155),
      body_html: rawHtml,
      headings: Array.isArray(content.headings) ? content.headings : [],
      faqs: Array.isArray(content.faqs) ? content.faqs : [],
      cta: content.cta || `Contact OSG Global today for your ${keyword} solution in ${region}.`,
      word_count: computedWordCount,
      readability_score: content.readability_score ?? 72,
      keyword_density: content.keyword_density ?? 2.2,
      json_ld_schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: content.title,
        author: { '@type': 'Organization', name: 'OSG Global' },
        publisher: { '@type': 'Organization', name: 'OSG Global' },
        datePublished: new Date().toISOString(),
      },
    };
  }

  // ──────────────────────────────
  // PROMPT BUILDERS
  // ──────────────────────────────
  private buildContentPrompt(options: ContentGenerationOptions): string {
    return `Generate SEO-optimized content with the following specifications:

Target Keyword: ${options.keyword}
Language: ${options.language}
Region: ${options.region}
Word Count: At least ${options.wordCount || 800} words (Write a comprehensive, in-depth, and fully detailed article. Each section must be fully developed with multiple paragraphs. Avoid short summaries.)
Content Type: ${options.contentType}
Tone: ${options.tone}
${options.targetAudience ? `Target Audience: ${options.targetAudience}` : ''}

Requirements:
1. Create an engaging title (H1)
2. Include 3-5 subheadings (H2/H3)
3. Maintain keyword density of 2-3%
4. Write meta title (max 60 chars) and meta description (max 155 chars)
5. Include 3-4 FAQs
6. Add a compelling call-to-action
7. Ensure readability score > 60
8. CRITICAL FOR JSON SAFETY: Inside the HTML body string in "body_html", use SINGLE QUOTES (') for all HTML attributes (e.g. <a href='url'> or <img src='path'>) instead of double quotes. Do not escape these single quotes. If you must use double quotes inside the text, escape them properly as \\".

Return ONLY valid JSON with fields:
{
  "title": "...",
  "meta_title": "...",
  "meta_description": "...",
  "body_html": "<h2>...</h2><p>...</p>...",
  "headings": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}],
  "cta": "..."
}`;
  }

  private getSystemPrompt(language: string, region: string): string {
    return `You are an expert SEO content writer for OSG Global, specializing in container solutions, modular construction, and portable buildings for the ${region} market. Write in ${language}. Always return valid JSON only — no markdown, no explanation outside the JSON object. Ensure all double quotes inside JSON string values are correctly escaped.`;
  }

  private calculateMaxTokens(targetWordCount: number): number {
    return Math.ceil((targetWordCount * 4) / 3) + 600;
  }
}

export const aiContentGenerator = new AIContentGenerator();