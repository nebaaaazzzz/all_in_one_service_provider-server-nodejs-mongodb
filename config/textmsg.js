const Vonage = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: "ded38dfc",
  apiSecret: "A5TmSSVWL763HfaR",
});

const sendText = (to = "251984783077", text) => {
  const from = "Connect";

  vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]["status"] === "0") {
        console.log("Message sent successfully.");
      } else {
        console.log(
          `Message failed with error: ${responseData.messages[0]["error-text"]}`
        );
      }
    }
  });
};

module.export = sendText;
