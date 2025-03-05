const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("node:crypto");
const { createTokenForUSer, validateToken } = require("../services/auth");
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String, /// this helps to match the password form hash form ..
    },
    password: {
      type: String,
      required: true,
    },
    profileImg: {
      type: String,
      default: "/home/luca/Desktop/backend/BloggingApp/public/img_avatar.webp",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"], //enum -> we can not assign any other value except that
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  const salt = randomBytes(16).toString();
  const hashPassword = createHmac("sha256", salt)
    .update(this.password)
    .digest("hex");
  this.salt = salt;
  this.password = hashPassword;
  next();
});

//static virtual function
userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found....");
    const salt = user.salt;
    const hasPass = user.password;
    const checkingNew = createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    if (hasPass !== checkingNew) throw new Error("Incorrect Password .....");
    const token = createTokenForUSer(user);
    return token;
  }
);
const User = model("user", userSchema);
module.exports = User;
