const express = require("express");
const User = require("../models/user");
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
  await User.create({
    fullName,
    email,
    password,
  });
  return res.redirect("/");
});
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/");
});
module.exports = router;
