import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../controllers/vendorController';

const router = Router();

router.get('/', authenticate, getVendors);
router.get('/:id', authenticate, getVendor);
router.post('/', authenticate, createVendor);
router.put('/:id', authenticate, updateVendor);
router.delete('/:id', authenticate, deleteVendor);

export default router;

