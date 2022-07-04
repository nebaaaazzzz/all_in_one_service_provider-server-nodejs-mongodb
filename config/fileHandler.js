const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./../upload"));
  },
  filename: function (req, file, cb) {
    //to get file extension path.extname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fields: 20,
    file: 5,
    fileSize: 1e7,
  },
});
module.exports = upload;
