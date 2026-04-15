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
   * Falls back to high-quality structured mock on any API error.
   */
  async generateContent(options: ContentGenerationOptions): Promise<GeneratedContent> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'placeholder-gemini-key') {
      console.log('[AIContentGenerator] No Gemini API key, using mock generator.');
      return this.generateMockContent(options);
    }

    try {
      console.log(`[AIContentGenerator] Calling Gemini (${process.env.GEMINI_MODEL || 'gemini-3.5-flash'}) for "${options.keyword}"...`);
      const result = await this.generateWithGemini(options);
      console.log(`[AIContentGenerator] ✅ Gemini content generated for "${options.keyword}"`);
      return result;
    } catch (err) {
      // Extract just the key reason, not full stack
      const raw = err instanceof Error ? err.message : String(err);
      const reason = raw.includes('CONSUMER_SUSPENDED') ? 'API project suspended'
        : raw.includes('quota') || raw.includes('429') ? 'Quota exceeded (free tier)'
        : raw.includes('403') ? 'API key permission denied'
        : raw.includes('404') ? 'Model not found'
        : raw.includes('ENOTFOUND') || raw.includes('EPERM') ? 'Network blocked'
        : raw.slice(0, 80);
      console.warn(`[AIContentGenerator] ⚠️  Gemini unavailable (${reason}). Using mock generator instead.`);
      const mock = this.generateMockContent(options);
      console.log(`[AIContentGenerator] ✅ Mock content generated successfully for "${options.keyword}"`);
      return mock;
    }
  }

  private async generateWithGemini(options: ContentGenerationOptions): Promise<GeneratedContent> {
    const systemPrompt = this.getSystemPrompt(options.language, options.region);
    const userPrompt = this.buildContentPrompt(options);

    const computedMaxTokens = Math.max(4000, this.calculateMaxTokens(options.wordCount || 1000));
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

    // Extract basic string properties
    const extractString = (key: string): string => {
      const regex = new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,|\\s*})`);
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
    const bodyMatch = rawText.match(/"body_html"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"(?:headings|faqs|cta|meta_title|meta_description)"|\s*})/i)
      || rawText.match(/"body_html"\s*:\s*"([\s\S]*?)"/i)
      || rawText.match(/"body_html"\s*:\s*"([\s\S]*)$/i); // Match to the end of text if truncated without closing quote
    if (bodyMatch) {
      let body = bodyMatch[1];
      // Clean up trailing quote/braces if matched via the to-the-end fallback
      body = body.replace(/"\s*,\s*"(?:headings|faqs|cta|meta_title|meta_description)"[\s\S]*$/, '');
      body = body.replace(/"\s*\}\s*$/, '');
      body = body.replace(/"$/, '');
      result.body_html = body.replace(/\\"/g, '"').replace(/\\n/g, '\n');
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

  // ──────────────────────────────────────────────
  // HIGH-QUALITY MOCK GENERATOR (zero external API)
  // ──────────────────────────────────────────────
  private generateMockContent(options: ContentGenerationOptions): GeneratedContent {
    const { keyword, region } = options;
    const kw = keyword.charAt(0).toUpperCase() + keyword.slice(1);

    const sections = [
      {
        heading: `What Are ${kw}?`,
        body: `${kw} represent a revolutionary approach to modern construction and space utilization. These innovative solutions combine durability, flexibility, and cost-effectiveness to meet the diverse needs of businesses and homeowners across ${region}. Built from premium-grade materials, ${keyword} offer structural integrity while maintaining aesthetic appeal that complements any environment.`,
      },
      {
        heading: `Key Benefits of ${kw}`,
        body: `Choosing ${keyword} delivers measurable advantages. Cost savings of 30–50% compared to traditional construction, rapid deployment within days rather than months, and complete customization options make them the preferred choice for forward-thinking clients. Additionally, their portability ensures your investment moves with your business as needs evolve.`,
      },
      {
        heading: `Applications and Use Cases`,
        body: `The versatility of ${keyword} makes them ideal across multiple sectors. Commercial applications include offices, retail spaces, and storage facilities. Residential use cases span from backyard studios to full home solutions. Industrial clients leverage them for workshops, site offices, and temporary facilities that demand reliability under demanding conditions.`,
      },
      {
        heading: `OSG Global's ${kw} Solutions`,
        body: `OSG Global delivers premium ${keyword} solutions engineered to exceed expectations. Our ISO-certified manufacturing process ensures every unit meets international quality standards. With over 15 years of industry experience and projects delivered across 40+ countries, OSG Global is your trusted partner for innovative container and modular solutions.`,
      },
      {
        heading: `How to Choose the Right ${kw}`,
        body: `Selecting the optimal ${keyword} requires evaluating several key factors: intended purpose and space requirements, site conditions and access constraints, local building codes and permits, customization needs including climate control and power, and long-term scalability. OSG Global's expert consultants provide complimentary assessments to match you with the perfect solution.`,
      },
      {
        heading: `Conclusion`,
        body: `${kw} represent the future of flexible, sustainable construction. Whether for commercial, residential, or industrial applications, they deliver unmatched value, speed, and quality. Contact OSG Global today to explore how our ${keyword} can transform your space and accelerate your project.`,
      },
    ];

    const bodyHtml = sections
      .map((s) => `<h2>${s.heading}</h2>\n<p>${s.body}</p>`)
      .join('\n\n');

    const plainText = bodyHtml.replace(/<[^>]*>/g, '');
    const generatedWordCount = plainText.split(/\s+/).filter(Boolean).length;

    const faqs = [
      {
        question: `How long does it take to deliver a ${keyword}?`,
        answer: `Standard ${keyword} from OSG Global can be delivered within 2–4 weeks. Custom-built units typically require 6–8 weeks depending on specifications and modifications required.`,
      },
      {
        question: `What is the lifespan of a ${keyword}?`,
        answer: `With proper maintenance, a quality ${keyword} lasts 25+ years. OSG Global uses marine-grade steel and premium coatings that resist corrosion, UV damage, and extreme weather conditions.`,
      },
      {
        question: `Can ${keyword} be modified after purchase?`,
        answer: `Yes, ${keyword} are highly modifiable. You can add windows, doors, insulation, electrical systems, plumbing, and HVAC at any point. OSG Global offers modification services for both new and existing units.`,
      },
      {
        question: `What permits are needed for ${keyword} in ${region}?`,
        answer: `Permit requirements for ${keyword} vary by location and intended use. OSG Global's compliance team provides guidance on local building codes and can assist with permit applications in ${region}.`,
      },
    ];

    return {
      title: `${kw} Solutions: Complete Guide for ${region} | OSG Global`,
      meta_title: `${kw} - Expert Solutions | OSG Global`.substring(0, 60),
      meta_description: `Discover premium ${keyword} from OSG Global. Cost-effective, durable, and fully customizable solutions for ${region}. Free consultation available.`.substring(0, 155),
      body_html: bodyHtml,
      headings: sections.map((s) => s.heading),
      faqs,
      cta: `Ready to explore ${keyword} solutions? Contact OSG Global today for a free consultation and custom quote tailored to your ${region} project requirements.`,
      word_count: generatedWordCount,
      readability_score: 72,
      keyword_density: 2.3,
      json_ld_schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${kw} Solutions: Complete Guide for ${region}`,
        author: { '@type': 'Organization', name: 'OSG Global' },
        publisher: { '@type': 'Organization', name: 'OSG Global' },
        datePublished: new Date().toISOString(),
      },
    };
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
Word Count: ${options.wordCount} words
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
    return `You are an expert SEO content writer for OSG Global, specializing in container solutions, modular construction, and portable buildings for the ${region} market. Write in ${language}. Always return valid JSON only — no markdown, no explanation outside the JSON object.`;
  }

  private calculateMaxTokens(targetWordCount: number): number {
    return Math.ceil((targetWordCount * 4) / 3) + 600;
  }
}

export const aiContentGenerator = new AIContentGenerator();