import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const { verifyResetOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const res = await verifyResetOTP(email, otp);
        if (res.success) {
            toast.success('Email verified successfully!');
            navigate('/reset-password', { state: { email, otp } });
        } else {
            toast.error(res.message);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-amber-400">
                        Verify Verification OTP Code
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        We sent an OTP to {email}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-1 block flex items-center gap-1">
                                <span>📩</span> Enter Verification OTP Code
                            </label>
                            <input
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200 tracking-widest text-lg font-bold text-center"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <p className="text-xs text-slate-400 mt-2 text-center">(Check server console for OTP in development)</p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg shadow-amber-500/20 transform transition hover:-translate-y-1"
                        >
                            Verify & Proceed
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-400">
                        <Link to="/login" className="font-medium text-teal-500 hover:text-teal-400">
                            Cancel & Return to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
