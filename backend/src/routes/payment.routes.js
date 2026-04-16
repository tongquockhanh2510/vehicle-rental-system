const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/my-payments', authenticate, PaymentController.getMyPayments);
router.get('/:bookingId', authenticate, PaymentController.getByBooking);
router.post('/', authenticate, PaymentController.create);
router.post('/:id/process', authenticate, PaymentController.process);

module.exports = router;
