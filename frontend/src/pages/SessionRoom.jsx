import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Video, Lock, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const SessionRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSessionDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/bookings/session/${sessionId}`);
                setSession(response.data.data);
            } catch (err) {
                const message = err.response?.data?.error || 'Access Denied: You must book this session first.';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchSessionDetails();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6 text-center">
                <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/20">
                    <Lock size={48} className="text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Access Restricted</h1>
                <p className="text-gray-400 max-w-md mb-8">{error}</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-bold flex items-center gap-2"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="mb-8 p-2 hover:bg-gray-800 rounded-full transition-all flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={20} /> Back to My Sessions
                </button>

                <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <Video size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-white">Join Your Session</h1>
                                <p className="text-teal-500/20 bg-white/10 px-3 py-1 rounded-full text-sm inline-block mt-2 font-bold text-white">Confirmed Booking</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-700">
                                <Calendar className="text-teal-500 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Time Slot</p>
                                    <p className="text-xl font-bold text-white">{session.startTime} - {session.endTime}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-6 bg-gray-900/50 rounded-2xl border border-gray-700">
                                <Lock className="text-indigo-500 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Meeting Password</p>
                                    <p className="text-xl font-bold text-white select-all">{session.password}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-700">
                            <h3 className="text-lg font-bold text-white mb-4">Launch Session</h3>
                            <a 
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center py-5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all transform hover:-translate-y-1"
                            >
                                Open Zoom Meeting
                            </a>
                            <p className="text-center text-gray-500 mt-6 text-sm">
                                Having trouble? Contact your tutor directly or reach out to support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionRoom;
