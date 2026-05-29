import express from 'express';
import {
  listAlerts,
  updateAlertStatus
} from '../controllers/alert.controller.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { validateAlertStatus } from '../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/', asyncHandler(listAlerts));
router.patch('/:alert_id/status', validateAlertStatus, asyncHandler(updateAlertStatus));

export default router;
