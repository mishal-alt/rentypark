import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getRevenueSummary } from '../controllers/revenueController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/summary', asyncHandler(getRevenueSummary));

export default router;
