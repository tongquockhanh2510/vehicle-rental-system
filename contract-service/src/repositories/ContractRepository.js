import Contract from '../models/Contract.js';

export class ContractRepository {
  async create(contractData) {
    const contract = new Contract(contractData);
    return await contract.save();
  }

  async findById(id) {
    return await Contract.findById(id);
  }

  async update(id, updateData) {
    return await Contract.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findByRenterId(renterId) {
    return await Contract.find({ renter_id: renterId });
  }

  async findByOwnerId(ownerId) {
    return await Contract.find({ owner_id: ownerId });
  }

  async findByStatus(status) {
    return await Contract.find({ status });
  }

  async findByRentalRequestId(rentalRequestId) {
    return await Contract.findOne({ rental_request_id: rentalRequestId });
  }
}
