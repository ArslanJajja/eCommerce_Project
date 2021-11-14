const User = require("../models/userModal");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/sendToken");
const sendEmail = require("../utils/sendEmail");

// Register User 😃
exports.registerUser = asyncHandler(async (req, res, next) => {
//   const cloud = await cloudinary.v2.uploader.upload(req.body.profile_pic, {
//     folder: "avatars",
//     width: "150",
//     crop: "scale",
//   });
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    // profile_pic: {
    //   public_id: cloud.public_id,
    //   url: cloud.secure_url,
    // },
  });
  sendToken(user, 201, res);
});
// Login User 😎
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter Email and Password !", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Password is incorrect ", 401));
  }
  sendToken(user, 200, res);
});
// Logout User 😕
exports.logoutUser = asyncHandler(async (req, res, next) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
    .status(200)
    .json({ success: true, message: "Logged Out!" });
});
// Forgot Password 😔
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("No user found with this email !", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;
  const message = `This is your password reset token => ${resetPasswordUrl} .`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${user.email} !`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new Error(error.message, 500));
  }
});
// Reset the Password 😊
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Reset Password Token expired", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});
// Get Information of User 😉
exports.getUserInfo = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});
// User Password update 😁
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is not correct", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});
// Update user information 😀
exports.updateUserInfo = asyncHandler(async (req, res, next) => {
  const updatedData = {
    name: req.body.name,
    email: req.body.email,
  };
//   if (req.body.profile_pic !== "") {
//     const user = await User.findById(req.user.id);
//     const imageId = user.profile_pic.public_id;
//     await cloudinary.v2.uploader.destroy(imageId);
//     const cloud = await cloudinary.v2.uploader.upload(req.body.profile_pic, {
//       folder: "avatars",
//       width: "150",
//       crop: "scale",
//     });
//     updatedData.profile_pic = {
//         public_id: cloud.public_id,
//         url: cloud.secure_url
//     }
//   }
  const user = await User.findByIdAndUpdate(req.user.id, updatedData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({ success: true, message: "user updated successfully" });
});
// Get all the users - Admin
exports.fetchUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, users });
});
// Get single user - Admin
exports.fetchUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with ${req.params.id} id.`, 404)
    );
  }
  res.status(200).json({ success: true, user });
});
// Update User Role - Admin
exports.updateRole = asyncHandler(async (req, res, next) => {
  const updatedUser = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, updatedUser, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res
    .status(200)
    .json({ success: true, message: "User role updated Successfully" });
});
// Delete User  - Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  await user.remove();
  res.status(200).json({ success: true, message: "user deleted successfully" });
});
