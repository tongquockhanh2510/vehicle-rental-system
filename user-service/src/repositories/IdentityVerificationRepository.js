import IdentityVerification from '../models/IdentityVerification.js';

export class IdentityVerificationRepository {
  async create(verificationData) {
    const verification = new IdentityVerification(verificationData);
    return await verification.save();
  }

  async findById(id) {
    return await IdentityVerification.findById(id).populate('user_id');
  }

  async findByUserId(userId) {
    return await IdentityVerification.findOne({ user_id: userId }).sort({ created_at: -1 });
  }

  async findAllByUserId(userId) {
    return await IdentityVerification.find({ user_id: userId }).sort({ created_at: -1 });
  }

  async findByIdNumber(idNumber) {
    return await IdentityVerification.findOne({ id_number: idNumber });
  }

  async update(id, updateData) {
    return await IdentityVerification.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    ).populate('user_id');
  }

  async findByStatus(status) {
    return await IdentityVerification.find({ verification_status: status });
  }

  async delete(id) {
    return await IdentityVerification.findByIdAndDelete(id);
  }
}
