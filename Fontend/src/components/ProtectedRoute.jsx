import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Function to decode JWT token
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const ProtectedRoute = () => {
  const [isChecking, setIsChecking] = useState(true); // State to manage token validation
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('TOKEN');
      if (!token) {
        showToastAndRedirect('Session expired. Please log in again.');
        return;
      }

      const decodedToken = decodeJwt(token);
      const currentTime = Date.now() / 1000;

      if (!decodedToken || decodedToken.exp < currentTime) {
        localStorage.removeItem('TOKEN');
        showToastAndRedirect('Session expired. Please log in again.');
        return;
      }

      setIsChecking(false); // Token is valid, allow rendering of protected content
    };

    const showToastAndRedirect = (message) => {
      toast.error(message, {
        position: 'top-right',
        autoClose: 3000,
      });

      // Redirect immediately after the toast appears
      navigate('/auth/login', { replace: true });
    };

    checkToken();
  }, [navigate]);

  // While checking the token, prevent rendering the outlet or redirect
  if (isChecking) {
    return <div>Loading...</div>; // Or you can return a spinner/loader
  }

  return <Outlet />; // Render the protected content if token is valid
};

export default ProtectedRoute;
