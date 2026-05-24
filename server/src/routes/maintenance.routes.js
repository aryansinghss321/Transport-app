const express = require("express");
const router = express.Router();

const {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
} = require("../controllers/maintenance.controller");

const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/role");

router.get("/", protect, getMaintenance);
router.post("/", protect, restrictTo("admin"), createMaintenance);
router.get("/:id", protect, getMaintenanceById);
router.put("/:id", protect, restrictTo("admin"), updateMaintenance);
router.delete("/:id", protect, restrictTo("admin"), deleteMaintenance);

module.exports = router;
