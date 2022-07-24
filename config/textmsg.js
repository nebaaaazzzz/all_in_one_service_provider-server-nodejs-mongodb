const Vonage = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendText = (
  to = "251923989471",
  text = "A text message sent using the Vonage SMS API"
) => {
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

  if (!to) {
    throw new Error("to is required");
  }
};
sendText();
module.exports = sendText;
