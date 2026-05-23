import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api";
import toast from "react-hot-toast";

export default function BrowseRoutes() {
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);

  const [booking, setBooking] = useState({
    routeId: "",
    seats: 1,
    travelDate: "",
  });

  // { capacity, booked, available }
  const [avail, setAvail] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/routes")
      .then(({ data }) => setRoutes(data.value ?? data))
      .catch(() => toast.error("Failed to load routes"));
  }, []);

  const total = useMemo(() => {
    if (!selected) return 0;
    return (selected.fare || 0) * (booking.seats || 1);
  }, [selected, booking.seats]);

  const openModal = (route) => {
    setSelected(route);
    setBooking({ routeId: route._id, seats: 1, travelDate: "" });
    setAvail(null);
  };

  const closeModal = () => {
    setSelected(null);
    setBooking({ routeId: "", seats: 1, travelDate: "" });
    setAvail(null);
  };

  const fetchAvailability = async (routeId, travelDate) => {
    if (!routeId || !travelDate) return;
    try {
      const { data } = await api.get("/bookings/availability", {
        params: { routeId, travelDate },
      });
      setAvail(data);
      if (data.available === 0) toast.error("No seats available on this date");
    } catch {
      toast.error("Could not check availability");
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setBooking((b) => ({ ...b, travelDate: date }));
    // use booking.routeId already set in openModal
    fetchAvailability(booking.routeId, date);
  };

  const handleBook = async () => {
    if (!booking.travelDate) return toast.error("Select a travel date");

    if (avail && booking.seats > avail.available) {
      return toast.error(`Only ${avail.available} seat(s) available`);
    }

    setLoading(true);
    try {
      await api.post("/bookings", booking);
      toast.success("Booking confirmed!");
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto mt-8 px-4 pb-10">
        <h1 className="text-2xl font-bold mb-6">Available Routes</h1>

        {routes.length === 0 ? (
          <p className="text-gray-500">No routes available.</p>
        ) : (
          <div className="grid gap-4">
            {routes.map((route) => (
              <div
                key={route._id}
                className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {route.source} → {route.destination}
                  </p>
                  <p className="text-sm text-gray-500">
                    {route.distance} km · {route.duration} min · Departs{" "}
                    {route.departureTime}
                  </p>
                  <p className="text-sm text-gray-500">
                    Vehicle: {route.vehicleId?.name} ({route.vehicleId?.type}) ·{" "}
                    Capacity: {route.vehicleId?.capacity}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <p className="text-xl font-bold text-blue-600">₹{route.fare}</p>
                  <button
                    onClick={() => openModal(route)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-1">Book Seat</h2>
              <p className="text-gray-500 mb-4 text-sm">
                {selected.source} → {selected.destination} · ₹{selected.fare}/seat
              </p>

              <label className="block text-sm font-medium mb-1">Travel Date</label>
              <input
                type="date"
                min={minDate}
                className="w-full border px-3 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={booking.travelDate}
                onChange={handleDateChange}
              />

              {avail && (
                <div
                  className={`text-sm mb-3 px-3 py-2 rounded ${
                    avail.available > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {avail.available > 0
                    ? `✅ ${avail.available} seat(s) available (${avail.booked} booked of ${avail.capacity})`
                    : "❌ Fully booked on this date"}
                </div>
              )}

              <label className="block text-sm font-medium mb-1">Seats</label>
              <input
                type="number"
                min="1"
                max={avail?.available ?? selected.vehicleId?.capacity ?? 999}
                className="w-full border px-3 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={booking.seats}
                onChange={(e) =>
                  setBooking({
                    ...booking,
                    seats: parseInt(e.target.value, 10) || 1,
                  })
                }
              />

              <p className="text-sm text-gray-600 mb-4">
                Total:{" "}
                <span className="font-bold text-blue-600 text-base">
                  ₹{total}
                </span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleBook}
                  disabled={loading || avail?.available === 0}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {loading ? "Booking..." : "Confirm"}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 border py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}