import mongoose from 'mongoose';

const bankVerificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bank_account_number: {
      type: String,
      required: true,
      unique: true
    },
    bank_name: {
      type: String,
      required: true
    },
    account_holder_name: {
      type: String,
      required: true
    },
    account_type: {
      type: String,
      enum: ['SAVINGS', 'CHECKING', 'BUSINESS'],
      required: true
    },
    bank_code: {
      type: String
    },
    branch_name: {
      type: String
    },
    bank_statement_image: {
      type: String,
      required: true
    },
    id_card_image: {
      type: String
    },
    verification_method: {
      type: String,
      enum: ['MANUAL', 'AUTOMATIC'],
      default: 'MANUAL'
    },
    verification_status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESUBMIT'],
      default: 'PENDING'
    },
    rejection_reason: {
      type: String
    },
    verified_at: {
      type: Date
    },
    verified_by: {
      type: String
    },
    is_default: {
      type: Boolean,
      default: false
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
  { collection: 'bank_verifications' }
);

export default mongoose.model('BankVerification', bankVerificationSchema);
