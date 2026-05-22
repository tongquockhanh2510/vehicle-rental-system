import mongoose from 'mongoose';

const review_schema = new mongoose.Schema(
  {
    rental_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    reviewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    reviewed_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    review_type: {
      type: String,
      enum: ['RENTER_TO_OWNER', 'OWNER_TO_RENTER', 'VEHICLE'],
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    criteria: {
      cleanliness: Number,
      condition: Number,
      accuracy: Number,
      communication: Number,
      punctuality: Number
    },
    is_verified_purchase: {
      type: Boolean,
      default: true
    },
    helpful_count: {
      type: Number,
      default: 0
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
  { collection: 'reviews' }
);

export default mongoose.model('Review', review_schema);
