import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import FormData from 'form-data';
import { UserRepository } from '../repositories/UserRepository.js';
import fs from 'fs';

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

    const privateKey = fs.readFileSync("./private.key", "utf8");

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      privateKey,
      { 
        algorithm: 'RS256',
        expiresIn: process.env.JWT_EXPIRES_IN 
      }
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
    console.log('Getting user profile for userId:', userId);
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

  async verifyPersonalInformation(userId, infoData, files, authHeader) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!infoData.id_number) {
      throw new Error('Missing required field: id_number');
    }

    if (!files || !files.id_image_front || !files.id_image_back) {
      throw new Error('Missing required image files: id_image_front and id_image_back');
    }

    try {
      const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });

        const response = await axios.post(`${process.env.IMAGE_SERVICE_URL}/api/images/upload`, formData, {
          headers: {
            ...formData.getHeaders(),
            'Authorization': authHeader
          }
        });

        return response.data.data.url;
      };

      const frontImageUrl = await uploadImage(files.id_image_front[0]);
      const backImageUrl = await uploadImage(files.id_image_back[0]);

      const updateData = {
        id_number: infoData.id_number,
        id_image_front: frontImageUrl,
        id_image_back: backImageUrl,
        kyc_status: 'APPROVED'
      };

      const updatedUser = await userRepository.update(userId, updateData);

      return {
        success: true,
        message: 'Personal information verified successfully',
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          id_number: updatedUser.id_number,
          kyc_status: updatedUser.kyc_status
        }
      };
    } catch (error) {
      throw new Error(`Failed to verify personal information: ${error.message}`);
    }
  }
}

export default new UserService();