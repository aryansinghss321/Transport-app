import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ vehicles: 0, routes: 0, bookings: 0 });

  useEffect(() => {
    Promise.all([api.get("/vehicles"), api.get("/routes/all"), api.get("/bookings")])
      .then(([v, r, b]) => {
        const vehicles = v.data.value ?? v.data;
        const routes = r.data.value ?? r.data;
        const bookings = b.data.value ?? b.data;

        setStats({
          vehicles: vehicles.length,
          routes: routes.length,
          bookings: bookings.length,
        });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Vehicles", value: stats.vehicles, link: "/admin/vehicles", color: "#2563eb" },
    { label: "Routes", value: stats.routes, link: "/admin/routes", color: "#16a34a" },
    { label: "Bookings", value: stats.bookings, link: "/admin/bookings", color: "#7c3aed" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Navbar />
      <div style={{ maxWidth: 980, margin: "18px auto", padding: "0 16px" }}>
        <h2>Admin Dashboard</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {cards.map((c) => (
            <Link
              key={c.label}
              to={c.link}
              style={{
                background: c.color,
                color: "white",
                padding: 16,
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 800,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: 34 }}>{c.value}</div>
              <div style={{ opacity: 0.95 }}>{c.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}