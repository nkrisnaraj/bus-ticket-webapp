import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineDoubleArrow } from "react-icons/md";
import { FaBus, FaChair, FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const calculateDuration = (departTime, arriveTime) => {
  const dep = new Date(`1970-01-01T${departTime}`);
  const arr = new Date(`1970-01-01T${arriveTime}`);
  const diffMs = arr - dep < 0 ? arr - dep + 86400000 : arr - dep;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.round((diffMs % 3600000) / 60000);
  return `${h}h ${m}m`;
};

const typeBadgeColor = (type) => {
  if (!type) return "bg-gray-100 text-gray-700";
  if (type === "AC") return "bg-blue-100 text-blue-700";
  if (type === "Luxury") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
};

const SearchResultsPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const { source, destination, date } = location.state || {};
  const [searchForm, setSearchForm] = useState({ source: "", destination: "", date: "" });
  const showSearchForm = !source || !destination || !date;

  const handleFormSearch = (e) => {
    e.preventDefault();
    navigate("/search-results", { state: searchForm });
  };

  useEffect(() => {
    if (!source || !destination || !date) return;
    const fetchSchedules = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_URL}/api/schedules?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`
        );
        const data = await res.json();
        if (data.success) {
          setSchedules(data.schedules);
        } else {
          setError(data.message || "Failed to load schedules.");
        }
      } catch {
        setError("Error connecting to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [source, destination, date]);

  const handleBook = (schedule) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: "/seat" }, pendingSchedule: schedule },
      });
    } else {
      navigate("/seat", { state: { Schedule: schedule } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {showSearchForm ? (
          /* Inline search form when navigated without state */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-xl mx-auto mt-8">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Search Buses</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find available trips for your route</p>
              </div>
            </div>
            <form onSubmit={handleFormSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                <input
                  type="text"
                  placeholder="Departure city"
                  value={searchForm.source}
                  onChange={(e) => setSearchForm((f) => ({ ...f, source: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                <input
                  type="text"
                  placeholder="Destination city"
                  value={searchForm.destination}
                  onChange={(e) => setSearchForm((f) => ({ ...f, destination: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={searchForm.date}
                  onChange={(e) => setSearchForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Search Buses
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {source} → {destination}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {date ? new Date(date).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}
                </p>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400">Searching for trips&hellip;</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-6 text-center">
                {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && schedules.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <FaBus className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No trips found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No schedules available for this route on the selected date. Try a different date.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Search Again
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && schedules.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">{schedules.length} trip{schedules.length !== 1 ? "s" : ""} available</p>
                {schedules.map((s) => {
                  const avail = s.totalSeats - (s.bookedSeats?.length || 0);
                  return (
                    <div
                      key={s._id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Top bar */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                          <FaBus className="text-sm" />
                          <span className="font-mono font-bold text-sm">{s.busId?.busNumber || "—"}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeBadgeColor(s.busId?.type)}`}>
                          {s.busId?.type || "Bus"}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Route */}
                        <div className="flex-1 flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{s.departureTime}</p>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mt-0.5">{s.source}</p>
                          </div>
                          <div className="flex-1 flex flex-col items-center gap-1">
                            <MdOutlineDoubleArrow className="text-blue-500 text-3xl" />
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {calculateDuration(s.departureTime, s.arrivalTime)}
                            </span>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{s.arrivalTime}</p>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mt-0.5">{s.destination}</p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-16 bg-gray-200 dark:bg-gray-600" />

                        {/* Price / seats / book */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">Rs. {s.price?.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">per seat</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <FaChair className="text-green-500" />
                            <span className={avail === 0 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>
                              {avail}
                            </span>
                            <span>/ {s.totalSeats} available</span>
                          </div>
                          <button
                            onClick={() => handleBook(s)}
                            disabled={avail === 0}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                          >
                            {avail === 0 ? "Full" : isAuthenticated ? "Select Seats" : "Book Now"}
                          </button>
                        </div>
                      </div>

                      {/* Date footer */}
                      <div className="px-5 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-600 text-xs text-gray-400 dark:text-gray-500">
                        Departure date: {new Date(s.departureDate).toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
