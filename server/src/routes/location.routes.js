const express = require("express");
const router = express.Router();

const {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/location.controller");

const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/role");

router.get("/", protect, getLocations);
router.post("/", protect, restrictTo("admin"), createLocation);
router.get("/:id", protect, getLocation);
router.put("/:id", protect, restrictTo("admin"), updateLocation);
router.delete("/:id", protect, restrictTo("admin"), deleteLocation);

module.exports = router;
