import React, { useState, useEffect } from 'react';
import SessionCard from '../features/sessions/components/SessionCard';
import BookingModal from '../features/bookings/components/BookingModal';
import { getTutorAvailability } from '../features/sessions/services/availabilityService';
import { getTutorSessions } from '../features/sessions/services/sessionService';
import { getStudentBookings, cancelBooking, createSessionBooking } from '../features/bookings/services/bookingService';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaUser, FaLink, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';

// Mock Auth logic for student demo
const getCurrentUser = () => ({
  _id: '60d0fe4f5311236168a109cb',
  role: 'student',
  name: 'Alex Student'
});

// Mock tutor list – in real app this would come from API
const MOCK_TUTORS = [
  { _id: '60d0fe4f5311236168a109ca', name: 'Alex Tutor' },
  { _id: '60d0fe4f5311236168a109cc', name: 'Jordan Mentor' },
  { _id: '60d0fe4f5311236168a109cd', name: 'Taylor Coach' }
];

const StudentDashboard = () => {
  const user = getCurrentUser();
  // Default to the first mock tutor (matches TutorDashboard ID so sessions line up)
  const [selectedTutorId, setSelectedTutorId] = useState(MOCK_TUTORS[0]._id);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [tutorSessions, setTutorSessions] = useState([]);
  const [studentBookings, setStudentBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
    fetchTutorSessions();
    fetchStudentBookings();
    // eslint-disable-next-line
  }, [selectedTutorId]);

  const fetchAvailableSlots = async () => {
    try {
      const data = await getTutorAvailability(selectedTutorId);
      const available = data.data || data;
      setAvailabilitySlots(available);
    } catch (error) {
      console.error('Failed to fetch availability slots', error);
    }
  };

  const fetchTutorSessions = async () => {
    try {
      const data = await getTutorSessions(selectedTutorId);
      const sessions = data.data || data;
      setTutorSessions(sessions);
    } catch (error) {
      console.error('Failed to fetch tutor sessions', error);
    }
  };

  const fetchStudentBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await getStudentBookings(user._id);
      setStudentBookings(data.data || data);
    } catch (error) {
      console.error('Failed to fetch student bookings', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingSuccess = () => {
    fetchAvailableSlots();
    fetchTutorSessions();
    fetchStudentBookings();
  };

  const handleBookScheduledSession = async (session) => {
    try {
      await createSessionBooking({
        student: user._id,
        session: session._id
      });
      toast.success('Session booked successfully.');
      fetchTutorSessions();
      fetchStudentBookings();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to book session';
      toast.warning(msg);
    }
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

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 shrink-0">
            STUEDU – Student
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
        <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-3">Book a Session</h1>
            <p className="text-gray-400 text-lg">
              Browse upcoming sessions and secure your spot.
            </p>
          </div>

          {/* Tutor selector */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-gray-400">Viewing tutor</span>
              <select
                className="mt-1 bg-transparent text-sm text-white font-medium focus:outline-none"
                value={selectedTutorId}
                onChange={(e) => setSelectedTutorId(e.target.value)}
              >
                {MOCK_TUTORS.map((tutor) => (
                  <option key={tutor._id} value={tutor._id} className="bg-gray-900 text-white">
                    {tutor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Tutor Scheduled Sessions from DB */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2">Tutor Scheduled Sessions</h2>

          {tutorSessions.length === 0 ? (
            <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-xl text-gray-400 mb-2">No scheduled sessions found.</p>
              <p className="text-gray-500 text-sm">The tutor has not created specific dated sessions yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tutorSessions.map(session => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onBook={handleBookScheduledSession}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tutor Working Hours (View Only) */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 border-b border-gray-800 pb-2 flex items-center gap-2">
            <FaClock className="text-indigo-400" /> Tutor Working Hours
          </h2>

          {availabilitySlots.length === 0 ? (
            <div className="text-center py-10 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-gray-400">The tutor has not set their recurring working hours yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availabilitySlots.map(slot => (
                <div
                  key={slot._id}
                  className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 flex flex-col items-center text-center"
                >
                  <h3 className="text-lg font-bold text-white mb-1">
                    {slot.dayOfWeek}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {slot.startTime} - {slot.endTime}
                  </p>
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
                const startTime = booking.session ? booking.session.startTime : (booking.availability ? booking.availability.startTime : 'N/A');
                const endTime = booking.session ? booking.session.endTime : (booking.availability ? booking.availability.endTime : 'N/A');

                let statusClass = 'bg-teal-500/10 text-teal-300 border-teal-500/40';
                let StatusIcon = FaCheckCircle;

                if (booking.status === 'completed') {
                  statusClass = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40';
                  StatusIcon = FaCheckCircle;
                } else if (booking.status === 'cancelled') {
                  statusClass = 'bg-red-500/10 text-red-300 border-red-500/40';
                  StatusIcon = FaTimesCircle;
                }

                return (
                  <div
                    key={booking._id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-5 bg-gray-800 rounded-2xl border border-gray-700 shadow-lg hover:border-gray-600 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-white font-bold text-lg flex items-center gap-2">
                          <FaCalendarAlt className="text-teal-500" /> {dateLabel}
                        </span>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-200 font-medium flex items-center gap-2">
                          <FaClock className="text-teal-500" /> {startTime} - {endTime}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md border flex items-center gap-1 ${statusClass}`}>
                          <StatusIcon size={10} /> {booking.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 mt-3">
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <FaUser className="text-indigo-400" />
                          Tutor: <span className="text-gray-200 font-semibold">{booking.tutor?.name || 'N/A'}</span>
                        </div>

                        {isUpcoming && booking.meetingLink && (
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <FaLink className="text-teal-400" />
                            Meeting: <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline font-medium">Join Jitsi Meet</a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                      {isUpcoming && booking.meetingLink && (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all text-center flex items-center justify-center gap-2"
                        >
                          <FaLink /> Join Meeting
                        </a>
                      )}
                      {isUpcoming && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-red-500/50 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default StudentDashboard;

