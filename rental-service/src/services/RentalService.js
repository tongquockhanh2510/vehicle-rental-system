import axios from 'axios';
import mongoose from 'mongoose';
import { EventBus } from '../events/EventBus.js';
import { RentalRepository } from '../repositories/RentalRepository.js';

const rentalRepository = new RentalRepository();
const eventBus = new EventBus();

const RENTAL_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  ACTIVE: 'ACTIVE',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED'
};

function makeError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function upper(value) {
  return String(value || '').toUpperCase();
}

function parseDateOnly(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return new Date(Number.NaN);
  return new Date(year, month - 1, day);
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function startOfTomorrow() {
  const tomorrow = startOfToday();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

function buildVehicleLocationSnapshot(vehicle = {}) {
  const cityDistrict = [vehicle.district, vehicle.city].filter(Boolean).join(', ');
  const pickupLocation =
    vehicle.pickup_location || cityDistrict || vehicle.allowed_region || 'Chưa cập nhật';
  const returnLocation = vehicle.return_location || pickupLocation;

  return {
    pickup_location: pickupLocation,
    return_location: returnLocation,
    city: vehicle.city || '',
    district: vehicle.district || '',
    allowed_region: vehicle.allowed_region || ''
  };
}

function toObjectId(value) {
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  return value;
}

export class RentalService {
  async fetchVehicle(vehicleId) {
    try {
      const vehicleRes = await axios.get(
        `${process.env.VEHICLE_SERVICE_URL}/api/vehicles/${vehicleId}`
      );
      return vehicleRes?.data?.data || vehicleRes?.data || null;
    } catch (error) {
      if (error?.response?.status === 404) {
        throw makeError('Vehicle not found', 404);
      }
      throw makeError('Vehicle service unavailable, please try again later', 503);
    }
  }

  async updateVehicleAvailability(vehicleId, isAvailable) {
    try {
      await axios.put(
        `${process.env.VEHICLE_SERVICE_URL}/api/vehicles/${vehicleId}/availability`,
        { is_available: Boolean(isAvailable) }
      );
    } catch (error) {
      console.log('Update vehicle availability failed:', error.message);
    }
  }

  async syncContractStatusByRental(rentalId, status, extra = {}) {
    try {
      await mongoose.connection.collection('contracts').updateOne(
        { rental_request_id: toObjectId(rentalId) },
        { $set: { status, ...extra, updated_at: new Date() } }
      );
    } catch (error) {
      console.log('Sync contract status failed:', error.message);
    }
  }

  async createRentalRequest(renterId, rentalData) {
    if (!rentalData?.vehicle_id) {
      throw makeError('Missing required field: vehicle_id', 400);
    }

    const vehicle = await this.fetchVehicle(rentalData.vehicle_id);
    if (!vehicle) {
      throw makeError('Vehicle not found', 404);
    }

    if (!vehicle.is_available) {
      throw makeError('Vehicle is not available', 400);
    }

    if (String(vehicle.owner_id) === String(renterId)) {
      throw makeError('Bạn không thể thuê phương tiện do chính mình đăng.', 400);
    }

    const startDateValue = rentalData.rental_start_date || rentalData.start_date;
    const endDateValue = rentalData.rental_end_date || rentalData.end_date;

    // Date inputs arrive as YYYY-MM-DD. Parse them as local dates so timezone
    // conversion cannot move the booking to the previous day.
    const startDate = parseDateOnly(startDateValue);
    const endDate = parseDateOnly(endDateValue);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw makeError('Invalid rental dates', 400);
    }

    if (startDate < startOfTomorrow()) {
      throw makeError('Ngày nhận xe phải sau ngày hiện tại.', 400);
    }

    if (endDate < startDate) {
      throw makeError('Ngày trả xe phải bằng hoặc sau ngày nhận xe.', 400);
    }

    const totalDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyRate = Number(vehicle.daily_rate || vehicle.price_per_day || 0);
    if (!Number.isFinite(dailyRate) || dailyRate <= 0) {
      throw makeError('Invalid vehicle daily rate', 400);
    }

    const totalAmount = dailyRate * totalDays;
    const depositAmount = Number(vehicle.deposit_amount || 0);
    const platformFee = totalAmount * 0.04;
    const locationSnapshot = buildVehicleLocationSnapshot(vehicle);

    const rental = await rentalRepository.create({
      vehicle_id: rentalData.vehicle_id,
      rental_start_date: startDate,
      rental_end_date: endDate,
      notes: rentalData.notes || rentalData.note || '',
      renter_id: renterId,
      owner_id: vehicle.owner_id,
      daily_rate: dailyRate,
      deposit_amount: depositAmount,
      total_days: totalDays,
      total_amount: totalAmount,
      platform_fee: platformFee,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      license_plate: vehicle.license_plate,
      images: Array.isArray(vehicle.images) ? vehicle.images : [],
      status: RENTAL_STATUSES.PENDING,
      ...locationSnapshot
    });

    await eventBus.publish('rental_request_created', {
      rentalId: rental._id,
      renterId: renterId,
      ownerId: rental.owner_id,
      vehicleId: rental.vehicle_id
    });

    return rental;
  }

  async approveRental(rentalId, ownerId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw makeError('Rental not found', 404);
    }
    if (String(rental.owner_id) !== String(ownerId)) {
      throw makeError('Not authorized to approve this rental', 403);
    }

    const currentStatus = upper(rental.status);
    if (currentStatus !== RENTAL_STATUSES.PENDING) {
      throw makeError('Only pending rentals can be approved', 400);
    }

    const updated = await rentalRepository.update(rentalId, {
      status: RENTAL_STATUSES.APPROVED
    });

    await this.updateVehicleAvailability(rental.vehicle_id, false);

    await eventBus.publish('rental_confirmed', {
      rentalId: updated._id,
      renterId: updated.renter_id,
      ownerId: updated.owner_id,
      vehicleId: updated.vehicle_id,
      rentalStartDate: updated.rental_start_date,
      rentalEndDate: updated.rental_end_date,
      pickupLocation: updated.pickup_location,
      returnLocation: updated.return_location,
      dailyRate: updated.daily_rate,
      totalDays: updated.total_days,
      totalAmount: updated.total_amount,
      depositAmount: updated.deposit_amount,
      platformFee: updated.platform_fee,
      brand: updated.brand,
      model: updated.model,
      year: updated.year,
      license_plate: updated.license_plate,
      images: updated.images
    });

    return updated;
  }

  async confirmRental(rentalId, ownerId) {
    return this.approveRental(rentalId, ownerId);
  }

  async rejectRental(rentalId, ownerId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw makeError('Rental not found', 404);
    }
    if (String(rental.owner_id) !== String(ownerId)) {
      throw makeError('Not authorized to reject this rental', 403);
    }

    const currentStatus = upper(rental.status);
    if (![RENTAL_STATUSES.PENDING, RENTAL_STATUSES.APPROVED, RENTAL_STATUSES.CONFIRMED].includes(currentStatus)) {
      throw makeError('Only pending or approved rentals can be rejected', 400);
    }

    const updated = await rentalRepository.update(rentalId, {
      status: RENTAL_STATUSES.REJECTED
    });

    if ([RENTAL_STATUSES.APPROVED, RENTAL_STATUSES.CONFIRMED].includes(currentStatus)) {
      await this.updateVehicleAvailability(rental.vehicle_id, true);
    }

    await eventBus.publish('rental_rejected', {
      rentalId: updated._id,
      renterId: updated.renter_id,
      ownerId: updated.owner_id
    });

    return updated;
  }

  async confirmPickup(rentalId, renterId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw makeError('Rental not found', 404);
    }
    if (String(rental.renter_id) !== String(renterId)) {
      throw makeError('Not authorized to confirm pickup for this rental', 403);
    }

    const currentStatus = upper(rental.status);
    if (![RENTAL_STATUSES.APPROVED, RENTAL_STATUSES.CONFIRMED].includes(currentStatus)) {
      throw makeError('Only approved rentals can be marked as active', 400);
    }

    const updated = await rentalRepository.update(rentalId, {
      status: RENTAL_STATUSES.ACTIVE,
      pickup_confirmed_at: new Date()
    });

    await this.syncContractStatusByRental(rentalId, 'ACTIVE');
    return updated;
  }

  async requestReturn(rentalId, renterId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw makeError('Rental not found', 404);
    }
    if (String(rental.renter_id) !== String(renterId)) {
      throw makeError('Not authorized to return this rental', 403);
    }

    const currentStatus = upper(rental.status);
    if (currentStatus !== RENTAL_STATUSES.ACTIVE) {
      throw makeError('Only active rentals can be returned', 400);
    }

    const updated = await rentalRepository.update(rentalId, {
      status: RENTAL_STATUSES.RETURN_REQUESTED,
      return_requested_at: new Date()
    });

    return updated;
  }

  async confirmReturn(rentalId, ownerId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw makeError('Rental not found', 404);
    }
    if (String(rental.owner_id) !== String(ownerId)) {
      throw makeError('Not authorized to confirm return for this rental', 403);
    }

    const currentStatus = upper(rental.status);
    if (![RENTAL_STATUSES.RETURN_REQUESTED, RENTAL_STATUSES.ACTIVE].includes(currentStatus)) {
      throw makeError('Rental is not waiting for return confirmation', 400);
    }

    const completedAt = new Date();
    const updated = await rentalRepository.update(rentalId, {
      status: RENTAL_STATUSES.COMPLETED,
      completed_at: completedAt
    });

    await this.updateVehicleAvailability(rental.vehicle_id, true);
    await this.syncContractStatusByRental(rentalId, 'COMPLETED', { return_time: completedAt });
    return updated;
  }

  async markDisputed(rentalId, actorId, reason = '') {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw makeError('Rental not found', 404);
    }
    const isRenter = String(rental.renter_id) === String(actorId);
    const isOwner = String(rental.owner_id) === String(actorId);
    if (!isRenter && !isOwner) {
      throw makeError('Not authorized to dispute this rental', 403);
    }

    const currentStatus = upper(rental.status);
    if (
      ![
        RENTAL_STATUSES.RETURN_REQUESTED,
        RENTAL_STATUSES.ACTIVE,
        RENTAL_STATUSES.APPROVED,
        RENTAL_STATUSES.CONFIRMED
      ].includes(currentStatus)
    ) {
      throw makeError('Rental cannot be disputed in current status', 400);
    }

    const updated = await rentalRepository.update(rentalId, {
      status: RENTAL_STATUSES.DISPUTED,
      dispute_reason: reason || 'Chưa cung cấp lý do'
    });

    await this.syncContractStatusByRental(rentalId, 'DISPUTED');
    return updated;
  }

  async cancelRental(rentalId, requesterId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw makeError('Rental not found', 404);
    }
    if (String(rental.renter_id) !== String(requesterId)) {
      throw makeError('Not authorized to cancel this rental', 403);
    }

    const currentStatus = upper(rental.status);
    if (![RENTAL_STATUSES.PENDING, RENTAL_STATUSES.APPROVED, RENTAL_STATUSES.CONFIRMED].includes(currentStatus)) {
      throw makeError('Only pending or approved rentals can be cancelled', 400);
    }

    const updated = await rentalRepository.update(rentalId, {
      status: RENTAL_STATUSES.CANCELLED
    });

    if ([RENTAL_STATUSES.APPROVED, RENTAL_STATUSES.CONFIRMED].includes(currentStatus)) {
      await this.updateVehicleAvailability(rental.vehicle_id, true);
    }

    await eventBus.publish('rental_cancelled', {
      rentalId: updated._id,
      renterId: updated.renter_id,
      amount: updated.total_amount
    });

    return updated;
  }

  async getRentalById(rentalId) {
    return await rentalRepository.findById(rentalId);
  }

  async getRenterRentals(renterId) {
    return await rentalRepository.findByRenterId(renterId);
  }

  async getOwnerRentals(ownerId) {
    return await rentalRepository.findByOwnerId(ownerId);
  }

  async getAdminRentals(filters = {}, options = {}) {
    const query = {};
    if (filters.status) query.status = upper(filters.status);
    if (filters.owner_id) query.owner_id = filters.owner_id;
    if (filters.renter_id) query.renter_id = filters.renter_id;
    if (filters.vehicle_id) query.vehicle_id = filters.vehicle_id;
    return await rentalRepository.findAll(query, options);
  }

  async checkAvailability(vehicleId, startDate, endDate) {
    const conflicts = await rentalRepository.findByVehicleId(vehicleId);
    const blockedStatuses = new Set([
      RENTAL_STATUSES.APPROVED,
      RENTAL_STATUSES.CONFIRMED,
      RENTAL_STATUSES.ACTIVE,
      RENTAL_STATUSES.RETURN_REQUESTED
    ]);

    for (const rental of conflicts) {
      if (!blockedStatuses.has(upper(rental.status))) continue;

      const rentalStart = new Date(rental.rental_start_date);
      const rentalEnd = new Date(rental.rental_end_date);
      const newStart = parseDateOnly(startDate);
      const newEnd = parseDateOnly(endDate);
      if (!(newEnd < rentalStart || newStart > rentalEnd)) {
        return false;
      }
    }
    return true;
  }
}

export default new RentalService();
