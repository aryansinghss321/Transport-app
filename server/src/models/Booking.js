const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    shipmentType: {
      type: String,
      enum: ["raw_material", "finished_goods", "equipment"],
      default: "finished_goods",
    },

    productType: {
      type: String,
      required: true,
      trim: true,
    },

    batchNumber: {
      type: String,
      trim: true,
    },

    loadWeightKg: {
      type: Number,
      required: true,
      min: 1,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dispatchDate: {
      type: Date,
      required: true,
    },

    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "scheduled",
        "loading",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);