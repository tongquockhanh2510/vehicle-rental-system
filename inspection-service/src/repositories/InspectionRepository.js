import Inspection from '../models/Inspection.js';

export class InspectionRepository {
  async create(inspectionData) {
    const inspection = new Inspection(inspectionData);
    return await inspection.save();
  }

  async findById(id) {
    return await Inspection.findById(id);
  }

  async update(id, updateData) {
    return await Inspection.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findByRentalRequestId(rentalRequestId) {
    return await Inspection.find({ rental_request_id: rentalRequestId });
  }

  async findByRenterId(renterId) {
    return await Inspection.find({ renter_id: renterId });
  }

  async findByVehicleId(vehicleId) {
    return await Inspection.find({ vehicle_id: vehicleId });
  }
}
