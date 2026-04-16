const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, BookingController.getAll);
router.get('/:id', authenticate, BookingController.getById);
router.post('/', authenticate, BookingController.create);
router.put('/:id/status', authenticate, BookingController.updateStatus);

module.exports = router;
