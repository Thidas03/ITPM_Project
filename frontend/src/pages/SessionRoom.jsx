import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Video, Lock, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import SessionChat from '../features/chat/components/SessionChat';
import { useAuth } from '../context/AuthContext';

const SessionRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const backPath =
        user?.role === 'Host' || user?.role === 'Tutor'
            ? '/dashboard/tutor'
            : user?.role === 'Student'
                ? '/dashboard/student'
                : '/dashboard';

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

    const handleStartSession = async () => {
        try {
            const response = await api.put(`/sessions/${sessionId}/start`);
            setSession({ ...session, status: 'active', startedAt: response.data.data.startedAt });
            toast.success('Session started! Students can now join.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start session');
        }
    };

    const handleEndSession = async () => {
        try {
            const response = await api.put(`/sessions/${sessionId}/end`);
            setSession({ ...session, status: 'completed', endedAt: response.data.data.endedAt });
            toast.success('Session ended.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to end session');
        }
    };

    const handleJoinSession = async () => {
        try {
            const response = await api.post(`/bookings/session/${sessionId}/join`);
            setSession({ ...session, joinTime: response.data.data.joinTime });
            toast.success('Joined session! Your attendance is being tracked.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join session');
        }
    };

    const handleLeaveSession = async () => {
        try {
            const response = await api.post(`/bookings/session/${sessionId}/leave`);
            setSession({ 
                ...session, 
                leaveTime: response.data.data.booking.leaveTime,
                attendanceStatus: response.data.data.booking.attendanceStatus 
            });
            toast.info(`You left the session. Attendance: ${response.data.data.booking.attendanceStatus}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to leave session');
        }
    };


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
                    onClick={() => navigate(backPath)}
                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all font-bold flex items-center gap-2"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 font-sans p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <button 
                    onClick={() => navigate(backPath)}
                    className="mb-5 p-2 hover:bg-gray-800 rounded-full transition-all flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={20} /> Back to My Sessions
                </button>

                <div className="bg-gray-800 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-6 md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <Video size={26} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Join Your Session</h1>
                                <p className="text-teal-500/20 bg-white/10 px-3 py-1 rounded-full text-sm inline-block mt-2 font-bold text-white">Confirmed Booking</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-2xl border border-gray-700">
                                <Calendar className="text-teal-500 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Time Slot</p>
                                    <p className="text-lg font-bold text-white">{session.startTime} - {session.endTime}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-2xl border border-gray-700">
                                <Lock className="text-indigo-500 mt-1" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Meeting Password</p>
                                    <p className="text-lg font-bold text-white select-all">{session.password}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-5 border-t border-gray-700">
                            <h3 className="text-base font-bold text-white mb-3">
                                {user?.role === 'Host' || user?.role === 'Tutor' ? 'Host Controls' : 'Attendance'}
                            </h3>
                            
                            {/* Host Controls */}
                            {(user?.role === 'Host' || user?.role === 'Tutor') && (
                                <div className="space-y-4">
                                    {session.status !== 'active' && session.status !== 'completed' && (
                                        <button
                                            onClick={handleStartSession}
                                            className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1"
                                        >
                                            Start Session
                                        </button>
                                    )}
                                    {session.status === 'active' && (
                                        <button
                                            onClick={handleEndSession}
                                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1"
                                        >
                                            End Session
                                        </button>
                                    )}
                                    {session.status === 'completed' && (
                                        <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700 text-center">
                                            <p className="text-gray-400 font-bold">Session Completed</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Student Controls */}
                            {user?.role === 'Student' && (
                                <div className="space-y-4">
                                    {session.status !== 'active' && !session.joinTime && (
                                        <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700 text-center">
                                            <p className="text-gray-400 italic font-medium">Waiting for host to start the session...</p>
                                        </div>
                                    )}

                                    {session.status === 'active' && !session.joinTime && (
                                        <button
                                            onClick={handleJoinSession}
                                            className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-black text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1"
                                        >
                                            Join Session
                                        </button>
                                    )}

                                    {session.joinTime && !session.leaveTime && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-teal-900/20 rounded-2xl border border-teal-500/30 text-center">
                                                <p className="text-teal-400 font-bold">You are in the session</p>
                                                <p className="text-xs text-teal-500/60 mt-1 uppercase tracking-widest">Attendance is being tracked</p>
                                            </div>
                                            <button
                                                onClick={handleLeaveSession}
                                                className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg rounded-2xl shadow-lg transition-all"
                                            >
                                                Leave Session
                                            </button>
                                        </div>
                                    )}

                                    {session.leaveTime && (
                                        <div className={`p-4 rounded-2xl border text-center ${
                                            session.attendanceStatus === 'attended' 
                                            ? 'bg-green-900/20 border-green-500/30 text-green-400' 
                                            : 'bg-red-900/20 border-red-500/30 text-red-400'
                                        }`}>
                                            <p className="font-black text-xl uppercase tracking-wider">{session.attendanceStatus}</p>
                                            <p className="text-xs mt-1 opacity-60">Based on time spent in session (70% threshold)</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 pt-5 border-t border-gray-700">
                                <h3 className="text-base font-bold text-white mb-3">Launch Meeting</h3>
                                <a 
                                    href={session.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block w-full text-center py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 ${
                                        user?.role === 'Student' && !session.joinTime ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                                >
                                    Open Jitsi Meet
                                </a>
                                {user?.role === 'Student' && !session.joinTime && (
                                    <p className="text-center text-red-500 mt-2 text-xs font-bold">
                                        Please click "Join Session" to enable the meeting link and track attendance.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="pt-5 border-t border-gray-700">
                            <h3 className="text-base font-bold text-white mb-3">Chat</h3>
                            <SessionChat sessionId={sessionId} heightClass="h-[380px]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionRoom;
