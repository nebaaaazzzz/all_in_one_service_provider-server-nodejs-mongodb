const mongoose = require("mongoose");
const route = require("express").Router();
const Job = require("./../../models/Job");
const upload = require("../../config/fileHandler");
const bucket = require("../../config/db");
const validator = require("validator").default;
const User = require("../../models/User");
const ErrorHandler = require("../../utils/ErrorHandler");
route.post("/postjob", upload.single("document"), async (req, res) => {
  if (user?.left > 0) {
    const obj = JSON.parse(req.body.body);
    obj.document = req?.file?.id;
    if (obj.salary) {
      obj.salary = Number(obj.price);
    }
    if (obj.budget) {
      obj.budget.from = Number(obj.budget.from);
      obj.budget.to = Number(obj.budget.to);
    }
    obj.location = { type: "Point", coordinates: obj.center };
    delete obj.center;
    await Job.create({ ...obj, user: req.user.id });
    await User.findByIdAndUpdate(req.user, {
      left: user.left - 1,
    });
    res.status(201).send({
      success: true,
    });
  }
  next(new ErrorHandler("please py", 400));
});

route.get("/job/:id", async (req, res, next) => {
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
});
route.post("/edit-post/:id", async (req, res, next) => {
  if (validator.isMongoId(req.params.id)) {
    const job = await Job.findById(req.params.id);
    if (job) {
      await job.updateOne(req.body);
      return res.send();
    }
  }
  return next(new ErrorHandler("house not found", 404));
});
route.get("/posts", async (req, res) => {
  let page = req?.query?.page;
  page = page > 1 ? page : 1;
  const pageSize = 5;
  const query = Job.find();
  const jobs = await query
    .where({ user: { $eq: new mongoose.Types.ObjectId(req.user.id) } })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.send(jobs);
});

route.get("/applicants/:id", async (req, res, next) => {
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
});
route.get("/arroved/:id", async (req, res, next) => {
  if (validator.isMongoId(req.params.id)) {
    const job = await Job.findById(req.params.id);
    if (job) {
      if (job.arroved) {
        let page = req?.query?.page;
        page = page > 1 ? page : 1;
        const pageSize = 5;
        const skip = pageSize * (page - 1);
        const limit = skip + pageSize;
        const arroved = job.arroved.slice(skip, limit);
        const docs = await User.find({ _id: { $in: arroved } });
        return res.send(docs);
      }

      return res.send([]);
    }
  }
  next(new ErrorHandler("job not found", 404));
});
route.get("/rejected/:id", async (req, res, next) => {
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
});
route.get("/approve/:jobId/:userId", async (req, res, next) => {
  if (
    validator.isMongoId(req.params.jobId) &&
    validator.isMongoId(req.params.userId)
  ) {
    const job = await User.findById(req.params.jobId);
    const house = await Job.findById(req.params.houseId);
    if (job && job) {
      if (house.applicants.length) {
        const applicants = house.applicants;
        const bool = applicants.includes(req.params.userId);
        if (bool) {
          await job
            .UpateOne({
              $addToSet: { approved: req.params.userId },
            })
            .updateOne({
              $pull: { votes: { $eq: req.params.userId } },
            });
        } else {
          return next("user not applied", 404);
        }
      }
      return next(("no one applied", 404));
    }
  }
  next(new ErrorHandler("user or house not found", 404));
});
route.get("/reject/:jobId/:userId", async (req, res, next) => {
  if (
    validator.isMongoId(req.params.jobId) &&
    validator.isMongoId(req.params.userId)
  ) {
    const job = await User.findById(req.params.jobId);
    const house = await Job.findById(req.params.houseId);
    if (job && job) {
      if (house.applicants.length) {
        const applicants = house.applicants;
        const bool = applicants.includes(req.params.userId);
        if (bool) {
          await job
            .UpateOne({
              $addToSet: { rejected: req.params.userId },
            })
            .house.updateOne({
              $pull: { votes: { $eq: req.params.userId } },
            });
        } else {
          return next("user not applied", 404);
        }
      }
      return next(("no one applied", 404));
    }
  }
  next(new ErrorHandler("user or house not found", 404));
});
route.get("/:jobId/:userId", async (req, res, next) => {
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
});
module.exports = route;
