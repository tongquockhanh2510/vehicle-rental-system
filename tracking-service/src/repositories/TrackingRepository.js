import { Location, MovementHistory } from '../models/Tracking.js';

export class TrackingRepository {
  async saveLocation(locationData) {
    const location = new Location(locationData);
    return await location.save();
  }

  async getLatestLocation(vehicleId) {
    return await Location.findOne({ vehicle_id: vehicleId }).sort({ created_at: -1 });
  }

  async getLocationHistory(vehicleId, startDate, endDate) {
    return await Location.find({
      vehicle_id: vehicleId,
      created_at: { $gte: startDate, $lte: endDate }
    }).sort({ created_at: -1 });
  }

  async saveMovementHistory(movementData) {
    const movement = new MovementHistory(movementData);
    return await movement.save();
  }

  async getMovementHistory(vehicleId, startDate, endDate) {
    return await MovementHistory.find({
      vehicle_id: vehicleId,
      start_time: { $gte: startDate, $lte: endDate }
    }).sort({ start_time: -1 });
  }
}
