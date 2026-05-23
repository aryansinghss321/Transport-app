const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const routeRoutes = require("./routes/route.routes");
const bookingRoutes = require("./routes/booking.routes");

const errorHandler = require("./middleware/error");

const app = express();

app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_2].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => res.send("API is running"));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bookings", bookingRoutes);

// last
app.use(errorHandler);

module.exports = app;