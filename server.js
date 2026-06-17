import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";


const PORT = 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const players = {}
const colors = [0xff0000,0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

io.on("connection", (socket) => {
  console.log("a user connected " + socket.id);
  
const id = socket.id
const n = Object.keys(players).length

players[id] = {
  id: id,
  x: 400 + n *100,
  y: 300,
  angle: 0,
  color: colors[n % colors.length]
}

socket.on ("ready", () => {
  socket.emit("init", {id: id, players: players})
});

socket.on("update", (data) => {
  if (players[socket.id]) {
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    players[socket.id].angle = data.angle;

    socket.broadcast.emit("playerMoved", {id: socket.id, x: data.x, y: data.y, angle: data.angle})
  }
});

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(express.static("public"));

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});