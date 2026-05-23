import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";
import toast from "react-hot-toast";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api
      .get("/bookings/my")
      .then(({ data }) => setBookings(data.value ?? data))
      .catch(() => toast.error("Failed to load bookings"));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "18px auto", padding: "0 16px" }}>
        <h2>My Bookings</h2>

        {bookings.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No bookings yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {bookings.map((b) => (
              <div key={b._id} style={styles.card}>
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {b.routeId?.source} → {b.routeId?.destination}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    Departs: {b.routeId?.departureTime} · Seats: {b.seats} · Date:{" "}
                    {new Date(b.travelDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 900, color: "#2563eb" }}>₹{b.totalFare}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: 14,
    borderRadius: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
  },
};