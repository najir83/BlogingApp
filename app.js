require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
mongoose.connect(process.env.MONGO_URL).then((e) => {
  console.log("MongoDB connected ...");
});
const app = express();
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const checkForAuthenticationCookie = require("./middlewires/auth");

const PORT = process.env.PORT || 8000;
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

const Blog = require("./models/blog");

//make public as static
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  //console.log(allBlogs);
  res.render("home", { user: req.user, blogs: allBlogs }); // this can be used directly :)
});
app.use("/user", userRoute);
app.use("/blog", blogRoute);
app.listen(PORT, () => {
  console.log(`server started at port http://localhost:${PORT}`);
});
