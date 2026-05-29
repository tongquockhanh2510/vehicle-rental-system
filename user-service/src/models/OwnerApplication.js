import mongoose from 'mongoose';

const owner_application_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    applicant_name: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    owner_profile: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    review_note: {
      type: String,
      default: ''
    },
    rejection_reason: {
      type: String,
      default: ''
    },
    submitted_at: {
      type: Date,
      default: Date.now
    },
    reviewed_at: {
      type: Date
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
  { collection: 'owner_applications' }
);

owner_application_schema.index({ user_id: 1, created_at: -1 });
owner_application_schema.index({ status: 1, created_at: -1 });

export default mongoose.model('OwnerApplication', owner_application_schema);

