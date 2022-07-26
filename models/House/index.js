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

    region: String,
    placeKind: {
      type: String,
      required: true,
    },
    placeName: { type: String, required: true },
    guestSize: {
      beds: { type: Number, default: 0 },
      kitchens: { type: Number, default: 0 },
      bathrooms: { type: Number, default: 0 },
    },
    saftyItems: {
      type: [String],
      required: true,
    },
    guestFavourite: {
      type: [String],
      required: true,
    },
    amenities: { type: [String], required: true },
    propertyType: {
      type: String,
      required: true,
    },
    houseImages: {
      type: [String],
      required: true,
    },
    placeTitle: { type: String, require: true },
    detailDescription: {
      type: String,
      required: true,
    },
    contain: [String],
    bestDescribe: {
      type: [String],
      required: true,
    },
    applicants: [],
    approved: [],
    rejected: [],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },

  { timestamps: true }
);
houseSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("House", houseSchema);
