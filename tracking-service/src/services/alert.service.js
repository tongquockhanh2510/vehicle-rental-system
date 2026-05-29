import BoundaryAlert from '../models/boundaryAlert.model.js';
import { AppError } from '../middlewares/error.middleware.js';

const ALERT_MESSAGE = 'Vehicle moved outside allowed rental area';

export const createBoundaryAlert = async (locationPayload, allowed_area) => {
  return BoundaryAlert.create({
    vehicle_id: locationPayload.vehicle_id,
    rental_id: locationPayload.rental_id,
    contract_id: locationPayload.contract_id,
    owner_id: locationPayload.owner_id,
    renter_id: locationPayload.renter_id,
    latitude: locationPayload.latitude,
    longitude: locationPayload.longitude,
    allowed_area,
    message: ALERT_MESSAGE,
    status: 'NEW'
  });
};

export const getBoundaryAlerts = async (filters = {}) => {
  const query = {};
  const allowedFilters = ['vehicle_id', 'owner_id', 'renter_id', 'status'];

  for (const filter of allowedFilters) {
    if (filters[filter]) {
      query[filter] = filters[filter];
    }
  }

  return BoundaryAlert.find(query).sort({ created_at: -1 }).lean();
};

export const updateBoundaryAlertStatus = async (alertId, status) => {
  const alert = await BoundaryAlert.findByIdAndUpdate(
    alertId,
    { status },
    { new: true, runValidators: true }
  ).lean();

  if (!alert) {
    throw new AppError('Boundary alert not found', 404);
  }

  return alert;
};

export { ALERT_MESSAGE };
