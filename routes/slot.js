var express = require("express");
const SlotController = require("../controllers/SlotController")

var router = express.Router();

router.post("/create", SlotController.createSlot);
router.post("/update", SlotController.updateSlot);

module.exports = router;