const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const express = require("express");
const app = express();

const setUp = require("./socket");
const server = http.createServer(app);
const io = setUp.init(server);
io.on("connection", (socket) => {
  console.log("connection created");
  socket.on("disconnect", () => {
    console.log("Connection disconnected", socket.id);
  });
  // ...
});

const os = require("os");
let HOSTNAME = "localhost";
if (os.networkInterfaces().wlo1) {
  HOSTNAME = os.networkInterfaces()?.wlo1[0]?.address;
}
require("./app.js")(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, HOSTNAME, () => {
  console.log(`listening on *${server.address().address}:${PORT}`);
});
