import mongoose from 'mongoose';

const vehicleLocationHistorySchema = new mongoose.Schema(
  {
    vehicle_id: { type: String, required: true, index: true },
    rental_id: { type: String, required: true, index: true },
    contract_id: { type: String, required: true, index: true },
    owner_id: { type: String, required: true, index: true },
    renter_id: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: null },
    address: { type: String, default: '' },
    is_out_of_boundary: { type: Boolean, default: false },
    recorded_at: { type: Date, default: Date.now, index: true }
  },
  {
    collection: 'vehicle_location_histories',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false
    },
    versionKey: false
  }
);

export default mongoose.model('VehicleLocationHistory', vehicleLocationHistorySchema);
