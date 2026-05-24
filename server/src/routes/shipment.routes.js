const express = require("express");
const router = express.Router();

const {
  createShipment,
  getShipments,
  getShipment,
  updateShipment,
  deleteShipment,
} = require("../controllers/shipment.controller");

const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/role");

router.get("/", protect, getShipments);
router.post("/", protect, restrictTo("admin"), createShipment);
router.get("/:id", protect, getShipment);
router.put("/:id", protect, restrictTo("admin"), updateShipment);
router.delete("/:id", protect, restrictTo("admin"), deleteShipment);

module.exports = router;
