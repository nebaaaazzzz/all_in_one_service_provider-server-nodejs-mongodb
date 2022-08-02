const route = require("express").Router();
const House = require("../../models/House");
const User = require("./../../models/User");
const mongoose = require("mongoose");
const ErrorHandler = require("../../utils/ErrorHandler");
route.get("/", async (req, res, next) => {
  const query = req.query;
  let houseQuery = House.find();
  const page = query.page > 1 ? query.page : 1;
  const size = 5;
  if (query.nearBy) {
    const coords = query.nearBy.split(",");
    if (Boolean(coords[0]) && Boolean(coords[1])) {
      houseQuery = houseQuery.where({
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
    console.log(keyword);
    houseQuery = houseQuery.where({
      $or: [
        // { placeDescription: { $regex: keyword, $options: option } },
        { region: { $regex: keyword, $options: option } },
        { placeKind: { $regex: keyword, $options: option } },
        { placeName: { $regex: keyword, $options: option } },
        { detailDescription: { $regex: keyword, $options: option } },
      ],
    });
  }
  if (query.price) {
    const price = query.price;
    houseQuery = houseQuery.where({
      price: { $gt: price },
    });
  }
  if (query.region) {
    const region = query.region;
    const option = "im";

    houseQuery = houseQuery.where({
      $or: [
        { region: { $eq: region } },
        { placeName: { $regex: region, $options: option } },
      ],
    });
  }

  if (query.propertyType) {
    const propertyType = query.propertyType;
    houseQuery = houseQuery.where({
      "placeDescription.title": { $eq: propertyType },
    });
  }
  const houses = await houseQuery
    .where({ applicants: { $nin: [req.user.id] } }) //not to send applied houses
    .where({ approved: { $nin: [req.user.id] } }) //not to send approved houses
    .where({ rejected: { $nin: [req.user.id] } }) //not to send rejected houses
    .where({ user: { $ne: mongoose.Types.ObjectId(req.user.id) } }) // not to send
    .where({ deleted: { $ne: true } }) // not to send
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
      await User.findByIdAndUpdate(req.user.id, {
        left: req.user?.left - 1,
      });
    } else {
      const bool = applicants.includes(req.user.id);
      if (bool) {
        await house.updateOne({
          $pull: { applicants: req.user.id },
        });
        await User.findByIdAndUpdate(req.user.id, {
          left: req.user?.left + 1,
        });
      } else {
        await house.updateOne({
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
