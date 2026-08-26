import { Router } from 'express';
import { startDemo, resetDemo, getDemoStatus } from '../controllers/demoController';
import { demoMiddleware } from '../middleware/demoMiddleware';

const router = Router();

// Demo routes are public (to start/reset) but they use demoMiddleware
router.post('/start', startDemo);
router.post('/reset', resetDemo);
router.get('/status', getDemoStatus);

export default router;
