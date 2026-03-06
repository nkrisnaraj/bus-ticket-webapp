import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  FaBus, FaTicketAlt, FaUsers, FaTrash, FaPlus, FaPencilAlt,
  FaChevronRight, FaSignOutAlt, FaCircle, FaCalendarAlt, FaCog,
  FaTachometerAlt, FaSave, FaTimes, FaCheck,
  FaSync, FaExclamationTriangle, FaRupeeSign,
} from "react-icons/fa";
import { MdOutlineDoubleArrow } from "react-icons/md";

const API_URL = import.meta.env.VITE_API_URL;
const BUS_TYPES = ["AC", "Non-AC", "Luxury", "Semi-Luxury"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FIXED_SEATS = 47;

// ── Utilities ─────────────────────────────────────────────────────────────────
const computeArrivalDate = (depDate, depTime, arrTime) => {
  if (!depDate) return "";
  if (!depTime || !arrTime || arrTime >= depTime) return depDate;
  const d = new Date(depDate + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

// ── Sub-components ────────────────────────────────────────────────────────────
const Inp = ({ label, name, value, onChange, placeholder, type = "text", required, readOnly }) => (
  <div>
    {label && <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wide">{label}</label>}
    <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange}
      required={required} readOnly={readOnly}
      className={`w-full bg-gray-600 text-white placeholder-gray-400 border border-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${readOnly ? "opacity-50 cursor-not-allowed" : ""}`}
    />
  </div>
);

const Sel = ({ label, name, value, onChange, options }) => (
  <div>
    {label && <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wide">{label}</label>}
    <select name={name} value={value} onChange={onChange}
      className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
      {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);

const StatusPill = ({ status }) => {
  const cls = {
    scheduled: "bg-emerald-900/60 text-emerald-300",
    completed: "bg-gray-600 text-gray-300",
    cancelled: "bg-red-900/60 text-red-300",
    confirmed: "bg-emerald-900/60 text-emerald-300",
  }[status] || "bg-gray-600 text-gray-300";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
      <FaCircle className="text-[5px]" />{status}
    </span>
  );
};

const AlertMsg = ({ type, text, onClose }) => {
  if (!text) return null;
  return (
    <div className={`flex items-start gap-2 mb-4 p-3 rounded-xl text-sm border ${
      type === "success" ? "bg-emerald-900/40 text-emerald-300 border-emerald-800/60"
                        : "bg-red-900/40 text-red-300 border-red-800/60"}`}>
      {type === "success" ? <FaCheck className="mt-0.5 flex-shrink-0" /> : <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />}
      <span className="flex-1">{text}</span>
      {onClose && <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity"><FaTimes /></button>}
    </div>
  );
};

const SidebarItem = ({ icon, label, id, active, onClick }) => (
  <button onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active ? "bg-gradient-to-r from-cyan-500/90 to-blue-600/90 text-white shadow-lg shadow-blue-900/30"
             : "text-gray-400 hover:bg-gray-700/60 hover:text-white"}`}>
    <span className="text-base flex-shrink-0">{icon}</span>
    <span className="hidden md:block flex-1 text-left">{label}</span>
    {active && <FaChevronRight className="hidden md:block ml-auto text-[10px] opacity-60" />}
  </button>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Overview Panel ────────────────────────────────────────────────────────────
const OverviewPanel = ({ token, setActivePanel }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/admin/fleet`,    { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/schedules`,{ headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/bookings`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/users`,    { headers: h }).then(r => r.json()),
    ]).then(([f, s, b, u]) => {
      setStats({ fleet: f.fleet || [], schedules: s.schedules || [], bookings: b.bookings || [], users: u.users || [] });
    }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (!stats) return null;

  const today = new Date().toISOString().split("T")[0];
  const revenue = stats.bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + b.totalPrice, 0);
  const todayTrips = stats.schedules.filter(s => s.departureDate === today);
  const recent = stats.bookings.slice(0, 6);

  const KPI_CARDS = [
    { icon: <FaBus />,        label: "Total Buses",   value: stats.fleet.length,     sub: `${stats.fleet.filter(f => f.isActive).length} active`,         border: "border-blue-700/50",    text: "text-blue-400",    bg: "from-blue-500/20 to-blue-600/10" },
    { icon: <FaCalendarAlt />,label: "Schedules",     value: stats.schedules.length, sub: `${todayTrips.length} today`,                                    border: "border-purple-700/50",  text: "text-purple-400",  bg: "from-purple-500/20 to-purple-600/10" },
    { icon: <FaTicketAlt />,  label: "Bookings",      value: stats.bookings.length,  sub: `${stats.bookings.filter(b => b.status === "confirmed").length} confirmed`, border: "border-emerald-700/50", text: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" },
    { icon: <FaRupeeSign />,  label: "Revenue",       value: `Rs. ${revenue.toLocaleString()}`, sub: "all-time",                                            border: "border-amber-700/50",   text: "text-amber-400",   bg: "from-amber-500/20 to-amber-600/10" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-0.5">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-xl p-4 flex items-start gap-3`}>
            <span className={`text-2xl mt-0.5 ${c.text}`}>{c.icon}</span>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide">{c.label}</p>
              <p className="text-white font-bold text-xl leading-tight mt-0.5">{c.value}</p>
              {c.sub && <p className="text-gray-500 text-[11px] mt-0.5">{c.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-gray-700/30 border border-gray-600/60 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-600/60 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <FaTicketAlt className="text-cyan-400" /> Recent Bookings
          </h3>
          <button onClick={() => setActivePanel("bookings")} className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors">View all →</button>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-300">
              <thead>
                <tr className="bg-gray-700/30">
                  {["Booking ID", "Customer", "Route", "Seats", "Amount", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-gray-400 font-medium uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(b => {
                  const snap = b.routeSnapshot || {};
                  return (
                    <tr key={b._id} className="border-t border-gray-700/40 hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-gray-500">#{b._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-2.5">
                        <p className="text-white font-medium">{b.userId?.name || "—"}</p>
                        <p className="text-gray-500 text-[10px]">{b.userId?.email}</p>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{snap.source ? `${snap.source} → ${snap.destination}` : "—"}</td>
                      <td className="px-4 py-2.5 text-gray-400">{b.seatNumbers?.join(", ")}</td>
                      <td className="px-4 py-2.5 text-emerald-400 font-semibold">Rs. {b.totalPrice?.toLocaleString()}</td>
                      <td className="px-4 py-2.5"><StatusPill status={b.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Today's Trips */}
      <div className="bg-gray-700/30 border border-gray-600/60 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-600/60 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <FaCalendarAlt className="text-cyan-400" /> Today's Trips
          </h3>
          <button onClick={() => setActivePanel("schedules")} className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors">All schedules →</button>
        </div>
        {todayTrips.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No trips scheduled for today</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-300">
              <thead>
                <tr className="bg-gray-700/30">
                  {["Bus", "Route", "Departure", "Arrival", "Booked", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-gray-400 font-medium uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayTrips.map(s => (
                  <tr key={s._id} className="border-t border-gray-700/40 hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-white">{s.busId?.busNumber || "—"}</td>
                    <td className="px-4 py-2.5">{s.source} → {s.destination}</td>
                    <td className="px-4 py-2.5">{s.departureDate} {s.departureTime}</td>
                    <td className="px-4 py-2.5">
                      {s.arrivalDate || s.departureDate} {s.arrivalTime}
                      {s.arrivalDate && s.arrivalDate !== s.departureDate && <span className="ml-1 text-amber-400">(+1d)</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`font-semibold ${s.bookedSeats?.length === s.totalSeats ? "text-red-400" : "text-emerald-400"}`}>{s.bookedSeats?.length || 0}</span>
                      <span className="text-gray-500">/{s.totalSeats}</span>
                    </td>
                    <td className="px-4 py-2.5"><StatusPill status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Fleet Panel ───────────────────────────────────────────────────────────────
const EMPTY_FLEET_FORM = { busNumber: "", type: "AC", source: "", destination: "", routeNumber: "", ownerMobile: "", driverMobile: "", conductorMobile: "", description: "" };

const FleetPanel = ({ token }) => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FLEET_FORM);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [deletingId, setDeletingId] = useState(null);

  const fetchFleet = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/fleet`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setFleet(data.fleet);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchFleet(); }, [fetchFleet]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd = () => { setEditId(null); setForm(EMPTY_FLEET_FORM); setShowForm(true); window.scrollTo(0, 0); };
  const openEdit = (v) => {
    setEditId(v._id);
    setForm({ busNumber: v.busNumber, type: v.type, source: v.source || "", destination: v.destination || "", routeNumber: v.routeNumber || "", ownerMobile: v.ownerMobile || "", driverMobile: v.driverMobile || "", conductorMobile: v.conductorMobile || "", description: v.description || "" });
    setShowForm(true);
    window.scrollTo(0, 0);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY_FLEET_FORM); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    try {
      const url = editId ? `${API_URL}/api/admin/fleet/${editId}` : `${API_URL}/api/admin/fleet`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        if (editId) setFleet(p => p.map(v => v._id === editId ? data.fleet : v));
        else setFleet(p => [...p, data.fleet]);
        closeForm();
        setMsg({ type: "success", text: editId ? "Vehicle updated successfully!" : "Vehicle added to fleet!" });
      } else {
        setMsg({ type: "error", text: data.message });
      }
    } catch { setMsg({ type: "error", text: "Server error. Please try again." }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this vehicle from the fleet? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/fleet/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setFleet(p => p.filter(v => v._id !== id));
      else setMsg({ type: "error", text: data.message });
    } finally { setDeletingId(null); }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"><FaBus className="text-blue-400" /></span>
            Fleet Management
          </h2>
          <p className="text-gray-400 text-sm mt-0.5 ml-10">{fleet.length} vehicles registered &bull; {FIXED_SEATS} seats (fixed)</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-900/40 transition-all">
          <FaPlus /> Add Vehicle
        </button>
      </div>

      <AlertMsg type={msg.type} text={msg.text} onClose={() => setMsg({ type: "", text: "" })} />

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-gray-700/50 border border-gray-600/80 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              {editId ? <><FaPencilAlt className="text-cyan-400 text-sm" /> Edit Vehicle</> : <><FaPlus className="text-cyan-400 text-sm" /> New Vehicle</>}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-white transition-colors p-1"><FaTimes /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Inp label="Bus Number *"      name="busNumber"       value={form.busNumber}       onChange={handleChange} placeholder="e.g. NB-1234"    required />
              <Sel label="Bus Type *"        name="type"            value={form.type}            onChange={handleChange} options={BUS_TYPES} />
              <Inp label="Source *"          name="source"          value={form.source}          onChange={handleChange} placeholder="e.g. Colombo"    required />
              <Inp label="Destination *"     name="destination"     value={form.destination}     onChange={handleChange} placeholder="e.g. Galle"      required />
              <Inp label="Route Number"      name="routeNumber"     value={form.routeNumber}     onChange={handleChange} placeholder="e.g. 100" />
              <Inp label="Owner Mobile"      name="ownerMobile"     value={form.ownerMobile}     onChange={handleChange} placeholder="+94 XX XXX XXXX" />
              <Inp label="Driver Mobile"     name="driverMobile"    value={form.driverMobile}    onChange={handleChange} placeholder="+94 XX XXX XXXX" />
              <Inp label="Conductor Mobile"  name="conductorMobile" value={form.conductorMobile} onChange={handleChange} placeholder="+94 XX XXX XXXX" />
              <Inp label="Description"       name="description"     value={form.description}     onChange={handleChange} placeholder="Optional notes" />
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-600/50">
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-colors">
                <FaSave /> {editId ? "Save Changes" : "Add Vehicle"}
              </button>
              <button type="button" onClick={closeForm}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/60 px-3 py-1.5 rounded-full">
                <FaCheck className="text-cyan-500" /> Fixed seats: {FIXED_SEATS}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/60">
          <table className="w-full text-sm text-gray-300">
            <thead className="bg-gray-700/60 text-gray-400 text-[11px] uppercase tracking-wide">
              <tr>
                {["Bus No.", "Type", "Route", "Owner", "Driver / Conductor", "Seats", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {fleet.map(v => (
                <tr key={v._id} className="hover:bg-gray-700/20 transition-colors group">
                  <td className="px-4 py-3 font-mono font-bold text-white tracking-wider">{v.busNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      v.type === "AC" ? "bg-blue-900/60 text-blue-300"
                      : v.type === "Luxury" ? "bg-purple-900/60 text-purple-300"
                      : v.type === "Semi-Luxury" ? "bg-indigo-900/60 text-indigo-300"
                      : "bg-gray-600 text-gray-300"}`}>{v.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium text-xs">{v.routeNumber ? `#${v.routeNumber}` : "—"}</p>
                    <p className="text-gray-500 text-[11px]">{v.source && v.destination ? `${v.source} – ${v.destination}` : "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{v.ownerMobile || "—"}</td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-gray-400">Driver: {v.driverMobile || "—"}</p>
                    <p className="text-[11px] text-gray-400">Conductor: {v.conductorMobile || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-cyan-400">{v.totalSeats || FIXED_SEATS}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(v)} title="Edit vehicle" className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30 rounded-lg transition-colors"><FaPencilAlt className="text-xs" /></button>
                      <button onClick={() => handleDelete(v._id)} disabled={deletingId === v._id} title="Delete vehicle" className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-40"><FaTrash className="text-xs" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {fleet.length === 0 && (
                <tr><td colSpan={7} className="text-center py-14 text-gray-500">No vehicles registered yet. Click "Add Vehicle" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Scheduling Panel ──────────────────────────────────────────────────────────
const EMPTY_SCHED = { busId: "", source: "", destination: "", departureDate: "", departureTime: "", arrivalTime: "", arrivalDate: "", price: "", isRecurring: false, recurringDays: [], recurringEndDate: "" };

const SchedulingPanel = ({ token }) => {
  const [schedules, setSchedules] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_SCHED);

  const fetchAll = useCallback(async () => {
    try {
      const [sr, fr] = await Promise.all([
        fetch(`${API_URL}/api/admin/schedules`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/fleet`,     { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [sd, fd] = await Promise.all([sr.json(), fr.json()]);
      if (sd.success) setSchedules(sd.schedules);
      if (fd.success) setFleet(fd.fleet);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (fleet.length > 0 && !form.busId) {
      const firstBus = fleet[0];
      setForm(f => ({ ...f, busId: firstBus._id, source: firstBus.source || "", destination: firstBus.destination || "" }));
    }
  }, [fleet, form.busId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => {
      const updated = { ...f, [name]: type === "checkbox" ? checked : value };
      if (name === "busId") {
        const bus = fleet.find(v => v._id === value);
        updated.source = bus?.source || "";
        updated.destination = bus?.destination || "";
      }
      if (["departureDate", "departureTime", "arrivalTime"].includes(name)) {
        const depDate = name === "departureDate" ? value : f.departureDate;
        const depTime = name === "departureTime" ? value : f.departureTime;
        const arrTime = name === "arrivalTime"   ? value : f.arrivalTime;
        updated.arrivalDate = computeArrivalDate(depDate, depTime, arrTime);
      }
      return updated;
    });
  };

  const swapRoute = () => setForm(f => ({ ...f, source: f.destination, destination: f.source }));

  const toggleDay = (day) => setForm(f => ({
    ...f, recurringDays: f.recurringDays.includes(day) ? f.recurringDays.filter(d => d !== day) : [...f.recurringDays, day],
  }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (form.isRecurring && form.recurringDays.length === 0) {
      return setMsg({ type: "error", text: "Please select at least one day for recurring schedule." });
    }
    if (form.isRecurring && !form.recurringEndDate) {
      return setMsg({ type: "error", text: "Please set an end date for the recurring schedule." });
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        await fetchAll();
        const nextBus = fleet[0];
        setForm({ ...EMPTY_SCHED, busId: nextBus?._id || "", source: nextBus?.source || "", destination: nextBus?.destination || "" });
        setShowForm(false);
        setMsg({ type: "success", text: data.message || "Trip scheduled!" });
      } else {
        setMsg({ type: "error", text: data.message });
      }
    } catch { setMsg({ type: "error", text: "Server error. Please try again." }); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/admin/schedules/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setSchedules(p => p.filter(s => s._id !== id));
    } finally { setDeletingId(null); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center"><FaCalendarAlt className="text-purple-400" /></span>
            Trip Scheduling
          </h2>
          <p className="text-gray-400 text-sm mt-0.5 ml-10">{schedules.length} trips scheduled</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} disabled={fleet.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-900/40 transition-all">
          <FaPlus /> Schedule Trip
        </button>
      </div>

      {fleet.length === 0 && !loading && (
        <div className="mb-4 p-3 rounded-xl bg-amber-900/30 text-amber-300 text-sm border border-amber-700/50 flex items-center gap-2">
          <FaExclamationTriangle /> Add at least one vehicle in Fleet Management before scheduling a trip.
        </div>
      )}

      <AlertMsg type={msg.type} text={msg.text} onClose={() => setMsg({ type: "", text: "" })} />

      {/* Schedule Form */}
      {showForm && fleet.length > 0 && (
        <div className="bg-gray-700/50 border border-gray-600/80 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FaPlus className="text-cyan-400 text-sm" /> New Trip
            </h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors p-1"><FaTimes /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-full md:col-span-1">
                <Sel label="Vehicle *" name="busId" value={form.busId} onChange={handleChange}
                  options={fleet.map(v => ({ value: v._id, label: `${v.busNumber} — ${v.type} (${v.totalSeats || FIXED_SEATS} seats)` }))} />
              </div>
              {(() => {
                const selBus = fleet.find(v => v._id === form.busId);
                return selBus?.source && selBus?.destination ? (
                  <div className="col-span-full md:col-span-2">
                    <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wide">Direction *</label>
                    <div className="flex items-center gap-2 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2">
                      <span className="text-white font-semibold text-sm">{form.source}</span>
                      <MdOutlineDoubleArrow className="text-cyan-400 flex-shrink-0" />
                      <span className="text-white font-semibold text-sm">{form.destination}</span>
                      <button type="button" onClick={swapRoute}
                        className="ml-auto text-cyan-400 hover:text-cyan-300 bg-cyan-900/20 hover:bg-cyan-900/40 border border-cyan-700/40 rounded-lg px-2 py-1 text-xs font-semibold transition-colors">
                        ⇄ Swap
                      </button>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-1">Locked to registered route — swap to reverse direction</p>
                  </div>
                ) : (
                  <>
                    <Inp label="From *"      name="source"      value={form.source}      onChange={handleChange} placeholder="e.g. Colombo" required />
                    <Inp label="To *"        name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Galle"   required />
                  </>
                );
              })()}
              <Inp label="Departure Date *" name="departureDate" type="date" value={form.departureDate} onChange={handleChange} required />
              <Inp label="Departure Time *" name="departureTime" type="time" value={form.departureTime} onChange={handleChange} required />
              <Inp label="Arrival Time *"   name="arrivalTime"   type="time" value={form.arrivalTime}   onChange={handleChange} required />
              <div>
                <Inp label="Arrival Date (auto-computed)" name="arrivalDate" value={form.arrivalDate} readOnly />
                {form.arrivalDate && form.arrivalDate !== form.departureDate && (
                  <p className="text-amber-400 text-[11px] mt-1">⚠ Overnight trip — arrives next day</p>
                )}
              </div>
              <Inp label="Ticket Price (Rs.) *" name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 1200" required />
            </div>

            {/* Recurring toggle */}
            <div className="border-t border-gray-600/50 pt-4">
              <label className="flex items-center gap-3 cursor-pointer w-fit select-none">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isRecurring ? "bg-cyan-500" : "bg-gray-600"}`}>
                  <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} className="sr-only" />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${form.isRecurring ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm text-gray-200 font-medium">Recurring Schedule</span>
                <FaSync className={`text-xs transition-colors ${form.isRecurring ? "text-cyan-400" : "text-gray-600"}`} />
              </label>

              {form.isRecurring && (
                <div className="mt-4 space-y-3 pl-3 border-l-2 border-cyan-500/40">
                  <div>
                    <p className="text-[11px] text-gray-400 mb-2 uppercase tracking-wide">Repeat on days *</p>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(d => (
                        <button key={d} type="button" onClick={() => toggleDay(d)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            form.recurringDays.includes(d) ? "bg-cyan-500 text-white shadow shadow-cyan-900/40" : "bg-gray-600 text-gray-300 hover:bg-gray-500"}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="w-52">
                    <Inp label="Repeat until *" name="recurringEndDate" type="date" value={form.recurringEndDate} onChange={handleChange} />
                  </div>
                  {form.recurringDays.length > 0 && form.departureDate && form.recurringEndDate && (
                    <p className="text-cyan-400 text-xs">
                      Recurring every {form.recurringDays.join(", ")} from {form.departureDate} to {form.recurringEndDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-colors">
                <FaSave /> {form.isRecurring ? "Create Recurring Trips" : "Create Schedule"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl text-sm transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/60">
          <table className="w-full text-sm text-gray-300">
            <thead className="bg-gray-700/60 text-gray-400 text-[11px] uppercase tracking-wide">
              <tr>
                {["Bus", "Route", "Departure", "Arrival", "Price", "Booked", "Status", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {schedules.map(s => (
                <tr key={s._id} className="hover:bg-gray-700/20 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-white text-xs">{s.busId?.busNumber || "—"}</p>
                    <p className="text-gray-500 text-[10px]">{s.busId?.type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className="font-medium text-white text-sm">{s.source}</span>
                      <MdOutlineDoubleArrow className="text-cyan-400 flex-shrink-0" />
                      <span className="font-medium text-white text-sm">{s.destination}</span>
                    </div>
                    {s.isRecurring && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 mt-0.5">
                        <FaSync className="text-[8px]" /> Recurring
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium text-xs">{s.departureDate}</p>
                    <p className="text-gray-400 text-[11px]">{s.departureTime}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium text-xs">
                      {s.arrivalDate || s.departureDate}
                      {s.arrivalDate && s.arrivalDate !== s.departureDate && <span className="ml-1 text-amber-400 text-[10px]">+1d</span>}
                    </p>
                    <p className="text-gray-400 text-[11px]">{s.arrivalTime}</p>
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">Rs. {s.price?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${s.bookedSeats?.length === s.totalSeats ? "text-red-400" : "text-gray-300"}`}>{s.bookedSeats?.length || 0}</span>
                    <span className="text-gray-500 text-xs">/{s.totalSeats}</span>
                  </td>
                  <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s._id)} disabled={deletingId === s._id}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40">
                      <FaTrash className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan={8} className="text-center py-14 text-gray-500">No schedules yet. Add fleet vehicles first, then schedule trips.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── All Bookings Panel ────────────────────────────────────────────────────────
const AllBookingsPanel = ({ token }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/bookings`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setBookings(data.bookings);
        else setError(data.message || "Failed to load bookings.");
      } catch { setError("Network error. Check backend connection."); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const revenue  = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <span className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"><FaTicketAlt className="text-emerald-400" /></span>
          Booking Overview
        </h2>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total",     value: bookings.length,              color: "text-blue-400",    border: "border-blue-700/50",    bg: "from-blue-500/20 to-blue-600/10" },
          { label: "Confirmed", value: confirmed,                    color: "text-emerald-400", border: "border-emerald-700/50", bg: "from-emerald-500/20 to-emerald-600/10" },
          { label: "Revenue",   value: `Rs. ${revenue.toLocaleString()}`, color: "text-amber-400", border: "border-amber-700/50", bg: "from-amber-500/20 to-amber-600/10" },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-xl p-4`}>
            <p className="text-gray-400 text-xs uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <AlertMsg type="error" text={error} onClose={() => setError("")} />

      {loading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/60">
          <table className="w-full text-sm text-gray-300">
            <thead className="bg-gray-700/60 text-gray-400 text-[11px] uppercase tracking-wide">
              <tr>{["ID", "Customer", "Route & Trip", "Seats", "Booked On", "Total", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {bookings.map(b => {
                const snap = b.routeSnapshot || {};
                return (
                  <tr key={b._id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">#{b._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{b.userId?.name || "—"}</p>
                      <p className="text-gray-500 text-xs">{b.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {snap.source ? (
                        <div>
                          <p className="text-sm font-medium whitespace-nowrap">{snap.source} → {snap.destination}</p>
                          <p className="text-gray-500 text-xs">{snap.departureDate} {snap.departureTime} · {snap.busNumber} ({snap.busType})</p>
                        </div>
                      ) : <span className="text-gray-500 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{b.seatNumbers?.join(", ")}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">Rs. {b.totalPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusPill status={b.status} /></td>
                  </tr>
                );
              })}
              {!loading && bookings.length === 0 && !error && (
                <tr><td colSpan={7} className="text-center py-14 text-gray-500">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Users Panel ───────────────────────────────────────────────────────────────
const UsersPanel = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } finally { setLoading(false); }
    })();
  }, [token]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <span className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center"><FaUsers className="text-indigo-400" /></span>
          Registered Users
        </h2>
        <p className="text-gray-400 text-sm mt-0.5 ml-10">{users.length} accounts</p>
      </div>
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border border-gray-700/60">
          <table className="w-full text-sm text-gray-300">
            <thead className="bg-gray-700/60 text-gray-400 text-[11px] uppercase tracking-wide">
              <tr>{["Name", "Email", "Role", "Joined"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-700/40">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${u.role === "admin" ? "bg-purple-900/60 text-purple-300" : "bg-gray-600 text-gray-300"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-gray-500">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Settings Panel ────────────────────────────────────────────────────────────
const SettingsPanel = ({ token, user }) => {
  const [pwForm, setPwForm] = useState({ current: "", newPass: "", confirm: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const handlePwChange = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (pwForm.newPass !== pwForm.confirm) {
      return setMsg({ type: "error", text: "New passwords do not match." });
    }
    if (pwForm.newPass.length < 6) {
      return setMsg({ type: "error", text: "Password must be at least 6 characters." });
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/settings/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPass }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Password updated successfully!" });
        setPwForm({ current: "", newPass: "", confirm: "" });
      } else {
        setMsg({ type: "error", text: data.message });
      }
    } catch { setMsg({ type: "error", text: "Server error. Please try again." }); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-bold text-white flex items-center gap-2.5 mb-6">
        <span className="w-8 h-8 bg-gray-600/40 rounded-lg flex items-center justify-center"><FaCog className="text-gray-400" /></span>
        Settings
      </h2>

      {/* Admin Info */}
      <div className="bg-gray-700/30 border border-gray-600/60 rounded-xl p-4 mb-5">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <FaUsers className="text-indigo-400 text-xs" /> Admin Account
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-[11px] uppercase tracking-wide">Name</p>
            <p className="text-white font-medium mt-0.5">{user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] uppercase tracking-wide">Email</p>
            <p className="text-white font-medium mt-0.5">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[11px] uppercase tracking-wide">Role</p>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-900/60 text-purple-300">admin</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-gray-700/30 border border-gray-600/60 rounded-xl p-4">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <FaCheck className="text-cyan-400 text-xs" /> Change Password
        </h3>
        <AlertMsg type={msg.type} text={msg.text} onClose={() => setMsg({ type: "", text: "" })} />
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <Inp label="Current Password *"       name="current"  type="password" value={pwForm.current}  onChange={handlePwChange} placeholder="Enter current password"  required />
          <Inp label="New Password *"           name="newPass"  type="password" value={pwForm.newPass}  onChange={handlePwChange} placeholder="At least 6 characters"   required />
          <Inp label="Confirm New Password *"   name="confirm"  type="password" value={pwForm.confirm}  onChange={handlePwChange} placeholder="Repeat new password"      required />
          <div className="pt-1">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors">
              <FaSave /> {saving ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Admin Shell ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",  label: "Dashboard",        icon: <FaTachometerAlt /> },
  { id: "fleet",     label: "Fleet Management",  icon: <FaBus /> },
  { id: "schedules", label: "Trip Scheduling",   icon: <FaCalendarAlt /> },
  { id: "bookings",  label: "Booking Overview",  icon: <FaTicketAlt /> },
  { id: "users",     label: "Users",             icon: <FaUsers /> },
  { id: "settings",  label: "Settings",          icon: <FaCog /> },
];

const PANEL_LABELS = { overview: "Dashboard", fleet: "Fleet", schedules: "Schedules", bookings: "Bookings", users: "Users", settings: "Settings" };

const AdminDashboard = () => {
  const [activePanel, setActivePanel] = useState("overview");
  const { token, user, logout } = useAuth();

  const renderPanel = () => {
    switch (activePanel) {
      case "overview":  return <OverviewPanel token={token} setActivePanel={setActivePanel} />;
      case "fleet":     return <FleetPanel token={token} />;
      case "schedules": return <SchedulingPanel token={token} />;
      case "bookings":  return <AllBookingsPanel token={token} />;
      case "users":     return <UsersPanel token={token} />;
      case "settings":  return <SettingsPanel token={token} user={user} />;
      default:          return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 pt-14">
      {/* ── Sidebar ── */}
      <aside className="w-14 md:w-60 bg-gray-900 border-r border-gray-700/60 flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="hidden md:flex items-center gap-3 px-4 py-4 border-b border-gray-700/60">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/40">
            <FaBus className="text-white text-sm" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">QBus Admin</p>
            <p className="text-gray-500 text-[10px]">Control Panel v2</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 mt-2 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <SidebarItem key={item.id} {...item} active={activePanel === item.id} onClick={setActivePanel} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-700/60 space-y-1">
          <div className="hidden md:block px-3 py-1.5 rounded-xl bg-gray-800/60">
            <p className="text-xs text-white font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email || ""}</p>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-red-900/30 hover:text-red-400 text-sm transition-colors">
            <FaSignOutAlt className="flex-shrink-0 text-base" />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-800">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700/60 px-6 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">QBus Admin</span>
            <span className="text-gray-600">/</span>
            <span className="text-white font-semibold">{PANEL_LABELS[activePanel]}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-500">
              {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </span>
            <div className="flex items-center gap-2 bg-gray-700/60 border border-gray-600/60 rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-xs text-gray-300 font-medium">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* Panel */}
        <div className="flex-1 overflow-y-auto">
          {renderPanel()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
