/**
 * K2W Workflow API Routes
 * Real-time workflow management
 */

import { Router, Request, Response } from 'express';
import BullMQService from '../services/bullmq.service';

// Mock workflow manager using BullMQ service
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
  batchId?: string;
}

class MockWorkflowManager {
  private bullmq: BullMQService;
  
  constructor() {
    this.bullmq = new BullMQService();
  }
  
  async startWorkflow(data: K2WWorkflowData) {
    const workflowId = await this.bullmq.addWorkflow(data);
    return {
      workflowId,
      estimatedDuration: 300000, // 5 minutes
      stages: ['keyword_analysis', 'content_generation', 'seo_optimization', 'publishing']
    };
  }
  
  getWorkflowStatus(workflowId: string): any {
    return this.bullmq.getJobStatus(workflowId);
  }
  
  async cancelWorkflow(workflowId: string, userId: string) {
    console.log(`Cancelling workflow ${workflowId} for user ${userId}`);
    return await this.bullmq.removeJob(workflowId);
  }
  
  async retryWorkflow(workflowId: string) {
    const job = await this.bullmq.getJobStatus(workflowId);
    if (job && job.status === 'failed') {
      return await this.bullmq.addWorkflow(job.data);
    }
    return null;
  }
  
  getUserWorkflows(userId: string): any[] {
    // Mock implementation - would return actual workflows from database
    console.log(`Getting workflows for user: ${userId}`);
    return [
      {
        id: 'workflow_1',
        status: 'completed',
        keywords: ['test'],
        createdAt: new Date()
      }
    ];
  }
  
  getQueueStats() {
    return this.bullmq.getQueueStats();
  }
}

export class K2WWorkflowController {
  private router: Router;
  private workflowManager: MockWorkflowManager;

  constructor(workflowManager?: MockWorkflowManager) {
    this.router = Router();
    this.workflowManager = workflowManager || new MockWorkflowManager();
    this.initializeRoutes();
    
    console.log('🛣️ K2W Workflow API routes initialized');
  }

  public getRouter(): Router {
    return this.router;
  }

  private initializeRoutes(): void {
    /**
     * POST /api/workflows/start
     * Start a new K2W workflow with real-time updates
     */
    this.router.post('/start', this.startWorkflow.bind(this));

    /**
     * GET /api/workflows/:workflowId
     * Get workflow status and progress
     */
    this.router.get('/:workflowId', this.getWorkflowStatus.bind(this));

    /**
     * POST /api/workflows/:workflowId/cancel
     * Cancel a running workflow
     */
    this.router.post('/:workflowId/cancel', this.cancelWorkflow.bind(this));

    /**
     * POST /api/workflows/:workflowId/retry
     * Retry a failed workflow
     */
    this.router.post('/:workflowId/retry', this.retryWorkflow.bind(this));

    /**
     * GET /api/workflows/user/:userId
     * Get user's workflows
     */
    this.router.get('/user/:userId', this.getUserWorkflows.bind(this));

    /**
     * GET /api/workflows/queue/stats
     * Get queue statistics
     */
    this.router.get('/queue/stats', this.getQueueStats.bind(this));

    /**
     * POST /api/workflows/batch
     * Start multiple workflows in batch
     */
    this.router.post('/batch', this.startBatchWorkflows.bind(this));

    console.log('✅ All workflow routes configured');
  }

  private async startWorkflow(req: Request, res: Response): Promise<void> {
    try {
      // Basic validation (replace with express-validator when installed)
      const workflowData: K2WWorkflowData = req.body;
      
      if (!workflowData.keywords || !Array.isArray(workflowData.keywords) || workflowData.keywords.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Keywords array is required'
        });
        return;
      }

      // Validate business rules
      if (workflowData.options?.enableTranslation && workflowData.targetLanguage === 'en') {
        res.status(400).json({
          success: false,
          error: 'Translation not needed for English content'
        });
        return;
      }

      const result = await this.workflowManager.startWorkflow(workflowData);

      res.status(201).json({
        success: true,
        data: {
          workflowId: result.workflowId,
          estimatedDuration: result.estimatedDuration,
          stages: result.stages,
          message: 'Workflow started successfully. You will receive real-time updates.',
          socketInfo: {
            event: 'workflow:progress',
            channel: `user:${workflowData.userId}`
          }
        }
      });

      console.log(`🎯 Workflow API: Started ${result.workflowId} for user ${workflowData.userId}`);

    } catch (error: any) {
      console.error('❌ Workflow API error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to start workflow',
        message: error.message
      });
    }
  }

  private async getWorkflowStatus(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;
      
      if (!workflowId) {
        res.status(400).json({
          success: false,
          error: 'Workflow ID is required'
        });
        return;
      }

      const status = this.workflowManager.getWorkflowStatus(workflowId);

      if (!status) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found'
        });
        return;
      }

      res.json({
        success: true,
        data: status
      });

    } catch (error: any) {
      console.error('❌ Get workflow status error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get workflow status',
        message: error.message
      });
    }
  }

  private async cancelWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;
      const { userId } = req.body;

      if (!workflowId || !userId) {
        res.status(400).json({
          success: false,
          error: 'Workflow ID and User ID are required'
        });
        return;
      }

      const success = await this.workflowManager.cancelWorkflow(workflowId, userId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found or cannot be cancelled'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Workflow cancelled successfully'
      });

      console.log(`🛑 Workflow API: Cancelled ${workflowId} by user ${userId}`);

    } catch (error: any) {
      console.error('❌ Cancel workflow error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to cancel workflow',
        message: error.message
      });
    }
  }

  private async retryWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;

      if (!workflowId) {
        res.status(400).json({
          success: false,
          error: 'Workflow ID is required'
        });
        return;
      }

      const newWorkflowId = await this.workflowManager.retryWorkflow(workflowId);

      if (!newWorkflowId) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found or cannot be retried'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          originalWorkflowId: workflowId,
          newWorkflowId,
          message: 'Workflow retry started successfully'
        }
      });

      console.log(`🔄 Workflow API: Retried ${workflowId} → ${newWorkflowId}`);

    } catch (error: any) {
      console.error('❌ Retry workflow error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to retry workflow',
        message: error.message
      });
    }
  }

  private async getUserWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 20;
      const statusFilter = req.query.status as string;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      let workflows = this.workflowManager.getUserWorkflows(userId);

      // Apply status filter
      if (statusFilter) {
        workflows = workflows.filter((w: any) => w.status === statusFilter);
      }

      // Apply limit
      workflows = workflows.slice(0, limit);

      res.json({
        success: true,
        data: {
          workflows,
          total: workflows.length,
          userId,
          filter: statusFilter || 'all'
        }
      });

    } catch (error: any) {
      console.error('❌ Get user workflows error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get user workflows',
        message: error.message
      });
    }
  }

  private async getQueueStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = this.workflowManager.getQueueStats();

      res.json({
        success: true,
        data: {
          ...stats,
          timestamp: Date.now(),
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version
          }
        }
      });

    } catch (error: any) {
      console.error('❌ Get queue stats error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to get queue statistics',
        message: error.message
      });
    }
  }

  private async startBatchWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const { workflows, userId, batchId } = req.body;
      
      if (!workflows || !Array.isArray(workflows) || workflows.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Workflows array is required'
        });
        return;
      }
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const results = [];

      for (const workflowData of workflows) {
        try {
          const fullWorkflowData: K2WWorkflowData = {
            ...workflowData,
            userId,
            batchId: batchId || `batch_${Date.now()}`
          };

          const result = await this.workflowManager.startWorkflow(fullWorkflowData);
          results.push({
            success: true,
            workflowId: result.workflowId,
            keywords: workflowData.keywords
          });

        } catch (error: any) {
          results.push({
            success: false,
            error: error.message,
            keywords: workflowData.keywords
          });
        }
      }

      const successCount = results.filter(r => r.success).length;

      res.status(201).json({
        success: true,
        data: {
          batchId: batchId || `batch_${Date.now()}`,
          totalWorkflows: workflows.length,
          successfulWorkflows: successCount,
          failedWorkflows: workflows.length - successCount,
          results,
          message: `Started ${successCount}/${workflows.length} workflows successfully`
        }
      });

      console.log(`📦 Batch API: Started ${successCount}/${workflows.length} workflows for user ${userId}`);

    } catch (error: any) {
      console.error('❌ Batch workflows error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to start batch workflows',
        message: error.message
      });
    }
  }
}

export default K2WWorkflowController;