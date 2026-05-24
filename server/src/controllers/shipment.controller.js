const Shipment = require("../models/Shipment");

// CREATE SHIPMENT
const createShipment = async (req, res, next) => {
  try {
    if (!req.body.reference) {
      req.body.reference = `SHP-${Date.now()}`;
    }

    const shipment = await Shipment.create(req.body);

    res.status(201).json(shipment);
  } catch (err) {
    next(err);
  }
};

// GET SHIPMENTS
const getShipments = async (req, res, next) => {
  try {
    const q = {};

    if (req.query.status) {
      q.status = req.query.status;
    }

    const shipments = await Shipment.find(q)
      .populate("origin destination vehicle driver")
      .sort({ createdAt: -1 });

    res.json(shipments);
  } catch (err) {
    next(err);
  }
};

// GET SINGLE SHIPMENT
const getShipment = async (req, res, next) => {
  try {
    const shipment = await Shipment.findById(
      req.params.id
    ).populate(
      "origin destination vehicle driver"
    );

    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found",
      });
    }

    res.json(shipment);
  } catch (err) {
    next(err);
  }
};

// UPDATE SHIPMENT
const updateShipment = async (req, res, next) => {
  try {
    const shipment =
      await Shipment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found",
      });
    }

    res.json(shipment);
  } catch (err) {
    next(err);
  }
};

// DELETE SHIPMENT
const deleteShipment = async (req, res, next) => {
  try {
    const shipment =
      await Shipment.findByIdAndDelete(
        req.params.id
      );

    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found",
      });
    }

    res.json({
      message:
        "Shipment deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipment,
  updateShipment,
  deleteShipment,
};