const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["bus", "train", "van", "car", "truck"], required: true },
    plateNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    capacity: { type: Number, required: true },
    // manufacturing/transport fields
    loadCapacityKg: { type: Number },
    cargoType: { type: String },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    telematicsId: { type: String },
    status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);