import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SignupForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpVisible, setIsOtpVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // Local error state
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [fullHash, setFullHash] = useState(''); // State to store fullHash from signup response
    const { verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        // Prepare the data for signup
        const signupData = {
            firstName,
            lastName,
            email,
            password,
        };

        setIsLoading(true); // Start loading
        try {
            const response = await fetch('http://127.0.0.1:3001/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // Store fullHash and show OTP input
            setFullHash(data.fullHash); // Assuming fullHash is returned in the response
            setIsOtpVisible(true);
            setErrorMessage(''); // Clear any previous error messages
        } catch (error) {
            setErrorMessage(error.message); // Set the error message to display
        } finally {
            setIsLoading(false); // End loading
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading

        // Prepare OTP verification data
        const otpData = {
            email,
            fullHash,
            otp,
        };

        try {
            // Call the context function to verify OTP with additional parameters
            await verifyOTP(otpData);
            navigate('/auth/login');
        } catch (error) {
            setErrorMessage("OTP verification failed."); // Handle OTP error
        } finally {
            setIsLoading(false); // End loading
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl border-2 border-red-500 p-8 w-96">
            <h1 className="text-5xl font-bold">
                <span className="text-red-500">Rock</span>
                <span className="text-black">Learn</span>
            </h1>
            <form onSubmit={isOtpVisible ? handleOtpSubmit : handleSignup} className="mt-8 w-full">
                {!isOtpVisible ? (
                    <>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter your first name"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter your last name"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="mb-4">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                        {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>} {/* Display error message */}
                    </>
                ) : (
                    <>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>} {/* Display error message */}
                    </>
                )}
            </form>
            <div className="flex justify-between items-center mt-4 w-full">
                <a
                    href="/auth/login"
                    className="text-red-500 hover:underline text-sm"
                >
                    Already have an account?
                </a>
            </div>
        </div>
    );
};

export default SignupForm;
