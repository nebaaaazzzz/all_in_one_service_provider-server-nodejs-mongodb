const mongoose = require("mongoose");
const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comment: Boolean,
    description: String,
  },
  {
    timestamps: true,
  }
);
const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
