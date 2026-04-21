import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SessionCard from '../features/sessions/components/SessionCard';
import SessionDetailsModal from '../features/sessions/components/SessionDetailsModal';
import ConfirmationModal from '../features/common/components/ConfirmationModal';
import BookingModal from '../features/bookings/components/BookingModal';
import CheckoutModal from '../Mageepan/Checkout/CheckoutModal';
import { getTutorAvailability } from '../features/sessions/services/availabilityService';
import { getTutorSessions } from '../features/sessions/services/sessionService';
import { getStudentBookings, cancelBooking, createSessionBooking } from '../features/bookings/services/bookingService';
import { getNotifications, markAllAsRead } from '../features/notifications/services/notificationService';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaUser, FaLink, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getLastReadAt } from '../features/chat/utils/unread';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [selectedTutorId, setSelectedTutorId] = useState('');
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Checkout State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutSessionData, setCheckoutSessionData] = useState(null);
  const [trustProfile, setTrustProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [unreadCountBySession, setUnreadCountBySession] = useState({});
  const [isWalletHistoryModalOpen, setIsWalletHistoryModalOpen] = useState(false);
  const [walletHistory, setWalletHistory] = useState([]);

  useEffect(() => {
    const fetchTrustProfile = async () => {
      try {
        const response = await api.get('/auth/profile/trust');
        setTrustProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch trust profile", error);
      }
    };
    fetchTrustProfile();
    fetchTutors();
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const { data } = await api.get(`/payments/balance/${user._id}`);
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Failed to fetch wallet balance', error);
    }
  };

  const handleRechargeWallet = async () => {
    const amount = window.prompt('Enter amount to recharge (LKR):', '1000');
    if (!amount || isNaN(amount)) return;

    try {
      const { data } = await api.post('/payments/mock-recharge', {
        userId: user._id,
        amount: parseFloat(amount)
      });
      
      if (data.success) {
        toast.success(`Wallet successfully recharged with Rs ${amount}!`);
        fetchWalletBalance(); // Instantly update the dashboard balance
        fetchWalletHistory(); // Update history if open
      }
    } catch (error) {
      toast.error('Failed to initiate recharge');
      console.error(error);
    }
  };

  const fetchWalletHistory = async () => {
    try {
      const { data } = await api.get(`/payments/history/${user._id}`);
      if (data.success) {
        setWalletHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet history', error);
      toast.error('Failed to load wallet history');
    }
  };

  const openWalletHistory = () => {
    fetchWalletHistory();
    setIsWalletHistoryModalOpen(true);
  };

  const fetchTutors = async () => {
    try {
      const response = await api.get('/users/tutors');
      if (response.data.success && response.data.data.length > 0) {
        setTutors(response.data.data);
        setSelectedTutorId(response.data.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch tutors', error);
      toast.error('Failed to load tutors');
    }
  };

  useEffect(() => {
    if (!selectedTutorId) return;
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
      const nextBookings = data.data || data;
      setStudentBookings(nextBookings);

      // Trigger unread refresh immediately after load
      const sessionIds = Array.from(new Set(
        (nextBookings || [])
          .map(b => b?.session?._id)
          .filter(Boolean)
      ));
      if (sessionIds.length > 0) {
        const results = await Promise.all(
          sessionIds.map(async (sid) => {
            try {
              const sinceMs = getLastReadAt(sid);
              const sinceIso = new Date(sinceMs || 0).toISOString();
              const { data: resp } = await api.get(`/messages/${sid}/unread-count`, { params: { since: sinceIso, _: Date.now() } });
              return [sid, Number(resp?.data?.count || 0)];
            } catch {
              return [sid, 0];
            }
          })
        );
        setUnreadCountBySession(Object.fromEntries(results));
      }
    } catch (error) {
      console.error('Failed to fetch student bookings', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadUnread = async () => {
      try {
        const sessionIds = Array.from(new Set(
          (studentBookings || [])
            .map(b => b?.session?._id)
            .filter(Boolean)
        ));
        if (sessionIds.length === 0) {
          if (mounted) setUnreadCountBySession({});
          return;
        }

        const results = await Promise.all(
          sessionIds.map(async (sid) => {
            try {
              const sinceMs = getLastReadAt(sid);
              const sinceIso = new Date(sinceMs || 0).toISOString();
              const { data } = await api.get(`/messages/${sid}/unread-count`, { params: { since: sinceIso, _: Date.now() } });
              return [sid, Number(data?.data?.count || 0)];
            } catch {
              return [sid, 0];
            }
          })
        );
        if (mounted) setUnreadCountBySession(Object.fromEntries(results));
      } catch {}
    };

    loadUnread();
    const id = setInterval(loadUnread, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [studentBookings]);

  const handleBookingSuccess = () => {
    fetchAvailableSlots();
    fetchTutorSessions();
    fetchStudentBookings();
  };

  const handleViewSessionDetails = (session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const handleInitiateSessionCheckout = (session) => {
    if (!user?._id) return toast.error('Please login first');
    setCheckoutSessionData({
      id: session._id,
      name: `Tutoring Session`,
      price: session.price || 0,
      originalSession: session
    });
    setIsSessionModalOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleProcessCheckoutSuccess = async () => {
    if (!checkoutSessionData?.originalSession) return;
    const session = checkoutSessionData.originalSession;
    
    try {
      await createSessionBooking({
        student: user._id,
        session: session._id
      });
      toast.success('Session booked successfully.');
      fetchTutorSessions();
      fetchStudentBookings();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Failed to book session';
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
          <Link to="/" className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 shrink-0 hover:opacity-80 transition">
            STUEDU – Student
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/my-sessions" className="px-4 py-1.5 bg-gray-900 border border-gray-700 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-500/10 hover:text-teal-400 transition hidden md:block">My History</Link>
            <Link to="/profile" className="px-4 py-1.5 bg-gray-900 border border-gray-700 text-teal-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-500/10 transition hidden md:block">Settings</Link>
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

            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 focus:outline-none hover:bg-gray-800/50 p-1.5 rounded-full transition-colors"
               >
                <span className="text-gray-400 text-sm hidden sm:inline">Logged in as {user?.firstName} {user?.lastName}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center font-bold relative overflow-hidden">
                  {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                      (user?.firstName || 'S').charAt(0)
                  )}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="py-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors"
                    >
                      Profile Management
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              )}
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
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <Link
              to="/tutor-reviews"
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-teal-400 text-sm font-medium rounded-xl transition-colors border border-gray-600 hover:border-teal-500 shadow-sm flex items-center gap-2"
            >
              View Tutor Reviews
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-gray-400">Viewing tutor</span>
                <select
                  className="mt-1 bg-transparent text-sm text-white font-medium focus:outline-none"
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                >
                  {tutors.map((tutor) => (
                    <option key={tutor._id} value={tutor._id} className="bg-gray-900 text-white">
                      {tutor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Access Status Card */}
        {trustProfile && (
            <div className="mb-10 grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-800 p-6 rounded-[2rem] border border-gray-700 shadow-xl shadow-blue-50/50">
                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-700 pb-6 md:pb-0 md:pr-6 flex flex-col justify-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dynamic Access Profile</p>
                    <h2 className={`text-4xl font-black mb-1 ${trustProfile.trustLevel === 'High' ? 'text-green-500' : trustProfile.trustLevel === 'Medium' ? 'text-teal-400' : 'text-red-500'}`}>
                        {trustProfile.trustLevel} Trust
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Attended</p>
                            <p className="text-lg font-bold text-teal-400">{trustProfile.stats?.attended || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Missed</p>
                            <p className="text-lg font-bold text-red-400">{trustProfile.stats?.missed || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Rate</p>
                            <p className="text-lg font-bold text-white">{trustProfile.stats?.attendanceRate || 0}%</p>
                        </div>
                    </div>
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
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Participation Rewards</p>
                    <div className="flex flex-wrap gap-2">
                        {trustProfile.badges && trustProfile.badges.map(badge => (
                            <span key={badge} className="px-3 py-1 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-teal-500/20">
                                ✨ {badge}
                            </span>
                        ))}
                        <span className="px-3 py-1 bg-gray-900 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-gray-700">
                            Cancellations: {trustProfile.stats?.cancellations || 0}
                        </span>
                    </div>
                </div>
            </div>
        )}

        {/* Wallet & Credits Card */}
        <div className="mb-10 bg-gradient-to-br from-indigo-900/40 to-teal-900/40 p-6 rounded-[2rem] border border-gray-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center text-3xl text-teal-400 border border-teal-500/30">
                    💰
                </div>
                <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">StuEdu Wallet Credits</p>
                    <h3 className="text-4xl font-black text-white">Rs {walletBalance.toFixed(2)}</h3>
                </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={handleRechargeWallet}
                  className="flex-1 md:flex-none px-8 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-400 transition shadow-lg shadow-teal-500/20 uppercase tracking-widest"
                >
                  Recharge Now
                </button>
                <button 
                  onClick={openWalletHistory}
                  className="flex-1 md:flex-none px-8 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-700 transition uppercase tracking-widest text-center"
                >
                  History
                </button>
            </div>
        </div>


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
                  const meetingLink =
                    booking.meetingLink ||
                    booking.session?.meetingLink ||
                    (booking.session?._id ? `https://meet.jit.si/${booking.session._id}` : '');
                  const normalizedMeetingLink = meetingLink && meetingLink.includes('zoom.us')
                    ? meetingLink.replace('https://zoom.us', 'https://meet.jit.si')
                    : meetingLink;

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

                          {normalizedMeetingLink && (
                            <div className="text-sm text-gray-400 flex items-center gap-2">
                              <FaLink className="text-teal-400" />
                              Meeting: <a href={normalizedMeetingLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline font-medium">Join Jitsi Meet</a>
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
                        {booking.session?._id && booking.status !== 'cancelled' && (
                          <button
                            onClick={() => navigate(`/session/${booking.session._id}`)}
                            className="relative flex-1 md:flex-none px-4 py-2 rounded-xl border border-teal-500/50 text-teal-300 text-sm font-bold hover:bg-teal-500/10 transition-colors"
                          >
                            Open Chat
                            {unreadCountBySession[booking.session._id] > 0 && (
                              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black border border-gray-900">
                                {unreadCountBySession[booking.session._id] > 99 ? '99+' : unreadCountBySession[booking.session._id]}
                              </span>
                            )}
                          </button>
                        )}
                        {normalizedMeetingLink && (
                          <a
                            href={normalizedMeetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 md:flex-none px-6 py-2 text-white text-sm font-bold rounded-xl shadow-lg transition-all text-center flex items-center justify-center gap-2 ${canJoin ? 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:shadow-teal-500/25 cursor-pointer' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}
                            onClick={(e) => { if (!canJoin) e.preventDefault(); }}
                          >
                            <FaLink /> Join Jitsi
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
                            onClick={() => navigate('/feedback', { state: { sessionId: booking.session?._id || booking._id, tutorName: booking.tutor?.name || (booking.tutor?.firstName ? `${booking.tutor.firstName} ${booking.tutor.lastName}` : 'Tutor'), studentId: user._id, studentName: user.name || (user.firstName ? `${user.firstName} ${user.lastName}` : 'Student') } })}
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
        tutorName={tutors.find(t => t._id === selectedTutorId)?.name}
        onConfirm={handleInitiateSessionCheckout}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? You will lose your slot."
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        sessionData={checkoutSessionData}
        studentId={user?._id}
        onSuccess={handleProcessCheckoutSuccess}
      />

      {/* Wallet History Modal */}
      {isWalletHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-black text-white">Wallet History</h3>
                <p className="text-sm text-gray-400 font-medium">Your recent transactions and credits.</p>
              </div>
              <button 
                onClick={() => setIsWalletHistoryModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {walletHistory.length === 0 ? (
                <div className="text-center py-10 bg-gray-900/50 rounded-2xl border border-gray-700 border-dashed">
                  <p className="text-gray-400 text-lg font-medium">No transactions found.</p>
                  <p className="text-sm text-gray-500 mt-1">Recharge your wallet or pay for sessions to see history here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {walletHistory.map(tx => (
                    <div key={tx._id} className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700 flex justify-between items-center hover:border-gray-600 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner ${
                          tx.status === 'held_in_escrow' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                          tx.status === 'pending' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                          tx.status === 'failed' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                          'bg-green-500/20 text-green-500 border border-green-500/30'
                        }`}>
                          {tx.status === 'held_in_escrow' ? '⏳' :
                           tx.status === 'pending' ? '🔄' :
                           tx.status === 'failed' ? '❌' : '✅'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-200">
                            {tx.status === 'held_in_escrow' ? 'Session Payment (Escrow)' : 
                             tx.status === 'released' ? 'Session Payment (Released)' : 
                             'Wallet Transaction'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="text-gray-600">|</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              tx.status === 'held_in_escrow' ? 'bg-amber-500/10 text-amber-400' :
                              tx.status === 'pending' ? 'bg-blue-500/10 text-blue-400' :
                              tx.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                              'bg-green-500/10 text-green-400'
                            }`}>
                              {tx.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${
                          tx.status === 'held_in_escrow' ? 'text-amber-400' : 
                          'text-white'
                        }`}>
                          - Rs {tx.amount.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                          via {tx.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-700 bg-gray-900/50 text-right rounded-b-3xl">
              <button 
                onClick={() => setIsWalletHistoryModalOpen(false)}
                className="px-8 py-2.5 bg-gray-800 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
