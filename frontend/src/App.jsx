import React, { useEffect } from "react";
import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { useState } from "react";
import SearchResultsPage from "./pages/SearchResultsPage";
import SeatMap from "./pages/SeatMap";
import BusSeat from "./pages/BusSeat";
import BusSeatEx from "./pages/BusSeats";


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
    <div className={`min-h-screen flex flex-col duration-500 transform ${dark ? "dark" : "light"}`}>
      <Router>
        <Navbar
          dark={dark}
          setDark={setDark}
          isScrolled={isScrolled}
          setIsScrolled={setIsScrolled}
        />
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={<HomePage dark={dark} setDark={setDark} />}
            />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route path="/seat" element={<BusSeatEx />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

