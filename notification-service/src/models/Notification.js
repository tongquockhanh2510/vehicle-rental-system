import mongoose from 'mongoose';

const notification_schema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'RENTAL_REQUEST',
        'RENTAL_CONFIRMED',
        'RENTAL_REJECTED',
        'PICKUP_REMINDER',
        'VEHICLE_OUT_OF_BOUNDS',
        'DISPUTE_CREATED',
        'COMPENSATION_REQUEST',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'RETURN_REMINDER',
        'REVIEW_REQUEST',
        'DISPUTE_APPROVED',
        'DISPUTE_REJECTED',
        'OTHER'
      ],
      required: true
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'ID of related entity (rental, payment, etc)'
    },
    is_read: {
      type: Boolean,
      default: false
    },
    action_url: String,
    created_at: {
      type: Date,
      default: Date.now
    },
    read_at: Date
  },
  { collection: 'notifications' }
);

export default mongoose.model('Notification', notification_schema);
