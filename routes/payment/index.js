const {
  CheckoutExpress,
  IPNDestination,
  PaymentSuccessReturnUrl,
  PaymentCancelReturnUrl,
} = require("./../../controller/paymentController");
const route = require("express").Router();
route.post("/CheckoutExpress", CheckoutExpress);
route.post("/IPNDestination", IPNDestination);
route.get("/PaymentSuccessReturnUrl", PaymentSuccessReturnUrl);
route.get("/PaymentCancelReturnUrl", PaymentCancelReturnUrl);

module.exports = route;
