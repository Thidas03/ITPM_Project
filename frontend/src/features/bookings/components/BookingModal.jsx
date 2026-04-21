import React, { useMemo, useState } from 'react';
import { createBooking } from '../services/bookingService';
import { toast } from 'react-toastify';

// This modal books against an Availability slot for a specific calendar date.
const BookingModal = ({ isOpen, onClose, availability, studentId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [notes, setNotes] = useState('');

    if (!isOpen || !availability) return null;

    const minDate = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    }, []);

    const computeWeekdayName = (d) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[d.getDay()];
    };

    const handleConfirm = async () => {
        const dateOnly = new Date(selectedDate);
        dateOnly.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateOnly < today) {
            toast.warning('You cannot book for a past date.');
            return;
        }

        const weekdayName = computeWeekdayName(dateOnly);
        if (weekdayName !== availability.dayOfWeek) {
            toast.warning(`Please select a ${availability.dayOfWeek} to match this slot.`);
            return;
        }

        try {
            setLoading(true);
            await createBooking({
                student: studentId,
                availability: availability._id,
                bookingDate: dateOnly.toISOString()
                // notes could be added to Booking model later if needed
            });
            toast.success('Successfully booked the session!');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to book session. You might already be booked.');
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = new Date(selectedDate).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all">

                <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Confirm Booking</h2>
                    <p className="text-gray-400 mb-6">You are about to book a session. Please review the details below.</p>

                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 mb-6 space-y-3">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-400">Date</span>
                            <span className="text-teal-400 font-semibold">{formattedDate}</span>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                Select a date (must be a {availability.dayOfWeek}, past dates disabled)
                            </label>
                            <input
                                type="date"
                                className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                min={minDate}
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    const d = new Date(e.target.value);
                                    if (!isNaN(d.getTime())) {
                                        setSelectedDate(d);
                                    }
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Time</span>
                            <span className="text-white font-medium">{availability.startTime} - {availability.endTime}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notes for Tutor (Optional)</label>
                        <textarea
                            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                            rows="3"
                            placeholder="What do you want to cover?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            maxLength={500}
                        ></textarea>
                    </div>

                    <div className="bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-r-xl mb-8">
                        <p className="text-indigo-200 text-sm flex items-start gap-2">
                            <span className="text-indigo-400 text-lg leading-none">ℹ️</span>
                            Cancellation Policy: You may cancel this booking up to 1 hour before the session starts without penalty.
                        </p>
                    </div>

                    <div className="flex gap-4 opacity-100">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold shadow-lg hover:shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex justify-center items-center"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Confirm Booking'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
