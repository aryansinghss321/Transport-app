const MaintenanceLog = require("../models/MaintenanceLog");

const createMaintenance = async (req, res, next) => {
  try {
    const rec = await MaintenanceLog.create(req.body);
    res.status(201).json(rec);
  } catch (err) {
    next(err);
  }
};

const getMaintenance = async (req, res, next) => {
  try {
    const q = {};
    if (req.query.vehicle) q.vehicle = req.query.vehicle;
    const items = await MaintenanceLog.find(q).populate("vehicle").sort({ date: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const getMaintenanceById = async (req, res, next) => {
  try {
    const item = await MaintenanceLog.findById(req.params.id).populate("vehicle");
    if (!item) return res.status(404).json({ message: "Record not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const updateMaintenance = async (req, res, next) => {
  try {
    const item = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Record not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const deleteMaintenance = async (req, res, next) => {
  try {
    const item = await MaintenanceLog.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createMaintenance,
  getMaintenance,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
};
