import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createRazorpayOrder, razorpayWebhook } from '../controllers/paymentController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/webhook', asyncHandler(razorpayWebhook));
router.use(requireAuth);
router.post('/sessions/:id/razorpay-order', asyncHandler(createRazorpayOrder));

export default router;
