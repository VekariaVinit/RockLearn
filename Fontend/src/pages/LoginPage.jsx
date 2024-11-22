import React from 'react';
import LoginForm from '../components/LoginForm';
// import Logo from '../components/Logo'; // If you decide to re-enable the logo

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
     
      
      <div className="w-full sm:w-96 p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
