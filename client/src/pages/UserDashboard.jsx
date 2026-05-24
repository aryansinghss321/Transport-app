import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import { FaTruck, FaBoxes, FaWarehouse, FaClock, FaIndustry } from "react-icons/fa";
import api from "../api";

/* ─── global styles ─────────────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = "user-dash-styles";
    style.textContent = `
      .ud-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
      .ud-root .mono { font-family: 'DM Mono', monospace; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(-6deg); }
        50%       { transform: translateY(-8px) rotate(-6deg); }
      }
      @keyframes float2 {
        0%, 100% { transform: translateY(0px) rotate(10deg); }
        50%       { transform: translateY(-6px) rotate(10deg); }
      }

      .ud-fade-1 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .05s both; }
      .ud-fade-2 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .13s both; }
      .ud-fade-3 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .21s both; }
      .ud-fade-4 { animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .29s both; }

      /* action cards */
      .ud-action-card {
        border-radius: 20px; padding: 28px; text-decoration: none;
        display: flex; flex-direction: column; gap: 14px;
        transition: transform .25s, box-shadow .25s;
        position: relative; overflow: hidden;
      }
      .ud-action-card:hover { transform: translateY(-5px); box-shadow: 0 24px 48px rgba(0,0,0,.16); }
      .ud-action-card::after {
        content: ''; position: absolute; inset: 0;
        background: rgba(255,255,255,.07);
        clip-path: ellipse(80% 70% at 110% 5%);
        pointer-events: none;
      }

      /* stat card */
      .ud-stat-card {
        background: #fff; border-radius: 16px; padding: 18px 20px;
        border: 1.5px solid #f1f5f9;
        transition: border-color .2s, transform .2s;
      }
      .ud-stat-card:hover { border-color: #e0e7ff; transform: translateY(-2px); }

      /* skeleton */
      .ud-skeleton {
        background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
        background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px;
      }

      /* recent transport request row */
      .ud-request-row {
        display: flex; align-items: center; gap: 12px; padding: 12px 14px;
        border-radius: 12px; transition: background .15s; cursor: default;
      }
      .ud-request-row:hover { background: #f8fafc; }

      /* greeting shimmer highlight */
      .ud-name-highlight {
        background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* status badges */
      .ud-status-high { background: #fef2f2; color: #dc2626; }
      .ud-status-urgent { background: #fef2f2; color: #ef4444; font-weight: 700; }
      .ud-status-medium { background: #fffbeb; color: #d97706; }
      .ud-status-low { background: #f0fdf4; color: #15803d; }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(link))  document.head.removeChild(link);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);
  return null;
}

/* ─── helpers ───────────────────────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const STATUS_META = {
  pending:    { bg: "#fef9c3", color: "#a16207", dot: "#ca8a04" },
  scheduled:  { bg: "#dbeafe", color: "#1d4ed8", dot: "#2563eb" },
  loading:    { bg: "#ede9fe", color: "#7c3aed", dot: "#8b5cf6" },
  in_transit: { bg: "#cffafe", color: "#0f766e", dot: "#06b6d4" },
  delivered:  { bg: "#dcfce7", color: "#15803d", dot: "#16a34a" },
  cancelled:  { bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" },
};

const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
};

const fmtWeight = (w) => w ? `${Number(w).toLocaleString("en-IN")} kg` : "—";

/* ─── skeleton stat ─────────────────────────────────────────────────────── */
const SkeletonStat = () => (
  <div className="ud-stat-card">
    <div className="ud-skeleton" style={{ height: 12, width: 70, marginBottom: 10 }} />
    <div className="ud-skeleton" style={{ height: 28, width: 50 }} />
  </div>
);

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════════════ */
export default function ManufacturingLogisticsDashboard() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);

  useEffect(() => {
    api.get("/bookings/my")
      .then(({ data }) => setShipments(data.value ?? data))
      .catch(() => setShipments([]))
      .finally(() => setLoadingShipments(false));
  }, []);

  /* ── derived stats ── */
  const totalRequests = shipments.length;
  const inTransit = shipments.filter(s => s.status === "in_transit").length;
  const delivered = shipments.filter(s => s.status === "delivered").length;
  const recentRequests = [...shipments]
    .sort((a, b) => new Date(b.createdAt || b.travelDate) - new Date(a.createdAt || a.travelDate))
    .slice(0, 4);

  const firstName = user?.name?.split(" ")[0] || "Operator";

  return (
    <div className="ud-root" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <GlobalStyles />
      <Navbar />

      {/* ── hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "36px 0 80px", position: "relative", overflow: "hidden",
      }}>
        {/* decorative floating icons */}
        <div style={{ position: "absolute", right: "8%", top: "18%",
          fontSize: 64, opacity: .06, animation: "float 4s ease-in-out infinite", color: "#fff" }}>
          <FaTruck />
        </div>
        <div style={{ position: "absolute", right: "22%", bottom: "14%",
          fontSize: 40, opacity: .05, animation: "float2 5s ease-in-out infinite", color: "#fff" }}>
          <FaWarehouse />
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <div className="ud-fade-1">
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", fontWeight: 500,
              letterSpacing: ".5px", margin: "0 0 6px", textTransform: "uppercase" }}>
              {getGreeting()} 👋
            </p>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 6px", lineHeight: 1.2 }}>
              Manufacturing{" "}
              <span style={{ background: "linear-gradient(90deg, #a5b4fc, #c4b5fd)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text" }}>
                Logistics Dashboard
              </span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", margin: 0 }}>
              Track shipment requests, dispatch schedules and logistics progress.
            </p>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: "-52px auto 48px", padding: "0 24px" }}>

        {/* ── action cards ── */}
        <div className="ud-fade-2" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24,
        }}>
          <Link to="/routes" className="ud-action-card"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 13,
              background: "rgba(255,255,255,.15)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>
              <FaTruck />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                Explore Logistics Routes
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)" }}>
                View manufacturing transport routes and dispatch paths
              </div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4 }}>
              Manage Routes →
            </div>
          </Link>

          <Link to="/my-transport-requests" className="ud-action-card"
            style={{ background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 13,
              background: "rgba(255,255,255,.15)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>
              <FaBoxes />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                My Transport Requests
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)" }}>
                View shipment requests and delivery progress
              </div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4 }}>
              Track Requests →
            </div>
          </Link>
        </div>

        {/* ── stats row ── */}
        <div className="ud-fade-3" style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24,
        }}>
          {loadingShipments ? (
            <><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
          ) : (
            <>
              <div className="ud-stat-card">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8",
                  letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>
                  Total Requests
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                  {totalRequests}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>transport requests</div>
              </div>

              <div className="ud-stat-card">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8",
                  letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>
                  In Transit
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#0f766e", lineHeight: 1 }}>
                  {inTransit}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>shipments active</div>
              </div>

              <div className="ud-stat-card">
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8",
                  letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 8 }}>
                  Delivered
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#15803d", lineHeight: 1 }}>
                  {delivered}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>completed deliveries</div>
              </div>
            </>
          )}
        </div>

        {/* ── recent transport requests ── */}
        <div className="ud-fade-4" style={{
          background: "#fff", borderRadius: 20, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.07)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Recent Transport Requests</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Latest shipment and logistics activity</div>
            </div>
            <Link to="/my-transport-requests" style={{ fontSize: 13, color: "#6366f1",
              fontWeight: 700, textDecoration: "none" }}>View all →</Link>
          </div>

          {loadingShipments ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0" }}>
                  <div className="ud-skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="ud-skeleton" style={{ height: 13, width: "55%", marginBottom: 6 }} />
                    <div className="ud-skeleton" style={{ height: 11, width: "35%" }} />
                  </div>
                  <div className="ud-skeleton" style={{ height: 22, width: 80, borderRadius: 99 }} />
                </div>
              ))}
            </div>
          ) : recentRequests.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {recentRequests.map((s, i) => {
                const meta = STATUS_META[s.status] ?? STATUS_META.pending;
                return (
                  <div key={s._id} className="ud-request-row"
                    style={{ borderBottom: i < recentRequests.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    {/* truck icon */}
                    <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                      background: "#ede9fe", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "#7c3aed", fontSize: 15 }}>
                      <FaTruck />
                    </div>

                    {/* route + shipment info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.routeId?.source || "—"} → {s.routeId?.destination || "—"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4,
                          fontSize: 12, color: "#94a3b8" }}>
                          <FaBoxes style={{ fontSize: 10 }} />
                          {s.shipmentType?.replace(/_/g, " ") || "Shipment"}
                        </span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4,
                          fontSize: 12, color: "#94a3b8" }}>
                          <FaClock style={{ fontSize: 10 }} />
                          {fmtDate(s.travelDate || s.scheduledAt)}
                        </span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          {fmtWeight(s.loadWeightKg)}
                        </span>
                      </div>
                    </div>

                    {/* priority badge */}
                    {s.priority && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: ".4px",
                        textTransform: "uppercase", flexShrink: 0, padding: "2px 8px",
                        borderRadius: 99,
                        background: s.priority === "urgent" ? "#fef2f2" :
                                   s.priority === "high" ? "#fef2f2" :
                                   s.priority === "medium" ? "#fffbeb" : "#f0fdf4",
                        color: s.priority === "urgent" ? "#ef4444" :
                               s.priority === "high" ? "#dc2626" :
                               s.priority === "medium" ? "#d97706" : "#15803d",
                      }}>
                        {s.priority.toUpperCase()}
                      </span>
                    )}

                    {/* status pill */}
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      letterSpacing: ".4px", textTransform: "uppercase", flexShrink: 0,
                      background: meta.bg, color: meta.color,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%",
                        background: meta.color, display: "inline-block" }} />
                      {s.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "36px 0" }}>
              <FaBoxes style={{ fontSize: 32, color: "#e2e8f0", marginBottom: 10 }} />
              <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 4 }}>No transport requests found</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                Create a new logistics request to get started
              </div>
              <Link to="/routes" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 11,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
                boxShadow: "0 4px 14px rgba(99,102,241,.35)",
              }}>
                <FaTruck size={12} /> Explore Logistics Routes
              </Link>
            </div>
          )}
        </div>

        {/* ── tip card ── */}
        <div style={{
          marginTop: 16, borderRadius: 16, padding: "16px 20px",
          background: "linear-gradient(135deg, #ede9fe, #dbeafe)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#7c3aed", flexShrink: 0 }}>
            <FaIndustry />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#3730a3", marginBottom: 2 }}>
              Logistics tip
            </div>
            <div style={{ fontSize: 12.5, color: "#4338ca" }}>
              Track shipment schedules and assign transport requests early for smoother manufacturing logistics.
            </div>
          </div>
          <Link to="/routes" style={{
            marginLeft: "auto", flexShrink: 0, padding: "8px 16px",
            borderRadius: 10, background: "#4f46e5", color: "#fff",
            fontWeight: 700, fontSize: 13, textDecoration: "none",
            whiteSpace: "nowrap",
          }}>
            Explore Routes
          </Link>
        </div>
      </main>
    </div>
  );
}