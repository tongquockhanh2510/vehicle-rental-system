import mongoose from 'mongoose';

const user_schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    },
    id_number: {
      type: String,
      unique: true,
      sparse: true
    },
    id_image_front: {
      type: String
    },
    id_image_back: {
      type: String
    },
    address: {
      type: [String],
      default: []
    },
    bank_name: {
      type: String
    },
    payout_info: {
      method: {
        type: String,
        enum: ['BANK', 'VISA', 'MOMO', 'CASH'],
        default: 'BANK'
      },
      bank_name: {
        type: String,
        default: ''
      },
      bank_code: {
        type: String,
        default: ''
      },
      bank_account_number: {
        type: String,
        default: ''
      },
      bank_account_holder: {
        type: String,
        default: ''
      },
      card_brand: {
        type: String,
        default: ''
      },
      card_last4: {
        type: String,
        default: ''
      },
      payout_note: {
        type: String,
        default: ''
      }
    },
    owner_status: {
      type: String,
      enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NONE'
    },
    owner_application_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OwnerApplication'
    },
    rejection_reason: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER'
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    total_reviews: {
      type: Number,
      default: 0
    },
    kyc_status: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'],
      default: 'UNVERIFIED'
    },
    is_active: {
      type: Boolean,
      default: true
    },
    blocked_at: {
      type: Date,
      default: null
    },
    blocked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    block_reason: {
      type: String,
      default: ''
    },
    deleted_at: {
      type: Date,
      default: null
    },
    deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    delete_reason: {
      type: String,
      default: ''
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
  { collection: 'users' }
);

export default mongoose.model('User', user_schema);
