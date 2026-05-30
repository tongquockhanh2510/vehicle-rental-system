import { RentalRepository } from "../repositories/RentalRepository.js";
import { EventBus } from "../events/EventBus.js";
import axios from "axios";

const rentalRepository = new RentalRepository();
const eventBus = new EventBus();

function makeError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function buildVehicleLocationSnapshot(vehicle = {}) {
  const cityDistrict = [vehicle.district, vehicle.city]
    .filter(Boolean)
    .join(", ");
  const pickupLocation =
    vehicle.pickup_location ||
    cityDistrict ||
    vehicle.allowed_region ||
    "Chưa cập nhật";
  const returnLocation = vehicle.return_location || pickupLocation;

  return {
    pickup_location: pickupLocation,
    return_location: returnLocation,
    city: vehicle.city || "",
    district: vehicle.district || "",
    allowed_region: vehicle.allowed_region || "",
  };
}

export class RentalService {
  async createRentalRequest(renterId, rentalData) {
    if (!rentalData?.vehicle_id) {
      throw makeError("Missing required field: vehicle_id", 400);
    }

    let vehicle = null;
    try {
      const vehicleRes = await axios.get(
        `${process.env.VEHICLE_SERVICE_URL}/api/vehicles/${rentalData.vehicle_id}`,
      );
      vehicle = vehicleRes?.data?.data || vehicleRes?.data || null;
    } catch (error) {
      if (error?.response?.status === 404) {
        throw makeError("Vehicle not found", 404);
      }
      throw makeError(
        "Vehicle service unavailable, please try again later",
        503,
      );
    }

    if (!vehicle) {
      throw makeError("Vehicle not found", 404);
    }

    if (!vehicle.is_available) {
      throw makeError("Vehicle is not available", 400);
    }

    if (vehicle.owner_id.toString() === renterId) {
      throw makeError("Cannot rent your own vehicle", 400);
    }

    const startDateValue =
      rentalData.rental_start_date || rentalData.start_date;
    const endDateValue = rentalData.rental_end_date || rentalData.end_date;
    const startDate = new Date(startDateValue);
    const endDate = new Date(endDateValue);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw makeError("Invalid rental dates", 400);
    }

    const totalDays = Math.ceil(
      (endDate - startDate + 1) / (1000 * 60 * 60 * 24),
    );

    if (totalDays <= 0) {
      throw makeError("Rental end date must be after start date", 400);
    }

    const dailyRate = Number(vehicle.daily_rate || vehicle.price_per_day);

    if (isNaN(dailyRate)) {
      throw makeError("Invalid vehicle daily rate", 400);
    }

    const totalAmount = dailyRate * totalDays;
    const depositAmount = vehicle.deposit_amount;
    const platformFee = totalAmount * 0.04;

    const locationSnapshot = buildVehicleLocationSnapshot(vehicle);
    const rental = await rentalRepository.create({
      vehicle_id: rentalData.vehicle_id,
      rental_start_date: startDate,
      rental_end_date: endDate,
      notes: rentalData.notes || rentalData.note || "",
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
      images: vehicle.images,
      ...locationSnapshot,
    });

    await eventBus.publish("rental_request_created", {
      rentalId: rental._id,
      renterId: renterId,
      ownerId: rental.owner_id,
      vehicleId: rental.vehicle_id,
    });

    return rental;
  }

  async confirmRental(rentalId, ownerId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw new Error("Rental not found");
    }

    if (rental.owner_id.toString() !== ownerId) {
      throw new Error("Not authorized to confirm this rental");
    }

    const rental_updated = await rentalRepository.update(rentalId, {
      status: "CONFIRMED",
    });

    // Publish event
    await eventBus.publish("rental_confirmed", {
      rentalId: rental._id,
      renterId: rental.renter_id,
      ownerId: rental.owner_id,
      vehicleId: rental.vehicle_id,
      rentalStartDate: rental.rental_start_date,
      rentalEndDate: rental.rental_end_date,
      pickupLocation: rental.pickup_location,
      returnLocation: rental.return_location,
      dailyRate: rental.daily_rate,
      totalDays: rental.total_days,
      totalAmount: rental.total_amount,
      depositAmount: rental.deposit_amount,
      platformFee: rental.platform_fee,
      brand: rental.brand,
      model: rental.model,
      year: rental.year,
      license_plate: rental.license_plate,
      images: rental.images,
    });

    return rental_updated;
  }

  async rejectRental(rentalId, ownerId) {
    const rental = await rentalRepository.findById(rentalId);
    if (!rental) {
      throw new Error("Rental not found");
    }

    if (rental.owner_id.toString() !== ownerId) {
      throw new Error("Not authorized to reject this rental");
    }

    const rental_updated = await rentalRepository.update(rentalId, {
      status: "REJECTED",
    });

    // Publish event
    await eventBus.publish("rental_rejected", {
      rentalId: rental._id,
      renterId: rental.renter_id,
      ownerId: rental.owner_id,
    });

    return rental_updated;
  }

  async cancelRental(rentalId) {
    const rental = await rentalRepository.update(rentalId, {
      status: "CANCELLED",
    });

    // Publish event
    await eventBus.publish("rental_cancelled", {
      rentalId: rental._id,
      renterId: rental.renter_id,
      amount: rental.total_amount,
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

  async getAdminRentals(filters = {}, options = {}) {
    const query = {};

    if (filters.status) {
      query.status = String(filters.status).toUpperCase();
    }
    if (filters.owner_id) {
      query.owner_id = filters.owner_id;
    }
    if (filters.renter_id) {
      query.renter_id = filters.renter_id;
    }
    if (filters.vehicle_id) {
      query.vehicle_id = filters.vehicle_id;
    }

    return await rentalRepository.findAll(query, options);
  }

  async checkAvailability(vehicleId, startDate, endDate) {
    const conflicts = await rentalRepository.findByVehicleId(vehicleId);

    for (const rental of conflicts) {
      if (rental.status !== "REJECTED" && rental.status !== "CANCELLED") {
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
