var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	userName: {type: String, required: true},
	category: {type: String, required: true},
	feedbackId: {type: Number, required: false},
	uuid: {type: String, required: true},
	email: {type: String, required: true},
}, {timestamps: true});


module.exports = mongoose.model("User", UserSchema);