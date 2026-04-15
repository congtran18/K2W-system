import { Router } from 'express';
import { 
  optimizedHealthCheck, 
  cacheManagement, 
  performanceInsights 
} from '../middleware/phase1-integration.middleware';

const router: Router = Router();

router.get('/health', optimizedHealthCheck);
router.get('/insights', performanceInsights);
router.get('/cache/stats', cacheManagement.getStats);
router.post('/cache/clear', cacheManagement.clearAll);
router.post('/cache/warmup', cacheManagement.warmup);

export default router;
