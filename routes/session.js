var express = require("express");
const SessionController = require("../controllers/SessionController")

var router = express.Router();

router.post("/create", SessionController.createSession);
router.post("/delete", SessionController.deleteSession);
router.post("/add/user", SessionController.addAttendee);
router.post("/remove/user", SessionController.removeAttendee);
router.post("/sessions", SessionController.getAllSessions)

module.exports = router;