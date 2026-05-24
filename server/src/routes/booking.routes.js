const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getDriverBookings,
  updateBookingStatus,
  assignBooking,
  deleteBooking,
  checkAvailability,
} = require("../controllers/booking.controller");

const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/role");

// availability check (must be BEFORE "/:id/..." routes if you add more later)
router.get("/availability", protect, checkAvailability);

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/driver/my", protect, getDriverBookings);

// admin
router.get("/", protect, restrictTo("admin"), getAllBookings);
router.put("/:id/status", protect, restrictTo("admin", "driver"), updateBookingStatus);
router.put("/:id/assign", protect, restrictTo("admin"), assignBooking);
// allow owner or admin to delete their booking
router.delete("/:id", protect, deleteBooking);

module.exports = router;