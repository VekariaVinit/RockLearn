import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const OTPForm = () => {
    const [otp, setOtp] = useState('');
    const { verifyOTP } = useContext(AuthContext);

    const handleVerify = (e) => {
        e.preventDefault();
        verifyOTP(otp);
    };

    return (
        <form onSubmit={handleVerify} className="flex flex-col items-center justify-center space-y-4 max-w-md w-full px-4 py-8 mx-auto">
            <input 
                type="text" 
                placeholder="Enter OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                className="border-2 border-black rounded-full py-2 px-6 w-full sm:w-80 md:w-96"
                required 
            />
            <button 
                type="submit" 
                className="bg-red-600 text-white py-2 px-8 rounded-full w-full sm:w-80 md:w-96"
            >
                Verify OTP
            </button>
        </form>
    );
};

export default OTPForm;
