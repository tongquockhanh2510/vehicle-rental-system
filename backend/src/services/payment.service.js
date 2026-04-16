const PaymentModel = require('../models/payment.model');
const BookingModel = require('../models/booking.model');
const NotificationModel = require('../models/notification.model');

const PaymentService = {
  async createPayment(bookingId, amount, method = 'credit_card') {
    // Check if booking exists
    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Create payment
    const payment = await PaymentModel.create({
      booking_id: bookingId,
      amount,
      method
    });

    return payment;
  },

  async processPayment(paymentId) {
    // Simulate payment processing
    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Mock: 90% success rate
    const success = Math.random() > 0.1;

    if (success) {
      await PaymentModel.updateStatus(paymentId, 'completed');
      await BookingModel.updateStatus(payment.booking_id, 'confirmed');

      const booking = await BookingModel.findById(payment.booking_id);
      await NotificationModel.create({
        user_id: booking.user_id,
        title: 'Payment Successful',
        message: `Your payment of $${payment.amount} has been processed successfully`,
        type: 'payment'
      });

      return { status: 'completed', message: 'Payment successful' };
    } else {
      await PaymentModel.updateStatus(paymentId, 'failed');
      return { status: 'failed', message: 'Payment failed. Please try again.' };
    }
  },

  async getPaymentByBooking(bookingId) {
    return await PaymentModel.findByBookingId(bookingId);
  },

  async getUserPayments(userId) {
    return await PaymentModel.getAll(userId);
  }
};

module.exports = PaymentService;
