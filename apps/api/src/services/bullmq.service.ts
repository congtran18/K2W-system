import { EventEmitter } from 'events';

// Mock Bull MQ interfaces for development
interface MockJob {
  id: string;
  data: any;
  progress: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

interface K2WWorkflowData {
  keywords: string[];
  userId: string;
  targetLanguage?: string;
  siteConfig?: {
    domain: string;
    theme?: string;
    niche?: string;
    [key: string]: any;
  };
  options?: {
    generateImages?: boolean;
    enableSEO?: boolean;
    enableTranslation?: boolean;
    publishImmediately?: boolean;
    [key: string]: any;
  };
}

interface WorkflowStage {
  name: string;
  progress: number;
  message: string;
  completed: boolean;
}

export default class BullMQService extends EventEmitter {
  private jobs = new Map<string, MockJob>();
  private isConnected = false;

  constructor() {
    super();
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      // Mock connection - in production, this would connect to Redis
      console.log('[BULLMQ] Connecting to Redis...');
      this.isConnected = true;
      console.log('[BULLMQ] Connected successfully');
    } catch (error) {
      console.error('[BULLMQ] Connection failed:', error);
      this.isConnected = false;
    }
  }

  async addWorkflow(data: K2WWorkflowData): Promise<string> {
    const jobId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: MockJob = {
      id: jobId,
      data,
      progress: 0,
      status: 'waiting',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.jobs.set(jobId, job);
    
    console.log(`[BULLMQ] Job ${jobId} added to queue`);
    
    // Start processing immediately (in production, this would be handled by worker)
    this.processWorkflow(jobId);
    
    return jobId;
  }

  async getJobStatus(jobId: string): Promise<MockJob | null> {
    return this.jobs.get(jobId) || null;
  }

  private async processWorkflow(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'active';
      job.updatedAt = new Date();

      const stages: WorkflowStage[] = [
        { name: 'keyword_analysis', progress: 15, message: 'Analyzing keywords...', completed: false },
        { name: 'content_generation', progress: 35, message: 'Generating content...', completed: false },
        { name: 'image_generation', progress: 55, message: 'Creating images...', completed: false },
        { name: 'seo_optimization', progress: 70, message: 'Optimizing for SEO...', completed: false },
        { name: 'translation', progress: 85, message: 'Translating content...', completed: false },
        { name: 'publishing', progress: 95, message: 'Publishing website...', completed: false },
        { name: 'analytics_setup', progress: 100, message: 'Setting up analytics...', completed: false }
      ];

      for (const stage of stages) {
        // Simulate processing time
        await this.delay(2000 + Math.random() * 3000);

        job.progress = stage.progress;
        job.updatedAt = new Date();
        stage.completed = true;

        console.log(`[BULLMQ] Job ${jobId} - ${stage.name}: ${stage.progress}%`);

        // Emit progress event
        this.emit('stage:updated', {
          jobId,
          userId: job.data.userId,
          stage: stage.name,
          progress: stage.progress,
          message: stage.message,
          timestamp: new Date().toISOString()
        });
      }

      // Job completed
      job.status = 'completed';
      job.progress = 100;
      job.updatedAt = new Date();

      console.log(`[BULLMQ] Job ${jobId} completed successfully`);

      // Emit completion event
      this.emit('workflow:completed', {
        jobId,
        userId: job.data.userId,
        data: job.data,
        result: {
          websiteUrl: `https://${job.data.siteConfig?.domain || 'generated-site.com'}`,
          pages: job.data.keywords.length,
          seoScore: 85 + Math.random() * 15,
          publishedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[BULLMQ] Job ${jobId} failed:`, error);
      
      job.status = 'failed';
      job.updatedAt = new Date();

      // Emit failure event
      this.emit('workflow:failed', {
        jobId,
        userId: job.data.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const jobs = Array.from(this.jobs.values());
    
    return {
      waiting: jobs.filter(j => j.status === 'waiting').length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length
    };
  }

  async removeJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    // Only allow removing waiting jobs
    if (job.status === 'waiting') {
      this.jobs.delete(jobId);
      console.log(`[BULLMQ] Job ${jobId} removed from queue`);
      return true;
    }

    return false;
  }

  async close(): Promise<void> {
    console.log('[BULLMQ] Closing connections...');
    this.jobs.clear();
    this.isConnected = false;
    this.removeAllListeners();
    console.log('[BULLMQ] Closed successfully');
  }

  isReady(): boolean {
    return this.isConnected;
  }

  getJobCount(): number {
    return this.jobs.size;
  }

  // Clean up old completed jobs
  async cleanupOldJobs(olderThanHours: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    let removedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if ((job.status === 'completed' || job.status === 'failed') && 
          job.updatedAt < cutoffTime) {
        this.jobs.delete(jobId);
        removedCount++;
      }
    }

    console.log(`[BULLMQ] Cleaned up ${removedCount} old jobs`);
    return removedCount;
  }
}