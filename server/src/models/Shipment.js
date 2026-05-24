const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
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

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    origin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    weightKg: {
      type: Number,
      required: true,
    },

    volumeM3: {
      type: Number,
    },

    cargoType: {
      type: String,
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

    scheduledAt: {
      type: Date,
    },

    estimatedArrival: {
      type: Date,
    },

    startedAt: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    podUrl: {
      type: String,
    },

    events: [
      {
        ts: {
          type: Date,
          default: Date.now,
        },

        type: {
          type: String,
        },

        note: {
          type: String,
        },

        location: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Location",
        },
      },
    ],

    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);