import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import UploadLab from './pages/UploadLab'; // New component for uploading labs
import LabDetails from './pages/LabDetails'; // New component for lab details
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';


function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<PublicRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="home" element={<HomePage />} />
          <Route path="upload" element={<UploadLab />} /> {/* Route for uploading labs */}
          <Route path="/lab/:repoName" element={<LabDetails />} /> {/* Route for lab details */}
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
