/**
 * Pollinations.ai - 100% FREE Image Generation
 * No API key needed, no limits, no signup!
 * 
 * Features:
 * - Completely free forever
 * - No rate limits
 * - Multiple models: Flux, SDXL, Turbo
 * - High quality images
 * - No authentication required
 */

export interface PollinationsOptions {
  prompt: string;
  width?: number;
  height?: number;
  model?: 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d' | 'turbo' | 'any-dark';
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
}

export interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  model: string;
}

export class PollinationsService {
  private baseUrl = 'https://image.pollinations.ai';

  /**
   * Generate image - NO API KEY NEEDED!
   */
  async generateImage(options: PollinationsOptions): Promise<GeneratedImage> {
    const {
      prompt,
      width = 1024,
      height = 1024,
      model = 'flux',
      seed,
      nologo = true,
      enhance = true,
    } = options;

    // Build URL with parameters
    const params = new URLSearchParams();
    params.append('width', width.toString());
    params.append('height', height.toString());
    params.append('model', model);
    if (seed) params.append('seed', seed.toString());
    if (nologo) params.append('nologo', 'true');
    if (enhance) params.append('enhance', 'true');

    // Encode prompt for URL
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `${this.baseUrl}/prompt/${encodedPrompt}?${params.toString()}`;

    return {
      url: imageUrl,
      width,
      height,
      model,
    };
  }

  /**
   * Generate multiple images
   */
  async generateImages(
    prompt: string,
    count: number = 1,
    options?: Partial<PollinationsOptions>
  ): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    for (let i = 0; i < count; i++) {
      const image = await this.generateImage({
        prompt,
        ...options,
        seed: options?.seed ? options.seed + i : undefined, // Different seed for each image
      });
      images.push(image);
    }

    return images;
  }

  /**
   * Generate image with style preset
   */
  async generateStyledImage(
    prompt: string,
    style: 'professional' | 'modern' | 'artistic' | 'realistic' | 'anime' | '3d',
    options?: Partial<PollinationsOptions>
  ): Promise<GeneratedImage> {
    const stylePrompts: Record<string, string> = {
      professional: 'professional photography, high quality, business appropriate, clean composition',
      modern: 'modern style, contemporary, sleek design, minimalist',
      artistic: 'artistic, creative, expressive, vibrant colors',
      realistic: 'photorealistic, highly detailed, natural lighting, 8k resolution',
      anime: 'anime style, vibrant colors, detailed characters',
      '3d': '3D render, CGI, detailed textures, professional lighting',
    };

    const modelMap: Record<string, 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d'> = {
      realistic: 'flux-realism',
      anime: 'flux-anime',
      '3d': 'flux-3d',
      professional: 'flux',
      modern: 'flux',
      artistic: 'flux',
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style]}`;

    return this.generateImage({
      prompt: enhancedPrompt,
      model: modelMap[style] || 'flux',
      ...options,
    });
  }

  /**
   * Batch generate with different styles
   */
  async generateVariations(
    prompt: string,
    variations: number = 3
  ): Promise<GeneratedImage[]> {
    const models: Array<'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d'> = [
      'flux',
      'flux-realism',
      'flux-anime',
      'flux-3d',
    ];

    const images: GeneratedImage[] = [];

    for (let i = 0; i < variations; i++) {
      const model = models[i % models.length];
      const image = await this.generateImage({
        prompt,
        model,
        seed: i * 1000,
      });
      images.push(image);
    }

    return images;
  }

  /**
   * Get supported aspect ratios
   */
  getAspectRatios(): Record<string, { width: number; height: number }> {
    return {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1920, height: 1080 },
      '9:16': { width: 1080, height: 1920 },
      '4:3': { width: 1024, height: 768 },
      '3:4': { width: 768, height: 1024 },
      '21:9': { width: 2560, height: 1080 },
    };
  }

  /**
   * Generate with aspect ratio
   */
  async generateWithAspectRatio(
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9',
    options?: Partial<PollinationsOptions>
  ): Promise<GeneratedImage> {
    const dimensions = this.getAspectRatios()[aspectRatio];
    
    return this.generateImage({
      prompt,
      ...dimensions,
      ...options,
    });
  }

  /**
   * Check if service is available (always true!)
   */
  async isAvailable(): Promise<boolean> {
    return true; // Always available, no API key needed!
  }

  /**
   * Get service info
   */
  getServiceInfo() {
    return {
      name: 'Pollinations.ai',
      cost: 'FREE',
      limits: 'UNLIMITED',
      apiKeyRequired: false,
      models: ['flux', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo', 'any-dark'],
      maxResolution: '2048x2048',
      features: [
        'No API key needed',
        'No rate limits',
        'No signup required',
        'Multiple models',
        'High quality',
        'Fast generation',
      ],
    };
  }
}

/**
 * Factory function
 */
export function createPollinationsService(): PollinationsService {
  return new PollinationsService();
}

export default PollinationsService;
