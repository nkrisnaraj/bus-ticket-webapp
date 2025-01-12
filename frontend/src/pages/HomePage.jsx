import React, { useEffect, useState } from "react";
import "../index.css";
import "./HomePage.css";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import BookingPage from "./BookingPage";

const HomePage = ({ dark, setDark }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  // Handle form submission (currently not implemented)
  const handleSubmit = () => {};

  // navbar scroll effect ( navbar bg color change on scroll)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      console.log("scrollY:", scrollPosition); // Debugging the scroll position
      setIsScrolled(scrollPosition > 10); // Update isScrolled when scroll exceeds 10px
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); 
  return (
    // Home Page
    <div className={`min-h-screen sticky flex flex-col`}>
      <div>
        {/* Navbar component */}
        <Navbar
          dark={dark}
          setDark={setDark}
          isScrolled={isScrolled}
          setIsScrolled={setIsScrolled}
        />
        {/* Main content */}
        <main className="flex-grow">
          <div className="text-4xl text-white text-center p-8 ">
            Welcome to the QBus Booking System
          </div>
          <div className="w-full rounded-lg">
            <section className="py-8">
              {/* search buses section */}
              <div className="container mx-auto">
                <div className=" rounded-lg shadow-md form">
                  <h2 className="text-3xl font-bold text-center mb-6 text-white">
                    Find Your Bus
                  </h2>
                  {/* search bus form */}
                  <form
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 "
                    onSubmit={handleSubmit}
                  >
                    <div>
                      <label
                        htmlFor="source"
                        className="block text-white font-medium mb-1"
                      >
                        Source
                      </label>
                      <input
                        type="text"
                        id="source"
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="Enter source city"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="destination"
                        className="block text-gray-100 font-medium mb-1"
                      >
                        Destination
                      </label>
                      <input
                        type="text"
                        id="destination"
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="Enter destination city"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-gray-100 font-medium mb-1"
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                      >
                        Search Buses
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>

            {/* Popular Routes */}
            <section className="">
              <div className="container mx-auto px-4 form">
                <h2 className="text-3xl font-bold text-center text-gray-100 mb-6">
                  Popular Bus Routes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    "Colombo to Jaffna",
                    "Kandy to Galle",
                    "Anuradhapura to Nuwara Eliya",
                    "Batticaloa to Trincomalee",
                  ].map((route, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-lg text-center"
                    >
                      <h3 className="font-medium text-gray-700">{route}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
