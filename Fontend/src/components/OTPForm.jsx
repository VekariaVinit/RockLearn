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
        <form onSubmit={handleVerify} className="flex flex-col items-center justify-center space-y-4">
            <input 
                type="text" 
                placeholder="Enter OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                className="border-2 border-black rounded-full py-2 px-6"
                required 
            />
            <button type="submit" className="bg-red-600 text-white py-2 px-8 rounded-full">
                Verify OTP
            </button>
        </form>
    );
};

export default OTPForm;
