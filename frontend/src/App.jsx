import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { useState } from "react";

export default function App() {
  const [dark, setDark] = useState(false);
  
  
  return (
    <div className={`min-h-screen ${dark ? "dark" : "light"}`}>
      <Router>
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  dark={dark}
                  setDark={setDark}
                />
              }
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}
