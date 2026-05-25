import Image from '../models/Image.js';

export class ImageRepository {
  async create(imageData) {
    const image = new Image(imageData);
    return await image.save();
  }

  async findById(imageId) {
    return await Image.findOne({ image_id: imageId, is_active: true });
  }

  async findByS3Key(s3Key) {
    return await Image.findOne({ s3_key: s3Key, is_active: true });
  }

  async findByReferenceId(referenceId) {
    return await Image.find({ reference_id: referenceId, is_active: true });
  }

  async findByServiceType(serviceType) {
    return await Image.find({ service_type: serviceType, is_active: true });
  }

  async update(imageId, updateData) {
    updateData.updated_at = new Date();
    return await Image.findOneAndUpdate(
      { image_id: imageId },
      updateData,
      { new: true }
    );
  }

  async delete(imageId) {
    return await Image.findOneAndUpdate(
      { image_id: imageId },
      { is_active: false, updated_at: new Date() },
      { new: true }
    );
  }

  async deleteByS3Key(s3Key) {
    return await Image.findOneAndUpdate(
      { s3_key: s3Key },
      { is_active: false, updated_at: new Date() },
      { new: true }
    );
  }

  async findAll(limit = 100, offset = 0) {
    return await Image.find({ is_active: true })
      .limit(limit)
      .skip(offset)
      .sort({ created_at: -1 });
  }
}
