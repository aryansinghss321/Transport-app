import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaTrash, FaSearch, FaTimes, FaTruck, FaCheckCircle } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import api from "../../api";
import toast from "react-hot-toast";

/* ─── constants ─────────────────────────────────────────────────────────── */
const empty = { name: "", type: "truck", plateNumber: "", capacity: "", status: "active" };
const TYPE_OPTIONS    = ["truck", "trailer", "container", "forklift"];
const STATUS_OPTIONS  = ["active", "inactive", "maintenance"];

const TYPE_META = {
  truck: {
    icon: FaTruck,
    bg: "#dbeafe",
    color: "#2563eb",
    label: "Truck",
  },
  trailer: {
    icon: FaTruck,
    bg: "#ede9fe",
    color: "#7c3aed",
    label: "Trailer",
  },
  container: {
    icon: FaTruck,
    bg: "#dcfce7",
    color: "#15803d",
    label: "Container",
  },
  forklift: {
    icon: FaTruck,
    bg: "#fef3c7",
    color: "#d97706",
    label: "Forklift",
  },
};

const STATUS_META = {
  active:      { pill: "av-pill-green", dot: "#16a34a" },
  inactive:    { pill: "av-pill-amber", dot: "#d97706" },
  maintenance: { pill: "av-pill-red",   dot: "#dc2626" },
};

/* ─── inject global styles ──────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "admin-vehicles-styles";
    style.textContent = `
      .av-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
      .av-root .mono { font-family: 'DM Mono', monospace; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .av-fade-up   { animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
      .av-fade-up-1 { animation-delay: .06s; }
      .av-fade-up-2 { animation-delay: .14s; }

      /* inputs */
      .av-input {
        width: 100%; padding: 10px 13px; border-radius: 10px;
        border: 1.5px solid #e2e8f0; font-size: 13.5px; color: #0f172a;
        outline: none; transition: border-color .18s, box-shadow .18s;
        background: #fff;
      }
      .av-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.12); }
      .av-input::placeholder { color: #94a3b8; }

      .av-filter {
        height: 36px; padding: 0 12px; border-radius: 10px;
        border: 1.5px solid #e2e8f0; font-size: 13px; color: #334155;
        outline: none; transition: border-color .18s; background: #fff;
      }
      .av-filter:focus { border-color: #4f46e5; }

      /* search icon */
      .av-search-wrap { position: relative; }
      .av-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 12px; pointer-events: none; }
      .av-search-wrap .av-filter { padding-left: 30px; }

      /* submit btn */
      .av-submit-btn {
        padding: 11px 22px; border-radius: 11px; border: none;
        font-size: 14px; font-weight: 700; cursor: pointer;
        display: inline-flex; align-items: center; gap: 8px;
        background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: #fff; transition: filter .2s, transform .18s;
        box-shadow: 0 4px 14px rgba(37,99,235,.35);
      }
      .av-submit-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
      .av-submit-btn:disabled { opacity: .6; cursor: not-allowed; }

      .av-cancel-btn {
        padding: 11px 18px; border-radius: 11px; border: 1.5px solid #e2e8f0;
        font-size: 14px; font-weight: 600; cursor: pointer;
        background: #fff; color: #64748b; transition: background .15s;
      }
      .av-cancel-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

      /* status pills */
      .av-pill {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 99px;
        font-size: 11px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
      }
      .av-pill::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }
      .av-pill-green { background: #dcfce7; color: #15803d; }
      .av-pill-amber { background: #fef9c3; color: #a16207; }
      .av-pill-red   { background: #fee2e2; color: #b91c1c; }

      /* table row */
      .av-tr { transition: background .14s; }
      .av-tr:hover { background: #eef2ff !important; }
      .av-tr:hover .av-row-actions { opacity: 1; }
      .av-row-actions { opacity: 0; transition: opacity .2s; display: flex; gap: 6px; align-items: center; }

      /* action buttons */
      .av-icon-btn {
        width: 30px; height: 30px; border: none; border-radius: 8px;
        display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 13px; transition: transform .15s, filter .15s;
      }
      .av-icon-btn:hover { transform: scale(1.1); filter: brightness(1.1); }
      .av-btn-edit { background: #dbeafe; color: #1d4ed8; }
      .av-btn-del  { background: #fee2e2; color: #b91c1c; }

      /* type badge */
      .av-type-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 99px;
        font-size: 12px; font-weight: 600; text-transform: capitalize;
      }

      /* skeleton */
      .av-skeleton {
        background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
        background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px;
      }

      /* type selector cards */
      .av-type-card {
        flex: 1; padding: 10px 8px; border-radius: 10px; border: 1.5px solid #e2e8f0;
        display: flex; flex-direction: column; align-items: center; gap: 5px;
        cursor: pointer; transition: border-color .18s, background .18s;
        font-size: 12px; font-weight: 600; color: #64748b;
        background: #fff;
      }
      .av-type-card.selected { border-color: #4f46e5; background: #f5f3ff; color: #4f46e5; }
      .av-type-card:hover:not(.selected) { border-color: #cbd5e1; background: #f8fafc; }

      /* clear btn */
      .av-clear-btn {
        height: 36px; padding: 0 12px; border-radius: 10px; border: 1.5px solid #e2e8f0;
        background: #fff; color: #64748b; font-size: 13px; cursor: pointer;
        display: flex; align-items: center; gap: 6px; transition: background .15s;
      }
      .av-clear-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

      /* plate hint */
      .av-hint { font-size: 11px; color: #94a3b8; margin-top: 3px; }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(link))  document.head.removeChild(link);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);
  return null;
}

/* ─── field wrapper ─────────────────────────────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", letterSpacing: ".3px" }}>
      {label}
    </label>
    {children}
    {hint && <span className="av-hint">{hint}</span>}
  </div>
);

/* ─── skeleton rows ─────────────────────────────────────────────────────── */
const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <tr key={i}>
      {[140, 90, 110, 80, 90, 70].map((w, j) => (
        <td key={j} style={{ padding: "13px 14px" }}>
          <div className="av-skeleton" style={{ height: 14, width: w, opacity: 1 - i * 0.1 }} />
        </td>
      ))}
    </tr>
  ));

/* ─── type icon pill ─────────────────────────────────────────────────────── */
const TypeBadge = ({ type }) => {
  const meta = TYPE_META[type] || TYPE_META.truck;
  const Icon = meta.icon;
  return (
    <span className="av-type-badge" style={{ background: meta.bg, color: meta.color }}>
      <Icon style={{ fontSize: 11 }} /> {type}
    </span>
  );
};

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════════════ */
export default function AdminVehicles() {
  const [vehicles, setVehicles]   = useState([]);
  const [form, setForm]           = useState(empty);
  const [editId, setEditId]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterType, setFilterType]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () => {
    setLoadingList(true);
    return api.get("/vehicles")
      .then(({ data }) => setVehicles(data.value ?? data))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { load(); }, []);

  const filteredVehicles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return vehicles.filter(v => {
      const matchTerm   = !term || v.name.toLowerCase().includes(term) || v.plateNumber.toLowerCase().includes(term);
      const matchType   = filterType   === "all" || v.type   === filterType;
      const matchStatus = filterStatus === "all" || v.status === filterStatus;
      return matchTerm && matchType && matchStatus;
    });
  }, [vehicles, searchTerm, filterType, filterStatus]);

  /* ── stat counts ── */
  const countByStatus = useMemo(() => ({
    active:      vehicles.filter(v => v.status === "active").length,
    inactive:    vehicles.filter(v => v.status === "inactive").length,
    maintenance: vehicles.filter(v => v.status === "maintenance").length,
  }), [vehicles]);

  const submit = async () => {
    setLoading(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      if (editId) {
        await api.put(`/vehicles/${editId}`, payload);
        toast.success("Vehicle updated");
      } else {
        await api.post("/vehicles", payload);
        toast.success("Vehicle added");
      }
      setForm(empty); setEditId(null); load();
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
    setForm({ name: v.name, type: v.type, plateNumber: v.plateNumber, capacity: String(v.capacity), status: v.status });
    setEditId(v._id);
  };

  const resetForm = () => { setForm(empty); setEditId(null); };

  const hasFilters = searchTerm || filterType !== "all" || filterStatus !== "all";

  return (
    <div className="av-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <GlobalStyles />
      <Navbar />

      {/* ── hero bar ── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #172554 100%)", padding: "32px 0 72px" }}>
        <div style={{ maxWidth: 1260, margin: "0 auto", padding: "0 24px",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <FaTruck style={{ color: "#93c5fd", fontSize: 15 }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 500, letterSpacing: ".5px" }}>
                MANUFACTURING TRANSPORT FLEET
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
              Fleet & Transport Management
            </h1>
            <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
              {[
                { label: "Total",       val: vehicles.length,          bg: "rgba(255,255,255,.12)", color: "#fff" },
                { label: "Active",      val: countByStatus.active,      bg: "#dcfce7",              color: "#15803d" },
                { label: "Inactive",    val: countByStatus.inactive,    bg: "#fef9c3",              color: "#a16207" },
                { label: "Maintenance", val: countByStatus.maintenance, bg: "#fee2e2",              color: "#b91c1c" },
              ].map(s => (
                <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 12px", borderRadius: 99, background: s.bg, color: s.color,
                  fontSize: 12, fontWeight: 700 }}>
                  <strong>{s.val}</strong> {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1260, margin: "-52px auto 48px", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>

          {/* ══ LEFT: Form ══════════════════════════════════════════════════ */}
          <div className="av-fade-up av-fade-up-1" style={{
            background: "#fff", borderRadius: 20, padding: 28,
            boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.07)",
            position: "sticky", top: 20,
          }}>
            {/* form header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10,
                background: editId ? "#fef3c7" : "#dbeafe",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: editId ? "#d97706" : "#2563eb", fontSize: 14 }}>
                {editId ? <FaEdit /> : <FaPlus />}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
                  {editId ? "Edit Vehicle" : "Add New Vehicle"}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  {editId ? "Modify the vehicle details below" : "Register a new fleet vehicle"}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "#f1f5f9", marginBottom: 20 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <Field label="Vehicle Name">
                <input className="av-input" placeholder="e.g. Factory Truck 01"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </Field>

              {/* type selector cards */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569",
                  letterSpacing: ".3px", display: "block", marginBottom: 8 }}>
                  Vehicle Type
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {TYPE_OPTIONS.map(t => {
                    const meta = TYPE_META[t];
                    const Icon = meta.icon;
                    return (
                      <button key={t} type="button"
                        className={`av-type-card ${form.type === t ? "selected" : ""}`}
                        onClick={() => setForm({ ...form, type: t })}>
                        <Icon style={{ fontSize: 18, color: form.type === t ? "#4f46e5" : "#94a3b8" }} />
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Plate Number" hint="6–10 characters, unique">
                  <input className="av-input" placeholder="WB12AB1234"
                    value={form.plateNumber}
                    onChange={e => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                    style={{ fontFamily: "'DM Mono', monospace", letterSpacing: ".5px" }} />
                </Field>
                <Field label="Payload Capacity (kg)">
                  <input className="av-input" type="number" placeholder="e.g. 5000"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })} />
                </Field>
              </div>

              {/* status selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569",
                  letterSpacing: ".3px", display: "block", marginBottom: 8 }}>
                  Status
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {STATUS_OPTIONS.map(s => {
                    const meta = STATUS_META[s];
                    const selected = form.status === s;
                    return (
                      <button key={s} type="button"
                        onClick={() => setForm({ ...form, status: s })}
                        style={{
                          flex: 1, padding: "8px 6px", borderRadius: 10, cursor: "pointer",
                          border: selected ? `1.5px solid ${meta.dot}` : "1.5px solid #e2e8f0",
                          background: selected ? (
                            s === "active" ? "#f0fdf4" : s === "inactive" ? "#fffbeb" : "#fff1f2"
                          ) : "#fff",
                          color: selected ? meta.dot : "#94a3b8",
                          fontSize: 12, fontWeight: 700, transition: "all .15s",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%",
                          background: selected ? meta.dot : "#d1d5db", flexShrink: 0 }} />
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "#f1f5f9", margin: "20px 0" }} />

            <div style={{ display: "flex", gap: 10 }}>
              <button className="av-submit-btn" disabled={loading} onClick={submit}>
                <FaCheckCircle size={13} />
                {loading ? "Saving…" : editId ? "Update Vehicle" : "Add Vehicle"}
              </button>
              {editId && (
                <button className="av-cancel-btn" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </div>

          {/* ══ RIGHT: Table ════════════════════════════════════════════════ */}
          <div className="av-fade-up av-fade-up-2" style={{
            background: "#fff", borderRadius: 20, padding: 28,
            boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.07)",
          }}>
            {/* table header */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between",
              alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: "#0f172a" }}>Fleet List</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {filteredVehicles.length} of {vehicles.length} vehicles
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <div className="av-search-wrap">
                  <FaSearch className="av-search-icon" />
                  <input className="av-filter" placeholder="Search name or plate…"
                    style={{ width: 190 }} value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="av-filter" value={filterType}
                  onChange={e => setFilterType(e.target.value)}>
                  <option value="all">All types</option>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="av-filter" value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {hasFilters && (
                  <button className="av-clear-btn"
                    onClick={() => { setSearchTerm(""); setFilterType("all"); setFilterStatus("all"); }}>
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
                      {["Name", "Type", "Plate No.", "Capacity", "Status", ""].map(h => (
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

                    {!loadingList && filteredVehicles.map((v, i) => (
                      <tr key={v._id} className="av-tr"
                        style={{ background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9",
                          fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>
                          {v.name}
                        </td>
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          <TypeBadge type={v.type} />
                        </td>
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          <span className="mono" style={{ fontSize: 13, fontWeight: 500,
                            letterSpacing: ".5px", color: "#334155",
                            background: "#f1f5f9", padding: "3px 9px", borderRadius: 7 }}>
                            {v.plateNumber}
                          </span>
                        </td>
                        <td className="mono" style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9",
                          fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                          {v.capacity}
                          <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400, marginLeft: 3 }}>kg</span>
                        </td>
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          <span className={`av-pill ${STATUS_META[v.status]?.pill ?? "av-pill-amber"}`}>
                            {v.status}
                          </span>
                        </td>
                        <td style={{ padding: "13px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          <div className="av-row-actions">
                            <button className="av-icon-btn av-btn-edit" title="Edit"
                              onClick={() => startEdit(v)}><FaEdit /></button>
                            <button className="av-icon-btn av-btn-del" title="Delete"
                              onClick={() => del(v._id)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!loadingList && filteredVehicles.length === 0 && (
                      <tr><td colSpan={6}>
                        <div style={{ textAlign: "center", padding: "44px 24px" }}>
                          <FaTruck style={{ fontSize: 28, color: "#e2e8f0", marginBottom: 10 }} />
                          <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 4 }}>
                            No vehicles found
                          </div>
                          <div style={{ fontSize: 13, color: "#94a3b8" }}>
                            Try adjusting your filters or register a new vehicle.
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* footer */}
            {!loadingList && filteredVehicles.length > 0 && (
              <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between",
                alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>
                  Showing <strong style={{ color: "#334155" }}>{filteredVehicles.length}</strong> vehicle{filteredVehicles.length !== 1 ? "s" : ""}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "active",      bg: "#dcfce7", color: "#15803d" },
                    { label: "inactive",    bg: "#fef9c3", color: "#a16207" },
                    { label: "maintenance", bg: "#fee2e2", color: "#b91c1c" },
                  ].map(s => (
                    <span key={s.label} style={{ fontSize: 12, background: s.bg, color: s.color,
                      padding: "3px 10px", borderRadius: 99, fontWeight: 700 }}>
                      {countByStatus[s.label]} {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}