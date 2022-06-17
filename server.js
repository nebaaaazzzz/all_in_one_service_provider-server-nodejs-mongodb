const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const app = require("./app.js").app;
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
