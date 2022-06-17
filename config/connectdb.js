const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_LOCAL_URL, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("mongodb database connected");
  }
});
