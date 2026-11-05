const crypto = require('crypto');

// Socket rooms. Clients never choose their rooms: the socket layer joins them
// from the verified token (see socket.js).
const rooms = {
  everyone: 'everyone',
  user: (id) => `user:${id}`,
  role: (role) => `role:${role}`,
  departmentManagers: (department) => `managers:${department}`,
};

/**
 * Emit a notification to a room. A no-op when realtime is not available
 * (e.g. serverless deployments, tests), so callers never need to check.
 */
function notify(app, room, type, message, data) {
  const io = app.get('io');
  if (!io) return;
  io.to(room).emit('notification', {
    id: crypto.randomUUID(),
    type,
    message,
    data,
    createdAt: new Date().toISOString(),
  });
}

const formatDay = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

const describeRange = (leave) =>
  leave.totalDays === 1
    ? formatDay(leave.startDate)
    : `${formatDay(leave.startDate)} – ${formatDay(leave.endDate)}`;

function leaveSubmitted(app, leave, employee) {
  notify(
    app,
    rooms.departmentManagers(leave.department),
    'leave',
    `${employee.name} requested ${leave.totalDays} day${leave.totalDays === 1 ? '' : 's'} of ${leave.leaveType} leave (${describeRange(leave)})`,
    { leaveId: String(leave._id) }
  );
}

function leaveDecided(app, leave) {
  notify(
    app,
    rooms.user(leave.employee._id || leave.employee),
    'leave',
    `Your ${leave.leaveType} leave for ${describeRange(leave)} was ${leave.status}`,
    { leaveId: String(leave._id), status: leave.status }
  );
}

function holidayAnnounced(app, holiday) {
  notify(app, rooms.everyone, 'holiday', `Holiday added: ${holiday.name} on ${formatDay(holiday.date)}`, {
    holidayId: String(holiday._id),
  });
}

function userRegistered(app, user) {
  notify(app, rooms.role('admin'), 'user', `New account: ${user.name} (${user.department})`, {
    userId: String(user._id),
  });
}

module.exports = { rooms, leaveSubmitted, leaveDecided, holidayAnnounced, userRegistered };
