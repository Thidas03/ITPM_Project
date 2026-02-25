import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TutorScheduleManager from '../features/sessions/components/TutorScheduleManager';
import SmartSlotRecommend from '../features/sessions/components/SmartSlotRecommend';
import SessionCard from '../features/sessions/components/SessionCard';
import BookingModal from '../features/bookings/components/BookingModal';
import { getTutorSessions } from '../features/sessions/services/sessionService';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedTutorId, setSelectedTutorId] = useState('mock_tutor_456'); // Mock active tutor
    const [sessions, setSessions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSessionToBook, setSelectedSessionToBook] = useState(null);
    const [trustProfile, setTrustProfile] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchTrustProfile = async () => {
            try {
                const response = await api.get('/auth/profile/trust');
                setTrustProfile(response.data);
            } catch (error) {
                console.error("Failed to fetch trust profile", error);
            }
        };

        if (user) {
            fetchTrustProfile();
        }

        if (user && user.role === 'Student') {
            fetchAvailableSessions();
        }
        // eslint-disable-next-line
    }, [user?.role, selectedTutorId]);

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

    // If user is a HOST (tutor), render their schedule manager dashboard
    if (user && user.role === 'Host') {
        return <TutorScheduleManager tutorId={user._id} />;
    }

    if (!user) return null;

    // If user is a STUDENT, render the booking dashboard
    return (
        <div className="bg-[#f0f9ff] min-h-screen text-slate-800 font-sans">
            {/* Top Navbar */}
            <nav className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-xl font-black text-blue-600 shrink-0">
                        STUEDU
                    </div>
                    <div className="flex items-center gap-6">
                        {trustProfile && (
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                                <span className={`w-2 h-2 rounded-full ${trustProfile.trustLevel === 'High' ? 'bg-green-500' :
                                    trustProfile.trustLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></span>
                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                    {trustProfile.trustLevel} Trust
                                </span>
                                <span className="text-blue-200">|</span>
                                <span className="text-xs text-slate-500">
                                    Limit: {trustProfile.bookingLimit}
                                </span>
                            </div>
                        )}
                        <Link to="/profile" className="flex items-center gap-3 group">
                            <div className="flex flex-col items-end group-hover:opacity-80 transition">
                                <span className="text-slate-500 text-sm hidden sm:inline leading-none">
                                    Logged in as <span className="text-slate-800 font-medium group-hover:text-blue-500 transition">{user.firstName} {user.lastName}</span>
                                </span>
                                {trustProfile?.badges?.map(badge => (
                                    <span key={badge} className="text-[10px] text-blue-500 font-bold uppercase mt-1">
                                        ✨ {badge}
                                    </span>
                                ))}
                            </div>
                            <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition transform">
                                {user.firstName.charAt(0)}
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-blue-600 text-sm font-medium transition flex items-center gap-2 border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Book a Session</h1>
                    <p className="text-slate-500 text-lg">Find the perfect time with your tutor.</p>
                </header>

                {/* Smart Recommendation Banner */}
                <div className="mb-12">
                    <SmartSlotRecommend tutorId={selectedTutorId} onBook={handleBookClick} />
                </div>

                {/* All Available Slots */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-blue-100 pb-2">All Available Slots</h2>

                    {sessions.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-blue-100 border-dashed shadow-sm">
                            <p className="text-xl text-slate-500 mb-2 font-semibold">No available slots found.</p>
                            <p className="text-slate-400 text-sm">The tutor has not set their availability yet.</p>
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
