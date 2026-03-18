const mongoose = require("mongoose")

let cachedConnection = null

const connectDatabase = async () => {
	if (cachedConnection) {
		return cachedConnection
	}

	const isNetlifyRuntime = Boolean(process.env.NETLIFY)
	const configuredMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || ""
	const mongodbUri = configuredMongoUri || (isNetlifyRuntime ? "" : "mongodb://127.0.0.1:27017/expenseTracker")

	if (!mongodbUri) {
		throw new Error("MONGODB_URI (or MONGO_URI) is not configured for this environment")
	}

	if (isNetlifyRuntime && /127\.0\.0\.1|localhost/.test(mongodbUri)) {
		throw new Error("MONGODB_URI points to localhost, which is not reachable from Netlify")
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