const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const routeRoutes = require("./routes/route.routes");
const bookingRoutes = require("./routes/booking.routes");
const locationRoutes = require("./routes/location.routes");
const shipmentRoutes = require("./routes/shipment.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const userRoutes = require("./routes/user.routes");

const errorHandler = require("./middleware/error");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => res.send("API is running"));

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/users", userRoutes);

// last
app.use(errorHandler);

module.exports = app;