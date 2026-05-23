const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    routeId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Route',   required: true },
    seats:      { type: Number, required: true, min: 1 },
    travelDate: { type: Date,   required: true },
    totalFare:  { type: Number, required: true },
    status:     { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  },
  { timestamps: true }
);

// Returns total booked seats for a route on a date (excludes cancelled)
bookingSchema.statics.bookedSeats = async function (routeId, travelDate) {
  const start = new Date(travelDate); start.setHours(0, 0, 0, 0);
  const end   = new Date(travelDate); end.setHours(23, 59, 59, 999);
  const result = await this.aggregate([
    { $match: { routeId: new mongoose.Types.ObjectId(routeId), travelDate: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$seats' } } },
  ]);
  return result[0]?.total || 0;
};

module.exports = mongoose.model('Booking', bookingSchema);