import { MOCK_VEHICLES } from './mockVehicles';

const now = Date.now();
const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_ADMIN_USERS = [
  {
    _id: 'admin-001',
    first_name: 'Admin',
    last_name: 'System',
    email: 'admin@rentcar.vn',
    role: 'ADMIN',
    owner_status: 'NONE',
    account_status: 'ACTIVE',
    created_at: daysAgo(120)
  },
  {
    _id: 'user-001',
    first_name: 'Minh',
    last_name: 'Nguyễn',
    email: 'minh.user@rentcar.vn',
    role: 'USER',
    owner_status: 'NONE',
    account_status: 'ACTIVE',
    created_at: daysAgo(25)
  },
  {
    _id: 'owner-001',
    first_name: 'Khang',
    last_name: 'Trần',
    email: 'khang.owner@rentcar.vn',
    role: 'USER',
    owner_status: 'APPROVED',
    account_status: 'ACTIVE',
    created_at: daysAgo(90)
  },
  {
    _id: 'owner-002',
    first_name: 'Linh',
    last_name: 'Phạm',
    email: 'linh.owner@rentcar.vn',
    role: 'USER',
    owner_status: 'APPROVED',
    account_status: 'ACTIVE',
    created_at: daysAgo(75)
  },
  {
    _id: 'owner-003',
    first_name: 'Nhật',
    last_name: 'Lê',
    email: 'nhat.owner@rentcar.vn',
    role: 'USER',
    owner_status: 'APPROVED',
    account_status: 'ACTIVE',
    created_at: daysAgo(65)
  },
  {
    _id: 'owner-004',
    first_name: 'Tú',
    last_name: 'Đặng',
    email: 'tu.owner@rentcar.vn',
    role: 'USER',
    owner_status: 'APPROVED',
    account_status: 'SUSPENDED',
    created_at: daysAgo(40)
  },
  {
    _id: 'owner-010',
    first_name: 'Quang',
    last_name: 'Võ',
    email: 'quang.pending@rentcar.vn',
    role: 'USER',
    owner_status: 'PENDING',
    account_status: 'ACTIVE',
    created_at: daysAgo(7)
  },
  {
    _id: 'owner-011',
    first_name: 'Hà',
    last_name: 'Bùi',
    email: 'ha.rejected@rentcar.vn',
    role: 'USER',
    owner_status: 'REJECTED',
    account_status: 'ACTIVE',
    created_at: daysAgo(15)
  }
];

export const MOCK_ADMIN_OWNER_APPLICATIONS = [
  {
    _id: 'OWN-DEMO-001',
    user_id: 'owner-010',
    applicant_name: 'Võ Quang',
    email: 'quang.pending@rentcar.vn',
    phone: '0909000900',
    status: 'PENDING',
    created_at: daysAgo(2),
    updated_at: daysAgo(1),
    review_note: '',
    rejection_reason: '',
    owner_profile: {
      legal_name: 'Võ Minh Quang',
      id_number: '079999888877',
      address: 'Quận 3, TP.HCM',
      bank_name: 'Vietcombank',
      bank_account_number: '0039393939',
      bank_account_holder: 'VO MINH QUANG',
      id_front_name: 'cccd-front.jpg',
      id_back_name: 'cccd-back.jpg'
    }
  },
  {
    _id: 'OWN-DEMO-002',
    user_id: 'owner-011',
    applicant_name: 'Bùi Thị Hà',
    email: 'ha.rejected@rentcar.vn',
    phone: '0911888777',
    status: 'REJECTED',
    created_at: daysAgo(9),
    updated_at: daysAgo(6),
    review_note: 'Ảnh CCCD mờ, cần cập nhật lại bản rõ nét.',
    rejection_reason: 'Ảnh CCCD mờ, cần cập nhật lại bản rõ nét.',
    owner_profile: {
      legal_name: 'Bùi Thị Hà',
      id_number: '079222333444',
      address: 'Ba Đình, Hà Nội',
      bank_name: 'Techcombank',
      bank_account_number: '0456123123',
      bank_account_holder: 'BUI THI HA',
      id_front_name: 'ha-front.png',
      id_back_name: 'ha-back.png'
    }
  }
];

const rentalRows = [
  {
    _id: 'rent-001',
    renter_id: 'user-001',
    owner_id: 'owner-001',
    vehicle_id: 'mock-001',
    rental_start_date: daysAgo(2),
    rental_end_date: daysAgo(1),
    pickup_location: 'Quận 1, TP.HCM',
    return_location: 'Quận 1, TP.HCM',
    status: 'COMPLETED',
    created_at: daysAgo(4)
  },
  {
    _id: 'rent-002',
    renter_id: 'user-001',
    owner_id: 'owner-002',
    vehicle_id: 'mock-002',
    rental_start_date: daysAgo(1),
    rental_end_date: daysAgo(-1),
    pickup_location: 'Cầu Giấy, Hà Nội',
    return_location: 'Cầu Giấy, Hà Nội',
    status: 'ACTIVE',
    created_at: daysAgo(3)
  },
  {
    _id: 'rent-003',
    renter_id: 'user-001',
    owner_id: 'owner-003',
    vehicle_id: 'mock-003',
    rental_start_date: daysAgo(0),
    rental_end_date: daysAgo(-2),
    pickup_location: 'Thủ Đức, TP.HCM',
    return_location: 'Thủ Đức, TP.HCM',
    status: 'PENDING',
    created_at: daysAgo(1)
  },
  {
    _id: 'rent-004',
    renter_id: 'user-001',
    owner_id: 'owner-004',
    vehicle_id: 'mock-010',
    rental_start_date: daysAgo(12),
    rental_end_date: daysAgo(10),
    pickup_location: 'Tân Bình, TP.HCM',
    return_location: 'Tân Bình, TP.HCM',
    status: 'REJECTED',
    created_at: daysAgo(13)
  }
];

export const MOCK_ADMIN_RENTALS = rentalRows;

export const MOCK_ADMIN_CONTRACTS = rentalRows
  .filter((item) => ['APPROVED', 'ACTIVE', 'COMPLETED'].includes(String(item.status).toUpperCase()))
  .map((item, index) => ({
    _id: `ctr-${index + 1}`,
    rental_request_id: item._id,
    vehicle_id: item.vehicle_id,
    renter_id: item.renter_id,
    owner_id: item.owner_id,
    rental_start_date: item.rental_start_date,
    rental_end_date: item.rental_end_date,
    rental_amount: [1300000, 2500000, 1800000][index] || 1200000,
    deposit_amount: [3000000, 4000000, 5000000][index] || 3000000,
    status: item.status === 'APPROVED' ? 'ACTIVE' : item.status,
    created_at: item.created_at,
    pickup_time: item.status === 'COMPLETED' || item.status === 'ACTIVE' ? daysAgo(2) : null,
    return_time: item.status === 'COMPLETED' ? daysAgo(1) : null
  }));

export const MOCK_ADMIN_PAYMENTS = [
  {
    _id: 'pay-001',
    contract_id: 'ctr-1',
    payer_id: 'user-001',
    recipient_id: 'owner-001',
    payment_type: 'RENTAL_FEE',
    payment_method: 'VNPAY',
    amount: 1300000,
    status: 'COMPLETED',
    created_at: daysAgo(3)
  },
  {
    _id: 'pay-002',
    contract_id: 'ctr-1',
    payer_id: 'user-001',
    recipient_id: 'owner-001',
    payment_type: 'DEPOSIT',
    payment_method: 'MOMO',
    amount: 3000000,
    status: 'REFUNDED',
    created_at: daysAgo(3)
  },
  {
    _id: 'pay-003',
    contract_id: 'ctr-2',
    payer_id: 'user-001',
    recipient_id: 'owner-002',
    payment_type: 'DEPOSIT',
    payment_method: 'VNPAY',
    amount: 4000000,
    status: 'PENDING',
    created_at: daysAgo(1)
  }
];

export const MOCK_ADMIN_DISPUTES = [
  {
    _id: 'dsp-001',
    contract_id: 'ctr-1',
    owner_id: 'owner-001',
    renter_id: 'user-001',
    description: 'Xe trầy cản sau khi trả xe, cần đối soát ảnh trước/sau.',
    claimed_amount: 2500000,
    admin_decision_amount: 0,
    status: 'PENDING',
    created_at: daysAgo(1)
  },
  {
    _id: 'dsp-002',
    contract_id: 'ctr-0',
    owner_id: 'owner-003',
    renter_id: 'user-001',
    description: 'Bồi thường vệ sinh nội thất đã xử lý.',
    claimed_amount: 600000,
    admin_decision_amount: 450000,
    status: 'APPROVED',
    created_at: daysAgo(10)
  }
];

export const MOCK_ADMIN_VEHICLES = MOCK_VEHICLES.map((vehicle) => ({
  ...vehicle,
  images: [vehicle.image_url]
}));
