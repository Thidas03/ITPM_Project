import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        const res = await login(email, password);
        if (res.success) {
            toast.success('Login successful!');
            navigate('/dashboard');
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff] px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-600">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-500">
                        Please enter your details to sign in
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="text-slate-600 text-sm font-medium mb-1 block">Email address</label>
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-blue-100 placeholder-slate-400 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="email@campus.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-slate-600 text-sm font-medium mb-1 block">Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-blue-100 placeholder-slate-400 text-slate-800 bg-blue-50/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-blue-200 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-500">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-500 hover:text-blue-600">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 shadow-lg shadow-blue-200 transform transition hover:-translate-y-1"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-blue-500 hover:text-blue-600">
                            Create one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
