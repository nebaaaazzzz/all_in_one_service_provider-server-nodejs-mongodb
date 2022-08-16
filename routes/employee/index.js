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
    const option = "im";
    const region = query.region;
    jobQuery = jobQuery.where({
      $or: [
        { region: { $eq: region } },
        { placeName: { $regex: region, $options: option } },
      ],
    });
  }
  if (query.category) {
    const category = query.category;
    jobQuery = jobQuery.where({
      category: { $eq: category },
    });
  }
  if (query.gender) {
    const gender = query.gender;
    jobQuery = jobQuery.where({
      gender: { $eq: gender },
    });
  }
  if (query.permanent) {
    const permanent = query.permanent;
    jobQuery = jobQuery.where({
      permanent: { $eq: permanent },
    });
  }
  if (query.cvRequired) {
    const cvRequired = query.cvRequired;
    jobQuery = jobQuery.where({
      cvRequired: { $eq: cvRequired },
    });
  }

  const jobs = await jobQuery
    .where({ applicants: { $nin: [req.user.id] } }) //not to send applied houses
    .where({ approved: { $nin: [req.user.id] } }) //not to send applied houses
    .where({ rejected: { $nin: [req.user.id] } }) //not to send applied houses
    .where({ user: { $ne: mongoose.Types.ObjectId(req.user.id) } }) // not to send
    .where({ deleted: { $ne: true } }) // not to send
    .where({ isApproved: { $eq: 1 } }) // not to send
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)

    .limit(size);
  res.send(jobs);
});
route.get("/job/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("job not found", 404));
  }
  if (job.applicants.length) {
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
  if (job.approved.length) {
    const bool = job.approved.includes(req.user.id);
    const user = await User.findById(job.user).select("+phoneNumber +email");
    if (bool) {
      const result = job.toObject();
      result.isUserApproved = true;
      result.user = user;
      return res.send({
        success: true,
        data: result,
      });
    }
  }
  if (job.rejected.length) {
    const bool = job.rejected.includes(req.user.id);
    if (bool) {
      const result = job.toObject();
      result.isUserRejected = true;
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
  //
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
      await User.findByIdAndUpdate(req.user.id, {
        left: req.user?.left - 1,
      });
    } else {
      const bool = applicants.includes(req.user.id);
      if (bool) {
        await job.updateOne({
          $pull: { applicants: req.user.id },
        });
        await User.findByIdAndUpdate(req.user.id, {
          left: req.user?.left + 1,
        });
      } else {
        await job.updateOne({
          $addToSet: { applicants: req.user.id },
        });
        await User.findByIdAndUpdate(req.user.id, {
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
      rejected: { $elemMatch: { $eq: req.user.id } },
    }) //not to send applied houses
    .sort({ updatedAt: -1 })
    .skip((page - 1) * size)
    .limit(size);

  res.send(houses);
});

module.exports = route;
