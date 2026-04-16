const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', VehicleController.getAll);
router.get('/my-vehicles', authenticate, authorize('owner', 'admin'), VehicleController.getMyVehicles);
router.get('/:id', VehicleController.getById);
router.post('/', authenticate, authorize('owner', 'admin'), VehicleController.create);
router.put('/:id', authenticate, authorize('owner', 'admin'), VehicleController.update);
router.delete('/:id', authenticate, authorize('owner', 'admin'), VehicleController.delete);

module.exports = router;
