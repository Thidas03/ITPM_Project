import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
    const location = useLocation();
    const getTabFromUrl = (search) => new URLSearchParams(search).get('tab') || 'overview';

    const [activeTab, setActiveTab] = useState(getTabFromUrl(location.search));
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tab = getTabFromUrl(location.search);
        if (tab !== activeTab) setActiveTab(tab);
    }, [location.search]);

    // Advanced CRUD State
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({ firstName: '', lastName: '', email: '', role: 'Student' });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, sessionsRes, txRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/sessions'),
                api.get('/admin/transactions')
            ]);
            setStats(statsRes.data.stats);
            setUsers(usersRes.data.users);
            setSessions(sessionsRes.data.sessions);
            setTransactions(txRes.data.transactions);
        } catch (error) {
            toast.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, isBlocked) => {
        try {
            await api.put(`/admin/users/${userId}/status`, { isBlocked });
            toast.success(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
            fetchAdminData();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success('User deleted');
            fetchAdminData();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleApproveHost = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}`, { role: 'Host', tutorRequestStatus: 'approved' });
            toast.success('User upgraded to Host successfully');
            fetchAdminData();
        } catch (error) {
            toast.error('Approval failed');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const { firstName, lastName, email } = newUserForm;

        // Name Validation
        if (!/^[A-Z]/.test(firstName)) {
            toast.error('First name must start with a capital letter');
            return;
        }
        if (!/^[A-Z]/.test(lastName)) {
            toast.error('Last name must start with a capital letter');
            return;
        }

        // Email Validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            const res = await api.post('/admin/users', newUserForm);
            toast.success(res.data.message || 'User successful');
            setIsCreateModalOpen(false);
            setNewUserForm({ firstName: '', lastName: '', email: '', role: 'Student' });
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' ? true : u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-800"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            <AdminSidebar activeTab={activeTab} onTabClick={setActiveTab} />

            {/* Main Content Area */}
            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                            {activeTab.replace('-', ' ')}
                        </h2>
                        <p className="text-slate-500 font-medium">System-wide administrative control panel</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchAdminData} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl font-bold text-gray-400 hover:bg-gray-900 transition shadow-sm">
                            Refresh Data
                        </button>
                    </div>
                </header>

                {/* Dashboard Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Users', value: stats?.users, color: 'blue', icon: '👥' },
                                { label: 'Active Sessions', value: stats?.sessions, color: 'indigo', icon: '📅' },
                                { label: 'Total Bookings', value: stats?.bookings, color: 'green', icon: '✅' },
                                { label: 'Est. Revenue', value: `Rs. ${stats?.revenue}`, color: 'amber', icon: '💰' },
                            ].map((s, i) => (
                                <div key={i} className="bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:scale-125 transition`}>{s.icon}</div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                                    <p className={`text-4xl font-black text-gray-300`}>{s.value}</p>
                                    <div className={`h-1 w-12 bg-${s.color}-500 mt-4 rounded-full`}></div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-gray-800 p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                    <span className="w-2 h-6 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full"></span>
                                    Recent Registrations
                                </h3>
                                <div className="space-y-4">
                                    {users.slice(0, 5).map(u => (
                                        <div key={u._id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-slate-100 hover:border-gray-600 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                                                    {u.firstName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-300 leading-none mb-1">{u.firstName} {u.lastName}</p>
                                                    <p className="text-xs text-slate-400 uppercase font-black tracking-tighter">{u.role}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] bg-gray-800 px-2 py-1 rounded-lg border border-gray-700 text-slate-400 font-bold">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-800 p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                    <span className="w-2 h-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"></span>
                                    System Utilization
                                </h3>
                                <div className="flex flex-col items-center justify-center h-full pb-8">
                                    <div className="w-48 h-48 rounded-full border-[12px] border-slate-50 flex flex-col items-center justify-center relative">
                                        <div className="absolute inset-0 border-[12px] border-blue-500 rounded-full border-t-transparent -rotate-45"></div>
                                        <p className="text-4xl font-black text-gray-300">82%</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Growth Index</p>
                                    </div>
                                    <p className="mt-6 text-sm text-slate-400 font-medium max-w-[200px] text-center italic">
                                        "Platform scaling is optimal based on concurrent sessions."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-800 p-4 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex gap-4 items-center flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-teal-500 w-full max-w-sm"
                                />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-teal-500"
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Student">Student</option>
                                    <option value="Host">Host</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-teal-400 hover:to-indigo-500 transition"
                            >
                                + Add or Upgrade User
                            </button>
                        </div>

                        <div className="bg-gray-800 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest"># ID</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Access Role</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Trust Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Operational Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map(u => (
                                        <tr key={u._id} className="hover:bg-gray-900/50 transition border-b border-gray-700/50">
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-black text-teal-500">#{u.identityNumber || 'N/A'}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-800 overflow-hidden">
                                                        {u.profilePicture ? (
                                                            <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{u.firstName[0]}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-300">{u.firstName} {u.lastName}</p>
                                                        <p className="text-xs text-slate-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.role === 'Admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : u.role === 'Host' ? 'bg-teal-500/10 text-teal-400 border border-gray-700' : 'bg-gray-800 text-gray-400'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${!u.isActive ? 'bg-gray-500' : u.isBlocked ? 'bg-red-500' : 'bg-gradient-to-r from-teal-500 to-indigo-600'}`}></div>
                                                        <span className="text-xs font-bold text-gray-300">
                                                            {!u.isActive ? 'Inactive' : u.isBlocked ? 'Blocked' : 'Active'}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                        Trust: <span className={u.trustScore >= 75 ? 'text-green-500' : u.trustScore >= 50 ? 'text-teal-500' : 'text-amber-500'}>{u.trustScore || 100}%</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 flex-wrap max-w-[200px] ml-auto">
                                                    {u.tutorRequestStatus === 'pending' && (
                                                        <button onClick={() => handleApproveHost(u._id)} className="px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-black transition">
                                                            Approve Host
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleBlockUser(u._id, !u.isBlocked)}
                                                        className={`px-3 py-2 rounded-xl text-xs font-black transition ${u.isBlocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-900 text-gray-400 hover:bg-gray-800'}`}
                                                    >
                                                        {u.isBlocked ? 'Unblock' : 'Block'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        className="px-3 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-xs font-black transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map(s => (
                            <div key={s._id} className="bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${s.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-teal-500/10 text-teal-400'}`}>
                                        {s.status}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400">{new Date(s.date).toLocaleDateString()}</p>
                                </div>
                                <h4 className="text-lg font-black text-gray-300 leading-tight mb-4">
                                    {s.startTime} - {s.endTime}
                                </h4>
                                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-2xl">
                                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs uppercase">
                                        {s.tutor?.firstName[0]}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Host/Tutor</p>
                                        <p className="text-xs font-bold text-gray-300">{s.tutor?.firstName} {s.tutor?.lastName}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-center px-1">
                                    <p className="text-xs font-bold text-gray-400">Bookings: <span className="text-gray-300">{s.currentParticipants}/{s.maxParticipants}</span></p>
                                    <button className="text-xs font-black text-teal-500 hover:underline">View Logs</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Attendance Analytics Tab */}
                {activeTab === 'attendance' && (
                    <div className="space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-xl">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Attendance Rate</p>
                                <p className="text-4xl font-black text-teal-500">
                                    {(users.filter(u => (u.attendedSessions + u.missedSessions) > 0)
                                        .reduce((acc, u) => acc + (u.attendedSessions / (u.attendedSessions + u.missedSessions) * 100), 0) / 
                                        (users.filter(u => (u.attendedSessions + u.missedSessions) > 0).length || 1)).toFixed(1)}%
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Platform-wide KPI</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-xl">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active vs Inactive</p>
                                <p className="text-4xl font-black text-indigo-400">
                                    {users.filter(u => (u.attendedSessions + u.missedSessions) > 0).length} / {users.length}
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Users with session history</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-3xl border border-slate-100 shadow-xl">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Critical Alerts</p>
                                <p className="text-4xl font-black text-rose-500">
                                    {users.filter(u => {
                                        const total = u.attendedSessions + u.missedSessions;
                                        return total >= 3 && (u.attendedSessions / total * 100) < 50;
                                    }).length}
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Users below 50% attendance</p>
                            </div>
                        </div>

                        {/* Low Attendance Monitoring */}
                        <div className="bg-gray-800 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-slate-100 bg-gray-900/50">
                                <h3 className="text-xl font-black text-gray-300">Low Attendance Monitoring</h3>
                                <p className="text-slate-500 text-sm font-medium italic">Identifying students requiring intervention (below 50% rate)</p>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Attended</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Missed</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Rate</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.filter(u => u.role === 'Student' && (u.attendedSessions + u.missedSessions) >= 1).map(u => {
                                        const total = u.attendedSessions + u.missedSessions;
                                        const rate = ((u.attendedSessions / total) * 100).toFixed(1);
                                        const isCritical = total >= 3 && rate < 50;
                                        
                                        return (
                                            <tr key={u._id} className={`hover:bg-gray-900/50 transition border-b border-gray-700/50 ${isCritical ? 'bg-red-500/5' : ''}`}>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-slate-400">{u.firstName[0]}</div>
                                                        <div>
                                                            <p className="font-bold text-gray-300 text-sm">{u.firstName} {u.lastName}</p>
                                                            <p className="text-[10px] text-slate-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-gray-300 font-bold">{u.attendedSessions}</td>
                                                <td className="px-8 py-5 text-gray-500">{u.missedSessions}</td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${rate >= 75 ? 'bg-teal-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }}></div>
                                                        </div>
                                                        <span className={`text-xs font-black ${rate >= 75 ? 'text-teal-500' : rate >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{rate}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    {isCritical ? (
                                                        <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase animate-pulse">Critical Alert</span>
                                                    ) : rate >= 75 ? (
                                                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase">Good</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase">Neutral</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Financials / Payments Tab */}
                {activeTab === 'payments' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between items-center bg-gray-800 p-6 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-10 text-6xl">💳</div>
                            <div>
                                <h3 className="text-xl font-black text-gray-300">Financial Ledger</h3>
                                <p className="text-slate-400 font-medium text-sm italic">Comprehensive record of all student payments and platform revenue</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Processing Volume</p>
                                <p className="text-3xl font-black text-teal-500">Rs. {transactions.reduce((sum, tx) => (sum + (tx.amount || 0)), 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction Info</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Subject</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount Split</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Trust Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-medium italic">No transactions found in system records.</td>
                                        </tr>
                                    ) : (
                                        transactions.map(tx => (
                                            <tr key={tx._id} className="hover:bg-gray-900/50 transition border-b border-gray-700/50">
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-teal-400 font-mono truncate max-w-[120px]">REF-{(tx.stripeSessionId || tx._id).slice(-8).toUpperCase()}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{tx.sessionId || 'Bespoke Session'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center font-bold text-slate-400 ring-1 ring-slate-800">
                                                            {tx.userId?.firstName ? tx.userId.firstName[0] : 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-300 text-sm leading-none mb-1">{tx.userId?.firstName || 'System'} {tx.userId?.lastName || 'User'}</p>
                                                            <p className="text-[10px] text-slate-500 font-black tracking-tighter uppercase">{tx.userId?.identityNumber || tx.userId?.email || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-gray-300 leading-none mb-1">Total: Rs. {tx.amount}</span>
                                                        <div className="flex gap-2 text-[9px] font-bold text-slate-500 uppercase">
                                                            <span>Fee: <span className="text-teal-500">Rs. {tx.platformFee}</span></span>
                                                            <span>Earn: <span className="text-indigo-400">Rs. {tx.tutorEarnings}</span></span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : tx.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-gray-900 text-gray-400'}`}>
                                                        {tx.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <p className="text-xs font-bold text-gray-300">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Ratings Placeholder */}
                {activeTab === 'ratings' && (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-800 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 border-dashed animate-in zoom-in-95 duration-500">
                        <div className="text-6xl mb-4 opacity-50">⭐</div>
                        <h3 className="text-xl font-black text-gray-300 uppercase tracking-tighter">Redirecting Header</h3>
                        <p className="text-slate-400 font-medium text-sm">Please utilize the specialized Feedback Dashboard in the sidebar for full control.</p>
                        <Link to="/admin-feedback" className="mt-6 px-8 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-2xl transition">Advance to Feedback Dashboard →</Link>
                    </div>
                )}
            </main>

            {/* Create User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-[2rem] border border-gray-700 p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-300">Add or Upgrade User</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-white transition">✖</button>
                        </div>
                        <p className="text-xs text-slate-400 mb-6 bg-gray-900 border border-gray-700 p-3 rounded-xl">
                            Tip: To upgrade a student to Host role, enter their current email and specify role as "Host".
                        </p>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">First Name</label>
                                    <input type="text" value={newUserForm.firstName} onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-teal-500 transition" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Last Name</label>
                                    <input type="text" value={newUserForm.lastName} onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-teal-500 transition" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Email</label>
                                <input required type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-teal-500 transition" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Assign Role</label>
                                <select value={newUserForm.role} onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-teal-500 transition">
                                    <option value="Student">Student</option>
                                    <option value="Host">Host</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-gray-900 rounded-xl font-bold text-gray-400 hover:bg-gray-700 transition">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl font-bold text-white hover:from-teal-400 hover:to-indigo-500 transition shadow-lg">Submit Change</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
