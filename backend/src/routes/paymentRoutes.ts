import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPayments,
  createPayment,
  getLedger,
} from '../controllers/paymentController';

const router = Router();

router.get('/', authenticate, getPayments);
router.post('/', authenticate, createPayment);
router.get('/ledger/:type/:id', authenticate, getLedger);

export default router;

