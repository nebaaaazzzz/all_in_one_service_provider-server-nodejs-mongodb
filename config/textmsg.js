const Vonage = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendText = (to, text) => {
  const from = "Connect";
  if (!to) {
    throw new Error("to is required");
  } else {
    vonage.message.sendSms(from, "+251" + to, text, (err, responseData) => {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        if (responseData.messages[0]["status"] === "0") {
          console.log("Message sent successfully.");
        } else {
          console.log(responseData.messages[0]["error-text"]);
          throw new Error(
            `Message failed with error: ${responseData.messages[0]["error-text"]}`
          );
        }
      }
    });
  }
};
module.exports = sendText;
