import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        
        // Handle clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const clearAll = async () => {
        try {
            await api.delete('/notifications');
            setNotifications([]);
            setUnreadCount(0);
            toast.info('Notifications cleared');
        } catch (error) {
            toast.error('Failed to clear notifications');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-xl transition"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg border border-gray-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl overflow-hidden z-50 transform origin-top-right transition-all">
                    <div className="p-4 bg-gray-900/50 flex justify-between items-center border-b border-gray-700">
                        <h3 className="font-black text-xs uppercase tracking-widest text-teal-500">Notifications</h3>
                        {notifications.length > 0 && (
                            <button 
                                onClick={clearAll}
                                className="text-[10px] font-black text-gray-500 hover:text-red-400 uppercase tracking-tighter transition"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-gray-500 text-sm font-medium">No alerts yet.</p>
                                <p className="text-[10px] text-gray-600 mt-1 italic italic">We'll notify you here.</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif._id} 
                                    onClick={() => markAsRead(notif._id)}
                                    className={`p-4 border-b border-gray-700/50 hover:bg-teal-500/5 transition cursor-pointer relative ${!notif.isRead ? 'bg-teal-500/5 shadow-inner shadow-teal-500/5' : ''}`}
                                >
                                    {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-full"></div>}
                                    <h4 className="text-xs font-black text-gray-200 mb-1 flex justify-between items-center">
                                        {notif.title}
                                        {notif.type === 'urgent' && <span className="bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 rounded-full border border-red-500/20 uppercase tracking-widest font-black animate-pulse">Urgent</span>}
                                    </h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        {notif.message}
                                    </p>
                                    <p className="text-[9px] text-gray-600 mt-2 font-black uppercase tracking-widest">
                                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 bg-gray-900/30 text-center border-t border-gray-700">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Notification History</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
