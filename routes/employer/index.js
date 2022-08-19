const mongoose = require("mongoose");
const route = require("express").Router();
const Job = require("./../../models/Job");
const upload = require("../../config/fileHandler");
const bucket = require("../../config/db");
const validator = require("validator").default;
const User = require("../../models/User");
const ErrorHandler = require("../../utils/ErrorHandler");
const catchAsyncError = require("../../utils/catchAsyncError");
route.post(
  "/postjob",
  upload.single("document"),
  catchAsyncError(async (req, res, next) => {
    if (req.user?.left > 0) {
      const obj = JSON.parse(req.body.body);
      obj.document = req?.file?.filename;
      if (obj.budget) {
        obj.budget.from = Number(obj.budget.from);
        obj.budget.to = Number(obj.budget.to);
      }
      obj.location = { type: "Point", coordinates: obj.center };
      delete obj.center;
      await Job.create({ ...obj, user: req.user.id });
      await User.findByIdAndUpdate(req.user.id, {
        left: req.user.left - 1,
      });
      return res.status(201).send({
        success: true,
      });
    }
    next(new ErrorHandler("please pay", 400));
  })
);

route.get(
  "/job/:id",
  catchAsyncError(async (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {
      const job = await Job.findById(req.params.id);
      if (job) {
        return res.send({
          success: true,
          data: job,
        });
      }
    }
    next(new ErrorHandler("job not found", 404));
  })
);
route.patch(
  "/close/:id",
  catchAsyncError(async (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {
      const job = await Job.findById(req.params.id);
      if (job) {
        await job.updateOne({
          $set: { closed: true },
        });
        return res.send({
          success: true,
        });
      }
    }
    next(new ErrorHandler("job not found", 404));
  })
);
// route.get("/feedback", async (req, res) => {
//   res.status(201).send({
//     success: true,
//   });
// });
route.patch(
  "/update/:id",
  upload.single("document"),
  catchAsyncError(async (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {
      const job = await Job.findById(req.params.id);
      if (job) {
        await Job.findByIdAndUpdate(req.params.id, {
          closed: false,
          ...JSON.parse(req.body.body),
          ...(req?.file?.filename ? { document: req.file.filename } : {}),
        });
        await job.updateOne({
          close: false,
          ...JSON.parse(req.body.body),
          ...(req?.file?.filename ? { document: req.file.filename } : {}),
        });
        return res.send({
          success: true,
        });
      }
    }
    next(new ErrorHandler("job not found", 404));
  })
);
route.delete(
  "/job/:id",
  catchAsyncError(async (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {
      const job = await Job.findById(req.params.id);
      if (job) {
        await job.updateOne({
          deleted: true,
        });
        return res.send({
          success: true,
        });
      }
    }
    return next(new ErrorHandler("job not found", 404));
  })
);
route.post(
  "/edit-post/:id",
  catchAsyncError(async (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {
      const job = await Job.findById(req.params.id);
      if (job) {
        await job.updateOne({ ...req.body, closed: false });
        return res.send();
      }
    }
    return next(new ErrorHandler("house not found", 404));
  })
);

route.get(
  "/posts",
  catchAsyncError(async (req, res) => {
    let page = req?.query?.page;
    page = page > 1 ? page : 1;
    const pageSize = 5;
    const query = Job.find();
    const jobs = await query
      .where({ user: { $eq: new mongoose.Types.ObjectId(req.user.id) } })
      .sort({ createdAt: -1 })
      .where({ deleted: { $eq: false } })
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    res.send(jobs);
  })
);

route.get(
  "/applicants/:id",
  catchAsyncError(async (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {
      const job = await Job.findById(req.params.id);
      if (job) {
        if (job.applicants) {
          let page = req?.query?.page;
          page = page > 1 ? page : 1;
          const pageSize = 5;
          const skip = pageSize * (page - 1);
          const limit = skip + pageSize;
          const applicants = job.applicants.slice(skip, limit);
          const docs = await User.find({ _id: { $in: applicants } });
          return res.send(docs);
        }

        return res.send([]);
      }
    }
    next(new ErrorHandler("job not found", 404));
  })
);
route.get(
  "/approved/:id",
  catchAsyncError(async (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {
      const job = await Job.findById(req.params.id);
      if (job) {
        if (job.approved) {
          let page = req?.query?.page;
          page = page > 1 ? page : 1;
          const pageSize = 5;
          const skip = pageSize * (page - 1);
          const limit = skip + pageSize;
          const approved = job.approved.slice(skip, limit);
          const docs = await User.find({ _id: { $in: approved } });
          return res.send(docs);
        }

        return res.send([]);
      }
    }
    next(new ErrorHandler("job not found", 404));
  })
);

route.get(
  "/rejected/:id",
  catchAsyncError(async (req, res, next) => {
    if (validator.isMongoId(req.params.id)) {
      const job = await Job.findById(req.params.id);
      if (job) {
        if (job.rejected) {
          let page = req?.query?.page;
          page = page > 1 ? page : 1;
          const pageSize = 5;
          const skip = pageSize * (page - 1);
          const limit = skip + pageSize;
          const rejected = job.rejected.slice(skip, limit);
          const docs = await User.find({ _id: { $in: rejected } });
          return res.send(docs);
        }

        return res.send([]);
      }
    }
    next(new ErrorHandler("job not found", 404));
  })
);
route.get(
  "/approve/:userId/:jobId",
  catchAsyncError(async (req, res, next) => {
    if (
      validator.isMongoId(req.params.jobId) &&
      validator.isMongoId(req.params.userId)
    ) {
      const user = await User.findById(req.params.userId);
      const job = await Job.findById(req.params.jobId);
      if (job && user) {
        if (job.applicants.length) {
          const applicants = job.applicants;
          const bool = applicants.includes(req.params.userId);
          if (bool) {
            await job
              .updateOne({
                $addToSet: { approved: req.params.userId },
              })
              .updateOne({
                $pull: { applicants: { $eq: req.params.userId } },
              });
            res.send({ sucess: true });
          } else {
            return next("user not applied", 404);
          }
        }
        return next(("no one applied", 404));
      }
    }
    next(new ErrorHandler("user or house not found", 404));
  })
);
route.get(
  "/reject/:userId/:jobId",
  catchAsyncError(async (req, res, next) => {
    if (
      validator.isMongoId(req.params.jobId) &&
      validator.isMongoId(req.params.userId)
    ) {
      const user = await User.findById(req.params.userId);
      const job = await Job.findById(req.params.jobId);
      if (job && user) {
        if (job.applicants.length) {
          const applicants = job.applicants;
          const bool = applicants.includes(req.params.userId);
          if (bool) {
            await job
              .updateOne({
                $addToSet: { rejected: req.params.userId },
              })
              .updateOne({
                $pull: { applicants: { $eq: req.params.userId } },
              });
            return res.send({ sucess: true });
          } else {
            return next(new ErrorHandler("user not applied", 404));
          }
        } else if (job.approved.length) {
          const approved = job.approved;
          const bool = approved.includes(req.params.userId);
          if (bool) {
            await job
              .updateOne({
                $addToSet: { rejected: req.params.userId },
              })
              .updateOne({
                $pull: { approved: { $eq: req.params.userId } },
              });
            return res.send({ sucess: true });
          }
        }
        return next(new ErrorHandler("no one applied", 404));
      }
    }
    next(new ErrorHandler("user or house not found", 404));
  })
);
route.get(
  "/:jobId/:userId",
  catchAsyncError(async (req, res, next) => {
    if (
      validator.isMongoId(req.params.jobId) &&
      validator.isMongoId(req.params.userId)
    ) {
      const job = await Job.findById(req.params.jobId);
      const user = await User.findById(req.params.userId);
      if (job && user) {
        if (job.applicants.length) {
          const bool = job.applicants.includes(req.params.userId);
          if (bool) {
            const result = user.toObject();
            result.applied = true;
            return res.send(result);
          }
        }
        if (job.approved.length) {
          const bool = job.approved.includes(req.params.userId);
          if (bool) {
            const result = user.toObject();
            result.approved = true;
            return res.send(result);
          }
        }
        if (job.rejected.length) {
          const bool = job.approved.includes(req.params.userId);
          if (bool) {
            const result = user.toObject();
            result.rejected = true;
            return res.send(result);
          }
        }
        return res.send(user);
      }
    }
    return next(new ErrorHandler("house and users not found", 404));
  })
);
module.exports = route;
