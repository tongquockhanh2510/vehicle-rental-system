import express from 'express';
import contractService from '../services/ContractService.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get('/:contractId', async (req, res) => {
  try {
    const contract = await contractService.getContractById(req.params.contractId);
    res.json(contract);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:contractId/complete', async (req, res) => {
  try {
    const contract = await contractService.completeContract(req.params.contractId);
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:contractId/cancel', async (req, res) => {
  try {
    const contract = await contractService.cancelContract(
      req.params.contractId,
      req.body.cancelled_by,
      req.body.reason
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
