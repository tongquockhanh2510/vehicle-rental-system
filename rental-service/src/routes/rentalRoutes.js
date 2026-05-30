import express from "express";
import rentalService from "../services/RentalService.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

function isAdmin(req) {
  return String(req.userRole || "").toUpperCase() === "ADMIN";
}

router.post("/request", authenticateToken, async (req, res) => {
  try {
    const rentalRequest = await rentalService.createRentalRequest(
      req.userId,
      req.body,
    );
    return res.status(201).json({
      success: true,
      message: "Gửi yêu cầu thuê thành công",
      data: rentalRequest,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Không thể tạo yêu cầu thuê",
      error: error.message || "Failed to create rental request",
    });
  }
});

router.get("/renter/my-rentals", authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getRenterRentals(req.userId);
    return res.json(rentals);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/my-requests", authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getRenterRentals(req.userId);
    return res.json(rentals);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/owner/my-rentals", authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getOwnerRentals(req.userId);
    return res.json(rentals);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/owner-requests", authenticateToken, async (req, res) => {
  try {
    const rentals = await rentalService.getOwnerRentals(req.userId);
    return res.json(rentals);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/admin/list", authenticateToken, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const rentals = await rentalService.getAdminRentals(req.query || {}, {
      limit: req.query.limit || 0,
    });
    return res.json({
      success: true,
      data: rentals,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

router.put("/:rentalId/cancel", authenticateToken, async (req, res) => {
  try {
    const rental = await rentalService.cancelRental(req.params.rentalId);
    return res.json(rental);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/:rentalId", authenticateToken, async (req, res) => {
  try {
    const rental = await rentalService.getRentalById(req.params.rentalId);
    return res.json(rental);
  } catch (error) {
    return res.status(error.status || 404).json({ error: error.message });
  }
});

router.put("/:rentalId/confirm", authenticateToken, async (req, res) => {
  try {
    const rental = await rentalService.confirmRental(req.params.rentalId, req.userId);
    return res.json(rental);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

router.put("/:rentalId/reject", authenticateToken, async (req, res) => {
  try {
    const rental = await rentalService.rejectRental(req.params.rentalId, req.userId);
    return res.json(rental);
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
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
    return res.json({ available });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

export default router;
