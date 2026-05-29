import {
  getBoundaryAlerts,
  updateBoundaryAlertStatus
} from '../services/alert.service.js';
import { successResponse } from '../utils/response.js';

export const listAlerts = async (req, res) => {
  const alerts = await getBoundaryAlerts(req.query);
  successResponse(res, alerts, 'Boundary alerts');
};

export const updateAlertStatus = async (req, res) => {
  const alert = await updateBoundaryAlertStatus(req.params.alert_id, req.body.status);
  successResponse(res, alert, 'Boundary alert status updated');
};
