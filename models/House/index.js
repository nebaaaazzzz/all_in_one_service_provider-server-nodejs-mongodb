const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    /*
    place type -apartment, house , secoundary unit , bed and breakfast ,hotel
    which of these best descrbe your place 
    */
    placeDescription: {
      title: String,
      description: String,
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
    closed: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    region: String,
    placeKind: {
      type: String,
      required: true,
    },
    placeName: { type: String, required: true },

    saftyItems: {
      type: [String],
      required: true,
    },
    guestFavourite: {
      type: [String],
      required: true,
    },
    amenities: { type: [String], required: true },

    houseImages: {
      type: [String],
      required: true,
    },
    placeTitle: { type: String, require: true },
    detailDescription: {
      type: String,
      required: true,
    },
    bestDescribe: {
      type: [String],
      required: true,
    },
    applicants: [],
    approved: [],
    rejected: [],
    isApproved: {
      default: 0,
      type: Number,
      enum: [0, 1, 2], //0 pending 1 approved 2 rejected
    },
    price: {
      type: Number,
      required: true,
      min: 100,
    },
  },

  { timestamps: true }
);
houseSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("House", houseSchema);
