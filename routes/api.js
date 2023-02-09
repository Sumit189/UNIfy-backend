var express = require("express");
var userRouter = require("./auth");
var sessionRouter = require("./session")

var app = express();

app.use("/auth/", userRouter);
app.use("/session/", sessionRouter);

module.exports = app;