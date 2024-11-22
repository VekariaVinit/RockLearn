import React from 'react';
import SignupForm from '../components/SignupForm';


const SignupPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
    

      <div className="w-full sm:w-96 p-6 sm:p-8 bg-white rounded-xl shadow-lg">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
