import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionCard = ({ session, onBook }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const isAvailable = session.status === 'available' && session.currentParticipants < session.maxParticipants;
    const isFullyBooked = session.status === 'booked' || session.currentParticipants >= session.maxParticipants;
    const isBookedByMe = session.isBookedByMe;

    return (
        <div
            className={`relative p-6 rounded-2xl border transition-all duration-300 transform 
        ${isHovered && isAvailable ? '-translate-y-1 shadow-2xl border-teal-500' : 'border-gray-700 shadow-lg'}
        ${isFullyBooked ? 'bg-gray-800/60 opacity-75' : 'bg-gray-800'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                        {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </h3>
                    <p className="text-gray-400 font-medium">
                        {session.startTime} - {session.endTime}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border 
                  ${isBookedByMe ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        isAvailable ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' :
                            isFullyBooked ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-gray-600/20 text-gray-400 border-gray-600/30'}`}>
                    {isBookedByMe ? 'Confirmed' : session.status}
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available Seats:</span>
                    <span className="text-white font-semibold">
                        {session.maxParticipants - session.currentParticipants}
                    </span>
                </div>

                {/* Progress bar for participants */}
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                        className={`h-2 rounded-full ${isFullyBooked ? 'bg-red-500' : 'bg-teal-500'}`}
                        style={{ width: `${(session.currentParticipants / session.maxParticipants) * 100}%` }}
                    ></div>
                </div>
            </div>

            {isBookedByMe ? (
                <button
                    onClick={() => navigate(`/session/${session._id}`)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20 transform transition-all hover:-translate-y-1"
                >
                    Enter Classroom
                </button>
            ) : (
                <button
                    onClick={() => onBook(session)}
                    disabled={!isAvailable}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300
          ${isAvailable
                            ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg hover:shadow-teal-500/20 hover:from-teal-500 hover:to-indigo-600'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    {isAvailable ? 'Book Session' : 'Unavailable'}
                </button>
            )}

            {/* Decorative background element on hover */}
            {isHovered && isAvailable && (
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 to-indigo-500/5 rounded-2xl pointer-events-none"></div>
            )}
        </div>
    );
};

export default SessionCard;
