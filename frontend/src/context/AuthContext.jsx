import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // User data is already in localStorage, let's load it
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (savedUser) {
                setUser(savedUser);
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
