import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Student'
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const { firstName, lastName, contactNumber, email, password, confirmPassword, role } = formData;

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

    const strength = checkPasswordStrength(password);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        const res = await register({ firstName, lastName, contactNumber, email, password, role });

        if (res.success) {
            toast.success('Registration successful! Please log in.');
            navigate('/login');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
            <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-400">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Join the Campus Peer Tutoring network
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-1 block">First Name</label>
                            <input
                                name="firstName"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                                placeholder="John"
                                value={firstName}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-1 block">Last Name</label>
                            <input
                                name="lastName"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                                placeholder="Doe"
                                value={lastName}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Contact Number</label>
                        <input
                            name="contactNumber"
                            type="text"
                            required
                            className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                            placeholder="+94 77 123 4567"
                            value={contactNumber}
                            onChange={onChange}
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Email address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                            placeholder="email@campus.com"
                            value={email}
                            onChange={onChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-1 block">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                value={password}
                                onChange={onChange}
                            />
                            {password && (
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
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Register as</label>
                        <select
                            name="role"
                            className="appearance-none relative block w-full px-4 py-3 border border-gray-700 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            value={role}
                            onChange={onChange}
                        >
                            <option value="Student">Student</option>
                            <option value="Host">Host (Tutor)</option>
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg shadow-teal-500/20 transform transition hover:-translate-y-1"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-teal-500 hover:text-teal-400">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
