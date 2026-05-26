import mongoose from 'mongoose';

const contract_schema = new mongoose.Schema(
  {
    rental_request_id: {
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
    rental_start_date: Date,
    rental_end_date: Date,
    daily_rate: Number,
    total_days: Number,
    rental_cost: Number,
    deposit_amount: Number,
    platform_fee: Number,
    total_cost: Number,
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
      default: 'ACTIVE'
    },
    cancellation_fee_applied: {
      type: Boolean,
      default: false
    },
    cancellation_fee_amount: Number,
    refund_amount: Number,
    cancellation_reason: String,
    cancelled_by: {
      type: String,
      enum: ['OWNER', 'RENTER']
    },
    cancelled_at: Date,
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'contracts' }
);

export default mongoose.model('Contract', contract_schema);
