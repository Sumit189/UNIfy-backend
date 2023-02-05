var express = require("express");
const SessionController = require("../controllers/SessionController")

var router = express.Router();

router.get("/userSession", SessionController.userSession);

module.exports = router;