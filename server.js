const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./app.js").app;
const server = http.createServer(app);

const os = require("os");
let HOSTNAME = "localhost";
if (os.networkInterfaces().wlo1) {
  HOSTNAME = os.networkInterfaces()?.wlo1[0]?.address;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, HOSTNAME, () => {
  console.log(`listening on *${server.address().address}:${PORT}`);
});
// server.listen(PORT, () => {
//   console.log(`listening on *${server.address().address}:${PORT}`);
// });
