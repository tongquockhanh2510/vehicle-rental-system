import mongoose from 'mongoose';

const licenseVerificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    license_number: {
      type: String,
      required: true,
      unique: true
    },
    license_type: {
      type: String,
      enum: ['A', 'B', 'B1', 'C', 'D', 'E'],
      required: true
    },
    license_image_front: {
      type: String,
      required: true
    },
    license_image_back: {
      type: String
    },
    full_name: {
      type: String,
      required: true
    },
    date_of_birth: {
      type: Date
    },
    issued_date: {
      type: Date,
      required: true
    },
    expiry_date: {
      type: Date,
      required: true
    },
    issued_country: {
      type: String
    },
    driving_class: {
      type: String
    },
    restrictions: {
      type: String
    },
    verification_status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESUBMIT', 'EXPIRED'],
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
  { collection: 'license_verifications' }
);

export default mongoose.model('LicenseVerification', licenseVerificationSchema);
