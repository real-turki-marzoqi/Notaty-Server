const { validationResult } = require("express-validator");

// @desc Find the validation errors in this req  and wrap  them in an  object with handy functions
const validatorMiddleWare = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validatorMiddleWare;
