import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Navbar />
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Welcome, {user?.name}</h2>
        <p style={{ color: "#6b7280" }}>Choose an option:</p>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Link to="/routes" style={styles.btnBlue}>Browse Routes</Link>
          <Link to="/my-bookings" style={styles.btnGreen}>My Bookings</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    maxWidth: 720,
    margin: "24px auto",
    padding: 18,
    borderRadius: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  btnBlue: { padding: "10px 12px", borderRadius: 8, background: "#2563eb", color: "white", textDecoration: "none", fontWeight: 700 },
  btnGreen: { padding: "10px 12px", borderRadius: 8, background: "#16a34a", color: "white", textDecoration: "none", fontWeight: 700 },
};