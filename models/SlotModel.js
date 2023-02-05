const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var SlotSchema = new Schema({
	date: { type: Date, required: true },
	start_time: { type: Date, required: true },
	end_time: { type: Date, required: true },
	category: { type: String, required: true },
	charge: { type: Number, required: true },
	total_duration: { type: Number, required: true },
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Slot = mongoose.model("Slot", SlotSchema);

module.exports = Slot;