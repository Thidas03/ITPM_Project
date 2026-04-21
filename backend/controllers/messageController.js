const Message = require('../models/Message');
const { isChatAuthorized } = require('../utils/chatAccess');

exports.getSessionMessages = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { sessionId } = req.params;
    const userId = req.user._id;

    const authz = await isChatAuthorized({ sessionId, userId });
    if (!authz.ok) return res.status(authz.status).json({ success: false, error: authz.error });

    const messages = await Message.find({ sessionId })
      .populate('senderId', 'firstName lastName role')
      .sort({ timestamp: 1, createdAt: 1 });

    return res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user._id;

    if (!sessionId || !message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: 'sessionId and message are required' });
    }

    const authz = await isChatAuthorized({ sessionId, userId });
    if (!authz.ok) return res.status(authz.status).json({ success: false, error: authz.error });

    const role = (req.user.role || '').toLowerCase() === 'host' ? 'tutor' : 'student';

    const newMessage = await Message.create({
      sessionId,
      senderId: userId,
      senderRole: role,
      message: String(message),
      timestamp: new Date()
    });

    await newMessage.populate('senderId', 'firstName lastName role');

    return res.status(201).json({ success: true, data: newMessage });
  } catch (err) {
    console.error('Error creating message:', err);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getLastMessage = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { sessionId } = req.params;
    const userId = req.user._id;

    const authz = await isChatAuthorized({ sessionId, userId });
    if (!authz.ok) return res.status(authz.status).json({ success: false, error: authz.error });

    const last = await Message.findOne({ sessionId })
      .select('timestamp createdAt')
      .sort({ timestamp: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: last ? { timestamp: last.timestamp || last.createdAt } : null
    });
  } catch (err) {
    console.error('Error fetching last message:', err);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { sessionId } = req.params;
    const userId = req.user._id;

    const authz = await isChatAuthorized({ sessionId, userId });
    if (!authz.ok) return res.status(authz.status).json({ success: false, error: authz.error });

    const sinceRaw = req.query.since;
    const since = sinceRaw ? new Date(String(sinceRaw)) : new Date(0);
    const sinceDate = isNaN(since.getTime()) ? new Date(0) : since;

    // Unread = messages after "since" sent by someone else
    const count = await Message.countDocuments({
      sessionId,
      timestamp: { $gt: sinceDate },
      senderId: { $ne: userId }
    });

    return res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};

