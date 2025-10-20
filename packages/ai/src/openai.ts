import OpenAI from 'openai';
import { z } from 'zod';

// Content generation schemas
export const ContentGenerationInputSchema = z.object({
  keyword: z.string().min(1),
  language: z.string().min(2).max(10),
  region: z.string().min(2).max(10),
  wordCount: z.number().int().min(300).max(3000).default(1000),
  contentType: z.enum(['article', 'product_page', 'landing_page']).default('article'),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'technical', 'friendly']).default('professional'),
  customPrompt: z.string().optional(), // Allow custom prompts for enhanced control
});

export const ContentGenerationOutputSchema = z.object({
  title: z.string(),
  metaTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  body: z.string(),
  htmlBody: z.string(),
  headings: z.array(z.object({
    level: z.number().int().min(1).max(6),
    text: z.string(),
  })),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  cta: z.string().optional(),
  readabilityScore: z.number().min(0).max(100).optional(),
  seoScore: z.number().min(0).max(100).optional(),
});

export type ContentGenerationInput = z.infer<typeof ContentGenerationInputSchema>;
export type ContentGenerationOutput = z.infer<typeof ContentGenerationOutputSchema>;

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey?: string) {
    // Use placeholder API key during build time to prevent errors
    const isBuild = process.env.NODE_ENV === undefined || process.env.NEXT_PHASE === 'phase-production-build';
    const defaultApiKey = isBuild ? 'placeholder-openai-key' : process.env.OPENAI_API_KEY;
    
    this.client = new OpenAI({
      apiKey: apiKey || defaultApiKey || 'placeholder-openai-key',
    });
  }

  async generateContent(input: ContentGenerationInput): Promise<ContentGenerationOutput> {
    // Runtime check for API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-openai-key') {
      throw new Error('OpenAI API key is required but not provided. Please set OPENAI_API_KEY environment variable.');
    }

    const validatedInput = ContentGenerationInputSchema.parse(input);

    const prompt = validatedInput.customPrompt || this.buildContentPrompt(validatedInput);

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert SEO content writer for OSG Global. Generate high-quality, SEO-optimized content that is informative, engaging, and follows best practices for search engine optimization. Always return valid JSON with the required fields.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('Failed to generate content');
    }

    // Parse the structured response
    return this.parseContentResponse(result);
  }

  async generateImages(prompt: string, options?: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    style?: 'vivid' | 'natural';
    quality?: 'standard' | 'hd';
    n?: number;
  }): Promise<string[]> {
    const response = await this.client.images.generate({
      model: 'dall-e-3',
      prompt,
      size: options?.size || '1024x1024',
      style: options?.style || 'natural',
      quality: options?.quality || 'standard',
      n: options?.n || 1,
    });

    return response.data?.map((image) => image.url).filter(Boolean) as string[] || [];
  }

  async optimizeForSEO(content: string, targetKeyword: string): Promise<{
    optimizedContent: string;
    suggestions: string[];
    seoScore: number;
  }> {
    // Runtime check for API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-openai-key') {
      throw new Error('OpenAI API key is required but not provided. Please set OPENAI_API_KEY environment variable.');
    }

    const prompt = `
    Optimize the following content for SEO with the target keyword "${targetKeyword}":

    ${content}

    Provide:
    1. Optimized content with better keyword density (2-3%)
    2. SEO improvement suggestions
    3. SEO score (0-100)

    Return as JSON with fields: optimizedContent, suggestions, seoScore
    `;

    const completion = await this.client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('Failed to optimize content');
    }

    try {
      return JSON.parse(result);
    } catch {
      throw new Error('Failed to parse SEO optimization response');
    }
  }

  async createChatCompletion(messages: Array<{role: string, content: string}>, options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: options?.model || 'gpt-4-turbo-preview',
      messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 2000,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('Failed to generate completion');
    }

    return result;
  }

  private buildContentPrompt(input: ContentGenerationInput): string {
    return `
    Generate SEO-optimized content with the following specifications:

    Target Keyword: ${input.keyword}
    Language: ${input.language}
    Region: ${input.region}
    Word Count: ${input.wordCount} words
    Content Type: ${input.contentType}
    Tone: ${input.tone}
    ${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ''}

    Requirements:
    1. Create an engaging title (H1)
    2. Include 3-5 subheadings (H2/H3)
    3. Maintain keyword density of 2-3%
    4. Write meta title (max 60 chars) and meta description (max 160 chars)
    5. Include 2-3 FAQs if appropriate
    6. Add a compelling call-to-action
    7. Ensure readability score > 60

    Return the content in JSON format with fields:
    - title
    - metaTitle
    - metaDescription
    - body (markdown format)
    - htmlBody (HTML format)
    - headings (array of {level, text})
    - faqs (array of {question, answer})
    - cta
    `;
  }

  private parseContentResponse(response: string): ContentGenerationOutput {
    try {
      const parsed = JSON.parse(response);
      return ContentGenerationOutputSchema.parse(parsed);
    } catch (error) {
      throw new Error(`Failed to parse content response: ${error}`);
    }
  }
}

// Factory function instead of direct instance to avoid build-time errors
export const createOpenAIService = (apiKey?: string) => new OpenAIService(apiKey);