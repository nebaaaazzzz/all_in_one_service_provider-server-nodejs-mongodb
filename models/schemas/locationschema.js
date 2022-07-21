const mongoose = require("mongoose");
const pointSchema = new mongoose.Schema(
  {
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
    region: String,
  },

  {
    _id: false,
  }
);

module.exports = pointSchema;
