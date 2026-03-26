import React, { useState } from 'react';

const parseSessionTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr || timeStr === 'N/A') return null;
    const d = new Date(dateStr);
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
    if (!match) return null;
    let [ , hours, minutes, ampm ] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    if (ampm) {
        if (ampm.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (ampm.toLowerCase() === 'am' && hours === 12) hours = 0;
    }
    d.setHours(hours, minutes, 0, 0);
    return d;
};

const SessionCard = ({ session, onViewDetails }) => {
    const [isHovered, setIsHovered] = useState(false);

    const now = new Date();
    const sessionEndDateTime = parseSessionTime(session.date, session.endTime);
    
    let isPast = false;
    if (sessionEndDateTime) {
        isPast = sessionEndDateTime < now;
    } else {
        const dateString = session.date.split('T')[0];
        const fallbackEndDateTime = new Date(`${dateString}T${session.endTime}`);
        isPast = fallbackEndDateTime < now;
    }

    const isFull = session.currentParticipants >= session.maxParticipants;

    const isAvailable = !isPast && !isFull;
    const isFullyBooked = isFull;

    return (
        <div
            className={`relative p-6 rounded-2xl border transition-all duration-300 transform 
        ${isHovered && isAvailable ? '-translate-y-1 shadow-2xl border-teal-500' : 'border-gray-700 shadow-lg'}
        ${isPast || isFull ? 'bg-gray-800/60 opacity-75' : 'bg-gray-800'}`}
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
          ${isPast
                        ? 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                        : isFull
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-teal-500/10 text-teal-400 border-teal-500/30'}`}>

                    {isPast ? 'expired' : isFull ? 'booked' : 'available'}
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
                        className={`h-2 rounded-full ${isFullyBooked ? 'bg-red-500' : 'bg-teal-400'}`}
                        style={{ width: `${(session.currentParticipants / session.maxParticipants) * 100}%` }}
                    ></div>
                </div>
            </div>

            <button
                onClick={() => isAvailable && onViewDetails(session)}
                disabled={!isAvailable}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300
        ${isAvailable
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg hover:shadow-teal-500/25 hover:from-teal-400 hover:to-indigo-500'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
            >
                {isPast ? 'Expired' : isFull ? 'Full' : 'View Details'}
            </button>


            {/* Decorative background element on hover */}
            {isHovered && isAvailable && (
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 to-indigo-500/5 rounded-2xl pointer-events-none"></div>
            )}
        </div>
    );
};



export default SessionCard;
