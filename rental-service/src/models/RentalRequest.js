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
    brand: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    license_plate: {
      type: String,
      required: true
    },
    images: [String],
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
    city: {
      type: String,
      default: ''
    },
    district: {
      type: String,
      default: ''
    },
    allowed_region: {
      type: String,
      default: ''
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

rental_request_schema.index({ renter_id: 1, created_at: -1 });
rental_request_schema.index({ owner_id: 1, created_at: -1 });
rental_request_schema.index({ vehicle_id: 1, status: 1, rental_start_date: 1, rental_end_date: 1 });
rental_request_schema.index({ status: 1, created_at: -1 });
rental_request_schema.index({ created_at: -1 });

export default mongoose.model('RentalRequest', rental_request_schema);
