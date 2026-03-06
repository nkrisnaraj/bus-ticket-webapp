/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBus, FaMapMarkerAlt, FaCalendarAlt, FaSearch,
  FaShieldAlt, FaClock, FaThumbsUp, FaArrowRight,
  FaTicketAlt, FaStar,
} from "react-icons/fa";
import { MdOutlineDoubleArrow } from "react-icons/md";
import busImg from "../assets/images/bus1.jpg";

const POPULAR_ROUTES = [
  { from: "Colombo", to: "Jaffna",        duration: "7h 30m", price: "Rs. 1,500", freq: "3x Daily",    gradient: "from-purple-600 to-indigo-700" },
  { from: "Colombo", to: "Kandy",         duration: "2h 45m", price: "Rs. 600",   freq: "Hourly",      gradient: "from-blue-600 to-cyan-600" },
  { from: "Colombo", to: "Galle",         duration: "2h 30m", price: "Rs. 550",   freq: "Hourly",      gradient: "from-emerald-500 to-teal-600" },
  { from: "Colombo", to: "Nuwara Eliya",  duration: "4h 00m", price: "Rs. 900",   freq: "4x Daily",    gradient: "from-amber-500 to-orange-600" },
  { from: "Kandy",   to: "Anuradhapura",  duration: "3h 30m", price: "Rs. 700",   freq: "2x Daily",    gradient: "from-rose-500 to-pink-600" },
  { from: "Colombo", to: "Trincomalee",   duration: "6h 00m", price: "Rs. 1,200", freq: "2x Daily",    gradient: "from-violet-600 to-purple-700" },
];

const FEATURES = [
  { icon: <FaShieldAlt className="text-4xl text-blue-500" />,  title: "Safe & Secure",       desc: "All buses are GPS-tracked and regularly inspected for your peace of mind." },
  { icon: <FaClock className="text-4xl text-green-500" />,     title: "On-Time Guarantee",   desc: "Real-time schedule monitoring keeps every journey punctual." },
  { icon: <FaThumbsUp className="text-4xl text-amber-500" />,  title: "Transparent Pricing", desc: "No hidden fees. The price you see is exactly what you pay." },
  { icon: <FaTicketAlt className="text-4xl text-purple-500" />, title: "Instant Confirmation", desc: "Your booking is confirmed in seconds with a digital ticket and email." },
];

const REVIEWS = [
  { name: "Dinusha P.", stars: 5, text: "Booked Colombo to Kandy in under a minute. The seat selection UI is fantastic!" },
  { name: "Ranjith S.", stars: 5, text: "On-time departure, comfortable seats. Will definitely use QBus again." },
  { name: "Amali K.",   stars: 4, text: "Great prices and a very clean booking interface. Highly recommend!" },
];

const HomePage = ({ dark }) => {
  const [form, setForm] = useState({ source: "", destination: "", date: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.source || !form.destination || !form.date) {
      setError("Please fill in all fields to search.");
      return;
    }
    setError("");
    navigate("/search-results", { state: form });
  };

  const quickSearch = (from, to) => {
    navigate("/search-results", {
      state: { source: from, destination: to, date: new Date().toISOString().split("T")[0] },
    });
  };

  const bg = dark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900";
  const card = dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100";
  const muted = dark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* ━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${busImg})` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/92 via-blue-900/88 to-indigo-950/92" />
        {/* floating blobs */}
        <div className="absolute top-16 right-16 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-24 left-8 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 text-white/80 text-sm font-medium">
            <FaBus className="text-amber-400" />
            <span>Sri Lanka&rsquo;s Premium Bus Booking Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Travel Smarter,<br />
            <span className="text-amber-400">Book in Seconds</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Search hundreds of routes, pick your seat, and pay securely — all in one place.
          </p>

          {/* Search Card */}
          <form
            onSubmit={handleSearch}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 md:p-7 shadow-2xl text-left"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-amber-400 text-sm" />
                <input
                  type="text"
                  placeholder="From city"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full pl-9 pr-3 py-3 bg-white/95 text-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-400 font-medium"
                />
              </div>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-blue-500 text-sm" />
                <input
                  type="text"
                  placeholder="To city"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  className="w-full pl-9 pr-3 py-3 bg-white/95 text-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 font-medium"
                />
              </div>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3.5 top-3.5 text-green-500 text-sm" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-9 pr-3 py-3 bg-white/95 text-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-medium"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-gray-900 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/30 text-sm"
              >
                <FaSearch /> Search Buses
              </button>
            </div>
            {error && <p className="mt-3 text-red-300 text-sm text-center">{error}</p>}
          </form>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60 C480 0 960 0 1440 60L1440 60H0Z" fill={dark ? "#111827" : "#ffffff"} />
          </svg>
        </div>
      </section>

      {/* ━━━━ STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className={`py-10 ${dark ? "bg-gray-900" : "bg-white"} shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "100+",  label: "Routes" },
            { value: "50K+",  label: "Happy Travellers" },
            { value: "200+",  label: "Daily Trips" },
            { value: "4.8★",  label: "Avg. Rating" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-blue-600">{s.value}</p>
              <p className={`text-sm mt-1 ${muted}`}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━ POPULAR ROUTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className={`py-20 px-4 ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-3 ${dark ? "text-white" : "text-gray-900"}`}>
              Popular Routes
            </h2>
            <p className={`${muted} text-lg`}>Tap any route to search buses for today</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POPULAR_ROUTES.map((route, i) => (
              <button
                key={i}
                onClick={() => quickSearch(route.from, route.to)}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${route.gradient} p-5 text-left shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-10 translate-x-10 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-white font-bold text-xl">{route.from}</span>
                    <MdOutlineDoubleArrow className="text-white/60 text-2xl flex-shrink-0" />
                    <span className="text-white font-bold text-xl">{route.to}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/70 text-xs">{route.duration} &middot; {route.freq}</p>
                      <p className="text-white font-extrabold text-2xl mt-1">{route.price}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors">
                      <FaArrowRight className="text-white text-sm" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className={`py-20 px-4 ${dark ? "bg-gray-900" : "bg-white"}`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl md:text-4xl font-extrabold text-center mb-12 ${dark ? "text-white" : "text-gray-900"}`}>
            Why Millions Choose QBus
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`rounded-2xl p-6 text-center border ${card} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex justify-center mb-4">{f.icon}</div>
                <h3 className={`font-bold text-base mb-2 ${dark ? "text-white" : "text-gray-800"}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${muted}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ TESTIMONIALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className={`py-20 px-4 ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-3xl font-extrabold text-center mb-10 ${dark ? "text-white" : "text-gray-900"}`}>
            What Travellers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${card} shadow-sm`}>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <FaStar key={j} className="text-amber-400 text-sm" />
                  ))}
                </div>
                <p className={`text-sm leading-relaxed mb-4 ${muted}`}>&ldquo;{r.text}&rdquo;</p>
                <p className={`font-semibold text-sm ${dark ? "text-white" : "text-gray-800"}`}>{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to ride?</h2>
        <p className="text-white/70 mb-8 text-lg">Book your bus ticket in under 60 seconds.</p>
        <button
          onClick={() => navigate("/search-results", { state: { source: "", destination: "", date: "" } })}
          className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-2xl shadow-lg shadow-black/20 transition-all active:scale-95 text-base"
        >
          <FaSearch /> Find My Bus
        </button>
      </section>

    </div>
  );
};

export default HomePage;
