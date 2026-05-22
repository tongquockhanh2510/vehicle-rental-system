import { TrackingRepository } from '../repositories/TrackingRepository.js';
import { EventBus } from '../events/EventBus.js';

const trackingRepository = new TrackingRepository();
const eventBus = new EventBus();

export class TrackingService {
  async updateLocation(vehicleId, rentalRequestId, latitude, longitude, address, allowedRegions) {
    const location = await trackingRepository.saveLocation({
      vehicle_id: vehicleId,
      rental_request_id: rentalRequestId,
      latitude,
      longitude,
      address
    });

    // Check if vehicle is within allowed area
    const isWithinAllowedArea = this.checkIfWithinAllowedArea(latitude, longitude, allowedRegions);
    
    if (!isWithinAllowedArea && !location.alert_sent) {
      // Publish alert event
      await eventBus.publish('vehicle_out_of_bounds', {
        vehicleId,
        rentalRequestId,
        latitude,
        longitude,
        address
      });

      await trackingRepository.saveLocation({
        ...location.toObject(),
        is_within_allowed_area: false,
        alert_sent: true
      });
    }

    return location;
  }

  checkIfWithinAllowedArea(latitude, longitude, allowedRegions) {
    // Simplified check - in production, use actual geofencing
    // This would integrate with a geofencing service
    return true;
  }

  async getLatestLocation(vehicleId) {
    return await trackingRepository.getLatestLocation(vehicleId);
  }

  async getLocationHistory(vehicleId, startDate, endDate) {
    return await trackingRepository.getLocationHistory(vehicleId, startDate, endDate);
  }

  async recordMovement(vehicleId, rentalRequestId, startLocation, endLocation, distanceKm, durationMinutes) {
    return await trackingRepository.saveMovementHistory({
      vehicle_id: vehicleId,
      rental_request_id: rentalRequestId,
      start_location: startLocation,
      end_location: endLocation,
      distance_km: distanceKm,
      duration_minutes: durationMinutes,
      start_time: new Date(Date.now() - durationMinutes * 60000),
      end_time: new Date()
    });
  }

  async getMovementHistory(vehicleId, startDate, endDate) {
    return await trackingRepository.getMovementHistory(vehicleId, startDate, endDate);
  }
}

export default new TrackingService();
