const mongoose = require("mongoose")

let cachedConnection = null

const connectDatabase = async () => {
	if (cachedConnection) {
		return cachedConnection
	}

	const mongodbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expenseTracker"

	if (!mongodbUri) {
		throw new Error("MONGODB_URI is not configured")
	}

	cachedConnection = await mongoose.connect(mongodbUri)
	return cachedConnection
}

module.exports = {
	connectDatabase,
}