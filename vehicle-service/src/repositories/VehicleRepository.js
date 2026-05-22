import Vehicle from '../models/Vehicle.js';

export class VehicleRepository {
  async create(vehicleData) {
    const vehicle = new Vehicle(vehicleData);
    return await vehicle.save();
  }

  async findById(id) {
    return await Vehicle.findById(id);
  }

  async update(id, updateData) {
    return await Vehicle.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findByOwnerId(ownerId) {
    return await Vehicle.find({ owner_id: ownerId });
  }

  async findAvailable(filters = {}) {
    return await Vehicle.find({ is_available: true, ...filters });
  }

  async findAll(filters = {}) {
    return await Vehicle.find(filters);
  }

  async delete(id) {
    return await Vehicle.findByIdAndDelete(id);
  }
}
