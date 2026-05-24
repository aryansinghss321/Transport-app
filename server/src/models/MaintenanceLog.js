const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    date: { type: Date, default: Date.now },
    type: { type: String },
    description: { type: String },
    cost: { type: Number },
    performedBy: { type: String },
    partsReplaced: [{ name: String, partNumber: String, cost: Number }],
    nextDueDate: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceLog", maintenanceSchema);
