// Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaUpload, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import './Header.css';

const Header = () => {
    const { logout } = useAuth(); // Get the logout function from AuthContext

    return (
        <header className="bg-gradient-to-r from-red-500 to-red-700 text-white p-4 flex justify-between items-center shadow-lg">
            <h1 className="text-4xl font-bold">
                <span className="text-red-100 inline">Rock</span>
                <span className="text-black inline">Learn</span>
            </h1>
            <nav>
                <ul className="flex space-x-6">
                    <li>
                        <Link to="/home" className="flex items-center hover:underline hover:text-red-300">
                            <FaHome className="mr-2" /> Home
                        </Link>
                    </li>
                    <li>
                        <button onClick={logout} className="flex items-center hover:underline hover:text-red-300">
                            <FaSignOutAlt className="mr-2" /> Logout
                        </button>
                    </li>
                    <li>
                        <Link to="/upload" className="flex items-center hover:underline hover:text-red-300">
                            <FaUpload className="mr-2" /> Add Lab
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile" className="flex items-center hover:underline hover:text-red-300">
                            <FaUser className="mr-2" /> Profile
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
