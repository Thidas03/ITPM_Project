import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, googleLogin } = useAuth();
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

    const handleGoogleSuccess = async (credentialResponse) => {
        const res = await googleLogin(credentialResponse.credential);
        if (res.success) {
            toast.success('Google Login successful!');
            navigate('/dashboard');
        } else {
            toast.error(res.message);
        }
    };

    const handleGoogleError = () => {
        toast.error('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 p-10 bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-400">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Please enter your details to sign in
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
                        <div>
                            <label className="text-gray-400 text-sm font-medium mb-1 block">Password</label>
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 placeholder-gray-500 text-gray-300 bg-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
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
                                className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-gray-600 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link to="/forgot-password" title="Click to reset password" id="forgot-password-link" className="font-medium text-teal-500 hover:text-teal-400">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg shadow-teal-500/20 transform transition hover:-translate-y-1"
                        >
                            Sign in
                        </button>
                    </div>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-gray-800 text-gray-400 font-medium">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        shape="pill"
                        theme="outline"
                        width="100%"
                    />
                </div>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-teal-500 hover:text-teal-400">
                            Create one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
