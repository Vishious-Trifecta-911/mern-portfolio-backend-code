import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import errorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateJSONToken } from "../utils/JWTToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new errorHandler("No files were uploaded.", 400));
  }

  const { avatar, resume } = req.files;

  const avatarResult = await cloudinary.uploader.upload(avatar.tempFilePath, {
    folder: "AVATARS",
  });

  if (!avatarResult || avatarResult.error) {
    console.error(
      "Cloudinary Error: ",
      avatarResult.error || "Unknown error occurred while uploading avatar."
    );
  }

  const resumeResult = await cloudinary.uploader.upload(resume.tempFilePath, {
    folder: "MY_RESUME",
  });

  if (!resumeResult || resumeResult.error) {
    console.error(
      "Cloudinary Error: ",
      resumeResult.error || "Unknown error occurred while uploading resume."
    );
  }

  const {
    fullName,
    email,
    phoneNumber,
    aboutMe,
    password,
    portFolioURL,
    githubURL,
    twitterURL,
    linkedInURL,
  } = req.body;
  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    aboutMe,
    password,
    avatar: {
      public_ID: avatarResult.public_id,
      url: avatarResult.secure_url,
    },
    resume: {
      public_ID: resumeResult.public_id,
      url: resumeResult.secure_url,
    },
    portFolioURL,
    githubURL,
    twitterURL,
    linkedInURL,
  });

  generateJSONToken(user, "User registered successfully.", 201, res);
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new errorHandler("Email and password are required."));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new errorHandler("Invalid email or password."));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new errorHandler("Invalid email or password."));
  }

  generateJSONToken(user, "User logged in successfully.", 200, res);
});

export const logOutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", { expires: new Date(Date.now()), httpOnly: true })
    .json({ success: true, message: "User logged out successfully" });
});

export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({ success: true, user });
});

export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserFields = {
    fullName: req.body.fullName,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    aboutMe: req.body.aboutMe,
    portFolioURL: req.body.portFolioURL,
    githubURL: req.body.githubURL,
    twitterURL: req.body.twitterURL,
    linkedInURL: req.body.linkedInURL,
  };

  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user._id);
    const profileImageID = user.avatar.public_ID;

    await cloudinary.uploader.destroy(profileImageID);

    const avatarResult = await cloudinary.uploader.upload(avatar.tempFilePath, {
      folder: "AVATARS",
    });
    newUserFields.avatar = {
      public_ID: avatarResult.public_id,
      url: avatarResult.secure_url,
    };
  }

  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user._id);
    const resumeID = user.resume.public_ID;

    await cloudinary.uploader.destroy(resumeID);

    const resumeResult = await cloudinary.uploader.upload(resume.tempFilePath, {
      folder: "MY_RESUME",
    });
    newUserFields.resume = {
      public_ID: resumeResult.public_id,
      url: resumeResult.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user._id, newUserFields, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    user,
  });
});

export const updateUserPassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new errorHandler("All fields are required."));
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return next(new errorHandler("Invalid current password.", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new errorHandler("Passwords do not match.", 400));
  }

  user.password = newPassword;

  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Password updated successfully." });
});

export const getUserPortfolio = catchAsyncErrors(async (req, res, next) => {
  const id = "66a13444f84f6cc6468a6243";
  const user = await User.findById(id);

  res.status(200).json({ success: true, user });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new errorHandler("User not found.", 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.DASHBOARD_URL}/resetPassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) requested a password reset for your account.\n\nPlease click on the following link to reset your password:\n\n${resetUrl}\n\nIf you did not request a password reset, please ignore this email and your password will remain unchanged.\n`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Reset password email sent to email: ${user.email} successfully`,
    });
  } catch (error) {
    console.error("Error sending email: ", error);

    user.resetPassToken = undefined;
    user.resetPassTokenExpiration = undefined;

    await user.save();

    return next(new errorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPassToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPassToken,
    resetPassTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new errorHandler("Password reset token is invalid or expired.", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new errorHandler("Passwords do not match.", 400));
  }

  user.password = req.body.password;
  user.resetPassToken = undefined;
  user.resetPassTokenExpiration = undefined;

  await user.save();

  generateJSONToken(user, "Password reset successfully.", 200, res);
});
