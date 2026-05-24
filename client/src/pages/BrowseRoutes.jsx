import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api, { getDrivers } from "../api";
import toast from "react-hot-toast";

/* ─── constants ─────────────────────────────────────────────────────────── */
const CARGO_TYPES = [
  { value: "raw_material",    label: "Raw Material" },
  { value: "finished_goods",  label: "Finished Goods" },
  { value: "equipment",       label: "Equipment" },
  { value: "spare_parts",     label: "Spare Parts" },
  { value: "chemicals",       label: "Chemicals" },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
  { value: "urgent", label: "Urgent" },
];

const priorityColor = {
  low:    { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  medium: { bg: "#fffbeb", border: "#fde68a", text: "#d97706" },
  high:   { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
  urgent: { bg: "#fef2f2", border: "#ef4444", text: "#ef4444" },
};

const typeColor = {
  factory:   { bg: "#dbeafe", text: "#1d4ed8" },
  warehouse: { bg: "#fef3c7", text: "#b45309" },
  dealer:    { bg: "#dcfce7", text: "#15803d" },
  plant:     { bg: "#ede9fe", text: "#6d28d9" },
};

/* ─── global styles ─────────────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "mlr-styles";
    style.textContent = `
      .mlr * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
      .mlr .mono { font-family: 'DM Mono', monospace; }

      @keyframes mlr-fadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes mlr-float {
        0%, 100% { transform: translateY(0px) rotate(-8deg); }
        50%       { transform: translateY(-10px) rotate(-8deg); }
      }
      @keyframes mlr-modalIn {
        from { opacity: 0; transform: scale(.94) translateY(16px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes mlr-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      .mlr-fade-1 { animation: mlr-fadeUp .55s cubic-bezier(.22,1,.36,1) .05s both; }
      .mlr-fade-2 { animation: mlr-fadeUp .55s cubic-bezier(.22,1,.36,1) .13s both; }

      .mlr-skeleton {
        background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
        background-size: 200% 100%;
        animation: mlr-shimmer 1.4s infinite;
        border-radius: 8px;
      }

      .mlr-card {
        background: #fff; border-radius: 18px;
        border: 1.5px solid #f1f5f9; overflow: hidden;
        transition: border-color .2s, transform .22s, box-shadow .22s;
        display: flex; flex-direction: column;
        cursor: default;
      }
      .mlr-card:hover {
        border-color: #e0e7ff;
        transform: translateY(-3px);
        box-shadow: 0 12px 32px rgba(0,0,0,.09);
      }

      .mlr-req-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 700;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff; border: none; cursor: pointer; white-space: nowrap;
        transition: opacity .18s, transform .18s;
        box-shadow: 0 4px 14px rgba(99,102,241,.28);
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .mlr-req-btn:hover { opacity: .9; transform: translateY(-1px); }

      .mlr-overlay {
        position: fixed; inset: 0;
        background: rgba(15,23,42,.55);
        display: flex; align-items: center; justify-content: center;
        z-index: 9000; padding: 16px;
        backdrop-filter: blur(2px);
      }
      .mlr-modal {
        background: #fff; border-radius: 22px;
        width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto;
        box-shadow: 0 24px 64px rgba(0,0,0,.22);
        animation: mlr-modalIn .28s cubic-bezier(.22,1,.36,1) both;
      }

      .mlr-label {
        display: block; font-size: 11px; font-weight: 700;
        color: #64748b; letter-spacing: .4px;
        text-transform: uppercase; margin-bottom: 5px;
      }
      .mlr-input, .mlr-select {
        width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px;
        padding: 9px 13px; font-size: 14px; color: #0f172a;
        background: #fff; outline: none; margin-bottom: 14px;
        transition: border-color .2s, box-shadow .2s;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .mlr-input:focus, .mlr-select:focus {
        border-color: #818cf8;
        box-shadow: 0 0 0 3px rgba(129,140,248,.15);
      }

      .mlr-weight-counter {
        display: flex; align-items: center;
        border: 1.5px solid #e2e8f0; border-radius: 10px;
        overflow: hidden; margin-bottom: 14px;
        transition: border-color .2s;
      }
      .mlr-weight-counter:focus-within {
        border-color: #818cf8;
        box-shadow: 0 0 0 3px rgba(129,140,248,.15);
      }
      .mlr-weight-btn {
        width: 42px; height: 42px; border: none; background: #f8fafc;
        font-size: 18px; font-weight: 700; color: #6366f1; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background .15s; flex-shrink: 0;
      }
      .mlr-weight-btn:hover:not(:disabled) { background: #ede9fe; }
      .mlr-weight-btn:disabled { color: #cbd5e1; cursor: not-allowed; }
      .mlr-weight-val {
        flex: 1; text-align: center; font-size: 16px; font-weight: 700;
        color: #0f172a; border: none; outline: none; background: transparent;
        font-family: 'DM Mono', monospace;
      }

      .mlr-confirm-btn {
        flex: 1; padding: 12px; border-radius: 12px; border: none;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
        transition: opacity .18s;
        font-family: 'Plus Jakarta Sans', sans-serif;
        box-shadow: 0 4px 14px rgba(99,102,241,.28);
      }
      .mlr-confirm-btn:hover:not(:disabled) { opacity: .9; }
      .mlr-confirm-btn:disabled { opacity: .45; cursor: not-allowed; }

      .mlr-cancel-btn {
        flex: 1; padding: 12px; border-radius: 12px;
        border: 1.5px solid #e2e8f0; background: #fff; color: #64748b;
        font-size: 14px; font-weight: 600; cursor: pointer;
        transition: background .15s;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .mlr-cancel-btn:hover { background: #f8fafc; }

      .mlr-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 99px;
        background: #f8fafc; border: 1px solid #f1f5f9;
        font-size: 12px; color: #64748b; font-weight: 500;
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

/* ─── skeleton card ──────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="mlr-card" style={{ padding: 20, pointerEvents: "none" }}>
    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
      <div className="mlr-skeleton" style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="mlr-skeleton" style={{ height: 14, width: "55%", marginBottom: 8 }} />
        <div className="mlr-skeleton" style={{ height: 11, width: "35%" }} />
      </div>
    </div>
    <div className="mlr-skeleton" style={{ height: 36, borderRadius: 10, marginTop: 8 }} />
  </div>
);

/* ═══ MAIN COMPONENT ═════════════════════════════════════════════════════════ */
export default function BrowseRoutes() {
  const [routes,     setRoutes]     = useState([]);
  const [locations,  setLocations]  = useState([]);
  const [vehicles,   setVehicles]   = useState([]);
  const [drivers,    setDrivers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);   // { origin, destination }
  const [submitting, setSubmitting] = useState(false);
  const [bookingRoute, setBookingRoute] = useState(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const emptyForm = {
    originId:         "",
    destinationId:    "",
    vehicleId:        "",
    driverId:         "",
    cargoType:        "",
    productType:      "",
    batchNumber:      "",
    weightKg:         1000,
    priority:         "medium",
    scheduledDate:    "",
    estimatedArrival: "",
    description:      "",
  };
  const [form, setForm] = useState(emptyForm);

  const [bookingForm, setBookingForm] = useState({
    shipmentType: "finished_goods",
    productType: "",
    batchNumber: "",
    loadWeightKg: 1000,
    priority: "medium",
    dispatchDate: "",
    assignedVehicle: "",
    assignedDriver: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      api.get("/routes"),
      api.get("/locations"),
      api.get("/vehicles"),
      getDrivers(),
    ]).then(([r, l, v, d]) => {
      setRoutes(r.data.value ?? r.data);
      setLocations(l.data);
      setVehicles(v.data.filter(v => v.status === "available"));
      setDrivers(d.data.filter(d => d.status === "available"));
    }).catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  /* pair every origin with every destination (excluding same location) */
  const routePairs = [];
  for (const origin of locations) {
    for (const dest of locations) {
      if (origin._id !== dest._id) {
        routePairs.push({ origin, destination: dest });
      }
    }
  }

  const openModal = (pair) => {
    setSelected(pair);
    setForm({
      ...emptyForm,
      originId:      pair.origin._id,
      destinationId: pair.destination._id,
    });
  };

  const closeModal = () => { setSelected(null); setForm(emptyForm); };

  const openBookingModal = (route) => {
    setBookingRoute(route);
    setBookingForm({
      shipmentType: "finished_goods",
      productType: `${route.source} to ${route.destination}`,
      batchNumber: "",
      loadWeightKg: 1000,
      priority: "medium",
      dispatchDate: "",
      assignedVehicle: route.vehicleId?._id || "",
      assignedDriver: "",
      notes: "",
    });
  };

  const closeBookingModal = () => {
    setBookingRoute(null);
  };

  const adjustWeight = (delta) =>
    setForm(f => ({ ...f, weightKg: Math.max(100, f.weightKg + delta) }));

  const f = (field) => ({
    value: form[field],
    onChange: e => setForm(prev => ({ ...prev, [field]: e.target.value })),
  });

  const handleSubmit = async () => {
    if (!form.vehicleId)        return toast.error("Select a vehicle");
    if (!form.driverId)         return toast.error("Select a driver");
    if (!form.cargoType)        return toast.error("Select cargo type");
    if (!form.productType)      return toast.error("Enter product / material name");
    if (!form.scheduledDate)    return toast.error("Select dispatch date & time");
    if (!form.estimatedArrival) return toast.error("Select estimated arrival");

    const vehicle = vehicles.find(v => v._id === form.vehicleId);
    if (vehicle && form.weightKg > vehicle.loadCapacityKg)
      return toast.error(`Exceeds vehicle capacity of ${vehicle.loadCapacityKg} kg`);

    setSubmitting(true);
    try {
      await api.post("/shipments", {
        origin:           form.originId,
        destination:      form.destinationId,
        vehicleId:        form.vehicleId,
        driverId:         form.driverId,
        cargoType:        `${form.cargoType} — ${form.productType}`,
        weightKg:         Number(form.weightKg),
        description:      [
          form.batchNumber ? `Batch: ${form.batchNumber}` : "",
          `Priority: ${form.priority}`,
          form.description,
        ].filter(Boolean).join(" | "),
        scheduledDate:    form.scheduledDate,
        estimatedArrival: form.estimatedArrival,
      });
      toast.success("Shipment scheduled successfully!");
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule shipment");
    } finally {
      setSubmitting(false); }
  };

  const handleBookRoute = async () => {
    if (!bookingRoute) return;
    if (!bookingForm.productType.trim()) return toast.error("Enter product name");
    if (!bookingForm.loadWeightKg) return toast.error("Enter load weight");
    if (!bookingForm.dispatchDate) return toast.error("Select dispatch date");

    setBookingSubmitting(true);
    try {
      await api.post("/bookings", {
        routeId: bookingRoute._id,
        shipmentType: bookingForm.shipmentType,
        productType: bookingForm.productType,
        batchNumber: bookingForm.batchNumber,
        loadWeightKg: Number(bookingForm.loadWeightKg),
        priority: bookingForm.priority,
        dispatchDate: bookingForm.dispatchDate,
        assignedVehicle: bookingForm.assignedVehicle || undefined,
        assignedDriver: bookingForm.assignedDriver || undefined,
        notes: bookingForm.notes,
      });
      toast.success("Route booked successfully!");
      closeBookingModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book route");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <div className="mlr" style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 88 }}>
      <GlobalStyles />
      <Navbar />

      {/* ── hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "40px 0 88px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: "8%", top: "18%", fontSize: 72, opacity: .05 }}>🚛</div>
        <div style={{ position: "absolute", right: "26%", bottom: "10%", fontSize: 42, opacity: .04 }}>🏭</div>

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
          <div className="mlr-fade-1">
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".8px", color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 10 }}>
              🏭 Manufacturing Transport Module
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 10px", lineHeight: 1.2 }}>
              Schedule a{" "}
              <span style={{
                background: "linear-gradient(90deg, #a5b4fc, #c4b5fd)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Shipment
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", margin: 0 }}>
              Select a route between any two locations and create a transport request.
            </p>
          </div>
        </div>
      </div>

      {/* ── main panel ── */}
      <main style={{ maxWidth: 1000, margin: "-56px auto 48px", padding: "0 24px" }}>
        <div className="mlr-fade-2" style={{
          background: "#fff", borderRadius: 22,
          boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.08)",
          overflow: "hidden",
        }}>

          <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f8fafc" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 3px" }}>
              Active Routes From Admin
            </h2>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {loading ? "Loading…" : `${routes.length} active route${routes.length !== 1 ? "s" : ""}`}
            </div>
          </div>

          <div style={{ padding: 20, borderBottom: "1.5px solid #f8fafc" }}>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : routes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 8px", color: "#94a3b8", fontSize: 13 }}>
                No active routes published yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {routes.map((route) => (
                  <div key={route._id} className="mlr-card" style={{ cursor: "default" }}>
                    <div style={{ padding: "18px 20px 14px", borderBottom: "1.5px solid #f8fafc" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#dbeafe,#ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🚛</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                            {route.source} → {route.destination}
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                            {route.distance} km · {route.estimatedDuration} hrs
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="mlr-chip">{route.routeType.replace(/_/g, " ")}</span>
                        <span className="mlr-chip">{route.dispatchWindow}</span>
                        <span className="mlr-chip">{route.status}</span>
                      </div>
                    </div>

                    <div style={{ padding: "14px 20px 18px", fontSize: 13, color: "#475569" }}>
                      <div style={{ marginBottom: 10 }}>
                        Vehicle: {route.vehicleId?.name || "—"}
                      </div>
                      <button
                        className="mlr-req-btn"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => openBookingModal(route)}
                      >
                        Book Route
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* panel header */}
          <div style={{ padding: "22px 24px 18px", borderBottom: "1.5px solid #f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 3px" }}>
                Available Routes
              </h2>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {loading ? "Loading…" : `${routePairs.length} route${routePairs.length !== 1 ? "s" : ""} available`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
              {["factory","warehouse","dealer","plant"].map(t => (
                <span key={t} style={{
                  padding: "3px 10px", borderRadius: 99,
                  background: typeColor[t].bg, color: typeColor[t].text,
                  fontWeight: 600, fontSize: 11, textTransform: "capitalize",
                }}>{t}</span>
              ))}

              {bookingRoute && (
                <div className="mlr-overlay" onClick={(e) => e.target === e.currentTarget && closeBookingModal()}>
                  <div className="mlr-modal">
                    <div style={{ padding: "22px 24px 16px", borderBottom: "1.5px solid #f8fafc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                            Book Route
                          </div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                            {bookingRoute.source} → {bookingRoute.destination}
                          </div>
                        </div>
                        <button onClick={closeBookingModal} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
                      </div>
                    </div>

                    <div style={{ padding: "20px 24px 24px" }}>
                      <label className="mlr-label">Shipment Type</label>
                      <select className="mlr-select" value={bookingForm.shipmentType} onChange={(e) => setBookingForm((p) => ({ ...p, shipmentType: e.target.value }))}>
                        {CARGO_TYPES.slice(0, 3).map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>

                      <label className="mlr-label">Product / Material Name</label>
                      <input className="mlr-input" value={bookingForm.productType} onChange={(e) => setBookingForm((p) => ({ ...p, productType: e.target.value }))} />

                      <label className="mlr-label">Batch / Lot Number (optional)</label>
                      <input className="mlr-input" value={bookingForm.batchNumber} onChange={(e) => setBookingForm((p) => ({ ...p, batchNumber: e.target.value }))} />

                      <label className="mlr-label">Load Weight (kg)</label>
                      <input className="mlr-input" type="number" min="1" value={bookingForm.loadWeightKg} onChange={(e) => setBookingForm((p) => ({ ...p, loadWeightKg: e.target.value }))} />

                      <label className="mlr-label">Priority</label>
                      <select className="mlr-select" value={bookingForm.priority} onChange={(e) => setBookingForm((p) => ({ ...p, priority: e.target.value }))}>
                        {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>

                      <label className="mlr-label">Dispatch Date & Time</label>
                      <input className="mlr-input" type="datetime-local" value={bookingForm.dispatchDate} onChange={(e) => setBookingForm((p) => ({ ...p, dispatchDate: e.target.value }))} />

                      <label className="mlr-label">Assigned Vehicle (optional)</label>
                      <select className="mlr-select" value={bookingForm.assignedVehicle} onChange={(e) => setBookingForm((p) => ({ ...p, assignedVehicle: e.target.value }))}>
                        <option value="">No vehicle assigned</option>
                        {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name} ({v.registrationNo})</option>)}
                      </select>

                      <label className="mlr-label">Assigned Driver (optional)</label>
                      <select className="mlr-select" value={bookingForm.assignedDriver} onChange={(e) => setBookingForm((p) => ({ ...p, assignedDriver: e.target.value }))}>
                        <option value="">No driver assigned</option>
                        {drivers.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>

                      <label className="mlr-label">Notes (optional)</label>
                      <textarea className="mlr-input" rows={2} style={{ resize: "vertical", minHeight: 70 }} value={bookingForm.notes} onChange={(e) => setBookingForm((p) => ({ ...p, notes: e.target.value }))} />

                      <div style={{ display: "flex", gap: 10 }}>
                        <button className="mlr-confirm-btn" onClick={handleBookRoute} disabled={bookingSubmitting}>
                          {bookingSubmitting ? "Booking…" : "Book Route"}
                        </button>
                        <button className="mlr-cancel-btn" onClick={closeBookingModal}>Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* route cards */}
          <div style={{ padding: 20 }}>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : routePairs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 24px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏭</div>
                <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>No locations added yet</p>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>Ask admin to add factory / warehouse / dealer locations first.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                {routePairs.map((pair, i) => {
                  const oColor = typeColor[pair.origin.type]      || typeColor.factory;
                  const dColor = typeColor[pair.destination.type] || typeColor.factory;
                  return (
                    <div key={i} className="mlr-card">
                      {/* top */}
                      <div style={{ padding: "18px 20px 14px", borderBottom: "1.5px solid #f8fafc" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#dbeafe,#ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🚛</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 95 }}>{pair.origin.name}</span>
                              <span style={{ color: "#a5b4fc", fontSize: 16, flexShrink: 0 }}>→</span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 95 }}>{pair.destination.name}</span>
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                              {pair.origin.city} → {pair.destination.city}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span className="mlr-chip" style={{ background: oColor.bg, color: oColor.text, border: "none" }}>
                            📍 {pair.origin.type}
                          </span>
                          <span className="mlr-chip" style={{ background: dColor.bg, color: dColor.text, border: "none" }}>
                            🏁 {pair.destination.type}
                          </span>
                        </div>
                      </div>

                      {/* bottom */}
                      <div style={{ padding: "14px 20px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 2 }}>Available</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>
                            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} · {drivers.length} driver{drivers.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <button className="mlr-req-btn" onClick={() => openModal(pair)}>
                          📦 Request
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── modal ── */}
      {selected && (
        <div className="mlr-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="mlr-modal">

            {/* modal header */}
            <div style={{ padding: "22px 24px 16px", borderBottom: "1.5px solid #f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg,#dbeafe,#ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🚛</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
                      {selected.origin.name} → {selected.destination.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                      {selected.origin.city} → {selected.destination.city}
                    </div>
                  </div>
                </div>
                <button onClick={closeModal} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
              </div>
            </div>

            {/* modal body */}
            <div style={{ padding: "20px 24px 24px" }}>

              {/* vehicle */}
              <label className="mlr-label">Vehicle</label>
              <select className="mlr-select" {...f("vehicleId")}>
                <option value="">Select vehicle…</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.registrationNo}) · {v.loadCapacityKg} kg · {v.type}
                  </option>
                ))}
              </select>

              {/* driver */}
              <label className="mlr-label">Driver</label>
              <select className="mlr-select" {...f("driverId")}>
                <option value="">Select driver…</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name}{d.phone ? ` · ${d.phone}` : ""}
                  </option>
                ))}
              </select>

              {/* cargo type */}
              <label className="mlr-label">Cargo Type</label>
              <select className="mlr-select" {...f("cargoType")}>
                <option value="">Select cargo type…</option>
                {CARGO_TYPES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* product / material */}
              <label className="mlr-label">Product / Material Name</label>
              <input className="mlr-input" placeholder="e.g. Steel Rods, Plastic Granules" {...f("productType")} />

              {/* batch number */}
              <label className="mlr-label">Batch / Lot Number (optional)</label>
              <input className="mlr-input" placeholder="e.g. BATCH-2024-0045" {...f("batchNumber")} />

              {/* load weight */}
              <label className="mlr-label">Load Weight (kg)</label>
              <div className="mlr-weight-counter">
                <button className="mlr-weight-btn" onClick={() => adjustWeight(-500)} disabled={form.weightKg <= 100}>−</button>
                <span className="mlr-weight-val">{form.weightKg.toLocaleString("en-IN")}</span>
                <button className="mlr-weight-btn" onClick={() => adjustWeight(+500)}>+</button>
              </div>

              {/* capacity warning */}
              {form.vehicleId && (() => {
                const v = vehicles.find(v => v._id === form.vehicleId);
                if (!v) return null;
                const over = form.weightKg > v.loadCapacityKg;
                return (
                  <div style={{
                    background: over ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${over ? "#fecaca" : "#bbf7d0"}`,
                    color: over ? "#b91c1c" : "#15803d",
                    borderRadius: 10, padding: "10px 14px",
                    fontSize: 13, marginBottom: 14,
                  }}>
                    {over
                      ? `⚠️ Exceeds vehicle capacity of ${v.loadCapacityKg.toLocaleString("en-IN")} kg`
                      : `✅ Within vehicle capacity (${v.loadCapacityKg.toLocaleString("en-IN")} kg)`}
                  </div>
                );
              })()}

              {/* priority */}
              <label className="mlr-label">Priority Level</label>
              <select className="mlr-select" {...f("priority")}>
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>

              {/* scheduled date */}
              <label className="mlr-label">Dispatch Date & Time</label>
              <input className="mlr-input" type="datetime-local" min={minDate} {...f("scheduledDate")} />

              {/* estimated arrival */}
              <label className="mlr-label">Estimated Arrival</label>
              <input className="mlr-input" type="datetime-local" min={minDate} {...f("estimatedArrival")} />

              {/* notes */}
              <label className="mlr-label">Notes (optional)</label>
              <textarea className="mlr-input" rows={2} placeholder="Special handling, delivery instructions…"
                style={{ resize: "vertical", minHeight: 70 }}
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />

              {/* summary */}
              <div style={{ background: "linear-gradient(135deg,#dbeafe,#ede9fe)", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1e40af", letterSpacing: ".4px", textTransform: "uppercase", marginBottom: 8 }}>Summary</div>
                {[
                  ["Route",    `${selected.origin.name} → ${selected.destination.name}`],
                  ["Weight",   `${form.weightKg.toLocaleString("en-IN")} kg`],
                  ["Priority", form.priority.toUpperCase()],
                  ["Dispatch", form.scheduledDate ? new Date(form.scheduledDate).toLocaleString() : "—"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: "#64748b" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: "#1e40af" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="mlr-confirm-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Scheduling…" : "Schedule Shipment"}
                </button>
                <button className="mlr-cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}