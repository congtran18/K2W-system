import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import BullMQService from './services/bullmq.service';
import SocketService from './services/socket.service';

const app: Application = express();
const server = createServer(app);

// Initialize services
const workflowQueue = new BullMQService();
const socketService = new SocketService(server);

app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      queue: workflowQueue.isReady(),
      socket: socketService.getConnectedUsersCount()
    }
  });
});

// Workflow APIs
app.post('/api/workflows', async (req: Request, res: Response) => {
  try {
    const { keywords, userId, targetLanguage, siteConfig, options } = req.body;
    
    if (!keywords || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: keywords, userId' 
      });
    }

    const jobId = await workflowQueue.addWorkflow({
      keywords,
      userId,
      targetLanguage: targetLanguage || 'en',
      siteConfig,
      options
    });

    // Simulate user joining for real-time updates
    socketService.simulateUserJoin(userId);

    return res.json({ 
      success: true, 
      jobId,
      message: 'Workflow started successfully'
    });
  } catch (error: any) {
    console.error('Workflow creation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to start workflow'
    });
  }
});

app.get('/api/workflows/:jobId', async (req: Request, res: Response) => {
  try {
    const status = await workflowQueue.getJobStatus(req.params.jobId);
    res.json({ success: true, status });
  } catch (error: any) {
    console.error('Job status error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get job status'
    });
  }
});

app.get('/api/workflows/:jobId/progress', async (req: Request, res: Response) => {
  try {
    const job = await workflowQueue.getJobStatus(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const progress = {
      jobId: req.params.jobId,
      status: job.status,
      progress: job.progress,
      updatedAt: job.updatedAt
    };
    
    return res.json({ success: true, progress });
  } catch (error: any) {
    console.error('Job progress error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to get job progress'
    });
  }
});

app.delete('/api/workflows/:jobId', async (req: Request, res: Response) => {
  try {
    const removed = await workflowQueue.removeJob(req.params.jobId);
    
    if (removed) {
      res.json({ 
        success: true, 
        message: 'Job cancelled successfully'
      });
    } else {
      res.status(400).json({
        error: 'Job cannot be cancelled (not waiting or already completed)'
      });
    }
  } catch (error: any) {
    console.error('Job cancellation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to cancel job'
    });
  }
});

// Stats endpoint
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const queueStats = await workflowQueue.getQueueStats();
    const socketStats = {
      connectedUsers: socketService.getConnectedUsersCount(),
      totalJobs: workflowQueue.getJobCount()
    };
    
    res.json({ 
      success: true, 
      stats: { ...queueStats, ...socketStats }
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get stats'
    });
  }
});

// Connect workflow events to socket service
workflowQueue.on('workflow:completed', (data) => {
  console.log(`Workflow completed for user ${data.userId}:`, data.jobId);
  socketService.sendWorkflowCompleted(data.userId, data.jobId, data.result);
});

workflowQueue.on('stage:updated', (data) => {
  console.log(`Stage updated for user ${data.userId}:`, data.stage);
  socketService.sendWorkflowProgress(data.userId, data.jobId, {
    stage: data.stage,
    status: 'active',
    progress: data.progress,
    message: data.message,
    totalProgress: data.progress
  });
});

workflowQueue.on('workflow:failed', (data) => {
  console.log(`Workflow failed for user ${data.userId}:`, data.error);
  socketService.sendWorkflowFailed(data.userId, data.jobId, {
    stage: 'unknown',
    message: data.error,
    canRetry: true
  });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Starting graceful shutdown...');
  
  // Close services
  await Promise.all([
    workflowQueue.close(),
    socketService.close()
  ]);
  
  // Close HTTP server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 K2W API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Queue: ${workflowQueue.isReady() ? 'Ready' : 'Not Ready'}`);
  console.log(`🔌 Socket: ${socketService.getConnectedUsersCount()} users connected`);
});

export default app;