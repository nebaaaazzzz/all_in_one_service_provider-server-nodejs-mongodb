const route = require("express").Router();

const {
  registerUser,
  validateUserAccount,
  loginUser,
} = require("../../controller/authController");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
route.post("/login", loginUser);
route.post("/register", registerUser);
// route.post("/register", (req, res) => {
//   console.log(req.body);
//   res.send("hello");
// });
route.post("/validate", validateUserAccount);
module.exports = route;
