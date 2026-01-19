import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getSales,
  getSale,
  createSale,
  updateSale,
} from '../controllers/saleController';

const router = Router();

router.get('/', authenticate, getSales);
router.get('/:id', authenticate, getSale);
router.post('/', authenticate, createSale);
router.put('/:id', authenticate, updateSale);

export default router;

