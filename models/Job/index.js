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
    paymentStyle: String,
    // quantity: Number,
    gender: {
      type: String,
      lowercase: true,
    },
    deleted: { type: Boolean, default: false },
    hourPerWeek: String,

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
      minLenght: 50,
      maxlength: 500,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    isApproved: {
      default: 0,
      type: Number,
      enum: [0, 1, 2], //0 pending 1 approved 2 rejected
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
