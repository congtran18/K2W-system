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
 * - FLUX.1-schnell: Fastest (default)
 * - SDXL: Stable, reliable
 * 
 * NOTE: DoH custom HTTPS agent removed — Cloudflare rejects IP-direct TLS connections
 * (ssl3 alert handshake failure). DNS must resolve normally.
 * On HF Spaces, api-inference.huggingface.co resolves fine internally.
 * For environments where DNS fails, the ai-provider fallback chain handles it.
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

  async generateImage(options: HuggingFaceOptions): Promise<GeneratedImage> {
    if (!this.apiKey) {
      throw new Error('Hugging Face token required. Get it free at https://huggingface.co/settings/tokens');
    }

    const { prompt, negativePrompt, model = 'flux-schnell', width = 1024, height = 1024,
            numInferenceSteps = 4, guidanceScale = 7.5, seed } = options;

    const modelEndpoint = this.models[model as keyof typeof this.models];
    const url = `${this.baseUrl}/${modelEndpoint}`;

    const payload: any = {
      inputs: prompt,
      parameters: { width, height, num_inference_steps: numInferenceSteps, guidance_scale: guidanceScale },
    };
    if (negativePrompt) payload.parameters.negative_prompt = negativePrompt;
    if (seed !== undefined) payload.parameters.seed = seed;

    try {
      const response = await axios.post(url, payload, {
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        responseType: 'arraybuffer',
        timeout: 60000,
      });

      const buffer = Buffer.from(response.data);
      const base64 = buffer.toString('base64');
      const mimeType = response.headers['content-type'] || 'image/png';
      return { url: `data:${mimeType};base64,${base64}`, blob: new Blob([buffer], { type: mimeType }), model: modelEndpoint };
    } catch (error: any) {
      console.error('Hugging Face generation error:', error.message || error);
      let message = 'Unknown error';
      if (error.response) {
        const status = error.response.status;
        if (status === 503) message = 'Model is loading, please try again in a few seconds';
        else {
          let errorText = '';
          if (error.response.data instanceof Buffer) errorText = error.response.data.toString('utf8');
          else if (error.response.data) errorText = String(error.response.data);
          message = `HTTP ${status}: ${errorText || error.response.statusText}`;
        }
      } else message = error.message || message;
      throw new Error(`Image generation failed: ${message}`);
    }
  }

  async generateImages(prompt: string, count: number = 1, options?: Partial<HuggingFaceOptions>): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];
    for (let i = 0; i < count; i++) {
      images.push(await this.generateImage({ prompt, ...options, seed: options?.seed ? options.seed + i : undefined }));
      if (i < count - 1) await this.delay(1000);
    }
    return images;
  }

  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const r = await axios.get('https://huggingface.co/api/whoami-v2', { headers: { 'Authorization': `Bearer ${this.apiKey}` }, timeout: 10000 });
      return r.status === 200;
    } catch { return false; }
  }

  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

export function createHuggingFaceService(apiKey?: string): HuggingFaceService { return new HuggingFaceService(apiKey); }
export default HuggingFaceService;
