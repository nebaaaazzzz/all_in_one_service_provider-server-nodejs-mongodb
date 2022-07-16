const ypco = require("yenepaysdk");
const ngrokuri = "https://b9e5-213-55-102-49.in.ngrok.io";
const sellerCode = process.env.SELLRCODE,
  successUrlReturn = `${ngrokuri}/payment/SuccessReturnUrl`, //"YOUR_SUCCESS_URL",
  ipnUrlReturn = `${ngrokuri}/payment/IPNDestination`, //"YOUR_IPN_URL",
  cancelUrlReturn = `${ngrokuri}/payment/CancelUlr`, //"YOUR_CANCEL_URL",
  failureUrlReturn = `${ngrokuri}/payment/FailureUrl`, //"YOUR_FAILURE_URL",
  pdtToken = "suMVdLnbeLyz11",
  useSandbox = true,
  currency = "ETB";

exports.CheckoutExpress = function (req, res) {
  const merchantOrderId = "12-34"; //"YOUR_UNIQUE_ID_FOR_THIS_ORDER";  //can also be set null
  const expiresAfter = 2880; //"NUMBER_OF_MINUTES_BEFORE_THE_ORDER_EXPIRES"; //setting null means it never expires
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
  const ipnModel = req.body;
  ypco.checkout
    .IsIPNAuthentic(ipnModel, useSandbox)
    .then((ipnStatus) => {
      //This means the payment is completed
      //You can now mark the order as "Paid" or "Completed" here and start the delivery process
      console.log(ipnStatus);
      res.json({ "IPN Status": ipnStatus });
    })
    .catch((err) => {
      console.llog(err, "paymentController 45");
      res.json({ Error: err });
    });
};

exports.PaymentSuccessReturnUrl = function (req, res) {
  const params = req.query;
  const pdtRequestModel = new ypco.pdtRequestModel(
    // pdtToken,
    params.TransactionId,
    params.MerchantOrderId,
    useSandbox
  );
  console.log("success url called");
  ypco.checkout
    .RequestPDT(pdtRequestModel)
    .then((pdtJson) => {
      if (pdtJson.result == "SUCCESS") {
        // or `pdtJson.Status == 'Paid'`
        console.log("success url called - Paid");
        //This means the payment is completed.
        //You can extract more information of the transaction from the pdtResponse
        //You can now mark the order as "Paid" or "Completed" here and start the delivery process
      }
      // res.redirect("/");
      res.send("success");
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
    // pdtToken,
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
    // pdtToken,
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
