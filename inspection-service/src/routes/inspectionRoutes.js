import express from 'express';
import inspectionService from '../services/InspectionService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const inspection = await inspectionService.createInspection(req.body);
    res.status(201).json(inspection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:inspectionId', async (req, res) => {
  try {
    const inspection = await inspectionService.getInspectionById(req.params.inspectionId);
    res.json(inspection);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:inspectionId', async (req, res) => {
  try {
    const inspection = await inspectionService.updateInspection(req.params.inspectionId, req.body);
    res.json(inspection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:inspectionId/approve', async (req, res) => {
  try {
    const inspection = await inspectionService.approveInspection(
      req.params.inspectionId,
      req.body.owner_approval_notes
    );
    res.json(inspection);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/rental/:rentalRequestId/inspections', async (req, res) => {
  try {
    const inspections = await inspectionService.getInspectionsByRentalRequest(req.params.rentalRequestId);
    res.json(inspections);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/rental/:rentalRequestId/comparison', async (req, res) => {
  try {
    const comparison = await inspectionService.comparePickupAndReturn(req.params.rentalRequestId);
    res.json(comparison);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
