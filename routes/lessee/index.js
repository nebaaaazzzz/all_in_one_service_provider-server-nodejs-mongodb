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
    .where({ approved: { $nin: [req.user.id] } }) //not to send approved houses
    .where({ rejected: { $nin: [req.user.id] } }) //not to send rejected houses
    .where({ user: { $ne: mongoose.Types.ObjectId(req.user.id) } }) // not to send
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)
    .limit(size);
  res.send(houses);
});
route.get("/near", async (req, res) => {
  const docs = await House.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [1, 2],
        },
      },
    },
  });
  res.send(docs);
});
route.get("/near", async (req, res) => {
  const keyword = "1";
  re = new RegExp(`\\b${keyword}\\b`, "gi");
  const docs = await House.find({
    $or: [
      { placeDescription: re },
      { region: re },
      { placeKind: re },
      { placeName: re },
      { propertyType: re },
      { detailDescription: re },
    ],
  }).sort({ createdAt: -1 });
  res.send(docs);
});
route.get("/region", async (req, res) => {
  const region = "1";
  re = new RegExp(`\\b${keyword}\\b`, "gi");
  const docs = await House.find({
    region: { $eq: region },
  }).sort({ createdAt: -1 });
  res.send(docs);
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
  if (house.approved) {
    const bool = house.approved.includes(req.user.id);
    if (bool) {
      const result = house.toObject();
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
    data: house,
  });
});

route.get("/approved", async (req, res) => {
  const query = req.query;
  const houseQuery = House.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  const houses = await houseQuery
    .where({
      approved: { $elemMatch: { $eq: req.user.id } },
    }) //not to send applied houses
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)
    .limit(size);
  res.send(houses);
});
route.get("/rejected", async (req, res) => {
  const query = req.query;
  const houseQuery = House.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  const houses = await houseQuery
    .where({
      rejected: { $elemMatch: { $eq: req.user.id } },
    }) //not to send applied houses
    .sort({ createdAt: -1 })
    .skip((page - 1) * size)
    .limit(size);

  res.send(houses);
});

module.exports = route;
