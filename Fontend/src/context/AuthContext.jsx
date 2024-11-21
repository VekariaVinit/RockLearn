import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:3001/auth';

  useEffect(() => {
    // Check authentication state from localStorage
    const storedAuth = localStorage.getItem('TOKEN');
    if (storedAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
  
      // Save token in localStorage
      localStorage.setItem('TOKEN', data.token);
  
      // Update authentication state
      setIsAuthenticated(true);
      setError(null);
  
      // Redirect to dashboard after login
      navigate('/home');
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    }
  };
  

  const verifyOTP = async ({ email, fullHash, otp }) => {
    try {
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullHash, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'OTP verification failed');

      localStorage.setItem('TOKEN', data.token); // Save token in localStorage
      setIsAuthenticated(true);
      setError(null);
      navigate('/home'); // Redirect to a secure route after verification
      return data;
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Clear server-side session (optional)
      await fetch(`${BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Error logging out:', err);
    }
  
    // Reset state and redirect
    setIsAuthenticated(false);
    localStorage.removeItem('TOKEN'); // Clear token from localStorage
    setError(null);
    navigate('/auth/login'); // Redirect to login page
  };
  

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, verifyOTP, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
