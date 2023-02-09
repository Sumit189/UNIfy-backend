const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var SessionSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	attendees: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
	sessionName: {type: String, required: true},
	sessionDesc: {type: String, required: true},
	date: { type: Date, required: true },
	startTime: { type: Date, required: true },
	endTime: { type: Date, required: true },
	fee: { type: Number, required: true },
	streamKey: {type: String, required: true},
	streamDetails: {type: Schema.Types.mixed, required: true}
}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema);
