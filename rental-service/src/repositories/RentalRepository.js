import RentalRequest from '../models/RentalRequest.js';

export class RentalRepository {
  async create(rentalData) {
    const rental = new RentalRequest(rentalData);
    return await rental.save();
  }

  async findById(id) {
    return await RentalRequest.findById(id);
  }

  async update(id, updateData) {
    return await RentalRequest.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findByRenterId(renterId) {
    return await RentalRequest.find({ renter_id: renterId }).sort({ created_at: -1 });
  }

  async findByOwnerId(ownerId) {
    return await RentalRequest.find({ owner_id: ownerId }).sort({ created_at: -1 });
  }

  async findByVehicleId(vehicleId) {
    return await RentalRequest.find({ vehicle_id: vehicleId });
  }

  async findByStatus(status) {
    return await RentalRequest.find({ status });
  }

  async findAll(filters = {}, options = {}) {
    const limit = Number.parseInt(options.limit, 10) || 0;
    const query = RentalRequest.find(filters).sort({ created_at: -1 });
    if (limit > 0) {
      query.limit(Math.min(limit, 500));
    }
    return await query;
  }
}
