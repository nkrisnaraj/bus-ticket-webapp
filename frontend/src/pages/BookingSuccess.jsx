import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaCheckCircle, FaTimesCircle, FaTicketAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const { token } = useAuth();
  // Guard against React StrictMode double-invocation in development
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("No payment session found. Please contact support if you were charged.");
      setStatus("error");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payment/verify-and-book`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (data.success) {
          setBooking(data.booking);
          setStatus("success");
        } else {
          setError(data.message || "Booking verification failed.");
          setStatus("error");
        }
      } catch {
        setError("Error connecting to server. Please check your Dashboard to confirm the booking.");
        setStatus("error");
      }
    };

    verifyPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Loading State ────────────────────────────────────────── */
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Confirming your booking&hellip;
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Please do not close this page.</p>
      </div>
    );
  }

  /* ── Error State ──────────────────────────────────────────── */
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 pt-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              <FaTicketAlt /> My Bookings
            </Link>
            <Link
              to="/"
              className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success State ────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 pt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        {/* Animated checkmark */}
        <div className="flex justify-center mb-4">
          <FaCheckCircle className="text-green-500 text-6xl animate-bounce" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          A confirmation email has been sent to your registered address.
        </p>

        {/* Booking summary card */}
        {booking && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 text-left text-sm space-y-2.5 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Booking ID</span>
              <span className="font-mono text-xs font-semibold text-gray-800 dark:text-white">
                {booking._id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Bus Route</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                #{booking.busId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Seats</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {booking.seatNumbers.join(", ")}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-2.5 mt-1">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Total Paid</span>
              <span className="font-bold text-green-600 text-base">
                Rs.&nbsp;{booking.totalPrice}.00
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            <FaTicketAlt /> My Bookings
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
