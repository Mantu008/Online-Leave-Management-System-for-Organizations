const { Server } = require('socket.io');
const { userFromToken } = require('./middleware/auth');
const { rooms } = require('./services/notifications');

/**
 * Realtime notifications. Every connection must present a valid JWT; rooms
 * are derived from the verified user, and clients cannot emit events to other
 * users — all notifications originate from server-side actions.
 */
function attachSocket(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigins, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const user = await userFromToken(socket.handshake.auth && socket.handshake.auth.token);
      socket.data.user = { id: String(user._id), role: user.role, department: user.department };
      next();
    } catch (err) {
      next(new Error(err.message || 'Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role, department } = socket.data.user;
    socket.join([rooms.everyone, rooms.user(id), rooms.role(role)]);
    if (role === 'manager') socket.join(rooms.departmentManagers(department));
  });

  return io;
}

module.exports = { attachSocket };
