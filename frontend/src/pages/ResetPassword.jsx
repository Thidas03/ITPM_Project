import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { resetPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email;
    const otp = location.state?.otp;

    useEffect(() => {
        if (!email || !otp) {
            navigate('/forgot-password');
        }
    }, [email, otp, navigate]);

    const checkPasswordStrength = (pass) => {
        let score = 0;
        if (!pass) return { score: 0, label: 'Weak', color: 'bg-slate-200', width: '0%' };
        if (pass.length > 8) score += 1;
        if (/[a-z]/.test(pass)) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        if (score <= 2) return { score, label: 'Weak', color: 'bg-red-400', width: '33%' };
        if (score <= 4) return { score, label: 'Fair', color: 'bg-amber-400', width: '66%' };
        return { score, label: 'Strong', color: 'bg-gradient-to-r from-amber-500 to-orange-600', width: '100%' };
    };

    const strength = checkPasswordStrength(newPassword);

    const onSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (newPassword.length < 8) {
            return toast.error('Password must be at least 8 characters long');
        }

        const res = await resetPassword(email, otp, newPassword);
        if (res.success) {
            toast.success('Password updated successfully!');
            navigate('/login');
        } else {
            toast.error(res.message);
        }
    };

    if (!email || !otp) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-400">
                        Create New Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Your account has been verified. Set your new password.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-1 block">New Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            {newPassword && (
                                <div className="mt-2 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strength: {strength.label}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-1 block">Confirm Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg shadow-teal-500/20 transform transition hover:-translate-y-1"
                        >
                            Reset Password
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

export default ResetPassword;
