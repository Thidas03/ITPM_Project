import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaUser, FaInfoCircle } from 'react-icons/fa';

const SessionDetailsModal = ({ isOpen, onClose, session, tutorName, onConfirm }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !session) return null;

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm(session);
        } catch (error) {
            // Error handling is handled in the parent component
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = new Date(session.date).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const isFull = session.currentParticipants >= session.maxParticipants;
    const availableSeats = session.maxParticipants - session.currentParticipants;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all">
                <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Session Details</h2>
                    <p className="text-gray-400 mb-6">Review the session details before confirming your booking.</p>

                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 mb-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                            <span className="text-gray-400 flex items-center gap-2">
                                <FaCalendarAlt className="text-teal-500" /> Date
                            </span>
                            <span className="text-white font-semibold">{formattedDate}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                            <span className="text-gray-400 flex items-center gap-2">
                                <FaClock className="text-teal-500" /> Time
                            </span>
                            <span className="text-white font-medium">{session.startTime} - {session.endTime}</span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-gray-700/50">
                            <span className="text-gray-400 flex items-center gap-2">
                                <FaUser className="text-indigo-400" /> Tutor
                            </span>
                            <span className="text-white font-medium">{tutorName || 'N/A'}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Available Seats</span>
                            <span className={`font-bold ${availableSeats > 0 ? 'text-teal-400' : 'text-red-400'}`}>
                                {availableSeats} {availableSeats === 1 ? 'seat' : 'seats'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-r-xl mb-8">
                        <p className="text-indigo-200 text-sm flex items-start gap-2">
                            <FaInfoCircle className="text-indigo-400 text-lg mt-0.5" />
                            Once booked, you can join the session using the meeting link provided in your dashboard.
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
                            disabled={loading || isFull}
                            className={`flex-1 px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform flex justify-center items-center ${
                                isFull 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:shadow-teal-500/25 hover:-translate-y-0.5'
                            } disabled:opacity-50 disabled:transform-none`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : isFull ? (
                                'Session Full'
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

export default SessionDetailsModal;
