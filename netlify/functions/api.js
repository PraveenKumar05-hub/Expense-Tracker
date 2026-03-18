const serverless = require("serverless-http")

const app = require("../../backend/app")
const { connectDatabase } = require("../../backend/lib/db")

if (!process.env.NETLIFY) {
	if (process.env.NODE_ENV !== "production") {
		const dotenv = require("dotenv")
		dotenv.config({ path: "backend/.env" })
	}
}

const expressHandler = serverless(app, {
	basePath: "/.netlify/functions/api",
})

const getMongoHost = () => {
	const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || ""

	if (!rawUri) {
		return "not-set"
	}

	const withoutProtocol = rawUri.replace(/^mongodb(\+srv)?:\/\//, "")
	const withoutCredentials = withoutProtocol.includes("@") ? withoutProtocol.split("@")[1] : withoutProtocol
	return withoutCredentials.split("/")[0] || "unknown-host"
}

exports.handler = async (event, context) => {
	try {
		await connectDatabase()
		return await expressHandler(event, context)
	} catch (error) {
		console.error("Database connection failed", error)
		return {
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				message: "Database connection failed. Check MONGODB_URI and MongoDB network access settings.",
				detail: error.message,
				diagnostics: {
					hasMONGODB_URI: Boolean(process.env.MONGODB_URI),
					hasMONGO_URI: Boolean(process.env.MONGO_URI),
					mongoHost: getMongoHost(),
					netlifyContext: process.env.CONTEXT || "unknown",
				},
			}),
		}
	}
}