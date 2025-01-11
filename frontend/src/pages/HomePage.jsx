import React from "react";
import "../index.css"
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Hero Section */}
      <header className="bg-blue-600 text-white py-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">Welcome to Bus Ticket Booking</h1>
          <p className="mt-2 text-lg">
            Book tickets for your favorite destinations quickly and easily!
          </p>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white py-12 shadow">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">
              Find Your Bus
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Source */}
              <div>
                <label
                  htmlFor="source"
                  className="block text-gray-700 font-medium mb-1"
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

              {/* Destination */}
              <div>
                <label
                  htmlFor="destination"
                  className="block text-gray-700 font-medium mb-1"
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

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-gray-700 font-medium mb-1"
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Bus Ticket Booking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
