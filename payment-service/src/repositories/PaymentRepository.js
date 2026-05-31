import Payment from '../models/Payment.js';

export class PaymentRepository {
  async create(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async findById(id) {
    return await Payment.findById(id);
  }

  async update(id, updateData) {
    return await Payment.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    );
  }

  async findByContractId(contractId) {
    return await Payment.find({ contract_id: contractId }).sort({ created_at: -1 });
  }

  async findByRenterId(renterId) {
    return await Payment.find({ renter_id: renterId }).sort({ created_at: -1 });
  }

  async findByOwnerId(ownerId) {
    return await Payment.find({ owner_id: ownerId }).sort({ created_at: -1 });
  }

  async findByStatus(status) {
    return await Payment.find({ status }).sort({ created_at: -1 });
  }

  async findAll(filters = {}, options = {}) {
    const limit = Number.parseInt(options.limit, 10) || 0;
    const query = Payment.find(filters).sort({ created_at: -1 });
    if (limit > 0) {
      query.limit(Math.min(limit, 500));
    }
    return await query;
  }
}
