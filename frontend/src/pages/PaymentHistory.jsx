import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaHistory, FaPlusCircle, FaMinusCircle, FaWallet } from 'react-icons/fa';

const PaymentHistory = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [historyRes, balanceRes] = await Promise.all([
                api.get(`/payments/history/${user._id}`),
                api.get(`/payments/balance/${user._id}`)
            ]);
            setTransactions(historyRes.data.transactions || []);
            setWalletBalance(balanceRes.data.balance || 0);
        } catch (error) {
            console.error('Failed to fetch payment history', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 font-sans pb-20">
            {/* Header */}
            <div className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard/student" className="p-2 bg-gray-700/50 hover:bg-gray-700 rounded-full transition text-gray-400 hover:text-white">
                            <FaArrowLeft />
                        </Link>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase">Payment History</h1>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-2xl">
                        <FaWallet className="text-teal-400" />
                        <span className="text-sm font-black text-white">Rs {walletBalance.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-10">
                <div className="mb-8 bg-gradient-to-br from-indigo-900/20 to-teal-900/20 p-8 rounded-[2rem] border border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Balance</p>
                        <h2 className="text-5xl font-black text-white">Rs {walletBalance.toFixed(2)}</h2>
                    </div>
                    <Link to="/dashboard/student" className="px-8 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-400 transition shadow-lg shadow-teal-500/20 uppercase tracking-widest">
                        Recharge Wallet
                    </Link>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                        <FaHistory className="text-teal-400" /> Recent Transactions
                    </h3>

                    {transactions.length === 0 ? (
                        <div className="py-20 text-center bg-gray-800/30 rounded-3xl border border-gray-700 border-dashed">
                            <p className="text-gray-400 font-medium">No transactions found.</p>
                        </div>
                    ) : (
                        transactions.map(tx => (
                            <div key={tx._id} className="bg-gray-800 p-6 rounded-3xl border border-gray-700 hover:border-gray-500 transition-all flex items-center justify-between group shadow-xl">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.transactionType === 'recharge' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.transactionType === 'recharge' ? <FaPlusCircle /> : <FaMinusCircle />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase tracking-tight">{tx.description}</h4>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {new Date(tx.createdAt).toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                            <span className="mx-2">•</span>
                                            {tx.paymentMethod}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black ${tx.transactionType === 'recharge' ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.transactionType === 'recharge' ? '+' : '-'}{tx.amount.toFixed(2)}
                                    </p>
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                                        tx.status === 'completed' || tx.status === 'released' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                        tx.status === 'pending' || tx.status === 'held_in_escrow' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                        {tx.status}
                                    </span>
                                </div>

                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default PaymentHistory;
