import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getTutorSessions, createSession, updateSession, deleteSession, getSessionParticipants, cancelSession } from '../services/sessionService';
import { toast } from 'react-toastify';
import AvailabilityManager from './AvailabilityManager';
import { FaUsers, FaLink, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaHistory, FaGem } from 'react-icons/fa';
import api from '../../../services/api';
import ConfirmationModal from '../../common/components/ConfirmationModal';
import { getLastReadAt } from '../../chat/utils/unread';

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

const TutorScheduleManager = ({ tutorId, onManageQuiz }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sessions');

    // Sessions state
    const [date, setDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [maxParticipants, setMaxParticipants] = useState(1);
    const [price, setPrice] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [meetingLink, setMeetingLink] = useState('');
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [sessionParticipants, setSessionParticipants] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    
    // Cancel session state
    const [cancelSessionId, setCancelSessionId] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelingSession, setCancelingSession] = useState(false);
    const [unreadCountBySession, setUnreadCountBySession] = useState({});

    // Slot management state
    const [tutorData, setTutorData] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [buyingSlot, setBuyingSlot] = useState(false);

    const isPastDate = (selectedDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(selectedDate);
        target.setHours(0, 0, 0, 0);
        return target < today;
    };

    useEffect(() => {
        fetchSessions();
        fetchTutorData();
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [tutorId]);

    const fetchTutorData = async () => {
        try {
            const { data } = await api.get(`/auth/user/${tutorId}`);
            setTutorData(data.user);
        } catch (error) {
            console.error('Error fetching tutor slots:', error);
        }
    };

    const handleBuySlot = async () => {
        if (!window.confirm('Do you want to buy an extra session slot for Rs. 100?')) return;
        
        try {
            setBuyingSlot(true);
            const { data } = await api.post('/payments/buy-slot', { userId: tutorId });
            if (data.success) {
                toast.success('Extra slot purchased! You can now create more sessions.');
                fetchTutorData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to purchase slot');
        } finally {
            setBuyingSlot(false);
        }
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await getTutorSessions(tutorId);
            // Assuming data is an array of sessions. Handle response format accordingly.
            const nextSessions = data.data || data;
            setSessions(nextSessions);

            // Trigger unread refresh immediately after load
            const sessionIds = Array.from(new Set(
                (nextSessions || [])
                    .filter(s => s.status !== 'cancelled' && s.currentParticipants > 0)
                    .map(s => s._id)
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
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const loadUnread = async () => {
            try {
                const sessionIds = Array.from(new Set(
                    (sessions || [])
                        .filter(s => s.status !== 'cancelled' && s.currentParticipants > 0)
                        .map(s => s._id)
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
    }, [sessions]);

    const handleCreateSession = async (e) => {
        e.preventDefault();

        if (isPastDate(date)) {
            return toast.warning('You cannot create session slots in the past');
        }

        const now = new Date();
        const targetDate = new Date(date);
        if (
            targetDate.getFullYear() === now.getFullYear() &&
            targetDate.getMonth() === now.getMonth() &&
            targetDate.getDate() === now.getDate()
        ) {
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMinutes = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHours}:${currentMinutes}`;
            if (startTime < currentTimeStr) {
                return toast.warning('You cannot create session slots for a past time today');
            }
        }

        if (startTime >= endTime) {
            return toast.warning('End time must be after start time');
        }

        const hasOverlap = sessions.some(session => {
            if (editingSessionId && session._id === editingSessionId) return false;
            
            const isSameDate = new Date(session.date).toDateString() === date.toDateString();
            const isOverlapping = startTime < session.endTime && endTime > session.startTime;
            
            return isSameDate && isOverlapping;
        });

        if (hasOverlap) {
            return toast.warning('You already have a session on that time');
        }

        try {
            if (editingSessionId) {
                await updateSession(editingSessionId, {
                    date: date.toISOString(),
                    startTime,
                    endTime,
                    maxParticipants,
                    price,
                    meetingLink
                });
                toast.success('Session updated successfully!');
                setEditingSessionId(null);
            } else {
                const result = await createSession({
                    tutor: tutorId,
                    date: date.toISOString(),
                    startTime,
                    endTime,
                    maxParticipants,
                    price,
                    meetingLink
                });
                setSessions([...sessions, result.data]);
                toast.success('Session slot created successfully');
                fetchTutorData(); // Update slot count
            }
            setMeetingLink('');
            fetchSessions();
        } catch (error) {
            if (error.response?.status === 403 && error.response?.data?.limitReached) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.response?.data?.message || 'Failed to create session slot');
            }
        }
    };

    const handleFetchParticipants = async (session) => {
        try {
            setLoadingParticipants(true);
            setSelectedSession(session);
            setShowParticipantsModal(true);
            const data = await getSessionParticipants(session._id);
            setSessionParticipants(data.data || []);
        } catch (error) {
            toast.error('Failed to load participants');
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleEditSession = (session) => {
        setEditingSessionId(session._id);
        setDate(new Date(session.date));
        setStartTime(session.startTime);
        setEndTime(session.endTime);
        setMaxParticipants(session.maxParticipants || 1);
        setPrice(session.price || 0);
        setMeetingLink(session.meetingLink || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to delete this session?")) return;

        try {
            await deleteSession(sessionId);
            toast.success('Session deleted');
            fetchSessions();
        } catch (error) {
            toast.error('Failed to delete session');
        }
    };

    const openCancelSessionModal = (sessionId) => {
        setCancelSessionId(sessionId);
        setIsCancelModalOpen(true);
    };

    const confirmCancelSession = async () => {
        if (!cancelSessionId) return;
        setCancelingSession(true);
        try {
            await cancelSession(cancelSessionId);
            toast.success('Session cancelled successfully');
            fetchSessions();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to cancel session');
        } finally {
            setCancelingSession(false);
            setIsCancelModalOpen(false);
            setCancelSessionId(null);
        }
    };

    // Filter sessions for the selected date
    const selectedDateSessions = sessions.filter(
        (s) => new Date(s.date).toDateString() === date.toDateString()
    );

    return (
        <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
            {/* Slot Quota Header */}
            {tutorData && (
                <div className="mb-6 p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500 rounded-xl">
                            <FaGem className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Weekly Session Quota</h3>
                            <p className="text-indigo-200 text-sm">
                                You have 5 free slots + {tutorData.extraSlots || 0} purchased slots this week.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs text-indigo-300 uppercase font-black tracking-widest">Next Reset</p>
                            <p className="font-mono text-white">
                                {new Date(tutorData.slotResetDate).toLocaleDateString()}
                            </p>
                        </div>
                        <button 
                            onClick={handleBuySlot}
                            disabled={buyingSlot}
                            className="px-6 py-2 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {buyingSlot ? 'Processing...' : '+ Buy Extra Slot (Rs. 100)'}
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full mb-8 space-y-6">
                <header className="mb-4">
                    <h1 className="text-4xl font-extrabold text-gray-300">
                        Work Schedule
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your availability, sessions, and participants efficiently.</p>
                </header>


                {/* Tabs */}
                <div className="flex space-x-2 md:space-x-4 border-b border-gray-800 pb-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'sessions'
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                    >
                        <FaCalendarAlt size={14} /> Session Slots
                    </button>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'upcoming'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                    >
                        <FaHistory size={14} /> Upcoming Sessions
                    </button>
                    <button
                        onClick={() => setActiveTab('availability')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'availability'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            }`}
                    >
                        <FaClock size={14} /> Weekly Availability
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'availability' ? (
                    <AvailabilityManager tutorId={tutorId} />
                ) : activeTab === 'upcoming' ? (
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3 flex items-center gap-3">
                            <FaHistory className="text-amber-400" /> Upcoming & Booked Sessions
                        </h2>
                        <div className="space-y-4">
                            {sessions.filter(s => s.status !== 'cancelled' && s.currentParticipants > 0 && new Date(s.date) >= new Date().setHours(0, 0, 0, 0)).length === 0 ? (
                                <div className="text-center py-10 bg-gray-900/50 rounded-xl border border-gray-700 border-dashed">
                                    <p className="text-gray-400">No upcoming booked sessions yet.</p>
                                </div>
                            ) : (
                                sessions.filter(s => s.status !== 'cancelled' && s.currentParticipants > 0 && new Date(s.date) >= new Date().setHours(0, 0, 0, 0)).map(session => {
                                    const startDateTime = parseSessionTime(session.date, session.startTime);
                                    const endDateTime = parseSessionTime(session.date, session.endTime);
                                    
                                    let sessionPhase = 'completed';
                                    if (startDateTime && endDateTime) {
                                      if (currentTime < startDateTime) sessionPhase = 'upcoming';
                                      else if (currentTime >= startDateTime && currentTime <= endDateTime) sessionPhase = 'ongoing';
                                    }

                                    let countdownStr = '';
                                    let phaseColorClass = 'text-gray-400';
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
                                    
                                    const canJoin = startDateTime && endDateTime && (currentTime >= new Date(startDateTime.getTime() - 10 * 60000) && currentTime <= endDateTime);
                                    const meetingLink = session.meetingLink || `https://meet.jit.si/${session._id}`;
                                    const normalizedMeetingLink = meetingLink.includes('zoom.us')
                                        ? meetingLink.replace('https://zoom.us', 'https://meet.jit.si')
                                        : meetingLink;

                                    return (
                                        <div key={session._id} className="p-5 bg-gray-900 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-teal-500/50 transition-colors">
                                            <div className="flex-1">
                                                <div className="text-lg font-bold text-gray-100 flex items-center gap-2">
                                                    <FaCalendarAlt className="text-teal-500" /> {new Date(session.date).toLocaleDateString()}
                                                    <span className="text-gray-500 font-normal">|</span>
                                                    <FaClock className="text-teal-500" /> {session.startTime} - {session.endTime}
                                                </div>
                                                <div className="flex flex-col gap-2 mt-3">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1.5 text-sm text-gray-400">
                                                            <FaUsers className="text-indigo-400" /> {session.currentParticipants} / {session.maxParticipants} students
                                                        </span>
                                                        {normalizedMeetingLink && (
                                                            <span className="flex items-center gap-1.5 text-sm text-gray-400">
                                                                <FaLink className="text-teal-400" /> 
                                                                Meeting: <a href={normalizedMeetingLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Jitsi Link</a>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`text-sm ${phaseColorClass} flex items-center gap-2 mt-1`}>
                                                        <FaClock /> {countdownStr}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 min-w-[180px]">
                                                <button
                                                    onClick={() => navigate(`/session/${session._id}`)}
                                                    className="relative px-4 py-2 border border-teal-500/40 hover:bg-teal-500/10 text-teal-300 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Open Chat
                                                    {unreadCountBySession[session._id] > 0 && (
                                                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black border border-gray-900">
                                                            {unreadCountBySession[session._id] > 99 ? '99+' : unreadCountBySession[session._id]}
                                                        </span>
                                                    )}
                                                </button>
                                                <a
                                                    href={normalizedMeetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`px-4 py-2 text-white text-sm font-bold rounded-lg transition-all text-center flex items-center justify-center gap-2 ${canJoin ? 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:shadow-teal-500/25 cursor-pointer' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}
                                                    onClick={(e) => { if (!canJoin) e.preventDefault(); }}
                                                >
                                                    <FaLink /> Join Jitsi
                                                </a>
                                                <button
                                                    onClick={() => handleFetchParticipants(session)}
                                                    className="px-4 py-2 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FaUsers /> Participant List
                                                </button>
                                                {session.status !== 'cancelled' && sessionPhase === 'upcoming' && (
                                                    <button
                                                        onClick={() => openCancelSessionModal(session._id)}
                                                        className="px-4 py-2 border border-red-500/50 hover:bg-red-500/10 text-red-400 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <FaExclamationCircle /> Cancel Session
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onManageQuiz(session._id)}
                                                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-sm font-bold rounded-lg transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/30"
                                                >
                                                    📝 Manage Quiz
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Left Column: Calendar & Filters */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
                                <h2 className="text-xl font-semibold mb-4 text-gray-200">Select Date</h2>
                                {/* Overriding some react-calendar styles directly via tailwind classes on a wrapper, or relies on index.css if customized */}
                                <div className="text-gray-900 rounded-lg overflow-hidden border border-gray-300 bg-white p-2 shadow-2xl">
                                    <Calendar
                                        onChange={setDate}
                                        value={date}
                                        minDate={new Date()}
                                        className="w-full border-none shadow-none"
                                        tileContent={({ date, view }) => {
                                            if (view === 'month') {
                                                const hasSession = sessions.some(s => s.status !== 'cancelled' && new Date(s.date).toDateString() === date.toDateString());
                                                return hasSession ? <div className="h-1.5 w-1.5 bg-teal-500 rounded-full mx-auto mt-0.5"></div> : null;
                                            }
                                        }}
                                        tileClassName={({ date, view }) => {
                                            if (view === 'month') {
                                                const hasSession = sessions.some(s => s.status !== 'cancelled' && new Date(s.date).toDateString() === date.toDateString());
                                                return hasSession ? 'font-bold text-teal-600' : null;
                                            }
                                        }}
                                    />
                                </div>
                                <div className="mt-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                                    <p className="text-sm text-gray-300">Selected Date:</p>
                                    <p className="text-lg font-bold text-teal-400">{date.toDateString()}</p>
                                </div>
                            </div>
                        </div>

                    {/* Right Column: Creation Form & List */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Create Session Form */}

                            {/* Create Session Form */}
                            <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700 relative">
                                {editingSessionId && (
                                    <button
                                        onClick={() => {
                                            setEditingSessionId(null);
                                            setStartTime('09:00');
                                            setEndTime('10:00');
                                            setMaxParticipants(1);
                                            setPrice(0);
                                        }}
                                        className="absolute top-4 right-4 text-xs font-semibold text-gray-400 hover:text-white bg-gray-700 px-2 py-1 rounded-md"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                <h2 className="text-2xl font-semibold mb-6 text-gray-100 border-b border-gray-700 pb-3">
                                    {editingSessionId ? 'Update Session Slot' : 'Add Session Slot'}
                                </h2>
                                <form onSubmit={handleCreateSession} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Max Participants</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={maxParticipants}
                                                onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-1">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Price (Rs)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={price}
                                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                                required
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-2 font-flex items-center gap-2">
                                                Meeting Link <span className="text-gray-500 text-xs">(optional)</span>
                                            </label>
                                            <input
                                                type="url"
                                                value={meetingLink}
                                                onChange={(e) => setMeetingLink(e.target.value)}
                                                placeholder="https://zoom.us/..."
                                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className={`w-full text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:-translate-y-1 ${editingSessionId
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500'
                                            : 'bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500'
                                            }`}
                                    >
                                        {editingSessionId ? 'Update Session' : 'Create Session'}
                                    </button>
                                </form>
                            </div>

                            {/* List of Sessions */}
                            <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-100 flex items-center justify-between border-b border-gray-700 pb-3">
                                    <span>Slots on <span className="text-teal-400">{date.toLocaleDateString()}</span></span>
                                    <span className="text-sm font-normal px-3 py-1 bg-gray-700 rounded-full text-gray-300">{selectedDateSessions.length} slots</span>
                                </h2>

                                {loading ? (
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="flex-1 space-y-4 py-1">
                                            <div className="h-20 bg-gray-700 rounded-xl"></div>
                                            <div className="h-20 bg-gray-700 rounded-xl"></div>
                                        </div>
                                    </div>
                                ) : selectedDateSessions.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-900/50 rounded-xl border border-gray-700 border-dashed">
                                        <p className="text-gray-400">No session slots yet. Create your first session to start accepting bookings.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedDateSessions.map(session => {
                                            const isFull = session.currentParticipants >= session.maxParticipants;
                                            const endDateTime = parseSessionTime(session.date, session.endTime);
                                            const isExpired = endDateTime ? endDateTime < new Date() : new Date(session.date).setHours(23, 59, 59, 999) < new Date().getTime();

                                            let statusLabel = 'Available';
                                            let statusClass = 'bg-teal-900/50 text-teal-300 border-teal-700';
                                            let StatusIcon = FaCheckCircle;

                                            if (session.status === 'cancelled') {
                                                statusLabel = 'Cancelled';
                                                statusClass = 'bg-gray-700/50 text-gray-400 border-gray-600';
                                                StatusIcon = FaExclamationCircle;
                                            } else if (isExpired) {
                                                statusLabel = 'Expired';
                                                statusClass = 'bg-gray-700/50 text-gray-300 border-gray-600';
                                                StatusIcon = FaHistory;
                                            } else if (isFull) {
                                                statusLabel = 'Full';
                                                statusClass = 'bg-red-900/50 text-red-200 border-red-700';
                                                StatusIcon = FaExclamationCircle;
                                            }

                                            return (
                                                <div key={session._id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gray-900 rounded-xl border border-gray-700 hover:border-teal-500/50 transition-all shadow-md">
                                                    <div className="mb-4 sm:mb-0">
                                                        <div className="text-lg font-bold text-gray-100 flex items-center gap-3">
                                                            {session.startTime} - {session.endTime}
                                                            <span className={`px-2 py-0.5 text-[10px] uppercase font-black rounded-md border flex items-center gap-1 ${statusClass}`}>
                                                                <StatusIcon size={10} /> {statusLabel}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm mt-1 flex flex-wrap items-center gap-4">
                                                            <span className="text-gray-400 flex items-center gap-1.5">
                                                                <FaUsers className="text-indigo-400" />
                                                                Participants: <span className="text-white font-medium">{session.currentParticipants}</span> / {session.maxParticipants}
                                                            </span>
                                                            {session.meetingLink && (
                                                                <span className="text-gray-400 flex items-center gap-1.5">
                                                                    <FaLink className="text-teal-400" />
                                                                    <span className="text-xs truncate max-w-[150px]">{session.meetingLink}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                                        {session.currentParticipants > 0 && (
                                                            <button
                                                                onClick={() => handleFetchParticipants(session)}
                                                                className="flex-1 sm:flex-none bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-colors text-xs font-bold flex items-center gap-2"
                                                            >
                                                                <FaUsers /> List
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditSession(session)}
                                                            className="flex-1 sm:flex-none hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 px-4 py-2 rounded-lg border border-amber-900/50 transition-colors text-sm font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => onManageQuiz(session._id)}
                                                            className="flex-1 sm:flex-none bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 px-4 py-2 rounded-lg border border-teal-500/30 transition-colors text-sm font-medium"
                                                        >
                                                            Quiz
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSession(session._id)}
                                                            className="flex-1 sm:flex-none opacity-100 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-900/50 transition-colors text-sm font-medium"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Participant List Modal */}
                {showParticipantsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <FaUsers className="text-teal-400" /> Participants
                                    <span className="text-sm font-normal text-gray-400">
                                        ({selectedSession?.startTime} - {selectedSession?.endTime})
                                    </span>
                                </h3>
                                <button onClick={() => setShowParticipantsModal(false)} className="text-gray-400 hover:text-white">&times;</button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                {loadingParticipants ? (
                                    <div className="space-y-4 animate-pulse">
                                        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-700 rounded-lg"></div>)}
                                    </div>
                                ) : sessionParticipants.length === 0 ? (
                                    <p className="text-center text-gray-400">No students have booked this session yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {sessionParticipants.map(participant => (
                                            <div key={participant._id} className="p-4 bg-gray-900 rounded-xl border border-gray-700 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    {participant.student?.profilePicture ? (
                                                        <img src={participant.student.profilePicture} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-700" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500 font-bold uppercase">
                                                            {participant.student?.firstName?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-gray-100">{participant.student?.firstName} {participant.student?.lastName}</div>
                                                        <div className="text-xs text-gray-500">{participant.student?.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${
                                                        participant.attendanceStatus === 'attended' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                                        participant.attendanceStatus === 'missed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                        {participant.attendanceStatus || 'Not Join'}
                                                    </span>
                                                    <div className="text-[10px] text-gray-600">
                                                        {new Date(participant.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-700 bg-gray-900/50 text-right">
                                <button
                                    onClick={() => setShowParticipantsModal(false)}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Session Modal */}
            <ConfirmationModal
                isOpen={isCancelModalOpen}
                loading={cancelingSession}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={confirmCancelSession}
                title="Cancel Session"
                message="Are you sure you want to cancel this entire session? All bookings for this session will be cancelled and students will be notified."
            />
        </div>
    );
};

export default TutorScheduleManager;
