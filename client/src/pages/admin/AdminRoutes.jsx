import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api";
import toast from "react-hot-toast";

const empty = {
  source: "",
  destination: "",
  distance: "",
  duration: "",
  fare: "",
  vehicleId: "",
  departureTime: "",
  status: "active",
};

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.get("/routes/all").then(({ data }) => setRoutes(data.value ?? data));

  useEffect(() => {
    load();
    api.get("/vehicles").then(({ data }) => setVehicles(data.value ?? data));
  }, []);

  const submit = async () => {
    if (!form.vehicleId) return toast.error("Select a vehicle");
    setLoading(true);

    try {
      const payload = {
        ...form,
        distance: Number(form.distance),
        duration: Number(form.duration),
        fare: Number(form.fare),
      };

      if (editId) {
        await api.put(`/routes/${editId}`, payload);
        toast.success("Route updated");
      } else {
        await api.post("/routes", payload);
        toast.success("Route created");
      }

      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Delete this route?")) return;
    await api.delete(`/routes/${id}`);
    toast.success("Deleted");
    load();
  };

  const startEdit = (r) => {
    setForm({
      source: r.source,
      destination: r.destination,
      distance: String(r.distance),
      duration: String(r.duration),
      fare: String(r.fare),
      vehicleId: r.vehicleId?._id || r.vehicleId,
      departureTime: r.departureTime,
      status: r.status,
    });
    setEditId(r._id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Navbar />
      <div style={{ maxWidth: 980, margin: "18px auto", padding: "0 16px" }}>
        <h2>Manage Routes</h2>

        <div style={styles.form}>
          <input style={styles.input} placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <input style={styles.input} placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />

          <input style={styles.input} type="number" placeholder="Distance (km)" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} />
          <input style={styles.input} type="number" placeholder="Duration (min)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />

          <input style={styles.input} type="number" placeholder="Fare (₹)" value={form.fare} onChange={(e) => setForm({ ...form, fare: e.target.value })} />
          <input style={styles.input} placeholder="Departure Time (08:00)" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} />

          <select style={styles.input} value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name} ({v.plateNumber})
              </option>
            ))}
          </select>

          <select style={styles.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>

          <button disabled={loading} onClick={submit} style={styles.btnGreen}>
            {editId ? "Update Route" : "Add Route"}
          </button>

          {editId && (
            <button onClick={() => { setForm(empty); setEditId(null); }} style={styles.btnGray}>
              Cancel Edit
            </button>
          )}
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Source", "Destination", "Fare", "Departs", "Vehicle", "Status", "Actions"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r._id}>
                  <td style={styles.td}>{r.source}</td>
                  <td style={styles.td}>{r.destination}</td>
                  <td style={styles.td}>₹{r.fare}</td>
                  <td style={styles.td}>{r.departureTime}</td>
                  <td style={styles.td}>{r.vehicleId?.name}</td>
                  <td style={styles.td}>{r.status}</td>
                  <td style={styles.td}>
                    <button onClick={() => startEdit(r)} style={styles.linkBtn}>Edit</button>{" "}
                    <button onClick={() => del(r._id)} style={{ ...styles.linkBtn, color: "#ef4444" }}>Delete</button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && <tr><td colSpan="7" style={styles.td}>No routes.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  form: {
    background: "white",
    padding: 14,
    borderRadius: 10,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 10,
    marginBottom: 14,
  },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" },
  btnGreen: { gridColumn: "1 / -1", padding: "10px 12px", borderRadius: 8, border: "none", background: "#16a34a", color: "white", fontWeight: 800, cursor: "pointer" },
  btnGray: { gridColumn: "1 / -1", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" },
  tableWrap: { background: "white", borderRadius: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.06)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 12, background: "#f3f4f6", fontSize: 13 },
  td: { padding: 12, borderTop: "1px solid #e5e7eb", fontSize: 13 },
  linkBtn: { border: "none", background: "transparent", cursor: "pointer", color: "#2563eb", fontWeight: 700 },
};