import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TutorScheduleManager from '../features/sessions/components/TutorScheduleManager';
import SmartSlotRecommend from '../features/sessions/components/SmartSlotRecommend';
import BookingModal from '../features/bookings/components/BookingModal';
import { getTutorAvailability } from '../features/sessions/services/availabilityService';
import { getStudentBookings, cancelBooking } from '../features/bookings/services/bookingService';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationDropdown from '../components/NotificationDropdown';
// Mock Auth logic
const getCurrentUser = () => {
    // In a real app, this comes from Context or Redux based on JWT
    // For demo purposes, we will mock a student user
return {
    _id: '60d0fe4f5311236168a109ca',
    role: 'student',   // <- change to 'student'
    name: 'Alex Student'
  };
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedTutorId, setSelectedTutorId] = useState('mock_tutor_456'); // Mock active tutor
    const [availabilitySlots, setAvailabilitySlots] = useState([]);
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
    const [selectedAvailabilityToBook, setSelectedAvailabilityToBook] = useState(null);
    const [studentBookings, setStudentBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    useEffect(() => {
        if (user.role === 'student') {
            fetchAvailableSlots();
            fetchStudentBookings();
        }
        // eslint-disable-next-line
    }, [user?.role, selectedTutorId]);

    const fetchAvailableSlots = async () => {
        try {
            const data = await getTutorAvailability(selectedTutorId);
            // Only show availability slots that are not booked
            const available = (data.data || data).filter(a => !a.isBooked);
            setAvailabilitySlots(available);
        } catch (error) {
            console.error("Failed to fetch availability slots", error);
        }
    };

    const fetchStudentBookings = async () => {
        try {
            setLoadingBookings(true);
            const data = await getStudentBookings(user._id);
            setStudentBookings(data.data || data);
        } catch (error) {
            console.error("Failed to fetch student bookings", error);
        } finally {
            setLoadingBookings(false);
        }
    };

    const handleBookClick = (availability) => {
        setSelectedAvailabilityToBook(availability);
        setIsModalOpen(true);
    };

    const handleBookingSuccess = () => {
        fetchAvailableSlots(); // Refresh list after booking
        fetchStudentBookings(); // Refresh my bookings list
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(bookingId);
            fetchAvailableSlots();
            fetchStudentBookings();
        } catch (error) {
            console.error('Failed to cancel booking', error);
        }
    };

    // If !user return null handled below
    if (!user) return null;

    // If user is a STUDENT, render the booking dashboard
    return (
        <div className="bg-gray-900 min-h-screen text-gray-300 font-sans">
            {/* Top Navbar */}
            <nav className="border-b border-gray-700 bg-gray-800/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-xl font-black text-teal-400 shrink-0">
                        STUEDU
                    </div>
                    <div className="flex items-center gap-6">
                        {user?.role === 'Admin' && (
                            <Link to="/admin" className="px-4 py-1.5 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition">Admin Panel</Link>
                        )}
                        <Link to={user.role === 'Admin' ? "/admin/history" : "/my-sessions"} className="px-4 py-1.5 bg-gray-900 border border-gray-700 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-500/10 hover:text-teal-400 transition">My History</Link>
                        <Link to="/profile" className="px-4 py-1.5 bg-gray-900 border border-gray-700 text-teal-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-500/10 transition">Settings</Link>
                        {trustProfile && (
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-teal-500/10 rounded-full border border-gray-700">
                                <span className={`w-2 h-2 rounded-full ${trustProfile.trustLevel === 'High' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                                    trustProfile.trustLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></span>
                                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                                    {trustProfile.trustLevel} Trust
                                </span>
                                <span className="text-blue-200">|</span>
                                <span className="text-xs text-gray-400">
                                    Limit: {trustProfile.bookingLimit}
                                </span>
                            </div>
                        )}
                        <Link to="/profile" className="flex items-center gap-3 group">
                            <div className="flex flex-col items-end group-hover:opacity-80 transition">
                                <span className="text-gray-300 font-bold group-hover:text-teal-500 transition leading-none mb-1">{user.firstName} {user.lastName} <span className="text-xs text-teal-400 opacity-70 ml-1">#{user.identityNumber || 'N/A'}</span></span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-16 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${trustProfile?.trustLevel === 'High' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : trustProfile?.trustLevel === 'Medium' ? 'bg-gradient-to-r from-teal-500 to-indigo-600' : 'bg-red-500'}`}
                                            style={{ width: `${trustProfile?.trustPercentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">{trustProfile?.trustPercentage || 0}%</span>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition transform overflow-hidden">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.firstName.charAt(0)
                                )}
                            </div>
                        </Link>
                        <NotificationDropdown />
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-teal-400 text-sm font-medium transition flex items-center gap-2 border border-gray-700 px-4 py-2 rounded-xl hover:bg-teal-500/10"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {user.role === 'Host' ? (
                    <TutorScheduleManager tutorId={user._id} />
                ) : (
                    <>
                        <header className="mb-10">
                            <h1 className="text-4xl font-extrabold text-gray-300 mb-2">Book a Session</h1>
                            <p className="text-gray-400 text-lg">Find the perfect time with your tutor.</p>
                        </header>

                        {/* Dynamic Access Status Card */}
                        {trustProfile && (
                            <div className="mb-10 grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-800 p-6 rounded-[2rem] border border-gray-700 shadow-xl shadow-blue-50/50">
                                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-700 pb-6 md:pb-0 md:pr-6 flex flex-col justify-center">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dynamic Access Profile</p>
                                    <h2 className={`text-4xl font-black mb-1 ${trustProfile.trustLevel === 'High' ? 'text-green-500' : trustProfile.trustLevel === 'Medium' ? 'text-teal-400' : 'text-red-500'}`}>
                                        {trustProfile.trustLevel} Trust
                                    </h2>
                                    <p className="text-gray-400 text-sm font-medium">
                                        Level: {trustProfile.trustLevel === 'High' ? 'Elite Contributor' : trustProfile.trustLevel === 'Medium' ? 'Standard Member' : 'Restricted Access'}
                                    </p>
                                </div>
                                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-700 py-6 md:py-0 md:px-6">
                                    <div className="flex items-center gap-4 h-full">
                                        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-3xl shadow-inner">
                                            {trustProfile.trustLevel === 'High' ? '🚀' : trustProfile.trustLevel === 'Medium' ? '📅' : '⚠️'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Booking Capacity</p>
                                            <p className="text-2xl font-bold text-gray-300">{trustProfile.bookingLimit} Slots Max</p>
                                            <div className="mt-1 flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`h-1 w-4 rounded-full ${i < trustProfile.bookingLimit ? 'bg-gradient-to-r from-teal-500 to-indigo-600' : 'bg-gray-800'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-4 pt-6 md:pt-0 md:pl-6 flex flex-col justify-center">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Live Risk Insights</p>
                                    <div className="flex flex-wrap gap-2">
                                        {trustProfile.badges.map(badge => (
                                            <span key={badge} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100 animate-pulse">
                                                ✨ {badge}
                                            </span>
                                        ))}
                                        {trustProfile.trustLevel === 'Low' && (
                                            <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
                                                Block Risk: High
                                            </span>
                                        )}
                                        {trustProfile.stats.attendanceRate > 90 && (
                                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100">
                                                Perfect Attendance
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Smart Recommendation Banner */}
                        <div className="mb-12">
                            <SmartSlotRecommend tutorId={selectedTutorId} onBook={handleBookClick} />
                        </div>

                        {/* All Available Slots */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-300 mb-6 border-b border-gray-700 pb-2">All Available Slots</h2>

                            {sessions.length === 0 ? (
                                <div className="text-center py-20 bg-gray-800 rounded-3xl border border-gray-700 border-dashed shadow-sm">
                                    <p className="text-xl text-gray-400 mb-2 font-semibold">No available slots found.</p>
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
                    </>
                )}
                <header className="mb-10">
                    <h1 className="text-4xl font-bold mb-3">Book a Session</h1>
                    <p className="text-gray-400 text-lg">Find the perfect time with your tutor.</p>
                </header>

                {/* Smart Recommendation Banner (can still use sessions if desired) */}
                <div className="mb-12">
                    <SmartSlotRecommend tutorId={selectedTutorId} onBook={handleBookClick} />
                </div>

                {/* All Available Weekly Slots */}
                <div>
                    <h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2">All Available Weekly Slots</h2>

                    {availabilitySlots.length === 0 ? (
                        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed">
                            <p className="text-xl text-gray-400 mb-2">No available weekly slots found.</p>
                            <p className="text-gray-500 text-sm">The tutor has not set their availability yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {availabilitySlots.map(slot => (
                                <div
                                    key={slot._id}
                                    className="relative p-6 rounded-2xl border border-gray-700 bg-gray-800 shadow-lg flex flex-col justify-between"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            {slot.dayOfWeek}
                                        </h3>
                                        <p className="text-gray-400 font-medium">
                                            {slot.startTime} - {slot.endTime}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-3">
                                            This is a weekly slot. You will pick a concrete date when booking.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleBookClick(slot)}
                                        className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold shadow-lg hover:shadow-teal-500/25 transition-all duration-300 text-sm"
                                    >
                                        Book This Slot
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Student's Booked Sessions */}
                <div className="mt-16">
                    <h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2">My Booked Sessions</h2>

                    {loadingBookings ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-20 bg-gray-800 rounded-xl"></div>
                            <div className="h-20 bg-gray-800 rounded-xl"></div>
                        </div>
                    ) : studentBookings.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed">
                            <p className="text-gray-400">You have no booked sessions yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {studentBookings.map(booking => {
                                const dateLabel = new Date(booking.bookingDate).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                                const isUpcoming = booking.status === 'upcoming';
                                return (
                                    <div
                                        key={booking._id}
                                        className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-800 rounded-xl border border-gray-700"
                                    >
                                        <div className="space-y-1">
                                            <div className="text-white font-semibold">
                                                {dateLabel} &middot; {booking.availability?.startTime} - {booking.availability?.endTime}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Tutor: <span className="text-gray-200 font-medium">{booking.tutor?.name || 'N/A'}</span>
                                            </div>
                                            <span
                                                className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full border ${
                                                    booking.status === 'upcoming'
                                                        ? 'bg-teal-500/10 text-teal-300 border-teal-500/40'
                                                        : booking.status === 'completed'
                                                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40'
                                                        : 'bg-red-500/10 text-red-300 border-red-500/40'
                                                }`}
                                            >
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                        {isUpcoming && (
                                            <button
                                                onClick={() => handleCancelBooking(booking._id)}
                                                className="mt-3 md:mt-0 px-4 py-2 rounded-lg border border-red-600 text-red-300 text-sm font-medium hover:bg-red-600/10 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                availability={selectedAvailabilityToBook}
                studentId={user._id}
                onSuccess={handleBookingSuccess}
            />
        </div>
    );
};

export default Dashboard;
