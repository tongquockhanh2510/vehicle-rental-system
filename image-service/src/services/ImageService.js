import s3 from '../config/awsConfig.js';
import { ImageRepository } from '../repositories/ImageRepository.js';
import { v4 as uuidv4 } from 'uuid';

const imageRepository = new ImageRepository();

export class ImageService {
  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME || 'vehicle-rental-images';
  }

  /**
   * Upload image to S3 and save metadata to MongoDB
   * @param {Object} file - Multer file object
   * @param {string} serviceType - Type of service (USER_VERIFICATION, VEHICLE_IMAGE, etc)
   * @param {string} referenceId - ID of the entity this image belongs to
   * @param {string} uploadedBy - User ID who uploaded the image
   * @returns {Object} Image metadata
   */
  async uploadImage(file, serviceType, referenceId, uploadedBy) {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate service type
    const validServiceTypes = ['USER_VERIFICATION', 'VEHICLE_IMAGE', 'CONTRACT', 'OTHER'];
    if (!validServiceTypes.includes(serviceType)) {
      throw new Error(`Invalid service type. Allowed: ${validServiceTypes.join(', ')}`);
    }

    const imageId = uuidv4();
    const fileExtension = file.originalname.split('.').pop();
    const s3Key = `${serviceType}/${referenceId}/${imageId}.${fileExtension}`;

    // Upload to S3
    const s3Params = {
      Bucket: this.bucketName,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    try {
      const uploadResult = await s3.upload(s3Params).promise();

      // Save metadata to MongoDB
      const imageData = {
        image_id: imageId,
        original_filename: file.originalname,
        file_name: `${imageId}.${fileExtension}`,
        file_size: file.size,
        file_type: file.mimetype,
        s3_url: uploadResult.Location,
        s3_bucket: this.bucketName,
        s3_key: s3Key,
        service_type: serviceType,
        reference_id: referenceId,
        uploaded_by: uploadedBy
      };

      const savedImage = await imageRepository.create(imageData);
      return this._formatImageResponse(savedImage);
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Get image information
   * @param {string} imageId - Image ID
   * @returns {Object} Image metadata
   */
  async getImageInfo(imageId) {
    const image = await imageRepository.findById(imageId);
    if (!image) {
      throw new Error('Image not found');
    }
    return this._formatImageResponse(image);
  }

  /**
   * Get images by reference ID
   * @param {string} referenceId - Reference ID
   * @returns {Array} List of images
   */
  async getImagesByReference(referenceId) {
    const images = await imageRepository.findByReferenceId(referenceId);
    return images.map(img => this._formatImageResponse(img));
  }

  /**
   * Delete image from S3 and mark as inactive in MongoDB
   * @param {string} imageId - Image ID
   * @returns {Object} Deleted image metadata
   */
  async deleteImage(imageId) {
    const image = await imageRepository.findById(imageId);
    if (!image) {
      throw new Error('Image not found');
    }

    // Delete from S3
    const s3Params = {
      Bucket: this.bucketName,
      Key: image.s3_key
    };

    try {
      await s3.deleteObject(s3Params).promise();

      // Mark as inactive in MongoDB
      const deletedImage = await imageRepository.delete(imageId);
      return this._formatImageResponse(deletedImage);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Delete images by reference ID
   * @param {string} referenceId - Reference ID
   * @returns {Array} Deleted images
   */
  async deleteImagesByReference(referenceId) {
    const images = await imageRepository.findByReferenceId(referenceId);
    
    const deletedImages = [];
    for (const image of images) {
      try {
        const deleted = await this.deleteImage(image.image_id);
        deletedImages.push(deleted);
      } catch (error) {
        console.error(`Failed to delete image ${image.image_id}:`, error);
      }
    }

    return deletedImages;
  }

  /**
   * Get presigned URL for image
   * @param {string} imageId - Image ID
   * @param {number} expiresIn - Expiration time in seconds
   * @returns {string} Presigned URL
   */
  async getPresignedUrl(imageId, expiresIn = 3600) {
    const image = await imageRepository.findById(imageId);
    if (!image) {
      throw new Error('Image not found');
    }

    const params = {
      Bucket: this.bucketName,
      Key: image.s3_key,
      Expires: expiresIn
    };

    return s3.getSignedUrl('getObject', params);
  }

  /**
   * Format image response
   * @private
   */
  _formatImageResponse(image) {
    return {
      image_id: image.image_id,
      original_filename: image.original_filename,
      file_type: image.file_type,
      file_size: image.file_size,
      s3_url: image.s3_url,
      service_type: image.service_type,
      reference_id: image.reference_id,
      uploaded_by: image.uploaded_by,
      created_at: image.created_at
    };
  }
}

export default new ImageService();
