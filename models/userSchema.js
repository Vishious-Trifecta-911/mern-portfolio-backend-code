import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, "Name is required"] },
  email: { type: String, required: [true, "Email is required"] },
  phoneNumber: { type: String, required: [true, "Phone number is required"] },
  aboutMe: { type: String, required: [true, "About Me field is required"] },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [8, "Password must contain atleast 8 characters"],
    select: false,
  },
  avatar: {
    public_ID: { type: String, required: true },
    url: { type: String, required: true },
  },
  resume: {
    public_ID: { type: String, required: true },
    url: { type: String, required: true },
  },
  portFolioURL: String,
  githubURL: String,
  twitterURL: String,
  linkedInURL: String,
  resetPassToken: String,
  resetPassTokenExpiration: Date,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateJSONWebToken = function () {
  const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

  return token;
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPassToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPassTokenExpiration = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
