/**
 * Unified AI Service Wrapper
 * Smart selection with priority system:
 * 
 * TEXT Generation Priority:
 * 1. Gemini (99% cheaper, best value)
 * 2. OpenAI (fallback)
 * 
 * IMAGE Generation Priority:
 * 1. HuggingFace FLUX.1 (BEST quality FREE, unlimited — user has token!)
 * 2. Stability AI (best quality, 25 free/day)
 * 3. Pollinations (fallback, limited — may 402 on new prompts)
 * 4. Google Imagen (needs Google Cloud setup)
 * 
 * NOTE: Pollinations now returns HTTP 402 for new prompts (paid tier).
 * Stability AI is the primary free image service.
 */

import { 
  createGeminiService, 
  createOpenAIService, 
  createStabilityService,
  createHuggingFaceService,
  createPollinationsService,
  createImagenService
} from '@k2w/ai';

// Check available services
const GEMINI_AVAILABLE = !!process.env.GEMINI_API_KEY;
const OPENAI_AVAILABLE = !!process.env.OPENAI_API_KEY;
const STABILITY_AVAILABLE = !!process.env.STABILITY_API_KEY;
const HUGGINGFACE_AVAILABLE = !!process.env.HUGGINGFACE_TOKEN;
const POLLINATIONS_AVAILABLE = true; // Always available
const IMAGEN_AVAILABLE = !!process.env.GOOGLE_APPLICATION_CREDENTIALS && !!process.env.GOOGLE_CLOUD_PROJECT_ID;

console.log('\n🤖 AI Service Configuration:');
console.log('━'.repeat(60));
console.log('TEXT GENERATION:');
console.log(`  Gemini: ${GEMINI_AVAILABLE ? '✅ Active (99% cheaper!)' : '❌ Not configured'}`);
console.log(`  OpenAI: ${OPENAI_AVAILABLE ? '✅ Fallback' : '❌ Not configured'}`);
console.log('\nIMAGE GENERATION:');
console.log(`  HuggingFace: ${HUGGINGFACE_AVAILABLE ? '✅ Priority 1 (FLUX.1 — BEST quality, 100% free, unlimited!)' : '❌ Not configured'}`);
console.log(`  Stability AI: ${STABILITY_AVAILABLE ? '✅ Priority 2 (25 free/day)' : '❌ Not configured'}`);
console.log(`  Pollinations: ${POLLINATIONS_AVAILABLE ? '⚠️ Priority 3 (fallback, may 402)' : '❌'}`);
console.log(`  Google Imagen: ${IMAGEN_AVAILABLE ? '✅ Priority 4' : '❌ Not configured'}`);
console.log('━'.repeat(60) + '\n');

// Initialize text service
let textService: any;
if (GEMINI_AVAILABLE) {
  try {
    textService = createGeminiService();
    console.log('💰 Using Gemini for text (99% cheaper!)');
  } catch (error) {
    console.warn('⚠️ Gemini init failed:', error);
  }
}

if (!textService && OPENAI_AVAILABLE) {
  try {
    textService = createOpenAIService();
    console.log('⚠️ Using OpenAI for text (fallback)');
  } catch (error) {
    console.error('❌ OpenAI init failed:', error);
  }
}

// Initialize all available image services in priority order
const imageServices: Array<{ provider: string; service: any }> = [];

// Priority 1: HuggingFace FLUX.1 (BEST quality, 100% free, unlimited!)
if (HUGGINGFACE_AVAILABLE) {
  try {
    imageServices.push({ provider: 'huggingface', service: createHuggingFaceService() });
    console.log('🤗 Initialized HuggingFace FLUX.1 for images (Priority 1)');
  } catch (error) {
    console.warn('⚠️ HuggingFace init failed:', error);
  }
}

// Priority 2: Stability AI (best quality, 25 free/day)
if (STABILITY_AVAILABLE) {
  try {
    imageServices.push({ provider: 'stability', service: createStabilityService() });
    console.log('🎨 Initialized Stability AI for images (Priority 2)');
  } catch (error) {
    console.warn('⚠️ Stability init failed:', error);
  }
}

// Priority 3: Pollinations (free fallback — may 402 on new prompts)
if (POLLINATIONS_AVAILABLE) {
  try {
    imageServices.push({ provider: 'pollinations', service: createPollinationsService() });
    console.log('⚠️ Initialized Pollinations for images (Priority 3, fallback)');
  } catch (error) {
    console.warn('⚠️ Pollinations init failed:', error);
  }
}

// Priority 4: Google Imagen (needs Google Cloud setup)
if (IMAGEN_AVAILABLE) {
  try {
    imageServices.push({ provider: 'imagen', service: createImagenService() });
    console.log('🎨 Initialized Google Imagen for images (Priority 4)');
  } catch (error) {
    console.warn('⚠️ Google Imagen init failed:', error);
  }
}

if (!textService) {
  console.error('❌ No text service available! Set GEMINI_API_KEY or OPENAI_API_KEY');
}

if (imageServices.length === 0) {
  console.error('❌ No image service available!');
}

/**
 * Unified AI Provider
 * Drop-in replacement for OpenAI service
 */
export const aiProvider = {
  /**
   * Generate text/content
   */
  async generateText(prompt: string, options?: any): Promise<string> {
    if (!textService) {
      throw new Error('No AI service configured');
    }

    if (textService.generateText) {
      // Gemini
      const response = await textService.generateText(prompt, options);
      return response.text;
    } else {
      // OpenAI fallback
      const response = await textService.createChatCompletion([
        { role: 'user', content: prompt }
      ], options);
      return response;
    }
  },

  /**
   * Chat completion with message history
   */
  async chat(messages: Array<{role: string, content: string}>, options?: any): Promise<string> {
    if (!textService) {
      throw new Error('No AI service configured');
    }

    if (textService.chat) {
      // Gemini
      const response = await textService.chat(messages, options);
      return response.text;
    } else {
      // OpenAI
      return await textService.createChatCompletion(messages, options);
    }
  },

  /**
   * Generate structured JSON
   */
  async generateJSON<T = any>(prompt: string, options?: any): Promise<T> {
    if (!textService) {
      throw new Error('No AI service configured');
    }

    if (textService.generateJSON) {
      // Gemini
      return await textService.generateJSON(prompt, options);
    } else {
      // OpenAI - parse response
      const response = await textService.createChatCompletion([
        { role: 'user', content: prompt + '\n\nReturn valid JSON only.' }
      ], { ...options, temperature: 0.3 });
      
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      }
      return JSON.parse(jsonText);
    }
  },

  /**
   * Generate images with automatic fallback chain
   */
  async generateImages(prompt: string, options?: {
    count?: number;
    size?: string;
    aspectRatio?: string;
    style?: string;
  }): Promise<string[]> {
    if (imageServices.length === 0) {
      throw new Error('No image generation service is configured or available');
    }

    const errors: Error[] = [];
    const count = options?.count || 1;

    for (const { provider, service } of imageServices) {
      try {
        console.log(`🎨 Attempting image generation using provider: ${provider}...`);
        let urls: string[] = [];

        if (provider === 'imagen') {
          const images = await service.generateImages(prompt, {
            numberOfImages: count,
            aspectRatio: options?.aspectRatio || '1:1',
          });
          urls = images.map((img: any) => img.url);
        } else if (provider === 'huggingface') {
          const images: any[] = [];
          for (let i = 0; i < count; i++) {
            const img = await service.generateImage({
              prompt,
              negativePrompt: '',
              width: 1024,
              height: 1024,
              model: 'flux-schnell',
            });
            images.push(img);
          }
          urls = images.map((img: any) => img.url);
        } else if (provider === 'stability' || provider === 'pollinations') {
          const images = await service.generateImages(prompt, count, {
            aspectRatio: options?.aspectRatio || '1:1',
            style: options?.style,
          });
          urls = images.map((img: any) => img.url);
        }

        if (urls && urls.length > 0) {
          console.log(`✅ Successfully generated ${urls.length} images using provider: ${provider}`);
          return urls;
        }
      } catch (error: any) {
        console.warn(`⚠️ Image generation failed for provider ${provider}:`, error.message || error);
        errors.push(error);
      }
    }

    throw new Error(`All image generation providers failed. Errors: ${errors.map(e => e.message || e).join('; ')}`);
  },

  /**
   * Get service info
   */
  getServiceInfo() {
    const activeProviders = imageServices.map(s => s.provider).join(' -> ');
    return {
      textService: GEMINI_AVAILABLE ? 'Gemini' : (OPENAI_AVAILABLE ? 'OpenAI' : 'None'),
      imageService: activeProviders || 'None',
      costSavings: '100% (free image services)',
    };
  }
};

export default aiProvider;
