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
  catchAsyncError(async (req, res) => {
    const doc = await User.findByIdAndUpdate(req.user.id, {
      ...req.body,
    });
    /*
    firstname
    lastname
    password
    description`
    city
    country
    education
    language
    phone
    sex
    skills
*/
    res.send("success");
  })
);
module.exports = route;
