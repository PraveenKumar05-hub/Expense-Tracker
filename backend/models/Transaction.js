const mongoose = require("mongoose")

const TransactionSchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: ["income", "expense"],
			required: true,
			trim: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 0.01,
		},
		category: {
			type: String,
			required: true,
			trim: true,
			maxlength: 50,
		},
		description: {
			type: String,
			trim: true,
			maxlength: 200,
			default: "",
		},
		date: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model("Transaction", TransactionSchema)