/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineDoubleArrow } from "react-icons/md";
import busImg from "../assets/images/bus1.jpg";
import Navbar from "../Components/Navbar";

const SearchResultsPage = ({ dark, setDark }) => {
  const [bus, setBuses] = useState([]);
  const [availableSeatsCount, setAvailableSeatsCount] = useState(0);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Extract search data from location state
  const { source, destination, date } = location.state || {};
  console.log("Source:", source);

  // Function to update bus seats if not populated
  const updateBusSeats = async (busId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/buses/updateSeats/${busId}`, { method: 'PUT' });

      if (response.ok) {
        console.log('Bus seats updated successfully');
      } else {
        const errorData = await response.json();
        console.log('Error updating seats:', errorData.message);
      }
    } catch (error) {
      console.error('Error updating bus seats:', error);
    }
  };

  // Function to calculate available seats
  const availableSeats = (bus) => {
    if (bus && bus.seats) {
      return bus.seats.filter(seat => seat.isBooked === false).length;
    }
    return 0;
  };

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        // Ensure source, destination, and date are valid before making the request
        if (!source || !destination || !date) {
          setError('Missing search criteria');
          return;
        }

        // Construct URL with query parameters
        const response = await fetch(
          `http://localhost:5000/api/buses/getBuses?source=${source}&destination=${destination}&date=${date}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch buses');
        }

        const data = await response.json();
        console.log('API response:', data); // Check the full response

        if (data.success) {
          setBuses(data.buses);
          data.buses.forEach((bus) => {
            const availableSeatCount = availableSeats(bus);
            setAvailableSeatsCount(availableSeatCount);
            if (bus.seats.length === 0) {
              updateBusSeats(bus.id);
            }
          });
        } else {
          setError(data.message || 'Failed to fetch buses');
        }
      } catch (err) {
        setError('Error fetching buses. Please try again.');
        console.error(err);
      }
    };

    fetchBuses();
  }, [source, destination, date]);

  const handleBook = (BusID) => {
    console.log("selected bus id : ", BusID);
    const selectedBus = bus.filter((bus) => bus.id === BusID);
    if (selectedBus) {
      console.log("bus : ", selectedBus);
      navigate("/seat", { state: { Bus: selectedBus } });
    }
  };

  // Travel duration calculation
  const calculateDuration = (departTime, arriveTime) => {
    // Parse the time strings into Date objects
    const departDate = new Date(`1970-01-01 ${departTime}`);
    const arriveDate = new Date(`1970-01-01 ${arriveTime}`);

    // Calculate the difference in milliseconds
    const diffMs = arriveDate - departDate;

    // Handle crossing midnight
    const diffMinutes =
      diffMs < 0
        ? 24 * 60 + diffMs / (1000 * 60) // Add 24 hours in minutes
        : diffMs / (1000 * 60);

    // Convert minutes to hours and minutes
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.round(diffMinutes % 60);

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`min-h-screen flex flex-col theme`}>
      <main className="flex-grow container mx-auto mt-4 py-2 px-4 border-2 rounded-lg justify-center form">
        <h1 className="text-xl md:text-2xl lg:text-3xl flex font-bold mb-8 justify-center">
          Search Results
        </h1>
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6">
            {bus.map((bus) => (
              <div
                key={bus.id}
                className="box-theme duration-300 transform hover:scale-105 rounded-lg border-b-2 border-gray-400 shadow-md"
              >
                <div className="flex-column rounded-lg">
                  <div className="flex rounded-t-lg bg-yellow-600 p-3 text-gray-100 justify-between items-center">
                    <span className="text-sm md:text-base font-medium">
                      Stops @ {bus.source}
                    </span>
                    <span className="text-sm md:text-base font-medium">
                      Route @ {bus.id}
                    </span>
                  </div>
                  <div className="px-4 py-2 flex grid lg:grid-cols-6 md:grid-cols-5 grid-cols-4 flex-col md:flex-row mx-auto">
                    {/* Departure Section */}
                    <div className="">
                      <ul className="flex flex-col">
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Departure
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2 uppercase">
                          {bus.source}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Date
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2">
                          {bus.Depart_date}
                        </li>
                        <li className="lg:text-xs md:text-xs text-xxs list-heading">
                          Time
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2 ">
                          {bus.Depart_time}
                        </li>
                      </ul>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex flex-col items-start ml-3 lg:ml-0 mt-8 justify-center">
                      <div className="flex items-center rounded-xl">
                        <MdOutlineDoubleArrow className="text-red-700 lg:text-7xl md:text-5xl text-4xl flex items-center" />
                      </div>
                      {/* Travel duration */}
                      <div className="flex items-center row -ml-3 mt-9 ">
                        <span className="-ml-2 lg:ml-0 text-xxs lg:text-xs">
                          Duration:{" "}
                          {calculateDuration(bus.Depart_time, bus.Arrive_time)}
                        </span>
                      </div>
                    </div>

                    {/* Arrival Section */}
                    <div className="lg:-ml-8">
                      <ul className="flex flex-col">
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Arrival
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2 uppercase">
                          {bus.destination}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Date
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2 ">
                          {bus.Arrive_date}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Time
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2 ">
                          {bus.Arrive_time}
                        </li>
                      </ul>
                    </div>
                    <div className="hidden lg:block md:block lg:-ml-8">
                      <ul className="flex flex-col">
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Bus Type
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2 ">
                          {bus.type}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Booking Closing Date
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2 ">
                          {bus.closing_Date}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Booking Closing Time
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2 ">
                          {bus.Closing_time}
                        </li>
                      </ul>
                    </div>
                    <div className="w-full ms-2">
                      <ul className="flex flex-col ">
                        <li className="lg:text-2xl md:text-xl text-sm font-bold py-2 uppercase">
                          <span className="lg:text-sm md:text-xs text-xxs">
                            Rs.{" "}
                          </span>
                          {bus.price}.00
                        </li>
                      </ul>
                      <div className="flex pb-2 items-center ">
                        <div className="flex flex-col justify-start">
                          <span className="lg:text-sm md:text-xs text-xxs list-heading lg:hidden md:hidden flex">
                            Available Seats
                          </span>
                          <span className="lg:hidden md:hidden flex">
                            {availableSeats(bus)}
                          </span>
                          <span className="flex lg:text-base md:text-sm text-xs list-heading lg:block italic md:block hidden">
                            Available
                          </span>
                          <span className="flex lg:text-base md:text-sm text-xs list-heading italic lg:block md:block hidden">
                            Seats
                          </span>

                        </div>
                        <span className="lg:text-3xl md:text-2xl flex lg:block md:block hidden border-l-2 ml-4 font-bold px-4">
                          {availableSeats(bus)}
                        </span>
                      </div>

                      <div className=" lg:mr-8">
                        <div>
                          <button
                            onClick={() => handleBook(bus.id)}
                            className=" w-full lg:px-4 px-2 py-2 text-white flex justify-center rounded-lg hover:bg-blue-700 text-xxs md:text-base"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <img src={busImg} alt="" className="h-full hidden lg:block border-2 border-gray-500 rounded" />

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResultsPage;
