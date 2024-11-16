const express = require("express");
const {
  signUpValidator,
  logInValidator,
  updateLoggedUserDataValidator,
  updateLoggedUserPasswordValidator,
  resetCodeValidator,
  resetNewPasswordValidator
} = require("../utils/Validators/authValidators");
const {
  signup,
  login,
  getLoggedUserData,
  protect,
  updateLoggedUserData,
  updateLoggedUserPassword,
  forgotPassword,
  verifyResetCode,
  resetPassword
} = require("../Services/authServices");

const router = express.Router();

router.route("/signup").post(signUpValidator, signup);

router.route("/login").post(logInValidator, login);

router.route("/getmydata").get(protect, getLoggedUserData);

router
  .route("/updatemydata")
  .put(protect, updateLoggedUserDataValidator, updateLoggedUserData);

router
  .route("/updatemypassword")
  .put(protect, updateLoggedUserPasswordValidator, updateLoggedUserPassword);

router.route("/forgotpassword").post(forgotPassword);

router.route('/verifyresetcode').post(resetCodeValidator,verifyResetCode)

router.route('/resetpassword').put(resetNewPasswordValidator,resetPassword)

module.exports = router;
