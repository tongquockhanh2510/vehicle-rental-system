import mongoose from 'mongoose';

const payment_schema = new mongoose.Schema(
  {
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
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
    payment_type: {
      type: String,
      enum: ['DEPOSIT', 'RENTAL_FEE', 'DAMAGE_COMPENSATION', 'REFUND'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    platform_fee: Number,
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    payment_method: {
      type: String,
      enum: ['BANK_TRANSFER', 'CARD', 'WALLET'],
      default: 'BANK_TRANSFER'
    },
    transaction_id: String,
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
  { collection: 'payments' }
);

export default mongoose.model('Payment', payment_schema);
