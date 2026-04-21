import React, { useState, useEffect } from 'react';
import { getStudentBookings, getTutorBookings, cancelBooking, completeBooking, rateBooking } from '../features/bookings/services/bookingService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../services/api';
import QuizTakeModal from '../Mageepan/Quizzes/components/QuizTakeModal';

const MySessions = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [ratingModal, setRatingModal] = useState({ isOpen: false, bookingId: null, rating: 5, review: '' });
    const [quizModal, setQuizModal] = useState({ isOpen: false, sessionId: null, tutorName: '' });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = (user.role === 'Host' || user.role === 'Tutor' || user.role === 'host')
                 ? await getTutorBookings(user._id)
                 : await getStudentBookings(user._id);
            setBookings(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch your sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(id);
            toast.success('Session cancelled');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cancellation failed');
        }
    };

    const handleJoin = async (id) => {
        try {
            await completeBooking(id);
            toast.success('Joined session! Marked as attended.');
            fetchBookings();
            // In a real app, this would redirect to a meeting URL
            // window.open('https://meet.google.com/xyz', '_blank');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to join');
        }
    };

    const handleRate = async () => {
        try {
            await rateBooking(ratingModal.bookingId, { rating: ratingModal.rating, review: ratingModal.review });
            toast.success('Thank you for your feedback!');
            setRatingModal({ ...ratingModal, isOpen: false });
            fetchBookings();
        } catch (error) {
            toast.error('Failed to submit rating');
        }
    };

    const handleReleaseEscrow = async (sessionId) => {
        try {
            // We need to find the transaction for this session first
            const { data: txData } = await api.get(`/payments/session-transaction/${sessionId}`);
            if (!txData.transaction) return toast.error('No payment found for this session');

            await api.patch(`/payments/release/${txData.transaction._id}`);
            toast.success('Funds released to tutor. Thank you!');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Release failed');
        }
    };

    const handleDispute = async (sessionId) => {
        if (!window.confirm('Are you sure you want to dispute this session? The tutor will not be paid until an admin reviews it.')) return;
        try {
            const { data: txData } = await api.get(`/payments/session-transaction/${sessionId}`);
            if (!txData.transaction) return toast.error('No payment found');

            await api.patch(`/payments/dispute/${txData.transaction._id}`);
            toast.success('Session disputed. Admin notified.');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Dispute failed');
        }
    };

    const attendancePercentage = () => {
        const relevantBookings = bookings.filter(b => b.status === 'completed' || (b.status === 'upcoming' && b.session && new Date(b.session.date) < new Date()));
        const attended = relevantBookings.filter(b => (b.status === 'completed' && b.attended) || (b.status === 'upcoming')).length;
        return relevantBookings.length === 0 ? 100 : Math.round((attended / relevantBookings.length) * 100);
    };

    const categorized = {
        upcoming: bookings.filter(b => b.status === 'upcoming' && (!b.session || new Date(b.session.date) >= new Date())),
        attended: bookings.filter(b => 
            (b.status === 'completed' && b.attended) || 
            (b.status === 'upcoming' && b.session && new Date(b.session.date) < new Date())
        ),
        missed: bookings.filter(b => (b.status === 'completed' && !b.attended && b.attendanceStatus === 'missed')),
    };

    // Note: In a real app, we'd have a backend job or check to mark past confirmed bookings as missed.
    // For now, I'll just show them based on status.

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 font-sans pb-20">
            {/* Header */}
            <div className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={user.role === 'Host' || user.role === 'Tutor' ? '/dashboard/tutor' : '/dashboard/student'} className="text-gray-400 hover:text-white transition">← Dashboard</Link>
                        <h1 className="text-2xl font-black text-white ml-4 tracking-tight">MY SESSIONS</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Attendance Reputation</p>
                            <p className="text-sm font-bold text-teal-400">{attendancePercentage()}% Reliable</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold border border-teal-500/30">
                            {user.firstName[0]}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:scale-125 transition">📅</div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Upcoming</p>
                        <p className="text-4xl font-black text-white">{categorized.upcoming.length}</p>
                        <div className="h-1 w-12 bg-teal-500 mt-4 rounded-full"></div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:scale-125 transition">✅</div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Attended</p>
                        <p className="text-4xl font-black text-white">{categorized.attended.length}</p>
                        <div className="h-1 w-12 bg-indigo-500 mt-4 rounded-full"></div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 text-4xl opacity-10 group-hover:scale-125 transition">⚠️</div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Missed</p>
                        <p className="text-4xl font-black text-white">{categorized.missed.length}</p>
                        <div className="h-1 w-12 bg-red-500 mt-4 rounded-full"></div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 bg-gray-800/50 p-1.5 rounded-2xl w-fit border border-gray-700">
                    {['upcoming', 'attended', 'missed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all uppercase tracking-wider ${activeTab === tab ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                    {categorized[activeTab].length === 0 ? (
                        <div className="py-20 text-center bg-gray-800/30 rounded-3xl border border-gray-700 border-dashed">
                            <p className="text-gray-400 font-medium">No {activeTab} sessions found.</p>
                        </div>
                    ) : (
                        categorized[activeTab].map(booking => {
                            const isTutor = (user.role === 'Host' || user.role === 'Tutor' || user.role === 'host');
                            const dateToUse = booking.bookingDate || booking.session?.date || new Date();
                            const startTime = booking.availability?.startTime || booking.session?.startTime || 'TBD';
                            const endTime = booking.availability?.endTime || booking.session?.endTime || 'TBD';
                            
                            const otherParty = isTutor ? (booking.student || booking.session?.student) : (booking.tutor || booking.session?.tutor);
                            const partyFName = otherParty?.firstName || (isTutor ? 'Student' : 'Tutor');
                            const partyLName = otherParty?.lastName || '';
                            const sessionId = booking.session?._id || booking._id;

                            return (
                            <div key={booking._id} className="bg-gray-800 p-6 rounded-[2rem] border border-gray-700 shadow-xl shadow-blue-50/50 hover:border-gray-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-700 flex flex-col items-center justify-center text-center">
                                        <p className="text-[10px] font-black text-teal-500 uppercase leading-none mb-1">
                                            {new Date(dateToUse).toLocaleString('default', { month: 'short' })}
                                        </p>
                                        <p className="text-2xl font-black text-white leading-none">
                                            {new Date(dateToUse).getDate()}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white leading-tight mb-2 uppercase tracking-tight">
                                            {startTime} - {endTime}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-teal-500 text-[10px] flex items-center justify-center text-white font-bold">
                                                {partyFName[0]}
                                            </div>
                                            <p className="text-sm font-bold text-gray-400">
                                                {isTutor ? 'Student' : 'Tutor'}: <span className="text-gray-300">{partyFName} {partyLName}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {activeTab === 'upcoming' && (
                                        <>
                                            <button
                                                onClick={() => handleJoin(booking._id)}
                                                className="px-6 py-3 bg-teal-500 text-white rounded-xl font-bold text-sm hover:bg-teal-400 transition shadow-lg shadow-teal-500/20"
                                            >
                                                Join Session
                                            </button>
                                            <button
                                                onClick={() => handleCancel(booking._id)}
                                                className="px-6 py-3 bg-gray-900 text-gray-400 border border-gray-700 rounded-xl font-bold text-sm hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 transition"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {activeTab === 'attended' && (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => setRatingModal({ ...ratingModal, isOpen: true, bookingId: booking._id })}
                                                className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-400 transition"
                                            >
                                                {booking.rating ? `Update Rating (${booking.rating}⭐)` : 'Rate Now ⭐'}
                                            </button>
                                            <button
                                                onClick={() => setQuizModal({ isOpen: true, sessionId: sessionId, tutorName: `${tutorFName} ${tutorLName}` })}
                                                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition shadow-lg shadow-teal-500/20"
                                            >
                                                🧠 Take Quiz & Earn Discount
                                            </button>
                                            <button
                                                onClick={() => handleReleaseEscrow(sessionId)}
                                                className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-500 transition shadow-lg shadow-green-500/20"
                                            >
                                                Confirm & Release Funds
                                            </button>
                                            <button
                                                onClick={() => handleDispute(sessionId)}
                                                className="px-6 py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-900/50 transition"
                                            >
                                                Report Issue / Dispute
                                            </button>
                                        </div>
                                    )}
                                    {activeTab === 'missed' && (
                                        <span className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-widest">
                                            Non-Attendance Marked
                                        </span>
                                    )}
                                </div>
                            </div>
                        )})
                    )}
                </div>
            </main>

            {/* Rating Modal */}
            {ratingModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-sm p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-white mb-2">Rate Session</h2>
                        <p className="text-gray-400 text-sm mb-6">How was your experience with the tutor?</p>
                        
                        <div className="flex justify-center gap-2 mb-8">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRatingModal({ ...ratingModal, rating: star })}
                                    className={`text-4xl transition ${ratingModal.rating >= star ? 'scale-110 filter-none' : 'grayscale opacity-30 transform-none'}`}
                                >
                                    ⭐
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl p-4 mb-6 focus:outline-none focus:border-teal-500 transition"
                            placeholder="Optional feedback..."
                            value={ratingModal.review}
                            onChange={(e) => setRatingModal({ ...ratingModal, review: e.target.value })}
                        ></textarea>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setRatingModal({ ...ratingModal, isOpen: false })}
                                className="flex-1 py-3 bg-gray-800 rounded-xl font-bold text-gray-400"
                            >
                                Not Now
                            </button>
                            <button
                                onClick={handleRate}
                                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-teal-500/20"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Quiz Modal */}
            <QuizTakeModal 
                isOpen={quizModal.isOpen}
                onClose={() => setQuizModal({ ...quizModal, isOpen: false })}
                sessionId={quizModal.sessionId}
                studentId={user._id}
                tutorName={quizModal.tutorName}
                onSuccess={() => fetchBookings()}
            />
        </div>
    );
};

export default MySessions;
