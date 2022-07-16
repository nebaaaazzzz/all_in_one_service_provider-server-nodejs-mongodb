const route = require("express").Router();
const User = require("../../models/User");
const bucket = require("../../config/db")("profile");
const upload = require("../../config/fileHandler")("profile");
const mongoose = require("mongoose");
bucket.de;
// 62d04d20cec61b8faed036d0
route.get("/me", async (req, res) => {
  const user = await User.findById(req.user.id);
  console.log(user);
  res.send(user);
});
route.post("/profile-pic", upload.single("profile"), async (req, res) => {
  console.log(req?.file?.id);

  res.status(201).send("profile pic create");
  // const user = await User.findById(req.user.id);
});
route.get("/profile-pic/:id", async (req, res, next) => {
  const cursor = await bucket.find({
    _id: new mongoose.Types.ObjectId(req.params.id),
  });
  const files = await cursor.toArray();
  if (files.length) {
    files.forEach((doc) => {
      res.set("Content-Type", doc.contentType);
      res.set("Content-Length", doc.length);
      bucket.openDownloadStream(doc._id).pipe(res);
    });
    return;
  } else {
    next(new ErrorHandler("notfound image", 404));
  }
});
module.exports = route;
