/* eslint-disable no-unused-vars */
import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-scroll";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-8 pb-2">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-center space-y-6 lg:space-y-0">
          {/* Logo and Description */}
          <div className="flex flex-col items-center lg:items-start space-y-2 lg:space-y-4">
            <h1 className="text-white justify-center text-2xl font-bold tracking-wide">
              BusBooking
            </h1>
            <p className="text-sm mt-2">
              Your trusted partner in hassle-free bus ticket bookings.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <ul className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0 text-center">
              {[
                { to: "about", label: "About Us" },
                { to: "services", label: "Services" },
                { to: "contact", label: "Contact" },
                { to: "faq", label: "FAQ" },
                { to: "terms", label: "Terms & Conditions" },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  spy={true}
                  smooth={true}
                  className="hover:text-white transition cursor-pointer"
                >
                  <li>{item.label}</li>
                </Link>
              ))}
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <ul className="flex justify-center lg:justify-end gap-6">
              {[
                {
                  icon: <FaFacebook size={24} />,
                  href: "https://facebook.com",
                },
                { icon: <FaTwitter size={24} />, href: "https://twitter.com" },
                {
                  icon: <FaInstagram size={24} />,
                  href: "https://instagram.com",
                },
                {
                  icon: <FaLinkedin size={24} />,
                  href: "https://linkedin.com",
                },
              ].map((item, index) => (
                <li
                  key={index}
                  className="transition-all duration-300 transform hover:scale-125 hover:translate-y"
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-200  hover:shadow-xl"
                  >
                    <span className="inline-block">{item.icon}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-gray-700"></div>

        {/* Footer Bottom */}
        <div className="flex flex-col items-center bottom-0">
          <button
            className="bg-gray-800 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to Top
          </button>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} BusBooking. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
