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
  private fluxSpaceUrl: string;

  private models = {
    'flux-dev': 'black-forest-labs/FLUX.1-dev',
    'flux-schnell': 'black-forest-labs/FLUX.1-schnell',
    'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',
    'sd-1.5': 'runwayml/stable-diffusion-v1-5',
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.HUGGINGFACE_TOKEN || '';
    this.fluxSpaceUrl = process.env.FLUX_SPACE_URL || '';
    
    if (!this.apiKey && !this.fluxSpaceUrl) {
      console.warn('⚠️ No HuggingFace token or FLUX Space URL configured.');
    }
    if (this.fluxSpaceUrl) {
      console.log(`[HuggingFace] Using FLUX Space: ${this.fluxSpaceUrl}`);
    }
  }

  async generateImage(options: HuggingFaceOptions): Promise<GeneratedImage> {
    const { prompt, negativePrompt, model = 'flux-schnell', width = 1024, height = 1024,
            numInferenceSteps = 4, guidanceScale = 7.5, seed } = options;

    // Priority: FLUX Space (self-hosted) > Inference API
    if (this.fluxSpaceUrl) {
      return this.generateViaFluxSpace(prompt, width, height, numInferenceSteps);
    }

    if (!this.apiKey) {
      throw new Error('Hugging Face token required. Set HUGGINGFACE_TOKEN or FLUX_SPACE_URL');
    }

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
    if (this.fluxSpaceUrl) return true; // Self-hosted doesn't need API key
    if (!this.apiKey) return false;
    try {
      const r = await axios.get('https://huggingface.co/api/whoami-v2', { headers: { 'Authorization': `Bearer ${this.apiKey}` }, timeout: 10000 });
      return r.status === 200;
    } catch { return false; }
  }

  /**
   * Generate image via self-hosted FLUX Space (primary method)
   * Endpoint: POST {FLUX_SPACE_URL}/generate
   * Body: {"prompt": "...", "width": 1024, "height": 1024}
   * Response: {"url": "data:image/png;base64,..."}
   */
  private async generateViaFluxSpace(prompt: string, width: number, height: number, steps: number): Promise<GeneratedImage> {
    const url = `${this.fluxSpaceUrl}/generate`;
    console.log(`[HuggingFace] Calling FLUX Space: ${url}`);

    try {
      const response = await axios.post(url, {
        prompt,
        width,
        height,
        num_inference_steps: steps,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 300000, // 5 min timeout for CPU inference
      });

      return {
        url: response.data.url,
        model: 'FLUX.1-schnell (self-hosted)',
      };
    } catch (error: any) {
      if (error.response?.status === 503 || error.code === 'ECONNRESET') {
        // Space waking up - retry once after 30s
        console.log('[HuggingFace] FLUX Space waking up, retrying in 30s...');
        await this.delay(30000);
        const retry = await axios.post(url, { prompt, width, height, num_inference_steps: steps }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 300000,
        });
        return { url: retry.data.url, model: 'FLUX.1-schnell (self-hosted)' };
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
}

export function createHuggingFaceService(apiKey?: string): HuggingFaceService { return new HuggingFaceService(apiKey); }
export default HuggingFaceService;
