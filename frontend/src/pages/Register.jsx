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
            toast.success('Registration successful!');
            navigate('/dashboard');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff] px-4 py-12">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-600">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Join the Campus Peer Tutoring network
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-600 text-sm font-medium mb-1 block">First Name</label>
                            <input
                                name="firstName"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-blue-100 placeholder-slate-400 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="John"
                                value={firstName}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="text-slate-600 text-sm font-medium mb-1 block">Last Name</label>
                            <input
                                name="lastName"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-blue-100 placeholder-slate-400 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="Doe"
                                value={lastName}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-600 text-sm font-medium mb-1 block">Contact Number</label>
                        <input
                            name="contactNumber"
                            type="text"
                            required
                            className="appearance-none relative block w-full px-4 py-3 border border-blue-100 placeholder-slate-400 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                            placeholder="+94 77 123 4567"
                            value={contactNumber}
                            onChange={onChange}
                        />
                    </div>
                    <div>
                        <label className="text-slate-600 text-sm font-medium mb-1 block">Email address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="appearance-none relative block w-full px-4 py-3 border border-blue-100 placeholder-slate-400 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                            placeholder="email@campus.com"
                            value={email}
                            onChange={onChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-slate-600 text-sm font-medium mb-1 block">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-blue-100 placeholder-slate-400 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                value={password}
                                onChange={onChange}
                            />
                        </div>
                        <div>
                            <label className="text-slate-600 text-sm font-medium mb-1 block">Confirm Password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-blue-100 placeholder-slate-400 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-slate-600 text-sm font-medium mb-1 block">Register as</label>
                        <select
                            name="role"
                            className="appearance-none relative block w-full px-4 py-3 border border-blue-100 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 shadow-lg shadow-blue-200 transform transition hover:-translate-y-1"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-500 hover:text-blue-600">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
