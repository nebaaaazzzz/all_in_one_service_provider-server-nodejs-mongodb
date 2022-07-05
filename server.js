const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./app.js").app;
const server = http.createServer(app);
const os = require("os");
const PORT = process.env.PORT || 3000;
// server.listen(PORT , )
server.listen(PORT, () => {
  console.log(`listening on *${server.address().address}:${PORT}`);
});
// const localtunnel = require("localtunnel");
// (async () => {
//   const tunnel = await localtunnel({ port: PORT });

//   // the assigned public url for your tunnel
//   // i.e. https://abcdefgjhij.localtunnel.me
//   console.log(tunnel.uri);
//   tunnel.on("close", () => {
//     console.log("tunnel close server line 20");
//     // tunnels are closed
//   });
// })();
