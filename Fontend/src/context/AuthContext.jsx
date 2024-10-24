// AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null); // New state for error messages

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
      setError(null); // Clear any previous errors
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message); // Set error message
      throw error;
    }
  };

  // Updated verifyOTP function
  const verifyOTP = async (email, fullHash, otp) => {
    try {
        const response = await fetch('http://127.0.0.1:3001/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, fullHash, otp }),
        });
    
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'OTP verification failed');
        }
    

      setIsAuthenticated(true);
      setError(null); // Clear any previous errors
      return data;
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message); // Set error message
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, verifyOTP, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
