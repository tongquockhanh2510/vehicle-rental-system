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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
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

review_schema.index({ vehicle_id: 1, created_at: -1 });
review_schema.index({ reviewer_id: 1, created_at: -1 });
review_schema.index({ reviewed_user_id: 1, created_at: -1 });
review_schema.index({ rental_request_id: 1, reviewer_id: 1 }, { unique: true });

export default mongoose.model('Review', review_schema);
