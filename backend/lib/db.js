const mongoose = require("mongoose")

let cachedConnection = null

const connectDatabase = async () => {
	if (cachedConnection) {
		return cachedConnection
	}

	const isNetlifyRuntime = Boolean(process.env.NETLIFY)
	const mongodbUri = process.env.MONGODB_URI || (isNetlifyRuntime ? "" : "mongodb://127.0.0.1:27017/expenseTracker")

	if (!mongodbUri) {
		throw new Error("MONGODB_URI is not configured for this environment")
	}

	cachedConnection = await mongoose.connect(mongodbUri, {
		serverSelectionTimeoutMS: 5000,
		connectTimeoutMS: 10000,
		maxPoolSize: 5,
	})
	return cachedConnection
}

module.exports = {
	connectDatabase,
}