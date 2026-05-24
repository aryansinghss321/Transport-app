import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaTrash, FaSearch, FaTimes, FaRoute, FaCheckCircle } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import api from "../../api";
import toast from "react-hot-toast";

/* ─── constants ─────────────────────────────────────────────────────────── */
const empty = {
  source: "",
  destination: "",
  distance: "",
  estimatedDuration: "",
  dispatchWindow: "08:00 AM - 06:00 PM",
  routeType: "factory_to_warehouse",
  vehicleId: "",
  status: "active",
};
const STATUS_OPTIONS = ["active", "inactive"];
const vehicleSpeedMap = {
  truck: 55,
  mini_truck: 60,
  van: 65,
  container: 50,
  default: 55,
};

const ROUTE_TYPES = [
  {
    value: "factory_to_warehouse",
    label: "Factory → Warehouse",
  },
  {
    value: "warehouse_to_distributor",
    label: "Warehouse → Distributor",
  },
  {
    value: "plant_transfer",
    label: "Plant Transfer",
  },
];

/* ─── global styles injected once ──────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "admin-routes-styles";
    style.textContent = `
      .ar-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
      .ar-root .mono { font-family: 'DM Mono', monospace; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .fade-up { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
      .fade-up-1 { animation-delay: .05s; }
      .fade-up-2 { animation-delay: .13s; }

      /* form inputs */
      .ar-input {
        width: 100%; padding: 10px 13px; border-radius: 10px;
        border: 1.5px solid #e2e8f0; font-size: 13.5px; color: #0f172a;
        outline: none; transition: border-color .18s, box-shadow .18s;
        background: #fff;
      }
      .ar-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
      .ar-input:read-only { background: #f8fafc; color: #64748b; cursor: default; }
      .ar-input::placeholder { color: #94a3b8; }

      /* filter bar inputs */
      .ar-filter {
        height: 36px; padding: 0 12px; border-radius: 10px;
        border: 1.5px solid #e2e8f0; font-size: 13px; color: #334155;
        outline: none; transition: border-color .18s; background: #fff;
      }
      .ar-filter:focus { border-color: #6366f1; }

      /* table */
      .ar-table-row { transition: background .15s; }
      .ar-table-row:hover { background: #f5f3ff !important; }
      .ar-table-row:hover .ar-row-actions { opacity: 1; }
      .ar-row-actions { opacity: 0; transition: opacity .2s; display: flex; gap: 6px; }

      /* icon action buttons */
      .ar-action-btn {
        width: 30px; height: 30px; border: none; border-radius: 8px;
        display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 13px; transition: transform .15s, filter .15s;
      }
      .ar-action-btn:hover { transform: scale(1.1); filter: brightness(1.1); }
      .ar-btn-edit  { background: #ede9fe; color: #6d28d9; }
      .ar-btn-del   { background: #fee2e2; color: #b91c1c; }

      /* submit button */
      .ar-submit-btn {
        padding: 11px 22px; border-radius: 11px; border: none;
        font-size: 14px; font-weight: 700; cursor: pointer;
        display: inline-flex; align-items: center; gap: 8px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff; transition: filter .2s, transform .18s;
        box-shadow: 0 4px 14px rgba(99,102,241,.35);
      }
      .ar-submit-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
      .ar-submit-btn:disabled { opacity: .6; cursor: not-allowed; }

      .ar-cancel-btn {
        padding: 11px 18px; border-radius: 11px; border: 1.5px solid #e2e8f0;
        font-size: 14px; font-weight: 600; cursor: pointer;
        background: #fff; color: #64748b; transition: background .15s;
      }
      .ar-cancel-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

      /* status pill */
      .ar-pill {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 99px;
        font-size: 11px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
      }
      .ar-pill::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }
      .ar-pill-active   { background: #dcfce7; color: #15803d; }
      .ar-pill-inactive { background: #fef9c3; color: #a16207; }

      /* skeleton */
      .ar-skeleton {
        background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
        background-size: 200% 100%; animation: shimmer 1.4s infinite;
        border-radius: 6px;
      }

      /* search icon wrapper */
      .ar-search-wrap { position: relative; }
      .ar-search-wrap .ar-search-icon {
        position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
        color: #94a3b8; font-size: 12px; pointer-events: none;
      }
      .ar-search-wrap .ar-filter { padding-left: 30px; }

      /* auto-calc badge */
      .ar-auto-badge {
        font-size: 10px; font-weight: 700; letter-spacing: .5px;
        text-transform: uppercase; color: #6366f1;
        background: #ede9fe; padding: 2px 7px; border-radius: 99px;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(link))  document.head.removeChild(link);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);
  return null;
}

/* ─── form field wrapper ────────────────────────────────────────────────── */
const Field = ({ label, badge, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", letterSpacing: ".3px" }}>
        {label}
      </label>
      {badge && <span className="ar-auto-badge">auto</span>}
    </div>
    {children}
  </div>
);

/* ─── skeleton rows ─────────────────────────────────────────────────────── */
const SkeletonRows = () =>
  Array.from({ length: 4 }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: 7 }).map((__, j) => (
        <td key={j} style={{ padding: "14px" }}>
          <div className="ar-skeleton" style={{ height: 14, width: j === 6 ? 60 : "80%" }} />
        </td>
      ))}
    </tr>
  ));

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════════════ */
export default function AdminRoutes() {
  const [routes, setRoutes]         = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [form, setForm]             = useState(empty);
  const [editId, setEditId]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterVehicle, setFilterVehicle] = useState("all");

  const load = () => {
    setLoadingList(true);
    return Promise.all([api.get("/routes/all"), api.get("/vehicles")])
      .then(([routesRes, vehiclesRes]) => {
        setRoutes(routesRes.data.value ?? routesRes.data);
        setVehicles(vehiclesRes.data.value ?? vehiclesRes.data);
      })
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { load(); }, []);

  const selectedVehicle = useMemo(
    () => vehicles.find(v => v._id === form.vehicleId),
    [vehicles, form.vehicleId]
  );

const estimate = useMemo(() => {
  const dist = parseFloat(form.distance);

  if (!selectedVehicle || Number.isNaN(dist)) {
    return {
      estimatedDuration: "",
    };
  }

  const speed =
    vehicleSpeedMap[
      selectedVehicle.type?.toLowerCase()
    ] || vehicleSpeedMap.default;

  return {
    estimatedDuration: (
      dist / speed
    ).toFixed(2),
  };
}, [form.distance, selectedVehicle]);

const displayDuration =
  estimate.estimatedDuration ||
  form.estimatedDuration;

  const filteredRoutes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return routes.filter(r => {
        const matchTerm =!term ||r.source?.toLowerCase().includes(term) ||r.destination?.toLowerCase().includes(term);
      const matchStatus  = filterStatus  === "all" || r.status === filterStatus;
      const vid          = r.vehicleId?._id || r.vehicleId;
      const matchVehicle = filterVehicle === "all" || vid === filterVehicle;
      return matchTerm && matchStatus && matchVehicle;
    });
  }, [routes, searchTerm, filterStatus, filterVehicle]);

  const submit = async () => {
    if (!form.vehicleId) return toast.error("Select a vehicle");
    setLoading(true);
    try {
const payload = {
  ...form,
  distance: Number(form.distance),

  // compatibility mode
  duration: Number(displayDuration),
  estimatedDuration: Number(displayDuration),

  departureTime: form.dispatchWindow,
  dispatchWindow: form.dispatchWindow,
};      if (editId) {
        await api.put(`/routes/${editId}`, payload);
        toast.success("Route updated");
      } else {
        await api.post("/routes", payload);
        toast.success("Route created");
      }
      setForm(empty); setEditId(null); load();
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
  source: r.source || "",
  destination: r.destination || "",

  distance: String(r.distance || ""),

  estimatedDuration: String(
    r.estimatedDuration ||
    r.duration ||
    ""
  ),

  dispatchWindow:
    r.dispatchWindow ||
    r.departureTime ||
    "08:00 AM - 06:00 PM",

  routeType:
    r.routeType ||
    "factory_to_warehouse",

  vehicleId:
    r.vehicleId?._id ||
    r.vehicleId ||
    "",

  status:
    r.status || "active",
});
    setEditId(r._id);
  };

  const resetForm = () => { setForm(empty); setEditId(null); };

  /* ── derived counts ── */
  const activeCount   = routes.filter(r => r.status === "active").length;
  const inactiveCount = routes.filter(r => r.status === "inactive").length;

  return (
    <div className="ar-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <GlobalStyles />
      <Navbar />

      {/* ── hero bar ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "32px 0 72px",
      }}>
        <div style={{ maxWidth: 1260, margin: "0 auto", padding: "0 24px",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <FaRoute style={{ color: "#818cf8", fontSize: 16 }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 500, letterSpacing: ".5px" }}>
                MANUFACTURING LOGISTICS
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
              Manage Logistics Routes
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", margin: 0 }}>
              {routes.length} logistics routes ·
                {activeCount} active ·
                {inactiveCount} inactive
            </p>
          </div>
          {/* Action button removed per request */}
        </div>
      </div>

      <main style={{ maxWidth: 1260, margin: "-52px auto 48px", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>

          {/* ══ LEFT: Form card ══════════════════════════════════════════════ */}
          <div className="fade-up fade-up-1" style={{
            background: "#fff", borderRadius: 20, padding: 28,
            boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.07)",
            position: "sticky", top: 20,
          }}>
            {/* form header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10,
                background: editId ? "#fef3c7" : "#ede9fe",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: editId ? "#d97706" : "#7c3aed", fontSize: 14 }}>
                {editId ? <FaEdit /> : <FaPlus />}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
                  {editId ? "Edit Route" : "Add New Route"}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {editId ? "Modify the route details below" : "Fill in the route information"}
                </div>
              </div>
            </div>

            {/* divider */}
            <div style={{ height: 1, background: "#f1f5f9", marginBottom: 20 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Source Plant + Destination Warehouse / Hub side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Source Plant">
                  <input
                    className="ar-input"
                    placeholder="e.g. Kolkata"
                    value={form.source}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        source: e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Destination Warehouse / Hub">
                  <input
                    className="ar-input"
                    placeholder="e.g. Durgapur"
                    value={form.destination}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        destination: e.target.value,
                      })
                    }
                  />
                </Field>
              </div>

              <Field label="Distance (km)">
                <input className="ar-input" type="number" placeholder="e.g. 170"
                  value={form.distance}
                  onChange={e => setForm({ ...form, distance: e.target.value })} />
              </Field>

              {/* auto-calculated fields */}
              <div style={{ background: "#fafbff", borderRadius: 12, padding: "14px 16px",
                border: "1.5px solid #ede9fe" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: ".5px",
                  marginBottom: 10, textTransform: "uppercase" }}>
                  Auto-calculated from vehicle type
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Estimated Duration (hrs)" badge>
                    <input
                      className="ar-input"
                      type="number"
                      readOnly
                      value={displayDuration}
                      placeholder="—"
                      style={{
                        background: "#f1f5f9",
                        color: "#6366f1",
                        fontWeight: 600,
                      }}
                    />
                  </Field>

                  <Field label="Route Type">
                    <select
                      className="ar-input"
                      value={form.routeType}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          routeType: e.target.value,
                        })
                      }
                    >
                      {ROUTE_TYPES.map((route) => (
                        <option
                          key={route.value}
                          value={route.value}
                        >
                          {route.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <Field label="Vehicle">
                <select className="ar-input" value={form.vehicleId}
                  onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">Select vehicle…</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.plateNumber})</option>
                  ))}
                </select>
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Dispatch Window">
                  <input
                    className="ar-input"
                    type="text"
                    value={form.dispatchWindow}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dispatchWindow:
                          e.target.value,
                      })
                    }
                  />
                </Field>
                <Field label="Status">
                  <select className="ar-input" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div style={{ height: 1, background: "#f1f5f9", margin: "20px 0" }} />

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ar-submit-btn" disabled={loading} onClick={submit}>
                <FaCheckCircle size={13} />
                {loading ? "Saving…" : editId ? "Update Route" : "Add Route"}
              </button>
              {editId && (
                <button className="ar-cancel-btn" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </div>

          {/* ══ RIGHT: Table card ════════════════════════════════════════════ */}
          <div className="fade-up fade-up-2" style={{
            background: "#fff", borderRadius: 20, padding: 28,
            boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.07)",
          }}>
            {/* table header */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between",
              alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#0f172a" }}>Logistics Routes</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {filteredRoutes.length} of {routes.length} routes
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <div className="ar-search-wrap">
                  <FaSearch className="ar-search-icon" />
                  <input className="ar-filter" placeholder="Search logistics routes…" style={{ width: 180 }}
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="ar-filter" value={filterVehicle}
                  onChange={e => setFilterVehicle(e.target.value)} style={{ minWidth: 130 }}>
                  <option value="all">All vehicles</option>
                  {vehicles.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                </select>
                <select className="ar-filter" value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {(searchTerm || filterStatus !== "all" || filterVehicle !== "all") && (
                  <button onClick={() => { setSearchTerm(""); setFilterStatus("all"); setFilterVehicle("all"); }}
                    style={{ height: 36, padding: "0 12px", borderRadius: 10, border: "1.5px solid #e2e8f0",
                      background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6 }}>
                    <FaTimes size={10} /> Clear
                  </button>
                )}
              </div>
            </div>

            <div style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid #f1f5f9" }}>
              <div style={{ overflowX: "auto", maxHeight: 540, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#fafbff" }}>
                    <tr>
                      {["Source Plant", "Destination Hub", "Distance", "Est. Duration", "Dispatch Window", "Vehicle", "Status", ""].map(h => (
                        <th key={h} style={{
                          padding: "11px 14px", textAlign: "left", fontSize: 11, fontWeight: 700,
                          letterSpacing: ".6px", textTransform: "uppercase", color: "#64748b",
                          whiteSpace: "nowrap", borderBottom: "1.5px solid #f1f5f9",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingList && <SkeletonRows />}

                    {!loadingList && filteredRoutes.map((r, i) => (
                      <tr key={r._id} className="ar-table-row"
                        style={{ background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                        <td style={{ padding: "13px 14px", fontSize: 13.5, fontWeight: 700, color: "#0f172a",
                          borderBottom: "1px solid #f1f5f9" }}>{r.source}</td>
                        <td style={{ padding: "13px 14px", fontSize: 13.5, color: "#334155",
                          borderBottom: "1px solid #f1f5f9" }}>{r.destination}</td>
                        <td className="mono" style={{ padding: "13px 14px", fontSize: 13, color: "#64748b",
                          borderBottom: "1px solid #f1f5f9" }}>{r.distance} km</td>
                        <td className="mono" style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600,
                          color: "#6366f1", borderBottom: "1px solid #f1f5f9" }}>
                          {r.estimatedDuration || r.duration} hrs
                        </td>
                        <td className="mono" style={{ padding: "13px 14px", fontSize: 13, color: "#334155",
                          borderBottom: "1px solid #f1f5f9" }}>
                          {r.dispatchWindow || r.departureTime || "—"}
                        </td>
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          {r.vehicleId?.name ? (
                            <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "3px 10px",
                              borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                              {r.vehicleId.name}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          <span className={`ar-pill ${r.status === "active" ? "ar-pill-active" : "ar-pill-inactive"}`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          <div className="ar-row-actions">
                            <button className="ar-action-btn ar-btn-edit" title="Edit"
                              onClick={() => startEdit(r)}><FaEdit /></button>
                            <button className="ar-action-btn ar-btn-del" title="Delete"
                              onClick={() => del(r._id)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!loadingList && filteredRoutes.length === 0 && (
                      <tr><td colSpan={8}>
                        <div style={{ textAlign: "center", padding: "44px 24px",
                          color: "#94a3b8", fontSize: 14 }}>
                          <FaRoute style={{ fontSize: 28, marginBottom: 10, color: "#e2e8f0" }} />
                          <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 4 }}>No routes found</div>
                          <div style={{ fontSize: 13 }}>Try adjusting your filters or add a new route.</div>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* footer count */}
            {!loadingList && filteredRoutes.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between",
                alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  Showing <strong style={{ color: "#334155" }}>{filteredRoutes.length}</strong> route{filteredRoutes.length !== 1 ? "s" : ""}
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 12, background: "#dcfce7", color: "#15803d",
                    padding: "3px 10px", borderRadius: 99, fontWeight: 700 }}>
                    {activeCount} active
                  </span>
                  <span style={{ fontSize: 12, background: "#fef9c3", color: "#a16207",
                    padding: "3px 10px", borderRadius: 99, fontWeight: 700 }}>
                    {inactiveCount} inactive
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}