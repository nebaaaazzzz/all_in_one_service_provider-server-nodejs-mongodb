const Vonage = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendText = (to = "251984783077", text) => {
  const from = "Connect";
  if (to) {
    throw new Error("to is required");
  } else {
    vonage.message.sendSms(from, to, text, (err, responseData) => {
      if (err) {
        throw err;
      } else {
        if (responseData.messages[0]["status"] === "0") {
          console.log("Message sent successfully.");
        } else {
          throw new Error(
            `Message failed with error: ${responseData.messages[0]["error-text"]}`
          );
        }
      }
    });
  }
};

module.export = sendText;
