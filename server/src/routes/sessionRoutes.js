import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  checkIn,
  listActiveSessions,
  quoteCheckout,
  checkOut,
  listHistory,
} from '../controllers/sessionController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.post('/check-in', asyncHandler(checkIn));
router.get('/active', asyncHandler(listActiveSessions));
router.get('/history', asyncHandler(listHistory));
router.get('/:id/quote', asyncHandler(quoteCheckout));
router.post('/:id/check-out', asyncHandler(checkOut));

export default router;
