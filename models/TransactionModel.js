const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var TransactionSchema = new Schema({
	sender_wallet: { type: String, required: true },
	recipient_wallet: { type: String, required: true },
	timestamp: { type: Date, default: Date.now },
	status: { type: String, enum: ["Pending", "Failed", "Completed"], required: true }
}, {timestamps: true});

module.exports = mongoose.model("Transaction", TransactionSchema);
