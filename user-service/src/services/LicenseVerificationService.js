import axios from 'axios';
import { LicenseVerificationRepository } from '../repositories/LicenseVerificationRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

const licenseRepository = new LicenseVerificationRepository();
const userRepository = new UserRepository();

export class LicenseVerificationService {
  constructor() {
    this.imageServiceUrl = process.env.IMAGE_SERVICE_URL || 'http://localhost:3007';
  }

  /**
   * Submit license verification
   */
  async submitLicenseVerification(userId, verificationData, frontImageFile, backImageFile) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check for duplicate license number
    const existingLicense = await licenseRepository.findByLicenseNumber(verificationData.license_number);
    if (existingLicense) {
      throw new Error('License number already registered');
    }

    try {
      // Upload front image to image service
      const frontImageFormData = new FormData();
      frontImageFormData.append('file', new Blob([frontImageFile.buffer], { type: frontImageFile.mimetype }), frontImageFile.originalname);
      frontImageFormData.append('service_type', 'USER_VERIFICATION');
      frontImageFormData.append('reference_id', userId);

      const frontImageResponse = await axios.post(
        `${this.imageServiceUrl}/api/images/upload`,
        frontImageFormData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
            ...frontImageFormData.getHeaders?.()
          }
        }
      );

      const frontImagePath = frontImageResponse.data.data.s3_url;

      // Upload back image if provided
      let backImagePath = null;
      if (backImageFile) {
        const backImageFormData = new FormData();
        backImageFormData.append('file', new Blob([backImageFile.buffer], { type: backImageFile.mimetype }), backImageFile.originalname);
        backImageFormData.append('service_type', 'USER_VERIFICATION');
        backImageFormData.append('reference_id', userId);

        const backImageResponse = await axios.post(
          `${this.imageServiceUrl}/api/images/upload`,
          backImageFormData,
          {
            headers: {
              'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
              ...backImageFormData.getHeaders?.()
            }
          }
        );

        backImagePath = backImageResponse.data.data.s3_url;
      }

      // Create verification record
      const verificationRecord = await licenseRepository.create({
        user_id: userId,
        license_number: verificationData.license_number,
        license_type: verificationData.license_type,
        license_image_front: frontImagePath,
        license_image_back: backImagePath,
        full_name: verificationData.full_name,
        date_of_birth: verificationData.date_of_birth,
        issued_date: verificationData.issued_date,
        expiry_date: verificationData.expiry_date,
        issued_country: verificationData.issued_country,
        driving_class: verificationData.driving_class,
        restrictions: verificationData.restrictions
      });

      return this._formatResponse(verificationRecord);
    } catch (error) {
      throw new Error(`Failed to submit license verification: ${error.message}`);
    }
  }

  /**
   * Get license verification info
   */
  async getLicenseVerification(userId) {
    const verification = await licenseRepository.findByUserId(userId);
    if (!verification) {
      throw new Error('License verification not found');
    }
    return this._formatResponse(verification);
  }

  /**
   * Update license verification status
   */
  async updateVerificationStatus(verificationId, status, rejectionReason = null, verifiedBy = null) {
    const updateData = {
      verification_status: status,
      verified_at: new Date(),
      verified_by: verifiedBy
    };

    if (rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const verification = await licenseRepository.update(verificationId, updateData);

    // Update user license info if approved
    if (status === 'APPROVED' && verification.user_id) {
      await userRepository.update(verification.user_id._id, {
        license_number: verification.license_number,
        license_image: verification.license_image_front,
        license_expiry_date: verification.expiry_date
      });
    }

    return this._formatResponse(verification);
  }

  /**
   * Get all verifications with specific status
   */
  async getVerificationsByStatus(status) {
    const verifications = await licenseRepository.findByStatus(status);
    return verifications.map(v => this._formatResponse(v));
  }

  /**
   * Check if license is expired
   */
  isLicenseExpired(expiryDate) {
    return new Date(expiryDate) < new Date();
  }

  _formatResponse(verification) {
    return {
      verification_id: verification._id,
      user_id: verification.user_id?._id || verification.user_id,
      license_number: verification.license_number,
      license_type: verification.license_type,
      license_image_front: verification.license_image_front,
      license_image_back: verification.license_image_back,
      full_name: verification.full_name,
      date_of_birth: verification.date_of_birth,
      issued_date: verification.issued_date,
      expiry_date: verification.expiry_date,
      issued_country: verification.issued_country,
      driving_class: verification.driving_class,
      restrictions: verification.restrictions,
      is_expired: this.isLicenseExpired(verification.expiry_date),
      verification_status: verification.verification_status,
      rejection_reason: verification.rejection_reason,
      verified_at: verification.verified_at,
      verified_by: verification.verified_by,
      created_at: verification.created_at,
      updated_at: verification.updated_at
    };
  }
}

export default new LicenseVerificationService();
