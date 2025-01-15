import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdOutlineDoubleArrow } from "react-icons/md";
import busImg from "../assets/images/bus1.jpg";
import Navbar from "../Components/Navbar";

const SearchResultsPage = ({ dark, setDark }) => {
  const [bus, setBuses] = useState([]);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Extract search data from location state
  const { source, destination, date } = location.state || {};
  console.log("Source:", source)

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await fetch(buses, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ source, destination, date }),
        });

        if (response.ok) {
          const data = await response.json();
          setBuses(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message);
        }
      } catch (err) {
        setError("Error fetching buses. Please try again.");
      }
    };

    if (source && destination && date) {
      const data = buses.filter(
        (bus) => bus.source === source && bus.destination === destination && bus.Depart_date === date
      );
      if (data.length > 0) {
        setBuses(data);
      } else {
        console.log("buses not found")
      }
      // fetchBuses();
    }
  }, [source, destination, date]);

 const handleBook = (BusID)=>{
  console.log("selected bus id : ", BusID);
   const selectedBus = bus.filter(
    (bus) => bus.id === BusID
   );
      if(selectedBus){
        console.log("bus : ",selectedBus);
        navigate("/seat", {state: {Bus: selectedBus}});
      }
 }

   // travel duration calculation
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


  const buses = [
    {
      id: 1,
      source: "Colombo",
      destination: "Kandy",
      Depart_date: "2025-01-15",
      Arrive_date: "2025-01-15",
      closing_Date: "2025-01-15",
      Closing_time: "07:00 AM",
      Depart_time: "08:00 AM",
      Arrive_time: "11:00 AM",
      price: 1500,
      type: "Normal",
    },
    {
      id: 2,
      source: "Galle",
      destination: "Colombo",
      Depart_date: "2025-01-16",
      Arrive_date: "2025-01-16",
      closing_Date: "2025-01-16",
      Closing_time: "06:30 AM",
      Depart_time: "07:30 AM",
      Arrive_time: "09:00 AM",
      price: 1200,
      type: "Luxury",
    },
    {
      id: 3,
      source: "Jaffna",
      destination: "Colombo",
      Depart_date: "2025-01-17",
      Arrive_date: "2025-01-17",
      closing_Date: "2025-01-16",
      Closing_time: "06:00 PM",
      Depart_time: "07:00 PM",
      Arrive_time: "05:00 AM",
      price: 3000,
      type: "Semi-Luxury",
    },
    {
      id: 4,
      source: "Colombo",
      destination: "Nuwara Eliya",
      Depart_date: "2025-01-18",
      Arrive_date: "2025-01-18",
      closing_Date: "2025-01-18",
      Closing_time: "05:00 AM",
      Depart_time: "06:00 AM",
      Arrive_time: "10:00 AM",
      price: 2000,
      type: "Normal",
    },
    {
      id: 5,
      source: "Matara",
      destination: "Colombo",
      Depart_date: "2025-01-19",
      Arrive_date: "2025-01-19",
      closing_Date: "2025-01-19",
      Closing_time: "12:30 PM",
      Depart_time: "01:30 PM",
      Arrive_time: "04:30 PM",
      price: 1000,
      type: "Luxury",
    },
    {
      id: 6,
      source: "Colombo",
      destination: "Anuradhapura",
      Depart_date: "2025-01-20",
      Arrive_date: "2025-01-20",
      closing_Date: "2025-01-20",
      Closing_time: "08:00 AM",
      Depart_time: "09:00 AM",
      Arrive_time: "01:00 PM",
      price: 1800,
      type: "Normal",
    },
    {
      id: 7,
      source: "Trincomalee",
      destination: "Colombo",
      Depart_date: "2025-01-21",
      Arrive_date: "2025-01-21",
      closing_Date: "2025-01-20",
      Closing_time: "10:00 PM",
      Depart_time: "11:00 PM",
      Arrive_time: "05:00 AM",
      price: 2500,
      type: "Luxury",
    },
    {
      id: 8,
      source: "Colombo",
      destination: "Batticaloa",
      Depart_date: "2025-01-22",
      Arrive_date: "2025-01-22",
      closing_Date: "2025-01-22",
      Closing_time: "09:00 AM",
      Depart_time: "10:00 AM",
      Arrive_time: "05:00 PM",
      price: 2200,
      type: "Semi-Luxury",
    },
    {
      id: 9,
      source: "Colombo",
      destination: "Hambantota",
      Depart_date: "2025-01-23",
      Arrive_date: "2025-01-23",
      closing_Date: "2025-01-23",
      Closing_time: "07:00 AM",
      Depart_time: "08:00 AM",
      Arrive_time: "12:00 PM",
      price: 1300,
      type: "Normal",
    },
    {
      id: 10,
      source: "Kandy",
      destination: "Colombo",
      Depart_date: "2025-01-24",
      Arrive_date: "2025-01-24",
      closing_Date: "2025-01-24",
      Closing_time: "02:30 PM",
      Depart_time: "03:30 PM",
      Arrive_time: "06:30 PM",
      price: 1400,
      type: "Luxury",
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col theme  `}>
      <main className="flex-grow container mx-auto mt-4 py-2 px-4 border-2 rounded-lg justify-center form ">
        <h1 className="text-xl md:text-2xl lg:text-3xl flex font-bold mb-8 justify-center">
          Search Results
        </h1>
        {/* {2<1 ? (
          <p className="text-red-500">{error}</p>
        ) : buses.length < 0 ? ( */}
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6">
            {bus.map((bus) => (
              <div
                key={bus.id}
                className="box-theme duration-300 transform hover:scale-105 rounded-lg border-b-2 border-gray-400 shadow-md "
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
                  <div className=" px-4 py-2 flex grid lg:grid-cols-6 md:grid-cols-5 grid-cols-4 flex-col md:flex-row mx-auto">
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
                     <div className="flex flex-col items-start ml-3 lg:ml-0  mt-8  justify-center">
                                        <div className="flex items-center rounded-xl">
                                
                                          <MdOutlineDoubleArrow className="text-red-700 lg:text-7xl md:text-5xl text-4xl flex items-center"/>
                                        </div>
                                        {/* travel duration */}
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
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2   uppercase">
                          {bus.destination}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Date
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2  ">
                          {bus.Arrive_date}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Time
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold  pb-2 ">
                          {bus.Arrive_time}
                        </li>
                      </ul>
                    </div>
                    <div className="hidden lg:block md:block lg:-ml-8">
                      <ul className="flex flex-col">
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Bus Type
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2  ">
                          {bus.type}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Booking Closing Date
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2  ">
                          {bus.closing_Date}
                        </li>
                        <li className="lg:text-sm md:text-xs text-xxs list-heading">
                          Booking Closing Time
                        </li>
                        <li className="lg:text-base md:text-sm text-xs font-bold pb-2  ">
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
                      <div className="flex  pb-2  items-center ">
                      <div className="flex flex-col justify-start">
                        <span className="lg:text-sm md:text-xs text-xxs list-heading lg:hidden md:hidden flex">
                          Available Seats
                        </span>
                        <span className="lg:hidden md:hidden flex"> 45</span>
                        <span className="flex lg:text-base md:text-sm text-xs list-heading lg:block italic md:block hidden">
                          Available
                        </span>
                        <span className="flex lg:text-base md:text-sm text-xs  list-heading italic lg:block md:block hidden">
                          Seats
                        </span>
                      </div>

                      <span className="lg:text-3xl md:text-2xl flex lg:block md:block hidden border-l-2 ml-4 font-bold px-4">
                        45
                      </span>
                    </div>
                      <div className=" lg:mr-8">
                        <div >
                          <button onClick={() => handleBook(bus.id)} className=" w-full lg:px-4 px-2 py-2 text-white flex  justify-center rounded-lg hover:bg-blue-700 text-xxs md:text-base" >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <img src={busImg} alt="" className="h-full hidden lg:block border-2 border-gray-500 rounded" />

                  </div>
                </div>
              </div>
              // </div>
            ))}
          </div>
        </div>

        {/* ) : (
          <p className="list-heading">No buses found.</p>
        )} */}
      </main>
    </div>
  );
};

export default SearchResultsPage;
