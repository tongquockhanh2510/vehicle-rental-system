import mongoose from 'mongoose';

const dispute_schema = new mongoose.Schema(
  {
    rental_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    renter_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle'
    },
    dispute_type: {
      type: String,
      enum: ['DAMAGE_CLAIM', 'LATE_RETURN', 'OTHER'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    damage_images: [String],
    claimed_amount: {
      type: Number,
      required: true
    },
    evidence: [{
      type: String,
      description: String
    }],
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED'],
      default: 'PENDING'
    },
    admin_notes: String,
    admin_decision_amount: Number,
    admin_reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewed_at: Date,
    resolved_at: Date,
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'disputes' }
);

export default mongoose.model('Dispute', dispute_schema);
