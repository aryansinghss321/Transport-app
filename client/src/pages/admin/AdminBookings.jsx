import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api";

const STATUS_OPTIONS = [
  "pending",
  "scheduled",
  "loading",
  "in_transit",
  "delivered",
  "cancelled",
];

const STATUS_COLORS = {
  pending: "#f59e0b",
  scheduled: "#3b82f6",
  loading: "#8b5cf6",
  in_transit: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        "/bookings"
      );

      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      await api.put(
        `/bookings/${id}/status`,
        { status }
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                status,
              }
            : booking
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        !search ||
        (booking?.userId?.name || "")
          .toLowerCase()
          .includes(search) ||
        (booking?.productType || "")
          .toLowerCase()
          .includes(search) ||
        (booking?.routeId?.source || "")
          .toLowerCase()
          .includes(search) ||
        (booking?.routeId?.destination || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        booking.status ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    bookings,
    searchTerm,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(
        (b) => b.status === "pending"
      ).length,
      transit: bookings.filter(
        (b) =>
          b.status ===
          "in_transit"
      ).length,
      delivered: bookings.filter(
        (b) =>
          b.status ===
          "delivered"
      ).length,
      cancelled: bookings.filter(
        (b) =>
          b.status ===
          "cancelled"
      ).length,
    };
  }, [bookings]);

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <Navbar />

      <div
        style={{
          background:
            "linear-gradient(135deg,#0f172a,#312e81)",
          color: "white",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              fontSize: "38px",
              fontWeight: "800",
              marginBottom: "10px",
            }}
          >
            Manufacturing Transport
            Requests
          </h1>

          <p
            style={{
              opacity: 0.8,
              fontSize: "15px",
            }}
          >
            Manage transport
            workflow, delivery
            scheduling and shipment
            movement for
            manufacturing logistics
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "-30px auto 0",
          padding: "0 24px 50px",
        }}
      >
        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {[
            [
              "Total Requests",
              stats.total,
            ],
            [
              "Pending",
              stats.pending,
            ],
            [
              "In Transit",
              stats.transit,
            ],
            [
              "Delivered",
              stats.delivered,
            ],
            [
              "Cancelled",
              stats.cancelled,
            ],
          ].map(([title, value]) => (
            <div
              key={title}
              style={{
                background:
                  "white",
                borderRadius:
                  "18px",
                padding: "24px",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.08)",
              }}
            >
              <p
                style={{
                  color:
                    "#64748b",
                }}
              >
                {title}
              </p>

              <h2
                style={{
                  fontSize:
                    "32px",
                  fontWeight:
                    "700",
                }}
              >
                {value}
              </h2>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius:
              "18px",
            marginBottom:
              "20px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="Search route, product, user..."
            value={
              searchTerm
            }
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            style={{
              flex: 1,
              padding: "14px",
              border:
                "1px solid #e2e8f0",
              borderRadius:
                "12px",
            }}
          />

          <select
            value={
              statusFilter
            }
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={{
              padding:
                "14px",
              borderRadius:
                "12px",
            }}
          >
            <option value="all">
              All Status
            </option>

            {STATUS_OPTIONS.map(
              (status) => (
                <option
                  key={
                    status
                  }
                  value={
                    status
                  }
                >
                  {status}
                </option>
              )
            )}
          </select>
        </div>

        {/* Table */}
        <div
          style={{
            background:
              "white",
            borderRadius:
              "20px",
            overflow:
              "hidden",
            boxShadow:
              "0 8px 25px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              overflowX:
                "auto",
            }}
          >
            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead
                style={{
                  background:
                    "#f1f5f9",
                }}
              >
                <tr>
                  {[
                    "Request Owner",
                    "Manufacturing Route",
                    "Shipment Type",
                    "Product Type",
                    "Batch Number",
                    "Load Weight",
                    "Priority",
                    "Dispatch Date",
                    "Vehicle",
                    "Driver",
                    "Status",
                  ].map(
                    (header) => (
                      <th
                        key={
                          header
                        }
                        style={{
                          padding:
                            "16px",
                          textAlign:
                            "left",
                          fontSize:
                            "14px",
                        }}
                      >
                        {
                          header
                        }
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={
                        11
                      }
                      style={{
                        padding:
                          "40px",
                        textAlign:
                          "center",
                      }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredBookings.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={
                        11
                      }
                      style={{
                        padding:
                          "40px",
                        textAlign:
                          "center",
                      }}
                    >
                      No transport
                      requests found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(
                    (
                      booking
                    ) => (
                      <tr
                        key={
                          booking._id
                        }
                        style={{
                          borderBottom:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          <strong>
                            {booking
                              ?.userId
                              ?.name ||
                              "N/A"}
                          </strong>
                          <br />
                          <small>
                            {booking
                              ?.userId
                              ?.email}
                          </small>
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          {
                            booking
                              ?.routeId
                              ?.source
                          }
                          <br />
                          →
                          <br />
                          {
                            booking
                              ?.routeId
                              ?.destination
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          {
                            booking.shipmentType
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          {
                            booking.productType
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          {booking.batchNumber ||
                            "N/A"}
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          {
                            booking.loadWeightKg
                          }
                          kg
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {
                            booking.priority
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          {new Date(
                            booking.dispatchDate
                          ).toLocaleDateString()}
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          {booking
                            ?.assignedVehicle
                            ?.plateNumber ||
                            "Not Assigned"}
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          {booking
                            ?.assignedDriver
                            ?.name ||
                            "Not Assigned"}
                        </td>

                        <td
                          style={{
                            padding:
                              "18px",
                          }}
                        >
                          <select
                            value={
                              booking.status
                            }
                            onChange={(
                              e
                            ) =>
                              updateStatus(
                                booking._id,
                                e
                                  .target
                                  .value
                              )
                            }
                            style={{
                              padding:
                                "10px",
                              borderRadius:
                                "10px",
                              border:
                                "none",
                              background:
                                STATUS_COLORS[
                                  booking
                                    .status
                                ],
                              color:
                                "white",
                              fontWeight:
                                "600",
                            }}
                          >
                            {STATUS_OPTIONS.map(
                              (
                                s
                              ) => (
                                <option
                                  key={
                                    s
                                  }
                                  value={
                                    s
                                  }
                                >
                                  {
                                    s
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}