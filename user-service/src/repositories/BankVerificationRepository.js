import BankVerification from '../models/BankVerification.js';

export class BankVerificationRepository {
  async create(verificationData) {
    const verification = new BankVerification(verificationData);
    return await verification.save();
  }

  async findById(id) {
    return await BankVerification.findById(id).populate('user_id');
  }

  async findByUserId(userId) {
    return await BankVerification.findOne({ user_id: userId, is_default: true }).sort({ created_at: -1 });
  }

  async findAllByUserId(userId) {
    return await BankVerification.find({ user_id: userId }).sort({ created_at: -1 });
  }

  async findByAccountNumber(accountNumber) {
    return await BankVerification.findOne({ bank_account_number: accountNumber });
  }

  async update(id, updateData) {
    return await BankVerification.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    ).populate('user_id');
  }

  async findByStatus(status) {
    return await BankVerification.find({ verification_status: status });
  }

  async setDefault(userId, verificationId) {
    // Remove default from all other bank verifications for this user
    await BankVerification.updateMany(
      { user_id: userId, _id: { $ne: verificationId } },
      { is_default: false }
    );
    
    // Set this one as default
    return await BankVerification.findByIdAndUpdate(
      verificationId,
      { is_default: true, updated_at: new Date() },
      { new: true }
    );
  }

  async delete(id) {
    return await BankVerification.findByIdAndDelete(id);
  }
}
