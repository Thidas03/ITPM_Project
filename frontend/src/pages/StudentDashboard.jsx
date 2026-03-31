import React, { useState, useEffect } from 'react';
import SessionCard from '../features/sessions/components/SessionCard';
import SessionDetailsModal from '../features/sessions/components/SessionDetailsModal';
import ConfirmationModal from '../features/common/components/ConfirmationModal';
import BookingModal from '../features/bookings/components/BookingModal';
import { getTutorAvailability } from '../features/sessions/services/availabilityService';
import { getTutorSessions } from '../features/sessions/services/sessionService';
import { getStudentBookings, cancelBooking, createSessionBooking } from '../features/bookings/services/bookingService';
import { getNotifications, markAllAsRead } from '../features/notifications/services/notificationService';
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

const StudentDashboard = () => {
  const user = getCurrentUser();
  // Default to the first mock tutor (matches TutorDashboard ID so sessions line up)
  const [selectedTutorId, setSelectedTutorId] = useState(MOCK_TUTORS[0]._id);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tutorSessions, setTutorSessions] = useState([]);
  const [studentBookings, setStudentBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
    fetchTutorSessions();
    fetchStudentBookings();
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
    // eslint-disable-next-line
  }, [selectedTutorId]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(user._id);
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(user._id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

  const handleViewSessionDetails = (session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
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
      setIsSessionModalOpen(false);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to book session';
      toast.warning(msg);
    }
  };

  const openCancelModal = (bookingId) => {
    setCancelBookingId(bookingId);
    setIsCancelModalOpen(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancelBookingId) return;
    try {
      await cancelBooking(cancelBookingId);
      toast.success('Booking cancelled successfully');
      fetchAvailableSlots();
      fetchStudentBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Failed to cancel booking', error);
    } finally {
      setIsCancelModalOpen(false);
      setCancelBookingId(null);
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
          <div className="flex items-center gap-6">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30 transition-colors ${!notification.isRead ? 'bg-teal-500/5 border-l-2 border-l-teal-500' : ''}`}
                        >
                          <p className="text-sm text-gray-200 mb-1">{notification.message}</p>
                          <span className="text-[10px] text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm hidden sm:inline">Logged in as {user.name}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
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

          {tutorSessions.filter(s => s.status !== 'cancelled').length === 0 ? (
            <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-800 border-dashed">
              <p className="text-xl text-gray-400 mb-2">No scheduled sessions found.</p>
              <p className="text-gray-500 text-sm">The tutor has not created specific dated sessions yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tutorSessions.filter(s => s.status !== 'cancelled').map(session => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onViewDetails={handleViewSessionDetails}
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
              {studentBookings.filter(b => b.status !== 'cancelled').length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400">No active bookings found.</p>
                </div>
              ) : (
                studentBookings.filter(b => b.status !== 'cancelled').map(booking => {
                  const dateLabel = new Date(booking.bookingDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  const startTime = booking.session ? booking.session.startTime : (booking.availability ? booking.availability.startTime : 'N/A');
                  const endTime = booking.session ? booking.session.endTime : (booking.availability ? booking.availability.endTime : 'N/A');

                  const startDateTime = parseSessionTime(booking.bookingDate, startTime);
                  const endDateTime = parseSessionTime(booking.bookingDate, endTime);
                  
                  let sessionPhase = 'completed';
                  if (startDateTime && endDateTime) {
                    if (currentTime < startDateTime) sessionPhase = 'upcoming';
                    else if (currentTime >= startDateTime && currentTime <= endDateTime) sessionPhase = 'ongoing';
                  }

                  let countdownStr = '';
                  let phaseColorClass = '';
                  if (sessionPhase === 'upcoming') {
                    const diff = startDateTime - currentTime;
                    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                    const m = Math.floor((diff / 1000 / 60) % 60);
                    const s = Math.floor((diff / 1000) % 60);
                    let parts = [];
                    if (d > 0) parts.push(`${d}d`);
                    if (h > 0 || d > 0) parts.push(`${h}h`);
                    if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
                    parts.push(`${s}s`);
                    countdownStr = `Starts in ${parts.join(' ')}`;
                    phaseColorClass = 'text-green-400 font-bold';
                  } else if (sessionPhase === 'ongoing') {
                    countdownStr = 'Session in Progress';
                    phaseColorClass = 'text-yellow-400 font-bold';
                  } else {
                    countdownStr = 'Session Completed';
                    phaseColorClass = 'text-gray-500 font-bold';
                  }

                  let statusLabel = booking.status;
                  let statusClass = 'bg-gray-500/10 text-gray-400 border-gray-500/40';
                  let StatusIcon = FaCheckCircle;

                  if (booking.status === 'cancelled') {
                    statusClass = 'bg-red-500/10 text-red-300 border-red-500/40';
                    StatusIcon = FaTimesCircle;
                  } else if (sessionPhase === 'upcoming') {
                    statusLabel = 'upcoming';
                    statusClass = 'bg-green-500/10 text-green-400 border-green-500/40';
                    StatusIcon = FaCheckCircle;
                  } else if (sessionPhase === 'ongoing') {
                    statusLabel = 'in progress';
                    statusClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40';
                    StatusIcon = FaExclamationCircle;
                  } else {
                    statusLabel = 'completed';
                    statusClass = 'bg-gray-500/10 text-gray-400 border-gray-500/40';
                    StatusIcon = FaCheckCircle;
                  }

                  const canJoin = startDateTime && endDateTime && (currentTime >= new Date(startDateTime.getTime() - 10 * 60000) && currentTime <= endDateTime);

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
                            <StatusIcon size={10} /> {statusLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 mt-3">
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <FaUser className="text-indigo-400" />
                            Tutor: <span className="text-gray-200 font-semibold">{booking.tutor?.name || 'N/A'}</span>
                          </div>

                          {booking.meetingLink && (
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <FaLink className="text-teal-400" />
                              Meeting: <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline font-medium">Join Jitsi Meet</a>
                            </div>
                          )}
                          
                          {booking.status !== 'cancelled' && (
                            <div className={`text-sm ${phaseColorClass} flex items-center gap-2`}>
                              <FaClock /> {countdownStr}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                        {booking.meetingLink && (
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 md:flex-none px-6 py-2 text-white text-sm font-bold rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 ${canJoin ? 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:shadow-teal-500/25 cursor-pointer' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}
                            onClick={(e) => { if (!canJoin) e.preventDefault(); }}
                          >
                            <FaLink /> Join Meeting
                          </a>
                        )}
                        {sessionPhase === 'upcoming' && booking.status !== 'cancelled' && (
                          <button
                            onClick={() => openCancelModal(booking._id)}
                            className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-red-500/50 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                        {sessionPhase === 'completed' && booking.status !== 'cancelled' && (
                          <button
                            className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-blue-500/50 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-colors"
                          >
                            Give Feedback
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>

      {/* Session Details Modal */}
      <SessionDetailsModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        session={selectedSession}
        tutorName={MOCK_TUTORS.find(t => t._id === selectedTutorId)?.name}
        onConfirm={handleBookScheduledSession}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? You will lose your slot."
      />

    </div>
  );
};

export default StudentDashboard;

