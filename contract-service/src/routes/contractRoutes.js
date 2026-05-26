import express from 'express';
import contractService from '../services/ContractService.js';
import { authenticateToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/:contractId', authenticateToken, async (req, res) => {
  try {
    const contract = await contractService.getContractById(req.params.contractId);
    res.json(contract);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:contractId/pickup', authenticateToken, upload.fields([{ name: 'pickup_images', maxCount: 10 }]), async (req, res) => {
  try {
    const contract = await contractService.pickupVehicle(req.params.contractId, req.files.pickup_images, req.body, req.headers.authorization);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:contractId/return', authenticateToken, upload.fields([{ name: 'return_images', maxCount: 10 }]), async (req, res) => {
  try {
    const contract = await contractService.returnVehicle(req.params.contractId, req.files.return_images, req.body, req.headers.authorization);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:contractId/cancel', authenticateToken, async (req, res) => {
  try {
    const contract = await contractService.cancelContract(
      req.params.contractId,
      req.userId,
      req.body
    );
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/renter/my-contracts', authenticateToken, async (req, res) => {
  try {
    const contracts = await contractService.getRenterContracts(req.userId);
    res.json(contracts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/owner/my-contracts', authenticateToken, async (req, res) => {
  try {
    const contracts = await contractService.getOwnerContracts(req.userId);
    res.json(contracts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
