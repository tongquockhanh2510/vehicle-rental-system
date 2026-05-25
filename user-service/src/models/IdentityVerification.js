import mongoose from 'mongoose';

const identityVerificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    id_number: {
      type: String,
      required: true
    },
    id_type: {
      type: String,
      enum: ['PASSPORT', 'NATIONAL_ID', 'DRIVER_LICENSE'],
      required: true
    },
    id_image_front: {
      type: String,
      required: true
    },
    id_image_back: {
      type: String
    },
    full_name: {
      type: String,
      required: true
    },
    date_of_birth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER']
    },
    nationality: {
      type: String
    },
    address: {
      type: String
    },
    issued_date: {
      type: Date
    },
    expiry_date: {
      type: Date
    },
    verification_status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESUBMIT'],
      default: 'PENDING'
    },
    rejection_reason: {
      type: String
    },
    verified_at: {
      type: Date
    },
    verified_by: {
      type: String
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
  { collection: 'identity_verifications' }
);

export default mongoose.model('IdentityVerification', identityVerificationSchema);
