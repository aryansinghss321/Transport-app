const Vehicle = require("../models/Vehicle");

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate("assignedDriver", "name email phone role").sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("assignedDriver", "name email phone role");
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
};