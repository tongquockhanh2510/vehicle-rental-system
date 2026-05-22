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
    mileage: Number,
    description: String,
    images: [String],
    daily_rate: {
      type: Number,
      required: true
    },
    deposit_percentage: {
      type: Number,
      required: true,
      default: 20
    },
    allowed_regions: {
      type: [String],
      default: ['VIETNAM']
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

export default mongoose.model('Vehicle', vehicle_schema);
