// Export schemas and types from OpenAI (shared)
export {
  ContentGenerationInput,
  ContentGenerationInputSchema,
  ContentGenerationOutput,
  ContentGenerationOutputSchema,
} from './openai';

// Export service classes and factories
export { OpenAIService, createOpenAIService } from './openai';
export { GeminiService, createGeminiService } from './gemini';
export { ImagenService, createImagenService } from './imagen';
export { PollinationsService, createPollinationsService } from './pollinations';
export { StabilityAIService, createStabilityService } from './stability';
export { HuggingFaceService, createHuggingFaceService } from './huggingface';
export * from './prompts';

// Default services
// Text: Gemini (99% cheaper than OpenAI)
// Image: Stability AI (best quality) or Hugging Face (100% free)
export { createGeminiService as createAIService } from './gemini';
export { createStabilityService as createImageService } from './stability';