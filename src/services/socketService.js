const logger = require("./logger");

function initializeSocket(io) {
  const rooms = new Map(); // roomId -> Set of socketIds

  io.on("connection", (socket) => {
    logger.info({ event: "socket_connected", socketId: socket.id });

    socket.on("join-room", ({ roomId, userName }) => {
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      const otherUsers = Array.from(rooms.get(roomId)).filter(
        (id) => id !== socket.id
      );

      // Tell the new user who else is in the room
      socket.emit("all-users", otherUsers);

      logger.info({
        event: "socket_joined_room",
        socketId: socket.id,
        roomId,
        userName,
        peerCount: rooms.get(roomId).size,
      });
    });

    socket.on("sending-signal", (payload) => {
      // payload: { userToSignal, callerId, signal }
      io.to(payload.userToSignal).emit("user-joined", {
        signal: payload.signal,
        callerId: payload.callerId,
      });
    });

    socket.on("returning-signal", (payload) => {
      // payload: { signal, callerId }
      io.to(payload.callerId).emit("receiving-returned-signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on("send-message", ({ roomId, message }) => {
      // message: { role, content, ... }
      // Broadcast the message to everyone in the room EXCEPT the sender
      socket.to(roomId).emit("new-remote-message", message);
      
      logger.info({
        event: "socket_message_broadcast",
        socketId: socket.id,
        roomId,
      });
    });

    socket.on("disconnect", () => {
      // Remove the user from all rooms they were in
      rooms.forEach((users, roomId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          socket.to(roomId).emit("user-left", socket.id);
          
          if (users.size === 0) {
            rooms.delete(roomId);
          }
        }
      });

      logger.info({ event: "socket_disconnected", socketId: socket.id });
    });
  });
}

module.exports = {
  initializeSocket,
};
