const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bucket = require("./config/db")();

const ErrorHandler = require("./utils/ErrorHandler");
//routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const commonRouter = require("./routes/common");
const employerRouter = require("./routes/employer");
const employeeRouter = require("./routes/employee");
const lesseeRouter = require("./routes/lessee");
const lesserRouter = require("./routes/lesser");
const adminRouter = require("./routes/admin");
const paymentRouter = require("./routes/payment");
/* */

/*connect database */
require("./config/db");
/* */
const isSuspended = (req, res, next) => {
  if (!req.user.suspended) {
    return next();
  }
  next(new ErrorHandler("suspended Accout", 401));
};
const upload = require("./config/fileHandler");

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
/*auth router */
app.use("/auth", authRouter);

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply the rate limiting middleware to all requests
app.use(limiter);
/* getting house image*/
app.get("/house/image/:id", async (req, res, next) => {
  // res.sendFile(path.join(__dirname, "./../../User_Icon.png"));
  const cursor = await bucket.find({
    _id: new mongoose.Types.ObjectId(req.params.id),
  });
  const files = await cursor.toArray();
  if (files.length) {
    files.forEach((doc) => {
      res.set("Content-Type", doc.contentType);
      res.set("Content-Length", doc.length);
      bucket.openDownloadStream(doc._id).pipe(res);
    });
    return;
  }
  next(new ErrorHandler("notfound image", 404));
});
/*passport */
const passport = require("passport");
app.use(passport.initialize());

/*route */
require("./config/passport");

app.use("/", passport.authenticate("jwt", { session: false }), isSuspended);
app.use(isVerified);
app.use("/", commonRouter);
app.use("/user", userRouter);
app.use("/employer", employerRouter);
app.use("/employee", employeeRouter);
app.use("/lessee", lesseeRouter);
app.use("/lesser", lesserRouter);
app.use("/admin", isAdmin, adminRouter);
app.use("/payment", paymentRouter);
/*global error middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 400;
  res.status(statusCode).send({
    err: err.message,
  });
});

module.exports = {
  app,
};
