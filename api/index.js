// modules imports
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const dbConnection = require("../Database/database");
dotenv.config({ path: "config.env" });
const colors = require('colors')

// import middleWares
const ApiError = require("../utils/apiError");
const globalError = require("../middlewares/errorMiddleWare");

// import routes
const noteRoute = require('../routes/noteRoute')
const authRoute = require('../routes/authRoute')


// db connection
dbConnection();
//app
const app = express();
//midddleWares
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "deployment") {
  app.use(morgan("dev"));
  console.log(colors.bgBrightWhite(`mode:${process.env.NODE_ENV}`));
}

//routes Mount

app.use("/api/v1/notes",noteRoute)
app.use("/api/v1/auth",authRoute)




//errors handling

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route :${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT,() => {
  console.log(colors.brightCyan(`server Running on port ${PORT}`));
});

// Handle rejections outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log("Server Shutting Down....");
    process.exit(1);
  });
});
