const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var SessionSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	attendees: [{ type: Schema.Types.ObjectId, ref: "User", required: false }],
	sessionName: {type: String, required: true},
	sessionDesc: {type: String, required: true},
	wallet: {type: String, required: true},
	date: { type: Date, required: true },
	startTime: { type: String, required: true },
	duration: { type: Number, required: true },
	fee: { type: Number, required: true },
	streamKey: {type: String, required: true},
	streamDetails: {type: Schema.Types.Mixed, required: true},
	streamId: {type: String, required: true}
}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema);
