/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import logo from "../assets/images/QBus-logo.png";
import { useEffect, useRef, useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { FaMoon, FaSun, FaTimes, FaUser } from "react-icons/fa";

export default function Navbar({dark,  setDark ,isScrolled}) {
  const [click, setClick] = useState(false);
  const navRef = useRef(null);

  const handleClick = () => {
    setClick(!click); // Toggle mobile menu
  };

  const handleOutsideClick = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setClick(false); // Close menu if clicking outside
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  const handleDark = () => {
    setDark(!dark); 

  }// Toggle dark mode
 //content for mobile menu
  const content = (
    <>
      <div className="lg:hidden md:hidden absolute block top-14 w-full left-0 right-0 bg-gray-800 transition z-50">
        {/* naviagation links */}
        <ul className="text-center text-xl px-16">
          <Link to={""} onClick={() => handleClick()}>
            <li className="cursor-pointer my-2 py-2 hover:text-blue-900 transition border-b-2 hover:bg-gray-300  rounded-xl border-gray-900  hover:border-blue-900">
              Home
            </li>
          </Link>
          <Link to={""} onClick={() => handleClick()}>
            <li className="cursor-pointer my-2 py-2 hover:text-blue-900 transition border-b-2 hover:bg-gray-300  rounded-xl border-gray-900  hover:border-blue-900">
              About
            </li>
          </Link>
          <Link to={""} onClick={() => handleClick()}>
            <li className="cursor-pointer my-2 py-2 hover:text-blue-900 transition border-b-2 hover:bg-gray-300  rounded-xl border-gray-900  hover:border-blue-900">
              Contact
            </li>
          </Link>
          <Link to={""} onClick={() => handleClick()}>
            <li className="cursor-pointer my-2 py-2 hover:text-blue-900 transition border-b-2 hover:bg-gray-300  rounded-xl border-gray-900  hover:border-blue-900">
              Services
            </li>
          </Link>
          <Link to={"/login"} onClick={() => handleClick()}>
          <li className=" flex items-center justify-center cursor-pointer my-2 py-2 hover:text-blue-900 transition border-b-2 hover:bg-gray-300  rounded-xl border-gray-900  hover:border-blue-900">
          <FaUser className="mx-2"/><span>Login</span>
                </li>
              </Link>

            {/* Dark mode toggle */}
          <li className="cursor-pointer my-2 py-2 hover:text-blue-900 transition border-b-2 hover:bg-gray-300  rounded-xl border-gray-900  hover:border-blue-900" onClick={() => handleClick()}>
          <button 
              className="cursor-pointer hover:text-blue-900 transition justify-between items-center hover:bg-gray-300 px-3 py-1 rounded-xl border-gray-900 hover:border-blue-900"
              onClick={() => handleDark()} 
              >
                {dark ? (
                  <div className="flex items-center">
                    <FaMoon /> <span className="px-2">Light</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaSun /> <span className="px-2">Dark</span>
                  </div>
                )}
              </button>
              </li>
        </ul>
      </div>
    </>
  );
  return (
    // Navbar
    <nav ref={navRef} className={`sticky top-0 left-0 w-full z-50 ${isScrolled ? dark? "bg-gray-900 shadow-lg border-b-2 border-gray-600 ":"bg-gray-100" : "bg-transparent"
      }`}> 
      <div className=" flex justify-between text-white lg:py-4 py-3 lg:ps-16 ps-8 z-50 px-1 ">
        {/* Logo */}
        <div className="flex flex-1 items-center">
          <img
            alt="QBus Logo"
            src={logo}
            className="h-8 md:h-12 lg:h-16 w-auto rounded-lg justify-center"
          />
        </div>
        {/* desktop navigation */}
        <div className={`lg:flex md:flex lg:flex-1 items-center justify-end font-normal hidden ${dark? "text-white ":"text-black "}`}>
        {/*  dark mood toggle*/}
        <button 
              className="cursor-pointer hover:text-blue-900 transition items-center hover:bg-gray-300 px-2 mr-2 py-1 rounded-xl border-gray-900 hover:border-blue-900 flex gap-2 items-end"
              onClick={() => handleDark()}
              >
                {dark ? (
                  <div className="flex items-center">
                    <FaMoon /> <span className="px-2">Light</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaSun /> <span className="px-2">Dark</span>
                  </div>
                )}
              </button>
          <div className="flex-10">
            <ul className="flex gap-4 mr-8">
              
              <Link to={"/"}>
                <li className="shadow cursor-pointer hover:text-blue-900 transition border-b-2 hover:bg-gray-300 px-3 py-1 rounded-xl border-gray-900  hover:border-blue-900">
                  Home
                </li>
              </Link>
              <Link to={"/seatMap"}>
                <li className="shadow cursor-pointer hover:text-blue-900 transition border-b-2 hover:bg-gray-300 px-3 py-1 rounded-xl border-gray-900  hover:border-blue-900">
                  Seats
                </li>
              </Link>
              <Link to={""}>
                <li className="shadow cursor-pointer hover:text-blue-900 transition border-b-2 hover:bg-gray-300 px-3 py-1 rounded-xl border-gray-900  hover:border-blue-900">
                  Contact
                </li>
              </Link>
              <Link to={""}>
                <li className="shadow cursor-pointer hover:text-blue-900 transition border-b-2 hover:bg-gray-300 px-3 py-1 rounded-xl border-gray-900  hover:border-blue-900">
                  Services
                </li>
              </Link>
              <Link to={"/login"} >
                <li className="shadow cursor-pointer hover:text-blue-900 transition border-b-2 hover:bg-gray-300 px-3 py-1 rounded-xl border-gray-900  hover:border-blue-900 flex gap-2 items-center">
                  <FaUser/><span>Login</span>
                </li>
              </Link>
            </ul>
          </div>
        </div>
        <div>{click && content}</div>
        <button
          className="block lg:hidden md:hidden transition  bg-gray-500 text-gray-900  py-1 px-2 rounded-lg"
          onClick={() => handleClick()}
        >
          {click ? <FaTimes /> : <CiMenuFries className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}
