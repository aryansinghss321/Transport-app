import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api";
import toast from "react-hot-toast";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  const load = () => api.get("/bookings").then(({ data }) => setBookings(data.value ?? data));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success("Status updated");
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "18px auto", padding: "0 16px" }}>
        <h2>All Bookings</h2>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["User", "Route", "Date", "Seats", "Total", "Status"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 800 }}>{b.userId?.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{b.userId?.email}</div>
                  </td>
                  <td style={styles.td}>{b.routeId?.source} → {b.routeId?.destination}</td>
                  <td style={styles.td}>{new Date(b.travelDate).toLocaleDateString()}</td>
                  <td style={styles.td}>{b.seats}</td>
                  <td style={styles.td}>₹{b.totalFare}</td>
                  <td style={styles.td}>
                    <select value={b.status} onChange={(e) => updateStatus(b._id, e.target.value)} style={styles.select}>
                      {["pending", "confirmed", "cancelled", "completed"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="6" style={styles.td}>No bookings.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  tableWrap: { background: "white", borderRadius: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.06)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 12, background: "#f3f4f6", fontSize: 13 },
  td: { padding: 12, borderTop: "1px solid #e5e7eb", fontSize: 13, verticalAlign: "top" },
  select: { padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb" },
};