import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getColors,
  getColor,
  createColor,
  updateColor,
  deleteColor,
} from '../controllers/colorController';

const router = Router();

router.get('/', authenticate, getColors);
router.get('/:id', authenticate, getColor);
router.post('/', authenticate, createColor);
router.put('/:id', authenticate, updateColor);
router.delete('/:id', authenticate, deleteColor);

export default router;

