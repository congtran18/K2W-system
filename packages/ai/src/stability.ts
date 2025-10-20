/**
 * Stability AI - Professional Image Generation
 * Best quality, cheapest pricing!
 * 
 * Free tier: 25 credits/day (25 images)
 * Paid: $0.002-0.01/image (cheapest in market!)
 * 
 * Models:
 * - SDXL: Best quality
 * - SD 3.5: Latest, very fast
 * - Core: Balanced
 */

export interface StabilityOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '16:9' | '1:1' | '21:9' | '2:3' | '3:2' | '4:5' | '5:4' | '9:16' | '9:21';
  model?: 'sd3.5-large' | 'sd3.5-large-turbo' | 'sd3.5-medium' | 'sd3-large' | 'sd3-large-turbo' | 'core';
  seed?: number;
  outputFormat?: 'png' | 'jpeg' | 'webp';
  style?: 'enhance' | '3d-model' | 'analog-film' | 'anime' | 'cinematic' | 'comic-book' | 'digital-art' | 'fantasy-art' | 'isometric' | 'line-art' | 'low-poly' | 'neon-punk' | 'origami' | 'photographic' | 'pixel-art';
}

export interface GeneratedImage {
  url: string;
  base64?: string;
  seed: number;
  finishReason: string;
}

export class StabilityAIService {
  private apiKey: string;
  private baseUrl = 'https://api.stability.ai/v2beta/stable-image/generate';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.STABILITY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Stability API key not found. Get free key at: https://platform.stability.ai/');
    }
  }

  /**
   * Generate image with Stability AI
   */
  async generateImage(options: StabilityOptions): Promise<GeneratedImage> {
    if (!this.apiKey) {
      throw new Error('Stability API key required. Sign up at https://platform.stability.ai/');
    }

    const {
      prompt,
      negativePrompt,
      aspectRatio = '1:1',
      model = 'sd3.5-large-turbo', // Fast & good quality
      seed,
      outputFormat = 'png',
      style,
    } = options;

    // Choose endpoint based on model
    const endpoint = model.startsWith('sd3') 
      ? 'https://api.stability.ai/v2beta/stable-image/generate/sd3'
      : `https://api.stability.ai/v2beta/stable-image/generate/${model}`;

    const formData = new FormData();
    formData.append('prompt', prompt);
    if (negativePrompt) formData.append('negative_prompt', negativePrompt);
    formData.append('aspect_ratio', aspectRatio);
    formData.append('output_format', outputFormat);
    if (seed) formData.append('seed', seed.toString());
    if (style) formData.append('style_preset', style);
    formData.append('model', model);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Stability AI error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Stability returns base64 image
      const image = data.image;
      const imageUrl = `data:image/${outputFormat};base64,${image}`;

      return {
        url: imageUrl,
        base64: image,
        seed: data.seed || seed || 0,
        finishReason: data.finish_reason || 'SUCCESS',
      };
    } catch (error) {
      console.error('Stability AI generation error:', error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate multiple images
   */
  async generateImages(
    prompt: string,
    count: number = 1,
    options?: Partial<StabilityOptions>
  ): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    for (let i = 0; i < count; i++) {
      const image = await this.generateImage({
        prompt,
        ...options,
        seed: options?.seed ? options.seed + i : undefined,
      });
      images.push(image);
      
      // Small delay to respect rate limits
      if (i < count - 1) {
        await this.delay(500);
      }
    }

    return images;
  }

  /**
   * Generate with style preset
   */
  async generateStyledImage(
    prompt: string,
    style: 'professional' | 'modern' | 'artistic' | 'realistic' | 'anime' | '3d',
    options?: Partial<StabilityOptions>
  ): Promise<GeneratedImage> {
    const styleMap: Record<string, StabilityOptions['style']> = {
      professional: 'photographic',
      modern: 'digital-art',
      artistic: 'fantasy-art',
      realistic: 'photographic',
      anime: 'anime',
      '3d': '3d-model',
    };

    return this.generateImage({
      prompt,
      style: styleMap[style],
      ...options,
    });
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch('https://api.stability.ai/v1/user/account', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get account credits (free tier)
   */
  async getCredits(): Promise<{ credits: number }> {
    if (!this.apiKey) {
      throw new Error('API key required');
    }

    try {
      const response = await fetch('https://api.stability.ai/v1/user/balance', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get credits');
      }

      const data = await response.json();
      return { credits: data.credits || 0 };
    } catch (error) {
      console.error('Failed to get credits:', error);
      return { credits: 0 };
    }
  }

  /**
   * Get service info
   */
  getServiceInfo() {
    return {
      name: 'Stability AI',
      quality: '9/10 - Best in class',
      cost: 'Free: 25 credits/day, Paid: $0.002-0.01/image',
      apiKeyRequired: true,
      signup: 'https://platform.stability.ai/',
      models: ['SD 3.5 Large', 'SD 3.5 Turbo', 'SDXL', 'Core'],
      features: [
        'Highest quality',
        'Fast generation (3-5s)',
        'Many style presets',
        'Negative prompts',
        'Custom aspect ratios',
        'Cheapest pricing',
      ],
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function
 */
export function createStabilityService(apiKey?: string): StabilityAIService {
  return new StabilityAIService(apiKey);
}

export default StabilityAIService;
