import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { UserRepository } from '../repositories/UserRepository.js';

const userRepository = new UserRepository();

export class UserService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    return {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      role: user.role
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    };
  }

  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'avatar', 'address',
      'bank_account', 'bank_name', 'id_number', 'license_number'
    ];
    
    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    return await userRepository.update(userId, filteredData);
  }

  async getUsersByRole(role) {
    return await userRepository.findByRole(role);
  }

  async verifyUser(userId) {
    return await userRepository.update(userId, { verified: true });
  }

  async updateKycStatus(userId, status) {
    return await userRepository.update(userId, { kyc_status: status });
  }

  /**
   * Submit identity verification
   * Uploads images to image-service and stores URLs in user document
   */
  async submitIdentityVerification(userId, verificationData, frontImageFile, backImageFile) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    try {
      const imageServiceUrl = process.env.IMAGE_SERVICE_URL || 'http://localhost:3007';

      // Upload front image
      const frontFormData = new FormData();
      frontFormData.append('file', new Blob([frontImageFile.buffer], { type: frontImageFile.mimetype }), frontImageFile.originalname);
      frontFormData.append('service_type', 'USER_VERIFICATION');
      frontFormData.append('reference_id', userId);

      const frontResponse = await axios.post(
        `${imageServiceUrl}/api/images/upload`,
        frontFormData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
            ...frontFormData.getHeaders?.()
          }
        }
      );

      const frontImageUrl = frontResponse.data.data.s3_url;

      // Upload back image if provided
      let backImageUrl = null;
      if (backImageFile) {
        const backFormData = new FormData();
        backFormData.append('file', new Blob([backImageFile.buffer], { type: backImageFile.mimetype }), backImageFile.originalname);
        backFormData.append('service_type', 'USER_VERIFICATION');
        backFormData.append('reference_id', userId);

        const backResponse = await axios.post(
          `${imageServiceUrl}/api/images/upload`,
          backFormData,
          {
            headers: {
              'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
              ...backFormData.getHeaders?.()
            }
          }
        );

        backImageUrl = backResponse.data.data.s3_url;
      }

      // Update user document with identity information
      const updateData = {
        id_number: verificationData.id_number,
        id_image_front: frontImageUrl,
        id_image_back: backImageUrl
      };

      const updatedUser = await userRepository.update(userId, updateData);
      return this._formatUserResponse(updatedUser);
    } catch (error) {
      throw new Error(`Failed to submit identity verification: ${error.message}`);
    }
  }

  async submitLicenseVerification(userId, verificationData, frontImageFile, backImageFile) {
    console.log('Submitting license verification for user:', userId);
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    try {
      const imageServiceUrl = process.env.IMAGE_SERVICE_URL || 'http://localhost:3007';

      // Upload front image
      const frontFormData = new FormData();
      frontFormData.append('file', new Blob([frontImageFile.buffer], { type: frontImageFile.mimetype }), frontImageFile.originalname);
      frontFormData.append('service_type', 'USER_VERIFICATION');
      frontFormData.append('reference_id', userId);

      const frontResponse = await axios.post(
        `${imageServiceUrl}/api/images/upload`,
        frontFormData,
        {
          headers: {
            'Authorization': `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMTQ2YzhjOGE4YjY4OTI1MGM3N2U4ZiIsImVtYWlsIjoiZGFvcGh1Y2toYW5nMDkwQGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzc5NzI5OTQ3LCJleHAiOjE3Nzk4MTYzNDd9.7fxQH4UipeAlqTR_CngyobE_dl3pV3d-VFFOFEJRXNM' || 'service-token'}`,
            ...frontFormData.getHeaders?.()
          }
        }
      );

      const frontImageUrl = frontResponse.data.data.s3_url;

      // Upload back image if provided
      let backImageUrl = null;
      if (backImageFile) {
        const backFormData = new FormData();
        backFormData.append('file', new Blob([backImageFile.buffer], { type: backImageFile.mimetype }), backImageFile.originalname);
        backFormData.append('service_type', 'USER_VERIFICATION');
        backFormData.append('reference_id', userId);

        const backResponse = await axios.post(
          `${imageServiceUrl}/api/images/upload`,
          backFormData,
          {
            headers: {
              'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
              ...backFormData.getHeaders?.()
            }
          }
        );

        backImageUrl = backResponse.data.data.s3_url;
      }

      // Update user document with license information
      const updateData = {
        license_number: verificationData.license_number,
        license_image: frontImageUrl,
        license_expiry_date: verificationData.expiry_date
      };

      const updatedUser = await userRepository.update(user_id, updateData);
      return this._formatUserResponse(updatedUser);
    } catch (error) {
      throw new Error(`Failed to submit license verification: ${error.message}`);
    }
  }

  /**
   * Submit bank verification
   * Uploads images to image-service and stores URLs in user document
   */
  async submitBankVerification(userId, verificationData, statementImageFile, idCardImageFile) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    try {
      const imageServiceUrl = process.env.IMAGE_SERVICE_URL || 'http://localhost:3007';

      // Upload bank statement image
      const statementFormData = new FormData();
      statementFormData.append('file', new Blob([statementImageFile.buffer], { type: statementImageFile.mimetype }), statementImageFile.originalname);
      statementFormData.append('service_type', 'USER_VERIFICATION');
      statementFormData.append('reference_id', userId);

      const statementResponse = await axios.post(
        `${imageServiceUrl}/api/images/upload`,
        statementFormData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
            ...statementFormData.getHeaders?.()
          }
        }
      );

      const statementImageUrl = statementResponse.data.data.s3_url;

      // Upload ID card image if provided
      let idCardImageUrl = null;
      if (idCardImageFile) {
        const idFormData = new FormData();
        idFormData.append('file', new Blob([idCardImageFile.buffer], { type: idCardImageFile.mimetype }), idCardImageFile.originalname);
        idFormData.append('service_type', 'USER_VERIFICATION');
        idFormData.append('reference_id', userId);

        const idResponse = await axios.post(
          `${imageServiceUrl}/api/images/upload`,
          idFormData,
          {
            headers: {
              'Authorization': `Bearer ${process.env.SERVICE_TOKEN || 'service-token'}`,
              ...idFormData.getHeaders?.()
            }
          }
        );

        idCardImageUrl = idResponse.data.data.s3_url;
      }

      // Update user document with bank information
      const updateData = {
        bank_account: verificationData.bank_account_number,
        bank_name: verificationData.bank_name
      };

      const updatedUser = await userRepository.update(userId, updateData);
      return this._formatUserResponse(updatedUser);
    } catch (error) {
      throw new Error(`Failed to submit bank verification: ${error.message}`);
    }
  }

  /**
   * Format user response
   * @private
   */
  _formatUserResponse(user) {
    return {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      id_number: user.id_number,
      id_image_front: user.id_image_front,
      id_image_back: user.id_image_back,
      license_number: user.license_number,
      license_image: user.license_image,
      license_expiry_date: user.license_expiry_date,
      bank_account: user.bank_account,
      bank_name: user.bank_name,
      role: user.role,
      verified: user.verified,
      kyc_status: user.kyc_status,
      created_at: user.created_at
    };
  }
}

export default new UserService();
