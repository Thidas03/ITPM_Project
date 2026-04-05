import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentBookings } from '../features/bookings/services/bookingService';

const Profile = () => {
    const { updateProfile } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        profilePicture: null,
        badges: [],
        is2FAEnabled: false,
        notificationPreferences: {
            email: true,
            sms: false,
            push: true
        },
        tutorRequestStatus: 'none',
        misconductCount: 0,
        averageRating: 5.0,
        role: 'Student'
    });
    const [trustData, setTrustData] = useState({
        trustLevel: 'Medium',
        trustPercentage: 75,
        bookingLimit: 2,
        stats: { attended: 0, missed: 0, cancellations: 0, attendanceRate: 0 },
        badges: []
    });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                if (data.success) {
                    setFormData({
                        firstName: data.user.firstName,
                        lastName: data.user.lastName,
                        email: data.user.email,
                        contactNumber: data.user.contactNumber || '',
                        profilePicture: data.user.profilePicture,
                        role: data.user.role,
                        badges: data.user.badges || [],
                        is2FAEnabled: data.user.is2FAEnabled,
                        notificationPreferences: data.user.notificationPreferences || { email: true, sms: false, push: true },
                        tutorRequestStatus: data.user.tutorRequestStatus || 'none',
                        misconductCount: data.user.misconductCount || 0,
                        averageRating: data.user.averageRating || 5.0,
                        identityNumber: data.user.identityNumber
                    });
                }

                const trustRes = await api.get('/auth/profile/trust');
                if (trustRes.data.success) {
                    setTrustData(trustRes.data);
                }

                const bookingRes = await getStudentBookings();
                // getStudentBookings returns the data directly based on the service implementation
                if (bookingRes && bookingRes.bookings) {
                    setBookings(bookingRes.bookings);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmitProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', formData);
            if (data.success) {
                toast.success('Profile updated successfully!');
                updateProfile(data.user);
                setFormData(prev => ({ ...prev, ...data.user }));
                setIsEditing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleRoleUpgrade = async () => {
        try {
            const { data } = await api.post('/auth/request-host');
            if (data.success) {
                toast.success(data.message);
                setFormData({ ...formData, tutorRequestStatus: 'pending' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to request role upgrade');
            if (error.response?.data?.reasons) {
                error.response.data.reasons.forEach(r => toast.error(r));
            }
        }
    };

    const handleToggle2FA = async () => {
        try {
            const { data } = await api.post('/auth/toggle-2fa');
            if (data.success) {
                setFormData({ ...formData, is2FAEnabled: data.is2FAEnabled });
                toast.success(data.message);
                updateProfile({ is2FAEnabled: data.is2FAEnabled });
            }
        } catch (error) {
            toast.error('Failed to toggle 2FA');
        }
    };

    const handleNotificationToggle = async (type) => {
        const updatedPrefs = {
            ...formData.notificationPreferences,
            [type]: !formData.notificationPreferences[type]
        };
        try {
            const { data } = await api.put('/auth/profile', { notificationPreferences: updatedPrefs });
            if (data.success) {
                setFormData(prev => ({ ...prev, notificationPreferences: updatedPrefs }));
                updateProfile({ notificationPreferences: updatedPrefs });
                toast.success(`${type.toUpperCase()} alerts ${updatedPrefs[type] ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            toast.error('Failed to update preferences');
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const sections = [
        { id: 'overview', label: 'Overview', icon: '👤' },
        { id: 'activity', label: 'Activity & Sessions', icon: '📈' },
        { id: 'trust', label: 'Trust & Access', icon: '🛡️' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight italic">MY PROFILE</h1>
                        <p className="mt-2 text-gray-400 font-medium tracking-tight">Configure your campus identity and security preferences.</p>
                    </div>
                    <Link to="/dashboard" className="w-fit px-6 py-2.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 rounded-2xl font-bold transition flex items-center gap-2">
                        ← Back to Hub
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-2">
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-4 sticky top-12 shadow-2xl shadow-black/50">
                            {sections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeSection === section.id ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-xl translate-x-2' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                                >
                                    <span className="text-xl">{section.icon}</span>
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        {/* 1. Profile Overview */}
                        {activeSection === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-10 overflow-hidden relative shadow-2xl shadow-black/50">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] -mr-32 -mt-32"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -ml-32 -mb-32"></div>

                                    <div className="relative flex flex-col md:flex-row items-start md:items-center gap-10">
                                        <div className="relative group">
                                            <div className="w-40 h-40 rounded-full border-4 border-gray-800 shadow-2xl overflow-hidden bg-gray-900">
                                                {formData.profilePicture ? (
                                                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-indigo-500/20 flex items-center justify-center text-6xl font-black text-teal-500">
                                                        {formData.firstName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <label className="absolute bottom-1 right-1 bg-white text-gray-900 p-3 rounded-full cursor-pointer shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            </label>
                                        </div>

                                        <div className="flex-1 w-full">
                                            {!isEditing ? (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-white">{formData.firstName} {formData.lastName}</h2>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                                                            <p className="text-teal-400 font-black tracking-tight uppercase text-[10px]">{formData.role} Account Status</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-800/50">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Electronic Mail</p>
                                                            <p className="text-gray-200 font-bold">{formData.email}</p>
                                                        </div>
                                                        <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-800/50">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mobile Connection</p>
                                                            <p className="text-gray-200 font-bold">{formData.contactNumber || 'Not configured'}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setIsEditing(true)}
                                                        className="px-8 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-black rounded-2xl shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-widest text-xs"
                                                    >
                                                        Edit Global Profile
                                                    </button>
                                                </div>
                                            ) : (
                                                <form onSubmit={onSubmitProfile} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">First Name</label>
                                                            <input type="text" name="firstName" value={formData.firstName} onChange={onChange} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition shadow-inner" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Last Name</label>
                                                            <input type="text" name="lastName" value={formData.lastName} onChange={onChange} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition shadow-inner" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                                            <input type="email" name="email" value={formData.email} onChange={onChange} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition shadow-inner" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Contact Number</label>
                                                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={onChange} required className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition shadow-inner" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button type="submit" disabled={saving} className="flex-1 py-4 px-6 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-2xl text-white font-black uppercase tracking-widest transition shadow-xl disabled:bg-gray-700">
                                                            {saving ? 'Syncing...' : 'Confirm Sync'}
                                                        </button>
                                                        <button type="button" onClick={() => setIsEditing(false)} className="px-10 py-4 bg-gray-800 border border-gray-700 text-gray-400 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-700 transition">
                                                            Discard
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Activity & Sessions */}
                        {activeSection === 'activity' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 text-center shadow-xl">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Attendance</p>
                                        <p className="text-3xl font-black text-teal-500">{trustData.stats.attendanceRate}%</p>
                                    </div>
                                    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 text-center shadow-xl">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Attended</p>
                                        <p className="text-3xl font-black text-green-500">{trustData.stats.attended}</p>
                                    </div>
                                    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 text-center shadow-xl">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Missed</p>
                                        <p className="text-3xl font-black text-red-500">{trustData.stats.missed}</p>
                                    </div>
                                    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 text-center shadow-xl">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Cancelled</p>
                                        <p className="text-3xl font-black text-amber-500">{trustData.stats.cancellations}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-teal-500 rounded-full"></span>
                                            Full Session History
                                        </h3>
                                        <Link to="/my-sessions" className="text-xs font-bold text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-4 py-2 rounded-xl transition-colors border border-teal-500/20">
                                            View Extended History ↗
                                        </Link>
                                    </div>

                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {bookings.length === 0 ? (
                                            <div className="py-20 text-center bg-gray-950 border border-dashed border-gray-800 rounded-[2rem]">
                                                <p className="text-gray-500 italic font-medium">No archived sessions found in your history.</p>
                                            </div>
                                        ) : (
                                            bookings.map(booking => (
                                                <div key={booking._id} className="bg-gray-950 p-6 rounded-[2rem] border border-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-teal-500/30 transition-all">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center group-hover:scale-105 transition-transform">
                                                            <p className="text-[10px] font-black text-teal-500 uppercase">{new Date(booking.session.date).toLocaleString('default', { month: 'short' })}</p>
                                                            <p className="text-xl font-black text-white leading-none">{new Date(booking.session.date).getDate()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-white uppercase group-hover:text-teal-400 transition-colors">{booking.session.startTime} - {booking.session.endTime}</p>
                                                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">Hosted by {booking.session.tutor.firstName} {booking.session.tutor.lastName}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${booking.status === 'completed' ? (booking.attended ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20') : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                                            {booking.status === 'completed' ? (booking.attended ? 'Attended' : 'Missed') : booking.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Trust & Access Control */}
                        {activeSection === 'trust' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">🛡️</div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Trust Reputation Quotient</p>
                                        <div className="flex items-end gap-4 mb-4">
                                            <p className="text-7xl font-black text-white">{trustData.trustPercentage}%</p>
                                            <p className={`text-sm font-black uppercase mb-3 ${trustData.trustLevel === 'High' ? 'text-green-400' : trustData.trustLevel === 'Medium' ? 'text-teal-400' : 'text-red-400'}`}>{trustData.trustLevel} STATUS</p>
                                        </div>
                                        <div className="h-5 w-full bg-gray-950 rounded-full border border-gray-800 overflow-hidden mb-6 shadow-inner">
                                            <div
                                                className={`h-full transition-all duration-1000 ${trustData.trustLevel === 'High' ? 'bg-gradient-to-r from-green-500 to-teal-500' : trustData.trustLevel === 'Medium' ? 'bg-gradient-to-r from-teal-400 to-indigo-500' : 'bg-red-500'}`}
                                                style={{ width: `${trustData.trustPercentage}%` }}
                                            />
                                        </div>
                                        <div className="p-5 bg-gray-950/50 border border-gray-800 rounded-2xl">
                                            <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                                                {trustData.trustLevel === 'High'
                                                    ? "System Insight: Elite standing verified. Unconditional session access granted."
                                                    : trustData.trustLevel === 'Medium'
                                                        ? "System Insight: Reputation is stable. Maintain consistency to unlock higher priority slots."
                                                        : "System Insight: High-risk status detected. Some booking capabilities have been throttled."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6 flex items-center justify-between shadow-xl">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Booking Slot Capacity</p>
                                                <p className="text-3xl font-black text-white">{trustData.bookingLimit} Concurrency</p>
                                            </div>
                                            <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-3xl">📅</div>
                                        </div>
                                        <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6 flex items-center justify-between shadow-xl">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dynamic Risk Profile</p>
                                                <p className={`text-3xl font-black uppercase ${trustData.trustLevel === 'High' ? 'text-green-500' : trustData.trustLevel === 'Medium' ? 'text-blue-500' : 'text-red-500'}`}>{trustData.trustLevel === 'Low' ? 'Restricted' : trustData.trustLevel}</p>
                                            </div>
                                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-3xl">⚡</div>
                                        </div>
                                        <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6 shadow-xl">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Accredited Attendance Badges</p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.badges.length > 0 ? (
                                                    formData.badges.map((badge, i) => (
                                                        <span key={i} className="px-4 py-2 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded-xl uppercase border border-amber-500/20 shadow-sm">
                                                            {badge}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-gray-700 font-bold italic py-2">No verification badges issued yet.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] -mr-48 -mt-48"></div>
                                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
                                        <div className="flex-1 space-y-6">
                                            <div>
                                                <h3 className="text-3xl font-black text-white italic">ROLE UPGRADE ELIGIBILITY</h3>
                                                <p className="text-gray-400 font-medium mt-2 leading-relaxed">Hosts are recognized campus leaders. Maintain elite standing to unlock the ability to lead peer-to-peer sessions.</p>
                                            </div>

                                            {formData.role === 'Host' || formData.role === 'Admin' ? (
                                                <div className="p-6 bg-teal-500/10 border border-teal-500/30 rounded-[2rem] text-teal-400 font-black flex items-center gap-4 shadow-lg shadow-teal-500/5">
                                                    <span className="text-2xl">⚡</span> YOU ARE ALREADY VERIFIED AS {formData.role.toUpperCase()}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {[
                                                        { label: 'Trust Percentage > 75%', met: trustData.trustPercentage > 75 },
                                                        { label: 'Attended Sessions >= 5', met: trustData.stats.attended >= 5 },
                                                        { label: 'Clean Conduct Record', met: formData.misconductCount === 0 },
                                                        { label: 'Reputation Rating > 4.0', met: formData.averageRating > 4.0 }
                                                    ].map((req, i) => (
                                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-2xl group hover:border-gray-700 transition-all">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{req.label}</span>
                                                            <span className={`text-sm ${req.met ? 'text-green-500' : 'text-red-500'}`}>{req.met ? '✓' : '✗'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {formData.role !== 'Host' && formData.role !== 'Admin' && (
                                                <button
                                                    onClick={handleRoleUpgrade}
                                                    disabled={formData.tutorRequestStatus === 'pending' || !(trustData.trustPercentage > 75 && trustData.stats.attended >= 5 && formData.misconductCount === 0 && formData.averageRating > 4.0)}
                                                    className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl ${formData.tutorRequestStatus === 'pending' ? 'bg-amber-500/20 text-amber-500 cursor-not-allowed' : (trustData.trustPercentage > 75 && trustData.stats.attended >= 5 && formData.misconductCount === 0 && formData.averageRating > 4.0 ? 'bg-white text-gray-900 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-800 text-gray-600 cursor-not-allowed')}`}
                                                >
                                                    {formData.tutorRequestStatus === 'pending' ? 'Application Under Review' : 'Initiate Upgrade Request'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="hidden lg:block">
                                            <div className="w-56 h-56 bg-gray-950 rounded-[3rem] flex items-center justify-center border-4 border-gray-800 shadow-2xl relative group">
                                                <div className="absolute inset-4 bg-gradient-to-br from-teal-500/20 to-indigo-500/20 rounded-[2rem] blur-xl group-hover:scale-125 transition-transform"></div>
                                                <span className="text-7xl realtive">🎓</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Settings & Notifications */}
                        {activeSection === 'settings' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-10 shadow-2xl space-y-10">
                                        <div>
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                                                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                                                ACCESS & PRIVACY
                                            </h3>
                                            <div className="space-y-4">
                                                <button
                                                    onClick={handleToggle2FA}
                                                    className="w-full flex items-center justify-between p-6 bg-gray-950 border border-gray-800 rounded-[2rem] hover:border-teal-500/50 transition-all group shadow-inner"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-white mb-1">Enhanced 2FA Protection</p>
                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${formData.is2FAEnabled ? 'text-teal-500' : 'text-gray-500'}`}>{formData.is2FAEnabled ? 'System Shield Active' : 'Shield Inactive'}</p>
                                                    </div>
                                                    <div className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.is2FAEnabled ? 'bg-teal-500' : 'bg-gray-800'}`}>
                                                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${formData.is2FAEnabled ? 'translate-x-[1.5rem]' : 'translate-x-0'} shadow-lg`} />
                                                    </div>
                                                </button>

                                                <Link
                                                    to="/notification-preferences"
                                                    className="w-full flex items-center justify-between p-6 bg-gray-950 border border-gray-800 rounded-[2rem] hover:border-indigo-500/50 transition-all group shadow-inner"
                                                >
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-white mb-1">Alert Configurations</p>
                                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Multi-Channel Delivery Specs</p>
                                                    </div>
                                                    <div className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                                        <span className="text-sm">→</span>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-10 shadow-2xl flex flex-col justify-center">
                                        <div className="mb-8 text-center border-b border-gray-800 pb-6">
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2 flex items-center justify-center gap-3">
                                                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                                                SYSTEM NOTIFICATIONS
                                            </h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Toggle your alert preferences</p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {[
                                                { id: 'email', label: 'Email Alerts', sub: 'Receive session updates via inbox', color: 'indigo' },
                                                { id: 'sms', label: 'SMS Texting', sub: 'Instant mobile phone updates', color: 'amber' },
                                                { id: 'push', label: 'Push Logic', sub: 'Browser and device notifications', color: 'emerald' }
                                            ].map(pref => (
                                                <button 
                                                    key={pref.id}
                                                    onClick={() => handleNotificationToggle(pref.id)}
                                                    className={`w-full flex items-center justify-between p-5 bg-gray-950 border border-gray-800 rounded-[2rem] hover:border-${pref.color}-500/50 transition-all group shadow-inner`}
                                                >
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-white mb-1 group-hover:text-white/90 transition-colors">{pref.label}</p>
                                                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{pref.sub}</p>
                                                    </div>
                                                    <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${formData.notificationPreferences?.[pref.id] ? `bg-${pref.color}-500` : 'bg-gray-800'}`}>
                                                        <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${formData.notificationPreferences?.[pref.id] ? 'translate-x-[1.5rem]' : 'translate-x-0'} shadow-lg`} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1f2937;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #374151;
                }
            ` }} />
        </div>
    );
};

export default Profile;
