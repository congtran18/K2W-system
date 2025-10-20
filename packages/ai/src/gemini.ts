import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { z } from 'zod';

// Content generation schemas (same as OpenAI)
export const ContentGenerationInputSchema = z.object({
  keyword: z.string().min(1),
  language: z.string().min(2).max(10),
  region: z.string().min(2).max(10),
  wordCount: z.number().int().min(300).max(3000).default(1000),
  contentType: z.enum(['article', 'product_page', 'landing_page']).default('article'),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'technical', 'friendly']).default('professional'),
  customPrompt: z.string().optional(),
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

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey?: string) {
    // Use placeholder API key during build time to prevent errors
    const isBuild = process.env.NODE_ENV === undefined || process.env.NEXT_PHASE === 'phase-production-build';
    const defaultApiKey = isBuild ? 'placeholder-gemini-key' : process.env.GEMINI_API_KEY;
    
    this.client = new GoogleGenerativeAI(apiKey || defaultApiKey || 'placeholder-gemini-key');
    
    // Use Gemini 1.5 Pro for best quality (same as GPT-4)
    this.model = this.client.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  async generateContent(input: ContentGenerationInput): Promise<ContentGenerationOutput> {
    // Runtime check for API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-gemini-key') {
      throw new Error('Gemini API key is required but not provided. Please set GEMINI_API_KEY environment variable.');
    }

    const validatedInput = ContentGenerationInputSchema.parse(input);

    const systemPrompt = `You are an expert SEO content writer for OSG Global. Generate high-quality, SEO-optimized content that is informative, engaging, and follows best practices for search engine optimization. Always return valid JSON with the required fields.`;
    
    const userPrompt = validatedInput.customPrompt || this.buildContentPrompt(validatedInput);
    
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Failed to generate content');
      }

      // Parse the structured response
      return this.parseContentResponse(text);
    } catch (error) {
      console.error('Gemini content generation error:', error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateImages(prompt: string, options?: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    style?: 'vivid' | 'natural';
    quality?: 'standard' | 'hd';
    n?: number;
  }): Promise<string[]> {
    // Gemini doesn't have native image generation yet
    // We can integrate with Google's Imagen API or keep using DALL-E for images
    // For now, throw informative error
    throw new Error(
      'Gemini does not support image generation. ' +
      'Options: 1) Use DALL-E for images, 2) Use Google Imagen API, 3) Use alternative image generation service.'
    );
  }

  async optimizeForSEO(content: string, targetKeyword: string): Promise<{
    optimizedContent: string;
    suggestions: string[];
    seoScore: number;
  }> {
    // Runtime check for API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'placeholder-gemini-key') {
      throw new Error('Gemini API key is required but not provided. Please set GEMINI_API_KEY environment variable.');
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

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Failed to optimize content');
      }

      // Try to parse JSON, extract from markdown code blocks if needed
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Gemini SEO optimization error:', error);
      throw new Error(`Failed to optimize content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createChatCompletion(messages: Array<{role: string, content: string}>, options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<string> {
    // Gemini uses a single prompt instead of message array
    // Convert messages to a single prompt
    const prompt = messages.map(msg => {
      const roleLabel = msg.role === 'system' ? 'SYSTEM' : msg.role === 'user' ? 'USER' : 'ASSISTANT';
      return `${roleLabel}: ${msg.content}`;
    }).join('\n\n');

    try {
      const customModel = options?.model ? 
        this.client.getGenerativeModel({
          model: options.model,
          generationConfig: {
            temperature: options?.temperature || 0.7,
            maxOutputTokens: options?.max_tokens || 8192,
          },
        }) : this.model;

      const result = await customModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Failed to generate completion');
      }

      return text;
    } catch (error) {
      console.error('Gemini chat completion error:', error);
      throw new Error(`Failed to generate completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
      // Try to extract JSON from markdown code blocks first
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      
      const parsed = JSON.parse(jsonStr);
      return ContentGenerationOutputSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error(`Failed to parse content response: ${error}`);
    }
  }
}

// Factory function instead of direct instance to avoid build-time errors
export const createGeminiService = (apiKey?: string) => new GeminiService(apiKey);
