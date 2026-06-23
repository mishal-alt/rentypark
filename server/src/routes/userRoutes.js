import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listUsers, createOperator } from '../controllers/userController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(listUsers));
router.post('/', requireRole('admin'), asyncHandler(createOperator));

export default router;
