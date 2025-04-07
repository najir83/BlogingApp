require("dotenv").config({ path: __dirname + "/../.env" });

const fs = require("fs");
const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const Blog = require("../models/blog");
const Comment = require("../models/comments");
const cloudinary = require("cloudinary").v2;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

// cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRATE,
});

router.get("/add-new", (req, res) => {
  return res.render("addBlog", { user: req.user });
});
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("created_by"); //by useing populate we can also send the real object for blog creater
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "created_by"
  );
  // console.log(comments);
  return res.render("blog", { user: req.user, blog: blog, comments: comments });
});

//comments
router.post("/comment/:blogId", async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    created_by: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});
router.post("/", upload.single("coverImg"), async (req, res) => {
  const { title, body } = req.body;

  try {
    // ⬆️ Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "blogImages",
    });

    fs.unlinkSync(req.file.path); // deletes the temp file

    // ⬇️ Save to DB with Cloudinary URL
    const blog = await Blog.create({
      body,
      title,
      created_by: req.user._id,
      coverImgURL: result.secure_url,
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return res.status(500).send("Image upload failed ..");
  }
});

module.exports = router;
