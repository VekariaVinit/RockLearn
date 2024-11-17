import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaUpload, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Inline styles for the header */}
      <style>{`
        :root {
          --header-height: 64px;
        }

        body {
          margin: 0;
          padding: 0;
          padding-top: var(--header-height); /* Prevent header overlap with content */
          font-family: Arial, sans-serif;
        }

        .header {
          background: linear-gradient(to right, #ef4444, #b91c1c);  /* Darker red gradient */
          color: white;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          height: var(--header-height);
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 10;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
        }

        .header-logo {
          font-size: 1.8rem;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .header-logo span:first-child {
          color: white;
        }

        .header-logo span:last-child {
          color: black;
        }

        .header-nav {
          display: flex;
          gap: 1.5rem;
        }

        .header-nav a {
          text-decoration: none;
          color: white;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.3s ease;
        }

        .header-nav a:hover {
          color: #ffcccb; /* Light red */
        }

        .mobile-menu {
          display: none;
        }

        .mobile-nav {
          display: none;
        }

        .mobile-menu-btn {
          font-size: 1.8rem;
          cursor: pointer;
          background: none;
          border: none;
          color: white;
        }

        .mobile-nav {
          background: linear-gradient(to right, #ef4444, #b91c1c);  /* Darker red gradient */
          position: absolute;
          top: var(--header-height);
          left: 0;
          width: 100%;
          z-index: 9;
          padding: 1rem 0;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .mobile-nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
          text-align: center;
        }

        .mobile-nav li {
          margin: 1rem 0;
        }

        .mobile-nav a {
          text-decoration: none;
          color: white;
          font-size: 1.2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
        }

        .mobile-nav a:hover {
          color: #ffcccb; /* Light red */
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }

          .mobile-menu {
            display: block;
          }

          .mobile-nav {
            display: ${menuOpen ? 'block' : 'none'};
          }
        }
      `}</style>

      {/* Header component */}
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-logo">
            <span>Rock</span>
            <span>Learn</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            <Link to="/home">
              <FaHome /> Home
            </Link>
            <Link to="/upload">
              <FaUpload /> Add Lab
            </Link>
            <Link to="/profile">
              <FaUser /> Profile
            </Link>
            <Link>
              <FaSignOutAlt /> Logout
            </Link>
          </nav>

          {/* Mobile Hamburger Menu */}
          <div className="mobile-menu">
            <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="mobile-nav">
            <ul>
              <li>
                <Link to="/home" onClick={toggleMenu}>
                  <FaHome /> Home
                </Link>
              </li>
              <li>
                <Link to="/upload" onClick={toggleMenu}>
                  <FaUpload /> Add Lab
                </Link>
              </li>
              <li>
                <Link to="/profile" onClick={toggleMenu}>
                  <FaUser /> Profile
                </Link>
              </li>
              <li>
                <Link>
                  <FaSignOutAlt /> Logout
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
