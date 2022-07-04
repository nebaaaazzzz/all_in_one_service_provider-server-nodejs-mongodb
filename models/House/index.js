const mongoose = require("mongoose");
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const houseSchema = new mongoose.Schema(
  {
    /*
    place type -apartment, house , secoundary unit , bed and breakfast ,hotel
    which of these best descrbe your place 
    
    */
    placeDescription: {
      title: {
        type: String,
        lowercase: true,
      },
      description: {
        type: String,
        lowercase: true,
      },
    },
    location: {
      type: pointSchema,
      required: true,
    },

    placeKind: {
      type: String,
      required: true,
    },
    placeName: { type: String, required: true },
    guestSize: {
      guests: { type: Number, default: 0 },
      beds: { type: Number, default: 0 },
      bedrooms: { type: Number, default: 0 },
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
      type: [String],
      required: true,
    },
    houseImages: {
      type: [String],
      required: true,
    },
    placeTitle: { type: String, require: true },
    placeDescription: {
      type: String,
      required: true,
    },
    bestDescribe: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("House", houseSchema);
