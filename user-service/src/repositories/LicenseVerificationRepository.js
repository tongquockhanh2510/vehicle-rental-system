import LicenseVerification from '../models/LicenseVerification.js';

export class LicenseVerificationRepository {
  async create(verificationData) {
    const verification = new LicenseVerification(verificationData);
    return await verification.save();
  }

  async findById(id) {
    return await LicenseVerification.findById(id).populate('user_id');
  }

  async findByUserId(userId) {
    return await LicenseVerification.findOne({ user_id: userId }).sort({ created_at: -1 });
  }

  async findAllByUserId(userId) {
    return await LicenseVerification.find({ user_id: userId }).sort({ created_at: -1 });
  }

  async findByLicenseNumber(licenseNumber) {
    return await LicenseVerification.findOne({ license_number: licenseNumber });
  }

  async update(id, updateData) {
    return await LicenseVerification.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true }
    ).populate('user_id');
  }

  async findByStatus(status) {
    return await LicenseVerification.find({ verification_status: status });
  }

  async delete(id) {
    return await LicenseVerification.findByIdAndDelete(id);
  }
}
