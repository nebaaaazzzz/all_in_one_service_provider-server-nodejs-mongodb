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
    // quantity: Number,
    gender: {
      type: String,
      enum: ["male", "female", "both"],
      lowercase: true,
    },

    permanent: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
    },
    hourPerWeek: String,
    experience: {
      descritption: String,
      title: String,
    },
    applicants: [],
    placeName: String,
    skills: [String],
    englishLevel: String,
    document: String,
    question: [String],
    deadline: Date,
    cvRequired: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      minLenght: 30,
      maxlength: 500,
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
