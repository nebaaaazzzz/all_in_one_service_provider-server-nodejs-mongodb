const mongoose = require("mongoose");
const validator = require("validator").default;
const bcrypt = require("bcrypt");
const ErrorHandler = require("../../utils/ErrorHandler");
const hash = require("util").promisify(bcrypt.hash);
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    gender: {
      lowercase: true,
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    dateOfBirth: Date,

    email: {
      type: String,
      validate: validator.isEmail,
      unique: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      select: false,
      required: true,
    },
    description: {
      type: String,
      minlength: 50,
      maxlength: 500,
    },
    skills: [String],
    orderId: String,
    profilePic: {
      type: mongoose.Types.ObjectId,
      default: "62d117b38690f1020ce194d7",
    },
    profilePics: [mongoose.Types.ObjectId],
    cv: mongoose.Types.ObjectId,
    cvs: [mongoose.Types.ObjectId],
    password: {
      select: false,
      type: String,
    },
    city: String,
    region: String,
    perhour: {
      type: Number,
    },
    education: [
      {
        institution: String,
        start: Date,
        major: String,
        to: Date,
      },
    ],
    languages: [
      {
        language: String,
        level: String,
      },
    ],
    randString: String,
    isAdmin: {
      type: Boolean,
      select: false,
      default: false,
    },
    suspended: { type: Boolean, default: false },
    verified: {
      select: false,
      type: Boolean,

      default: false,
    },
    left: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  this.password = await hash(this.password, 10);
  next();
});
userSchema.pre(
  ["updateOne", "findOneAndUpdate", "findByIdAndUpdate"],
  async function (next) {
    const query = this;
    const update = this.getUpdate();
    if (!update?.password) {
      return next();
    }
    update.password = await hash(update.password, 10);
    next();
  }
);
userSchema.pre(["update,updateMany"], function (next) {
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
