import { z } from 'zod';

/**
 * K2W System Workflow Manager
 * Implements the 7-stage automation workflow from specs Section 4
 */

// Stage definitions from Section 4.2
export enum WorkflowStage {
  KEYWORD_INPUT = 'keyword_input',
  CONTENT_GENERATION = 'content_generation', 
  IMAGE_GENERATION = 'image_generation',
  SEO_OPTIMIZATION = 'seo_optimization',
  PUBLISHING = 'publishing',
  ANALYTICS_TRACKING = 'analytics_tracking',
  FEEDBACK_LOOP = 'feedback_loop'
}

// Workflow status
export enum WorkflowStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused'
}

// Stage 1: Keyword Input & Clustering (Section 4.2)
export interface KeywordInputStage {
  keywords: string[];
  market: string;
  language: string;
  searchIntent: 'transactional' | 'informational' | 'navigational' | 'commercial';
  clusterId?: string;
  projectId: string;
}

// Stage 2: AI Content Generation (Section 4.2)
export interface ContentGenerationStage {
  keywordId: string;
  clusterId: string;
  template: 'article' | 'blog' | 'product' | 'landing';
  targetWordCount: number;
  language: string;
  region: string;
}

// Stage 3: AI Image Generation (Section 4.2)
export interface ImageGenerationStage {
  contentId: string;
  keyword: string;
  imageCount: number;
  style: 'professional' | 'modern' | 'industrial';
  region: string;
}

// Stage 4: SEO Optimization & Validation (Section 4.2)
export interface SEOOptimizationStage {
  contentId: string;
  targetKeyword: string;
  competitors?: string[];
  minReadabilityScore: number;
  targetKeywordDensity: number;
}

// Stage 5: Website Compilation & Publishing (Section 4.2)
export interface PublishingStage {
  contentId: string;
  platform: 'wordpress' | 'firebase' | 'replit' | 'static';
  domain: string;
  autoCreateNavigation: boolean;
  generateSitemap: boolean;
}

// Stage 6: Analytics & Tracking (Section 4.2)
export interface AnalyticsTrackingStage {
  contentId: string;
  url: string;
  trackingEnabled: boolean;
  metricsToCollect: string[];
}

// Stage 7: AI Feedback Loop (Section 4.2)
export interface FeedbackLoopStage {
  contentId: string;
  performanceThresholds: {
    minCTR: number;
    minPosition: number;
    maxBounceRate: number;
  };
  reviewIntervalDays: number;
}

// Workflow execution context
export interface WorkflowContext {
  id: string;
  projectId: string;
  currentStage: WorkflowStage;
  status: WorkflowStatus;
  stages: {
    keywordInput?: KeywordInputStage;
    contentGeneration?: ContentGenerationStage;
    imageGeneration?: ImageGenerationStage;
    seoOptimization?: SEOOptimizationStage;
    publishing?: PublishingStage;
    analyticsTracking?: AnalyticsTrackingStage;
    feedbackLoop?: FeedbackLoopStage;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedCompletionTime?: Date;
  };
  errors: Array<{
    stage: WorkflowStage;
    error: string;
    timestamp: Date;
    retryCount: number;
  }>;
  humanApprovalRequired?: boolean;
  humanApprovalStage?: WorkflowStage;
}

// Automation triggers from Section 4.4
export interface AutomationTrigger {
  type: 'manual' | 'scheduled' | 'event' | 'api';
  source: string;
  conditions?: Record<string, any>;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
}

// Notification system from Section 4.6
export interface NotificationConfig {
  email?: {
    enabled: boolean;
    recipients: string[];
    events: string[];
  };
  telegram?: {
    enabled: boolean;
    chatId: string;
    events: string[];
  };
  slack?: {
    enabled: boolean;
    webhook: string;
    events: string[];
  };
}

// Human-in-loop control from Section 4.5
export interface HumanApprovalGate {
  stage: WorkflowStage;
  required: boolean;
  approvers: string[];
  timeoutMinutes: number;
  defaultAction: 'approve' | 'reject' | 'pause';
}

// Quality thresholds for validation
export interface QualityThresholds {
  content: {
    minWordCount: number;
    maxWordCount: number;
    minReadabilityScore: number;
    keywordDensityRange: [number, number];
  };
  seo: {
    maxMetaTitleLength: number;
    maxMetaDescriptionLength: number;
    minHeadingCount: number;
    requiredStructure: string[];
  };
  performance: {
    minPageSpeedScore: number;
    maxLoadTime: number;
    mobileOptimized: boolean;
  };
}

// Workflow configuration
export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  stages: WorkflowStage[];
  automationTriggers: AutomationTrigger[];
  qualityThresholds: QualityThresholds;
  humanApprovalGates: HumanApprovalGate[];
  notifications: NotificationConfig;
  retryPolicy: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    retryDelayMinutes: number;
  };
  timeouts: {
    stageTimeoutMinutes: Record<WorkflowStage, number>;
    totalWorkflowTimeoutHours: number;
  };
}

// Validation schemas
export const KeywordInputStageSchema = z.object({
  keywords: z.array(z.string()).min(1),
  market: z.string(),
  language: z.string(),
  searchIntent: z.enum(['transactional', 'informational', 'navigational', 'commercial']),
  clusterId: z.string().optional(),
  projectId: z.string()
});

export const ContentGenerationStageSchema = z.object({
  keywordId: z.string(),
  clusterId: z.string(),
  template: z.enum(['article', 'blog', 'product', 'landing']),
  targetWordCount: z.number().min(500).max(3000),
  language: z.string(),
  region: z.string()
});

export const WorkflowContextSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  currentStage: z.nativeEnum(WorkflowStage),
  status: z.nativeEnum(WorkflowStatus),
  stages: z.object({
    keywordInput: KeywordInputStageSchema.optional(),
    contentGeneration: ContentGenerationStageSchema.optional()
    // Add other stage schemas as needed
  }),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
    estimatedCompletionTime: z.date().optional()
  }),
  errors: z.array(z.object({
    stage: z.nativeEnum(WorkflowStage),
    error: z.string(),
    timestamp: z.date(),
    retryCount: z.number()
  })),
  humanApprovalRequired: z.boolean().optional(),
  humanApprovalStage: z.nativeEnum(WorkflowStage).optional()
});

// Export types
export type K2WWorkflowContext = z.infer<typeof WorkflowContextSchema>;
export type K2WKeywordInputStage = z.infer<typeof KeywordInputStageSchema>;
export type K2WContentGenerationStage = z.infer<typeof ContentGenerationStageSchema>;