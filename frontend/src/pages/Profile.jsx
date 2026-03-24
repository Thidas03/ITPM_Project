import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { updateProfile } = useAuth();
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Toggle state
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
                        profilePicture: data.user.profilePicture,
                        role: data.user.role,
                        badges: data.user.badges || [],
                        is2FAEnabled: data.user.is2FAEnabled,
                        notificationPreferences: data.user.notificationPreferences || {
                            email: true,
                            sms: false,
                            push: true
                        },
                        tutorRequestStatus: data.user.tutorRequestStatus || 'none',
                        misconductCount: data.user.misconductCount || 0,
                        averageRating: data.user.averageRating || 5.0
                    });
                }

                const trustRes = await api.get('/auth/profile/trust');
                if (trustRes.data.success) {
                    setTrustData(trustRes.data);
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

    const onSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', formData);
            if (data.success) {
                toast.success('Profile updated successfully!');
                updateProfile(data.user); // Update Global State
                setIsEditing(false); // Switch back to view mode
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-300">My Profile</h1>
                        <p className="mt-2 text-gray-400">Manage your campus identity and preferences.</p>
                    </div>
                    <Link to="/dashboard" className="text-teal-500 hover:text-teal-400 font-bold flex items-center gap-1">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Short version/Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700 p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                            <div className="relative mt-4">
                                <div className="relative inline-block group">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-800 mb-4 mx-auto">
                                        {formData.profilePicture ? (
                                            <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-teal-500/20 flex items-center justify-center text-4xl font-bold text-teal-500">
                                                {formData.firstName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-2 right-0 bg-gradient-to-r from-teal-500 to-indigo-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:from-teal-400 hover:to-indigo-500 transition transform hover:scale-110">
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                        📷
                                    </label>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-300">{formData.firstName} {formData.lastName}</h2>
                                <p className="text-teal-500 font-medium mb-4">{formData.email}</p>

                                <div className="space-y-4 text-left border-t border-slate-100 pt-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📞</span>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Phone</p>
                                            <p className="text-gray-300 font-medium">{formData.contactNumber || 'Not set'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🏅</span>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Badges</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {formData.badges.length > 0 ? (
                                                    formData.badges.map((badge, i) => (
                                                        <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase">
                                                            {badge}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">No badges yet</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700 p-6">
                            <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full"></span>
                                Trust Insights
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-400">TRUST SCORE</span>
                                        <span className={trustData.trustPercentage > 80 ? 'text-green-500' : trustData.trustPercentage > 50 ? 'text-teal-500' : 'text-red-500'}>
                                            {trustData.trustPercentage}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${trustData.trustLevel === 'High' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : trustData.trustLevel === 'Medium' ? 'bg-gradient-to-r from-teal-500 to-indigo-600' : 'bg-red-500'}`}
                                            style={{ width: `${trustData.trustPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="p-3 bg-teal-500/10/50 rounded-xl border border-gray-700/50">
                                    <p className="text-[11px] text-gray-400 leading-relaxed italic">
                                        {trustData.trustLevel === 'High'
                                            ? "You're a star! High trust unlocks maximum booking freedom."
                                            : trustData.trustLevel === 'Medium'
                                                ? "Good standing. Keep attending sessions to reach High Trust."
                                                : "Notice: Low attendance has restricted your account features."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
                            <h3 className="text-sm font-bold mb-4 opacity-80 flex items-center gap-2">
                                🛡️ Dynamic Access
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs opacity-60">Booking Capacity</span>
                                    <span className="text-sm font-bold bg-gray-800/20 px-2 py-0.5 rounded-lg">{trustData.bookingLimit} Slots</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs opacity-60">Risk Profile</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${trustData.trustLevel === 'High' ? 'bg-gradient-to-r from-amber-500 to-orange-600/20 text-green-400' : trustData.trustLevel === 'Medium' ? 'bg-gradient-to-r from-teal-500 to-indigo-600/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {trustData.trustLevel === 'Low' ? 'Restricted' : trustData.trustLevel}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Role Upgrade Section */}
                        <div className="bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700 p-6 mt-6">
                            <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                                🎓 Role Upgrade
                            </h3>
                            {formData.role === 'Host' || formData.role === 'Admin' ? (
                                <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/30 text-teal-400 text-sm font-bold text-center">
                                    You already have Host privileges.
                                </div>
                            ) : formData.tutorRequestStatus === 'pending' ? (
                                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-500 text-sm font-bold text-center">
                                    Host request pending admin approval.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2 text-xs font-medium">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Trust &gt; 75%</span>
                                            {trustData.trustPercentage > 75 ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌ ({trustData.trustPercentage}%)</span>}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Sessions &gt;= 5</span>
                                            {trustData.stats.attended >= 5 ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌ ({trustData.stats.attended})</span>}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">No Misconducts</span>
                                            {formData.misconductCount === 0 ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌ ({formData.misconductCount})</span>}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Rating &gt; 4.0</span>
                                            {formData.averageRating > 4.0 ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌ ({formData.averageRating})</span>}
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleRoleUpgrade}
                                        disabled={!(trustData.trustPercentage > 75 && trustData.stats.attended >= 5 && formData.misconductCount === 0 && formData.averageRating > 4.0)}
                                        className={`w-full py-3 rounded-xl font-bold transition shadow-lg text-sm ${trustData.trustPercentage > 75 && trustData.stats.attended >= 5 && formData.misconductCount === 0 && formData.averageRating > 4.0 ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-400 hover:to-indigo-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        Request Host Role
                                    </button>
                                    {!(trustData.trustPercentage > 75 && trustData.stats.attended >= 5 && formData.misconductCount === 0 && formData.averageRating > 4.0) && (
                                        <p className="text-[10px] text-center text-red-400 font-medium">
                                            You must meet all eligibility criteria to apply.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Risk-Based Metrics Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Attendance', value: `${trustData.stats.attendanceRate}%`, color: 'blue' },
                                { label: 'Attended', value: trustData.stats.attended, color: 'green' },
                                { label: 'Missed', value: trustData.stats.missed, color: 'red' },
                                { label: 'Canceled', value: trustData.stats.cancellations, color: 'amber' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-gray-800 p-4 rounded-3xl border border-gray-700 shadow-sm text-center">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                                    <p className={`text-xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700 overflow-hidden">
                            <form onSubmit={onSubmit} className="p-8 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-gray-300 mb-6 flex items-center gap-2">
                                    </h2>

                                    {!isEditing ? (
                                        // View Mode: Display Info
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="p-4 bg-teal-500/10/50 rounded-2xl border border-gray-700/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                                                    <p className="text-lg font-bold text-gray-300">{formData.firstName} {formData.lastName}</p>
                                                </div>
                                                <div className="p-4 bg-teal-500/10/50 rounded-2xl border border-gray-700/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                                    <p className="text-lg font-bold text-gray-300">{formData.email}</p>
                                                </div>
                                                <div className="p-4 bg-teal-500/10/50 rounded-2xl border border-gray-700/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                                                    <p className="text-lg font-bold text-gray-300">{formData.contactNumber || 'Not provided'}</p>
                                                </div>
                                                <div className="p-4 bg-teal-500/10/50 rounded-2xl border border-gray-700/50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Role</p>
                                                    <p className="text-lg font-bold text-teal-400">{formData.role || 'User'}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(true)}
                                                    className="px-8 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
                                                >
                                                    Edit Profile Details
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Edit Mode: Display Form
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={onChange}
                                                        required
                                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={onChange}
                                                        required
                                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={onChange}
                                                        required
                                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-400 mb-2">Contact Number</label>
                                                    <input
                                                        type="text"
                                                        name="contactNumber"
                                                        value={formData.contactNumber}
                                                        onChange={onChange}
                                                        required
                                                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-gray-700">
                                                <h2 className="text-xl font-bold text-gray-300 mb-6 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">🔔</span>
                                                    Notification Preferences
                                                </h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl border border-gray-700 cursor-pointer hover:border-blue-400 transition">
                                                        <span className="text-gray-300 font-medium">Email</span>
                                                        <input type="checkbox" name="notif_email" checked={formData.notificationPreferences.email} onChange={onChange} className="w-5 h-5 rounded text-teal-500" />
                                                    </label>
                                                    <label className="flex items-center justify-between p-4 bg-gray-800/50 rounded-2xl border border-gray-700 cursor-pointer hover:border-blue-400 transition">
                                                        <span className="text-gray-300 font-medium">SMS</span>
                                                        <input type="checkbox" name="notif_sms" checked={formData.notificationPreferences.sms} onChange={onChange} className="w-5 h-5 rounded text-teal-500" />
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="pt-8 flex gap-4">
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className={`flex-1 py-4 px-6 rounded-2xl text-white font-bold transition transform hover:-translate-y-1 shadow-lg shadow-teal-500/20 ${saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500'}`}
                                                >
                                                    {saving ? 'Saving Changes...' : 'Save All Settings'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="px-6 py-4 bg-gray-800 hover:bg-slate-200 text-gray-400 font-bold rounded-2xl transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </section>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
