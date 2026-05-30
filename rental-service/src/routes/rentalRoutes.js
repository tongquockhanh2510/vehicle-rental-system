import express from "express";
import rentalService from "../services/RentalService.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/request", authenticateToken, async (req, res) => {
  try {
    const rentalRequest = await rentalService.createRentalRequest(
      req.userId,
      req.body,
    );
    res.status(201).json({
      success: true,
      message: "Gửi yêu cầu thuê thành công",
      data: rentalRequest,
    });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ error: error.message || "Failed to create rental request" });
  }
});

router.get("/renter/my-rentals", authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getRenterRentals(req.userId);
    res.json(rentals);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/my-requests", authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getRenterRentals(req.userId);
    res.json(rentals);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/owner/my-rentals", authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getOwnerRentals(req.userId);
    res.json(rentals);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.put("/:rentalId/cancel", authenticateToken, async (req, res) => {
  try {
    const rental = await rentalService.cancelRental(req.params.rentalId);
    res.json(rental);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/:rentalId", authenticateToken, async (req, res) => {
  try {
    const rental = await rentalService.getRentalById(req.params.rentalId);
    res.json(rental);
  } catch (error) {
    res.status(error.status || 404).json({ error: error.message });
  }
});

router.put("/:rentalId/confirm", authenticateToken, async (req, res) => {
  try {
    const rental = await rentalService.confirmRental(
      req.params.rentalId,
      req.userId,
    );
    res.json(rental);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.put("/:rentalId/reject", authenticateToken, async (req, res) => {
  try {
    const rental = await rentalService.rejectRental(
      req.params.rentalId,
      req.userId,
    );
    res.json(rental);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post("/check-availability", authenticateToken, async (req, res) => {
  try {
    const startDate = req.body.start_date || req.body.rental_start_date;
    const endDate = req.body.end_date || req.body.rental_end_date;
    const available = await rentalService.checkAvailability(
      req.body.vehicle_id,
      startDate,
      endDate,
    );
    res.json({ available });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

export default router;
