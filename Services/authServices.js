const User = require("../Database/models/userModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail")

exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  user.password = undefined;
  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  user.password = undefined;
  const token = createToken(user._id);

  res
    .status(200)
    .json({ msg: "Logged in successfully", username: user.username, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError("You are not logged in, please log in to access this route", 401)
    );
  }

  // 2) التحقق من صحة التوكن
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiError("Invalid or expired token, please log in again", 401));
  }

  // 3) التحقق من وجود المستخدم
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new ApiError("The user associated with this token no longer exists", 401)
    );
  }

  // 4) التحقق من تغيير كلمة المرور بعد إنشاء التوكن
  if (currentUser.passwordChangedAt) {
    const passwordChangeTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passwordChangeTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed their password, please log in again",
          401
        )
      );
    }
  }

  // إضافة المستخدم إلى الطلب
  req.user = currentUser;
  next();
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('email username');

  if (!user) {
      return next(new ApiError(`There is no user found with this ID: ${req.user._id}`, 404));
  }

  res.status(200).json({ data: { email: user.email, username: user.username } });
});

exports.updateLoggedUserData = asyncHandler(async(req,res,next)=>{

  const user = await User.findByIdAndUpdate(req.user._id,{username:req.body.username,email:req.body.email},{new:true}).select('email username')

  if (!user) {
    return next(new ApiError(`There is no user found with this ID: ${req.user._id}`, 404));
}
res.status(200).json({ data: { email: user.email, username: user.username } });

})


exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
      return next(new ApiError("User not found", 404));
  }

  
  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now() - 1000;

  await user.save();

  
  const token = createToken(user._id);

  res.status(200).json({ msg: "Password changed successfully", token });
});


exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // البحث عن المستخدم باستخدام البريد الإلكتروني
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError(`There is no user with this email: ${req.body.email}`, 404)
    );
  }

  // إنشاء رمز إعادة تعيين مكون من 6 أرقام
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // تشفير رمز إعادة التعيين
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  
  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

 
  const resetCodeMessage = `
  <p>Hi ${user.username},</p>
  
  <p>We received a request to reset the password on your Notaty account.</p>
  
  <p>Here is your reset code:</p>
  
  <p style="font-size: 20px; font-weight: bold; color: #333;">
    ${resetCode}
  </p>
  
  <p>Please note that this code is valid for 10 minutes only. Enter this reset code to complete the password reset process. If you did not request a password reset, please ignore this message or contact support if you have concerns.</p>
  
  <p>Thank you for helping us keep your account secure.</p>
  
  <p>Best regards,<br/>Notaty app Team</p>
`;



  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 minutes)",
      message: resetCodeMessage,
    });
  } catch (err) {
   
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(
      new ApiError("There was an error sending the reset code.", 500)
    );
  }

  // الرد بالنجاح
  res.status(200).json({ status: "Success", message: "Reset code sent to email." });
});



exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // 1) إنشاء نسخة مشفرة من resetCode المرسل
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // 2) التحقق من الرمز وصلاحيته
  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() }, // التأكد من عدم انتهاء الصلاحية
  });

  if (!user) {
    return next(new ApiError("Invalid or expired reset code", 400));
  }

  // 3) تعيين passwordResetVerified إلى true
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({ status: "Success", message: "Reset code verified successfully" });
});



exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) البحث عن المستخدم باستخدام البريد الإلكتروني
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with this email: ${req.body.email}`, 404)
    );
  }

  // 2) التحقق من أن رمز إعادة التعيين قد تم التحقق منه
  if (!user.passwordResetVerified) {
    return next(new ApiError(`Reset code not verified`, 400));
  }

  // 4) تحديث كلمة المرور وإزالة بيانات إعادة التعيين
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  user.passwordChangedAt = Date.now() - 1000;

  await user.save();

  // 5) إنشاء توكن جديد للمستخدم
  const token = createToken(user._id);

  res.status(200).json({
    status: "Success",
    message: "Password has been reset successfully",
    token: token,
  });
});



