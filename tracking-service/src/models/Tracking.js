import mongoose from 'mongoose';

const location_schema = new mongoose.Schema(
  {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle'
    },
    rental_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalRequest'
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: String,
    is_within_allowed_area: {
      type: Boolean,
      default: true
    },
    alert_sent: {
      type: Boolean,
      default: false
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'vehicle_locations' }
);

const movement_history_schema = new mongoose.Schema(
  {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle'
    },
    rental_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RentalRequest'
    },
    start_location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    end_location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    distance_km: Number,
    duration_minutes: Number,
    start_time: Date,
    end_time: Date,
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'movement_histories' }
);

export const Location = mongoose.model('Location', location_schema);
export const MovementHistory = mongoose.model('MovementHistory', movement_history_schema);
