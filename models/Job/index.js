const mongoose = require("mongoose");
const pointSchema = require("./../schemas/locationschema");
const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
    },
    budget: {
      from: Number,
      to: Number,
    },
    quantity: Number,
    gender: {
      type: String,
      enum: ["male", "female"],
      lowercase: true,
    },
    type: {
      type: String,
      minlength: 5,
      maxlength: 50,
      enum: ["permanent"],
    },
    size: {
      description: String,
      title: String,
    },
    category: {
      type: String,
    },
    experience: {
      descritption: String,
      title: String,
    },
    level: String,
    placeName: String,
    skills: [String],
    specificCategory: String,
    salary: {
      type: Number,
      min: 0,
    },
    englishLevel: String,
    hourPerWeek: String,
    document: String,
    screeningQuestion: [String],
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
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    location: {
      type: pointSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
