import React from 'react';
import LoginForm from '../components/LoginForm';
import Logo from '../components/Logo';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      {/* <Logo /> */}
      <LoginForm />
    </div>
  );
};

export default LoginPage;
