const Location = require("../models/Location");

const createLocation = async (req, res, next) => {
  try {
    const loc = await Location.create(req.body);
    res.status(201).json(loc);
  } catch (err) {
    next(err);
  }
};

const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    next(err);
  }
};

const getLocation = async (req, res, next) => {
  try {
    const loc = await Location.findById(req.params.id);
    if (!loc) return res.status(404).json({ message: "Location not found" });
    res.json(loc);
  } catch (err) {
    next(err);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const loc = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!loc) return res.status(404).json({ message: "Location not found" });
    res.json(loc);
  } catch (err) {
    next(err);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const loc = await Location.findByIdAndDelete(req.params.id);
    if (!loc) return res.status(404).json({ message: "Location not found" });
    res.json({ message: "Location deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
};
