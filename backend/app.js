const express = require("express")
const cors = require("cors")

const transactionRoutes = require("./routes/transactions")

const app = express()

const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
	.split(",")
	.map((value) => value.trim())
	.filter(Boolean)

const wildcardToRegex = (pattern) => {
	const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
	return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`)
}

const allowedOriginRegexes = configuredOrigins
	.filter((origin) => origin.includes("*"))
	.map((pattern) => wildcardToRegex(pattern))

const allowedExactOrigins = configuredOrigins.filter((origin) => !origin.includes("*"))

const runtimeNetlifyOrigin = process.env.URL || ""
const runtimeNetlifyPreviewOrigin = process.env.DEPLOY_PRIME_URL || ""

const isAllowedOrigin = (origin) => {
	if (!origin) {
		return true
	}

	if (configuredOrigins.length === 0) {
		return true
	}

	if (runtimeNetlifyOrigin && origin === runtimeNetlifyOrigin) {
		return true
	}

	if (runtimeNetlifyPreviewOrigin && origin === runtimeNetlifyPreviewOrigin) {
		return true
	}

	if (allowedExactOrigins.includes(origin)) {
		return true
	}

	return allowedOriginRegexes.some((regex) => regex.test(origin))
}

app.use(
	cors({
		origin: (origin, callback) => {
			if (isAllowedOrigin(origin)) {
				callback(null, true)
				return
			}

			const corsError = new Error("Not allowed by CORS")
			corsError.status = 403
			callback(corsError)
		},
	})
)

app.use(express.json({ limit: "1mb" }))

app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		message: "Expense Tracker API is running",
	})
})

app.use("/api/transactions", transactionRoutes)

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	})
})

app.use((err, req, res, next) => {
	console.error(err)

	res.status(err.status || 500).json({
		success: false,
		message: err.message || "Internal server error",
	})
})

module.exports = app