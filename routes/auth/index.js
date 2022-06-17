const route = require("express").Router();
const ErrorHandler = require("./../../utils/ErrorHandler/");
const validator = require("validator").default;
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const catchAsyncError = require("./../../utils/catchAsyncError");
const randomstring = require("randomstring");
const promisify = require("util").promisify;
const generateRandStr = promisify(randomstring.generate);

const phonevalidate = require("libphonenumber-js");

const sendText = require("./../../config/textmsg");
const jwt = require("jsonwebtoken");
route.post(
  "/login",
  catchAsyncError(async (req, res, next) => {
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
    } else if (req?.body?.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        const match = await bcrypt.compare(req?.body.password, user.password);
        if (match) {
          res.send({
            success: true,
            data: {
              token: jwt.sign(
                {
                  isAdmin: user.isAdmin,
                  sub: user.id,
                  exp: Date.now() + 15 * 24 * 60 * 60 * 60,
                },
                process.env.SECRETE
              ),
            },
          });
        } else {
          res.send("password mismatch");
        }
      }
    } else {
      res.status(400).send("eroor");
    }
  })
);
route.post(
  "/register",
  catchAsyncError(async (req, res, next) => {
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
      } else if (req.body.email) {
        const randString = generateRandStr({
          length: 6,
          charset: "numeric",
        });
        require("./../../config/mail")(req.body.email, "code " + randString);
        const doc = await User.create({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          sex: req.body.sex,
          randString,
          email: req.body.email,
          verified: true,
          password: req.body.password,
        });
        res.send({
          success: true,
          data: {
            doc,
            token: jwt.sign(
              {
                isAdmin: doc.isAdmin,
                sub: doc.id,
                exp: Date.now() + 15 * 24 * 60 * 60 * 60,
              },
              process.env.SECRETE
            ),
          },
        });
      }
    }
  })
);
route.post(
  "/validate",
  catchAsyncError(async (req, res, next) => {
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
  })
);
module.exports = route;
