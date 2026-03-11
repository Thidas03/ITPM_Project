import React, { useState, useEffect } from 'react';
import TutorScheduleManager from '../features/sessions/components/TutorScheduleManager';
import SmartSlotRecommend from '../features/sessions/components/SmartSlotRecommend';
import BookingModal from '../features/bookings/components/BookingModal';
import { getTutorAvailability } from '../features/sessions/services/availabilityService';
import { getStudentBookings, cancelBooking } from '../features/bookings/services/bookingService';

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
    const user = getCurrentUser();
    const [selectedTutorId, setSelectedTutorId] = useState('mock_tutor_456'); // Mock active tutor
    const [availabilitySlots, setAvailabilitySlots] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAvailabilityToBook, setSelectedAvailabilityToBook] = useState(null);
    const [studentBookings, setStudentBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    useEffect(() => {
        if (user.role === 'student') {
            fetchAvailableSlots();
            fetchStudentBookings();
        }
        // eslint-disable-next-line
    }, [user.role, selectedTutorId]);

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
