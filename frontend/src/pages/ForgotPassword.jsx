import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { forgotPasswordOTP } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        const res = await forgotPasswordOTP(email);
        if (res.success) {
            toast.success('OTP sent! Please check your email.');
            // Navigate to verify-otp page with the email in location state
            navigate('/verify-otp', { state: { email } });
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-400">
                        Forgot Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Enter your email to receive an OTP
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-1 block">Email address</label>
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                                placeholder="email@campus.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg shadow-teal-500/20 transform transition hover:-translate-y-1"
                        >
                            Send Verification OTP
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4 flex justify-center items-center px-2">
                    <p className="text-sm text-gray-400">
                        Remember your password?{' '}
                        <Link to="/login" className="font-medium text-teal-500 hover:text-teal-400">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
