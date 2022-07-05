const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const { GridFsStorage } = require("multer-gridfs-storage");
const storage = new GridFsStorage({
  url: process.env.MONGODB_LOCAL_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100e20, fieldSize: 100000e20 },
});
module.exports = upload;
