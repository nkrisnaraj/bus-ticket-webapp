import { useEffect, useState } from "react";
import { GiSteeringWheel } from "react-icons/gi";
import chair from "../assets/images/seat.png";
import arrow from "../assets/images/arrow.png";
import busImg from "../assets/images/bus1.jpg";
import { useLocation } from "react-router-dom";
import { MdOutlineDoubleArrow } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const BusSeats = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showError, setShowError] = useState(false);
  const [device, setDevice] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState({ type: "", text: "" });
  const { token } = useAuth();
  const location = useLocation();

  const { Schedule: schedule } = location.state || {};

  const isLgOrMd = device === "lg" || device === "md";


  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setDevice("lg"); // Large screens
      } else if (width >= 768) {
        setDevice("md"); // Medium screens
      } else {
        setDevice("sm"); // Small screens
      }
    };

    updateDevice(); // Run on component mount
    window.addEventListener("resize", updateDevice);

    return () => window.removeEventListener("resize", updateDevice); // Cleanup on unmount
  }, []);

  const bookedSeatNumbers = schedule?.bookedSeats?.map((s) => s.seatNumber) || [];
  const busSeatData = [];
  for (let col = 1; col <= 12; col++) {
    for (let row = 1; row <= 5; row++) {
      if ((row === 3 && col !== 12) || (col === 11 && row > 2)) continue;
      const seatId = busSeatData.length + 1;
      const seatNumber = String(seatId); // matches the number shown on the seat button
      busSeatData.push({
        id: seatId,
        seatNumber,
        status: bookedSeatNumbers.includes(seatNumber) ? "booked" : "available",
        row,
        col,
      });
    }
  }

  const handleSeatClick = (seatId) => {
    const selectedSeats = busSeatData.find((seat) => seat.id === seatId);
    if (selectedSeats.status === "booked") {
      return;
    }
    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatId)) {
        return prevSelectedSeats.filter((seat) => seat !== seatId);
      } else {
        if (prevSelectedSeats.length >= 6) {
          setShowError(true);
          return prevSelectedSeats;
        } else {
          return [...prevSelectedSeats, seatId];
        }
      }
    });
  };
  // console.log("selected seats:", selectedSeats)
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleCheckout = async () => {
    if (selectedSeats.length === 0 || !schedule?._id) return;

    const seatNumbersToBook = selectedSeats
      .map((id) => busSeatData.find((s) => s.id === id)?.seatNumber)
      .filter(Boolean);

    setBookingLoading(true);
    setBookingMsg({ type: "", text: "" });

    try {
      const response = await fetch(`${API_URL}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheduleId: schedule._id, seatNumbers: seatNumbersToBook }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to Stripe-hosted checkout page
        window.location.href = data.url;
      } else {
        setBookingMsg({ type: "error", text: data.message || "Failed to initiate payment. Please try again." });
      }
    } catch {
      setBookingMsg({ type: "error", text: "Error connecting to server." });
    } finally {
      setBookingLoading(false);
    }
  };

  //set seat status
  const getSeatName = (seat) => {
    if (seat.status === "booked") {
      return "bg-red-600 cursor-not-allowed";
    }
    if (selectedSeats.includes(seat.id)) {
      return "bg-green-600 cursor-pointer";
    }
    return "bg-neutral-100 cursor-pointer";
  };

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

  return (

    <div className="backdrop-blur-lg backdrop-brightness-90 min-h-screen pt-16 text-color">
      {/* selected schedule details */}
      {schedule && (
      <div className="container mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6">
            <div
              className="box-theme duration-300 transform hover:scale-105 rounded-lg border-b-2 border-gray-400 shadow-md"
            >
              <div className="flex-column rounded-lg">
                {/* header section */}
                <div className="flex rounded-t-lg bg-yellow-600 p-3 text-gray-100 justify-between items-center">
                  <span className="text-sm md:text-base font-medium">
                    {schedule.source} → {schedule.destination}
                  </span>
                  <span className="text-sm md:text-base font-medium">
                    {schedule.busId?.busNumber || ""}
                  </span>
                </div>
                <div className="px-4 py-2 flex grid lg:grid-cols-6 md:grid-cols-5 grid-cols-4 flex-col md:flex-row">
                  {/* Departure Section */}
                  <div className="">
                    <ul className="flex flex-col">
                      <li className="lg:text-sm md:text-xs text-xxs list-heading">
                        Departure
                      </li>
                      <li className="lg:text-base md:text-sm text-xs font-bold pb-2 uppercase">
                        {schedule.source}
                      </li>
                      <li className="lg:text-sm md:text-xs text-xxs list-heading">
                        Date
                      </li>
                      <li className="lg:text-base md:text-sm text-xs font-bold pb-2">
                        {schedule.departureDate}
                      </li>
                      <li className="lg:text-xs md:text-xs text-xxs list-heading">
                        Time
                      </li>
                      <li className="lg:text-base md:text-sm text-xs font-bold pb-2">
                        {schedule.departureTime}
                      </li>
                    </ul>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex flex-col items-start mt-8 justify-center">
                    <div className="flex items-center rounded-xl">
                      <MdOutlineDoubleArrow className="text-red-800 text-6xl flex items-center"/>
                    </div>
                    {/* travel duration */}
                    <div className="flex items-center row -ml-3 mt-9">
                      <span className="text-xs">
                        Duration:{" "}
                        {calculateDuration(schedule.departureTime, schedule.arrivalTime)}
                      </span>
                    </div>
                  </div>

                  {/* Arrival Section */}
                  <div className="">
                    <ul className="flex flex-col">
                      <li className="lg:text-sm md:text-xs text-xxs list-heading">
                        Arrival
                      </li>
                      <li className="lg:text-base md:text-sm text-xs font-bold pb-2 uppercase">
                        {schedule.destination}
                      </li>
                      <li className="lg:text-sm md:text-xs text-xxs list-heading">
                        Date
                      </li>
                      <li className="lg:text-base md:text-sm text-xs font-bold pb-2">
                        {schedule.departureDate}
                      </li>
                      <li className="lg:text-sm md:text-xs text-xxs list-heading">
                        Time
                      </li>
                      <li className="lg:text-base md:text-sm text-xs font-bold pb-2">
                        {schedule.arrivalTime}
                      </li>
                    </ul>
                  </div>
                  {/* bus type info */}
                  <div className="hidden lg:block md:block ">
                    <ul className="flex flex-col">
                      <li className="lg:text-sm md:text-xs text-xxs list-heading">
                        Bus Type
                      </li>
                      <li className="lg:text-base md:text-sm text-xs font-bold pb-2  ">
                        {schedule.busId?.type || "—"}
                      </li>
                      <li className="lg:text-sm md:text-xs text-xxs list-heading">
                        Bus Number
                      </li>
                      <li className="lg:text-base md:text-sm text-xs font-bold pb-2  ">
                        {schedule.busId?.busNumber || "—"}
                      </li>
                    </ul>
                  </div>
                  {/*available seats and price details */}
                  <div className="w-full ms-2 ps-2 xs: border-l-2 lg:border-none border-gray-900">
                    <ul className="flex flex-col">
                      <li className="lg:text-3xl lg:ml-2 md:text-xl text-sm font-bold py-2 uppercase">
                        <span className="lg:text-sm md:text-xs text-xxs">
                          Rs.{" "}
                        </span>
                        {schedule.price?.toLocaleString()}
                      </li>
                      
                    </ul>
                    <div className="flex  pb-2  items-center ">
                      <div className="flex flex-col justify-start">
                        <span className="lg:text-sm md:text-xs text-xxs list-heading lg:hidden md:hidden flex">
                          Available Seats
                        </span>
                        <span className="lg:hidden md:hidden flex">{busSeatData.filter(s => s.status === "available").length}</span>
                        <span className="flex lg:text-base md:text-sm text-xs list-heading lg:block italic md:block hidden">
                          Available
                        </span>
                        <span className="flex lg:text-base md:text-sm text-xs  list-heading italic lg:block md:block hidden">
                          Seats
                        </span>
                      </div>

                      <span className="lg:text-3xl md:text-2xl flex lg:block md:block hidden border-l-2 ml-4 font-bold px-4">
                        {busSeatData.filter(s => s.status === "available").length}
                      </span>
                    </div>
                  </div>
                  <img src={busImg} alt="" className="h-full hidden lg:block border-2 border-gray-500 rounded" />
                </div>
              </div>
            </div>
        </div>
      </div>
      )}
      {/* horizontal divider */}
      <hr className="my-4 mx-16" />

      {/* seats status */}
      <div className="flex justify-center itmes-center gap-x-2 text-gray-100 ">
        {/* Available seats */}
        <div className="flex justify-center itmes-center lg:h-4 h-3">
          <span className="lg:w-4 w-3  bg-gray-100 border rounded border-gray-900"></span>
          <span className="text-xs lg:text-base  flex items-center justify-center px-2">
            {"Available seats "}
          </span>
        </div>
        {/* Selected Seats */}
        <div className="flex justify-center itmes-center lg:h-4 md:h4 h-3">
          <span className="lg:w-4  w-3  bg-green-500 border rounded border-gray-900"></span>
          <span className="text-xs lg:text-base  flex items-center justify-center px-2">
            {" Selected Seats"}
          </span>
        </div>
        {/* already booked seats */}
        <div className="flex justify-center itmes-center lg:h-4 h-3">
          <span className="lg:w-4 w-3  bg-red-500 border rounded border-gray-900"></span>
          <span className="text-xs lg:text-base  flex items-center justify-center px-2">
            {"Booked seats "}
          </span>
        </div>
      </div>
      {showError && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50 transition-opacity ${showError ? "opacity-100" : "opacity-0"
            }`}
        >
          <div className="  py-12 px-8 bg-red-500 text-white rounded shadow-lg border-2 border-gray-100 flex itmes-center justify-center ">
            <span className="flex justify-center  text-lg shadow-xl ">You can select up to 6 seats only</span>
          </div>
        </div>

      )}

      {/* Bus Structure layout */}
      <div className={` flex items-center justify-center my-3`}>
        <div
          className={`${isLgOrMd
            ? "flex items-center items-stretch gap-x-1.5"
            : "flex-col gap-x-1.5 "
            } flex items-center justify-center bus form bg-gray-100  rounded-lg`}
        >
     
            {/*Driver Steering icon */}
            <div className="w-10 h-fit">
              <GiSteeringWheel
                className={`${isLgOrMd ? "mt-7 -rotate-90" : " ml-16 mb-2"
                  } text-3xl  text-red-500 `}
              />
            </div>
            {/* Seats struture */}
            <div
              className={`${isLgOrMd ? "border-l-2 pl-7" : "border-t-2 pt-5"
                } flex items-center border-dashed border-gray-500`}
            >
              {/* Seats rows and columns */}
              <div className={`${isLgOrMd ? "flex-1" : "flex flex-row"}`}>
                {/* lg:first row / xs:first column*/}
                <div
                  className={`${isLgOrMd
                    ? "w-full h-auto grid grid-cols-12 justify-end"
                    : "flex flex-col"
                    } `}
                >
                  {busSeatData
                    .filter(
                      (seat) =>
                        seat.row === (device === "lg" || device == "md" ? 1 : 5)
                    )
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className={`relative flex items-center ${seat.col === 12 && seat.row === 5 ? "mt-10" : ""
                          } p-1 duration-300 transform hover:scale-110`}
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <img
                          src={chair}
                          className={`${isLgOrMd ? "h-9 " : "h-8  rotate-90"}`}
                        />

                        <span
                          className={`${isLgOrMd ? "ml-0.5  h-6 w-6" : "ml-1.5 mb-1 h-6 w-5"
                            } text-sm text-black absolute flex justify-center items-center ${getSeatName(
                              seat
                            )}`}
                        >
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
                {/* lg:second row / xs:second column */}
                <div
                  className={`${isLgOrMd
                    ? "w-full h-auto grid grid-cols-12 justify-end"
                    : "flex flex-col"
                    }`}
                >
                  {busSeatData
                    .filter((seat) => seat.row === (device === "lg" || device == "md" ? 2 : 4))
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className={`relative flex items-center ${seat.col === 12 && seat.row === 4 ? "mt-10" : ""} 
                        p-1 duration-300 transform hover:scale-110`}
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <img
                          src={chair}
                          className={`${isLgOrMd ? "h-9 " : "h-8  rotate-90"}`}
                        />

                        <span
                          className={`${isLgOrMd ? "ml-0.5  h-6 w-6" : "ml-1.5 mb-1 h-6 w-5"
                            } text-sm text-black absolute flex justify-center items-center ${getSeatName(seat)}
                    `}
                        >
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
                {/* lg:third row / xs:third column */}
                <div
                  className={`${isLgOrMd
                    ? "w-full h-auto grid col-span-1 gap-x-5  justify-end"
                    : "flex flex-col col-span-1 justify-end"
                    }`}
                >
                  {busSeatData
                    .filter((seat) => seat.row === (device === "lg" ? 3 : 3))
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className={`relative flex items-center p-1 duration-300 transform hover:scale-110`}
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <img
                          src={chair}
                          className={`${isLgOrMd ? "h-9 " : "h-8  rotate-90"}`}
                        />

                        <span
                          className={`${isLgOrMd ? "ml-0.5  h-6 w-6" : "ml-1.5 mb-1 h-6 w-5"
                            } text-sm text-black absolute flex justify-center items-center 
                          ${getSeatName(seat)}`}
                        >
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
                {/* lg:fourth row / xs:fourth column */}
                <div
                  className={`${isLgOrMd
                    ? "w-full h-auto grid grid-cols-12 justify-end"
                    : "flex flex-col"
                    }`}
                >
                  {busSeatData
                    .filter((seat) => seat.row === (device === "lg" || device == "md" ? 4 : 2))
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className={`relative flex items-center 
                        ${seat.col === 12 && seat.row === 4 ? device === "lg" || device == "md" ? "col-start-12" : "mt-10" : ""} 
                        p-1 duration-300 transform hover:scale-110`}
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <img
                          src={chair}
                          className={`${isLgOrMd ? "h-9 " : "h-8  rotate-90"}`}
                        />

                        <span
                          className={`${isLgOrMd ? "ml-0.5  h-6 w-6" : "ml-1.5 mb-1 h-6 w-5"
                            } text-sm text-black absolute flex justify-center items-center
                          ${getSeatName(seat)}`}
                        >
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
                {/* lg:last row / xs:last column */}
                <div
                  className={`${isLgOrMd
                    ? "w-full h-auto grid grid-cols-12 justify-end"
                    : "flex flex-col"
                    }`}
                >
                  {busSeatData
                    .filter((seat) => seat.row === (device === "lg" || device == "md" ? 5 : 1))
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className={`relative flex items-center 
                                ${seat.col === 12 && seat.row === 5 ? device === "lg" || device == "md" ? "col-start-12" : "" : ""} 
                                p-1 duration-300 transform hover:scale-110`}
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <img
                          src={chair}
                          className={`${isLgOrMd ? "h-9 " : "h-8  rotate-90"}`}
                        />

                        <span
                          className={`${isLgOrMd ? "ml-0.5  h-6 w-6" : "ml-1.5 mb-1 h-6 w-5"
                            } text-sm text-black absolute flex justify-center items-center 
                          ${getSeatName(seat)} `}
                        >
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
        
        </div>

      </div>
      {bookingMsg.text && (
        <div
          className={`mx-6 my-2 p-3 rounded text-center font-medium ${
            bookingMsg.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {bookingMsg.text}
        </div>
      )}
      <div className="flex items-center lg:justify-evenly md:justify-evenly justify-center pb-3">
        <div className="flex justify-center">
          <div className="justify-center items-center lg:ml-28 flex text-white lg:text-lg md:text-lg text-xs flex-col lg:flex-row md:flex-row">
            <span className="flex items-center justify-start">Selected Seats No : </span>
            <span className="font-bold flex w-40 lg:w-56 md:w-56 justify-start">{"[ "}{selectedSeats.join(" , ")} ]</span>
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={selectedSeats.length === 0 || bookingLoading}
          className="flex lg:px-8 lg:py-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded lg:mr-28 transition-colors"
        >
          {bookingLoading ? "Redirecting to Payment..." : "Book Selected Seats"}
        </button>
      </div>

    </div>
  );
};

export default BusSeats;
