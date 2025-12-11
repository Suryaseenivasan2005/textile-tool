import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSettings,
  updateSettings,
} from '../controllers/settingsController';

const router = Router();

router.get('/', authenticate, getSettings);
router.put('/', authenticate, updateSettings);

export default router;

