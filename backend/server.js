const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

function getRoomSize(roomId) {
  return rooms.get(roomId)?.size || 0;
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, displayName }) => {
    if (!roomId) return;

    const currentSize = getRoomSize(roomId);
    if (currentSize >= 2) {
      socket.emit("room-full");
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.displayName = displayName || "Guest";

    if (!rooms.has(roomId)) rooms.set(roomId, new Set());
    rooms.get(roomId).add(socket.id);

    const existingPeers = [...rooms.get(roomId)].filter((id) => id !== socket.id);

    socket.emit("joined-room", { roomId, existingPeers });
    socket.to(roomId).emit("peer-joined", {
      peerId: socket.id,
      displayName: socket.data.displayName,
    });

    console.log(`${socket.id} joined room ${roomId} (${getRoomSize(roomId)}/2)`);
  });

  socket.on("webrtc-offer", ({ targetId, sdp }) => {
    io.to(targetId).emit("webrtc-offer", { fromId: socket.id, sdp });
  });

  socket.on("webrtc-answer", ({ targetId, sdp }) => {
    io.to(targetId).emit("webrtc-answer", { fromId: socket.id, sdp });
  });

  socket.on("webrtc-ice-candidate", ({ targetId, candidate }) => {
    io.to(targetId).emit("webrtc-ice-candidate", { fromId: socket.id, candidate });
  });

  socket.on("call-control", ({ roomId, type, value }) => {
    socket.to(roomId).emit("call-control", { fromId: socket.id, type, value });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const roomId = socket.data.roomId;
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) rooms.delete(roomId);
      socket.to(roomId).emit("peer-left", { peerId: socket.id });
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});