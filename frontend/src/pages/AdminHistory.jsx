import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';

const AdminHistory = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/admin/history');
                if (data.success) {
                    setLogs(data.logs);
                }
            } catch (error) {
                toast.error('Failed to fetch action history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            <AdminSidebar activeTab="history_link" />
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">My Admin History</h1>
                        <p className="mt-2 text-slate-500 font-medium">A log of all management actions you have performed in the system.</p>
                    </div>
                    <Link to="/admin" className="text-teal-500 hover:text-teal-400 font-bold">
                        &larr; Admin Dashboard
                    </Link>
                </div>

                <div className="bg-gray-800 rounded-3xl shadow-xl shadow-black/40 border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900/50 border-b border-gray-700">
                                    <th className="px-6 py-4 text-xs font-black text-teal-500 uppercase tracking-widest">Action</th>
                                    <th className="px-6 py-4 text-xs font-black text-teal-500 uppercase tracking-widest">Target Entity</th>
                                    <th className="px-6 py-4 text-xs font-black text-teal-500 uppercase tracking-widest">Details</th>
                                    <th className="px-6 py-4 text-xs font-black text-teal-500 uppercase tracking-widest">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {logs.length > 0 ? logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-750 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                                log.action.includes('Created') ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                log.action.includes('Deleted') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                log.action.includes('Role') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-300">{log.target}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-400">{log.details}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-500 italic">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </p>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">
                                            No actions recorded yet. Your administrative history will appear here.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHistory;
