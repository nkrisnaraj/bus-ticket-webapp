import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaTicketAlt, FaCalendarAlt, FaTimes, FaCheckCircle,
  FaDownload, FaBus, FaUser, FaLongArrowAltRight, FaClock,
  FaMapMarkerAlt, FaChair,
} from "react-icons/fa";
import { MdOutlineDoubleArrow } from "react-icons/md";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

// ── helpers ───────────────────────────────────────────────────────────────
const calcDuration = (dep, arr) => {
  if (!dep || !arr) return "";
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  let mins = (ah * 60 + am) - (dh * 60 + dm);
  if (mins < 0) mins += 24 * 60;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const isUpcoming = (booking) => {
  const snap = booking.routeSnapshot;
  if (!snap?.departureDate) return booking.status === "confirmed";
  return booking.status === "confirmed" && snap.departureDate >= new Date().toISOString().split("T")[0];
};

const downloadTicket = (booking) => {
  const snap = booking.routeSnapshot || {};
  const doc = new jsPDF();
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("QBus", 105, 18, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Booking Confirmation Ticket", 105, 30, { align: "center" });
  doc.setTextColor(17, 24, 39);
  autoTable(doc, {
    startY: 52,
    head: [["Field", "Details"]],
    body: [
      ["Booking ID",  booking._id],
      ["Route",       `${snap.source || ""} to ${snap.destination || ""}`],
      ["Date",        snap.departureDate || ""],
      ["Departure",   snap.departureTime || ""],
      ["Arrival",     snap.arrivalTime || ""],
      ["Bus",         `${snap.busNumber || ""}${snap.busType ? " ("+snap.busType+")" : ""}`],
      ["Seat(s)",     booking.seatNumbers.join(", ")],
      ["Total Price", `Rs. ${booking.totalPrice.toLocaleString()}`],
      ["Status",      booking.status.toUpperCase()],
      ["Booked On",   new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
    ],
    headStyles: { fillColor: [245, 158, 11], textColor: [28, 25, 23], fontStyle: "bold", fontSize: 11 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    theme: "grid",
  });
  const pageH = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text("Thank you for choosing QBus — Safe & Comfortable Travel", 105, pageH - 16, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleDateString("en-GB")}`, 105, pageH - 9, { align: "center" });
  doc.save(`QBus-Ticket-${booking._id}.pdf`);
};

const StatusBadge = ({ status }) =>
  status === "confirmed" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
      <FaCheckCircle /> Confirmed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <FaTimes /> Cancelled
    </span>
  );

// ── Booking Card ────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onCancel, cancelling }) => {
  const snap = booking.routeSnapshot || {};
  const duration = calcDuration(snap.departureTime, snap.arrivalTime);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border transition-all ${
        booking.status === "cancelled" ? "opacity-60 border-gray-200 dark:border-gray-700" : "border-gray-200 dark:border-gray-700 hover:shadow-md"
      }`}
    >
      {/* Top bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <FaBus className="text-sm" />
          <span className="text-sm font-semibold">
            {snap.busNumber || "QBus"}{snap.busType ? ` · ${snap.busType}` : ""}
          </span>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="p-5">
        {/* Route display */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">{snap.source || "—"}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{snap.departureTime || ""}</p>
          </div>
          <div className="flex-1 flex flex-col items-center px-3">
            <MdOutlineDoubleArrow className="text-blue-500 text-3xl" />
            {duration && <span className="text-xs text-gray-400 mt-0.5">{duration}</span>}
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">{snap.destination || "—"}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{snap.arrivalTime || ""}</p>
          </div>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4">
          {snap.departureDate && (
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="text-gray-400" />
              {new Date(snap.departureDate + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <FaChair className="text-gray-400" />
            {booking.seatNumbers.length} seat{booking.seatNumbers.length > 1 ? "s" : ""}: <span className="font-medium text-gray-400">{booking.seatNumbers.join(", ")}</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-green-700">
            Rs. {booking.totalPrice.toLocaleString()}
          </span>
        </div>

        {/* Actions */}
        {booking.status === "confirmed" && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => downloadTicket(booking)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <FaDownload /> Download Ticket
            </button>
            <button
              onClick={() => onCancel(booking._id)}
              disabled={cancelling === booking._id}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-xl text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
            >
              {cancelling === booking._id ? "Cancelling…" : "Cancel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Profile Tab ───────────────────────────────────────────────────────────
const ProfileTab = ({ user }) => (
  <div className="max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
          <FaUser className="text-white text-3xl" />
        </div>
        <h3 className="text-white font-bold text-xl">{user?.name || "Traveller"}</h3>
        <p className="text-white/70 text-sm mt-1">{user?.email || ""}</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <FaUser className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">Full Name</p>
            <p className="font-semibold dark:text-white">{user?.name || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <FaMapMarkerAlt className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="font-semibold dark:text-white">{user?.email || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
          <FaBus className="text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">Account Type</p>
            <p className="font-semibold capitalize dark:text-white">{user?.role || "user"}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ── Main Dashboard ──────────────────────────────────────────────────────────
const UserDashboard = () => {
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setBookings(data.bookings);
        else setError(data.message || "Failed to load bookings");
      } catch {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this booking? This cannot be undone.")) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/api/bookings/cancel/${bookingId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: "cancelled" } : b));
      } else {
        alert(data.message || "Cancellation failed");
      }
    } catch {
      alert("Error connecting to server");
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter((b) => !isUpcoming(b));

  const TABS = [
    { id: "upcoming", label: "Upcoming",     icon: <FaClock />,     count: upcomingBookings.length },
    { id: "past",     label: "Past Bookings", icon: <FaTicketAlt />, count: pastBookings.length },
    { id: "profile",  label: "Profile",       icon: <FaUser /> },
  ];

  const displayBookings = tab === "upcoming" ? upcomingBookings : tab === "past" ? pastBookings : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, <span className="font-semibold text-blue-600">{user?.name || "Traveller"}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total",     value: bookings.length,        color: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
            { label: "Upcoming",  value: upcomingBookings.length, color: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800" },
            { label: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, color: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
              <p className="text-xs font-medium uppercase tracking-wide opacity-70">{s.label}</p>
              <p className="text-3xl font-extrabold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-500 dark:bg-gray-500 rounded-2xl p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? "bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.id ? "bg-blue-800 dark:bg-gray-200 text-white dark:text-gray-900" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "profile" ? (
          <ProfileTab user={user} />
        ) : loading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">Loading bookings&hellip;</div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-700">{error}</div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-16">
            <FaTicketAlt className="text-gray-300 dark:text-gray-600 text-6xl mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              {tab === "upcoming" ? "No upcoming journeys" : "No past bookings"}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {tab === "upcoming" ? "Book a seat to get started!" : "Your completed trips will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={handleCancel}
                cancelling={cancellingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
