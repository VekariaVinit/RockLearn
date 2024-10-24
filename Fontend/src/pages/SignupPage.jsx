import React from 'react';
import SignupForm from '../components/SignupForm';
import Logo from '../components/Logo';

const SignupPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      {/* <Logo /> */}
      <SignupForm />
    </div>
  );
};

export default SignupPage;
