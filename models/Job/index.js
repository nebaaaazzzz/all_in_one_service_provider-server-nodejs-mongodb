const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minlength: 5,
      maxlength: 50,
    },
    company: {
      type: String,
    },
    qty: String,
    gender: {
      type: String,
    },
    typed: {
      type: String,
      minlength: 5,
      maxlength: 50,
      enum: ["permanent"],
    },
    catagory: {
      type: String,
    },
    salary: String,
    deadline: Date,
    description: {
      type: String,
      minLenght: 30,
      maxlength: 500,
    },
    cv: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
