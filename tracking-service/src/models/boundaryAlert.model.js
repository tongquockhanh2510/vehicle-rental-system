import mongoose from 'mongoose';

const allowedAreaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['COUNTRY', 'CIRCLE', 'POLYGON'] },
    country_code: String,
    center: {
      latitude: Number,
      longitude: Number
    },
    radius_km: Number,
    polygon: [
      {
        latitude: Number,
        longitude: Number,
        _id: false
      }
    ]
  },
  { _id: false }
);

const boundaryAlertSchema = new mongoose.Schema(
  {
    vehicle_id: { type: String, required: true, index: true },
    rental_id: { type: String, required: true, index: true },
    contract_id: { type: String, required: true, index: true },
    owner_id: { type: String, required: true, index: true },
    renter_id: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    allowed_area: { type: allowedAreaSchema, default: undefined },
    message: {
      type: String,
      default: 'Vehicle moved outside allowed rental area'
    },
    status: {
      type: String,
      enum: ['NEW', 'SEEN', 'RESOLVED'],
      default: 'NEW',
      index: true
    }
  },
  {
    collection: 'boundary_alerts',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    versionKey: false
  }
);

export default mongoose.model('BoundaryAlert', boundaryAlertSchema);
