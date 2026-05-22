import mongoose from 'mongoose';

const inspection_schema = new mongoose.Schema(
  {
    rental_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle'
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
    inspection_type: {
      type: String,
      enum: ['PICKUP', 'RETURN'],
      required: true
    },
    images: [String],
    damage_description: String,
    damage_items: [{
      part: String,
      severity: String,
      description: String
    }],
    mileage: Number,
    fuel_level: String,
    overall_condition: String,
    notes: String,
    approved_by_owner: {
      type: Boolean,
      default: false
    },
    owner_approval_notes: String,
    inspection_date: {
      type: Date,
      default: Date.now
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
  { collection: 'inspections' }
);

export default mongoose.model('Inspection', inspection_schema);
