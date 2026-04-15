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

// Initialize image service with priority
let imageService: any;
let imageProvider: string = 'none';

// Priority 1: HuggingFace FLUX.1 (BEST quality, 100% free, unlimited!)
if (HUGGINGFACE_AVAILABLE) {
  try {
    imageService = createHuggingFaceService();
    imageProvider = 'huggingface';
    console.log('🤗 Using HuggingFace FLUX.1 for images (BEST quality, 100% free, unlimited!)');
  } catch (error) {
    console.warn('⚠️ HuggingFace init failed:', error);
  }
}

// Priority 2: Stability AI (best quality, 25 free/day)
if (!imageService && STABILITY_AVAILABLE) {
  try {
    imageService = createStabilityService();
    imageProvider = 'stability';
    console.log('🎨 Using Stability AI for images (25 free/day)');
  } catch (error) {
    console.warn('⚠️ Stability init failed:', error);
  }
}

// Priority 3: Pollinations (free fallback — may 402 on new prompts)
if (!imageService) {
  try {
    imageService = createPollinationsService();
    imageProvider = 'pollinations';
    console.log('⚠️ Using Pollinations for images (fallback, may be limited)');
  } catch (error) {
    console.warn('⚠️ Pollinations init failed:', error);
  }
}

// Priority 4: Google Imagen (needs Google Cloud setup)
if (!imageService && IMAGEN_AVAILABLE) {
  try {
    imageService = createImagenService();
    imageProvider = 'imagen';
    console.log('🎨 Using Google Imagen for images');
  } catch (error) {
    console.warn('⚠️ Google Imagen init failed:', error);
  }
}

if (!textService) {
  console.error('❌ No text service available! Set GEMINI_API_KEY or OPENAI_API_KEY');
}

if (!imageService) {
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
   * Generate images
   */
  async generateImages(prompt: string, options?: {
    count?: number;
    size?: string;
    aspectRatio?: string;
    style?: string;
  }): Promise<string[]> {
    if (!imageService) {
      throw new Error('No image generation service configured');
    }

    if (imageProvider === 'imagen') {
      // Google Imagen 3
      const images = await imageService.generateImages(prompt, {
        numberOfImages: options?.count || 1,
        aspectRatio: options?.aspectRatio || '1:1',
      });
      return images.map((img: any) => img.url);
    } else if (imageProvider === 'huggingface') {
      // HuggingFace only has generateImage (singular) - loop manually
      const count = options?.count || 1;
      const images: any[] = [];
      for (let i = 0; i < count; i++) {
        const img = await imageService.generateImage({
          prompt,
          negativePrompt: '',
          width: 1024,
          height: 1024,
          model: 'flux-schnell',
        });
        images.push(img);
      }
      return images.map((img: any) => img.url);
    } else if (imageProvider === 'stability' || imageProvider === 'pollinations') {
      // These have generateImages(prompt, count, options)
      const count = options?.count || 1;
      const images = await imageService.generateImages(prompt, count, {
        aspectRatio: options?.aspectRatio || '1:1',
        style: options?.style,
      });
      return images.map((img: any) => img.url);
    } else {
      // Fallback: treat as pollinations-style (generateImages with prompt, count, options)
      const count = options?.count || 1;
      const images = await imageService.generateImages(prompt, count, {
        aspectRatio: options?.aspectRatio || '1:1',
        style: options?.style,
      });
      return images.map((img: any) => img.url);
    }
  },

  /**
   * Get service info
   */
  getServiceInfo() {
    return {
      textService: GEMINI_AVAILABLE ? 'Gemini' : (OPENAI_AVAILABLE ? 'OpenAI' : 'None'),
      imageService: imageProvider === 'huggingface' ? 'HuggingFace FLUX.1 (FREE)' :
                    (imageProvider === 'stability' ? 'Stability AI (FREE tier)' :
                    (imageProvider === 'pollinations' ? 'Pollinations AI (fallback)' :
                    (imageProvider === 'imagen' ? 'Google Imagen' : 'None'))),
      costSavings: '100% (free image services)',
    };
  }
};

export default aiProvider;
