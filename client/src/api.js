import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

/* =========================
   VEHICLES
========================= */

export const getVehicles = () => api.get("/vehicles");

export const createVehicle = (payload) =>
  api.post("/vehicles", payload);

export const updateVehicle = (id, payload) =>
  api.put(`/vehicles/${id}`, payload);

export const deleteVehicle = (id) =>
  api.delete(`/vehicles/${id}`);

/* =========================
   LOCATIONS
========================= */

export const getLocations = () =>
  api.get("/locations");

export const createLocation = (payload) =>
  api.post("/locations", payload);

/* =========================
   USERS
========================= */

export const getUsers = (params) =>
  api.get("/users", { params });

export const getDrivers = () =>
  getUsers({ role: "driver" });

export const createDriver = (payload) =>
  api.post("/users/drivers", payload);

/* =========================
   BOOKINGS
========================= */

export const getBookings = () =>
  api.get("/bookings");

export const getDriverBookings = () =>
  api.get("/bookings/driver/my");

export const assignBooking = (id, payload) =>
  api.put(`/bookings/${id}/assign`, payload);

export const updateBookingStatus = (id, status) =>
  api.put(`/bookings/${id}/status`, { status });

/* =========================
   SHIPMENTS
========================= */

export const getShipments = (params) =>
  api.get("/shipments", { params });

export const createShipment = (payload) =>
  api.post("/shipments", payload);

export const updateShipment = (id, payload) =>
  api.put(`/shipments/${id}`, payload);

/* =========================
   MAINTENANCE
========================= */

export const getMaintenance = (params) =>
  api.get("/maintenance", { params });

export const createMaintenance = (payload) =>
  api.post("/maintenance", payload);