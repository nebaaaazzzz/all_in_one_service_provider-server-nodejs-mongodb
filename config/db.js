const mongoose = require("mongoose");
const mongodb = require("mongodb");
mongoose.set("returnOriginal", false);

mongoose.connect(process.env.MONGODB_LOCAL_URL, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("mongodb database connected");
  }
});

const db = mongoose.connections[0].client.db("connect");

module.exports = (bucketName="uploads")=>new mongodb.GridFSBucket(db, { bucketName });
