import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // http와 websocket이 같은 서버에 돌아가기 하기 위해 {server}를 안에 넣음

const sockets = []; // fake socket database

wss.on("connection", (socket) => {
  console.log("connected to Browser ✅");

  sockets.push(socket);
  socket.on("close", () => console.log("Disconnected from the Browser"));
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message);
    sockets.forEach((aSocket) =>
      aSocket.send(
        `${parsedMessage.payload.nickInput}: ${parsedMessage.payload.msgInput}`
      )
    );
  });
});

server.listen(3000, handleListen);
