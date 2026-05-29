import { AppError } from './error.middleware.js';

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export const validateLocationUpdate = (req, res, next) => {
  const requiredFields = [
    'vehicle_id',
    'rental_id',
    'contract_id',
    'owner_id',
    'renter_id',
    'latitude',
    'longitude'
  ];

  const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');

  if (missingFields.length) {
    return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
  }

  if (!isNumber(req.body.latitude) || !isNumber(req.body.longitude)) {
    return next(new AppError('latitude and longitude must be valid numbers', 400));
  }

  if (req.body.latitude < -90 || req.body.latitude > 90) {
    return next(new AppError('latitude must be between -90 and 90', 400));
  }

  if (req.body.longitude < -180 || req.body.longitude > 180) {
    return next(new AppError('longitude must be between -180 and 180', 400));
  }

  next();
};

export const validateAlertStatus = (req, res, next) => {
  const allowedStatuses = ['NEW', 'SEEN', 'RESOLVED'];

  if (!allowedStatuses.includes(req.body.status)) {
    return next(new AppError('status must be one of NEW, SEEN, RESOLVED', 400));
  }

  next();
};
