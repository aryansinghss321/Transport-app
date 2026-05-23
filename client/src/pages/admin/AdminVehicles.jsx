import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api";
import toast from "react-hot-toast";

const empty = { name: "", type: "bus", plateNumber: "", capacity: "", status: "active" };

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () =>
    api.get("/vehicles").then(({ data }) => setVehicles(data.value ?? data));

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
      };

      if (editId) {
        await api.put(`/vehicles/${editId}`, payload);
        toast.success("Vehicle updated");
      } else {
        await api.post("/vehicles", payload);
        toast.success("Vehicle added");
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
    if (!confirm("Delete this vehicle?")) return;
    await api.delete(`/vehicles/${id}`);
    toast.success("Deleted");
    load();
  };

  const startEdit = (v) => {
    setForm({
      name: v.name,
      type: v.type,
      plateNumber: v.plateNumber,
      capacity: String(v.capacity),
      status: v.status,
    });
    setEditId(v._id);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <Navbar />
      <div style={{ maxWidth: 980, margin: "18px auto", padding: "0 16px" }}>
        <h2>Manage Vehicles</h2>

        <div style={styles.form}>
          <input style={styles.input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select style={styles.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {["bus", "train", "van", "car"].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

          <input style={styles.input} placeholder="Plate Number" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })} />
          <input style={styles.input} type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />

          <select style={styles.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {["active", "inactive", "maintenance"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <button disabled={loading} onClick={submit} style={styles.btnBlue}>
            {editId ? "Update Vehicle" : "Add Vehicle"}
          </button>

          {editId && (
            <button
              onClick={() => { setForm(empty); setEditId(null); }}
              style={styles.btnGray}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Name", "Type", "Plate", "Capacity", "Status", "Actions"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td style={styles.td}>{v.name}</td>
                  <td style={styles.td}>{v.type}</td>
                  <td style={styles.td}>{v.plateNumber}</td>
                  <td style={styles.td}>{v.capacity}</td>
                  <td style={styles.td}>{v.status}</td>
                  <td style={styles.td}>
                    <button onClick={() => startEdit(v)} style={styles.linkBtn}>Edit</button>{" "}
                    <button onClick={() => del(v._id)} style={{ ...styles.linkBtn, color: "#ef4444" }}>Delete</button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan="6" style={styles.td}>No vehicles.</td></tr>
              )}
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
  btnBlue: { padding: "10px 12px", borderRadius: 8, border: "none", background: "#2563eb", color: "white", fontWeight: 800, cursor: "pointer" },
  btnGray: { gridColumn: "1 / -1", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer" },
  tableWrap: { background: "white", borderRadius: 10, boxShadow: "0 10px 25px rgba(0,0,0,0.06)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 12, background: "#f3f4f6", fontSize: 13 },
  td: { padding: 12, borderTop: "1px solid #e5e7eb", fontSize: 13 },
  linkBtn: { border: "none", background: "transparent", cursor: "pointer", color: "#2563eb", fontWeight: 700 },
};