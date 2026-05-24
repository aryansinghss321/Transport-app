const express = require("express");
const router = express.Router();

const { getUsers, createDriver } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth");
const { restrictTo } = require("../middleware/role");

router.get("/", protect, getUsers);
router.post("/drivers", protect, restrictTo("admin"), createDriver);

module.exports = router;
