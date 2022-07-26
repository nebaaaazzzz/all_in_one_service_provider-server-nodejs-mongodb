const route = require("express").Router();
const User = require("../../models/User");
const bucket = require("../../config/db");
const upload = require("../../config/fileHandler");
const mongoose = require("mongoose");
const ErrorHandler = require("../../utils/ErrorHandler");
// 62d04d20cec61b8faed036d0
route.get("/me", async (req, res) => {
  const user = await User.findById(req.user.id).select("+phoneNumber");
  res.send(user);
});
route.post("/profile-pic", upload.single("profile"), async (req, res) => {
  res.status(201).send("profile pic create");
  // const user = await User.findById(req.user.id);
});
route.post("/job/file/:id", async (req, res) => {
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
    next(new ErrorHandler("file not found", 404));
  }
});
route.get("/user/:id", async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (user) {
    return res.send(user);
  }
  next(new ErrorHandler("user not found", 404));
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
    console.log("request......");
  } else {
    next(new ErrorHandler("notfound image", 404));
  }
});
module.exports = route;
