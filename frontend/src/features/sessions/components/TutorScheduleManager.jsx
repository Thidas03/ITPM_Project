import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getTutorSessions, createSession, updateSession, deleteSession } from '../services/sessionService';
import { toast } from 'react-toastify';
import AvailabilityManager from './AvailabilityManager';

const TutorScheduleManager = ({ tutorId }) => {
    const [activeTab, setActiveTab] = useState('sessions');

    // Sessions state
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [maxParticipants, setMaxParticipants] = useState(1);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState(null);

    useEffect(() => {
        fetchSessions();
        // eslint-disable-next-line
    }, [tutorId]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await getTutorSessions(tutorId);
            // Assuming data is an array of sessions. Handle response format accordingly.
            setSessions(data.data || data);
        } catch (error) {
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();

        if (startTime >= endTime) {
            return toast.warning('End time must be after start time');
        }

        try {
            if (editingSessionId) {
                await updateSession(editingSessionId, {
                    date: date.toISOString(),
                    startTime,
                    endTime,
                    maxParticipants,
                });
                toast.success('Session updated successfully!');
                setEditingSessionId(null);
            } else {
                await createSession({
                    tutor: tutorId,
                    date: date.toISOString(),
                    startTime,
                    endTime,
                    maxParticipants,
                });
                toast.success('Session created successfully!');
            }
            fetchSessions();
        } catch (error) {
            toast.error(error?.response?.data?.error || `Failed to ${editingSessionId ? 'update' : 'create'} session`);
        }
    };

    const handleEditSession = (session) => {
        setEditingSessionId(session._id);
        setDate(new Date(session.date));
        setStartTime(session.startTime);
        setEndTime(session.endTime);
        setMaxParticipants(session.maxParticipants || 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to delete this session?")) return;

        try {
            await deleteSession(sessionId);
            toast.success('Session deleted');
            fetchSessions();
        } catch (error) {
            toast.error('Failed to delete session');
        }
    };

    // Filter sessions for the selected date
    const selectedDateSessions = sessions.filter(
        (s) => new Date(s.date).toDateString() === date.toDateString()
    );

    return (
        <div className="bg-gray-900 text-white min-h-screen p-8 w-full font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="border-b border-gray-800 pb-6">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
                        Tutor Schedule Manager
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your availability, sessions, and participants efficiently.</p>
                </header>

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-800 pb-4">
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${activeTab === 'sessions'
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                    >
                        Session Slots
                    </button>
                    <button
                        onClick={() => setActiveTab('availability')}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${activeTab === 'availability'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                    >
                        Weekly Availability
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'availability' ? (
                    <AvailabilityManager tutorId={tutorId} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Left Column: Calendar & Filters */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
                                <h2 className="text-xl font-semibold mb-4 text-gray-200">Select Date</h2>
                                {/* Overriding some react-calendar styles directly via tailwind classes on a wrapper, or relies on index.css if customized */}
                                <div className="text-gray-900 rounded-lg overflow-hidden border border-gray-300 bg-white p-2">
                                    <Calendar
                                        onChange={setDate}
                                        value={date}
                                        className="w-full border-none shadow-none"
                                    />
                                </div>
                                <div className="mt-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                    <p className="text-sm text-gray-300">Selected Date:</p>
                                    <p className="text-lg font-bold text-teal-400">{date.toDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Creation Form & List */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Create Session Form */}
                            <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700 relative">
                                {editingSessionId && (
                                    <button
                                        onClick={() => {
                                            setEditingSessionId(null);
                                            setStartTime('09:00');
                                            setEndTime('10:00');
                                            setMaxParticipants(1);
                                        }}
                                        className="absolute top-4 right-4 text-xs font-semibold text-gray-400 hover:text-white bg-gray-700 px-2 py-1 rounded-md"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                <h2 className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3">
                                    {editingSessionId ? 'Update Session Slot' : 'Add Session Slot'}
                                </h2>
                                <form onSubmit={handleCreateSession} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Max Participants</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={maxParticipants}
                                                onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className={`w-full text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:-translate-y-1 ${editingSessionId
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500'
                                            : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500'
                                            }`}
                                    >
                                        {editingSessionId ? 'Update Session' : 'Create Session'}
                                    </button>
                                </form>
                            </div>

                            {/* List of Sessions */}
                            <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-100 flex items-center justify-between border-b border-gray-700 pb-3">
                                    <span>Slots on <span className="text-teal-400">{date.toLocaleDateString()}</span></span>
                                    <span className="text-sm font-normal px-3 py-1 bg-gray-700 rounded-full text-gray-300">{selectedDateSessions.length} slots</span>
                                </h2>

                                {loading ? (
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="flex-1 space-y-4 py-1">
                                            <div className="h-20 bg-gray-700 rounded-xl"></div>
                                            <div className="h-20 bg-gray-700 rounded-xl"></div>
                                        </div>
                                    </div>
                                ) : selectedDateSessions.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-900/50 rounded-xl border border-gray-700 border-dashed">
                                        <p className="text-gray-400">No availability set for this date.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedDateSessions.map(session => (
                                            <div key={session._id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-900 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all shadow-md">
                                                <div className="mb-4 sm:mb-0">
                                                    <div className="text-lg font-bold text-gray-100">
                                                        {session.startTime} - {session.endTime}
                                                    </div>
                                                    <div className="text-sm mt-1 flex items-center gap-3">
                                                        <span className={`px-2 py-1 tracking-wide text-xs uppercase font-semibold rounded-full ${session.status === 'booked' ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700' : 'bg-teal-900/50 text-teal-300 border border-teal-700'}`}>
                                                            {session.status}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            Participants: <span className="text-white font-medium">{session.currentParticipants}</span> / {session.maxParticipants}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                                    <button
                                                        onClick={() => handleEditSession(session)}
                                                        className="flex-1 sm:flex-none hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 px-4 py-2 rounded-lg border border-amber-900/50 transition-colors text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSession(session._id)}
                                                        className="flex-1 sm:flex-none opacity-100 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-900/50 transition-colors text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TutorScheduleManager;
