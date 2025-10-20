/**
 * Unified AI Service Wrapper
 * Smart selection with priority system:
 * 
 * TEXT Generation Priority:
 * 1. Gemini (99% cheaper, best value)
 * 2. OpenAI (fallback)
 * 
 * IMAGE Generation Priority:
 * 1. Stability AI (best quality, 25 free/day)
 * 2. Hugging Face (100% free, unlimited)
 * 3. Pollinations (100% free, no API key)
 * 4. DALL-E (fallback)
 */

import { 
  createGeminiService, 
  createOpenAIService, 
  createStabilityService,
  createHuggingFaceService,
  createPollinationsService 
} from '@k2w/ai';

// Check available services
const GEMINI_AVAILABLE = !!process.env.GEMINI_API_KEY;
const OPENAI_AVAILABLE = !!process.env.OPENAI_API_KEY;
const STABILITY_AVAILABLE = !!process.env.STABILITY_API_KEY;
const HUGGINGFACE_AVAILABLE = !!process.env.HUGGINGFACE_TOKEN;
const POLLINATIONS_AVAILABLE = true; // Always available

console.log('\n🤖 AI Service Configuration:');
console.log('━'.repeat(60));
console.log('TEXT GENERATION:');
console.log(`  Gemini: ${GEMINI_AVAILABLE ? '✅ Active (99% cheaper!)' : '❌ Not configured'}`);
console.log(`  OpenAI: ${OPENAI_AVAILABLE ? '✅ Fallback' : '❌ Not configured'}`);
console.log('\nIMAGE GENERATION:');
console.log(`  Stability AI: ${STABILITY_AVAILABLE ? '✅ Priority 1 (best quality, 25 free/day)' : '❌ Not configured'}`);
console.log(`  Hugging Face: ${HUGGINGFACE_AVAILABLE ? '✅ Priority 2 (100% free, unlimited)' : '❌ Not configured'}`);
console.log(`  Pollinations: ✅ Priority 3 (100% free, no key needed)`);
console.log(`  DALL-E: ${OPENAI_AVAILABLE ? '✅ Fallback' : '❌ Not configured'}`);
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

// Priority 1: Stability AI (best quality)
if (STABILITY_AVAILABLE && !imageService) {
  try {
    imageService = createStabilityService();
    imageProvider = 'stability';
    console.log('🎨 Using Stability AI for images (best quality, 25 free/day)');
  } catch (error) {
    console.warn('⚠️ Stability init failed:', error);
  }
}

// Priority 2: Hugging Face (free unlimited)
if (HUGGINGFACE_AVAILABLE && !imageService) {
  try {
    imageService = createHuggingFaceService();
    imageProvider = 'huggingface';
    console.log('� Using Hugging Face for images (100% free, unlimited)');
  } catch (error) {
    console.warn('⚠️ Hugging Face init failed:', error);
  }
}

// Priority 3: Pollinations (no key needed)
if (!imageService) {
  try {
    imageService = createPollinationsService();
    imageProvider = 'pollinations';
    console.log('🎨 Using Pollinations for images (100% free, no key)');
  } catch (error) {
    console.warn('⚠️ Pollinations init failed:', error);
  }
}

// Priority 4: DALL-E (fallback)
if (OPENAI_AVAILABLE && !imageService) {
  try {
    imageService = createOpenAIService();
    imageProvider = 'dalle';
    console.log('🎨 Using DALL-E for images (fallback)');
  } catch (error) {
    console.warn('⚠️ DALL-E init failed:', error);
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

    if (imageService.generateImages && IMAGEN_AVAILABLE) {
      // Imagen
      const images = await imageService.generateImages(prompt, {
        numberOfImages: options?.count || 1,
        aspectRatio: options?.aspectRatio || '1:1',
      });
      return images.map((img: any) => img.url);
    } else {
      // DALL-E
      return await imageService.generateImages(prompt, {
        size: options?.size || '1024x1024',
        n: options?.count || 1,
      });
    }
  },

  /**
   * Get service info
   */
  getServiceInfo() {
    return {
      textService: GEMINI_AVAILABLE ? 'Gemini' : (OPENAI_AVAILABLE ? 'OpenAI' : 'None'),
      imageService: IMAGEN_AVAILABLE ? 'Imagen' : (OPENAI_AVAILABLE ? 'DALL-E' : 'None'),
      costSavings: GEMINI_AVAILABLE ? '95%' : '0%',
    };
  }
};

export default aiProvider;
