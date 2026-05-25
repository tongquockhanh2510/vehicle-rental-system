import axios from 'axios';
import { BankVerificationRepository } from '../repositories/BankVerificationRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';

const bankRepository = new BankVerificationRepository();
const userRepository = new UserRepository();

export class BankVerificationService {
  constructor() {
    this.imageServiceUrl = process.env.IMAGE_SERVICE_URL || 'http://localhost:3007';
  }

  /**
   * Submit bank verification
   */
  async submitBankVerification(userId, verificationData, statementImageFile, idCardImageFile) {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check for duplicate account number
    const existingAccount = await bankRepository.findByAccountNumber(verificationData.bank_account_number);
    if (existingAccount) {
      throw new Error('Bank account already registered');
    }

    try {
      // Upload statement image to image service
      const statementFormData = new FormData();
      statementFormData.append('file', new Blob([statementImageFile.buffer], { type: statementImageFile.mimetype }), statementImageFile.originalname);
      statementFormData.append('service_type', 'USER_VERIFICATION');
      statementFormData.append('reference_id', userId);

      const statementResponse = await axios.post(
        `${this.imageServiceUrl}/api/images/upload`,
        statementFormData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
            ...statementFormData.getHeaders?.()
          }
        }
      );

      const statementImagePath = statementResponse.data.data.s3_url;

      // Upload ID card image if provided
      let idCardImagePath = null;
      if (idCardImageFile) {
        const idFormData = new FormData();
        idFormData.append('file', new Blob([idCardImageFile.buffer], { type: idCardImageFile.mimetype }), idCardImageFile.originalname);
        idFormData.append('service_type', 'USER_VERIFICATION');
        idFormData.append('reference_id', userId);

        const idResponse = await axios.post(
          `${this.imageServiceUrl}/api/images/upload`,
          idFormData,
          {
            headers: {
              'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
              ...idFormData.getHeaders?.()
            }
          }
        );

        idCardImagePath = idResponse.data.data.s3_url;
      }

      // Create verification record
      const verificationRecord = await bankRepository.create({
        user_id: userId,
        bank_account_number: verificationData.bank_account_number,
        bank_name: verificationData.bank_name,
        account_holder_name: verificationData.account_holder_name,
        account_type: verificationData.account_type,
        bank_code: verificationData.bank_code,
        branch_name: verificationData.branch_name,
        bank_statement_image: statementImagePath,
        id_card_image: idCardImagePath,
        verification_method: verificationData.verification_method || 'MANUAL',
        is_default: verificationData.is_default || false
      });

      return this._formatResponse(verificationRecord);
    } catch (error) {
      throw new Error(`Failed to submit bank verification: ${error.message}`);
    }
  }

  /**
   * Get bank verification info
   */
  async getBankVerification(userId) {
    const verification = await bankRepository.findByUserId(userId);
    if (!verification) {
      throw new Error('Bank verification not found');
    }
    return this._formatResponse(verification);
  }

  /**
   * Get all bank verifications for user
   */
  async getAllBankVerifications(userId) {
    const verifications = await bankRepository.findAllByUserId(userId);
    return verifications.map(v => this._formatResponse(v));
  }

  /**
   * Update bank verification status
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

    const verification = await bankRepository.update(verificationId, updateData);

    // Update user bank info if approved
    if (status === 'APPROVED' && verification.user_id) {
      await userRepository.update(verification.user_id._id, {
        bank_account: verification.bank_account_number,
        bank_name: verification.bank_name
      });
    }

    return this._formatResponse(verification);
  }

  /**
   * Set bank account as default
   */
  async setDefaultBankAccount(userId, verificationId) {
    const verification = await bankRepository.findById(verificationId);
    if (!verification || verification.user_id.toString() !== userId.toString()) {
      throw new Error('Bank verification not found or unauthorized');
    }

    const updated = await bankRepository.setDefault(userId, verificationId);
    return this._formatResponse(updated);
  }

  /**
   * Get all verifications with specific status
   */
  async getVerificationsByStatus(status) {
    const verifications = await bankRepository.findByStatus(status);
    return verifications.map(v => this._formatResponse(v));
  }

  _formatResponse(verification) {
    return {
      verification_id: verification._id,
      user_id: verification.user_id?._id || verification.user_id,
      bank_account_number: verification.bank_account_number,
      bank_name: verification.bank_name,
      account_holder_name: verification.account_holder_name,
      account_type: verification.account_type,
      bank_code: verification.bank_code,
      branch_name: verification.branch_name,
      bank_statement_image: verification.bank_statement_image,
      id_card_image: verification.id_card_image,
      verification_method: verification.verification_method,
      is_default: verification.is_default,
      verification_status: verification.verification_status,
      rejection_reason: verification.rejection_reason,
      verified_at: verification.verified_at,
      verified_by: verification.verified_by,
      created_at: verification.created_at,
      updated_at: verification.updated_at
    };
  }
}

export default new BankVerificationService();
