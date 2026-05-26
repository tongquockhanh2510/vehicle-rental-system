import s3 from '../config/awsConfig.js';
import { v4 as uuidv4 } from 'uuid';

export class ImageService {
  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME;
  }

  async uploadImage(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileExtension = file.originalname.split('.').pop();
    const filePath = `${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: this.bucketName,
      Body: file.buffer,
      Key: filePath,
      ContentType: file.mimetype
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      throw new Error('Error uploading image');
    }
  }

  async deleteImage(imageUrl) {
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }

    const key = imageUrl.split('/').pop();

    const params = {
      Bucket: this.bucketName,
      Key: key
    };

    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      throw new Error('Error deleting image');
    }
  }
}

export default new ImageService();