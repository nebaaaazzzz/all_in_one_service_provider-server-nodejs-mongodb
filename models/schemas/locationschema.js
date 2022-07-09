const mongoose = require("mongoose");
const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    city: String,
    region: String,
    country: String,
  },

  {
    _id: false,
  }
);

module.exports = pointSchema;
