const route = require("express").Router();
const multer = require("multer");
const upload = require("./../../config/fileHandler");
route.post("/profile-pic", async (req, res) => {
  upload.single("profile")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      //multer error occured when uploading
    } else if (err) {
      //unknow error occured whem uploading
    }
    //everything went file
  });
  res.send("success");
});
route.patch("/update-profile", async (req, res) => {
  if (req.body.email) {
  }
  console.log(req.body);
  res.send("success");
});
module.exports = route;
