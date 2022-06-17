const nodemailer = require("nodemailer");
const sendEmail = (to = "nebiyuf@gmail.com", message) => {
  var smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "nebiyud017@gmail.com",
      pass: "12345678",
    },
  });

  var from = "nebiyud017@gmail.com";

  var mailOptions = {
    from: from,
    to: to,
    subject: " | new message !",
    text: message,
  };
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      res.redirect("/");
    }
  });
};
module.exports = sendEmail;
