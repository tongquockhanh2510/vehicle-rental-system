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
    return await RentalRequest.find({ renter_id: renterId });
  }

  async findByOwnerId(ownerId) {
    return await RentalRequest.find({ owner_id: ownerId });
  }

  async findByVehicleId(vehicleId) {
    return await RentalRequest.find({ vehicle_id: vehicleId });
  }

  async findByStatus(status) {
    return await RentalRequest.find({ status });
  }

  async findAll(filters = {}) {
    return await RentalRequest.find(filters);
  }
}
