import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api";
import toast from "react-hot-toast";
import { FaClipboardList, FaTruck, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter } from "react-icons/fa";

/* ─── constants ─────────────────────────────────────────────────────────── */
const STATUS_COLUMNS = [
{
key: "pending",
label: "Pending",
color: "#f59e0b",
icon: FaClipboardList,
bg: "#fffbeb",
border: "#fde68a",
},
{
key: "scheduled",
label: "Scheduled",
color: "#3b82f6",
icon: FaTruck,
bg: "#eff6ff",
border: "#bfdbfe",
},
{
key: "loading",
label: "Loading",
color: "#8b5cf6",
icon: FaTruck,
bg: "#f5f3ff",
border: "#ddd6fe",
},
{
key: "in_transit",
label: "In Transit",
color: "#06b6d4",
icon: FaTruck,
bg: "#ecfeff",
border: "#a5f3fc",
},
{
key: "delivered",
label: "Delivered",
color: "#22c55e",
icon: FaCheckCircle,
bg: "#f0fdf4",
border: "#bbf7d0",
},
{
key: "cancelled",
label: "Cancelled",
color: "#ef4444",
icon: FaTimesCircle,
bg: "#fef2f2",
border: "#fecaca",
},
];

const PRIORITY_COLORS = {
urgent: { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
high: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
medium: { bg: "#fffbeb", border: "#fde68a", text: "#d97706" },
low: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
};

const SHIPMENT_TYPE_LABELS = {
raw_material: "Raw Material",
finished_goods: "Finished Goods",
equipment: "Equipment",
};

/* ─── global styles ─────────────────────────────────────────────────────── */
function GlobalStyles() {
useEffect(() => {
const style = document.createElement("style");
style.id = "tb-styles";
style.textContent = `
.tb-root * { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; box-sizing: border-box; }
.tb-root .mono { font-family: 'DM Mono', monospace; }

@keyframes tb-shimmer {
0%   { background-position: 200% 0; }
100% { background-position: -200% 0; }
}
@keyframes tb-cardIn {
from { opacity: 0; transform: translateY(10px); }
to   { opacity: 1; transform: translateY(0); }
}
@keyframes tb-fadeUp {
from { opacity: 0; transform: translateY(12px); }
to   { opacity: 1; transform: translateY(0); }
}

.tb-skeleton {
background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
background-size: 200% 100%;
animation: tb-shimmer 1.4s infinite;
border-radius: 8px;
}

/* kanban board */
.tb-board {
display: flex;
gap: 16px;
overflow-x: auto;
padding-bottom: 20px;
min-height: 500px;
}
.tb-column {
flex: 0 0 280px;
background: #f8fafc;
border-radius: 16px;
display: flex;
flex-direction: column;
max-height: calc(100vh - 220px);
border: 1.5px solid #f1f5f9;
}
.tb-col-header {
padding: 14px 16px 12px;
border-bottom: 1.5px solid #f1f5f9;
display: flex;
align-items: center;
justify-content: space-between;
background: #fff;
border-radius: 16px 16px 0 0;
}
.tb-col-title {
display: flex;
align-items: center;
gap: 8px;
font-size: 13px;
font-weight: 700;
color: #0f172a;
}
.tb-col-count {
background: #f1f5f9;
border-radius: 99px;
padding: 2px 8px;
font-size: 11px;
font-weight: 700;
color: #64748b;
}
.tb-col-body {
flex: 1;
overflow-y: auto;
padding: 12px;
display: flex;
flex-direction: column;
gap: 10px;
}
.tb-col-body::-webkit-scrollbar { width: 4px; }
.tb-col-body::-webkit-scrollbar-track { background: transparent; }
.tb-col-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }

/* transport card */
.tb-card {
background: #fff;
border-radius: 14px;
padding: 14px;
border: 1.5px solid #f1f5f9;
transition: border-color .2s, box-shadow .2s, transform .2s;
animation: tb-cardIn .3s ease both;
cursor: pointer;
}
.tb-card:hover {
border-color: #c7d2fe;
box-shadow: 0 4px 16px rgba(0,0,0,.08);
transform: translateY(-2px);
}
.tb-card-top {
display: flex;
align-items: flex-start;
justify-content: space-between;
gap: 8px;
margin-bottom: 10px;
}
.tb-card-route {
display: flex;
align-items: center;
gap: 6px;
font-size: 13.5px;
font-weight: 700;
color: #0f172a;
flex: 1;
min-width: 0;
}
.tb-card-route .from,
.tb-card-route .to {
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
max-width: 70px;
}
.tb-card-route .arrow {
color: #94a3b8;
flex-shrink: 0;
}
.tb-card-id {
font-family: 'DM Mono', monospace;
font-size: 10px;
color: #94a3b8;
font-weight: 500;
}
.tb-card-detail {
font-size: 12px;
color: #64748b;
margin-bottom: 6px;
display: flex;
align-items: center;
gap: 5px;
}
.tb-card-detail strong {
color: #334155;
}
.tb-card-weight {
font-family: 'DM Mono', monospace;
font-size: 12px;
font-weight: 600;
color: #3b82f6;
margin-bottom: 8px;
}
.tb-card-footer {
display: flex;
align-items: center;
justify-content: space-between;
gap: 8px;
}
.tb-priority-badge {
display: inline-flex;
align-items: center;
gap: 4px;
padding: 3px 8px;
border-radius: 99px;
font-size: 10.5px;
font-weight: 700;
letter-spacing: .3px;
}

/* empty column */
.tb-empty-col {
text-align: center;
padding: 32px 16px;
color: #94a3b8;
font-size: 12px;
}

/* search bar */
.tb-search-wrap {
position: relative;
flex: 1;
max-width: 320px;
}
.tb-search-icon {
position: absolute;
left: 12px;
top: 50%;
transform: translateY(-50%);
color: #94a3b8;
pointer-events: none;
}
.tb-search-input {
width: 100%;
padding: 9px 12px 9px 38px;
border: 1.5px solid #e2e8f0;
border-radius: 10px;
font-size: 13px;
color: #0f172a;
background: #fff;
outline: none;
transition: border-color .2s, box-shadow .2s;
font-family: 'Plus Jakarta Sans', sans-serif;
}
.tb-search-input:focus {
border-color: #818cf8;
box-shadow: 0 0 0 3px rgba(129,140,248,.12);
}
.tb-search-input::placeholder { color: #94a3b8; }

/* filter */
.tb-filter-wrap {
position: relative;
}
.tb-filter-btn {
display: flex;
align-items: center;
gap: 6px;
padding: 9px 14px;
border: 1.5px solid #e2e8f0;
border-radius: 10px;
background: #fff;
font-size: 13px;
font-weight: 600;
color: #64748b;
cursor: pointer;
transition: background .15s, border-color .15s;
font-family: 'Plus Jakarta Sans', sans-serif;
}
.tb-filter-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

/* stats row */
.tb-stats {
display: flex;
gap: 12px;
flex-wrap: wrap;
}
.tb-stat-item {
background: #fff;
border: 1.5px solid #f1f5f9;
border-radius: 12px;
padding: 10px 16px;
display: flex;
align-items: center;
gap: 10px;
}
.tb-stat-icon {
width: 36px;
height: 36px;
border-radius: 10px;
display: flex;
align-items: center;
justify-content: center;
font-size: 16px;
}
.tb-stat-info { display: flex; flex-direction: column; }
.tb-stat-val { font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1; }
.tb-stat-label { font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 2px; }

/* loading skeleton */
.tb-skeleton-card {
background: #fff;
border-radius: 14px;
padding: 14px;
border: 1.5px solid #f1f5f9;
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
const IconArrow = ({ size = 11, style }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
</svg>
);

const IconBox = ({ size = 12, style }) => (
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

const IconCalendar = ({ size = 12, style }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
<line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
<line x1="3" y1="10" x2="21" y2="10"/>
</svg>
);

const IconUser = ({ size = 12, style }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
<circle cx="12" cy="7" r="4"/>
</svg>
);

/* ─── skeleton card ──────────────────────────────────────────────────────── */
const SkeletonCard = () => (
<div className="tb-skeleton-card">
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
<div className="tb-skeleton" style={{ height: 14, width: "60%" }} />
<div className="tb-skeleton" style={{ height: 10, width: "25%" }} />
</div>
<div className="tb-skeleton" style={{ height: 12, width: "80%", marginBottom: 6 }} />
<div className="tb-skeleton" style={{ height: 12, width: "70%", marginBottom: 8 }} />
<div style={{ display: "flex", justifyContent: "space-between" }}>
<div className="tb-skeleton" style={{ height: 22, width: "40%", borderRadius: 99 }} />
<div className="tb-skeleton" style={{ height: 22, width: "30%", borderRadius: 99 }} />
</div>
</div>
);

/* ─── transport card ─────────────────────────────────────────────────────── */
const TransportCard = ({ booking }) => {
const route = booking.routeId;
const priorityStyle = PRIORITY_COLORS[booking.priority] || PRIORITY_COLORS.medium;
const shipmentLabel = SHIPMENT_TYPE_LABELS[booking.shipmentType] || booking.shipmentType;

return (
<div className="tb-card">
{/* top row */}
<div className="tb-card-top">
<div className="tb-card-route">
<span className="from">{route?.source || "—"}</span>
<IconArrow size={11} className="arrow" />
<span className="to">{route?.destination || "—"}</span>
</div>
<div className="tb-card-id">{booking.trackingId || booking._id?.slice(-6) || "—"}</div>
</div>

{/* details */}
<div className="tb-card-detail">
<IconBox size={12} /> <strong>Product:</strong> {booking.productType || "N/A"}
</div>
<div className="tb-card-detail">
<IconBox size={12} /> <strong>Shipment:</strong> {shipmentLabel}
</div>
<div className="tb-card-detail">
<IconUser size={12} /> <strong>Requester:</strong> {booking.userId?.name || "N/A"}
</div>

{/* vehicle assignment */}
<div className="tb-card-detail">
<FaTruck size={11} /> <strong>Vehicle:</strong> {booking.assignedVehicle?.plateNumber || "Not Assigned"}
</div>

{/* driver assignment */}
<div className="tb-card-detail">
<IconUser size={12} /> <strong>Driver:</strong> {booking.assignedDriver?.name || "Not Assigned"}
</div>

{/* weight */}
<div className="tb-card-weight">
<IconWeight size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
{booking.loadWeightKg ? booking.loadWeightKg.toLocaleString("en-IN") : 0} kg
</div>

{/* dispatch date */}
<div className="tb-card-detail" style={{ marginBottom: 8 }}>
<IconCalendar size={12} /> Dispatch:{" "}
{booking.dispatchDate ? new Date(booking.dispatchDate).toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
}) : "Not set"}
</div>

{/* footer */}
<div className="tb-card-footer">
<span
className="tb-priority-badge"
style={{
background: priorityStyle.bg,
border: `1px solid ${priorityStyle.border}`,
color: priorityStyle.text,
}}
>
{booking.priority?.toUpperCase() || "MEDIUM"}
</span>
{booking.batchNumber && (
<span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
{booking.batchNumber}
</span>
)}
</div>
</div>
);
};

/* ═══ MAIN COMPONENT ════════════════════════════════════════════════════════ */
export default function TransportBoard() {
const [bookings, setBookings] = useState([]);
const [loading, setLoading]   = useState(true);
const [search, setSearch]     = useState("");
const [dateFilter, setDateFilter] = useState("");

/* fetch with auto-refresh every 30 seconds */
useEffect(() => {
const fetchBookings = () => {
api.get("/bookings")
.then(({ data }) => setBookings(data.value ?? data))
.catch(() => toast.error("Failed to load transport requests"))
.finally(() => setLoading(false));
};

fetchBookings();
const interval = setInterval(fetchBookings, 30000);
return () => clearInterval(interval);
}, []);

/* filter logic */
const filtered = bookings.filter((b) => {
const q = search.toLowerCase();
const matchesSearch =
!q ||
(b.productType || "").toLowerCase().includes(q) ||
(b.routeId?.source || "").toLowerCase().includes(q) ||
(b.routeId?.destination || "").toLowerCase().includes(q) ||
(b.userId?.name || "").toLowerCase().includes(q) ||
(b.trackingId || "").toLowerCase().includes(q) ||
(b.batchNumber || "").toLowerCase().includes(q) ||
(b.shipmentType || "").toLowerCase().includes(q) ||
(b.assignedVehicle?.plateNumber || "").toLowerCase().includes(q) ||
(b.assignedDriver?.name || "").toLowerCase().includes(q);

const matchesDate =
!dateFilter ||
new Date(b.dispatchDate).toISOString().slice(0, 10) === dateFilter;

return matchesSearch && matchesDate;
});

/* group by status */
const columns = STATUS_COLUMNS.map((col) => ({
...col,
items: filtered.filter((b) => b.status === col.key),
}));

/* stats */
const stats = {
total: bookings.length,
pending: bookings.filter((b) => b.status === "pending").length,
inTransit: bookings.filter((b) => b.status === "in_transit").length,
delivered: bookings.filter((b) => b.status === "delivered").length,
};

return (
<div className="tb-root" style={{ minHeight: "100vh", background: "#f1f5f9" }}>
<GlobalStyles />
<Navbar />

{/* ── hero ── */}
<div style={{
background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
padding: "32px 0 72px",
}}>
<div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
<div className="tb-fade-up" style={{ animation: "tb-fadeUp .5s ease both" }}>
<div style={{
display: "inline-flex", alignItems: "center", gap: 8,
fontSize: 11, fontWeight: 700, letterSpacing: ".8px",
color: "rgba(255,255,255,.35)", textTransform: "uppercase", marginBottom: 10,
}}>
<FaTruck size={12} style={{ opacity: .6 }} /> Transport Management
</div>
<h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.2 }}>
Manufacturing{" "}
<span style={{
background: "linear-gradient(90deg, #a5b4fc, #c4b5fd)",
WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
}}>
Transport Workflow
</span>
</h1>
<p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", margin: 0 }}>
Track transport requests, loading operations, deliveries and vehicle movement across the manufacturing supply chain.
</p>
</div>
</div>
</div>

{/* ── stats + controls ── */}
<div style={{ maxWidth: 1200, margin: "-40px auto 24px", padding: "0 24px" }}>
<div style={{
background: "#fff",
borderRadius: 18,
boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)",
padding: "18px 20px",
}}>
{/* stats row */}
<div className="tb-stats" style={{ marginBottom: 16 }}>
<div className="tb-stat-item">
<div className="tb-stat-icon" style={{ background: "#f0fdf4", color: "#22c55e" }}>
<FaTruck />
</div>
<div className="tb-stat-info">
<span className="tb-stat-val">{stats.total}</span>
<span className="tb-stat-label">Total Requests</span>
</div>
</div>
<div className="tb-stat-item">
<div className="tb-stat-icon" style={{ background: "#fffbeb", color: "#f59e0b" }}>
<FaClipboardList />
</div>
<div className="tb-stat-info">
<span className="tb-stat-val">{stats.pending}</span>
<span className="tb-stat-label">Pending</span>
</div>
</div>
<div className="tb-stat-item">
<div className="tb-stat-icon" style={{ background: "#ecfeff", color: "#06b6d4" }}>
<FaTruck />
</div>
<div className="tb-stat-info">
<span className="tb-stat-val">{stats.inTransit}</span>
<span className="tb-stat-label">In Transit</span>
</div>
</div>
<div className="tb-stat-item">
<div className="tb-stat-icon" style={{ background: "#f0fdf4", color: "#22c55e" }}>
<FaCheckCircle />
</div>
<div className="tb-stat-info">
<span className="tb-stat-val">{stats.delivered}</span>
<span className="tb-stat-label">Delivered</span>
</div>
</div>
</div>

{/* controls row */}
<div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
<div className="tb-search-wrap">
<FaSearch size={14} className="tb-search-icon" />
<input
className="tb-search-input"
type="text"
placeholder="Search shipment, route, product or requester..."
value={search}
onChange={(e) => setSearch(e.target.value)}
/>
</div>

<div className="tb-filter-wrap">
<input
type="date"
className="tb-search-input"
style={{ maxWidth: 180 }}
value={dateFilter}
onChange={(e) => setDateFilter(e.target.value)}
title="Filter by dispatch date"
/>
</div>

{(search || dateFilter) && (
<button
onClick={() => { setSearch(""); setDateFilter(""); }}
style={{
padding: "8px 14px",
border: "1.5px solid #e2e8f0",
borderRadius: 10,
background: "#fff",
fontSize: 12,
fontWeight: 600,
color: "#64748b",
cursor: "pointer",
display: "flex",
alignItems: "center",
gap: 6,
fontFamily: "'Plus Jakarta Sans', sans-serif",
}}
>
<FaTimesCircle size={12} /> Clear Filters
</button>
)}
</div>
</div>
</div>

{/* ── kanban board ── */}
<div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
<div style={{
background: "#fff",
borderRadius: 18,
boxShadow: "0 1px 4px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)",
padding: "20px",
}}>
{loading ? (
<div className="tb-board">
{STATUS_COLUMNS.map((col) => (
<div key={col.key} className="tb-column">
<div className="tb-col-header">
<div className="tb-col-title">
<col.icon size={13} style={{ color: col.color }} />
{col.label}
</div>
<span className="tb-col-count">—</span>
</div>
<div className="tb-col-body">
{[1, 2].map((i) => <SkeletonCard key={i} />)}
</div>
</div>
))}
</div>
) : (
<div className="tb-board">
{columns.map((col) => (
<div key={col.key} className="tb-column">
{/* column header */}
<div className="tb-col-header">
<div className="tb-col-title">
<col.icon size={13} style={{ color: col.color }} />
{col.label}
</div>
<span
className="tb-col-count"
style={{
background: col.bg,
color: col.color,
border: `1px solid ${col.border}`,
}}
>
{col.items.length}
</span>
</div>

{/* column body */}
<div className="tb-col-body">
{col.items.length === 0 ? (
<div className="tb-empty-col">
No transport requests
</div>
) : (
col.items.map((booking) => (
<TransportCard key={booking._id} booking={booking} />
))
)}
</div>
</div>
))}
</div>
)}
</div>
</div>
</div>
);
}