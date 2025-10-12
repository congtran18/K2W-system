/**
 * K2W System Routes
 * Using optimized Controller-Service-Repository pattern
 */

import express, { Router } from 'express';
import { k2wRoutes } from './optimized-k2w';

const router: Router = express.Router();

// Mount optimized K2W routes
router.use('/', k2wRoutes);

export { router as k2wRouter };