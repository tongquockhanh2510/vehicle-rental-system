import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI in user-service/.env');
}

const PASSWORD_PLAIN = '123456';

const DEMO_USERS = [
  {
    key: 'ownerCar',
    email: 'owner.car@test.com',
    first_name: 'Owner',
    last_name: 'Car',
    phone: '0900000001',
    role: 'USER',
    owner_status: 'APPROVED'
  },
  {
    key: 'ownerMotor',
    email: 'owner.motor@test.com',
    first_name: 'Owner',
    last_name: 'Motorbike',
    phone: '0900000002',
    role: 'USER',
    owner_status: 'APPROVED'
  },
  {
    key: 'ownerBicycle',
    email: 'owner.bicycle@test.com',
    first_name: 'Owner',
    last_name: 'Bicycle',
    phone: '0900000003',
    role: 'USER',
    owner_status: 'APPROVED'
  },
  {
    key: 'ownerPickup',
    email: 'owner.pickup@test.com',
    first_name: 'Owner',
    last_name: 'Pickup',
    phone: '0900000004',
    role: 'USER',
    owner_status: 'APPROVED'
  },
  {
    key: 'admin',
    email: 'admin@test.com',
    first_name: 'Admin',
    last_name: 'System',
    phone: '0900000010',
    role: 'ADMIN',
    owner_status: 'NONE'
  },
  {
    key: 'renter',
    email: 'renter@test.com',
    first_name: 'Renter',
    last_name: 'Test',
    phone: '0900000011',
    role: 'USER',
    owner_status: 'NONE'
  }
];

const OWNER_PROFILE_MAP = {
  ownerCar: {
    legal_name: 'Owner Car',
    phone: '0900000001',
    email: 'owner.car@test.com',
    address: 'Quận 1, TP.HCM',
    id_number: '079000000001',
    id_card_front_url: 'https://placehold.co/900x560/png?text=CCCD+Mat+Truoc+Owner+Car',
    id_card_back_url: 'https://placehold.co/900x560/png?text=CCCD+Mat+Sau+Owner+Car',
    bank_name: 'Vietcombank',
    bank_account_number: '1000000001',
    bank_account_holder: 'OWNER CAR',
    bank_branch: 'TP.HCM'
  },
  ownerMotor: {
    legal_name: 'Owner Motorbike',
    phone: '0900000002',
    email: 'owner.motor@test.com',
    address: 'Quận 3, TP.HCM',
    id_number: '079000000002',
    id_card_front_url: 'https://placehold.co/900x560/png?text=CCCD+Mat+Truoc+Owner+Motor',
    id_card_back_url: 'https://placehold.co/900x560/png?text=CCCD+Mat+Sau+Owner+Motor',
    bank_name: 'BIDV',
    bank_account_number: '1000000002',
    bank_account_holder: 'OWNER MOTOR',
    bank_branch: 'TP.HCM'
  },
  ownerBicycle: {
    legal_name: 'Owner Bicycle',
    phone: '0900000003',
    email: 'owner.bicycle@test.com',
    address: 'Cầu Giấy, Hà Nội',
    id_number: '079000000003',
    id_card_front_url: 'https://placehold.co/900x560/png?text=CCCD+Mat+Truoc+Owner+Bicycle',
    id_card_back_url: 'https://placehold.co/900x560/png?text=CCCD+Mat+Sau+Owner+Bicycle',
    bank_name: 'Techcombank',
    bank_account_number: '1000000003',
    bank_account_holder: 'OWNER BICYCLE',
    bank_branch: 'Hà Nội'
  },
  ownerPickup: {
    legal_name: 'Owner Pickup',
    phone: '0900000004',
    email: 'owner.pickup@test.com',
    address: 'Quận 7, TP.HCM',
    id_number: '079000000004',
    id_card_front_url: 'https://placehold.co/900x560/png?text=CCCD+Mat+Truoc+Owner+Pickup',
    id_card_back_url: 'https://placehold.co/900x560/png?text=CCCD+Mat+Sau+Owner+Pickup',
    bank_name: 'ACB',
    bank_account_number: '1000000004',
    bank_account_holder: 'OWNER PICKUP',
    bank_branch: 'TP.HCM'
  }
};

async function upsertDemoUsers(usersCollection, passwordHash) {
  const now = new Date();
  const userMap = new Map();

  for (const item of DEMO_USERS) {
    const filter = { email: item.email.toLowerCase() };
    const update = {
      $set: {
        email: item.email.toLowerCase(),
        first_name: item.first_name,
        last_name: item.last_name,
        phone: item.phone,
        role: item.role,
        owner_status: item.owner_status,
        owner_application_id: null,
        rejection_reason: '',
        is_active: true,
        updated_at: now,
        password: passwordHash
      },
      $setOnInsert: {
        created_at: now
      }
    };

    await usersCollection.updateOne(filter, update, { upsert: true });
    const user = await usersCollection.findOne(filter, { projection: { _id: 1, email: 1, owner_status: 1, role: 1 } });
    userMap.set(item.key, user);
  }

  return userMap;
}

async function upsertOwnerApplications(ownerApplicationsCollection, usersCollection, userMap) {
  const now = new Date();
  const ownerKeys = ['ownerCar', 'ownerMotor', 'ownerBicycle', 'ownerPickup'];

  for (const ownerKey of ownerKeys) {
    const owner = userMap.get(ownerKey);
    if (!owner?._id) continue;

    const profile = OWNER_PROFILE_MAP[ownerKey];
    const applicationFilter = { user_id: owner._id };
    const applicationUpdate = {
      $set: {
        user_id: owner._id,
        applicant_name: profile.legal_name,
        email: profile.email,
        phone: profile.phone,
        owner_profile: profile,
        status: 'APPROVED',
        review_note: 'Hồ sơ hợp lệ',
        rejection_reason: '',
        submitted_at: now,
        reviewed_at: now,
        reviewed_by: userMap.get('admin')?._id || null,
        updated_at: now
      },
      $setOnInsert: {
        created_at: now
      }
    };

    await ownerApplicationsCollection.updateOne(applicationFilter, applicationUpdate, { upsert: true });
    const application = await ownerApplicationsCollection.findOne(applicationFilter, { projection: { _id: 1 } });

    await usersCollection.updateOne(
      { _id: owner._id },
      {
        $set: {
          owner_status: 'APPROVED',
          owner_application_id: application?._id || null,
          rejection_reason: '',
          updated_at: now
        }
      }
    );
  }
}

async function assignVehicleOwnersByType(vehiclesCollection, ownerIds) {
  const ownerCarId = ownerIds.ownerCar;
  const ownerMotorId = ownerIds.ownerMotor;
  const ownerBicycleId = ownerIds.ownerBicycle;
  const ownerPickupId = ownerIds.ownerPickup;

  if (!ownerCarId || !ownerMotorId || !ownerBicycleId || !ownerPickupId) {
    throw new Error('Missing owner ids for vehicle assignment');
  }

  await Promise.all([
    vehiclesCollection.updateMany(
      { vehicle_type: { $in: ['CAR', 'SEVEN_SEATER'] } },
      { $set: { owner_id: ownerCarId, updated_at: new Date() } }
    ),
    vehiclesCollection.updateMany(
      { vehicle_type: { $in: ['MOTORCYCLE', 'MOTORBIKE'] } },
      { $set: { owner_id: ownerMotorId, updated_at: new Date() } }
    ),
    vehiclesCollection.updateMany(
      { vehicle_type: 'BICYCLE' },
      { $set: { owner_id: ownerBicycleId, updated_at: new Date() } }
    ),
    vehiclesCollection.updateMany(
      { vehicle_type: 'PICKUP_TRUCK' },
      { $set: { owner_id: ownerPickupId, updated_at: new Date() } }
    ),
    vehiclesCollection.updateMany(
      {
        $or: [
          { vehicle_type: { $in: ['OTHER', 'MINI_TRUCK', 'SUV', 'LUXURY_CAR', 'SEVEN_SEAT_CAR'] } },
          { owner_id: { $exists: false } },
          { owner_id: null }
        ]
      },
      { $set: { owner_id: ownerCarId, updated_at: new Date() } }
    )
  ]);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;

  const usersCollection = db.collection('users');
  const vehiclesCollection = db.collection('vehicles');
  const ownerApplicationsCollection = db.collection('owner_applications');

  const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10);
  const userMap = await upsertDemoUsers(usersCollection, passwordHash);
  await upsertOwnerApplications(ownerApplicationsCollection, usersCollection, userMap);

  await assignVehicleOwnersByType(vehiclesCollection, {
    ownerCar: userMap.get('ownerCar')?._id,
    ownerMotor: userMap.get('ownerMotor')?._id,
    ownerBicycle: userMap.get('ownerBicycle')?._id,
    ownerPickup: userMap.get('ownerPickup')?._id
  });

  const [totalUsers, totalVehicles, missingOwnerVehicles, approvedOwners] = await Promise.all([
    usersCollection.countDocuments({}),
    vehiclesCollection.countDocuments({}),
    vehiclesCollection.countDocuments({
      $or: [{ owner_id: { $exists: false } }, { owner_id: null }]
    }),
    usersCollection.countDocuments({ owner_status: 'APPROVED' })
  ]);

  console.log('[seed:demo] done');
  console.log(`[seed:demo] users=${totalUsers} vehicles=${totalVehicles} approvedOwners=${approvedOwners}`);
  console.log(`[seed:demo] vehicles_without_owner=${missingOwnerVehicles}`);
  console.log('[seed:demo] test password for demo accounts: 123456');

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('[seed:demo] failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // no-op
  }
  process.exit(1);
});
