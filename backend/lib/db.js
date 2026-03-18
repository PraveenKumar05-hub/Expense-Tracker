const mongoose = require("mongoose")

let cachedConnection = null

const connectDatabase = async () => {
	if (cachedConnection) {
		return cachedConnection
	}

	const mongodbUri = process.env.MONGODB_URI || process.env.MONGO_URI || ""

	if (!mongodbUri) {
		throw new Error("MONGODB_URI (or MONGO_URI) is not configured for this environment")
	}

	if (/127\.0\.0\.1|localhost/.test(mongodbUri)) {
		throw new Error("MONGODB_URI points to localhost, which is not reachable from deployed environments")
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