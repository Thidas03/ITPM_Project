import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../../../services/api';
import { Send } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { markSessionRead } from '../utils/unread';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:5000';

const SessionChat = ({ sessionId, heightClass = 'h-[500px]' }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimerRef = useRef(null);

    // Initial fetch of messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/messages/${sessionId}`);
                setMessages(response.data.data);
                const latest = (response.data.data || []).reduce((acc, m) => {
                    const t = m?.timestamp ? new Date(m.timestamp).getTime() : (m?.createdAt ? new Date(m.createdAt).getTime() : 0);
                    return Math.max(acc, t);
                }, 0);
                markSessionRead(sessionId, latest || Date.now());
            } catch (error) {
                console.error("Failed to load chat history", error);
            }
        };
        if (sessionId) fetchMessages();
    }, [sessionId]);

    // Socket Setup
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token || !sessionId) return;

        const newSocket = io(SOCKET_URL, {
            auth: { token }
        });

        newSocket.emit('join_room', { sessionId });
        
        newSocket.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
            // If you're currently viewing this session chat, treat it as read.
            const t = msg?.timestamp ? new Date(msg.timestamp).getTime() : Date.now();
            markSessionRead(sessionId, t);
        });

        newSocket.on('room_users', (payload) => {
            if (payload?.sessionId !== sessionId) return;
            setOnlineUsers(payload.users || []);
        });

        newSocket.on('typing', (payload) => {
            if (payload?.sessionId !== sessionId) return;
            const { userId, name, isTyping } = payload;
            if (!userId) return;
            setTypingUsers(prev => {
                const without = prev.filter(u => u.userId !== userId);
                return isTyping ? [...without, { userId, name: name || 'User' }] : without;
            });
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [sessionId]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !user) return;

        socket.emit('send_message', {
            sessionId,
            message: newMessage
        });

        setNewMessage('');
    };

    const myUserId = user?._id || user?.id;

    const handleTypingChange = (value) => {
        setNewMessage(value);
        if (!socket || !sessionId) return;

        socket.emit('typing', { sessionId, isTyping: value.length > 0 });

        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            socket.emit('typing', { sessionId, isTyping: false });
        }, 800);
    };

    const typingLabel = typingUsers
        .filter(u => u.userId !== String(myUserId))
        .slice(0, 2)
        .map(u => u.name)
        .join(', ');

    return (
        <div className={`flex flex-col ${heightClass} bg-gray-800 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden mt-6 md:mt-0`}>
            <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-4 border-b border-gray-700 font-bold text-white shadow-md flex items-center justify-between">
                <div className="flex flex-col">
                    <span>Session Chat</span>
                    <span className="text-xs font-medium text-white/80">
                        {onlineUsers.length} online
                        {typingLabel ? ` • ${typingLabel} typing...` : ''}
                    </span>
                </div>
                <span className="bg-white/20 px-2 py-1 rounded text-xs">Real-time</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-900/50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10 text-sm">
                        No messages yet. Say hello!
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const msgSenderId = msg.senderId?._id || msg.senderId;
                    const isMine = String(msgSenderId) === String(myUserId);
                    const isTutor = msg.senderRole === 'tutor';
                    const senderName = msg.senderId
                        ? `${msg.senderId.firstName || ''} ${msg.senderId.lastName || ''}`.trim()
                        : '';
                    const timeLabel = msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');

                    return (
                        <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-xs text-gray-400 font-medium">
                                    {isMine ? 'You' : (senderName || 'Unknown')}
                                </span>
                                {timeLabel && (
                                    <span className="text-[10px] text-gray-500">
                                        {timeLabel}
                                    </span>
                                )}
                                {isTutor && (
                                    <span className="text-[10px] bg-teal-500/20 text-teal-400 px-1 rounded font-bold uppercase tracking-wide">
                                        Tutor
                                    </span>
                                )}
                            </div>
                            <div className={`px-4 py-2 max-w-[80%] rounded-2xl ${isMine 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : isTutor 
                                    ? 'bg-teal-600/90 text-white rounded-bl-none'
                                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                            } shadow-sm text-sm whitespace-pre-wrap break-words`}>
                                {msg.message}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTypingChange(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:border-teal-500 text-white placeholder-gray-500 text-sm"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700 text-white rounded-full transition-colors flex items-center justify-center shrink-0"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default SessionChat;
