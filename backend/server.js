require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes imports
const stripeRoutes = require('./Mageepan/routes/stripeRoutes');
const paymentRoutes = require('./Mageepan/routes/paymentRoutes');
// const quizRoutes = require('./Mageepan/routes/quizRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Mount routers
app.use('/api/stripe', stripeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
// app.use('/api/quizzes', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);

// Test route
app.get('/', (req, res) => {
  res.send("API Running...");
});

// Cron Jobs
const setupCronJobs = require('./utils/cronJobs');
setupCronJobs();

// Socket.io integration
const Message = require('./models/Message');
const { isChatAuthorized } = require('./utils/chatAccess');

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null);

    if (!token) return next(new Error('Not authorized'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('Not authorized'));

    socket.data.user = user;
    return next();
  } catch (err) {
    return next(new Error('Not authorized'));
  }
});

const roomPresence = new Map(); // sessionId -> Map(userId -> {name, role, socketCount})

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_room', async (payload) => {
        try {
            const sessionId = typeof payload === 'string' ? payload : payload?.sessionId;
            if (!sessionId) return;

            const user = socket.data.user;
            const authz = await isChatAuthorized({ sessionId, userId: user._id });
            if (!authz.ok) {
                socket.emit('room_error', { sessionId, error: authz.error });
                return;
            }

            socket.join(sessionId);

            const userId = user._id.toString();
            const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
            const role = (user.role || '').toLowerCase() === 'host' ? 'tutor' : 'student';

            const roomMap = roomPresence.get(sessionId) || new Map();
            const current = roomMap.get(userId) || { userId, name: displayName, role, socketCount: 0 };
            current.socketCount += 1;
            roomMap.set(userId, current);
            roomPresence.set(sessionId, roomMap);

            io.to(sessionId).emit('room_users', {
                sessionId,
                users: Array.from(roomMap.values()).map(({ userId: id, name, role: r }) => ({ userId: id, name, role: r }))
            });
        } catch (error) {
            socket.emit('room_error', { error: 'Failed to join room' });
        }
    });

    socket.on('send_message', async (data) => {
        try {
            const { sessionId, message } = data || {};
            if (!sessionId || !message || !String(message).trim()) return;

            const user = socket.data.user;
            const authz = await isChatAuthorized({ sessionId, userId: user._id });
            if (!authz.ok) {
                socket.emit('message_error', { sessionId, error: authz.error });
                return;
            }

            const senderRole = (user.role || '').toLowerCase() === 'host' ? 'tutor' : 'student';
            
            // Save to database
            const newMessage = await Message.create({
                sessionId,
                senderRole,
                senderId: user._id,
                message: String(message),
                timestamp: new Date()
            });
            
            await newMessage.populate('senderId', 'firstName lastName role');

            // Broadcast to room
            io.to(sessionId).emit('receive_message', newMessage);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('typing', async (data) => {
        try {
            const { sessionId, isTyping } = data || {};
            if (!sessionId) return;
            if (typeof isTyping !== 'boolean') return;

            const user = socket.data.user;
            const authz = await isChatAuthorized({ sessionId, userId: user._id });
            if (!authz.ok) return;

            const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';
            const role = (user.role || '').toLowerCase() === 'host' ? 'tutor' : 'student';

            socket.to(sessionId).emit('typing', {
                sessionId,
                userId: user._id.toString(),
                name: displayName,
                role,
                isTyping
            });
        } catch (err) {}
    });

    socket.on('disconnect', () => {
        try {
            const user = socket.data.user;
            if (!user) return;
            const userId = user._id.toString();

            for (const [sessionId, roomMap] of roomPresence.entries()) {
                const current = roomMap.get(userId);
                if (!current) continue;
                current.socketCount = Math.max(0, (current.socketCount || 1) - 1);
                if (current.socketCount === 0) roomMap.delete(userId);
                else roomMap.set(userId, current);

                if (roomMap.size === 0) roomPresence.delete(sessionId);
                else roomPresence.set(sessionId, roomMap);

                io.to(sessionId).emit('room_users', {
                    sessionId,
                    users: Array.from((roomPresence.get(sessionId) || new Map()).values()).map(({ userId: id, name, role }) => ({ userId: id, name, role }))
                });
            }
        } catch (err) {}
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
