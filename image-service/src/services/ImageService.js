import s3 from '../config/awsConfig.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export class ImageService {
  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME;
    this.useLocalStorage =
      process.env.USE_LOCAL_IMAGE_STORAGE === 'true' ||
      this.bucketName === 'local-dev-bucket';
    this.uploadDir = path.resolve('./uploads');

    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!this.useLocalStorage) {
      return;
    }

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
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

    if (this.useLocalStorage) {
      this.ensureUploadDir();
      const targetFile = path.join(this.uploadDir, filePath);
      fs.writeFileSync(targetFile, file.buffer);
      return `http://localhost:${process.env.IMAGE_SERVICE_PORT}/uploads/${filePath}`;
    }

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

    if (this.useLocalStorage) {
      this.ensureUploadDir();
      const targetFile = path.join(this.uploadDir, key);
      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
      }
      return true;
    }

    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      throw new Error('Error deleting image');
    }
  }
}

export default new ImageService();
