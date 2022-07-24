const route = require("express").Router();
const multer = require("multer");
const catchAsyncError = require("../../utils/catchAsyncError");
const upload = require("./../../config/fileHandler");
const User = require("../../models/User");
route.post(
  "/profile-pic",
  catchAsyncError(async (req, res, next) => {
    upload.single("profile")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        //multer error occured when uploading
        next(err);
      } else if (err) {
        //unknow error occured whem uploading
      }
      //everything went file
    });
    res.status(201).send({
      success: true,
    });
  })
);
route.patch(
  "/update-profile",
  upload.fields([
    { name: "cv", maxCount: 1 },
    { name: "profile", maxCount: 1 },
  ]),
  async (req, res, next) => {
    let body;
    if (req.body?.data) {
      body = JSON.parse(req.body?.data);
    }
    let profileId, cvId;

    if (req.files.profile) {
      profileId = req.files.profile[0].id;
    }
    if (req.files.cv) {
      cvId = req.files.cv[0].id;
    }
    const user = await User.findById(req.user.id);
    if (user) {
      if (profileId) {
        await user.updateOne({
          $addToSet: { profilePics: user.profile },
          profilePic: profileId,
          ...body,
        });
      } else if (cvId) {
        await user.updateOne({
          ...(user.cv && { $addToSet: { cvs: user.cv } }),
          $addToSet: { cvs: user.cv },
          cv: cvId,
          ...body,
        });
      } else {
        await user.updateOne({
          $addToSet: { profilePics: user.profile },
          profilePic: profileId,
          ...body,
        });
      }
      return res.send({ success: true });
    }
    next(new ErrorHandler("user not found", 404));
  }
);
route.patch("/change-password", async (req, res) => {
  const doc = await User.findByIdAndUpdate(req.user.id, {
    ...req.body,
  });
  res.send("success");
});
route.patch("/change-phone", async (req, res) => {});
module.exports = route;
