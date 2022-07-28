const Mailjet = require("node-mailjet");
const mailjet = new Mailjet({
  apiKey: "****************************1234",
  apiSecret: "****************************abcd",
});

const request = mailjet.post("send", { version: "v3.1" }).request({
  Messages: [
    {
      From: {
        Email: "nebiyud017@gmail.com",
        Name: "nebiyu",
      },
      To: [
        {
          Email: "nebiyud017@gmail.com",
          Name: "nebiyu",
        },
      ],
      Subject: "Greetings from Mailjet.",
      TextPart: "My first Mailjet email",
      HTMLPart:
        "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
      CustomID: "AppGettingStartedTest",
    },
  ],
});
request
  .then((result) => {
    console.log(result.body);
  })
  .catch((err) => {
    console.log(err.statusCode);
  });
