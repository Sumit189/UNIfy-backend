const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var SessionSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	attendees: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
	slot: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
	transaction: { type: Schema.Types.ObjectId, ref: "Transaction", required: true },
	status: { type: String, enum: ["Booked", "Completed"], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema);
