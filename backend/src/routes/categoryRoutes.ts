import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';

const router = Router();

router.get('/', authenticate, getCategories);
router.get('/:id', authenticate, getCategory);
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

export default router;

