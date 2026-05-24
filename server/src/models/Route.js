const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    distance: {
      type: Number,
      required: true,
    },

    estimatedDuration: {
      type: Number,
      required: true,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    dispatchWindow: {
      type: String,
      required: true,
      default: "08:00 AM - 06:00 PM",
    },

    routeType: {
      type: String,
      enum: [
        "factory_to_warehouse",
        "warehouse_to_distributor",
        "plant_transfer",
      ],
      default: "factory_to_warehouse",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);