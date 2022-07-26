const ypco = require("yenepaysdk");
const ngrokuri = "https://93d4-213-55-102-49.in.ngrok.io";
const User = require("./../models/User");
const sellerCode = process.env.YENEPAY_SELLRCODE,
  successUrlReturn = `${ngrokuri}/payment/SuccessReturnUrl`, //"YOUR_SUCCESS_URL",
  failureUrlReturn = `${ngrokuri}/payment/FailureUrl`, //"YOUR_FAILURE_URL",
  cancelUrlReturn = `${ngrokuri}/payment/CancelUlr`, //"YOUR_CANCEL_URL",
  ipnUrlReturn = `${ngrokuri}/payment/IPNDestination`, //"YOUR_IPN_URL",
  pdtToken = process.env.YENEPAY_PDTKEY,
  useSandbox = true,
  currency = "ETB";

exports.CheckoutExpress = function (req, res) {
  const merchantOrderId = req.orderId; //"YOUR_UNIQUE_ID_FOR_THIS_ORDER";  //can also be set null
  const expiresAfter = 30; //"NUMBER_OF_MINUTES_BEFORE_THE_ORDER_EXPIRES"; //setting null means it never expires
  console.log(req.orderId);
  const checkoutOptions = ypco.checkoutOptions(
    sellerCode,
    merchantOrderId,
    ypco.checkoutType.Express,
    useSandbox,
    expiresAfter,
    successUrlReturn,
    cancelUrlReturn,
    ipnUrlReturn,
    failureUrlReturn,
    currency
  );

  const checkoutItem = {
    ItemId: "",
    ItemName: "upgrade to premium",
    UnitPrice: 100,
    Quantity: 1,
    Discount: 0,
    HandlingFee: 0,
    DeliveryFee: 0,
    Tax1: 15,
    Tax2: 0,
  };
  const url = ypco.checkout.GetCheckoutUrlForExpress(
    checkoutOptions,
    checkoutItem
  );
  res.redirect(url);
};

exports.IPNDestination = function (req, res) {
  console.log("ipn destination");
  const ipnModel = req.body;
  ypco.checkout
    .IsIPNAuthentic(ipnModel, useSandbox)
    .then((ipnStatus) => {
      //This means the payment is completed
      //You can now mark the order as "Paid" or "Completed" here and start the delivery process

      res.json({ "IPN Status": ipnStatus });
    })
    .catch((err) => {
      console.log(err, "paymentController 45");
      res.json({ Error: err });
    });
};
exports.PaymentSuccessReturnUrl = function (req, res) {
  const params = req.query;
  const pdtRequestModel = new ypco.pdtRequestModel(
    pdtToken,
    params.TransactionId,
    params.MerchantOrderId,
    useSandbox
  );
  ypco.checkout
    .RequestPDT(pdtRequestModel)
    .then(async (pdtJson) => {
      if (pdtJson.result == "SUCCESS") {
        // or `pdtJson.Status == 'Paid'`
        //This means the payment is completed.
        //You can extract more information of the transaction from the pdtResponse
        //You can now mark the order as "Paid" or "Completed" here and start the delivery process
        const user = User.findOne({ orderId: pdtJson.MerchantOrderId });
        if (user) {
          const l = user.left ? user.left : 0;
          await user.updateOne({ orderId: null, left: 10 + 1 });
        }
      }
      // res.redirect("/");
      res.send(
        "success paid reopen the app and procceed you proceess soon it will be replaced with deeplinking"
      );
    })
    .catch((err) => {
      //This means the pdt request has failed.
      //possible reasons are
      //1. the TransactionId is not valid
      //2. the PDT_Key is incorrect

      // res.redirect("/");
      res.send("failed");
    });
};

exports.PaymentCancelReturnUrl = function (req, res) {
  const params = req.query;
  const pdtRequestModel = new ypco.pdtRequestModel(
    pdtToken,
    params.TransactionId,
    params.MerchantOrderId,
    useSandbox
  );
  ypco.checkout
    .RequestPDT(pdtRequestModel)
    .then((pdtJson) => {
      if ((pdtJson.Status = "Canceled")) {
        //This means the payment is canceled.
        //You can extract more information of the transaction from the pdtResponse
        //You can now mark the order as "Canceled" here.
      }
      res.json({ result: pdtJson.result });
    })
    .catch((err) => {
      //This means the pdt request has failed.
      //possible reasons are
      //1. the TransactionId is not valid
      //2. the PDT_Key is incorrect

      res.json({ result: "Failed" });
    });
};

exports.PaymentFailureUrl = function (req, res) {
  const params = req.query;
  const pdtRequestModel = new ypco.pdtRequestModel(
    pdtToken,
    params.TransactionId,
    params.MerchantOrderId,
    useSandbox
  );
  ypco.checkout
    .RequestPDT(pdtRequestModel)
    .then((pdtJson) => {
      if ((pdtJson.Status = "Canceled")) {
        //This means the payment is canceled.
        //You can extract more information of the transaction from the pdtResponse
        //You can now mark the order as "Canceled" here.
      }
      res.json({ result: pdtJson.result });
    })
    .catch((err) => {
      //This means the pdt request has failed.
      //possible reasons are
      //1. the TransactionId is not valid
      //2. the PDT_Key is incorrect

      res.json({ result: "Failed" });
    });
};
