import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBus, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const InputField = ({ icon: Icon, type, name, placeholder, value, onChange, extra }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      <input
        type={isPassword ? (show ? "text" : "password") : type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className={`w-full pl-11 pr-${isPassword ? "11" : "4"} py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400 ${extra}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
        </button>
      )}
    </div>
  );
};

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";
  const pendingSchedule = location.state?.pendingSchedule;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setError("");
    setRegisterSuccess(false);
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, confirmPassword } = formData;

    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const endpoint = isLogin
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/register`;

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Something went wrong. Please try again.");
      } else if (!isLogin) {
        setRegisterSuccess(true);
        switchTab(true);
      } else {
        login(data.token, data.user || null);
        const role = data.user?.role;
        if (role === "admin") {
          navigate("/admin", { replace: true });
        } else if (pendingSchedule) {
          navigate("/seat", { state: { Schedule: pendingSchedule }, replace: true });
        } else {
          navigate(redirectTo === "/" ? "/dashboard" : redirectTo, { replace: true });
        }
      }
    } catch {
      setError("Cannot connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ────────────────────── */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex-col items-center justify-center px-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
              <FaBus className="text-2xl text-gray-900" />
            </div>
            <span className="text-white text-4xl font-extrabold tracking-tight">QBus</span>
          </div>
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-4 leading-snug">
            Your journey starts<br />with a single click
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Search, book, and manage bus tickets across Sri Lanka with ease.
          </p>

          <div className="mt-10 space-y-3 text-left">
            {[
              "100+ routes across Sri Lanka",
              "Instant digital tickets",
              "Secure Stripe payments in LKR",
              "Real-time seat selection",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FaBus className="text-white text-lg" />
            </div>
            <span className="text-gray-900 text-2xl font-extrabold">QBus</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            <button
              type="button"
              onClick={() => switchTab(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isLogin ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                !isLogin ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-gray-400 text-sm mb-7">
            {isLogin ? "Sign in to access your bookings." : "Join thousands of happy travellers."}
          </p>

          {registerSuccess && (
            <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
              Account created! Please sign in.
            </div>
          )}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <InputField icon={FaUser} type="text" name="name" placeholder="Full name" value={formData.name} onChange={handleChange} />
            )}
            <InputField icon={FaEnvelope} type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} />
            <InputField icon={FaLock} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            {!isLogin && (
              <InputField icon={FaLock} type="password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 text-sm mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing&hellip;</>
              ) : (
                <>{isLogin ? "Sign In" : "Create Account"}<FaArrowRight className="text-xs" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            {isLogin ? (
              <>Don&rsquo;t have an account?{" "}
                <button onClick={() => switchTab(false)} className="text-blue-600 font-medium hover:underline">Register free</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => switchTab(true)} className="text-blue-600 font-medium hover:underline">Sign in</button>
              </>
            )}
          </p>

          <p className="text-center text-sm text-gray-400 mt-4">
            <Link to="/" className="hover:text-blue-600 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
