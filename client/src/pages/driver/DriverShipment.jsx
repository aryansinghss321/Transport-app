import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/Navbar";
import { getDriverBookings, updateBookingStatus } from "../../api";
import toast from "react-hot-toast";
import { FaTruck, FaCalendar, FaClock, FaCheckCircle, FaPlay, FaShippingFast } from "react-icons/fa";

/* ─── constants ─────────────────────────────────────────────────────────── */
const STATUS_STEPS = [
  { key: "pending",      label: "Pending",     icon: FaClock },
  { key: "scheduled",    label: "Scheduled",   icon: FaCalendar },
  { key: "loading",      label: "Loading",     icon: FaPlay },
  { key: "in_transit",   label: "In Transit",  icon: FaShippingFast },
  { key: "delivered",    label: "Delivered",   icon: FaCheckCircle },
];

const STATUS_COLORS = {
  pending:    { color: "#f59e0b", bg: "#fffbeb" },
  scheduled:   { color: "#3b82f6", bg: "#eff6ff" },
  loading:     { color: "#8b5cf6", bg: "#f5f3ff" },
  in_transit:  { color: "#06b6d4", bg: "#ecfeff" },
  delivered:   { color: "#22c55e", bg: "#f0fdf4" },
  cancelled:   { color: "#ef4444", bg: "#fef2f2" },
};

const PRIORITY_STYLES = {
  urgent:  { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
  high:    { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
  medium:  { bg: "#fffbeb", border: "#fde68a", text: "#d97706" },
  low:     { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
};

const SHIPMENT_LABELS = {
  raw_material: "Raw Material",
  finished_goods: "Finished Goods",
  equipment: "Equipment",
};

/* ─── global styles ─────────────────────────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "ds-styles";
    style.textContent = `
      .ds-root * { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; box-sizing: border-box; }
      .ds-root .mono { font-family: 'DM Mono', monospace; }

      @keyframes ds-shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes ds-fadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes ds-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .6; }
      }

      .ds-skeleton {
        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
        background-size: 200% 100%;
        animation: ds-shimmer 1.4s infinite;
        border-radius: 12px;
      }

      /* shipment card */
      .ds-card {
        background: #fff;
        border-radius: 16px;
        border: 1.5px solid #f1f5f9;
        overflow: hidden;
        transition: border-color .2s, box-shadow .2s;
        animation: ds-fadeUp .4s ease both;
      }
      .ds-card:hover { border-color: #c7d2fe; box-shadow: 0 4px 20px rgba(0,0,0,.07); }

      /* progress steps */
      .ds-steps {
        display: flex;
        align-items: center;
        gap: 0;
        padding: 0 16px 16px;
        overflow-x: auto;
      }
      .ds-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        min-width: 60px;
        position: relative;
      }
      .ds-step-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #e2e8f0;
        background: #fff;
        color: #cbd5e1;
        z-index: 1;
        transition: all .3s;
      }
      .ds-step.active .ds-step-icon {
        border-color: currentColor;
        color: currentColor;
      }
      .ds-step.done .ds-step-icon {
        background: #22c55e;
        border-color: #22c55e;
        color: #fff;
      }
      .ds-step-label {
        font-size: 10px;
        font-weight: 600;
        color: #94a3b8;
        margin-top: 5px;
        text-align: center;
        white-space: nowrap;
      }
      .ds-step.active .ds-step-label,
      .ds-step.done .ds-step-label {
        color: currentColor;
      }
      .ds-step-line {
        flex: 1;
        height: 2px;
        background: #e2e8f0;
        margin-bottom: 26px;
        transition: background .3s;
      }
      .ds-step.done + .ds-step .ds-step-line,
      .ds-step.done .ds-step-line {
        background: #22c55e;
      }

      /* action button */
      .ds-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 22px;
        border-radius: 12px;
        border: none;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity .18s, transform .18s;
        font-family: 'Plus Jakarta Sans', sans-serif;
        box-shadow: 0 4px 14px rgba(0,0,0,.18);
      }
      .ds-action-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
      .ds-action-btn:active:not(:disabled) { transform: scale(.97); }
      .ds-action-btn:disabled { opacity: .4; cursor: not-allowed; }

      /* stats row */
      .ds-stats { display: flex; gap: 14px; flex-wrap: wrap; }
      .ds-stat {
        flex: 1;
        min-width: 120px;
        background: #fff;
        border: 1.5px solid #f1f5f9;
        border-radius: 14px;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .ds-stat-icon {
        width: 40px; height: 40px;
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }
      .ds-stat-info { display: flex; flex-direction: column; }
      .ds-stat-val { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1; }
      .ds-stat-label { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 2px; }

      /* detail row */
      .ds-detail-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #64748b;
        margin-bottom: 10px;
      }
      .ds-detail-row strong { color: #334155; }
      .ds-detail-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .4px;
        text-transform: uppercase;
        color: #94a3b8;
        margin-bottom: 2px;
      }

      /* badge */
      .ds-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
      }

      /* empty state */
      .ds-empty {
        text-align: center;
        padding: 56px 24px;
      }
      .ds-empty-icon {
        width: 64px; height: 64px;
        border-radius: 20px;
        background: linear-gradient(135deg, #ede9fe, #dbeafe);
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px;
        font-size: 24px;
        color: #7c3aed;
      }

      /* loading card skeleton */
      .ds-skeleton-card {
        background: #fff;
        border-radius: 16px;
        border: 1.5px solid #f1f5f9;
        padding: 20px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);
  return null;
}

/* ─── inline SVG icons ───────────────────────────────────────────────────── */
const IconArrow = ({ size = 12, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconPackage = ({ size = 12, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconWeight = ({ size = 12, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="5" r="3"/>
    <path d="M6.5 8h11l-2 10H8.5L6.5 8z"/>
    <path d="M12 18v4"/><path d="M8 22h8"/>
  </svg>
);

/* ─── skeleton card ──────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="ds-skeleton-card">
    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
      <div className="ds-skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="ds-skeleton" style={{ height: 14, width: "60%", marginBottom: 8 }} />
        <div className="ds-skeleton" style={{ height: 11, width: "40%" }} />
      </div>
    </div>
    <div className="ds-skeleton" style={{ height: 12, width: "75%", marginBottom: 8 }} />
    <div className="ds-skeleton" style={{ height: 12, width: "65%", marginBottom: 16 }} />
    <div className="ds-skeleton" style={{ height: 40, borderRadius: 12 }} />
  </div>
);

/* ─── status progress steps ─────────────────────────────────────────────── */
const StatusProgress = ({ status }) => {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="ds-steps">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        return (
          <div key={step.key} className={`ds-step ${done ? "done" : active ? "active" : ""}`}>
            <div
              className="ds-step-icon"
              style={active ? { color: step.color || STATUS_COLORS[step.key]?.color, borderColor: step.color || STATUS_COLORS[step.key]?.color } : {}}
            >
              <step.icon size={14} />
            </div>
            <div
              className="ds-step-label"
              style={active ? { color: step.color || STATUS_COLORS[step.key]?.color } : {}}
            >
              {step.label}
            </div>
            {idx < STATUS_STEPS.length - 1 && <div className="ds-step-line" />}
          </div>
        );
      })}
    </div>
  );
};

/* ─── shipment card ─────────────────────────────────────────────────────── */
const ShipmentCard = ({ booking, onUpdate }) => {
  const route = booking.routeId || {};
  const statusStyle = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
  const priorityStyle = PRIORITY_STYLES[booking.priority] || PRIORITY_STYLES.medium;
  const shipmentLabel = SHIPMENT_LABELS[booking.shipmentType] || booking.shipmentType;

  /* next action based on status */
  const getNextAction = () => {
    switch (booking.status) {
      case "pending":    return { label: "Start Loading", color: "#8b5cf6", bg: "#f5f3ff", icon: FaPlay, nextStatus: "loading" };
      case "scheduled":  return { label: "Start Loading", color: "#8b5cf6", bg: "#f5f3ff", icon: FaPlay, nextStatus: "loading" };
      case "loading":     return { label: "Start Transit", color: "#06b6d4", bg: "#ecfeff", icon: FaShippingFast, nextStatus: "in_transit" };
      case "in_transit":  return { label: "Mark Delivered", color: "#22c55e", bg: "#f0fdf4", icon: FaCheckCircle, nextStatus: "delivered" };
      default:           return null;
    }
  };

  const nextAction = getNextAction();

  return (
    <div className="ds-card">
      {/* card header */}
      <div style={{
        padding: "16px 18px 14px",
        borderBottom: "1.5px solid #f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg, #dbeafe, #ede9fe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#2563eb",
            flexShrink: 0,
          }}>
            <FaTruck size={18} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
              <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {route.source || "—"}
              </span>
              <IconArrow size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {route.destination || "—"}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {route.vehicleId?.name || "Vehicle"} · {route.distance || "—"} km
            </div>
          </div>
        </div>
        <span
          className="ds-badge"
          style={{
            background: statusStyle.bg,
            color: statusStyle.color,
            border: `1px solid ${statusStyle.color}30`,
            animation: booking.status === "in_transit" ? "ds-pulse 1.5s ease infinite" : "none",
          }}
        >
          {(booking.status || "pending").replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      {/* card body */}
      <div style={{ padding: "14px 18px" }}>
        {/* details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", marginBottom: 14 }}>
          <div>
            <div className="ds-detail-label">Product</div>
            <div className="ds-detail-row" style={{ marginBottom: 0 }}>
              <IconPackage size={11} /> {booking.productType || "N/A"}
            </div>
          </div>
          <div>
            <div className="ds-detail-label">Shipment Type</div>
            <div className="ds-detail-row" style={{ marginBottom: 0 }}>
              <IconPackage size={11} /> {shipmentLabel}
            </div>
          </div>
          <div>
            <div className="ds-detail-label">Load Weight</div>
            <div className="ds-detail-row" style={{ marginBottom: 0 }}>
              <IconWeight size={11} /> {booking.loadWeightKg ? booking.loadWeightKg.toLocaleString("en-IN") : 0} kg
            </div>
          </div>
          <div>
            <div className="ds-detail-label">Dispatch Date</div>
            <div className="ds-detail-row" style={{ marginBottom: 0 }}>
              <FaCalendar size={11} />
              {booking.dispatchDate ? new Date(booking.dispatchDate).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              }) : "Not set"}
            </div>
          </div>
        </div>

        {/* vehicle info */}
        <div className="ds-detail-row" style={{ marginBottom: 14 }}>
          <FaTruck size={11} />
          <strong>Vehicle:</strong>{" "}
          {booking.assignedVehicle?.plateNumber || "Not Assigned"}
        </div>

        {/* batch + priority */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {booking.batchNumber && (
            <span style={{
              fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace",
              background: "#f8fafc", border: "1px solid #f1f5f9",
              borderRadius: 8, padding: "3px 8px", color: "#64748b",
            }}>
              {booking.batchNumber}
            </span>
          )}
          <span
            className="ds-badge"
            style={{
              background: priorityStyle.bg,
              border: `1px solid ${priorityStyle.border}`,
              color: priorityStyle.text,
            }}
          >
            {(booking.priority || "medium").toUpperCase()} PRIORITY
          </span>
          <span style={{
            fontSize: 10, fontFamily: "'DM Mono', monospace",
            color: "#94a3b8", marginLeft: "auto",
          }}>
            {booking.trackingId || booking._id?.slice(-6) || ""}
          </span>
        </div>

        {/* status progress */}
        {booking.status !== "delivered" && booking.status !== "cancelled" && (
          <div style={{ marginBottom: 14 }}>
            <StatusProgress status={booking.status} />
          </div>
        )}

        {/* action button */}
        {nextAction && (
          <button
            className="ds-action-btn"
            style={{ background: nextAction.bg, color: nextAction.color, width: "100%" }}
            onClick={() => onUpdate(booking._id, nextAction.nextStatus)}
          >
            <nextAction.icon size={14} />
            {nextAction.label}
          </button>
        )}

        {booking.status === "delivered" && (
          <div style={{
            textAlign: "center",
            padding: "10px",
            background: "#f0fdf4",
            borderRadius: 10,
            color: "#15803d",
            fontWeight: 700,
            fontSize: 13,
          }}>
            <FaCheckCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
            Delivery Completed
          </div>
        )}

        {booking.status === "cancelled" && (
          <div style={{
            textAlign: "center",
            padding: "10px",
            background: "#fef2f2",
            borderRadius: 10,
            color: "#dc2626",
            fontWeight: 700,
            fontSize: 13,
          }}>
            Transport Request Cancelled
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════════════ */
export default function DriverShipment() {
  const { user } = useAuth();
  const { id: shipmentId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getDriverBookings()
      .then(({ data }) => setBookings(data.value ?? data))
      .catch(() => toast.error("Failed to load assigned shipments"))
      .finally(() => setLoading(false));
  }, []);

  /* update shipment status - FIXED: using correct PUT /bookings/:id/status endpoint */
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      toast.success(`Status updated to "${newStatus.replace(/_/g, " ")}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  /* FIXED: filter to show only shipments assigned to this driver */
  const currentUserId = user?._id || user?.id;

  const assignedShipments = bookings.filter(
    (b) =>
      b.status !== "cancelled" &&
      (
        b.assignedDriver?._id === currentUserId ||
        b.assignedDriver === currentUserId
      )
  );

  const visibleShipments = shipmentId
    ? assignedShipments.filter((b) => b._id === shipmentId)
    : assignedShipments;

  const stats = {
    total: visibleShipments.length,
    inTransit: visibleShipments.filter((b) => b.status === "in_transit").length,
    completed: visibleShipments.filter((b) => b.status === "delivered").length,
    pending: visibleShipments.filter((b) => ["pending", "scheduled", "loading"].includes(b.status)).length,
  };

  return (
    <div className="ds-root" style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <GlobalStyles />
      <Navbar />

      {/* ── hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "30px 0 68px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ animation: "ds-fadeUp .45s ease both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, fontWeight: 700, letterSpacing: ".8px",
              color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 10,
            }}>
              <FaTruck size={12} style={{ opacity: .6 }} /> Driver Portal
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.2 }}>
              My{" "}
              <span style={{
                background: "linear-gradient(90deg, #a5b4fc, #c4b5fd)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Assigned Shipments
              </span>
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", margin: 0 }}>
              View your assigned transport jobs, update shipment status and track deliveries.
            </p>
          </div>
        </div>
      </div>

      {/* ── stats ── */}
      <div style={{ maxWidth: 900, margin: "-38px auto 20px", padding: "0 20px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)",
          padding: "16px 20px",
        }}>
          <div className="ds-stats">
            <div className="ds-stat">
              <div className="ds-stat-icon" style={{ background: "#f0fdf4", color: "#22c55e" }}>
                <FaTruck />
              </div>
              <div className="ds-stat-info">
                <span className="ds-stat-val">{stats.total}</span>
                <span className="ds-stat-label">Assigned</span>
              </div>
            </div>
            <div className="ds-stat">
              <div className="ds-stat-icon" style={{ background: "#ecfeff", color: "#06b6d4" }}>
                <FaShippingFast />
              </div>
              <div className="ds-stat-info">
                <span className="ds-stat-val">{stats.inTransit}</span>
                <span className="ds-stat-label">In Transit</span>
              </div>
            </div>
            <div className="ds-stat">
              <div className="ds-stat-icon" style={{ background: "#f0fdf4", color: "#22c55e" }}>
                <FaCheckCircle />
              </div>
              <div className="ds-stat-info">
                <span className="ds-stat-val">{stats.completed}</span>
                <span className="ds-stat-label">Delivered</span>
              </div>
            </div>
            <div className="ds-stat">
              <div className="ds-stat-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
                <FaClock />
              </div>
              <div className="ds-stat-info">
                <span className="ds-stat-val">{stats.pending}</span>
                <span className="ds-stat-label">Pending / Loading</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── shipments list ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 48px" }}>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)",
          padding: "18px 20px",
        }}>
          <div style={{
            paddingBottom: 14,
            borderBottom: "1.5px solid #f8fafc",
            marginBottom: 16,
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Transport Jobs
            </h2>
          </div>

          {loading ? (
            <div style={{ display: "grid", gap: 14 }}>
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : visibleShipments.length === 0 ? (
            <div className="ds-empty">
              <div className="ds-empty-icon"><FaTruck size={26} /></div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>
                {shipmentId ? "Shipment Not Found" : "No Assigned Shipments"}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                {shipmentId
                  ? "This shipment is not assigned to your account."
                  : "No transport requests have been assigned to you yet."}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {visibleShipments.map((booking) => (
                <ShipmentCard
                  key={booking._id}
                  booking={booking}
                  onUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}