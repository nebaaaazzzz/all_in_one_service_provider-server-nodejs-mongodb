const mongoose = require("mongoose");
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
    experience: {
      descritption: String,
      title: String,
    },
    applicants: [],
    approved: [],
    rejected: [],
    placeName: String,
    skills: [String],
    englishLevel: String,
    document: String,
    question: [String],
    deadline: Date,
    deadtime: Boolean,
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
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    region: String,
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Job", jobSchema);
