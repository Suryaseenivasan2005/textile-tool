import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getInventory,
  adjustInventory,
} from '../controllers/inventoryController';

const router = Router();

router.get('/', authenticate, getInventory);
router.post('/adjust', authenticate, adjustInventory);

export default router;

