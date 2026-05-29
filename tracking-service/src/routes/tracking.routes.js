import express from 'express';
import {
  createLocationUpdate,
  getCurrentLocation,
  getLocationHistory
} from '../controllers/tracking.controller.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { validateLocationUpdate } from '../middlewares/validate.middleware.js';

const router = express.Router();

router.post('/location', validateLocationUpdate, asyncHandler(createLocationUpdate));
router.get('/location/:vehicle_id', asyncHandler(getCurrentLocation));
router.get('/history/:vehicle_id', asyncHandler(getLocationHistory));

export default router;
