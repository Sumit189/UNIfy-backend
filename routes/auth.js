var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/status", AuthController.checkSignup)
router.post("/update", AuthController.updateDetails)

module.exports = router;