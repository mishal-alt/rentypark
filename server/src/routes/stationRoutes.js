import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getStation, updateStationProfile, updateVehicleTypes, getOccupancy } from '../controllers/stationController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(getStation));
router.put('/', requireRole('admin'), asyncHandler(updateStationProfile));
router.put('/vehicle-types', requireRole('admin'), asyncHandler(updateVehicleTypes));
router.get('/occupancy', asyncHandler(getOccupancy));

export default router;
