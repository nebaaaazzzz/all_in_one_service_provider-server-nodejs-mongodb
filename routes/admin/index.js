const route = require("express").Router();
const Job = require("./../../models/Job");
const User = require("./../../models/User");
const { isValidPhoneNumber } = require("libphonenumber-js");
const validator = require("validator").default;
const House = require("./../../models/House");
const Feedback = require("../../models/Feedback");
const {
  getUsers,
  getUser,
  suspendUser,
  unSuspendUser,
} = require("../../controller/admin");
const ErrorHandler = require("../../utils/ErrorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
route.get(
  "/overview",
  catchAsyncError(async (req, res, next) => {
    const numberOfUsers = await User.find().where({
      isAdmin: false,
    });
    const numberOfAdmin = await User.find().where({
      isAdmin: true,
    });
    const numberOfBannedUsers = await User.find().where({
      suspended: true,
    });
    const todayRegistedUsers = await User.find().where({
      isAdmin: false,
      createdAt: { $gt: Date.now() - 86400000 },
    });
    const numberOfApprovedHouses = await House.find().where({
      isApproved: 1,
    });
    const numberOfRejectedHouses = await House.find().where({
      isApproved: 2,
    });
    const numberOfPendingHouses = await House.find().where({
      isApproved: 0,
    });
    const numberOfApprovedJobs = await Job.find().where({
      isApproved: 1,
    });
    const numberOfRejectedJobs = await Job.find().where({
      isApproved: 2,
    });
    const numberOfPendingJobs = await Job.find().where({
      isApproved: 0,
    });
    const numberOfFeedback = await Feedback.find().where({
      comment: true,
    });
    const numberOfComplain = await Feedback.find().where({
      comment: false,
    });
    res.send({
      numberOfUsers: numberOfUsers.length,
      numberOfAdmin: numberOfAdmin.length,
      numberOfBannedUsers: numberOfBannedUsers.length,
      todayRegistedUsers: todayRegistedUsers.length,
      numberOfApprovedHouses: numberOfApprovedHouses.length,
      numberOfRejectedHouses: numberOfRejectedHouses.legnth,
      numberOfPendingHouses: numberOfPendingHouses.length,
      numberOfApprovedJobs: numberOfApprovedJobs.length,
      numberOfRejectedJobs: numberOfRejectedJobs.length,
      numberOfPendingJobs: numberOfPendingJobs.length,
      numberOfFeedback: numberOfFeedback.length,
      numberOfComplain: numberOfComplain.length,
    });
  })
);
route.get("/users", getUsers);
route.get("/user/:id", getUser);
route.patch("/user/:id/suspend", suspendUser);
route.patch("/user/:id/unsuspend", unSuspendUser);
route.get(
  "/house/posts",
  catchAsyncError(async (req, res) => {
    const query = req.query;
    const houseQuery = House.find();
    const page = query.page && query.page > 0 ? query.page : 1;
    const docs = await houseQuery
      .skip((page - 1) * 5)
      .where({ deleted: false })
      .limit(5)
      .sort({
        createdAt: -1,
      });
    if (docs) {
      return res.send(docs);
    }
    next(new ErrorHandler("houses cann't be found", 500));
  })
);
route.patch(
  `/left-update/:id`,
  catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.updateOne({
        left: 10,
        orderId: "",
      });
      return res.send({ success: true });
    }
    next(new ErrorHandler("user not found", 400));
  })
);
route.get(
  "/feedback",
  catchAsyncError(async (req, res) => {
    const query = req.query;
    const feedbackQuery = Feedback.find().populate("user");
    const page = query.page && query.page > 0 ? query.page : 1;

    const feed = await feedbackQuery
      .skip((page - 1) * 5)
      .where({ comment: query.feedback == 0 ? true : false })
      .limit(5)
      .sort({
        createdAt: -1,
      });
    return res.send(feed);
    next(new ErrorHandler("houses cann't be found", 500));
  })
);
route.get(
  "/house/post/:id",
  catchAsyncError(async (req, res) => {
    const house = await House.findById(req.params.id);

    if (house) {
      return res.send(house);
    }
    next(new ErrorHandler("house not  found", 404));
  })
);
route.patch(
  "/house/post/:id",
  catchAsyncError(async (req, res) => {
    const house = await House.findById(req.params.id);
    if (house) {
      return res.send(house);
    }
    next(new ErrorHandler("house not  found", 404));
  })
);
route.patch(
  "/house/approve/:id",
  catchAsyncError(async (req, res) => {
    const house = await House.findById(req.params.id);
    if (house) {
      await house.updateOne({
        isApproved: 1,
      });
      return res.send({ success: true });
    }
    next(new ErrorHandler("job not  found", 404));
  })
);
route.patch(
  "/house/reject/:id",
  catchAsyncError(async (req, res) => {
    const house = await House.findById(req.params.id);
    if (house) {
      await house.updateOne({
        isApproved: 2,
      });
      return res.send({ success: true });
    }
    next(new ErrorHandler("job not  found", 404));
  })
);
route.get(
  "/job/posts",
  catchAsyncError(async (req, res) => {
    const query = req.query;
    const jobQuery = Job.find();
    const page = query.page && query.page > 0 ? query.page : 1;
    const docs = await jobQuery
      .skip((page - 1) * 5)
      .limit(5)
      .where({ deleted: false })

      .sort({
        createdAt: -1,
      });
    if (docs) {
      return res.send(docs);
    }
    next(new ErrorHandler("Jobs cann't be found", 500));
  })
);
route.get(
  "/job/post/:id",
  catchAsyncError(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (job) {
      return res.send(job);
    }
    next(new ErrorHandler("job not  found", 404));
  })
);
route.patch(
  "/job/approve/:id",
  catchAsyncError(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.updateOne({
        isApproved: 1,
      });
      return res.send({ success: true });
    }
    next(new ErrorHandler("job not  found", 404));
  })
);
route.patch(
  "/job/reject/:id",
  catchAsyncError(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.updateOne({
        isApproved: 2,
      });
      return res.send({ success: true });
    }
    next(new ErrorHandler("job not  found", 404));
  })
);
route.post(
  "/add-admin",
  catchAsyncError(async (req, res, next) => {
    if (!validator.equals(req.body.password, req.body.confirmPassword)) {
      return next(new ErrorHandler("password mismatch", 400));
    } else {
      if (req.body.phoneNumber) {
        if (isValidPhoneNumber(req.body.phoneNumber, "ET")) {
          if (req.body.password.length < 6) {
            return next(
              new ErrorHandler("password length less than minumum", 400)
            );
          }
          const user = await User.findOne({
            phoneNumber: req.body.phoneNumber,
          }).select("+verified");
          if (user) {
            if (user.verified) {
              return next(new ErrorHandler("user already exists", 400));
            }
            let min = 100000;
            let max = 900000;
            let randString = Math.floor(Math.random() * (max - min + 1)) + min;

            const doc = await user.updateOne({
              firstName: req?.body?.firstName,
              lastName: req?.body?.lastname,
              password: req?.body?.password,
              isAdmin: true,
              phoneNumber: req?.body?.phoneNumber,
              gender: req?.body?.gender,
              dateOfBirth: req?.body?.date,
              verified: true,
            });
            // sendText(req.body.phoneNumber, "code " + randString);
            return res.status(201).send(doc);
          }

          try {
            let min = 100000;
            let max = 900000;
            let randString = Math.floor(Math.random() * (max - min + 1)) + min;
            const doc = await User.create({
              firstName: req?.body?.firstName,
              lastName: req?.body?.lastName,
              password: req?.body?.password,
              phoneNumber: req?.body?.phoneNumber,
              gender: req?.body?.gender,
              dateOfBirth: req?.body?.date,
              randString,
              verified: true,
            });
            // sendText(req.body.phoneNumber, "code " + randString);
            return res.status(201).send(doc);
          } catch (err) {
            throw err;
          }
        } else {
          return next(new ErrorHandler("invalid phonenumber", 400));
        }
      } else {
        return next(new ErrorHandler("some fields required", 400));
      }
    }
  })
);
route.post("/update-left", (req, res) => {});
// route.delete("/user/:id", deleteUser);
// route.post("/add-user", registerUser);
// route.post("/validate", validateUserAccount);
// route.post("/validate", validateUserAccount);
module.exports = route;
