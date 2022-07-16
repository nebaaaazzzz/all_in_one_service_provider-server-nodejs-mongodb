const mongoose = require("mongoose");
const validator = require("validator").default;
const bcrypt = require("bcrypt");
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
    phone: {
      type: {
        number: String,
        country: String,
      },
      unique: true,
      select: false,
    },
    email: {
      type: String,
      validate: validator.isEmail,
      unique: true,
    },
    profilePic: {
      type: mongoose.Types.ObjectId,
      default: "62d117b38690f1020ce194d7",
    },
    profilepics: {
      type: [mongoose.Types.ObjectId],
    },

    description: {
      type: String,
      minlength: 50,
      maxlength: 500,
    },
    skills: { type: [String] },

    sex: {
      lowercase: true,
      type: String,
      enum: ["male", "female", "other"],
    },
    password: {
      select: false,
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    perhour: {
      type: Number,
    },
    education: {
      type: [
        {
          where: String,
          fron: Number,
          to: Number,
        },
      ],
    },
    language: {
      which: String,
      level: {
        type: String,
        enum: ["conversational", "fluent"],
      },
    },
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
  function (next) {
    console.log(this.getFilter());
    next();
  }
);
userSchema.pre(["update,updateMany"], function (next) {
  next();
});
module.exports = mongoose.model("User", userSchema);
