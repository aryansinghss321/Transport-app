import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

import VehicleRoad from "./components/VehicleRoad";
import SmokeEffect from "./components/SmokeEffect";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import BrowseRoutes from "./pages/BrowseRoutes";
import MyBookings from "./pages/MyBookings";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminFleet from "./pages/admin/AdminFleet";
import AdminShipments from "./pages/admin/AdminShipments";
import AdminRoutes from "./pages/admin/AdminRoutes";
import AdminBookings from "./pages/admin/AdminBookings";
import TransportBoard from "./pages/admin/TransportBoard";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverShipment from "./pages/driver/DriverShipment";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        {/* Visible on every page */}
        <VehicleRoad />
        <SmokeEffect />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routes"
            element={
              <ProtectedRoute>
                <BrowseRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/shipments/:id"
            element={
              <ProtectedRoute>
                <DriverShipment />
              </ProtectedRoute>
            }
          />
          <Route path="/drivers" element={<Navigate to="/driver" replace />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/vehicles"
            element={
              <ProtectedRoute adminOnly>
                <AdminVehicles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fleet"
            element={
              <ProtectedRoute adminOnly>
                <AdminFleet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shipments"
            element={
              <ProtectedRoute adminOnly>
                <AdminShipments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/routes"
            element={
              <ProtectedRoute adminOnly>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute adminOnly>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transport"
            element={
              <ProtectedRoute adminOnly>
                <TransportBoard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}