const upload = require("../../config/fileHandler");
const bucket = require("../../config/db");
const route = require("express").Router();
const House = require("./../../models/House");
const { default: mongoose } = require("mongoose");
const { findPhoneNumbersInText } = require("libphonenumber-js");
const ErrorHandler = require("../../utils/ErrorHandler");
route.post(
  "/posthouse",

  upload.array("houseImage", 100),
  async (req, res) => {
    const obj = JSON.parse(req.body.body);
    obj.houseImages = req.files.map((file) => file.id);
    obj.price = Number(obj.price);
    obj.location = { type: "Point", coordinates: obj.center };
    delete obj.center;
    await House.create({ ...obj, user: req.user.id });
    res.status(201).send({
      success: true,
    });
  }
);
route.get("/house/:id", async (req, res, next) => {
  const house = await House.findById(req.params.id);
  if (!house) {
    return next(new ErrorHandler("house not found", 404));
  }
  res.send({
    success: true,
    data: house,
  });
});
route.get("/posts", async (req, res) => {
  let page = req?.query?.page;
  page = page > 1 ? page : 1;
  const pageSize = 5;
  const query = House.find({ id: req.user.id });
  const houses = await query
    .sort({ createdAt: 1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.send(houses);
});

module.exports = route;
