import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getReturns,
  getReturn,
  createReturn,
} from '../controllers/returnController';

const router = Router();

router.get('/', authenticate, getReturns);
router.get('/:id', authenticate, getReturn);
router.post('/', authenticate, createReturn);

export default router;

