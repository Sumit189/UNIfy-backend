var express = require("express");
var userRouter = require("./auth");
var sessionRouter = require("./session")
var slotRouter = require("./slot")

var app = express();

app.use("/auth/", userRouter);
app.use("/session/", sessionRouter);
app.use("/slot/", slotRouter);

module.exports = app;