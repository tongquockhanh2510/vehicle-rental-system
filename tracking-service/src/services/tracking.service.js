import VehicleLocation from '../models/vehicleLocation.model.js';
import VehicleLocationHistory from '../models/vehicleLocationHistory.model.js';
import { AppError } from '../middlewares/error.middleware.js';
import { checkBoundary } from './boundary.service.js';
import { cacheVehicleLocation, getCachedVehicleLocation } from './cache.service.js';
import { createBoundaryAlert, ALERT_MESSAGE } from './alert.service.js';
import { publishVehicleOutOfBoundary } from './eventPublisher.service.js';

const toPlainObject = (document) => document.toObject({ getters: false, virtuals: false });

export const updateVehicleLocation = async (payload) => {
  const now = new Date();
  const allowed_area = payload.allowed_area || {};
  const is_out_of_boundary = checkBoundary({
    latitude: payload.latitude,
    longitude: payload.longitude,
    allowed_area
  });

  const locationPayload = {
    vehicle_id: payload.vehicle_id,
    rental_id: payload.rental_id,
    contract_id: payload.contract_id,
    owner_id: payload.owner_id,
    renter_id: payload.renter_id,
    latitude: payload.latitude,
    longitude: payload.longitude,
    speed: payload.speed ?? 0,
    heading: payload.heading ?? null,
    address: payload.address || '',
    is_out_of_boundary
  };

  const latestLocation = await VehicleLocation.findOneAndUpdate(
    { vehicle_id: payload.vehicle_id },
    {
      $set: {
        ...locationPayload,
        last_updated_at: now
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  await VehicleLocationHistory.create({
    ...locationPayload,
    recorded_at: now
  });

  let boundaryAlert = null;

  if (is_out_of_boundary) {
    boundaryAlert = await createBoundaryAlert(locationPayload, allowed_area);

    await publishVehicleOutOfBoundary({
      vehicle_id: payload.vehicle_id,
      rental_id: payload.rental_id,
      contract_id: payload.contract_id,
      owner_id: payload.owner_id,
      renter_id: payload.renter_id,
      latitude: payload.latitude,
      longitude: payload.longitude,
      message: ALERT_MESSAGE,
      created_at: boundaryAlert.created_at.toISOString()
    });
  }

  const plainLatestLocation = toPlainObject(latestLocation);
  await cacheVehicleLocation(payload.vehicle_id, plainLatestLocation);

  return {
    location: plainLatestLocation,
    is_out_of_boundary,
    alert: boundaryAlert ? toPlainObject(boundaryAlert) : null
  };
};

export const getCurrentVehicleLocation = async (vehicleId) => {
  const cachedLocation = await getCachedVehicleLocation(vehicleId);

  if (cachedLocation) {
    return cachedLocation;
  }

  const location = await VehicleLocation.findOne({ vehicle_id: vehicleId }).lean();

  if (!location) {
    throw new AppError('Vehicle location not found', 404);
  }

  await cacheVehicleLocation(vehicleId, location);
  return location;
};

export const getVehicleLocationHistory = async (vehicleId, filters = {}) => {
  const query = {
    vehicle_id: vehicleId
  };

  if (filters.rental_id) {
    query.rental_id = filters.rental_id;
  }

  if (filters.contract_id) {
    query.contract_id = filters.contract_id;
  }

  if (filters.from || filters.to) {
    query.recorded_at = {};

    if (filters.from) {
      query.recorded_at.$gte = new Date(filters.from);
    }

    if (filters.to) {
      query.recorded_at.$lte = new Date(filters.to);
    }
  }

  const limit = Math.min(Number(filters.limit) || 100, 500);

  return VehicleLocationHistory.find(query)
    .sort({ recorded_at: -1 })
    .limit(limit)
    .lean();
};
