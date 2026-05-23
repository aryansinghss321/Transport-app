// server/src/routes/route.routes.js
const express = require("express");
const router = express.Router();

const {
  createRoute,
  getRoutes,
  getAllRoutes,
  updateRoute,
  deleteRoute,
} = require("../controllers/route.controller");

const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/role");

router.get("/", protect, getRoutes); // active only (users)
router.get("/all", protect, restrictTo("admin"), getAllRoutes); // all (admin)
router.post("/", protect, restrictTo("admin"), createRoute);
router.put("/:id", protect, restrictTo("admin"), updateRoute);
router.delete("/:id", protect, restrictTo("admin"), deleteRoute);

module.exports = router;