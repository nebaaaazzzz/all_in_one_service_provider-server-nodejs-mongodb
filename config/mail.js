// const formData = require("form-data");
// const Mailgun = require("mailgun.js");
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({
//   username: "api",
//   key: process.env.MAILGUN_API_KEY,
// });
const mg = require("mailgun.js");
const mailgun = () =>
  mg({
    apikey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });
mailgun()
  .messages()
  .send(
    {
      from: "Excited User <mailgun@sandbox-123.mailgun.org>",
      to: ["nebiyuf@gmail.com"],
      subject: "Hello",
      text: "ge",
      // html: "<h1>Testing some Mailgun awesomness!</h1>",
    },
    (err, body) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("message sent successfuly");
      }
    }
  );
// mg.messages
//   .create(process.env.MAILGUN_DOMAIN, {
//     from: "Excited User <mailgun@sandbox-123.mailgun.org>",
//     to: ["nebiyuf@gmail.com"],
//     subject: "Hello",
//     text: "Testing some Mailgun awesomness!",
//     html: "<h1>Testing some Mailgun awesomness!</h1>",
//   })
//   .then((msg) => console.log(msg)) // logs response data
//   .catch((err) => console.error(err)); // logs any error
