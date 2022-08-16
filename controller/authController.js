const promisify = require("util").promisify;
const validator = require("validator").default;
const { isValidPhoneNumber } = require("libphonenumber-js");
const ErrorHandler = require("./../utils/ErrorHandler/");
const socket = require("./../server");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const sendText = require("./../config/textmsg");

const catchAsyncError = require("../utils/catchAsyncError");

const registerUser = async (req, res, next) => {
  if (!validator.equals(req.body.password, req.body.confirmPassword)) {
    return next(new ErrorHandler("password mismatch", 400));
  } else {
    if (req.body.phoneNumber) {
      if (isValidPhoneNumber(req.body.phoneNumber, "ET")) {
        if (req.body.password.length < 6) {
          return next(
            new ErrorHandler("password length less than minumum", 400)
          );
        }
        const user = await User.findOne({
          phoneNumber: req.body.phoneNumber,
        }).select("+verified");
        if (user) {
          if (user.verified) {
            return next(new ErrorHandler("user already exists", 400));
          }
          let randString = generateRandomString();

          const doc = await user.updateOne({
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastname,
            password: req?.body?.password,
            phoneNumber: req?.body?.phoneNumber,
            gender: req?.body?.gender,
            dateOfBirth: req?.body?.date,
            randString,
          });
          sendText(req.body.phoneNumber, "code " + randString);
          return res.status(201).send(doc);
        }

        try {
          let randString = generateRandomString();
          const doc = await User.create({
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            password: req?.body?.password,
            phoneNumber: req?.body?.phoneNumber,
            gender: req?.body?.gender,
            dateOfBirth: req?.body?.date,
            randString,
          });
          sendText(req.body.phoneNumber, "code " + randString);
          return res.status(201).send(doc);
        } catch (err) {
          throw err;
        }
      } else {
        return next(new ErrorHandler("invalid phonenumber", 400));
      }
    } else {
      return next(new ErrorHandler("some fields required", 400));
    }
  }
};
const validateUserAccount = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.body.id);
  if (user) {
    if (user.randString === req.body.randString) {
      await user.updateOne({
        verified: true,
        randString: null,
      });
      return res.send({
        success: true,
      });
    }
    return next(new ErrorHandler("invalid conformation number", 400));
  } else {
    return next(new ErrorHandler("user not found", 400));
  }
});
const loginUser = catchAsyncError(async (req, res, next) => {
  if (req?.body?.phoneNumber) {
    const user = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    }).select("+password");
    if (user) {
      const match = await bcrypt.compare(req?.body?.password, user.password);
      if (match) {
        const token = jwt.sign(
          {
            isAdmin: user.isAdmin,
            sub: user.id,
            exp: Date.now() + 15 * 24 * 60 * 60 * 60,
          },
          process.env.SECRETE
        );

        res.cookie("token", token, {}).send({
          token,
        });
      } else {
        return next(new ErrorHandler("wrong phone or password", 400));
      }
    }
  } else {
    return next(
      new ErrorHandler("Email/phone number and password required", 400)
    );
  }
});

const forgotPassword = async (req, res, next) => {
  if (req.body.phoneNumber) {
    if (isValidPhoneNumber(req.body.phoneNumber, "ET")) {
      const user = await User.findOne({
        phoneNumber: req.body.phoneNumber,
      }).select("+verified");
      if (user) {
        if (user.verified) {
          let randString = generateRandomString();
          const doc = await user.updateOne({
            randString,
          });
          sendText(req.body.phoneNumber, "code " + randString);
          return res.status(201).send(doc);
        } else {
          next(new ErrorHandler("not verified account"));
        }
      } else {
        next(new ErrorHandler("User not found"), 404);
      }
    } else {
      return next(new ErrorHandler("invalid phonenumber", 400));
    }
  } else {
    return next(new ErrorHandler("some fields required", 400));
  }
};
const forgotChangePassword = async (req, res, next) => {
  const user = await User.findById(req.body.id);
  if (user) {
    if (user.randString === req.body.randString) {
      if (req.body.password == req.body.confirmPassword) {
        if (req.body.password > 5) {
          await user.updateOne({
            password: user.password,
            randString: null,
          });
          res.send({
            success: true,
          });
        } else {
          next(new ErrorHandler("min password length", 400));
        }
      } else {
        next(new ErrorHandler("password mismatch", 400));
      }

      return res.send({
        success: true,
      });
    }
    return next(new ErrorHandler("invalid conformation number", 400));
  } else {
    return next(new ErrorHandler("user not found", 400));
  }
};

function generateRandomString() {
  let min = 100000;
  let max = 900000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function sendText(phone, string) {
  socket.emit("hello", {
    phone: `+251${phone}`,
    message: string,
  });
}
module.exports = {
  registerUser,
  validateUserAccount,
  loginUser,
  forgotPassword,
  forgotChangePassword,
};
