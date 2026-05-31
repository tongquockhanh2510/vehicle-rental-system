import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Vehicle from '../src/models/Vehicle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI');
}

const OWNER_EMAIL_BY_TYPE = {
  CAR: 'owner.car@test.com',
  MOTORCYCLE: 'owner.motor@test.com',
  BICYCLE: 'owner.bicycle@test.com',
  PICKUP_TRUCK: 'owner.pickup@test.com',
  SEVEN_SEATER: 'owner.car@test.com',
  OTHER: 'owner.car@test.com'
};

const MOCK_VEHICLES = [
  {
    brand: 'Toyota',
    model: 'Vios',
    year: 2022,
    vehicle_type: 'CAR',
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    seats: 5,
    daily_rate: 650000,
    deposit_amount: 3000000,
    city: 'TP.HCM',
    district: 'Quan 1',
    pickup_location: 'San bay Tan Son Nhat',
    image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Honda',
    model: 'City',
    year: 2023,
    vehicle_type: 'CAR',
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    seats: 5,
    daily_rate: 700000,
    deposit_amount: 3500000,
    city: 'Ha Noi',
    district: 'Cau Giay',
    pickup_location: 'My Dinh',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Ford',
    model: 'Ranger',
    year: 2021,
    vehicle_type: 'PICKUP_TRUCK',
    fuel_type: 'DIESEL',
    transmission: 'AUTOMATIC',
    seats: 5,
    daily_rate: 1100000,
    deposit_amount: 5000000,
    city: 'TP.HCM',
    district: 'Thu Duc',
    pickup_location: 'Ben xe Mien Dong moi',
    image_url: 'https://images.unsplash.com/photo-1592853625511-adf3b4ca2029?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'VinFast',
    model: 'VF e34',
    year: 2024,
    vehicle_type: 'CAR',
    fuel_type: 'ELECTRIC',
    transmission: 'AUTOMATIC',
    seats: 5,
    daily_rate: 900000,
    deposit_amount: 4000000,
    city: 'Ha Noi',
    district: 'Nam Tu Liem',
    pickup_location: 'Keangnam',
    image_url: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Honda',
    model: 'SH',
    year: 2023,
    vehicle_type: 'MOTORCYCLE',
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    seats: 2,
    daily_rate: 250000,
    deposit_amount: 1500000,
    city: 'TP.HCM',
    district: 'Binh Thanh',
    pickup_location: 'Landmark 81',
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Yamaha',
    model: 'Exciter',
    year: 2022,
    vehicle_type: 'MOTORCYCLE',
    fuel_type: 'PETROL',
    transmission: 'MANUAL',
    seats: 2,
    daily_rate: 220000,
    deposit_amount: 1200000,
    city: 'Ha Noi',
    district: 'Thanh Xuan',
    pickup_location: 'Ga Ha Noi',
    image_url: 'https://images.unsplash.com/photo-1623074074564-7e14b8f5dc2f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Giant',
    model: 'Escape 3',
    year: 2024,
    vehicle_type: 'BICYCLE',
    transmission: 'NONE',
    seats: 1,
    daily_rate: 120000,
    deposit_amount: 600000,
    city: 'TP.HCM',
    district: 'Quan 7',
    pickup_location: 'Phu My Hung',
    image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Suzuki',
    model: 'Carry',
    year: 2020,
    vehicle_type: 'PICKUP_TRUCK',
    fuel_type: 'PETROL',
    transmission: 'MANUAL',
    seats: 2,
    daily_rate: 950000,
    deposit_amount: 4500000,
    city: 'TP.HCM',
    district: 'Tan Binh',
    pickup_location: 'San bay Tan Son Nhat',
    image_url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Kia',
    model: 'Carnival',
    year: 2024,
    vehicle_type: 'SEVEN_SEATER',
    fuel_type: 'DIESEL',
    transmission: 'AUTOMATIC',
    seats: 7,
    daily_rate: 1600000,
    deposit_amount: 6500000,
    city: 'TP.HCM',
    district: 'Quan 1',
    pickup_location: 'Landmark 81',
    image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    brand: 'Hyundai',
    model: 'Santa Fe',
    year: 2022,
    vehicle_type: 'SEVEN_SEATER',
    fuel_type: 'DIESEL',
    transmission: 'AUTOMATIC',
    seats: 7,
    daily_rate: 1300000,
    deposit_amount: 5500000,
    city: 'Ha Noi',
    district: 'Ha Dong',
    pickup_location: 'My Dinh',
    image_url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80'
  }
];

function allowedRegionForCity(city) {
  if (city === 'TP.HCM') return 'TP_HCM';
  if (city === 'Ha Noi') return 'HA_NOI';
  if (city === 'Da Nang') return 'DA_NANG';
  return 'OTHER';
}

function plateFor(vehicle, index) {
  const prefix = vehicle.city === 'Ha Noi' ? '30A' : vehicle.city === 'Da Nang' ? '43A' : '51A';
  return `${prefix}-${String(index + 1).padStart(3, '0')}.${String(10 + index).padStart(2, '0')}`;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const users = mongoose.connection.collection('users');

  const owners = new Map();
  for (const email of new Set(Object.values(OWNER_EMAIL_BY_TYPE))) {
    const owner = await users.findOne({ email }, { projection: { _id: 1, email: 1 } });
    if (!owner) {
      throw new Error(`Missing owner account ${email}. Run user-service seed:demo first.`);
    }
    owners.set(email, owner._id);
  }

  const now = new Date();
  let upserted = 0;

  for (const [index, item] of MOCK_VEHICLES.entries()) {
    const ownerEmail = OWNER_EMAIL_BY_TYPE[item.vehicle_type] || OWNER_EMAIL_BY_TYPE.OTHER;
    const licensePlate = plateFor(item, index);
    const doc = {
      owner_id: owners.get(ownerEmail),
      vehicle_type: item.vehicle_type,
      brand: item.brand,
      model: item.model,
      year: item.year,
      license_plate: licensePlate,
      color: 'Trang',
      transmission: item.transmission,
      fuel_type: item.fuel_type,
      seats: item.seats,
      description: `${item.brand} ${item.model} demo vehicle`,
      images: [item.image_url],
      daily_rate: item.daily_rate,
      deposit_amount: item.deposit_amount,
      allowed_region: allowedRegionForCity(item.city),
      pickup_location: item.pickup_location,
      return_location: item.pickup_location,
      city: item.city,
      district: item.district,
      is_available: true,
      registration_number: licensePlate,
      total_rentals: 0,
      average_rating: 4.8,
      updated_at: now
    };

    const result = await Vehicle.updateOne(
      { license_plate: licensePlate },
      { $set: doc, $setOnInsert: { created_at: now } },
      { upsert: true, runValidators: true }
    );

    if (result.upsertedCount || result.modifiedCount) upserted += 1;
  }

  const totalVehicles = await Vehicle.countDocuments();
  console.log('[seed:vehicles] done');
  console.log(`[seed:vehicles] touched=${upserted} totalVehicles=${totalVehicles}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('[seed:vehicles] failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // no-op
  }
  process.exit(1);
});
