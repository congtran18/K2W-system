import axios from 'axios';

/**
 * Hugging Face - 100% Free Image Generation
 * Unlimited usage with free tier!
 * 
 * Free tier: 1000 requests/hour
 * 100% FREE forever!
 * 
 * Models:
 * - FLUX.1-dev: Best quality
 * - FLUX.1-schnell: Fastest
 * - SDXL: Stable, reliable
 */

export interface HuggingFaceOptions {
  prompt: string;
  negativePrompt?: string;
  model?: 'flux-dev' | 'flux-schnell' | 'sdxl' | 'sd-1.5';
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  seed?: number;
}

export interface GeneratedImage {
  url: string;
  blob?: Blob;
  model: string;
}

export class HuggingFaceService {
  private apiKey: string;
  private baseUrl = 'https://api-inference.huggingface.co/models';

  // Model endpoints
  private models = {
    'flux-dev': 'black-forest-labs/FLUX.1-dev',
    'flux-schnell': 'black-forest-labs/FLUX.1-schnell',
    'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',
    'sd-1.5': 'runwayml/stable-diffusion-v1-5',
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HUGGINGFACE_TOKEN || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ Hugging Face token not found. Get free token at: https://huggingface.co/settings/tokens');
    }
  }

  /**
   * Generate image with Hugging Face
   */
  async generateImage(options: HuggingFaceOptions): Promise<GeneratedImage> {
    if (!this.apiKey) {
      throw new Error('Hugging Face token required. Get it free at https://huggingface.co/settings/tokens');
    }

    const {
      prompt,
      negativePrompt,
      model = 'flux-schnell', // Fastest free model
      width = 1024,
      height = 1024,
      numInferenceSteps = 4, // Flux schnell works with 4 steps
      guidanceScale = 7.5,
      seed,
    } = options;

    const modelEndpoint = this.models[model as keyof typeof this.models];
    const url = `${this.baseUrl}/${modelEndpoint}`;

    const payload: any = {
      inputs: prompt,
      parameters: {
        width,
        height,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
      },
    };

    if (negativePrompt) {
      payload.parameters.negative_prompt = negativePrompt;
    }

    if (seed !== undefined) {
      payload.parameters.seed = seed;
    }

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      });

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');
      const mimeType = response.headers['content-type'] || 'image/png';
      const imageUrl = `data:${mimeType};base64,${base64}`;

      // Convert buffer back to Blob if needed
      const blob = new Blob([buffer], { type: mimeType });

      return {
        url: imageUrl,
        blob,
        model: modelEndpoint,
      };
    } catch (error: any) {
      console.error('Hugging Face generation error:', error);
      
      let message = 'Unknown error';
      if (error.response) {
        const status = error.response.status;
        if (status === 503) {
          message = 'Model is loading, please try again in a few seconds';
        } else {
          let errorText = '';
          if (error.response.data instanceof Buffer) {
            errorText = error.response.data.toString('utf8');
          } else if (error.response.data) {
            errorText = error.response.data.toString();
          }
          message = `Hugging Face error: ${errorText || error.response.statusText}`;
        }
      } else {
        message = error.message || message;
      }
      
      throw new Error(`Image generation failed: ${message}`);
    }
  }

  /**
   * Generate multiple images
   */
  async generateImages(
    prompt: string,
    count: number = 1,
    options?: Partial<HuggingFaceOptions>
  ): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];

    for (let i = 0; i < count; i++) {
      const image = await this.generateImage({
        prompt,
        ...options,
        seed: options?.seed ? options.seed + i : undefined,
      });
      images.push(image);
      
      // Small delay between requests
      if (i < count - 1) {
        await this.delay(1000);
      }
    }

    return images;
  }

  /**
   * Generate with style (enhanced prompt)
   */
  async generateStyledImage(
    prompt: string,
    style: 'professional' | 'modern' | 'artistic' | 'realistic' | 'anime' | '3d',
    options?: Partial<HuggingFaceOptions>
  ): Promise<GeneratedImage> {
    const stylePrompts: Record<string, string> = {
      professional: 'professional photography, high quality, business appropriate, clean composition',
      modern: 'modern style, contemporary, sleek design, minimalist, trendy',
      artistic: 'artistic, creative, expressive, vibrant colors, masterpiece',
      realistic: 'photorealistic, highly detailed, natural lighting, 8k resolution, lifelike',
      anime: 'anime style, vibrant colors, detailed characters, manga art',
      '3d': '3D render, CGI, detailed textures, professional lighting, high quality',
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style]}`;

    return this.generateImage({
      prompt: enhancedPrompt,
      ...options,
    });
  }

  /**
   * Wait for model to load
   */
  async waitForModel(model: string = 'flux-schnell', maxRetries: number = 5): Promise<boolean> {
    const modelEndpoint = this.models[model as keyof typeof this.models];
    const url = `${this.baseUrl}/${modelEndpoint}`;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await axios.post(
          url,
          {
            inputs: 'test',
            parameters: { num_inference_steps: 1 },
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          return true;
        }

        console.log(`Model loading... retry ${i + 1}/${maxRetries}`);
        await this.delay(3000); // Wait 3 seconds
      } catch (error: any) {
        if (error.response && error.response.status !== 503) {
          return true;
        }
        await this.delay(3000);
      }
    }

    return false;
  }

  /**
   * Check if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await axios.get('https://huggingface.co/api/whoami-v2', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get service info
   */
  getServiceInfo() {
    return {
      name: 'Hugging Face',
      quality: '7/10 - Good quality',
      cost: '100% FREE forever!',
      apiKeyRequired: true,
      signup: 'https://huggingface.co/join',
      limits: '1000 requests/hour',
      models: ['FLUX.1-dev', 'FLUX.1-schnell', 'SDXL', 'SD 1.5'],
      features: [
        'Completely free',
        'No credit card needed',
        'Unlimited usage',
        'Multiple models',
        '1000 req/hour',
        'Good quality',
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
export function createHuggingFaceService(apiKey?: string): HuggingFaceService {
  return new HuggingFaceService(apiKey);
}

export default HuggingFaceService;
