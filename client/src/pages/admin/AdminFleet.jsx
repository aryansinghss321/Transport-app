import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { getVehicles, deleteVehicle } from "../../api";
import toast from "react-hot-toast";

export default function AdminFleet() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getVehicles();
      setVehicles(data.value ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this fleet vehicle?")) return;
    try {
      await deleteVehicle(id);
      toast.success("Vehicle removed");
      load();
    } catch {
      toast.error("Failed to delete vehicle");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "36px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Manufacturing Transport Fleet</h2>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eef2ff" }}>
                  <th style={{ padding: 10 }}>Name</th>
                  <th>Plate</th>
                  <th>Vehicle Type</th>
                  <th>Payload Capacity</th>
                  <th>Current Load (kg)</th>
                  <th>Cargo</th>
                  <th>Driver</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 10 }}>{v.name}</td>
                    <td>{v.plateNumber}</td>
                    <td style={{ textTransform: "capitalize" }}>{v.type ?? "—"}</td>
                    <td>{v.capacity}</td>
                    <td>{v.loadCapacityKg ?? "—"}</td>
                    <td>{v.cargoType ?? "—"}</td>
                    <td>{v.assignedDriver ? v.assignedDriver.name : "—"}</td>
                    <td style={{ textAlign: "right" }}>
                      <button onClick={() => handleDelete(v._id)} style={{ background: "#fee2e2", border: "none", padding: "6px 8px", borderRadius: 8 }}>Delete</button>
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