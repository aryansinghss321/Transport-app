import { useEffect, useState } from "react";

import { Navigate, Link } from "react-router-dom";

import { useAuth } from "../../context/useAuth";

import { getDriverBookings } from "../../api";

import Navbar from "../../components/Navbar";

export default function DriverDashboard() {
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoadingList(true);
      try {
        const { data } = await getDriverBookings();
        setBookings(data.value ?? data);
      } finally {
        setLoadingList(false);
      }
    };

    load();
  }, [user]);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "driver" && user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "36px auto", padding: "0 20px" }}>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          Manufacturing Driver Operations
        </h2>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
          {loadingList ? (
            <div>Loading shipments...</div>
          ) : bookings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 30,
                color: "#64748b",
              }}
            >
              No assigned transport shipments
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eef2ff" }}>
                  <th style={{ padding: 10 }}>Ref</th>
                  <th>Source Plant</th>
                  <th>Destination Hub</th>
                  <th>Dispatch Date</th>
                  <th>Assigned Vehicle</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((s) => (
                  <tr key={s._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 10 }}>{s._id?.slice(-6)?.toUpperCase()}</td>
                    <td>{s.routeId?.source ?? "—"}</td>
                    <td>{s.routeId?.destination ?? "—"}</td>
                    <td>
                      {s.dispatchDate
                        ? new Date(s.dispatchDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>{s.assignedVehicle?.plateNumber || "Not Assigned"}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {(s.status || "pending").replace(/_/g, " ")}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/driver/shipments/${s._id}`}
                        style={{ color: "#4f46e5", fontWeight: 700 }}
                      >
                        View Shipment
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}