import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TutorScheduleManager from '../features/sessions/components/TutorScheduleManager';
import { getNotifications, markAllAsRead } from '../features/notifications/services/notificationService';
import { useAuth } from '../context/AuthContext';

const TutorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
        {/* Tutor schedule manager */}
        <section>
          <TutorScheduleManager tutorId={user._id} />
        </section>

        {/* Student Feedback Section (Placeholder) */}
        <section className="bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
            <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Student Feedback
          </h2>
          <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-700 border-dashed">
            <p className="text-gray-400 text-lg">No feedback received yet.</p>
            <p className="text-gray-500 text-sm mt-2">Feedback from your completed sessions will appear here.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TutorDashboard;

