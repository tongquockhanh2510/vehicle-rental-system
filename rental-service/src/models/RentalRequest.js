import mongoose from 'mongoose';

const rental_request_schema = new mongoose.Schema(
  {
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
    rental_start_date: {
      type: Date,
      required: true
    },
    rental_end_date: {
      type: Date,
      required: true
    },
    pickup_location: {
      type: String,
      required: true
    },
    return_location: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING'
    },
    daily_rate: Number,
    total_days: Number,
    total_amount: Number,
    deposit_amount: Number,
    platform_fee: Number,
    notes: String,
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'rental_requests' }
);

export default mongoose.model('RentalRequest', rental_request_schema);
