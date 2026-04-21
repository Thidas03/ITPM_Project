import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // User data is already in sessionStorage, let's load it
            const savedUser = JSON.parse(sessionStorage.getItem('user'));
            if (savedUser) {
                setUser(savedUser);
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            if (data.requires2FA) {
                return { success: true, requires2FA: true, userId: data.userId, message: data.message };
            }

            setUser(data.user);
            setToken(data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const verify2FA = async (userId, otp) => {
        try {
            const { data } = await api.post('/auth/verify-2fa', { userId, otp });
            setUser(data.user);
            setToken(data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid or expired OTP'
            };
        }
    };

    const googleLogin = async (tokenId) => {
        try {
            const { data } = await api.post('/auth/google', { tokenId });
            setUser(data.user);
            setToken(data.token);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Google login failed'
            };
        }
    };

    const forgotPasswordOTP = async (email) => {
        try {
            const { data } = await api.post('/auth/forgot-password-otp', { email });
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP'
            };
        }
    };

    const verifyResetOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid or expired OTP'
            };
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Password reset failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            if (data.requiresRegistrationOTP) {
                return { success: true, requiresRegistrationOTP: true, userId: data.userId };
            }
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const verifyRegistrationOTP = async (userId, otp) => {
        try {
            const { data } = await api.post('/auth/verify-registration-otp', { userId, otp });
            return { success: true, message: data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Invalid or expired OTP'
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    const updateProfile = (updatedUserData) => {
        const newUser = { ...user, ...updatedUserData };
        setUser(newUser);
        sessionStorage.setItem('user', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, verify2FA, verifyRegistrationOTP, googleLogin, forgotPasswordOTP, verifyResetOTP, resetPassword, register, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
