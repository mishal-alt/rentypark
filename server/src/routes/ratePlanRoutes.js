import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listRatePlans, createRatePlan, updateRatePlan, deleteRatePlan } from '../controllers/ratePlanController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(listRatePlans));
router.post('/', requireRole('admin'), asyncHandler(createRatePlan));
router.put('/:id', requireRole('admin'), asyncHandler(updateRatePlan));
router.delete('/:id', requireRole('admin'), asyncHandler(deleteRatePlan));

export default router;
