const promisify = require("util").promisify;
const randomstring = require("randomstring");
const generateRandStr = promisify(randomstring.generate);
const validator = require("validator").default;
const phonevalidate = require("libphonenumber-js");
const ErrorHandler = require("./../utils/ErrorHandler/");

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendText = require("./../config/textmsg");
const catchAsyncError = require("../utils/catchAsyncError");
const registerUser = catchAsyncError(async (req, res, next) => {
  if (!validator.equals(req.body.password, req.body.confirmpassword)) {
    return next(new ErrorHandler("password mismatch", 400));
  } else {
    if (req.body.phno) {
      const phoneNumber = phonevalidate.parsePhoneNumber(req.body.phno);
      // {
      //   country,
      //   number,
      //   nationalNumber,
      //   countryCallingCode
      // }
      if (phoneNumber.isValid()) {
        const user = User.findOneAndUpdate(
          {
            phone: phoneNumber,
          },
          {
            password: req?.body?.password,
            firstname: req?.body?.firstname,
            randString,
            lastname: req?.body?.lastname,
            sex: req.body.sex,
          }
        );
        if (user) {
          const randString = generateRandStr({
            length: 6,
            charset: "numeric",
          });
          sendText(req.body.phno, "code " + randString);
          return res.status(201).send({
            success: true,
            data: {
              doc,
            },
          });
        }
        const randString = generateRandStr({
          length: 6,
          charset: "numeric",
        });
        sendText(req.body.phno, "code " + randString);
        await User.create({
          firstname: req?.body?.firstname,
          randString,
          lastname: req?.body?.lastname,
          sex: req.body.sex,
          phone: {
            number: phoneNumber?.number,
            country: phoneNumber?.country,
          },
          password: req?.body?.password,
        });
        res.status(201).send({
          success: true,
          data: {
            doc,
          },
        });
      } else {
        return next(new ErrorHandler("invalid phonenumber", 400));
      }
    }
  }
});
const validateUserAccount = catchAsyncError(async (req, res, next) => {
  if (req.user.randString === req.body.randString) {
    const doc = await User.findByIdAndUpdate(req.user.id, {
      verified: true,
      randString: undefined,
    });
    res.send({
      success: true,
      data: {
        doc,
        token: jwt.sign(
          {
            isAdmin: doc.isAdmin,
            sub: user.id,
            exp: Date.now() + 15 * 24 * 60 * 60 * 60,
          },
          process.env.SECRETE
        ),
      },
    });
  }
  return next(new ErrorHandler("invalid conformation number", 400));
});
const loginUser = catchAsyncError(async (req, res, next) => {
  if (req?.body?.phno) {
    const user = await User.findOne({ phone: { number: req.body.phno } });
    if (user) {
      const match = await bcrypt.compare(req?.body.password, user.password);
      if (match) {
        res.send({
          success: true,
          data: {
            token: jwt.sign(
              {
                isAdmin: doc.isAdmin,
                sub: user.id,
                exp: Date.now() + 15 * 24 * 60 * 60 * 60,
              },
              process.env.SECRETE
            ),
          },
        });
      } else {
        return next(new ErrorHandler("password mismatch", 400));
      }
    }
  }
  //  else if (req?.body?.email) {
  //   const user = await User.findOne({ email: req.body.email }).select(
  //     "+password"
  //   );
  //   if (user) {
  //     const match = await bcrypt.compare(req?.body.password, user.password);
  //     if (match) {
  //       res.send({
  //         token: jwt.sign(
  //           {
  //             isAdmin: user.isAdmin,
  //             sub: user.id,
  //             exp: Date.now() + 15 * 24 * 60 * 60 * 60,
  //           },
  //           process.env.SECRETE
  //         ),
  //       });
  //     } else {
  //       //wrong password
  //       return next(new ErrorHandler("Wrong Email or Password", 400));
  //     }
  //   } else {
  //     return next(new ErrorHandler("email not found", 404));
  //   }
  // }
  else {
    return next(
      new ErrorHandler("Email/phone number and password required", 400)
    );
  }
});
module.exports = { registerUser, validateUserAccount, loginUser };
