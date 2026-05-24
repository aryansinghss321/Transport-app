import { useEffect, useState, useMemo, useRef } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api";
import { Link } from "react-router-dom";
import {
  FaEdit, FaArrowUp, FaArrowDown, FaTruck, FaRoute, FaClipboardList,
  FaSearch, FaTimes, FaPlus, FaEye, FaShieldAlt
} from "react-icons/fa";

const VEHICLE_TYPES = ["truck", "trailer", "container", "forklift"];
const VEHICLE_STATUSES = ["active", "inactive", "maintenance"];
const ROUTE_STATUSES = ["active", "inactive"];

/* ─── inject fonts & keyframes once ───────────────────────────────────── */
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      .admin-dash * { font-family: 'Plus Jakarta Sans', sans-serif; }
      .admin-dash .mono { font-family: 'DM Mono', monospace; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes countUp {
        from { opacity: 0; transform: scale(0.8); }
        to   { opacity: 1; transform: scale(1); }
      }
      .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
      .fade-up-1 { animation-delay: .05s; }
      .fade-up-2 { animation-delay: .12s; }
      .fade-up-3 { animation-delay: .19s; }

      .stat-card {
        position: relative; overflow: hidden; border-radius: 20px;
        padding: 28px 28px 24px;
        cursor: pointer; transition: transform .25s, box-shadow .25s;
      }
      .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,.18); }
      .stat-card::before {
        content: ''; position: absolute; inset: 0;
        background: rgba(255,255,255,.06);
        clip-path: ellipse(70% 60% at 110% 10%);
      }
      .stat-card .bg-icon {
        position: absolute; right: 18px; bottom: 14px;
        font-size: 80px; opacity: .12; line-height: 1;
        pointer-events: none;
      }

      .table-row-hover:hover { background: #f8faff !important; }
      .pill {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 99px;
        font-size: 11px; font-weight: 600; letter-spacing: .4px; text-transform: uppercase;
      }
      .pill-green  { background: #dcfce7; color: #15803d; }
      .pill-amber  { background: #fef9c3; color: #a16207; }
      .pill-red    { background: #fee2e2; color: #b91c1c; }
      .pill::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }

      .search-wrap { position: relative; }
      .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 13px; }
      .search-wrap input { padding-left: 32px; }

      .filter-row select, .filter-row input {
        height: 36px; font-size: 13px; border: 1.5px solid #e2e8f0;
        border-radius: 10px; padding: 0 12px; outline: none;
        transition: border-color .18s;
        background: #fff;
      }
      .filter-row select:focus, .filter-row input:focus { border-color: #6366f1; }

      .clear-btn {
        height: 36px; padding: 0 14px; font-size: 13px; font-weight: 500;
        border: 1.5px solid #e2e8f0; border-radius: 10px;
        background: #fff; color: #64748b; cursor: pointer;
        display: flex; align-items: center; gap: 6px;
        transition: background .15s, border-color .15s;
      }
      .clear-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

      .action-btn {
        padding: 6px 14px; border-radius: 10px; font-size: 13px; font-weight: 600;
        display: inline-flex; align-items: center; gap: 6px;
        transition: filter .18s, transform .15s;
        text-decoration: none;
      }
      .action-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

      .section-card {
        background: #fff; border-radius: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
        padding: 28px;
      }

      .th-sort { padding: 12px 14px; text-align: left; cursor: pointer; font-size: 12px;
        font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #64748b;
        user-select: none; white-space: nowrap; }
      .th-sort:hover { color: #1e293b; }
      .th-sort .sort-icon { display: inline-flex; align-items: center; margin-left: 5px; font-size: 10px; color: #94a3b8; }

      .td { padding: 13px 14px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
      .td-name { font-weight: 600; color: #1e293b; }

      .pagination-btn {
        padding: 6px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px;
        font-size: 13px; font-weight: 500; background: #fff; cursor: pointer;
        transition: background .15s;
      }
      .pagination-btn:hover:not(:disabled) { background: #f8faff; border-color: #6366f1; color: #6366f1; }
      .pagination-btn:disabled { opacity: 0.4; cursor: default; }

      .empty-state {
        text-align: center; padding: 48px 24px;
        border: 2px dashed #e2e8f0; border-radius: 16px;
      }
      .skeleton-line { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);
        background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
      @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);
  return null;
}

/* ─── animated counter ─────────────────────────────────────────────────── */
function AnimatedNumber({ value, loading }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (loading || value === 0) { setDisplay(value); return; }
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value, loading]);
  return <>{loading ? "—" : display}</>;
}

/* ─── stat card ────────────────────────────────────────────────────────── */
function StatCard({ label, value, link, gradient, Icon, loading, delay }) {
  return (
    <Link
      to={link}
      className={`stat-card fade-up fade-up-${delay}`}
      style={{ background: gradient, textDecoration: "none" }}
    >
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".8px",
          textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 48, fontWeight: 800, color: "#fff", lineHeight: 1, animation: "countUp .5s ease both" }}>
        <AnimatedNumber value={value} loading={loading} />
      </div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.65)", fontWeight: 500 }}>
          View all →
        </span>
      </div>
      <div className="bg-icon"><Icon /></div>
    </Link>
  );
}

/* ─── table skeleton ───────────────────────────────────────────────────── */
const TableSkeleton = () => (
  <div>
    <div className="skeleton-line" style={{ height: 36, marginBottom: 8 }} />
    {Array(5).fill(0).map((_, i) => (
      <div key={i} className="skeleton-line" style={{ height: 52, marginBottom: 6, opacity: 1 - i * 0.12 }} />
    ))}
  </div>
);

/* ─── empty state ──────────────────────────────────────────────────────── */
const EmptyState = ({ message, link, buttonText }) => (
  <div className="empty-state">
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f1f5f9",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 12px", color: "#94a3b8", fontSize: 22 }}>
      <FaShieldAlt />
    </div>
    <p style={{ color: "#94a3b8", marginBottom: 16, fontSize: 14 }}>{message}</p>
    <Link to={link} className="action-btn" style={{ background: "#6366f1", color: "#fff", margin: "0 auto" }}>
      <FaPlus size={11} /> {buttonText}
    </Link>
  </div>
);

/* ─── sortable th ──────────────────────────────────────────────────────── */
const SortableHeader = ({ label, sortKey, requestSort, sortConfig }) => {
  const active = sortConfig.key === sortKey;
  return (
    <th className="th-sort" onClick={() => requestSort(sortKey)}
      style={{ color: active ? "#6366f1" : undefined }}>
      {label}
      <span className="sort-icon">
        {active
          ? (sortConfig.direction === "ascending" ? <FaArrowUp /> : <FaArrowDown />)
          : <FaArrowDown style={{ opacity: .3 }} />}
      </span>
    </th>
  );
};

/* ─── pagination ───────────────────────────────────────────────────────── */
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 16 }}>
      <button className="pagination-btn" disabled={currentPage === 1}
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>← Prev</button>
      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
        {currentPage} / {totalPages}
      </span>
      <button className="pagination-btn" disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>Next →</button>
    </div>
  );
};

/* ─── useTable hook ────────────────────────────────────────────────────── */
const useTable = (data, itemsPerPage = 5) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    let items = [...filteredData];
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const requestSort = (key) => {
    let dir = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") dir = "descending";
    setSortConfig({ key, direction: dir });
  };

  return {
    paginatedData, requestSort, sortConfig,
    setSearchTerm, currentPage, setCurrentPage,
    totalPages: Math.ceil(sortedData.length / itemsPerPage),
  };
};

/* ─── pill status badge ────────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const cls = status === "active" ? "pill-green" : status === "maintenance" ? "pill-red" : "pill-amber";
  return <span className={`pill ${cls}`}>{status}</span>;
};

/* ─── section header ───────────────────────────────────────────────────── */
const SectionHeader = ({ title, count, children }) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between",
    alignItems: "center", gap: 12, marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h2>
      {count != null && (
        <span style={{ fontSize: 12, fontWeight: 700, background: "#f1f5f9",
          color: "#64748b", padding: "2px 9px", borderRadius: 99 }}>{count}</span>
      )}
    </div>
    <div className="filter-row" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {children}
    </div>
  </div>
);

/* ═══ MAIN COMPONENT ═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [stats, setStats] = useState({ vehicles: 0, routes: 0, bookings: 0 });
  const [allVehicles, setAllVehicles] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("all");
  const [routeStatusFilter, setRouteStatusFilter] = useState("all");

  useEffect(() => {
    Promise.all([api.get("/vehicles"), api.get("/routes/all"), api.get("/bookings")])
      .then(([v, r, b]) => {
        const vehiclesData = v.data.value ?? v.data;
        const routesData = r.data.value ?? r.data;
        const bookingsData = b.data.value ?? b.data;
        setStats({ vehicles: vehiclesData.length, routes: routesData.length, bookings: bookingsData.length });
        setAllVehicles(vehiclesData);
        setAllRoutes(routesData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredVehicles = useMemo(() =>
    allVehicles.filter(v =>
      (vehicleTypeFilter === "all" || v.type === vehicleTypeFilter) &&
      (vehicleStatusFilter === "all" || v.status === vehicleStatusFilter)
    ), [allVehicles, vehicleTypeFilter, vehicleStatusFilter]);

  const filteredRoutes = useMemo(() =>
    allRoutes.filter(r => routeStatusFilter === "all" || r.status === routeStatusFilter),
    [allRoutes, routeStatusFilter]);

  const {
    paginatedData: paginatedVehicles, requestSort: requestVehicleSort,
    sortConfig: vehicleSortConfig, setSearchTerm: setVehicleSearchTerm,
    currentPage: vehicleCurrentPage, setCurrentPage: setVehicleCurrentPage,
    totalPages: vehicleTotalPages,
  } = useTable(filteredVehicles);

  const {
    paginatedData: paginatedRoutes, requestSort: requestRouteSort,
    sortConfig: routeSortConfig, setSearchTerm: setRouteSearchTerm,
    currentPage: routeCurrentPage, setCurrentPage: setRouteCurrentPage,
    totalPages: routeTotalPages,
  } = useTable(filteredRoutes);

  const cards = [
    {
      label: "Fleet Vehicles", value: stats.vehicles, link: "/admin/vehicles",
      gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      Icon: FaTruck, delay: 1,
    },
    {
      label: "Logistics Routes", value: stats.routes, link: "/admin/routes",
      gradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
      Icon: FaRoute, delay: 2,
    },
    {
      label: "Transport Requests", value: stats.bookings, link: "/admin/bookings",
      gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
      Icon: FaClipboardList, delay: 3,
    },
  ];

  return (
    <div className="admin-dash" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <GlobalStyles />
      <Navbar />

      {/* ── top hero bar ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "36px 0 80px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start",
            justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80",
                  boxShadow: "0 0 8px #4ade80", display: "inline-block" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>
                  System operational
                </span>
              </div>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>
                Manufacturing Transport Dashboard
              </h1>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <Link to="/admin/vehicles" className="action-btn"
                style={{ background: "rgba(255,255,255,.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,.15)" }}>
                <FaPlus size={11} /> New Vehicle
              </Link>
              <Link to="/admin/routes" className="action-btn"
                style={{ background: "rgba(255,255,255,.1)", color: "#fff", border: "1.5px solid rgba(255,255,255,.15)" }}>
                <FaPlus size={11} /> New Logistics Route
              </Link>
              <Link to="/admin/bookings" className="action-btn"
                style={{ background: "#6366f1", color: "#fff" }}>
                <FaEye size={11} /> View Transport Requests
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
        {/* ── stat cards pulled up ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginTop: -52,
          marginBottom: 32,
        }}>
          {cards.map(c => (
            <StatCard key={c.label} {...c} loading={loading} />
          ))}
        </div>

        {/* ── vehicles table ── */}
        <div className="section-card fade-up" style={{ marginBottom: 24, animationDelay: ".25s" }}>
          <SectionHeader title="Transport Fleet" count={filteredVehicles.length}>
            <div className="search-wrap">
              <FaSearch />
              <input
                type="text"
                placeholder="Search vehicles…"
                onChange={e => setVehicleSearchTerm(e.target.value)}
                style={{ width: 190 }}
              />
            </div>
            <select value={vehicleTypeFilter} onChange={e => setVehicleTypeFilter(e.target.value)}>
              <option value="all">All types</option>
              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={vehicleStatusFilter} onChange={e => setVehicleStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              {VEHICLE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="clear-btn" onClick={() => { setVehicleTypeFilter("all"); setVehicleStatusFilter("all"); }}>
              <FaTimes size={10} /> Clear
            </button>
          </SectionHeader>

          {loading ? <TableSkeleton /> : paginatedVehicles.length > 0 ? (
            <>
              <div style={{ overflowX: "auto", maxHeight: 380, overflowY: "auto", borderRadius: 12,
                border: "1.5px solid #f1f5f9" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#fafbff" }}>
                    <tr>
                      <SortableHeader label="Name" sortKey="name" requestSort={requestVehicleSort} sortConfig={vehicleSortConfig} />
                      <SortableHeader label="Type" sortKey="type" requestSort={requestVehicleSort} sortConfig={vehicleSortConfig} />
                      <SortableHeader label="Payload Capacity (kg)" sortKey="capacity" requestSort={requestVehicleSort} sortConfig={vehicleSortConfig} />
                      <SortableHeader label="Status" sortKey="status" requestSort={requestVehicleSort} sortConfig={vehicleSortConfig} />
                      <th className="th-sort" style={{ textAlign: "center", cursor: "default" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVehicles.map((v, i) => (
                      <tr key={v._id} className="table-row-hover"
                        style={{ background: i % 2 === 0 ? "#fff" : "#fafbff", transition: "background .15s" }}>
                        <td className="td td-name">{v.name}</td>
                        <td className="td">
                          <span style={{ background: "#ede9fe", color: "#6d28d9", padding: "2px 10px",
                            borderRadius: 99, fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
                            {v.type}
                          </span>
                        </td>
                        <td className="td mono" style={{ fontWeight: 500 }}>{v.capacity} kg</td>
                        <td className="td"><StatusPill status={v.status} /></td>
                        <td className="td" style={{ textAlign: "center" }}>
                          <Link to="/admin/vehicles" title="Edit"
                            style={{ color: "#6366f1", padding: "6px 10px", borderRadius: 8,
                              background: "#ede9fe", display: "inline-flex", alignItems: "center",
                              transition: "background .15s" }}>
                            <FaEdit size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={vehicleCurrentPage} totalPages={vehicleTotalPages} setCurrentPage={setVehicleCurrentPage} />
              <div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                <Link to="/admin/vehicles" style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
                  View all vehicles →
                </Link>
              </div>
            </>
          ) : (
            <EmptyState message="No vehicles found matching your filters." link="/admin/vehicles" buttonText="Add Vehicle" />
          )}
        </div>

        {/* ── routes table ── */}
        <div className="section-card fade-up" style={{ animationDelay: ".32s" }}>
          <SectionHeader title="Manufacturing Logistics Network" count={filteredRoutes.length}>
            <div className="search-wrap">
              <FaSearch />
              <input
                type="text"
                placeholder="Search routes…"
                onChange={e => setRouteSearchTerm(e.target.value)}
                style={{ width: 190 }}
              />
            </div>
            <select value={routeStatusFilter} onChange={e => setRouteStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              {ROUTE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="clear-btn" onClick={() => setRouteStatusFilter("all")}>
              <FaTimes size={10} /> Clear
            </button>
          </SectionHeader>

          {loading ? <TableSkeleton /> : paginatedRoutes.length > 0 ? (
            <>
              <div style={{ overflowX: "auto", maxHeight: 380, overflowY: "auto", borderRadius: 12,
                border: "1.5px solid #f1f5f9" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "#fafbff" }}>
                    <tr>
                      <SortableHeader label="Source" sortKey="source" requestSort={requestRouteSort} sortConfig={routeSortConfig} />
                      <SortableHeader label="Destination" sortKey="destination" requestSort={requestRouteSort} sortConfig={routeSortConfig} />
                      <SortableHeader label="Distance (km)" sortKey="distance" requestSort={requestRouteSort} sortConfig={routeSortConfig} />
                      <SortableHeader label="Est. Transit Time" sortKey="duration" requestSort={requestRouteSort} sortConfig={routeSortConfig} />
                      <SortableHeader label="Status" sortKey="status" requestSort={requestRouteSort} sortConfig={routeSortConfig} />
                      <th className="th-sort" style={{ textAlign: "center", cursor: "default" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRoutes.map((route, i) => (
                      <tr key={route._id} className="table-row-hover"
                        style={{ background: i % 2 === 0 ? "#fff" : "#fafbff", transition: "background .15s" }}>
                        <td className="td td-name">{route.source}</td>
                        <td className="td">{route.destination}</td>
                        <td className="td mono">{route.distance}</td>
                        <td className="td mono" style={{ fontWeight: 600, color: "#0f172a" }}>{route.duration} hrs</td>
                        <td className="td"><StatusPill status={route.status} /></td>
                        <td className="td" style={{ textAlign: "center" }}>
                          <Link to="/admin/routes" title="Edit"
                            style={{ color: "#0891b2", padding: "6px 10px", borderRadius: 8,
                              background: "#cffafe", display: "inline-flex", alignItems: "center",
                              transition: "background .15s" }}>
                            <FaEdit size={13} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={routeCurrentPage} totalPages={routeTotalPages} setCurrentPage={setRouteCurrentPage} />
              <div style={{ marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
                <Link to="/admin/routes" style={{ fontSize: 13, color: "#0891b2", fontWeight: 600, textDecoration: "none" }}>
                  View all routes →
                </Link>
              </div>
            </>
          ) : (
            <EmptyState message="No routes found matching your filters." link="/admin/routes" buttonText="Add Route" />
          )}
        </div>
      </main>
    </div>
  );
}