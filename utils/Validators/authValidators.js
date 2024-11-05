const { check } = require('express-validator');
const validatorMiddleWare = require('../../middlewares/validatorMiddleWare');
const userModel = require('../../Database/models/userModel');
const ApiError = require('../../utils/apiError');
const bcrypt = require("bcryptjs");

exports.signUpValidator = [

    check("username")
        .notEmpty().withMessage("User name is required")
        .isLength({ min: 3 }).withMessage('User name must be at least 3 characters')
        .isLength({ max: 25 }).withMessage('User name must be at most 25 characters')
        .trim(),

    check("email")
        .notEmpty().withMessage("Email is required")
        .toLowerCase()
        .trim()
        .isEmail().withMessage('invalid email format')
        .custom(async (val) => {
            const email = await userModel.findOne({ email: val });
            if (email) {
                throw new Error("This email already exists. Email must be unique");
            }
            return true;
        }),

    check('passwordConfirm')
        .notEmpty().withMessage("Password confirm is required")
        .trim(),

    check("password")
        .notEmpty().withMessage("Password is required")
        .trim()
        .custom((val, { req }) => {
            if (val !== req.body.passwordConfirm) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    validatorMiddleWare
];

exports.logInValidator = [
    check("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid Email Format")
      .trim()
      .isLowercase(),
  
    check("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 chars")
      .trim(),
  
    validatorMiddleWare,
  ];

exports.updateLoggedUserDataValidator = [

    check("username")
        .optional()
        .isLength({ min: 3 }).withMessage('User name must be at least 3 characters')
        .isLength({ max: 25 }).withMessage('User name must be at most 25 characters')
        .trim(),

    check("email")
        .optional()
        .toLowerCase()
        .trim()
        .isEmail().withMessage('Invalid email format')
        .custom(async (val, { req }) => {
            const email = await userModel.findOne({ email: val });
            if (email && email._id.toString() !== req.user._id.toString()) {
                throw new Error("This email already exists. Email must be unique");
            }
            return true;
        }),

    validatorMiddleWare
];

exports.updateLoggedUserPasswordValidator = [
    
    check("currentPassword")
        .notEmpty().withMessage("Current password is required")
        .trim()
        .custom(async (val, { req }) => {
            const user = await userModel.findById(req.user._id);

            if (!user || !(await bcrypt.compare(val, user.password))) {
                throw new Error('The current password is incorrect');
            }
        }),

    check('passwordConfirm')
        .notEmpty().withMessage("Password confirm is required")
        .trim(),

    check("newPassword")
        .notEmpty().withMessage("New password is required")
        .trim()
        .custom((val, { req }) => {
            if (val !== req.body.passwordConfirm) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    validatorMiddleWare
];

exports.forgotPasswordValidator = [

    check('email')
    .notEmpty().withMessage("email is required")
    .isEmail().withMessage("invalid email format")
    ,validatorMiddleWare
]

exports.resetCodeValidator = [

    check("resetCode")
    .notEmpty().withMessage("reset Code Value Is Required")
    .isNumeric().withMessage("Reset Code Value Must Be numeric"),
    validatorMiddleWare
]


exports.resetNewPasswordValidator = [
    check("email")
    .notEmpty().withMessage("email is required")
    .isEmail().withMessage("invalid Email Format")
    .trim()
    ,
    check("newPassword")
        .notEmpty().withMessage("New password is required")
        .trim()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validatorMiddleWare
];
