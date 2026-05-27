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
    description: {
      type: String,
      required: true
    },
    claimed_amount: {
      type: Number,
      required: true
    },
    pickup_location: String,
    pickup_date: Date,
    pickup_images: [String],
    return_location: String,
    return_date: Date,
    return_images: [String],
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    admin_notes: String,
    admin_decision_amount: Number,
    admin_reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
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
