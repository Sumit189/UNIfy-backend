var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	userName: {type: String, required: false},
	category: {type: String, required: false},
	feedbackId: {type: Number, required: false},
	uuid: {type: String, required: true},
	email: {type: String, required: true},
	image: {type: String, required: false}
}, {timestamps: true});


module.exports = mongoose.model("User", UserSchema);