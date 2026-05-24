const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    type: { type: String, enum: ["plant", "warehouse", "depot", "hub"], default: "warehouse" },
    address: { type: String },
    coords: {
      lat: { type: Number },
      lng: { type: Number },
    },
    contact: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
