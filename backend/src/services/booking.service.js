const BookingModel = require('../models/booking.model');
const VehicleModel = require('../models/vehicle.model');
const NotificationModel = require('../models/notification.model');

const BookingService = {
  async createBooking(userId, vehicleId, startDate, endDate) {
    // Get vehicle info
    const vehicle = await VehicleModel.findById(vehicleId);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    if (vehicle.status !== 'available') {
      throw new Error('Vehicle is not available');
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    const totalPrice = days * parseFloat(vehicle.price_per_day);

    // Create booking
    const booking = await BookingModel.create({
      user_id: userId,
      vehicle_id: vehicleId,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice
    });

    // Send notification to vehicle owner
    await NotificationModel.create({
      user_id: vehicle.owner_id,
      title: 'New Booking Request',
      message: `You have a new booking request for ${vehicle.name}`,
      type: 'booking'
    });

    return booking;
  },

  async getBookings(userId = null, role = 'customer') {
    return await BookingModel.findAll(userId, role);
  },

  async getBookingById(id) {
    return await BookingModel.findById(id);
  },

  async updateBookingStatus(bookingId, status, userId = null, userRole = 'customer') {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check permissions
    if (userRole === 'customer' && booking.user_id !== userId) {
      throw new Error('Not authorized');
    }

    const updatedBooking = await BookingModel.updateStatus(bookingId, status);

    // Notify customer
    await NotificationModel.create({
      user_id: booking.user_id,
      title: 'Booking Status Updated',
      message: `Your booking for ${booking.vehicle_name} has been ${status}`,
      type: 'booking'
    });

    return updatedBooking;
  }
};

module.exports = BookingService;
