import { Router } from 'express';
import { seedAdminUser, checkSeedStatus } from '../controllers/seedController';

const router = Router();

// Check if database needs seeding (public endpoint for health checks)
router.get('/status', checkSeedStatus);

// Seed admin user (protected in production)
router.post('/admin', seedAdminUser);

export default router;
