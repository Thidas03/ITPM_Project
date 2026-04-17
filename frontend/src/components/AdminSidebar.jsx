import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ activeTab, onTabClick }) => {
    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: '📊', path: '/admin?tab=overview' },
        { id: 'users', label: 'User Control', icon: '👥', path: '/admin?tab=users' },
        { id: 'sessions', label: 'Sessions', icon: '📅', path: '/admin?tab=sessions' },
        { id: 'history_link', label: 'My History', icon: '📜', path: '/admin/history' },
        { id: 'payments', label: 'Financials', icon: '💳', path: '/admin?tab=payments' },
        { id: 'ratings', label: 'Feedback', icon: '⭐', path: '/admin-feedback' },
    ];

    return (
        <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl sticky top-0 h-screen">
            <div className="p-8 border-b border-slate-800">
                <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-lg flex items-center justify-center text-sm italic">S</span>
                    STUEDU ADMIN
                </h1>
            </div>
            <nav className="flex-1 p-6 space-y-2">
                {menuItems.map(item => {
                    const isActive = activeTab === item.id;
                    const isExternal = item.path.startsWith('/admin/') || item.path.startsWith('/admin-feedback');
                    
                    if (onTabClick && !isExternal && !item.path.includes('/admin/history')) {
                         // If we're on the dashboard and it's a dashboard tab
                         return (
                            <button
                                key={item.id}
                                onClick={() => onTabClick(item.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-gradient-to-r from-teal-600 to-indigo-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.label}
                            </button>
                         );
                    }

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-gradient-to-r from-teal-600 to-indigo-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-6 border-t border-slate-800">
                <Link to="/dashboard" className="flex items-center gap-3 text-slate-400 hover:text-white transition group font-bold text-sm">
                    <span className="group-hover:-translate-x-1 transition">←</span> Exit to System
                </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;
