import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const token = localStorage.getItem('TOKEN');

  // If the token exists, redirect to the home page
  if (token) {
    return <Navigate to="/home" />;
  }

  // If no token exists, render the public content (login/signup)
  return <Outlet />;
};

export default PublicRoute;
