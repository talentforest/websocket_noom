import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  // wsServer.sockets.adapter로부터 sids와 rooms를 가져온다.
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  //javascript maps기능
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log("event", event);
    console.log(wsServer.sockets.adapter);
  });
  socket.on("enter_room", (nickname, roomName, done) => {
    socket.join(roomName); // 소켓 방 생성
    done();
    socket["nickname"] = nickname;
    wsServer.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // 나를 제외한 방안에 있는 모든 사람들이 볼 수 있도록 / 메세지를 하나의 socket에만 보낸다.
    // 연결된 모든 소켓에 공지를 남기는 것
    wsServer.sockets.emit("room_change", publicRooms()); // 메세지를 모든 소켓에 보낸다.
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
});

httpServer.listen(3000, handleListen);
