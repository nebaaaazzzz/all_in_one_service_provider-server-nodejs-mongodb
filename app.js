const express = require("express");
const app = express();
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const employerRouter = require("./routes/employer");
/*connect database */
require("./config/connectdb");

const isVerified = (req, res, next) => {
  if (req.user.verified) {
    next();
  } else {
    next(new Error("not verified"));
  }
};
/*global error middleware */
app.use((err, req, res, next) => {});

/*middleware */
app.use(express.json());

/*
security
*/
const helmet = require("helmet");
app.use(helmet());
/*Strict-Transport-SEcurity
X-Frame-Option
X-XSS-Potection
X-Content-Type-Options
Content-Security-Policy
*/
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

/*passport */
app.use(passport.initialize());
/*route */

app.use("/auth", authRouter);
require("./config/passport");
app.use(
  "/user",
  passport.authenticate("jwt", { session: false }),
  isVerified,
  userRouter
);
app.use(
  "/employer",
  passport.authenticate("jwt", { session: false }),
  isVerified,
  employerRouter
);

module.exports = {
  app,
};
