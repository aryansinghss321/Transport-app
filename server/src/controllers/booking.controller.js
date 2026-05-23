const Booking = require("../models/Booking");
const Route = require("../models/Route");

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { routeId, seats, travelDate } = req.body;

    if (!routeId || !seats || !travelDate) {
      return res
        .status(400)
        .json({ message: "routeId, seats, and travelDate are required" });
    }

    if (Number(seats) < 1) {
      return res.status(400).json({ message: "seats must be at least 1" });
    }

    const route = await Route.findById(routeId).populate("vehicleId", "capacity fare");
    if (!route) return res.status(404).json({ message: "Route not found" });

    const capacity = route.vehicleId?.capacity || 0;

    // Use model static (must exist in Booking model)
    const booked = await Booking.bookedSeats(routeId, travelDate);
    const available = capacity - booked;

    if (Number(seats) > available) {
      return res.status(400).json({
        message: `Only ${available} seat(s) available on this date`,
        available,
      });
    }

    const totalFare = route.fare * Number(seats);

    const booking = await Booking.create({
      userId: req.user._id,
      routeId,
      seats: Number(seats),
      travelDate,
      totalFare,
    });

    await booking.populate("routeId", "source destination fare departureTime");

    // returning booking directly keeps your existing UI compatible
    res.status(201).json(booking);
    // If you prefer extra info, you can return:
    // res.status(201).json({ booking, availableAfter: available - Number(seats) });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("routeId", "source destination fare departureTime")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings (admin)
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email role")
      .populate("routeId", "source destination fare departureTime")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/status (admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/availability?routeId=...&travelDate=YYYY-MM-DD
const checkAvailability = async (req, res, next) => {
  try {
    const { routeId, travelDate } = req.query;

    if (!routeId || !travelDate) {
      return res.status(400).json({ message: "routeId and travelDate required" });
    }

    const route = await Route.findById(routeId).populate("vehicleId", "capacity");
    if (!route) return res.status(404).json({ message: "Route not found" });

    const capacity = route.vehicleId?.capacity || 0;
    const booked = await Booking.bookedSeats(routeId, travelDate);
    const available = capacity - booked;

    res.json({ capacity, booked, available });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  checkAvailability,
};