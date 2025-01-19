/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { GiSteeringWheel } from "react-icons/gi";
import { MdOutlineChair } from "react-icons/md";
import { LuArmchair } from "react-icons/lu";
import { MdChair } from "react-icons/md";

const BusSeat = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showError, setShowError] = useState(false);
  const busSeatData = [];

  for (let col = 1; col <= 12; col++) {
    for (let row = 1; row <= 5; row++) {
      let status;
      if ((col * row) % 2 === 0) {
        status = "booked";
      } else {
        status = "available";
      }
      // Skip all invalid seats based on the given conditions
      if (
        (row === 3 && col !== 12) || // Skip all seats in row 3 except column 12
        (col === 11 && row > 2) // Skip column 11 for rows greater than 2
      ) {
        continue;
      }
      busSeatData.push({
        id: busSeatData.length + 1,
        status: status, // Default status
        row: row,
        col: col,
      });
    }
  }

  console.log(busSeatData);

  const handleSeatClick = (seatId) => {
    const selectedSeats = busSeatData.find((seat) => seat.id === seatId);
    if (selectedSeats.status === "booked") {
      return;
    }
    setSelectedSeats((prevSelectedSeats) => {
      if (prevSelectedSeats.includes(seatId)) {
        return prevSelectedSeats.filter((seat) => seat !== seatId);
      } else {
        if (prevSelectedSeats.length >= 10) {
          setShowError(true);
          return prevSelectedSeats;
        } else {
          return [...prevSelectedSeats, seatId];
        }
      }
    });
  };

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showError]);

  const getSeatName = (seat) => {
    if (seat.status === "booked") {
      return "text-red-600 cursor-not-allowed";
    }
    if (selectedSeats.includes(seat.id)) {
      return "text-yellow-600 cursor-pointer";
    }
    return "text-gray-100 cursor-pointer";  
  };

  return (
    <div className="lg:mx-24 gap-10">
      {/* Seat Layout */}
      <div className=" w-full flex items-center justify-center shadow-sm rounded-xl p-4 border border-neutral-200 ">
        <div className=" space-y-7">
          <p className="text-base text-neutral-600 font-medium text-center">
            Click on available seats
          </p>
          {/* Seat Layout */}
          <div className=" flex items-center items-stretch gap-x-1.5">
            <div className="w-10 h-fit">
              <GiSteeringWheel className="text-3xl mt-7 text-red-500 -rotate-90" />
            </div>
            {/* seat rows */}
            <div className="flex flex-col xs:flex-row items-center border-l-2 border-dashed border-neutral-300 pl-7">
              <div className="flex-1">
                {/* 1st row */}
                <div className="w-full h-auto grid grid-cols-12 gap-x-5  justify-end">
                  {busSeatData
                    .filter((seat) => seat.row === 1)
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className="relative flex items-center  "
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <MdChair
                          className={`lg:w-16 w-6 h-8 -rotate-90 ${getSeatName(
                            seat
                          )} relative`}
                        />
                        <span className="absolute text-xxs font-bold text-white">
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
                {/* 2nd row */}
                <div className="w-full h-auto grid grid-cols-12 gap-x-5  justify-end">
                  {busSeatData
                    .filter((seat) => seat.row === 2)
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className="relative flex items-center  "
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <MdChair
                          className={`lg:w-16 w-6 h-8 -rotate-90 ${getSeatName(
                            seat
                          )} relative`}
                        />
                        <span className="absolute text-xxs font-bold text-white">
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
                {/* 3rd row */}
                <div className="w-full h-auto grid col-span-1 gap-x-5  justify-end">
                  {busSeatData
                    .filter((seat) => seat.row === 3)
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className="relative flex items-center  "
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <MdChair
                          className={`lg:w-16 w-6 h-8 -rotate-90 ${getSeatName(
                            seat
                          )} relative`}
                        />
                        <span className="absolute text-xxs font-bold text-white">
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
                {/* 4th row */}
                <div className="w-full h-auto grid grid-cols-12 gap-x-5 justify-end">
                  {busSeatData
                    .filter((seat) => seat.row === 4)
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className={`relative flex items-center ${
                          seat.col === 12 ? "col-start-12" : ""
                        }`}
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <MdChair
                          className={`lg:w-16 w-6 h-8 -rotate-90 ${getSeatName(
                            seat
                          )} relative`}
                        />
                        <span className="absolute text-xxs font-bold text-white">
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>

                {/* 5th row */}
                <div className="w-full h-auto grid grid-cols-12 gap-x-5 justify-end">
                  {busSeatData
                    .filter((seat) => seat.row === 5)
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className={`relative flex items-center ${
                          seat.col === 12 ? "col-start-12" : ""
                        }`}
                        onClick={() => handleSeatClick(seat.id)}
                      >
                        <MdChair
                          className={`lg:w-16 w-6 h-8 -rotate-90 ${getSeatName(
                            seat
                          )} relative`}
                        />
                        <span className="absolute text-xxs font-bold text-white">
                          {seat.id}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
          {/* Reservation info */}
          <div className="w-full flex items-center justify-center gap-6 border-t border-neutral-200 pt-5"></div>
        </div>
      </div>
      {/* seat selection */}
      <div className="col-span-2 w-full space-y-5 bg-neutral-50 rounded-xl py-4 px-6 border border-neutral-200 shadow-sm">
        
      </div>
    </div>
  );
};

export default BusSeat;
