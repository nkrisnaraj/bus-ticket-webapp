import { useEffect, useState } from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import SearchResultsPage from "./pages/SearchResultsPage";
import Login from "./pages/Login";
import BusSeats from "./pages/BusSeats";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import BookingSuccess from "./pages/BookingSuccess";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import AdminRoute from "./Components/AdminRoute";

// Hides Navbar & Footer on full-screen routes like /admin
const Shell = ({ dark, setDark, isScrolled, children }) => {
  const { pathname } = useLocation();
  const hideChrome = pathname.startsWith("/admin");
  return (
    <>
      {!hideChrome && <Navbar dark={dark} setDark={setDark} isScrolled={isScrolled} />}
      <main className="flex-grow">{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
};


export default function App() {
  const [dark, setDark] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10); // Update isScrolled when scroll exceeds 10px
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  useEffect(() => {
    // Function to set the theme based on localStorage or system preference
    const setTheme = () => {
      const theme = localStorage.getItem('theme'); 

      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setDark(true);
      } else {
        setDark(false)
      }
    };

    setTheme(); // Set the theme on component mount
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);
    // Cleanup the event listener on unmount
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', setTheme);
    };
  }, []);

  return (
    <AuthProvider>
      <div className={`min-h-screen flex flex-col duration-500 transform ${dark ? "dark" : "light"}`}>
        <Router>
          <Shell dark={dark} setDark={setDark} isScrolled={isScrolled}>
            <Routes>
              <Route path="/" element={<HomePage dark={dark} setDark={setDark} />} />
              <Route path="/search-results" element={<SearchResultsPage />} />
              <Route
                path="/seat"
                element={
                  <ProtectedRoute>
                    <BusSeats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/booking-success"
                element={
                  <ProtectedRoute>
                    <BookingSuccess />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Shell>
        </Router>
      </div>
    </AuthProvider>
  );
}

