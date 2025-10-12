/**
 * AI Image Generation Service
 * Implements DALL-E image generation according to K2W specs Section 6.3
 */

import { createOpenAIService } from '@k2w/ai';
import { K2WContentRecord } from '@k2w/database';

export interface ImageGenerationOptions {
  keyword: string;
  contentType: 'article' | 'blog_post' | 'landing_page' | 'product_description';
  region: string;
  style: 'professional' | 'modern' | 'industrial' | 'architectural';
  imageCount: number;
  imageType: 'header' | 'inline' | 'featured' | 'gallery';
  size: '1024x1024' | '1792x1024' | '1024x1792';
  quality: 'standard' | 'hd';
}

export interface GeneratedImage {
  url: string;
  filename: string;
  prompt: string;
  width: number;
  height: number;
  size_bytes?: number;
  alt_text: string;
  caption: string;
  metadata: {
    model: string;
    style: string;
    generation_time: string;
    content_id?: string;
    optimization_goal?: string;
    original_prompt?: string;
    [key: string]: any;
  };
}

export class AIImageGenerator {
  private openai = createOpenAIService();

  /**
   * Generate images using DALL-E
   * Implements prompt template from Section 6.3
   */
  async generateImages(options: ImageGenerationOptions): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    for (let i = 0; i < options.imageCount; i++) {
      const prompt = this.buildImagePrompt(options, i);
      
      try {
        const response = await this.openai.generateImages(prompt, {
          size: options.size,
          style: options.style === 'professional' ? 'natural' : 'vivid',
          quality: options.quality,
          n: 1
        });

        if (response.length > 0) {
          const imageUrl = response[0];
          const generatedImage = await this.processGeneratedImage(
            imageUrl, 
            prompt, 
            options, 
            i + 1
          );
          images.push(generatedImage);
        }

      } catch (error) {
        console.error(`Image generation failed for prompt ${i + 1}:`, error);
        // Continue with next image instead of failing completely
      }
    }

    return images;
  }

  /**
   * Generate content-specific images for an article
   */
  async generateContentImages(
    content: K2WContentRecord,
    options: Partial<ImageGenerationOptions> = {}
  ): Promise<GeneratedImage[]> {
    const defaultOptions: ImageGenerationOptions = {
      keyword: content.title,
      contentType: content.content_type as any,
      region: content.region,
      style: 'professional',
      imageCount: 2,
      imageType: 'featured',
      size: '1792x1024',
      quality: 'hd',
      ...options
    };

    return this.generateImages(defaultOptions);
  }

  /**
   * Build image generation prompt
   */
  private buildImagePrompt(options: ImageGenerationOptions, imageIndex: number): string {
    const { keyword, region, style, imageType, contentType } = options;
    
    const basePrompt = this.getBasePrompt(keyword, region, style);
    const contextPrompt = this.getContextPrompt(contentType, imageType);
    const stylePrompt = this.getStylePrompt(style);
    const compositionPrompt = this.getCompositionPrompt(imageType, imageIndex);

    return `${basePrompt} ${contextPrompt} ${stylePrompt} ${compositionPrompt}`.trim();
  }

  /**
   * Get base prompt template
   */
  private getBasePrompt(keyword: string, region: string, style: string): string {
    const regionContext = this.getRegionContext(region);
    
    return `
Create a ${style} photograph depicting ${keyword} in ${region}. 
${regionContext}
The image should be suitable for business and marketing use.
    `.trim();
  }

  /**
   * Get context-specific prompt
   */
  private getContextPrompt(contentType: string, imageType: string): string {
    const contexts: Record<string, string> = {
      'article': 'Educational and informative visual that supports the article content',
      'blog_post': 'Engaging and relatable image that draws readers in',
      'landing_page': 'Compelling hero image that showcases the product/service benefits',
      'product_description': 'Clear product showcase highlighting key features and quality'
    };

    const types: Record<string, string> = {
      'header': 'as a banner/header image with wide composition',
      'inline': 'as an inline content image with balanced composition',
      'featured': 'as a featured image with strong visual impact',
      'gallery': 'as part of a gallery showing different angles/perspectives'
    };

    return `${contexts[contentType] || contexts.article} ${types[imageType] || types.featured}`;
  }

  /**
   * Get style-specific prompt
   */
  private getStylePrompt(style: string): string {
    const styles: Record<string, string> = {
      'professional': 'Professional photography with clean composition, good lighting, and business-appropriate setting. Sharp focus, high quality, commercial grade.',
      'modern': 'Modern, sleek visual style with contemporary elements, clean lines, and current design trends. Minimal yet impactful.',
      'industrial': 'Industrial setting with emphasis on construction, manufacturing, or engineering elements. Realistic workplace environment.',
      'architectural': 'Architectural photography style with emphasis on structure, design, and spatial relationships. Clean geometric composition.'
    };

    return styles[style] || styles.professional;
  }

  /**
   * Get composition-specific prompt
   */
  private getCompositionPrompt(imageType: string, imageIndex: number): string {
    const variations = [
      'Wide angle view showing the full context and environment',
      'Medium shot focusing on key details and functionality',
      'Close-up highlighting quality and craftsmanship',
      'Lifestyle shot showing practical use and benefits'
    ];

    const typePrompts: Record<string, string> = {
      'header': 'Horizontal composition suitable for website headers, with space for text overlay',
      'inline': 'Balanced composition that complements text content',
      'featured': 'Strong focal point with excellent visual hierarchy',
      'gallery': variations[imageIndex % variations.length]
    };

    return typePrompts[imageType] || typePrompts.featured;
  }

  /**
   * Get region-specific context
   */
  private getRegionContext(region: string): string {
    const contexts: Record<string, string> = {
      'US': 'American setting with appropriate architecture and landscape',
      'AU': 'Australian environment with suitable climate and building styles',
      'SG': 'Singapore urban setting with modern skyline and tropical elements',
      'UK': 'British setting with characteristic architecture and weather',
      'JP': 'Japanese setting emphasizing cleanliness, efficiency, and modern design',
      'DE': 'German setting with emphasis on engineering and precision'
    };

    return contexts[region] || 'International business setting';
  }

  /**
   * Process generated image with metadata
   */
  private async processGeneratedImage(
    imageUrl: string,
    prompt: string,
    options: ImageGenerationOptions,
    imageNumber: number
  ): Promise<GeneratedImage> {
    const [width, height] = options.size.split('x').map(Number);
    const filename = this.generateFilename(options.keyword, imageNumber, options.size);
    
    return {
      url: imageUrl,
      filename,
      prompt,
      width,
      height,
      alt_text: this.generateAltText(options.keyword, options.contentType),
      caption: this.generateCaption(options.keyword, options.style),
      metadata: {
        model: 'dall-e-3',
        style: options.style,
        generation_time: new Date().toISOString(),
      }
    };
  }

  /**
   * Generate SEO-friendly filename
   */
  private generateFilename(keyword: string, imageNumber: number, size: string): string {
    const slug = keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    return `${slug}-${imageNumber}-${size.replace('x', 'x')}.jpg`;
  }

  /**
   * Generate SEO-optimized alt text
   */
  private generateAltText(keyword: string, contentType: string): string {
    return `${keyword} - Professional ${contentType} image showing quality container solutions`;
  }

  /**
   * Generate descriptive caption
   */
  private generateCaption(keyword: string, style: string): string {
    return `High-quality ${style} image showcasing ${keyword} solutions by OSG Global`;
  }

  /**
   * Generate images for multiple keywords in batch
   */
  async batchGenerateImages(
    keywords: string[],
    baseOptions: Partial<ImageGenerationOptions> = {}
  ): Promise<Record<string, GeneratedImage[]>> {
    const results: Record<string, GeneratedImage[]> = {};

    for (const keyword of keywords) {
      try {
        const options: ImageGenerationOptions = {
          keyword,
          contentType: 'article',
          region: 'US',
          style: 'professional',
          imageCount: 1,
          imageType: 'featured',
          size: '1792x1024',
          quality: 'standard',
          ...baseOptions
        };

        const images = await this.generateImages(options);
        results[keyword] = images;

        // Add delay to respect rate limits
        await this.delay(1000);

      } catch (error) {
        console.error(`Batch image generation failed for keyword "${keyword}":`, error);
        results[keyword] = [];
      }
    }

    return results;
  }

  /**
   * Optimize existing images with new prompts
   */
  async optimizeImages(
    existingImages: GeneratedImage[],
    optimizationGoal: 'seo' | 'conversion' | 'engagement'
  ): Promise<GeneratedImage[]> {
    const optimizedImages: GeneratedImage[] = [];

    for (const image of existingImages) {
      try {
        // Create optimized prompt based on goal
        const optimizedPrompt = this.optimizePrompt(image.prompt, optimizationGoal);
        
        // Generate new image with optimized prompt
        const response = await this.openai.generateImages(optimizedPrompt, {
          size: `${image.width}x${image.height}` as any,
          quality: 'hd',
          n: 1
        });

        if (response.length > 0) {
          const optimizedImage: GeneratedImage = {
            ...image,
            url: response[0],
            prompt: optimizedPrompt,
            metadata: {
              ...image.metadata,
              optimization_goal: optimizationGoal,
              original_prompt: image.prompt,
              generation_time: new Date().toISOString()
            }
          };
          
          optimizedImages.push(optimizedImage);
        }

      } catch (error) {
        console.error('Image optimization failed:', error);
        // Keep original image if optimization fails
        optimizedImages.push(image);
      }
    }

    return optimizedImages;
  }

  /**
   * Optimize prompt based on goal
   */
  private optimizePrompt(originalPrompt: string, goal: string): string {
    const optimizations: Record<string, string> = {
      'seo': 'with clear, identifiable elements that match search intent',
      'conversion': 'with emotional appeal and clear value proposition',
      'engagement': 'with dynamic composition and visual interest'
    };

    return `${originalPrompt} ${optimizations[goal]}`;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const aiImageGenerator = new AIImageGenerator();