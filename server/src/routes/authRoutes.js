import { Router } from 'express';
import { signup, login } from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));

export default router;
