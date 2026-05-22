import express from 'express';
import disputeService from '../services/DisputeService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const dispute = await disputeService.createDispute(req.body);
    res.status(201).json(dispute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:disputeId', async (req, res) => {
  try {
    const dispute = await disputeService.getDisputeById(req.params.disputeId);
    res.json(dispute);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:disputeId/approve', async (req, res) => {
  try {
    const dispute = await disputeService.approveDispute(
      req.params.disputeId,
      req.body.admin_id,
      req.body.decision_amount,
      req.body.admin_notes
    );
    res.json(dispute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:disputeId/reject', async (req, res) => {
  try {
    const dispute = await disputeService.rejectDispute(
      req.params.disputeId,
      req.body.admin_id,
      req.body.admin_notes
    );
    res.json(dispute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:disputeId/resolve', async (req, res) => {
  try {
    const dispute = await disputeService.resolveDispute(req.params.disputeId);
    res.json(dispute);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/pending/list', async (req, res) => {
  try {
    const disputes = await disputeService.getPendingDisputes();
    res.json(disputes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
