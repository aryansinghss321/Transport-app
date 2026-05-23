const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    distance: { type: Number, required: true }, // km
    duration: { type: Number, required: true }, // minutes
    fare: { type: Number, required: true }, // INR
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    departureTime: { type: String, required: true }, // "08:00"
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);