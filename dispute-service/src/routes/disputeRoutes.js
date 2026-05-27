import express from 'express';
import disputeService from '../services/DisputeService.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const dispute = await disputeService.createDispute(req.body, req.userId, req.headers.authorization);
    res.status(201).json(dispute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:disputeId', authenticateToken, async (req, res) => {
  try {
    const dispute = await disputeService.getDisputeById(req.params.disputeId);
    res.json(dispute);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:disputeId/approve', authenticateToken, async (req, res) => {
  try {
    const dispute = await disputeService.approveDispute(
      req.params.disputeId,
      req.userId,
      req.body
    );
    res.json(dispute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:disputeId/reject', authenticateToken, async (req, res) => {
  try {
    const dispute = await disputeService.rejectDispute(
      req.params.disputeId,
      req.userId,
      req.body
    );
    res.json(dispute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/pending/list', authenticateToken, async (req, res) => {
  try {
    const disputes = await disputeService.getPendingDisputes();
    res.json(disputes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/approved/list', authenticateToken, async (req, res) => {
  try {
    const disputes = await disputeService.getApprovedDisputes();
    res.json(disputes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/rejected/list', authenticateToken, async (req, res) => {
  try {
    const disputes = await disputeService.getRejectedDisputes();
    res.json(disputes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
