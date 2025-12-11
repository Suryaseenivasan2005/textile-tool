import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  updatePurchaseStatus,
} from '../controllers/purchaseController';

const router = Router();

router.get('/', authenticate, getPurchases);
router.get('/:id', authenticate, getPurchase);
router.post('/', authenticate, createPurchase);
router.put('/:id', authenticate, updatePurchase);
router.patch('/:id/status', authenticate, updatePurchaseStatus);

export default router;

