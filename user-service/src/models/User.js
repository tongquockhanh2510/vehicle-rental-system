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
      type: String
    },
    license_number: {
      type: String,
      sparse: true
    },
    license_image: {
      type: String
    },
    license_expiry_date: {
      type: Date
    },
    bank_account: {
      type: String
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
    verified: {
      type: Boolean,
      default: false
    },
    kyc_status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
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
