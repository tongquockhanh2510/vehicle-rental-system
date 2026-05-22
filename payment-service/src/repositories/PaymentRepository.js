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
    return await Payment.find({ contract_id: contractId });
  }

  async findByRenterId(renterId) {
    return await Payment.find({ renter_id: renterId });
  }

  async findByOwnerId(ownerId) {
    return await Payment.find({ owner_id: ownerId });
  }

  async findByStatus(status) {
    return await Payment.find({ status });
  }
}
