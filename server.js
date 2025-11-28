import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.get("/", (req, res) => res.send("🌲 Great Forest Server is running!"));

// Render 환경 포트 설정 (중요)
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let players = {};

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  socket.on("join", (name) => {
    players[socket.id] = { id: socket.id, name, position: { x: 400, y: 300 } };
    io.emit("players", players);
  });

  socket.on("move", (position) => {
    if (players[socket.id]) {
      players[socket.id].position = position;
      socket.broadcast.emit("playerMoved", { id: socket.id, position });
    }
  });

  socket.on("chatMessage", ({ name, message }) => {
    io.emit("chatMessage", { id: socket.id, name, message });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("players", players);
    console.log("❌ Player disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`🌳 Server running on port ${PORT}`));
