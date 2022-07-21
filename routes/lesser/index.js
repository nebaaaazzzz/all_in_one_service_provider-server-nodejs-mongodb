const upload = require("../../config/fileHandler")();
const route = require("express").Router();
const House = require("./../../models/House");
const ErrorHandler = require("../../utils/ErrorHandler");
route.post("/posthouse", upload.array("houseImage", 100), async (req, res) => {
  const obj = JSON.parse(req.body.body);
  obj.houseImages = req.files.map((file) => file.id);
  obj.price = Number(obj.price);
  obj.location = { type: "Point", coordinates: obj.center };
  delete obj.center;
  await House.create({ ...obj, user: req.user.id });
  res.status(201).send({
    success: true,
  });
});
route.post("/edit-post/:id", async (req, res) => {
  const house = await House.findById(req.params.id);
  if (house) {
    await house.updateOne(req.body);
    return res.send();
  }
  return next(new ErrorHandler("house not found", 404));
});
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

  const query = House.find({ user: req.user.id });
  const houses = await query
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.send(houses);
});
route.get("/applicants/:id", async (req, res) => {
  const house = await House.findById(req.body.id);
  if (house) {
    return res.send({
      data: house.applicants || [],
    });
  }
  next(new ErrorHandler("house not found", 404));
});

module.exports = route;
