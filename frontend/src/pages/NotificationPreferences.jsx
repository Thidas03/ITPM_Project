import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const NotificationPreferences = () => {
    const { user, updateProfile } = useAuth();
    const [preferences, setPreferences] = useState({
        email: true,
        sms: false,
        push: true,
        timing: { tenMin: true, twentyMin: false, oneHour: true, oneDay: false },
        onCreation: true,
        urgentOnly: false,
        perType: { individual: true, group: true }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                if (data.success) {
                    setPreferences(data.user.notificationPreferences || preferences);
                }
            } catch (error) {
                toast.error('Failed to load preferences');
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, []);

    const onChange = (e) => {
        const { name, type, checked } = e.target;
        
        if (name.includes('.')) {
            const parts = name.split('.');
            setPreferences(prev => {
                const newData = { ...prev };
                let current = newData;
                for (let i = 0; i < parts.length - 1; i++) {
                    current[parts[i]] = { ...current[parts[i]] };
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = checked;
                return newData;
            });
        } else {
            setPreferences(prev => ({ ...prev, [name]: checked }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', { notificationPreferences: preferences });
            if (data.success) {
                toast.success('Notification preferences updated!');
                updateProfile(data.user);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-300">Notification Settings</h1>
                        <p className="mt-2 text-gray-400">Control how and when you want to be alerted.</p>
                    </div>
                    <Link to="/profile" className="text-teal-500 hover:text-teal-400 font-bold">
                        &larr; Back to Profile
                    </Link>
                </div>

                <div className="bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700 overflow-hidden p-8 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Channels & Types */}
                        <div className="space-y-8">
                            <div>
                                <p className="text-xs font-black text-teal-500 uppercase tracking-widest mb-4">Delivery Channels</p>
                                <div className="space-y-3">
                                    {['email', 'sms', 'push'].map(channel => (
                                        <label key={channel} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-2xl cursor-pointer hover:border-teal-500/50 transition">
                                            <span className="text-sm font-bold text-gray-300 capitalize">{channel} Notifications</span>
                                            <input type="checkbox" name={channel} checked={preferences[channel]} onChange={onChange} className="w-5 h-5 rounded border-gray-700 text-teal-500 bg-gray-800" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-black text-teal-500 uppercase tracking-widest mb-4">Session Types</p>
                                <div className="flex gap-4">
                                    {['individual', 'group'].map(type => (
                                        <label key={type} className="flex-1 flex items-center gap-3 p-4 bg-gray-900 border border-gray-700 rounded-2xl cursor-pointer hover:border-teal-500/50 transition">
                                            <input type="checkbox" name={`perType.${type}`} checked={preferences.perType?.[type]} onChange={onChange} className="w-5 h-5 rounded border-gray-700 text-teal-500 bg-gray-800" />
                                            <span className="text-sm font-bold text-gray-300 capitalize">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Timing & Logic */}
                        <div className="space-y-8">
                            <div>
                                <p className="text-xs font-black text-teal-500 uppercase tracking-widest mb-4">Timing Preferences</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'tenMin', label: '10 min before' },
                                        { id: 'twentyMin', label: '20 min before' },
                                        { id: 'oneHour', label: '1 hour before' },
                                        { id: 'oneDay', label: '1 day before' }
                                    ].map(timing => (
                                        <label key={timing.id} className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-700 rounded-2xl cursor-pointer hover:border-teal-500/50 transition">
                                            <input type="checkbox" name={`timing.${timing.id}`} checked={preferences.timing?.[timing.id]} onChange={onChange} className="w-5 h-5 rounded border-gray-700 text-teal-500 bg-gray-800" />
                                            <span className="text-sm font-bold text-gray-300">{timing.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs font-black text-teal-500 uppercase tracking-widest mb-4">Global Logic</p>
                                <label className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-2xl cursor-pointer hover:border-teal-500/50 transition">
                                    <span className="text-sm font-bold text-gray-300">Notify on session creation/change</span>
                                    <input type="checkbox" name="onCreation" checked={preferences.onCreation} onChange={onChange} className="w-5 h-5 rounded border-gray-700 text-teal-500 bg-gray-800" />
                                </label>
                                <label className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-2xl cursor-pointer hover:border-teal-500/50 transition">
                                    <div>
                                        <p className="text-sm font-bold text-gray-300">Urgent Changes Only</p>
                                        <p className="text-[10px] text-slate-500">Only notify for schedule changes</p>
                                    </div>
                                    <input type="checkbox" name="urgentOnly" checked={preferences.urgentOnly} onChange={onChange} className="w-5 h-5 rounded border-gray-700 text-teal-500 bg-gray-800" />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 flex border-t border-gray-700">
                        <button 
                            onClick={handleSave} 
                            disabled={saving} 
                            className={`flex-1 py-4 px-6 rounded-2xl text-white font-black uppercase tracking-widest transition shadow-xl ${saving ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-indigo-600 shadow-teal-500/20 hover:-translate-y-1'}`}
                        >
                            {saving ? 'Updating...' : 'Save Preferences'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreferences;
