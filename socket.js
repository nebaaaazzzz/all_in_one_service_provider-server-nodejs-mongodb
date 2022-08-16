let io;
const Server = require("socket.io").Server;
module.exports = {
  init: (server) => {
    io = new Server(server);
    return io;
  },
  get: () => {
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  },
};
