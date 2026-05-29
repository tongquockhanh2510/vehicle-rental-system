import { calculateDistanceKm } from '../utils/haversine.js';
import { isPointInsidePolygon } from '../utils/polygon.js';

const VIETNAM_BOUNDING_BOX = {
  min_latitude: 8.18,
  max_latitude: 23.39,
  min_longitude: 102.14,
  max_longitude: 109.46
};

const isInsideVietnamBoundingBox = ({ latitude, longitude }) =>
  latitude >= VIETNAM_BOUNDING_BOX.min_latitude &&
  latitude <= VIETNAM_BOUNDING_BOX.max_latitude &&
  longitude >= VIETNAM_BOUNDING_BOX.min_longitude &&
  longitude <= VIETNAM_BOUNDING_BOX.max_longitude;

export const checkBoundary = ({ latitude, longitude, allowed_area }) => {
  if (!allowed_area || !allowed_area.type) {
    return false;
  }

  const point = { latitude, longitude };

  if (allowed_area.type === 'COUNTRY') {
    if (allowed_area.country_code === 'VN') {
      return !isInsideVietnamBoundingBox(point);
    }

    return false;
  }

  if (allowed_area.type === 'CIRCLE') {
    if (!allowed_area.center || !allowed_area.radius_km) {
      return false;
    }

    const distanceKm = calculateDistanceKm(allowed_area.center, point);
    return distanceKm > allowed_area.radius_km;
  }

  if (allowed_area.type === 'POLYGON') {
    return !isPointInsidePolygon(point, allowed_area.polygon);
  }

  return false;
};
