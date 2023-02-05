var express = require("express");
var authRouter = require("./user");

var app = express();

app.use("/user/", authRouter);

module.exports = app;