import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import toast from "react-hot-toast";
import { getBookings, getVehicles, getDrivers, assignBooking, createDriver } from "../../api";

export default function AdminShipments() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [newDriver, setNewDriver] = useState({ name: "", email: "", password: "" });
  const [creatingDriver, setCreatingDriver] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: bData }, { data: vData }, { data: dData }] = await Promise.all([
        getBookings(),
        getVehicles(),
        getDrivers(),
      ]);
      const bookingsList = bData.value ?? bData;
      setBookings(bookingsList);
      setVehicles(vData.value ?? vData);
      setDrivers(dData.value ?? dData);
      // prefill assignments map from existing booking relations
      const map = {};
      (bookingsList || []).forEach((b) => {
        map[b._id] = { vehicle: b.assignedVehicle?._id ?? "", driver: b.assignedDriver?._id ?? "" };
      });
      setAssignments(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    if (!newDriver.name.trim() || !newDriver.email.trim() || !newDriver.password) {
      toast.error("Name, email and password are required");
      return;
    }

    setCreatingDriver(true);
    try {
      await createDriver({
        name: newDriver.name.trim(),
        email: newDriver.email.trim(),
        password: newDriver.password,
      });
      toast.success("Driver account created");
      setNewDriver({ name: "", email: "", password: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create driver");
    } finally {
      setCreatingDriver(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "36px auto", padding: "0 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Manufacturing Shipment Assignment</h2>
        <form
          onSubmit={handleCreateDriver}
          style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, display: "grid", gridTemplateColumns: "2fr 2fr 1.6fr auto", gap: 10, alignItems: "end" }}
        >
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#334155", marginBottom: 4 }}>Driver Name</label>
            <input
              type="text"
              value={newDriver.name}
              onChange={(e) => setNewDriver((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Rahul Sharma"
              style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#334155", marginBottom: 4 }}>Driver Email</label>
            <input
              type="email"
              value={newDriver.email}
              onChange={(e) => setNewDriver((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="driver@example.com"
              style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#334155", marginBottom: 4 }}>Temporary Password</label>
            <input
              type="password"
              value={newDriver.password}
              onChange={(e) => setNewDriver((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Min 6 characters"
              style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px" }}
            />
          </div>
          <button
            type="submit"
            disabled={creatingDriver}
            style={{ background: "#0f766e", color: "#fff", border: "none", borderRadius: 8, padding: "9px 12px", fontWeight: 700, minWidth: 120, opacity: creatingDriver ? 0.7 : 1 }}
          >
            {creatingDriver ? "Creating..." : "Add Driver"}
          </button>
        </form>
        <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
          {loading ? (
            <div>Loading shipment assignments...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eef2ff" }}>
                  <th style={{ padding: 10 }}>Reference</th>
                  <th>Description</th>
                  <th>Source Plant</th>
                  <th>Destination Hub</th>
                  <th>Shipment Type</th>
                  <th>Vehicle</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 10 }}>{b._id?.slice(-6)?.toUpperCase()}</td>
                    <td>{b.productType ?? "—"}</td>
                    <td>{b.routeId?.source ?? "—"}</td>
                    <td>{b.routeId?.destination ?? "—"}</td>
                    <td>{b.shipmentType?.replace(/_/g, " ") ?? "—"}</td>
                    <td>
                      <select
                        value={assignments[b._id]?.vehicle ?? ""}
                        onChange={(e) => setAssignments((prev) => ({ ...prev, [b._id]: { ...(prev[b._id] || {}), vehicle: e.target.value } }))}
                      >
                        <option value="">— Select vehicle —</option>
                        {vehicles.map((v) => (
                          <option key={v._id} value={v._id}>{v.name} ({v.plateNumber})</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={assignments[b._id]?.driver ?? ""}
                        onChange={(e) => setAssignments((prev) => ({ ...prev, [b._id]: { ...(prev[b._id] || {}), driver: e.target.value } }))}
                      >
                        <option value="">— Select driver —</option>
                        {drivers.length === 0 ? <option value="" disabled>No drivers available</option> : null}
                        {drivers.map((d) => (
                          <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{(b.status || "pending").replace(/_/g, " ")}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={async () => {
                          const payload = {};
                          const a = assignments[b._id] || {};
                          if (a.vehicle !== undefined) payload.assignedVehicle = a.vehicle || null;
                          if (a.driver !== undefined) payload.assignedDriver = a.driver || null;
                          try {
                            await assignBooking(b._id, payload);
                            toast.success("Booking assignment updated");
                            load();
                          } catch (err) {
                            toast.error(err.response?.data?.message || "Error");
                          }
                        }}
                        style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", border: "none", padding: "8px 10px", borderRadius: 8 }}
                      >Assign Shipment</button>
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