const ApiError = require("../utils/apiError");

const sendErrorForDev = (err, res) => res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

  const sendErrorForProd = (err, res) => res.status(err.statusCode).json({
      status: err.status,

      message: err.message,
    });

    const handleJwtinvalidSig =()=> new ApiError('invalid token please login',401)
    
    const handleExpiredToken =()=> new ApiError('Expired token please login again',401)

    const globalError = (err, req, res, next) => {
      err.statusCode = err.statusCode || 500;
      err.status = err.status || "error";
    
      if (process.env.NODE_ENV === "deployment") {
        sendErrorForDev(err, res);
      } else {
        if(err.name ==='JsonWebTokenError') err = handleJwtinvalidSig()
        if(err.name === 'TokenExpiredError')err = handleExpiredToken()
        sendErrorForProd(err, res);
      }
    };
    

  module.exports = globalError;
