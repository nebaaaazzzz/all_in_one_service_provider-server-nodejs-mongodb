const route = require("express").Router();
const House = require("../../models/House");
const mongoose = require("mongoose");
const ErrorHandler = require("../../utils/ErrorHandler");
route.get("/", async (req, res, next) => {
  const query = req.query;
  const houseQuery = House.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  const houses = await houseQuery
    .where({ applicants: { $nin: [req.user.id] } }) //not to send applied houses
    .where({ user: { $ne: mongoose.Types.ObjectId(req.user.id) } }) // not to send
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)
    .limit(size);
  res.send(houses);
});
route.post("/apply/:id", async (req, res, next) => {
  const house = await House.findById(req.params.id);
  if (house) {
    const applicants = house.applicants;
    if (!applicants) {
      await house.updateOne({
        $set: { applicants: [] },
        $addToSet: { applicants: req.user.id },
      });
    } else {
      const bool = applicants.includes(req.user.id);
      if (bool) {
        await house.updateOne({
          $pull: { applicants: req.user.id },
        });
      } else {
        await house.updateOne({
          $addToSet: { applicants: req.user.id },
        });
      }
    }
    return res.send({ success: true });
  }
  return next(new ErrorHandler("house not found", 404));
});
route.get("/applied", async (req, res) => {
  const query = req.query;
  const houseQuery = House.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  const houses = await houseQuery
    .where({
      applicants: { $elemMatch: { $eq: req.user.id } },
    }) //not to send applied houses
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)
    .limit(size);

  res.send(houses);
});
route.get("/house/:id", async (req, res, next) => {
  const house = await House.findById(req.params.id);
  if (!house) {
    return next(new ErrorHandler("house not found", 404));
  }
  if (house.applicants) {
    const bool = house.applicants.includes(req.user.id);
    if (bool) {
      const result = house.toObject();
      result.applied = true;
      return res.send({
        success: true,
        data: result,
      });
    }
  }
  res.send({
    success: true,
    data: house,
  });
});
module.exports = route;
