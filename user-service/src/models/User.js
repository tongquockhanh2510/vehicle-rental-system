import mongoose from 'mongoose';

const user_schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    },
    id_number: {
      type: String,
      unique: true,
      sparse: true
    },
    id_image_front: {
      type: String
    },
    id_image_back: {
      type: String
    },
    address: {
      type: [String],
      default: []
    },
    bank_name: {
      type: String
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER'
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    total_reviews: {
      type: Number,
      default: 0
    },
    kyc_status: {
      type: String,
      enum: ['UNVERIFIED', 'APPROVED', 'REJECTED'],
      default: 'UNVERIFIED'
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
  { collection: 'users' }
);

export default mongoose.model('User', user_schema);
