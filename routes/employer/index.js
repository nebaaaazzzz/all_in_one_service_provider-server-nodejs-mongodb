const mongoose = require("mongoose");
const route = require("express").Router();
const Job = require("./../../models/Job");
const upload = require("../../config/fileHandler");
const bucket = require("../../config/db");
const User = require("../../models/User");
route.post("/postjob", upload.single("document"), async (req, res) => {
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
  res.status(201).send({
    success: true,
  });
});
route.get("/job/:id", async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("job not found", 404));
  }
  res.send({
    success: true,
    data: job,
  });
});
route.post("/edit-post/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    await job.updateOne(req.body);
    return res.send();
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
  next(new ErrorHandler("job not found", 404));
});
route.get("/approve/:jobId/:userId", async (req, res, next) => {
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
  next(new ErrorHandler("user or house not found", 404));
});
route.get("/reject/:jobId/:userId", async (req, res, next) => {
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
  next(new ErrorHandler("user or house not found", 404));
});

module.exports = route;
