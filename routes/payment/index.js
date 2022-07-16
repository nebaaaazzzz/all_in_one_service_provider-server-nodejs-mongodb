const {
  CheckoutExpress,
  IPNDestination,
  PaymentSuccessReturnUrl,
  PaymentCancelReturnUrl,
  PaymentFailureUrl,
} = require("./../../controller/paymentController");
const route = require("express").Router();
route.get("/CheckoutExpress", CheckoutExpress);
route.get("/IPNDestination", IPNDestination);
route.get("/SuccessReturnUrl", PaymentSuccessReturnUrl);
route.get("/CancelReturnUrl", PaymentCancelReturnUrl);
route.get("/failureReturnUrl", PaymentFailureUrl);

module.exports = route;
