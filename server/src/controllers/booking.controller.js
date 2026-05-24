const Booking = require("../models/Booking");
const Route = require("../models/Route");

// CREATE TRANSPORT REQUEST
// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const {
      routeId,
      shipmentType,
      productType,
      batchNumber,
      loadWeightKg,
      priority,
      dispatchDate,
      assignedVehicle,
      assignedDriver,
      notes,
    } = req.body;

    if (!routeId || !productType || !loadWeightKg || !dispatchDate) {
      return res.status(400).json({
        message:
          "routeId, productType, loadWeightKg and dispatchDate are required",
      });
    }

    const route = await Route.findById(routeId);

    if (!route) {
      return res.status(404).json({
        message: "Logistics route not found",
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      routeId,
      shipmentType,
      productType,
      batchNumber,
      loadWeightKg,
      priority,
      dispatchDate,
      assignedVehicle,
      assignedDriver,
      notes,
      status: "pending",
    });

    await booking.populate(
      "routeId",
      "source destination distance estimatedDuration dispatchWindow"
    );

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// GET MY TRANSPORT REQUESTS
// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
    })
      .populate(
        "routeId",
        "source destination distance estimatedDuration dispatchWindow"
      )
      .populate("assignedVehicle", "name plateNumber")
      .populate("assignedDriver", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// ADMIN - GET ALL TRANSPORT REQUESTS
// GET /api/bookings
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email role")
      .populate(
        "routeId",
        "source destination distance estimatedDuration dispatchWindow"
      )
      .populate("assignedVehicle", "name plateNumber")
      .populate("assignedDriver", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// DRIVER - GET ASSIGNED TRANSPORT REQUESTS
// GET /api/bookings/driver/my
const getDriverBookings = async (req, res, next) => {
  try {
    const q = req.user.role === "driver"
      ? { assignedDriver: req.user._id }
      : { assignedDriver: { $exists: true, $ne: null } };

    const bookings = await Booking.find(q)
      .populate(
        "routeId",
        "source destination distance estimatedDuration dispatchWindow"
      )
      .populate("assignedVehicle", "name plateNumber")
      .populate("assignedDriver", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// UPDATE TRANSPORT STATUS
// PUT /api/bookings/:id/status
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "scheduled",
      "loading",
      "in_transit",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid shipment status",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Transport request not found",
      });
    }

    if (req.user.role === "driver") {
      if (!booking.assignedDriver || String(booking.assignedDriver) !== String(req.user._id)) {
        return res.status(403).json({
          message: "You can only update your assigned transport requests",
        });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    booking.status = status;
    await booking.save();

    await booking.populate(
      "routeId",
      "source destination distance estimatedDuration dispatchWindow"
    );
    await booking.populate("assignedVehicle", "name plateNumber");
    await booking.populate("assignedDriver", "name email");

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// ADMIN - ASSIGN VEHICLE/DRIVER TO TRANSPORT REQUEST
// PUT /api/bookings/:id/assign
const assignBooking = async (req, res, next) => {
  try {
    const { assignedVehicle, assignedDriver } = req.body;

    const update = {};
    if (assignedVehicle !== undefined) update.assignedVehicle = assignedVehicle || null;
    if (assignedDriver !== undefined) update.assignedDriver = assignedDriver || null;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    )
      .populate(
        "routeId",
        "source destination distance estimatedDuration dispatchWindow"
      )
      .populate("assignedVehicle", "name plateNumber")
      .populate("assignedDriver", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Transport request not found" });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// OPTIONAL: CAPACITY CHECK
// GET /api/bookings/availability?routeId=...
const checkAvailability = async (req, res, next) => {
  try {
    const { routeId } = req.query;

    if (!routeId) {
      return res.status(400).json({
        message: "routeId required",
      });
    }

    const route = await Route.findById(routeId).populate(
      "vehicleId",
      "capacity loadCapacityKg"
    );

    if (!route) {
      return res.status(404).json({
        message: "Logistics route not found",
      });
    }

    res.json({
      routeId,
      vehicleCapacity:
        route.vehicleId?.loadCapacityKg ||
        route.vehicleId?.capacity ||
        0,
      route,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE TRANSPORT REQUEST (owner or admin)
// DELETE /api/bookings/:id
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Transport request not found" });

    if (String(booking.userId) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Transport request deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getDriverBookings,
  updateBookingStatus,
  assignBooking,
  checkAvailability,
  deleteBooking,
};