const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserInfo,
  updatePassword,
  updateUserInfo,
  fetchUsers,
  fetchUser,
  updateRole,
  deleteUser,
} = require("../controllers/userController");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(protect, getUserInfo);
router.route("/password/update").put(protect, updatePassword);
router.route("/me/update").put(protect, updateUserInfo);
router.route("/admin/users").get(protect, authorize("admin"), fetchUsers);
router
  .route("/admin/user/:id")
  .get(protect, authorize("admin"), fetchUser)
  .put(protect, authorize("admin"), updateRole)
  .delete(protect, authorize("admin"), deleteUser);

module.exports = router;
