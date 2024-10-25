import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null); 
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    // Retrieve auth status from localStorage on app load
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true'); // Persist login state
      setError(null); 
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const verifyOTP = async ({ email, fullHash, otp }) => {   
    try {
      const response = await fetch('http://localhost:3001/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, fullHash, otp }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
  
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true'); // Persist login state
      setError(null); 
      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message); 
      throw error;
    }
  };
  
  const logout = () => {
    setIsAuthenticated(false); // Reset the authentication state
    localStorage.removeItem('isAuthenticated'); // Clear from local storage
    navigate('/auth/login'); // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, verifyOTP,logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
