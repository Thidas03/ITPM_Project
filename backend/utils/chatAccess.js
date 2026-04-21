const Session = require('../models/Session');
const Booking = require('../models/Booking');

async function isChatAuthorized({ sessionId, userId }) {
  const session = await Session.findById(sessionId).select('tutor');
  if (!session) return { ok: false, status: 404, error: 'Session not found' };

  if (session.tutor.toString() === userId.toString()) return { ok: true };

  const booking = await Booking.findOne({ session: sessionId, student: userId }).select('_id');
  if (booking) return { ok: true };

  return { ok: false, status: 403, error: 'Not authorized for this session chat' };
}

module.exports = { isChatAuthorized };

