import mongoose from 'mongoose';

const vehicle_schema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    vehicle_type: {
      type: String,
      enum: ['CAR', 'MOTORCYCLE', 'VAN', 'TRUCK'],
      required: true
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
      required: true,
      unique: true
    },
    color: String,
    transmission: {
      type: String,
      enum: ['MANUAL', 'AUTOMATIC']
    },
    fuel_type: {
      type: String,
      enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']
    },
    seats: Number,
    description: String,
    images: [String],
    daily_rate: {
      type: Number,
      required: true
    },
    deposit_amount: {
      type: Number,
      required: true
    },
    allowed_region: {
      type: String,
      enum: ['VIETNAM', 'INTERNATIONAL']
    },
    is_available: {
      type: Boolean,
      default: true
    },
    registration_number: String,
    registration_expiry: Date,
    insurance_number: String,
    insurance_expiry: Date,
    total_rentals: {
      type: Number,
      default: 0
    },
    average_rating: {
      type: Number,
      default: 5.0
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
  { collection: 'vehicles' }
);

// Add indexes for frequently searched fields
vehicle_schema.index({ owner_id: 1 });
vehicle_schema.index({ is_available: 1 });
vehicle_schema.index({ vehicle_type: 1 });
vehicle_schema.index({ brand: 1 });
vehicle_schema.index({ daily_rate: 1 });
vehicle_schema.index({ created_at: -1 });

export default mongoose.model('Vehicle', vehicle_schema);
