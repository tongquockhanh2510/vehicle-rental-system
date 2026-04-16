const PaymentService = require('../services/payment.service');

const PaymentController = {
  async create(req, res, next) {
    try {
      const { booking_id, amount, method } = req.body;

      if (!booking_id || !amount) {
        return res.status(400).json({ error: 'booking_id and amount are required' });
      }

      const payment = await PaymentService.createPayment(booking_id, amount, method);
      res.status(201).json(payment);
    } catch (err) {
      if (err.message === 'Booking not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  },

  async process(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PaymentService.processPayment(id);
      res.json(result);
    } catch (err) {
      if (err.message === 'Payment not found') {
        return res.status(404).json({ error: err.message });
      }
      next(err);
    }
  },

  async getByBooking(req, res, next) {
    try {
      const { bookingId } = req.params;
      const payments = await PaymentService.getPaymentByBooking(bookingId);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  },

  async getMyPayments(req, res, next) {
    try {
      const payments = await PaymentService.getUserPayments(req.user.id);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = PaymentController;
