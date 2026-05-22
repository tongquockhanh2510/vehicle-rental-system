import express from 'express';
import paymentService from '../services/PaymentService.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:paymentId', async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.paymentId);
    res.json(payment);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:paymentId/process', async (req, res) => {
  try {
    const payment = await paymentService.processPayment(
      req.params.paymentId,
      req.body.transaction_id
    );
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:paymentId/fail', async (req, res) => {
  try {
    const payment = await paymentService.failPayment(req.params.paymentId, req.body.reason);
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:paymentId/refund', async (req, res) => {
  try {
    const refund = await paymentService.refundPayment(req.params.paymentId);
    res.json(refund);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/renter/my-payments', authenticateToken, async (req, res) => {
  try {
    const payments = await paymentService.getRenterPayments(req.userId);
    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/owner/my-payments', authenticateToken, async (req, res) => {
  try {
    const payments = await paymentService.getOwnerPayments(req.userId);
    res.json(payments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
