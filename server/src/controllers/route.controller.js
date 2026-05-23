// server/src/controllers/route.controller.js
const Route = require("../models/Route");

const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (err) {
    next(err);
  }
};

const getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({ status: "active" })
      .populate("vehicleId", "name type capacity plateNumber")
      .sort({ createdAt: -1 });

    res.json(routes);
  } catch (err) {
    next(err);
  }
};

const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find()
      .populate("vehicleId", "name type capacity plateNumber")
      .sort({ createdAt: -1 });

    res.json(routes);
  } catch (err) {
    next(err);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  } catch (err) {
    next(err);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json({ message: "Route deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRoute,
  getRoutes,
  getAllRoutes,
  updateRoute,
  deleteRoute,
};