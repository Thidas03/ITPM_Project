import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        notificationPreferences: {
            email: true,
            sms: false,
            push: true
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                if (data.success) {
                    setFormData({
                        firstName: data.user.firstName,
                        lastName: data.user.lastName,
                        email: data.user.email,
                        contactNumber: data.user.contactNumber || '',
                        notificationPreferences: data.user.notificationPreferences || {
                            email: true,
                            sms: false,
                            push: true
                        }
                    });
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('notif_')) {
            const prefs = { ...formData.notificationPreferences };
            prefs[name.replace('notif_', '')] = checked;
            setFormData({ ...formData, notificationPreferences: prefs });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', formData);
            if (data.success) {
                toast.success('Profile updated successfully!');
                // Update local storage user data
                const user = JSON.parse(localStorage.getItem('user'));
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0f9ff] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f9ff] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">Profile Settings</h1>
                        <p className="mt-2 text-slate-500">Manage your personal information and preferences.</p>
                    </div>
                    <Link to="/dashboard" className="text-blue-500 hover:text-blue-600 font-bold">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 overflow-hidden">
                    <form onSubmit={onSubmit} className="p-8 space-y-8">
                        {/* Personal Info Section */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    👤
                                </span>
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Contact Number</label>
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={onChange}
                                        required
                                        className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-blue-50" />

                        {/* Notification Prefs Section */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    🔔
                                </span>
                                Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100 cursor-pointer hover:border-blue-400 transition">
                                    <div>
                                        <span className="block text-slate-800 font-medium">Email Notifications</span>
                                        <span className="block text-sm text-slate-500">Receive session reminders and updates via email.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="notif_email"
                                        checked={formData.notificationPreferences.email}
                                        onChange={onChange}
                                        className="w-6 h-6 rounded-md border-blue-200 text-blue-500 focus:ring-blue-400"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100 cursor-pointer hover:border-blue-400 transition shadow-sm">
                                    <div>
                                        <span className="block text-slate-800 font-medium">SMS Notifications</span>
                                        <span className="block text-sm text-slate-500">Get text messages for last-minute booking changes.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="notif_sms"
                                        checked={formData.notificationPreferences.sms}
                                        onChange={onChange}
                                        className="w-6 h-6 rounded-md border-blue-200 text-blue-500 focus:ring-blue-400"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100 cursor-pointer hover:border-blue-400 transition">
                                    <div>
                                        <span className="block text-slate-800 font-medium">Push Notifications</span>
                                        <span className="block text-sm text-slate-500">Stay updated with real-time app notifications.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="notif_push"
                                        checked={formData.notificationPreferences.push}
                                        onChange={onChange}
                                        className="w-6 h-6 rounded-md border-blue-200 text-blue-500 focus:ring-blue-400"
                                    />
                                </label>
                            </div>
                        </section>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className={`w-full py-4 px-6 rounded-2xl text-white font-bold transition transform hover:-translate-y-1 shadow-lg shadow-blue-200 ${saving
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Saving Changes...
                                    </span>
                                ) : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
