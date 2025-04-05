const express = require("express");
const User = require("../models/user");
const nodemailer = require("nodemailer");
// require("dotenv").config({
//   path: require("path").resolve(__dirname, "../.env"),
// });
const em = process.env.EMAIL;
const otpTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;"> Your OTP Code</h2>
      <p style="font-size: 16px; color: #555;">
        Hey there! Use the OTP below to verify your account. It's only valid for the next 10 minutes ⏰
      </p>
      <div style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #111;">
        ${otp}
      </div>
      <p style="font-size: 14px; color: #999;">
        If you didn’t request this, you can safely ignore it.
      </p>
      <p style="font-size: 14px; color: #999;">
        Stay safe <br/>
        — Blogify..
      </p>
    </div>
  `;
};

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
    // text: `\n\nYour One-Time Password (OTP) is: ${otp}\n\nPlease enter this code to verify your identity. It’s valid for 5 minutes.\n\nIf you didn’t request this, feel free to ignore this message.\n\n`,
    html: otpTemplate(otp),
  };
  try {
    await transporter.sendMail(mailOptions);
    return 1;
  } catch (e) {
    return 0;
  }
};

const router = express.Router();
router.get("/signin", (req, res) => {
  return res.render("signin");
});
router.get("/signup", (req, res) => {
  return res.render("signup");
});
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    // console.log(token);
    return res.cookie("token", token).redirect("/");
  } catch (e) {
    // console.log(e.message);
    return res.render("signin", { error: e.message });
  }
});
router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  const temU = await User.findOne({ email });
  if (temU) {
    if (temU.isVarified) {
      return res.render("signin", { error: "User is already present..." });
    }
    await User.deleteOne({ email });
  }
  const code = Math.floor(1000 + Math.random() * 9000);
  const tt = sendOTP(email, code);
  if (!tt) return res.render("signup");

  varificationToken = String(code);
  await User.create({
    fullName,
    email,
    password,
    varificationToken,
  });

  return res.render("getOtp", { email: email });
});
router.get("/otp", (req, res) => {
  const e = "sk.najir@gmail.com";
  return res.render("getOtp", { email: e });
});
router.post("/emailvalidate", async (req, res) => {
  const { code } = req.body;
  const user = await User.findOne({ varificationToken: code });
  if (!user) {
    return res.render("signup");
  }
  user.isVarified = true;
  user.varificationToken = undefined;
  user.save();
  return res.render("signin");
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
});
module.exports = router;
