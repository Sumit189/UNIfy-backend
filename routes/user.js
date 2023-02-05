var express = require("express");
const UserController = require("../controllers/UserController");

var router = express.Router();

console.log("here")
router.post("/register", UserController.register);
router.post("/fetch", UserController.fetch);

module.exports = router;