import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // Store user details
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:3001/auth';

  useEffect(() => {
    // Check authentication state from localStorage
    const token = localStorage.getItem('TOKEN');
    const userDetails = localStorage.getItem('USER');
    if (token && userDetails) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userDetails)); // Parse and set user details
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

      // Save token and user details in localStorage
      localStorage.setItem('TOKEN', data.token);
      localStorage.setItem('USER', JSON.stringify(data.user));

      // Update state
      setIsAuthenticated(true);
      setUser(data.user);
      setError(null);

      // Redirect to dashboard
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
    setUser(null);
    localStorage.removeItem('TOKEN');
    localStorage.removeItem('USER');
    setError(null);
    navigate('/auth/login');
  };
  

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, verifyOTP, logout, error,user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
