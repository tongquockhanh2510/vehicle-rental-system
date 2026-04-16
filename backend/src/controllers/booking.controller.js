const BookingService = require('../services/booking.service');

const BookingController = {
  async create(req, res, next) {
    try {
      const { vehicle_id, start_date, end_date } = req.body;

      if (!vehicle_id || !start_date || !end_date) {
        return res.status(400).json({ error: 'vehicle_id, start_date and end_date are required' });
      }

      const booking = await BookingService.createBooking(
        req.user.id,
        vehicle_id,
        start_date,
        end_date
      );

      res.status(201).json(booking);
    } catch (err) {
      if (err.message === 'Vehicle not found' || err.message === 'Vehicle is not available') {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  },

  async getAll(req, res, next) {
    try {
      const bookings = await BookingService.getBookings(req.user.id, req.user.role);
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await BookingService.getBookingById(id);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Customers can only view their own bookings
      if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      res.json(booking);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const booking = await BookingService.updateBookingStatus(id, status, req.user.id, req.user.role);
      res.json(booking);
    } catch (err) {
      if (err.message === 'Booking not found' || err.message === 'Not authorized') {
        return res.status(403).json({ error: err.message });
      }
      next(err);
    }
  }
};

module.exports = BookingController;
