import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    image_id: {
      type: String,
      required: true,
      unique: true
    },
    original_filename: {
      type: String,
      required: true
    },
    file_name: {
      type: String,
      required: true
    },
    file_size: {
      type: Number,
      required: true
    },
    file_type: {
      type: String,
      required: true
    },
    s3_url: {
      type: String,
      required: true
    },
    s3_bucket: {
      type: String,
      required: true
    },
    s3_key: {
      type: String,
      required: true
    },
    service_type: {
      type: String,
      required: true,
      enum: ['USER_VERIFICATION', 'VEHICLE_IMAGE', 'CONTRACT', 'OTHER']
    },
    reference_id: {
      type: String
    },
    uploaded_by: {
      type: String
    },
    is_active: {
      type: Boolean,
      default: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'images' }
);

export default mongoose.model('Image', imageSchema);
