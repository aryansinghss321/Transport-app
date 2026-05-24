const errorHandler = (err, req, res, next) => {
  // Console log for debugging
  console.error(err);

  /*
    Duplicate key error
    Example:
    duplicate email
    duplicate vehicle number
  */
  if (err.code === 11000) {
    return res.status(400).json({
      message: `Duplicate value for: ${Object.keys(
        err.keyValue || {}
      ).join(", ")}`,
    });
  }

  /*
    Mongoose validation error
  */
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (val) => val.message
    );

    return res.status(400).json({
      message: messages.join(", "),
    });
  }

  /*
    JWT invalid token
  */
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  /*
    JWT expired token
  */
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  /*
    Default fallback
  */
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;