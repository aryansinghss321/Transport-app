const express = require("express");
const router = express.Router();

const {
  createVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicle.controller");

const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/role");

router.get("/", protect, getVehicles);
router.post("/", protect, restrictTo("admin"), createVehicle);
router.put("/:id", protect, restrictTo("admin"), updateVehicle);
router.delete("/:id", protect, restrictTo("admin"), deleteVehicle);

module.exports = router;