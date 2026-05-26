import { RentalRepository } from '../repositories/RentalRepository.js';
import { EventBus } from '../events/EventBus.js';
import axios from 'axios';

const rentalRepository = new RentalRepository();
const eventBus = new EventBus();

export class RentalService {
  async createRentalRequest(rentalData) {
    const vehicleResponse = await axios.get(
      `${process.env.VEHICLE_SERVICE_URL}/api/vehicles/${rentalData.vehicle_id}`
    );

    const vehicle = vehicleResponse.data;

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const startDate = new Date(rentalData.rental_start_date);
    const endDate = new Date(rentalData.rental_end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid rental dates');
    }

    const totalDays = Math.ceil(
      (endDate - startDate + 1) / (1000 * 60 * 60 * 24)
    );

    if (totalDays <= 0) {
      throw new Error('Rental end date must be after start date');
    }

    const dailyRate = Number(vehicle.daily_rate || vehicle.price_per_day);
    const depositPercentage = Number(vehicle.deposit_percentage || rentalData.deposit_percentage || 0);

    if (isNaN(dailyRate)) {
      throw new Error('Invalid vehicle daily rate');
    }

    if (isNaN(depositPercentage)) {
      throw new Error('Invalid deposit percentage');
    }

    const totalAmount = dailyRate * totalDays;
    const depositAmount = totalAmount * (depositPercentage / 100);
    const platformFee = totalAmount * 0.04;

    const rental = await rentalRepository.create({
      ...rentalData,
      owner_id: vehicle.owner_id,
      daily_rate: dailyRate,
      deposit_percentage: depositPercentage,
      total_days: totalDays,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      platform_fee: platformFee
    });

    await eventBus.publish('rental_request_created', {
      rentalId: rental._id,
      renterId: rental.renter_id,
      ownerId: rental.owner_id,
      vehicleId: rental.vehicle_id
    });

    return rental;
  }

  async confirmRental(rentalId, ownerId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw new Error('Rental not found');
    }
    console.log('ownerId:', ownerId, 'rental owner_id:', rental.owner_id);
    if (rental.owner_id.toString() !== ownerId) {
      throw new Error('Not authorized to confirm this rental');
    }

    const rental_updated = await rentalRepository.update(rentalId, { status: 'CONFIRMED' });

    // Publish event
    await eventBus.publish('rental_confirmed', {
      rentalId: rental._id,
      renterId: rental.renter_id,
      ownerId: rental.owner_id
    });

    return rental_updated;
  }

  async rejectRental(rentalId, userId) {
    const rental = await rentalRepository.update(rentalId, {
      status: 'REJECTED'
    });

    // Publish event
    await eventBus.publish('rental_rejected', {
      rentalId: rental._id,
      renterId: rental.renter_id
    });

    return rental;
  }

  async cancelRental(rentalId) {
    const rental = await rentalRepository.update(rentalId, { status: 'CANCELLED' });

    // Publish event
    await eventBus.publish('rental_cancelled', {
      rentalId: rental._id,
      renterId: rental.renter_id,
      amount: rental.total_amount
    });

    return rental;
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

  async checkAvailability(vehicleId, startDate, endDate) {
    const conflicts = await rentalRepository.findByVehicleId(vehicleId);

    for (const rental of conflicts) {
      if (rental.status !== 'REJECTED' && rental.status !== 'CANCELLED') {
        const rentalStart = new Date(rental.rental_start_date);
        const rentalEnd = new Date(rental.rental_end_date);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);

        if (!(newEnd <= rentalStart || newStart >= rentalEnd)) {
          return false;
        }
      }
    }
    return true;
  }
}

export default new RentalService();
