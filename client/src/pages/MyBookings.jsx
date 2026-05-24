import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

/* ─── global styles ─────────────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "mb-styles";
    style.textContent = `
      .mb-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
      .mb-root .mono { font-family: 'DM Mono', monospace; }

      @keyframes mb-fadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes mb-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes mb-float {
        0%, 100% { transform: translateY(0px) rotate(-8deg); }
        50%       { transform: translateY(-10px) rotate(-8deg); }
      }
      @keyframes mb-float2 {
        0%, 100% { transform: translateY(0px) rotate(12deg); }
        50%       { transform: translateY(-7px) rotate(12deg); }
      }

      .mb-fade-1 { animation: mb-fadeUp .55s cubic-bezier(.22,1,.36,1) .05s both; }
      .mb-fade-2 { animation: mb-fadeUp .55s cubic-bezier(.22,1,.36,1) .13s both; }
      .mb-fade-3 { animation: mb-fadeUp .55s cubic-bezier(.22,1,.36,1) .21s both; }
      .mb-fade-4 { animation: mb-fadeUp .55s cubic-bezier(.22,1,.36,1) .29s both; }

      .mb-skeleton {
        background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
        background-size: 200% 100%;
        animation: mb-shimmer 1.4s infinite;
        border-radius: 8px;
      }

      /* stat chips in hero */
      .mb-stat-chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 14px; border-radius: 99px; font-size: 12px; font-weight: 700;
        letter-spacing: .3px; text-transform: capitalize;
        background: rgba(255,255,255,.12); color: rgba(255,255,255,.85);
        border: 1px solid rgba(255,255,255,.18);
      }

      /* filter bar */
      .mb-search-input {
        border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 9px 14px 9px 36px;
        font-size: 13.5px; color: #0f172a; background: #fff; outline: none;
        transition: border-color .2s, box-shadow .2s; width: 240px;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .mb-search-input:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(129,140,248,.15); }
      .mb-search-input::placeholder { color: #94a3b8; }

      .mb-select {
        border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 9px 14px;
        font-size: 13.5px; color: #0f172a; background: #fff; outline: none;
        cursor: pointer; transition: border-color .2s;
        font-family: 'Plus Jakarta Sans', sans-serif; appearance: none;
        padding-right: 32px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%2394a3b8' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: right 10px center;
      }
      .mb-select:focus { border-color: #818cf8; }

      .mb-clear-btn {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 9px 13px; border-radius: 12px; font-size: 12.5px; font-weight: 600;
        color: #64748b; background: #f1f5f9; border: none; cursor: pointer;
        transition: background .15s, color .15s;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .mb-clear-btn:hover { background: #e2e8f0; color: #374151; }

      /* transport request card */
      .mb-card {
        background: #fff; border-radius: 18px; border: 1.5px solid #f1f5f9;
        overflow: hidden; transition: border-color .2s, transform .22s, box-shadow .22s;
      }
      .mb-card:hover { border-color: #e0e7ff; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.09); }

      .mb-card-header {
        padding: 18px 20px 14px;
        border-bottom: 1.5px solid #f8fafc;
      }

      .mb-card-body { padding: 14px 20px 18px; }

      .mb-detail-row {
        display: flex; align-items: center; gap: 8px;
        font-size: 13px; color: #64748b; margin-bottom: 7px;
      }
      .mb-detail-row:last-child { margin-bottom: 0; }
      .mb-detail-icon {
        width: 26px; height: 26px; border-radius: 8px;
        background: #f8fafc; display: flex; align-items: center;
        justify-content: center; flex-shrink: 0; font-size: 12px; color: #6366f1;
      }

      /* status pill */
      .mb-pill {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 99px; font-size: 11px;
        font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
      }
      .mb-pill-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }

      /* empty state */
      .mb-empty { text-align: center; padding: 56px 24px; }
      .mb-empty-icon {
        width: 64px; height: 64px; border-radius: 20px;
        background: linear-gradient(135deg, #ede9fe, #e0e7ff);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px; font-size: 26px; color: #7c3aed;
      }

      /* route arrow connector */
      .mb-route-arrow { color: #a5b4fc; font-size: 14px; margin: 0 6px; }

      /* floating deco */
      .mb-deco-1 {
        position: absolute; font-size: 68px; opacity: .055;
        animation: mb-float 4.5s ease-in-out infinite; color: #fff;
        right: 7%; top: 16%;
      }
      .mb-deco-2 {
        position: absolute; font-size: 38px; opacity: .04;
        animation: mb-float2 5.5s ease-in-out infinite; color: #fff;
        right: 24%; bottom: 12%;
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

/* ─── constants ──────────────────────────────────────────────────────────── */
const STATUS_ORDER = [
  "pending",
  "scheduled",
  "loading",
  "in_transit",
  "delivered",
  "cancelled",
];

const STATUS_META = {
  pending: { bg: "#fef9c3", color: "#a16207", dot: "#ca8a04" },
  scheduled: { bg: "#dbeafe", color: "#1d4ed8", dot: "#2563eb" },
  loading: { bg: "#ede9fe", color: "#7c3aed", dot: "#8b5cf6" },
  in_transit: { bg: "#cffafe", color: "#0f766e", dot: "#06b6d4" },
  delivered: { bg: "#dcfce7", color: "#15803d", dot: "#16a34a" },
  cancelled: { bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" },
  default: { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
};

const STAT_HERO_COLORS = {
  pending: { bg: "rgba(253,224,71,.12)", color: "#fde68a" },
  scheduled: { bg: "rgba(147,197,253,.14)", color: "#93c5fd" },
  loading: { bg: "rgba(196,181,253,.13)", color: "#c4b5fd" },
  in_transit: { bg: "rgba(103,232,249,.12)", color: "#67e8f9" },
  delivered: { bg: "rgba(134,239,172,.14)", color: "#bbf7d0" },
  cancelled: { bg: "rgba(252,165,165,.13)", color: "#fca5a5" },
};

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
};

const fmtWeight = (w) => w ? `${Number(w).toLocaleString("en-IN")} kg` : "—";

/* ─── SVG icons (inline, no dependency) ─────────────────────────────────── */
const IconTruck = ({ size = 16, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 4v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconPackage = ({ size = 16, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconClock = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
  </svg>
);
const IconMap = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);
const IconUser = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconSearch = ({ size = 15, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconX = ({ size = 11, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={style}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconArrow = ({ size = 13, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconFilter = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconWeight = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="5" r="3"/><path d="M6.5 8h11l-2 10H8.5L6.5 8z"/><path d="M12 18v4"/><path d="M8 22h8"/>
  </svg>
);
const IconFlag = ({ size = 14, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

/* ─── skeleton card ──────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="mb-card" style={{ pointerEvents: "none" }}>
    <div className="mb-card-header">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="mb-skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div className="mb-skeleton" style={{ height: 13, width: "50%", marginBottom: 7 }} />
          <div className="mb-skeleton" style={{ height: 11, width: "30%" }} />
        </div>
        <div className="mb-skeleton" style={{ height: 22, width: 80, borderRadius: 99 }} />
      </div>
    </div>
    <div className="mb-card-body">
      <div className="mb-skeleton" style={{ height: 11, width: "65%", marginBottom: 8 }} />
      <div className="mb-skeleton" style={{ height: 11, width: "45%", marginBottom: 8 }} />
      <div className="mb-skeleton" style={{ height: 11, width: "55%" }} />
    </div>
  </div>
);

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════════════ */
export default function MyTransportRequests() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    api.get("/bookings/my")
      .then(({ data }) => setShipments(data.value ?? data))
      .catch(() => toast.error("Failed to load transport requests"))
      .finally(() => setLoading(false));
  }, []);

  /* ── derived ── */
  const stats = useMemo(() => {
    return shipments.reduce(
      (acc, s) => {
        const key = (s.status || "").toLowerCase();
        acc.total += 1;
        if (key) acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { total: 0 }
    );
  }, [shipments]);

  const statusOptions = useMemo(() => {
    const unique = new Set(shipments.map((s) => (s.status || "").toLowerCase()).filter(Boolean));
    const ordered = STATUS_ORDER.filter((s) => unique.has(s));
    const rest = [...unique].filter((s) => !STATUS_ORDER.includes(s));
    return [...ordered, ...rest];
  }, [shipments]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return shipments.filter((s) => {
      const src       = (s.routeId?.source || "").toLowerCase();
      const dest      = (s.routeId?.destination || "").toLowerCase();
      const product   = (s.productType || "").toLowerCase();
      const shipment  = (s.shipmentType || "").toLowerCase();
      const batch     = (s.batchNumber || "").toLowerCase();
      const matchesTerm   = !term || src.includes(term) || dest.includes(term) || product.includes(term) || shipment.includes(term) || batch.includes(term);
      const matchesStatus = statusFilter === "all" || (s.status || "").toLowerCase() === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter]);

  const hasFilters = searchTerm || statusFilter !== "all";

  /* ── render ── */
  return (
    <div className="mb-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <GlobalStyles />
      <Navbar />

      {/* ── hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "36px 0 80px", position: "relative", overflow: "hidden",
      }}>
        {/* decorative floating icons */}
        <div className="mb-deco-1"><IconTruck size={68} /></div>
        <div className="mb-deco-2"><IconPackage size={38} /></div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
          <div className="mb-fade-1">
            {/* kicker */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 12, fontWeight: 700, letterSpacing: ".8px",
              color: "rgba(255,255,255,.4)", textTransform: "uppercase", marginBottom: 10,
            }}>
              <IconTruck size={13} style={{ opacity: .6 }} /> Transport
            </div>

            <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.2 }}>
              My{" "}
              <span style={{
                background: "linear-gradient(90deg, #a5b4fc, #c4b5fd)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Transport Requests
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", margin: "0 0 22px" }}>
              Track dispatch requests, delivery progress and logistics status.
            </p>

            {/* stat chips */}
            {!loading && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="mb-stat-chip">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.5)" }} />
                  Total: {stats.total}
                </span>
                {statusOptions.map((s) => {
                  const meta = STAT_HERO_COLORS[s] || STAT_HERO_COLORS.pending;
                  return (
                    <span key={s} className="mb-stat-chip"
                      style={{ background: meta.bg, color: meta.color, borderColor: "transparent" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, opacity: .8 }} />
                      {s.replace(/_/g, " ")}: {stats[s] || 0}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── main ── */}
      <main style={{ maxWidth: 960, margin: "-52px auto 48px", padding: "0 24px" }}>

        {/* ── panel ── */}
        <div className="mb-fade-2" style={{
          background: "#fff", borderRadius: 22,
          boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.08)",
          overflow: "hidden",
        }}>

          {/* panel header */}
          <div style={{
            padding: "20px 24px 18px",
            borderBottom: "1.5px solid #f8fafc",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 14,
          }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 3px" }}>
                All Transport Requests
              </h2>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                {loading ? "Loading…" : `${filtered.length} of ${shipments.length} requests`}
              </div>
            </div>

            {/* filters */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* search */}
              <div style={{ position: "relative" }}>
                <IconSearch size={15} style={{
                  position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
                  color: "#94a3b8", pointerEvents: "none",
                }} />
                <input
                  className="mb-search-input"
                  placeholder="Search shipment, route or product…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* status filter */}
              <div style={{ position: "relative" }}>
                <IconFilter size={13} style={{
                  position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
                  color: "#94a3b8", pointerEvents: "none",
                }} />
                <select
                  className="mb-select"
                  style={{ paddingLeft: 30 }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All status</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ").charAt(0).toUpperCase() + s.replace(/_/g, " ").slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* clear */}
              {hasFilters && (
                <button className="mb-clear-btn" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
                  <IconX size={10} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* panel body */}
          <div style={{ padding: 20 }}>
            {loading ? (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14,
              }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mb-empty">
                <div className="mb-empty-icon"><IconTruck size={28} /></div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>
                  No transport requests found
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
                  {hasFilters
                    ? "Try adjusting your search or filter."
                    : "Create a new transport request to get started."}
                </div>
                {!hasFilters && (
                  <Link to="/routes" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "10px 22px", borderRadius: 12,
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(99,102,241,.3)",
                  }}>
                    <IconPackage size={13} /> Explore Logistics Routes
                  </Link>
                )}
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(288px, 1fr))",
                gap: 14,
              }}>
                {filtered.map((s) => {
                  const statusKey = (s.status || "").toLowerCase();
                  const meta = STATUS_META[statusKey] || STATUS_META.default;

                  return (
                    <div key={s._id} className="mb-card">
                      {/* card top */}
                      <div className="mb-card-header">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          {/* truck icon */}
                          <div style={{
                            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                            background: "linear-gradient(135deg, #ede9fe, #dbeafe)",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", color: "#7c3aed",
                          }}>
                            <IconTruck size={16} />
                          </div>

                          {/* route */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              display: "flex", alignItems: "center", gap: 4,
                              fontWeight: 800, fontSize: 14, color: "#0f172a",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 90 }}>
                                {s.routeId?.source || "Unknown"}
                              </span>
                              <IconArrow size={12} style={{ color: "#a5b4fc", flexShrink: 0 }} />
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 90 }}>
                                {s.routeId?.destination || "Unknown"}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                              {s.productType || "Product"} · {s.shipmentType?.replace(/_/g, " ") || "Shipment"}
                            </div>
                          </div>

                          {/* status pill */}
                          <span className="mb-pill" style={{ background: meta.bg, color: meta.color, flexShrink: 0 }}>
                            <span className="mb-pill-dot" style={{ background: meta.dot }} />
                            {s.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      {/* card body */}
                      <div className="mb-card-body">
                        <div className="mb-detail-row">
                          <div className="mb-detail-icon"><IconPackage size={12} /></div>
                          <span>
                            Shipment: <strong style={{ color: "#334155", fontWeight: 600 }}>
                              {s.shipmentType?.replace(/_/g, " ") || "—"}
                            </strong>
                          </span>
                        </div>

                        <div className="mb-detail-row">
                          <div className="mb-detail-icon"><IconWeight size={12} /></div>
                          <span>
                            Weight: <strong style={{ color: "#334155", fontWeight: 600 }}>
                              {fmtWeight(s.loadWeightKg)}
                            </strong>
                          </span>
                        </div>

                        <div className="mb-detail-row">
                          <div className="mb-detail-icon"><IconClock size={12} /></div>
                          <span>
                            Dispatch: <strong style={{ color: "#334155", fontWeight: 600 }}>
                              {fmtDate(s.travelDate || s.scheduledAt)}
                            </strong>
                          </span>
                        </div>

                        <div className="mb-detail-row">
                          <div className="mb-detail-icon"><IconFlag size={12} /></div>
                          <span>
                            Priority: <strong style={{ color: "#334155", fontWeight: 600 }}>
                              {s.priority?.toUpperCase() || "—"}
                            </strong>
                          </span>
                        </div>

                        {s.batchNumber && (
                          <div className="mb-detail-row">
                            <div className="mb-detail-icon"><IconPackage size={12} /></div>
                            <span>
                              Batch: <strong className="mono" style={{ color: "#334155", fontWeight: 600 }}>
                                {s.batchNumber}
                              </strong>
                            </span>
                          </div>
                        )}

                        {/* vehicle & driver row */}
                        <div style={{
                          marginTop: 14, paddingTop: 12, borderTop: "1.5px solid #f8fafc",
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {s.vehicleId?.plateNumber && (
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                Vehicle: <span className="mono" style={{ fontWeight: 600, color: "#475569" }}>{s.vehicleId.plateNumber}</span>
                              </span>
                            )}
                            {s.driverId?.name && (
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                Driver: <span style={{ fontWeight: 600, color: "#475569" }}>{s.driverId.name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── back link ── */}
        <div className="mb-fade-4" style={{ marginTop: 18, textAlign: "center" }}>
          <Link to="/dashboard" style={{
            fontSize: 13, color: "#94a3b8", textDecoration: "none", fontWeight: 500,
          }}>
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}