const mongoose = require("mongoose");
const express = require("express");
const app = express();

const ErrorHandler = require("./utils/ErrorHandler");

//routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const employerRouter = require("./routes/employer");
const employeeRouter = require("./routes/employee");
const lesseRouter = require("./routes/lesse");
const lesserRouter = require("./routes/lesser");
const adminRouter = require("./routes/admin");

/*connect database */
mongoose.connect(process.env.MONGODB_LOCAL_URL, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("mongodb database connected");
  }
});
mongoose.set("returnOriginal", false);
const isSuspended = (req, res, next) => {
  if (!req.user.suspended) {
    next();
  }
  next(new ErrorHandler("suspended Accout", 401));
};
const isVerified = (req, res, next) => {
  if (req.user.verified) {
    next();
  } else {
    next(new ErrorHandler("not verified", 401));
  }
};
const isAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    next(new ErrorHandler("not admin", 401));
  }
};
/*global error middleware */
app.use((err, req, res, next) => {
  console.log(err);
  res.send(err.message);
});

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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiting middleware to all requests
app.use(limiter);

/*passport */
const passport = require("passport");
app.use(passport.initialize());

/*route */
require("./config/passport");
app.use("/auth", authRouter);
app.use("/", passport.authenticate("jwt", { session: false }), isSuspended);
app.use("/user", isVerified, userRouter);
app.use("/employer", isVerified, employerRouter);
app.use("/employee", isVerified, employeeRouter);
app.use("/lesse", isVerified, lesseRouter);
app.use("/lessor", isVerified, lesserRouter);
app.use("/admin", isVerified, isAdmin, adminRouter);
module.exports = {
  app,
};
