/**
 * Google Imagen 3 Service
 * Image generation using Google's Imagen model
 */

import { GoogleAuth } from 'google-auth-library';

export interface ImagenOptions {
  prompt: string;
  negativePrompt?: string;
  numberOfImages?: number; // 1-8
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  guidanceScale?: number; // 1-20
  seed?: number;
  language?: string;
  outputFormat?: 'png' | 'jpeg';
  compressionQuality?: number; // 0-100
  addWatermark?: boolean;
  safetyFilterLevel?: 'block_most' | 'block_some' | 'block_few' | 'block_fewest';
}

export interface ImagenResponse {
  images: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
  modelVersion?: string;
}

export interface GeneratedImage {
  url: string; // data URL
  base64: string;
  mimeType: string;
}

export class ImagenService {
  private projectId: string;
  private location: string = 'us-central1';
  private auth: GoogleAuth;
  private apiEndpoint: string;

  constructor(projectId?: string, location?: string) {
    this.projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT_ID || '';
    this.location = location || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    if (!this.projectId) {
      console.warn('Google Cloud Project ID not set. Image generation will fail.');
    }

    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });

    this.apiEndpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/imagen-3.0-generate-001:predict`;
  }

  /**
   * Generate images using Imagen 3
   */
  async generateImages(
    prompt: string,
    options: Partial<ImagenOptions> = {}
  ): Promise<GeneratedImage[]> {
    if (!this.projectId) {
      throw new Error('Google Cloud Project ID is required. Set GOOGLE_CLOUD_PROJECT_ID environment variable.');
    }

    try {
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();

      if (!accessToken.token) {
        throw new Error('Failed to get access token');
      }

      const requestBody = {
        instances: [{
          prompt: prompt,
          ...(options.negativePrompt && { negativePrompt: options.negativePrompt }),
        }],
        parameters: {
          sampleCount: options.numberOfImages || 1,
          aspectRatio: options.aspectRatio || '1:1',
          ...(options.guidanceScale && { guidanceScale: options.guidanceScale }),
          ...(options.seed && { seed: options.seed }),
          language: options.language || 'en',
          outputOptions: {
            mimeType: options.outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png',
            ...(options.compressionQuality && { compressionQuality: options.compressionQuality }),
          },
          addWatermark: options.addWatermark ?? false,
          safetyFilterLevel: options.safetyFilterLevel || 'block_some',
        },
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Imagen API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as ImagenResponse;

      // Convert base64 images to data URLs
      return data.images.map(img => ({
        url: `data:${img.mimeType};base64,${img.bytesBase64Encoded}`,
        base64: img.bytesBase64Encoded,
        mimeType: img.mimeType,
      }));

    } catch (error) {
      console.error('Imagen generation error:', error);
      throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhance prompt for better image quality
   */
  enhancePrompt(
    basePrompt: string,
    style: 'professional' | 'modern' | 'artistic' | 'realistic' = 'professional'
  ): string {
    const styleEnhancements: Record<string, string> = {
      professional: 'professional photography, high quality, clean composition, good lighting, business appropriate',
      modern: 'modern style, contemporary, sleek design, minimalist, trendy aesthetics',
      artistic: 'artistic, creative, expressive, unique composition, vibrant colors',
      realistic: 'photorealistic, highly detailed, natural lighting, 8k resolution, lifelike',
    };

    return `${basePrompt}, ${styleEnhancements[style]}, masterpiece quality, professional grade`;
  }

  /**
   * Generate images with automatic prompt enhancement
   */
  async generateEnhancedImages(
    prompt: string,
    style: 'professional' | 'modern' | 'artistic' | 'realistic' = 'professional',
    options: Partial<ImagenOptions> = {}
  ): Promise<GeneratedImage[]> {
    const enhancedPrompt = this.enhancePrompt(prompt, style);
    return this.generateImages(enhancedPrompt, options);
  }

  /**
   * Batch generate images for multiple prompts
   */
  async batchGenerate(
    prompts: string[],
    options: Partial<ImagenOptions> = {},
    delayMs: number = 1000
  ): Promise<Record<string, GeneratedImage[]>> {
    const results: Record<string, GeneratedImage[]> = {};

    for (const prompt of prompts) {
      try {
        const images = await this.generateImages(prompt, options);
        results[prompt] = images;

        // Add delay to respect rate limits
        if (prompts.indexOf(prompt) < prompts.length - 1) {
          await this.delay(delayMs);
        }
      } catch (error) {
        console.error(`Failed to generate images for prompt: ${prompt}`, error);
        results[prompt] = [];
      }
    }

    return results;
  }

  /**
   * Check if Imagen is properly configured
   */
  async isConfigured(): Promise<boolean> {
    try {
      if (!this.projectId) return false;
      
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();
      
      return !!accessToken.token;
    } catch (error) {
      console.error('Imagen configuration check failed:', error);
      return false;
    }
  }

  /**
   * Get supported aspect ratios
   */
  getSupportedAspectRatios(): string[] {
    return ['1:1', '3:4', '4:3', '9:16', '16:9'];
  }

  /**
   * Convert aspect ratio to size
   */
  aspectRatioToSize(aspectRatio: string, baseSize: number = 1024): { width: number; height: number } {
    const ratios: Record<string, [number, number]> = {
      '1:1': [1, 1],
      '3:4': [3, 4],
      '4:3': [4, 3],
      '9:16': [9, 16],
      '16:9': [16, 9],
    };

    const [w, h] = ratios[aspectRatio] || [1, 1];
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(w, h);
    
    return {
      width: (w / divisor) * baseSize,
      height: (h / divisor) * baseSize,
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create Imagen service
 */
export function createImagenService(projectId?: string, location?: string): ImagenService {
  return new ImagenService(projectId, location);
}

/**
 * Default export
 */
export default ImagenService;
