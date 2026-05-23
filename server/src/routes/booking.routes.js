const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  checkAvailability,
} = require("../controllers/booking.controller");

const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/role");

// availability check (must be BEFORE "/:id/..." routes if you add more later)
router.get("/availability", protect, checkAvailability);

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);

// admin
router.get("/", protect, restrictTo("admin"), getAllBookings);
router.put("/:id/status", protect, restrictTo("admin"), updateBookingStatus);

module.exports = router;