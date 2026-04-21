import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TutorScheduleManager from '../features/sessions/components/TutorScheduleManager';
import QuizCreatorModal from '../Mageepan/Quizzes/components/QuizCreatorModal';

import { getNotifications, markAllAsRead } from '../features/notifications/services/notificationService';
import { useAuth } from '../context/AuthContext';
import { getFeedbackByTutor } from '../services/feedbackService';
import api from '../services/api';

const TutorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [trustProfile, setTrustProfile] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, pending: 0 });
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [isWalletHistoryModalOpen, setIsWalletHistoryModalOpen] = useState(false);
  const [walletHistory, setWalletHistory] = useState([]);



  useEffect(() => {
    fetchWallet();
    const fetchTrustProfile = async () => {
      try {
        const response = await api.get('/auth/profile/trust');
        setTrustProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch trust profile", error);
      }
    };
    fetchTrustProfile();
    fetchNotifications();
    fetchFeedbacks();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchWallet();
    }, 5000); 
    return () => clearInterval(interval);
  }, []);

  const fetchAttendanceReport = async (sessionId) => {
    try {
      const { data } = await api.get(`/bookings/session/${sessionId}/attendance`);
      setAttendanceReport(data);
      setShowAttendanceModal(true);
    } catch (error) {
      console.error('Failed to fetch attendance report', error);
    }
  };


  const fetchWallet = async () => {
    try {
      const { data } = await api.get(`/payments/balance/${user._id}`);
      setWallet(data);
    } catch (error) {
      console.error('Failed to fetch wallet info', error);
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
    }
  };

  const openWalletHistory = () => {
    fetchWalletHistory();
    setIsWalletHistoryModalOpen(true);
  };


  const fetchFeedbacks = async () => {
    try {
      const tutorName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || user._id;
      const response = await getFeedbackByTutor(tutorName);
      setFeedbacks(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      console.error('Failed to fetch tutor feedback', error);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

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

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 shrink-0 hover:opacity-80 transition">
            STUEDU – Tutor
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
                      (user?.firstName || 'T').charAt(0)
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

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Dynamic Access Status Card */}
        {trustProfile && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-800 p-6 rounded-[2rem] border border-gray-700 shadow-xl shadow-blue-50/50">
                <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-gray-700 pb-6 md:pb-0 md:pr-6 flex flex-col justify-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tutor Trust Profile</p>
                    <h2 className={`text-4xl font-black mb-1 ${trustProfile.trustLevel === 'High' ? 'text-green-500' : trustProfile.trustLevel === 'Medium' ? 'text-teal-400' : 'text-red-500'}`}>
                        {trustProfile.trustLevel} Trust
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Sessions</p>
                            <p className="text-lg font-bold text-teal-400">{trustProfile.stats?.attended || 0}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Success</p>
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
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Session Quota</p>
                            <p className="text-2xl font-bold text-gray-300">{trustProfile.bookingLimit} Active Slots</p>
                            <div className="mt-1 flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-1 w-4 rounded-full ${i < trustProfile.bookingLimit ? 'bg-gradient-to-r from-teal-500 to-indigo-600' : 'bg-gray-800'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-4 pt-6 md:pt-0 md:pl-6 flex flex-col justify-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tutor Badges</p>
                    <div className="flex flex-wrap gap-2">
                        {trustProfile.badges && trustProfile.badges.map(badge => (
                            <span key={badge} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100 animate-pulse">
                                ✨ {badge}
                            </span>
                        ))}
                        {trustProfile.stats && trustProfile.stats.attendanceRate > 90 && (
                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100">
                                Top Rated host
                            </span>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Financial Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-[2rem] border border-gray-700 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-all duration-700"></div>
                <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-bold border border-green-500/20 uppercase">Ready for Payout</span>
                </div>
                <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">Rs {wallet.balance.toFixed(2)}</h3>
                <p className="text-gray-400 text-sm font-medium">Net Earnings from completed & confirmed sessions.</p>
                <div className="mt-6 flex gap-3">
                    <button className="px-6 py-2 bg-teal-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-400 transition shadow-lg shadow-teal-500/20">Request Payout</button>
                    <button onClick={openWalletHistory} className="px-6 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-700 transition">History</button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-[2rem] border border-gray-700 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700"></div>
                <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Held in Escrow</p>
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/20 uppercase">Pending Confirmation</span>
                </div>
                <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">Rs {wallet.pending.toFixed(2)}</h3>
                <p className="text-gray-400 text-sm font-medium">Funds held securely until students confirm session quality.</p>
                <Link to="/my-sessions" className="mt-6 inline-block text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors uppercase tracking-widest">View Pending Sessions →</Link>
            </div>
        </div>


        {/* Tutor schedule manager */}
        <section>
          <TutorScheduleManager 
            tutorId={user._id} 
            onManageQuiz={(sessionId) => {
              setSelectedSessionId(sessionId);
              setIsQuizModalOpen(true);
            }} 
            onViewAttendance={(sessionId) => fetchAttendanceReport(sessionId)}
          />
        </section>

        <QuizCreatorModal
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            sessionId={selectedSessionId}
            tutorId={user._id}
        />

        {/* Attendance Modal */}
        {showAttendanceModal && attendanceReport && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-gray-800 w-full max-w-2xl rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                        <div>
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                📊 Session Attendance Report
                            </h3>
                            <p className="text-gray-400 text-sm font-medium mt-1">Real-time participation tracking logs</p>
                        </div>
                        <button onClick={() => setShowAttendanceModal(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20">
                                <p className="text-xs font-black text-teal-500 uppercase tracking-widest mb-1">Attended</p>
                                <p className="text-3xl font-black text-white">{attendanceReport.attended.length}</p>
                            </div>
                            <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                                <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Missed</p>
                                <p className="text-3xl font-black text-white">{attendanceReport.missed.length}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Attended Students</h4>
                            {attendanceReport.attended.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No students attended this session yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {attendanceReport.attended.map(s => (
                                        <div key={s._id} className="p-4 bg-gray-900/50 rounded-xl border border-green-500/20 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs uppercase">
                                                    {s.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-300">{s.firstName} {s.lastName}</p>
                                                    <p className="text-[10px] text-gray-500 tracking-tighter">{s.email}</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-black uppercase">Verified</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest pt-4">Missed Students</h4>
                            {attendanceReport.missed.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No students missed this session.</p>
                            ) : (
                                <div className="space-y-2">
                                    {attendanceReport.missed.map(s => (
                                        <div key={s._id} className="p-4 bg-gray-900/50 rounded-xl border border-red-500/20 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs uppercase">
                                                    {s.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-300">{s.firstName} {s.lastName}</p>
                                                    <p className="text-[10px] text-gray-500 tracking-tighter">{s.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-[10px] font-black uppercase inline-block">Missed</span>
                                                <p className="text-[10px] text-gray-500 mt-1">Trust Impacted</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-6 border-t border-gray-700 bg-gray-900/50 text-right">
                        <button
                            onClick={() => setShowAttendanceModal(false)}
                            className="px-8 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-gray-700"
                        >
                            Close Report
                        </button>
                    </div>
                </div>
            </div>
        )}


        {/* Student Feedback Section */}
        <section className="bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-700 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Student Feedback
            </h2>
          </div>
          {loadingFeedbacks ? (
            <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-700 border-dashed">
              <p className="text-gray-400 text-lg animate-pulse">Loading feedback...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-700 border-dashed">
              <p className="text-gray-400 text-lg">No feedback received yet.</p>
              <p className="text-gray-500 text-sm mt-2">Feedback from your completed sessions will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.map(feedback => (
                <div key={feedback._id} className="bg-gray-900/80 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full text-xs font-bold border border-teal-500/20">{feedback.category || 'General'}</span>
                    <span className="text-gray-500 text-xs">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">&quot;{feedback.comment}&quot;</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Wallet History Modal */}
      {isWalletHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-black text-white">Earnings & Escrow History</h3>
                <p className="text-sm text-gray-400 font-medium">Your recent transactions and session earnings.</p>
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
                  <p className="text-sm text-gray-500 mt-1">Host sessions to earn credits and see your history here.</p>
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
                            {tx.status === 'held_in_escrow' ? 'Session Earning (Escrow)' : 
                             tx.status === 'released' ? 'Session Earning (Released)' : 
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
                          'text-green-400'
                        }`}>
                          + Rs {tx.tutorEarnings ? tx.tutorEarnings.toFixed(2) : tx.amount.toFixed(2)}
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

export default TutorDashboard;

