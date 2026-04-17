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
    const [isJoined, setIsJoined] = useState(false);
    const [joining, setJoining] = useState(false);
    
    const backPath =
        user?.role === 'Host' || user?.role === 'Tutor'
            ? '/dashboard/tutor'
            : user?.role === 'Student'
                ? '/dashboard/student'
                : '/dashboard';

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

    useEffect(() => {
        fetchSessionDetails();
    }, [sessionId]);

    const handleStartSession = async () => {
        try {
            await api.patch(`/sessions/${sessionId}/start`);
            toast.success('Session started! Students can now join.');
            fetchSessionDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start session');
        }
    };

    const handleJoinSession = async () => {
        try {
            setJoining(true);
            await api.patch(`/bookings/session/${sessionId}/join`);
            setIsJoined(true);
            toast.success('You have joined the session. Attendance is being tracked.');
            // Automatically open Jitsi in new tab
            window.open(session.meetingLink, '_blank');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join session');
        } finally {
            setJoining(false);
        }
    };

    const handleLeaveSession = async () => {
        try {
            const response = await api.patch(`/bookings/session/${sessionId}/leave`);
            setIsJoined(false);
            const { attended, stayDuration, totalDuration } = response.data.data;
            if (attended) {
                toast.success(`Session ended. You were marked as Attended! (Stayed ${stayDuration}/${totalDuration} mins)`);
            } else {
                toast.warning(`Session ended. Marked as Missed. (Stayed ${stayDuration} mins, need 70% of ${totalDuration} mins)`);
            }
            navigate(backPath);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record leave time');
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
                                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                                    {user?.role === 'Host' || user?.role === 'Tutor' ? 'Manage Session' : 'Join Your Session'}
                                </h1>
                                <div className="flex gap-2 items-center mt-2">
                                    <p className="text-teal-500/20 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                                        {session.status}
                                    </p>
                                    {isJoined && (
                                        <p className="bg-green-500/20 px-3 py-1 rounded-full text-xs font-bold text-green-400 border border-green-500/30">
                                            LIVE • JOINED
                                        </p>
                                    )}
                                </div>
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
                            <h3 className="text-base font-bold text-white mb-3">Launch Session</h3>
                            
                            {(user?.role === 'Host' || user?.role === 'Tutor') && (
                                <>
                                    {session.status !== 'active' ? (
                                        <button 
                                            onClick={handleStartSession}
                                            className="block w-full text-center py-4 bg-teal-500 hover:bg-teal-400 text-white font-black text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1"
                                        >
                                            Start Session (Mark Active)
                                        </button>
                                    ) : (
                                        <a 
                                            href={session.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1"
                                        >
                                            Open Jitsi Meet
                                        </a>
                                    )}
                                </>
                            )}

                            {(user?.role === 'Student') && (
                                <>
                                    {session.status !== 'active' ? (
                                        <div className="p-4 bg-gray-900/50 border border-yellow-500/20 rounded-2xl text-center">
                                            <p className="text-yellow-500 font-bold flex items-center justify-center gap-2">
                                                <Clock size={18} /> Waiting for Host to start session...
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {!isJoined ? (
                                                <button 
                                                    onClick={handleJoinSession}
                                                    disabled={joining}
                                                    className="block w-full text-center py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50"
                                                >
                                                    {joining ? 'Joining...' : 'Join Session'}
                                                </button>
                                            ) : (
                                                <div className="space-y-4">
                                                    <a 
                                                        href={session.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block w-full text-center py-4 bg-teal-600 hover:bg-teal-500 text-white font-black text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1"
                                                    >
                                                        Re-open Jitsi Meet
                                                    </a>
                                                    <button 
                                                        onClick={handleLeaveSession}
                                                        className="block w-full text-center py-4 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 font-bold text-lg rounded-2xl transition-all"
                                                    >
                                                        Leave & End Session
                                                    </button>
                                                    <p className="text-center text-xs text-gray-500 italic">
                                                        * Attendance is only recorded when you click "Leave & End Session"
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {user?.role === 'Student' && session.status !== 'active' && (
                                <p className="text-center text-gray-500 mt-4 text-sm">
                                    The "Join Session" button will appear once your tutor starts the session.
                                </p>
                            )}
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

