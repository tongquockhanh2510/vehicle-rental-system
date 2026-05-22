import Dispute from '../models/Dispute.js';

export class DisputeRepository {
  async create(disputeData) {
    const dispute = new Dispute(disputeData);
    return await dispute.save();
  }

  async findById(id) {
    return await Dispute.findById(id);
  }

  async update(id, updateData) {
    return await Dispute.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findByStatus(status) {
    return await Dispute.find({ status });
  }

  async findByOwnerId(ownerId) {
    return await Dispute.find({ owner_id: ownerId });
  }

  async findByRenterId(renterId) {
    return await Dispute.find({ renter_id: renterId });
  }

  async findAll(filters = {}) {
    return await Dispute.find(filters);
  }
}
