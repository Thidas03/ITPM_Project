import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { createAvailability, getTutorAvailability, updateAvailability, deleteAvailability } from '../services/availabilityService';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityManager = ({ tutorId }) => {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null); // Tracks if we are updating

    // Form state
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');

    useEffect(() => {
        fetchAvailability();
        // eslint-disable-next-line
    }, [tutorId]);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            const data = await getTutorAvailability(tutorId);
            setAvailabilities(data.data || data); // Adjust according to API response structure
        } catch (error) {
            toast.error('Failed to load availability slots');
            console.error("Availability Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAvailability = async (e) => {
        e.preventDefault();

        // Basic validation
        if (startTime >= endTime) {
            return toast.warning('End time must be after start time');
        }

        try {
            if (editingId) {
                await updateAvailability(editingId, {
                    dayOfWeek: selectedDay,
                    startTime,
                    endTime
                });
                toast.success('Availability updated successfully!');
                setEditingId(null);
            } else {
                await createAvailability({
                    tutor: tutorId,
                    dayOfWeek: selectedDay,
                    startTime,
                    endTime
                });
                toast.success('Availability added successfully!');
            }
            fetchAvailability();
        } catch (error) {
            toast.error(error?.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} availability`);
        }
    };

    const handleEditClick = (slot) => {
        setEditingId(slot._id);
        setSelectedDay(slot.dayOfWeek);
        setStartTime(slot.startTime);
        setEndTime(slot.endTime);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteAvailability = async (id) => {
        if (!window.confirm("Are you sure you want to delete this availability slot?")) return;

        try {
            await deleteAvailability(id);
            toast.success('Availability removed');
            fetchAvailability();
        } catch (error) {
            toast.error('Failed to remove availability');
        }
    };

    // Group availabilities by day
    const groupedAvailabilities = DAYS_OF_WEEK.map(day => {
        return {
            day,
            slots: availabilities.filter(a => a.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
        };
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6 min-h-[60vh]">
            {/* Left Column: Form */}
            <div className="lg:col-span-4 space-y-8">
                <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700 relative">
                    {editingId && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setStartTime('09:00');
                                setEndTime('17:00');
                            }}
                            className="absolute top-4 right-4 text-xs font-semibold text-gray-400 hover:text-white bg-gray-700 px-2 py-1 rounded-md"
                        >
                            Cancel Edit
                        </button>
                    )}
                    <h2 className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3">
                        {editingId ? 'Update Availability' : 'Set Availability'}
                    </h2>
                    <form onSubmit={handleCreateAvailability} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">Select Day</label>
                            <div className="grid grid-cols-2 gap-2">
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => setSelectedDay(day)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${selectedDay === day
                                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                                            : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-gray-200'
                                            }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        <button
                            type="submit"
                            className={`w-full text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:-translate-y-1 mt-4 ${editingId
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500'
                                    : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500'
                                }`}
                        >
                            {editingId ? 'Update Slot' : 'Add Weekly Slot'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Column: Weekly Schedule */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3 flex justify-between items-center">
                        <span>Your Weekly Schedule</span>
                        <span className="text-sm px-3 py-1 bg-gray-700 rounded-full text-gray-300 font-normal">
                            {availabilities.length} Total Slots
                        </span>
                    </h2>

                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-700 rounded-xl w-full"></div>
                            ))}
                        </div>
                    ) : availabilities.length === 0 ? (
                        <div className="text-center py-16 bg-gray-900/50 rounded-xl border border-gray-700 border-dashed">
                            <div className="text-teal-500/50 mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl text-gray-300 font-medium mb-2">No availability configured</h3>
                            <p className="text-gray-500">Students won't be able to book sessions with you yet. Start by adding slots on the left.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groupedAvailabilities.map(({ day, slots }) => {
                                if (slots.length === 0) return null;

                                return (
                                    <div key={day} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col h-full hover:border-gray-600 transition-colors shadow-md">
                                        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                                            <h3 className="text-lg font-bold text-teal-400">{day}</h3>
                                            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-md">{slots.length} slots</span>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            {slots.map(slot => (
                                                <div key={slot._id} className="group flex justify-between items-center bg-gray-800/80 p-3 rounded-lg border border-gray-700/50 hover:border-teal-500/30 transition-all">
                                                    <span className="text-gray-200 font-mono tracking-wide text-sm font-medium">
                                                        {slot.startTime} <span className="text-gray-500 mx-1">-</span> {slot.endTime}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEditClick(slot)}
                                                            className="text-gray-500 hover:text-amber-400 hover:bg-amber-400/10 p-1.5 rounded-md transition-all"
                                                            title="Edit Slot"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAvailability(slot._id)}
                                                            className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-md transition-all"
                                                            title="Remove Slot"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvailabilityManager;
