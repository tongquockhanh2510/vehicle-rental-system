import { RentalRepository } from '../repositories/RentalRepository.js';
import { EventBus } from '../events/EventBus.js';

const rentalRepository = new RentalRepository();
const eventBus = new EventBus();

export class RentalService {
  async createRentalRequest(rentalData) {
    const totalDays = Math.ceil((new Date(rentalData.rental_end_date) - new Date(rentalData.rental_start_date)) / (1000 * 60 * 60 * 24));
    const totalAmount = rentalData.daily_rate * totalDays;
    const depositAmount = totalAmount * (rentalData.deposit_percentage / 100);
    const platformFee = totalAmount * 0.04;

    const rental = await rentalRepository.create({
      ...rentalData,
      total_days: totalDays,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      platform_fee: platformFee
    });

    // Publish event
    await eventBus.publish('rental_request_created', {
      rentalId: rental._id,
      renterId: rental.renter_id,
      ownerId: rental.owner_id,
      vehicleId: rental.vehicle_id
    });

    return rental;
  }

  async confirmRental(rentalId) {
    const rental = await rentalRepository.update(rentalId, { status: 'CONFIRMED' });

    // Publish event
    await eventBus.publish('rental_confirmed', {
      rentalId: rental._id,
      renterId: rental.renter_id,
      ownerId: rental.owner_id
    });

    return rental;
  }

  async rejectRental(rentalId, reason) {
    const rental = await rentalRepository.update(rentalId, { 
      status: 'REJECTED',
      rejection_reason: reason 
    });

    // Publish event
    await eventBus.publish('rental_rejected', {
      rentalId: rental._id,
      renterId: rental.renter_id,
      reason
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
