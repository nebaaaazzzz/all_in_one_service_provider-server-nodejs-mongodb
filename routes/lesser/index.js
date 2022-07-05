const upload = require("../../config/fileHandler");

const route = require("express").Router();
const House = require("./../../models/House");
route.post(
  "/posthouse",
  (req, res, next) => {
    console.log("uploading");
    next();
  },
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
route.get("/house:id", async (req, res) => {});
route.get("/posts", async (req, res) => {});
module.exports = route;
