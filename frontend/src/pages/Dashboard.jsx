import React, { useState, useEffect } from 'react';
import TutorScheduleManager from '../features/sessions/components/TutorScheduleManager';
import SmartSlotRecommend from '../features/sessions/components/SmartSlotRecommend';
import SessionCard from '../features/sessions/components/SessionCard';
import BookingModal from '../features/bookings/components/BookingModal';
import { getTutorSessions } from '../features/sessions/services/sessionService';

// Mock Auth logic
const getCurrentUser = () => {
    // In a real app, this comes from Context or Redux based on JWT
    // For demo purposes, we will mock a student user
    return {
        _id: 'mock_student_123',
        role: 'student',
        name: 'Alex Student'
    };
};

const Dashboard = () => {
    const user = getCurrentUser();
    const [selectedTutorId, setSelectedTutorId] = useState('mock_tutor_456'); // Mock active tutor
    const [sessions, setSessions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSessionToBook, setSelectedSessionToBook] = useState(null);

    useEffect(() => {
        if (user.role === 'student') {
            fetchAvailableSessions();
        }
        // eslint-disable-next-line
    }, [user.role, selectedTutorId]);

    const fetchAvailableSessions = async () => {
        try {
            const data = await getTutorSessions(selectedTutorId);
            // Only show available future sessions
            const available = (data.data || data).filter(s => s.status === 'available');
            setSessions(available);
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    };

    const handleBookClick = (session) => {
        setSelectedSessionToBook(session);
        setIsModalOpen(true);
    };

    const handleBookingSuccess = () => {
        fetchAvailableSessions(); // Refresh list after booking
    };

    // If user is a TUTOR, render their schedule manager dashboard
    if (user.role === 'tutor') {
        return <TutorScheduleManager tutorId={user._id} />;
    }

    // If user is a STUDENT, render the booking dashboard
    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            {/* Top Navbar */}
            <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 shrink-0">
                        STUEDU
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm hidden sm:inline">Logged in as {user.name}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center font-bold">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold mb-3">Book a Session</h1>
                    <p className="text-gray-400 text-lg">Find the perfect time with your tutor.</p>
                </header>

                {/* Smart Recommendation Banner */}
                <div className="mb-12">
                    <SmartSlotRecommend tutorId={selectedTutorId} onBook={handleBookClick} />
                </div>

                {/* All Available Slots */}
                <div>
                    <h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2">All Available Slots</h2>

                    {sessions.length === 0 ? (
                        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed">
                            <p className="text-xl text-gray-400 mb-2">No available slots found.</p>
                            <p className="text-gray-500 text-sm">The tutor has not set their availability yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sessions.map(session => (
                                <SessionCard
                                    key={session._id}
                                    session={session}
                                    onBook={handleBookClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                session={selectedSessionToBook}
                studentId={user._id}
                onSuccess={handleBookingSuccess}
            />
        </div>
    );
};

export default Dashboard;
