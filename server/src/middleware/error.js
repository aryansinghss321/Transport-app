const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Handle mongoose duplicate key error (e.g. unique email/plateNumber)
  if (err && err.code === 11000) {
    return res.status(400).json({
      message: `Duplicate value for: ${Object.keys(err.keyValue || {}).join(", ")}`,
    });
  }

  // Basic fallback
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;