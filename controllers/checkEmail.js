const nodemailer = require("nodemailer");
// require("dotenv").config({
//   path: require("path").resolve(__dirname, "../.env"),
// });
const em = process.env.EMAIL;
const epass = process.env.E_PASSWORD;
const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: em,
      pass: epass,
    },
  });

  const mailOptions = {
    from: `"Blogify" <${em}>`,
    to: email,
    subject: "Verify Your Email",
    text: `\n\nYour One-Time Password (OTP) is: ${otp}\n\nPlease enter this code to verify your identity. It’s valid for 5 minutes.\n\nIf you didn’t request this, feel free to ignore this message.\n\n`,
  };
  await transporter.sendMail(mailOptions);
};

export default sendOTP;
