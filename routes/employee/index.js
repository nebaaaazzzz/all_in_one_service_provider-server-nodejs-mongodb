const route = require("express").Router();
const Job = require("../../models/Job");
const User = require("./../../models/User");
const mongoose = require("mongoose");
route.get("/", async (req, res, next) => {
  const query = req.query;
  let jobQuery = Job.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  if (query.nearBy) {
    const coords = query.nearBy.split(",");
    if (Boolean(coords[0]) && Boolean(coords[1])) {
      jobQuery = jobQuery.where({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: coords,
            },
          },
        },
      });
    }
  }
  if (query.search) {
    const keyword = query.search;
    const option = "im";
    jobQuery = jobQuery.where({
      $or: [
        { title: { $regex: keyword, $options: option } },
        { category: { $regex: keyword, $options: option } },
        { placeName: { $regex: keyword, $options: option } },
        { skills: { $regex: keyword, $options: option } },
        { description: { $regex: keyword, $options: option } },
      ],
    });
  }
  if (query.region) {
    const region = query.region;
    jobQuery = jobQuery.where({
      region: { $eq: region },
    });
  }
  const jobs = await jobQuery
    .where({ applicants: { $nin: [req.user.id] } }) //not to send applied houses
    .where({ user: { $ne: mongoose.Types.ObjectId(req.user.id) } }) // not to send
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)
    .limit(size);
  res.send(jobs);
});
route.get("/job/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("house not found", 404));
  }
  if (job.applicants) {
    const bool = job.applicants.includes(req.user.id);
    if (bool) {
      const result = job.toObject();
      result.applied = true;
      return res.send({
        success: true,
        data: result,
      });
    }
  }
  if (job.approved) {
    const bool = job.approved.includes(req.user.id);
    if (bool) {
      const result = job.toObject();
      result.approved = true;
      result.user = req.user;
      return res.send({
        success: true,
        data: result,
      });
    }
  }
  res.send({
    success: true,
    data: job,
  });
});

route.post("/apply/:id", async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (job) {
    const applicants = job.applicants;
    if (!applicants) {
      await job.updateOne({
        $set: { applicants: [] },
        $addToSet: { applicants: req.user.id },
      });
      await User.findByIdAndUpdate({
        left: req.user?.left - 1,
      });
    } else {
      const bool = applicants.includes(req.user.id);
      if (bool) {
        await job.updateOne({
          $pull: { applicants: req.user.id },
        });
        await User.findByIdAndUpdate({
          left: req.user?.left + 1,
        });
      } else {
        await job.updateOne({
          $addToSet: { applicants: req.user.id },
        });
        await User.findByIdAndUpdate({
          left: req.user?.left - 1,
        });
      }
    }
    return res.send({ success: true });
  }
  return next(new ErrorHandler("house not found", 404));
});

route.get("/applied", async (req, res) => {
  const query = req.query;
  const jobQuery = Job.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  const jobs = await jobQuery
    .where({
      applicants: { $elemMatch: { $eq: req.user.id } },
    }) //not to send applied houses
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)
    .limit(size);

  res.send(jobs);
});

route.get("/approved", async (req, res) => {
  const query = req.query;
  const jobQuery = Job.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  const houses = await jobQuery
    .where({
      approved: { $elemMatch: { $eq: req.user.id } },
    }) //not to send applied houses
    .sort({ updatedAt: -1 })
    .skip((page - 1) * size)
    .limit(size);

  res.send(houses);
});
route.get("/rejected", async (req, res) => {
  const query = req.query;
  const jobQuery = Job.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  const houses = await jobQuery
    .where({
      approved: { $elemMatch: { $eq: req.user.id } },
    }) //not to send applied houses
    .sort({ updatedAt: -1 })
    .skip((page - 1) * size)
    .limit(size);

  res.send(houses);
});

module.exports = route;
