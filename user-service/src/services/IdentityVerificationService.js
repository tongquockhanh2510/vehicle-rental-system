import axios from 'axios';
import { IdentityVerificationRepository } from '../repositories/IdentityVerificationRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

const identityRepository = new IdentityVerificationRepository();
const userRepository = new UserRepository();

export class IdentityVerificationService {
  constructor() {
    this.imageServiceUrl = process.env.IMAGE_SERVICE_URL || 'http://localhost:3007';
  }

  /**
   * Submit identity verification
   */
  async submitIdentityVerification(userId, verificationData, frontImageFile, backImageFile) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
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
      const verificationRecord = await identityRepository.create({
        user_id: userId,
        id_number: verificationData.id_number,
        id_type: verificationData.id_type,
        id_image_front: frontImagePath,
        id_image_back: backImagePath,
        full_name: verificationData.full_name,
        date_of_birth: verificationData.date_of_birth,
        gender: verificationData.gender,
        nationality: verificationData.nationality,
        address: verificationData.address,
        issued_date: verificationData.issued_date,
        expiry_date: verificationData.expiry_date
      });

      return this._formatResponse(verificationRecord);
    } catch (error) {
      throw new Error(`Failed to submit identity verification: ${error.message}`);
    }
  }

  /**
   * Get identity verification info
   */
  async getIdentityVerification(userId) {
    const verification = await identityRepository.findByUserId(userId);
    if (!verification) {
      throw new Error('Identity verification not found');
    }
    return this._formatResponse(verification);
  }

  /**
   * Update identity verification status
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

    const verification = await identityRepository.update(verificationId, updateData);
    
    // Update user KYC status if approved
    if (status === 'APPROVED' && verification.user_id) {
      await userRepository.update(verification.user_id._id, {
        id_number: verification.id_number,
        id_image_front: verification.id_image_front,
        id_image_back: verification.id_image_back
      });
    }

    return this._formatResponse(verification);
  }

  /**
   * Get all verifications with specific status
   */
  async getVerificationsByStatus(status) {
    const verifications = await identityRepository.findByStatus(status);
    return verifications.map(v => this._formatResponse(v));
  }

  _formatResponse(verification) {
    return {
      verification_id: verification._id,
      user_id: verification.user_id?._id || verification.user_id,
      id_number: verification.id_number,
      id_type: verification.id_type,
      id_image_front: verification.id_image_front,
      id_image_back: verification.id_image_back,
      full_name: verification.full_name,
      date_of_birth: verification.date_of_birth,
      gender: verification.gender,
      nationality: verification.nationality,
      address: verification.address,
      issued_date: verification.issued_date,
      expiry_date: verification.expiry_date,
      verification_status: verification.verification_status,
      rejection_reason: verification.rejection_reason,
      verified_at: verification.verified_at,
      verified_by: verification.verified_by,
      created_at: verification.created_at,
      updated_at: verification.updated_at
    };
  }
}

export default new IdentityVerificationService();
