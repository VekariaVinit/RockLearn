import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaUpload, FaUser } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-red-100 to-red-700 text-white p-4  transition-all duration-500">
      {/* Container for the content inside the header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <h1 className="text-5xl font-extrabold tracking-wide text-shadow-md">
          <span className="text-red-100">Rock</span>
          <span className="text-black">Learn</span>
        </h1>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/home" 
                className="nav-link"
              >
                <FaHome className="icon" /> Home
              </Link>
            </li>
            <li>
              <button 
                className="nav-link"
              >
                <FaSignOutAlt className="icon" /> Logout
              </button>
            </li>
            <li>
              <Link 
                to="/upload" 
                className="nav-link"
              >
                <FaUpload className="icon" /> Add Lab
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className="nav-link"
              >
                <FaUser className="icon" /> Profile
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
    