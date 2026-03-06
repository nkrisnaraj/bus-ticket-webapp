/* eslint-disable react/prop-types */
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/images/QBus-logo.png";
import { useEffect, useRef, useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { FaMoon, FaSun, FaTimes, FaUser, FaTicketAlt, FaTachometerAlt, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ dark, setDark, isScrolled }) {
  const [click, setClick] = useState(false);
  const navRef = useRef(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(" ")[0] || "";
  const isAdmin = user?.role === "admin";

  const handleClick = () => setClick((prev) => !prev);
  const close = () => setClick(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/login");
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setClick(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleDark = () => setDark((prev) => !prev);

  // ── Shared link style ──────────────────────────────────────────────────────
  const linkCls = ({ isActive }) =>
    `shadow cursor-pointer hover:text-blue-900 transition border-b-2 hover:bg-gray-300 px-3 py-1 rounded-xl flex gap-2 items-center ${
      isActive ? "border-blue-600 bg-blue-100 text-blue-700" : `border-gray-900 hover:border-blue-900 ${dark ? "text-white" : "text-black"}`
    }`;
  const mobileLinkCls = ({ isActive }) =>
    `cursor-pointer my-2 py-2 hover:text-blue-900 transition border-b-2 hover:bg-gray-300 rounded-xl border-gray-900 hover:border-blue-900 flex items-center justify-center gap-2${
      isActive ? " border-blue-500 text-blue-400" : ""
    }`;

  // ── Desktop nav links by role ──────────────────────────────────────────────
  const desktopLinks = (
    <ul className="flex gap-3 mr-8 items-center">
      <NavLink to="/" end className={linkCls}>
        Home
      </NavLink>

      {/* Guest & User: Search Buses */}
      {!isAdmin && (
        <NavLink to="/search-results" className={linkCls}>
          <FaSearch className="text-xs" /><span>Search Buses</span>
        </NavLink>
      )}

      {/* Regular user only */}
      {isAuthenticated && !isAdmin && (
        <NavLink to="/dashboard" className={linkCls}>
          <FaTicketAlt className="text-xs" /><span>My Bookings</span>
        </NavLink>
      )}

      {/* Admin panel link */}
      {isAdmin && (
        <NavLink to="/admin"
          className={() => "shadow cursor-pointer transition border-b-2 px-3 py-1 rounded-xl flex gap-2 items-center bg-blue-600 text-white border-blue-700 hover:bg-blue-700"}
        >
          <FaTachometerAlt className="text-xs" /><span>Admin Panel</span>
        </NavLink>
      )}

      {/* Dark mode toggle */}
      <li>
        <button
          className={`cursor-pointer hover:text-blue-900 transition flex items-center gap-1 hover:bg-gray-300 px-2 py-1 rounded-xl border-gray-900 hover:border-blue-900 ${dark ? "text-white" : "text-black"}`}
          onClick={handleDark}
        >
          {dark ? <><FaMoon /><span className="text-sm">Light</span></> : <><FaSun /><span className="text-sm">Dark</span></>}
        </button>
      </li>

      {/* Auth buttons */}
      {!isAuthenticated ? (
        <NavLink to="/login" className={linkCls}>
          <FaUser className="text-xs" /><span>Login</span>
        </NavLink>
      ) : (
        <li className="flex items-center gap-2">
          {firstName && (
            <span className={`text-sm font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>
              Hi, <span className="font-semibold">{firstName}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition cursor-pointer"
          >
            <FaSignOutAlt /><span>Logout</span>
          </button>
        </li>
      )}
    </ul>
  );

  // ── Mobile nav links by role ───────────────────────────────────────────────
  const mobileLinks = (
    <div className="lg:hidden md:hidden absolute block top-14 w-full left-0 right-0 bg-gray-800 transition z-50">
      <ul className="text-center text-lg px-10 py-2">
        <NavLink to="/" end className={mobileLinkCls} onClick={close}>Home</NavLink>

        {!isAdmin && (
          <NavLink to="/search-results" className={mobileLinkCls} onClick={close}>
            <FaSearch /><span>Search Buses</span>
          </NavLink>
        )}

        {isAuthenticated && !isAdmin && (
          <NavLink to="/dashboard" className={mobileLinkCls} onClick={close}>
            <FaTicketAlt /><span>My Bookings</span>
          </NavLink>
        )}

        {isAdmin && (
          <NavLink to="/admin" className={() => `${mobileLinkCls({ isActive: true })} text-blue-400 font-semibold`} onClick={close}>
            <FaTachometerAlt /><span>Admin Panel</span>
          </NavLink>
        )}

        {!isAuthenticated ? (
          <NavLink to="/login" className={mobileLinkCls} onClick={close}>
            <FaUser /><span>Login / Register</span>
          </NavLink>
        ) : (
          <li className={mobileLinkCls({ isActive: false })}>
            {firstName && (
              <span className="text-gray-300 mr-2 text-sm">Hi, <strong>{firstName}</strong></span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl"
            >
              <FaSignOutAlt /><span>Logout</span>
            </button>
          </li>
        )}

        {/* Dark mode toggle */}
        <li className={mobileLinkCls({ isActive: false })} onClick={handleDark}>
          <button className="flex items-center gap-2 text-gray-200 hover:text-white">
            {dark ? <><FaMoon /><span>Switch to Light</span></> : <><FaSun /><span>Switch to Dark</span></>}
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 left-0 w-full z-50 ${
        isScrolled
          ? dark ? "bg-gray-900 shadow-lg border-b-2 border-gray-600" : "bg-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex justify-between text-white lg:py-4 py-3 lg:ps-16 ps-8 px-4">
        {/* Logo */}
        <div className="flex flex-1 items-center">
          <NavLink to="/">
            <img alt="QBus Logo" src={logo} className="h-8 md:h-12 lg:h-16 w-auto rounded-lg" />
          </NavLink>
        </div>

        {/* Desktop nav */}
        <div className={`lg:flex md:flex lg:flex-1 items-center justify-end hidden ${dark ? "text-white" : "text-black"}`}>
          {desktopLinks}
        </div>

        {/* Mobile dropdown */}
        <div>{click && mobileLinks}</div>

        {/* Hamburger */}
        <button
          className="block lg:hidden md:hidden bg-gray-500 text-gray-900 py-1 px-2 rounded-lg"
          onClick={handleClick}
        >
          {click ? <FaTimes /> : <CiMenuFries className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}


