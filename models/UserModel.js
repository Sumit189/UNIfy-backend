var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	age: {type: Number, required: true},
	type: {type: String, required: true},
	feedbackId: {type: Number, required: false},
	uuid: {type: String, required: true},
	email: {type: String, required: true},
}, {timestamps: true});

// Virtual for user's full name
UserSchema
	.virtual("fullName")
	.get(function () {
		return this.firstName + " " + this.lastName;
	});

module.exports = mongoose.model("User", UserSchema);