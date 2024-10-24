// LoginForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error } = useContext(AuthContext); // Get error from context
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/home');
        } catch {
            // Handle error (already managed in context)
        }
    };

    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-xl border-2 border-red-500 p-8 w-96">
            <h1 className="text-5xl font-bold">
                <span className="text-red-500">Rock</span>
                <span className="text-black">Learn</span>
            </h1>
            <form onSubmit={handleSubmit} className="mt-8 w-full">
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
                <button
                    type="submit"
                    className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all"
                >
                    Login
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>} {/* Display error message */}
            </form>
            <div className="flex justify-between items-center mt-4 w-full">
                <a
                    href="/password/forgot"
                    className="text-red-500 hover:underline text-sm"
                >
                    Forgot password?
                </a>
                <a
                    href="/auth/signup"
                    className="text-red-500 hover:underline text-sm"
                >
                    Create new account
                </a>
            </div>
        </div>
    );
};

export default LoginForm;
