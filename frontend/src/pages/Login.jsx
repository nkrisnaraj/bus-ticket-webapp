/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register
    const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { name, email, password, confirmPassword } = formData;
  
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill all required fields");
      return;
    }
  
    const endpoint = isLogin
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/register";
  
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }), // Ensure this sends all required fields
      });
  
      const data = await response.json();
      if (!data.success) {
        console.log('data',data)
        setError(data.message || "Something went wrong");
      } else {
        alert(isLogin ? "Login Successful" : "Registration Successful");

      }
    } catch (err) {
      setError("Error connecting to the server");
    }
  };
    useEffect(() => {
      if (showError) {
        const timer = setTimeout(() => {
          setShowError(false);
        }, 3000);
  
        return () => clearTimeout(timer);
      }
    }, [showError]);

  return (
    <div className="flex items-center justify-center min-h-screen backdrop-blur">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md form">
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        {error && <div className="p-3 text-red-500 bg-red-100 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block mb-1 text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block mb-1 text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin) && setError(true)}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;
