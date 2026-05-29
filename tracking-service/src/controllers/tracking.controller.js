import {
  getCurrentVehicleLocation,
  getVehicleLocationHistory,
  updateVehicleLocation
} from '../services/tracking.service.js';
import { successResponse } from '../utils/response.js';

export const createLocationUpdate = async (req, res) => {
  const result = await updateVehicleLocation(req.body);
  successResponse(res, result, 'Vehicle location updated', 201);
};

export const getCurrentLocation = async (req, res) => {
  const location = await getCurrentVehicleLocation(req.params.vehicle_id);
  successResponse(res, location, 'Current vehicle location');
};

export const getLocationHistory = async (req, res) => {
  const history = await getVehicleLocationHistory(req.params.vehicle_id, req.query);
  successResponse(res, history, 'Vehicle location history');
};
