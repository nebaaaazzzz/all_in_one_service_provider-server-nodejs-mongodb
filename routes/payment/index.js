const ErrorHandler = require("../../utils/ErrorHandler");
const {
  CheckoutExpress,
  IPNDestination,
  PaymentSuccessReturnUrl,
  PaymentCancelReturnUrl,
  PaymentFailureUrl,
} = require("./../../controller/paymentController");
const User = require("./../../models/User");
const route = require("express").Router();
route.get(
  // "/CheckoutExpress/:userId",
  "/CheckoutExpress/:userId",
  async (req, res, next) => {
    const orderId = Math.floor(Math.random() * 999999 + 100000);
    const user = await User.findById(req.params.userId);
    if (user) {
      await user.updateOne({
        orderId,
      });
      req.orderId = orderId;
      return next();
    }
    next(new ErrorHandler("user not found", 404));
  },
  CheckoutExpress
);
route.get("/SuccessReturnUrl", PaymentSuccessReturnUrl);
route.get("/failureReturnUrl", PaymentFailureUrl);
route.get("/CancelReturnUrl", PaymentCancelReturnUrl);
route.get("/IPNDestination", IPNDestination);

module.exports = route;
