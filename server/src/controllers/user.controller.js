const User = require("../models/User");

const getUsers = async (req, res, next) => {
  try {
    const q = {};
    if (req.query.role) q.role = req.query.role;
    const users = await User.find(q).select("name email role phone").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createDriver = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const driver = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "driver",
    });

    res.status(201).json({
      id: driver._id,
      name: driver.name,
      email: driver.email,
      role: driver.role,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createDriver };
