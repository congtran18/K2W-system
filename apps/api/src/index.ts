import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import { k2wRouter } from './routes/k2w.router';
import { supabase } from '@k2w/database';
import { contentService } from './services/content.service';

// Middleware imports
import { errorHandler } from './middleware/error-handler.middleware';
import { requestLogger } from './middleware/request-logger.middleware';
import { rateLimiter } from './middleware/rate-limiter.middleware';

const app: Express = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', async (req: express.Request, res: express.Response) => {
  let dbStatus = 'connected';
  try {
    // Perform a fast, low-overhead query to keep Supabase awake
    const { error } = await supabase.from('keywords').select('id').limit(1);
    if (error) {
      dbStatus = `error: ${error.message}`;
    }
  } catch (err: any) {
    dbStatus = `failed: ${err.message || err}`;
  }

  res.status(200).json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    service: 'k2w-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API routes - All K2W functionality now unified under /api/k2w
app.use('/api/k2w', k2wRouter);

// Catch-all for unmatched routes
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 K2W API Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 K2W Workflow API: http://localhost:${PORT}/api/k2w/health`);
  console.log(`📖 Available endpoints:`);
  console.log(`   POST /api/k2w/keywords/import - Import keywords`);
  console.log(`   POST /api/k2w/content/generate - Generate content`);
  console.log(`   GET  /api/k2w/analytics/:project_id/dashboard - Analytics`);
  
  // Start background worker to process queued keywords
  startBackgroundWorker();
});

// Background queue worker to process queued/pending keywords
const activeProcessingKeywords = new Set<string>();

function logToWorkspace(message: string) {
  try {
    const logPath = path.join(__dirname, '../../scratch/queue-worker.log');
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`, 'utf8');
  } catch (e) {
    console.error('Failed to log to workspace:', e);
  }
}

async function processPendingKeywords() {
  logToWorkspace('Polling database for pending/queued keywords...');
  try {
    const { data: keywords, error } = await supabase
      .from('keywords')
      .select('*')
      .in('status', ['pending', 'queued'])
      .limit(3);

    if (error) {
      logToWorkspace(`Error fetching pending keywords: ${JSON.stringify(error)}`);
      return;
    }

    if (!keywords || keywords.length === 0) {
      logToWorkspace('No pending or queued keywords found.');
      return;
    }

    logToWorkspace(`Found ${keywords.length} pending keywords.`);

    for (const keyword of keywords) {
      if (activeProcessingKeywords.has(keyword.id)) {
        logToWorkspace(`Keyword "${keyword.keyword}" (${keyword.id}) is already active.`);
        continue;
      }

      activeProcessingKeywords.add(keyword.id);
      logToWorkspace(`Processing keyword: "${keyword.keyword}" (${keyword.id})`);

      // Run async to not block the polling cycle
      (async () => {
        try {
          const options = {
            contentType: 'article' as const,
            wordCount: 1200,
            language: keyword.language || 'en',
            tone: 'professional' as const,
            includeImages: true,
            includeSchema: true,
            autoPublish: false
          };

          await contentService.generateContent(keyword.id, options);
          logToWorkspace(`Successfully processed keyword: "${keyword.keyword}"`);
        } catch (genError) {
          const errorMsg = genError instanceof Error 
            ? genError.stack || genError.message 
            : typeof genError === 'object' && genError !== null 
              ? JSON.stringify(genError) 
              : String(genError);
          logToWorkspace(`Failed to process keyword "${keyword.keyword}": ${errorMsg}`);
        } finally {
          activeProcessingKeywords.delete(keyword.id);
        }
      })();
    }
  } catch (err) {
    logToWorkspace(`Unexpected error in background loop: ${err instanceof Error ? err.message : err}`);
  }
}

function startBackgroundWorker() {
  logToWorkspace('Background worker started. Polling every 5 seconds.');
  setInterval(processPendingKeywords, 5000);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;