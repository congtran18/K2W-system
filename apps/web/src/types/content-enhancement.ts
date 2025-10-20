/**
 * Content Enhancement Types
 * Type definitions for content generation, image creation, translation, and publishing
 */

// Base Content Tools Props
export interface ContentToolsProps {
  contentId?: string;
}

// Image Generation Types
export interface ImageGenerationFormData {
  keyword_id: string;
  content_id: string;
  image_type: 'featured' | 'inline' | 'thumbnail' | 'banner';
  style: 'realistic' | 'artistic' | 'minimal' | 'corporate';
  dimensions: { width: number; height: number };
  prompt_override: string;
}

export interface BatchImageGenerationRequest {
  content_ids: string[];
  image_configs: Array<{
    type: 'featured' | 'inline' | 'thumbnail' | 'banner';
    style: 'realistic' | 'artistic' | 'minimal' | 'corporate';
    dimensions: { width: number; height: number };
  }>;
}

export interface ImageStatus {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  url?: string;
  error?: string;
}

// Translation Types
export interface TranslationFormData {
  content_id: string;
  target_language: string;
  formality: 'formal' | 'informal';
  preserve_formatting: boolean;
  custom_glossary: Record<string, string>;
}

export interface TranslationStatus {
  id: string;
  status: 'pending' | 'translating' | 'completed' | 'failed';
  progress: number;
  target_language: string;
  translated_content?: string;
  error?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  region?: string;
}

// Publishing Types
export interface PublishingFormData {
  content_ids: string[];
  platform: 'wordpress' | 'webflow' | 'custom';
  schedule_type: 'immediate' | 'scheduled' | 'queue';
  publish_date?: string;
  platform_config: Record<string, unknown>;
}

export interface PublishStatus {
  id: string;
  content_id: string;
  status: 'pending' | 'publishing' | 'published' | 'failed';
  platform: string;
  publish_url?: string;
  error?: string;
  published_at?: string;
}

// Content Management Types
export interface ContentItem {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  type: 'article' | 'page' | 'product';
  word_count: number;
  seo_score: number;
  created_at: string;
  updated_at: string;
}

// Enhancement Options
export interface ContentEnhancementOptions {
  improve_seo: boolean;
  enhance_readability: boolean;
  add_images: boolean;
  translate: boolean;
  target_languages?: string[];
  auto_publish: boolean;
}

// Batch Processing Types
export interface BatchProcessRequest {
  content_ids: string[];
  operations: Array<{
    type: 'image_generation' | 'translation' | 'publishing' | 'optimization';
    config: Record<string, unknown>;
  }>;
}

export interface BatchProcessStatus {
  id: string;
  total_items: number;
  completed_items: number;
  failed_items: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: Array<{
    content_id: string;
    operation: string;
    status: 'success' | 'failed';
    result?: unknown;
    error?: string;
  }>;
}