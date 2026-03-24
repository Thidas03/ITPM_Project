import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getTutorSessions, createSession, deleteSession } from '../services/sessionService';
import { toast } from 'react-toastify';

const TutorScheduleManager = ({ tutorId }) => {
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [maxParticipants, setMaxParticipants] = useState(1);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);

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
        try {
            await createSession({
                tutor: tutorId,
                date: date.toISOString(),
                startTime,
                endTime,
                maxParticipants,
            });
            toast.success('Session created successfully!');
            fetchSessions();
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to create session');
        }
    };

    const handleDeleteSession = async (sessionId) => {
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
        <div className="text-gray-300 w-full font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-300">
                        Work Schedule
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your availability, sessions, and participants efficiently.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Calendar & Filters */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gray-800 p-6 rounded-[2rem] shadow-xl shadow-blue-50 border border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-gray-300">Select Date</h2>
                            <div className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-800 p-2">
                                <Calendar
                                    onChange={setDate}
                                    value={date}
                                    className="w-full border-none shadow-none"
                                />
                            </div>
                            <div className="mt-4 p-4 bg-teal-500/10 rounded-2xl border border-gray-700">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Editing Shift For</p>
                                <p className="text-lg font-bold text-teal-400">{date.toDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Creation Form & List */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Create Session Form */}
                        <div className="bg-gray-800 p-8 rounded-[2rem] shadow-xl shadow-blue-50 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-gray-300 border-b border-gray-700 pb-3">Add Availability Slot</h2>
                            <form onSubmit={handleCreateSession} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">End Time</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Max Participants</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={maxParticipants}
                                            onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                                            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-teal-600 to-indigo-700 hover:from-teal-500 hover:to-indigo-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-teal-500/20 transform transition hover:-translate-y-1 uppercase tracking-widest text-sm"
                                >
                                    Confirm Availability
                                </button>
                            </form>
                        </div>

                        {/* List of Sessions */}
                        <div className="bg-gray-800 p-8 rounded-[2rem] shadow-xl shadow-blue-50 border border-gray-700">
                            <h2 className="text-2xl font-bold mb-6 text-gray-300 flex items-center justify-between border-b border-gray-700 pb-3">
                                <span>Active Slots</span>
                                <span className="text-xs font-black px-3 py-1 bg-teal-500/10 rounded-full text-teal-400 uppercase tracking-widest">{selectedDateSessions.length} total</span>
                            </h2>

                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-20 bg-teal-500/10 rounded-2xl"></div>
                                    <div className="h-20 bg-teal-500/10 rounded-2xl"></div>
                                </div>
                            ) : selectedDateSessions.length === 0 ? (
                                <div className="text-center py-10 bg-teal-500/10/20 rounded-2xl border border-gray-700 border-dashed">
                                    <p className="text-slate-400 font-medium">No sessions scheduled for this date.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {selectedDateSessions.map(session => (
                                        <div key={session._id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-800 rounded-2xl border border-gray-700 hover:border-blue-400/50 transition-all shadow-sm">
                                            <div className="mb-4 sm:mb-0">
                                                <div className="text-lg font-black text-gray-300">
                                                    {session.startTime} - {session.endTime}
                                                </div>
                                                <div className="text-xs mt-1 flex items-center gap-3">
                                                    <span className={`px-2 py-0.5 tracking-widest text-[10px] uppercase font-black rounded-lg border ${session.status === 'booked' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                        {session.status}
                                                    </span>
                                                    <span className="text-slate-400 font-medium">
                                                        Capacity: <span className="text-gray-300 font-bold">{session.currentParticipants}</span> / {session.maxParticipants}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSession(session._id)}
                                                className="px-6 py-2 rounded-xl text-red-500 hover:bg-red-50 font-bold text-sm border border-transparent hover:border-red-100 transition-all"
                                            >
                                                Remove Slot
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorScheduleManager;
